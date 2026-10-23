import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import SafetyAlertBanner from '@/components/emergency/SafetyAlertBanner';
import { useEmergencyTimer } from '@/hooks/useEmergencyTimer';
import { cprAudio, BeatEvent } from '@/services/cprAudio';
import { ArrowLeft, Phone, Heart, Users, Volume2, VolumeX, Square, Play, RotateCcw, Pause, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEmergencyRegion } from '@/contexts/EmergencyRegionContext';
import { HandoffData } from '@/types/emergencyHandoff';
import { saveActiveSession } from '@/services/emergencySessionService';

const CPRMode = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = location.state?.returnTo;
  const { emergencyNumber } = useEmergencyRegion();

  const { formattedTime, elapsedTime, isRunning, start: startTimer, stop: stopTimer, reset: resetTimer } = useEmergencyTimer(false);

  const [compressionCount, setCompressionCount] = useState(0);
  const [breathCount, setBreathCount] = useState(0);
  const [isCompressionPhase, setIsCompressionPhase] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showSwitchReminder, setShowSwitchReminder] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const isCompressionPhaseRef = useRef(true);
  isCompressionPhaseRef.current = isCompressionPhase;

  const lastSwitchReminderMinuteRef = useRef(0);

  const BPM = 110; // Clinically validated AHA / ERC target cadence

  // Synchronized beat callback from precision Web Audio clock
  const handleBeat = useCallback((event: BeatEvent) => {
    if (isCompressionPhaseRef.current) {
      setCompressionCount((prev) => {
        const next = prev + 1;
        // At 30 compressions, transition to rescue breath phase
        if (next % 30 === 0) {
          setIsCompressionPhase(false);
          setBreathCount(0);
        }
        return next;
      });
    } else {
      // In breath phase, each cadence chime gives an opportunity to deliver breath
      setBreathCount((prev) => {
        const next = prev + 1;
        if (next >= 2) {
          // After 2 breaths delivered, return to compressions
          setTimeout(() => {
            setIsCompressionPhase(true);
          }, 300);
        }
        return next;
      });
    }
  }, []);

  // 2-minute rescuer swap check based on monotonic elapsed seconds
  useEffect(() => {
    if (isRunning && elapsedTime > 0 && elapsedTime % 120 === 0) {
      const currentMinute = Math.floor(elapsedTime / 60);
      if (currentMinute !== lastSwitchReminderMinuteRef.current) {
        lastSwitchReminderMinuteRef.current = currentMinute;
        setShowSwitchReminder(true);
        const timer = setTimeout(() => setShowSwitchReminder(false), 7000);
        return () => clearTimeout(timer);
      }
    }
  }, [isRunning, elapsedTime]);

  // Clean up CPR engine on unmount
  useEffect(() => {
    return () => {
      cprAudio.stop();
    };
  }, []);

  const handleStart = async () => {
    const success = await cprAudio.start(BPM, handleBeat, () => isCompressionPhaseRef.current);
    if (success) {
      startTimer();
      setIsPaused(false);
    }
  };

  const handlePause = () => {
    cprAudio.pause();
    stopTimer();
    setIsPaused(true);
  };

  const handleResume = async () => {
    await cprAudio.resume();
    startTimer();
    setIsPaused(false);
  };

  const handleReset = () => {
    cprAudio.reset();
    resetTimer();
    setCompressionCount(0);
    setBreathCount(0);
    setIsCompressionPhase(true);
    setIsPaused(false);
    lastSwitchReminderMinuteRef.current = 0;
  };

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    cprAudio.setSoundEnabled(next);
  };

  const handleManualBreath = () => {
    setBreathCount((prev) => {
      const next = prev + 1;
      if (next >= 2) {
        setIsCompressionPhase(true);
      }
      return next;
    });
  };

  const handleBack = () => {
    cprAudio.stop();
    if (returnTo) {
      navigate(returnTo);
    } else {
      navigate(-1);
    }
  };

  const handleNavigateHandoff = () => {
    cprAudio.pause();
    stopTimer();

    const now = new Date();
    const sessionStart = new Date(Date.now() - elapsedTime * 1000);

    const handoffData: HandoffData = {
      incident: {
        selectedGuidance: 'Cardiac Arrest / Unresponsive',
        sessionStartTime: sessionStart.toISOString(),
        summaryGeneratedTime: now.toISOString(),
        location: null,
        countryRegion: null,
        peopleCount: '1 person',
        guidanceMode: 'CPR Precision Mode',
      },
      condition: {
        ageGroup: { status: 'not_assessed' },
        responsiveness: {
          status: 'reported',
          value: 'Unresponsive / Collapsed',
          source: 'bystander_reported',
        },
        breathing: {
          status: 'reported',
          value: 'Not breathing or agonal gasping',
          source: 'bystander_reported',
        },
        visibleInjuriesOrBleeding: { status: 'not_assessed' },
        medicalHistory: { status: 'unknown' },
        allergies: { status: 'unknown' },
        symptomsOrObservations: [
          {
            id: `cpr-obs-${Date.now()}`,
            text: 'Bystander initiated CPR metronome due to unresponsiveness',
            source: 'bystander_reported',
            timestamp: sessionStart.toISOString(),
          },
        ],
      },
      cprMetrics: {
        totalCompressionsRecorded: compressionCount,
        totalCyclesRecorded: cycleCount,
        durationSeconds: elapsedTime,
        rescuerSwapsPrompted: Math.floor(elapsedTime / 120),
        bpmTarget: BPM,
      },
      actionsTaken: [
        {
          id: `act-cpr-${Date.now()}`,
          action: `Chest compressions paced: ${compressionCount} compressions (${cycleCount} completed 30:2 cycles)`,
          source: 'app_recorded',
          elapsedSeconds: elapsedTime,
          timestamp: now.toISOString(),
        },
      ],
      timeline: [
        {
          id: `ev-cpr-start-${Date.now()}`,
          type: 'cpr_started',
          timestamp: sessionStart.toISOString(),
          elapsedSeconds: 0,
          description: `CPR session started at target cadence of ${BPM} BPM`,
          source: 'app_recorded',
        },
        {
          id: `ev-cpr-summary-${Date.now()}`,
          type: 'handoff_generated',
          timestamp: now.toISOString(),
          elapsedSeconds: elapsedTime,
          description: `Prepared handoff summary: ${compressionCount} compressions over ${Math.floor(elapsedTime / 60)}m ${elapsedTime % 60}s`,
          source: 'app_recorded',
        },
      ],
      importantUnknowns: [
        'Time of collapse unknown prior to bystander arrival',
        'Relevant medical history or AED availability not confirmed',
        'Prescription cardiac medications unknown',
      ],
      userNotes: '',
      returnUrl: '/cpr',
    };

    saveActiveSession(handoffData);
    navigate('/summary', { state: { handoffData } });
  };

  const cycleCount = Math.floor(compressionCount / 30);
  const currentCycleProgress = compressionCount % 30;

  return (
    <Layout showHeader={true} showFooter={false}>
      <div className="container mx-auto px-4 py-4 pb-24 max-w-xl">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between mb-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleBack}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleNavigateHandoff}
              className="h-9 px-3 text-xs flex items-center gap-1.5 border-teal-500/40 text-teal-400 hover:bg-teal-500/10"
              title="Prepare emergency handoff for paramedics"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Handoff</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleSound}
              className="h-9 px-3 text-xs flex items-center gap-1.5"
              title={soundEnabled ? 'Mute metronome' : 'Unmute metronome'}
            >
              {soundEnabled ? (
                <>
                  <Volume2 className="w-4 h-4 text-primary" />
                  <span>Audio On</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-4 h-4 text-muted-foreground" />
                  <span>Audio Muted</span>
                </>
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="h-9 px-2.5 text-muted-foreground hover:text-foreground"
              title="Reset session"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="text-center mb-4">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">CPR Precision Mode</h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
            110 BPM Metronome · 30 Compressions : 2 Breaths
          </p>
          <div className="mt-1.5 flex items-center justify-center gap-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-secondary/80 text-muted-foreground text-[11px] font-medium border border-border/50">
              Adult Protocol (AHA / ERC Layperson)
            </span>
          </div>
        </div>

        {/* Rescuer Swap Notification Banner */}
        {showSwitchReminder && (
          <div className="mb-4 animate-bounce">
            <SafetyAlertBanner 
              variant="warning" 
              message="2 minutes elapsed — Switch rescuer if someone is available to maintain compression depth!" 
            />
          </div>
        )}

        {/* Elapsed Time Card */}
        <div className="rounded-2xl bg-card border border-border/70 p-5 text-center shadow-xs">
          <div className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-1">
            Session Duration
          </div>
          <div className="text-5xl font-mono font-bold text-foreground tracking-tight tabular-nums">
            {formattedTime}
          </div>
        </div>

        {/* Central Rhythm & Heartbeat Visualizer */}
        <div className="rounded-2xl bg-card border border-border/70 p-6 mt-4 shadow-sm text-center">
          <div className="flex justify-center mb-4">
            <div
              className={`w-28 h-28 rounded-full flex items-center justify-center transition-all duration-150 ${
                isCompressionPhase
                  ? 'bg-blue-500/15 border-4 border-blue-500 shadow-lg shadow-blue-500/20'
                  : 'bg-teal-500/15 border-4 border-teal-500 shadow-lg shadow-teal-500/20'
              } ${isRunning ? 'scale-105' : ''}`}
            >
              <Heart
                className={`w-14 h-14 transition-transform ${
                  isCompressionPhase ? 'text-blue-400' : 'text-teal-400'
                } ${isRunning ? 'animate-pulse' : ''}`}
              />
            </div>
          </div>

          <div className="mb-4">
            <div className="text-2xl md:text-3xl font-bold text-foreground">
              {isCompressionPhase ? `${currentCycleProgress || 30} / 30 Compressions` : 'Deliver 2 Rescue Breaths'}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {isCompressionPhase
                ? `Push hard & fast on center of chest (${BPM} BPM)`
                : 'Tilt head back, pinch nose, give 2 gentle breaths'}
            </p>
          </div>

          {/* Rescue Breath Trigger button when in breath phase */}
          {!isCompressionPhase && (
            <div className="flex justify-center mb-4">
              <Button
                onClick={handleManualBreath}
                className="h-12 px-6 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-base shadow-sm"
              >
                Breath Given ({breathCount}/2)
              </Button>
            </div>
          )}

          {/* Stats Breakdown */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-border/40">
            <div className="p-3 rounded-xl bg-secondary/40">
              <div className="text-2xl font-bold font-mono text-foreground tabular-nums">
                {compressionCount}
              </div>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground mt-0.5">
                Total Pushes
              </div>
            </div>
            <div className="p-3 rounded-xl bg-secondary/40">
              <div className="text-2xl font-bold font-mono text-foreground tabular-nums">
                {breathCount}
              </div>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground mt-0.5">
                Breaths
              </div>
            </div>
            <div className="p-3 rounded-xl bg-secondary/40">
              <div className="text-2xl font-bold font-mono text-foreground tabular-nums">
                {cycleCount}
              </div>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground mt-0.5">
                30:2 Cycles
              </div>
            </div>
          </div>
        </div>

        {/* Primary Start / Pause / Resume Controls */}
        <div className="flex gap-3 mt-4">
          {!isRunning && !isPaused && (
            <Button
              onClick={handleStart}
              className="flex-1 h-16 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xl shadow-lg shadow-emerald-600/20 active:scale-[0.98] transition-transform"
            >
              <Play className="w-6 h-6 mr-2 fill-current" />
              Start CPR Metronome
            </Button>
          )}

          {isRunning && (
            <Button
              onClick={handlePause}
              className="flex-1 h-16 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xl shadow-lg shadow-amber-600/20 active:scale-[0.98] transition-transform"
            >
              <Pause className="w-6 h-6 mr-2 fill-current" />
              Pause CPR
            </Button>
          )}

          {!isRunning && isPaused && (
            <>
              <Button
                onClick={handleResume}
                className="flex-1 h-16 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xl shadow-lg shadow-emerald-600/20 active:scale-[0.98] transition-transform"
              >
                <Play className="w-6 h-6 mr-2 fill-current" />
                Resume CPR
              </Button>
              <Button
                onClick={handleReset}
                variant="outline"
                className="h-16 px-5 rounded-xl border-border/80 text-muted-foreground hover:text-foreground text-sm font-semibold"
              >
                Reset
              </Button>
            </>
          )}
        </div>

        {/* End & Open Paramedic Handoff button */}
        {(isRunning || isPaused || compressionCount > 0) && (
          <div className="mt-3">
            <Button
              onClick={handleNavigateHandoff}
              className="w-full h-12 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Paramedics Arrived — Show Handoff</span>
            </Button>
          </div>
        )}

        {/* Essential Clinical Checklist */}
        <div className="rounded-2xl bg-card border border-border/70 p-4 mt-6 text-xs text-muted-foreground space-y-2">
          <div className="font-bold text-foreground text-sm flex items-center gap-1.5">
            <Heart className="w-4 h-4 text-blue-400" /> Key Resuscitation Points
          </div>
          <ul className="space-y-1.5 pl-1">
            <li>• <strong>Depth:</strong> Push at least 2 inches (5 cm) deep in adult chest center.</li>
            <li>• <strong>Recoil:</strong> Allow the chest to fully recoil between each compression.</li>
            <li>• <strong>Rate:</strong> Maintain 100–120 compressions per minute; avoid rushing.</li>
            <li>• <strong>Continuity:</strong> Minimize interruptions to fewer than 10 seconds.</li>
            <li>• <strong>Pediatric Scope:</strong> Configured for adult CPR. Infant and pediatric CPR guidelines require modified depths, encircling-hands/two-finger techniques, and initial rescue breaths (pediatric presets require separate clinical validation).</li>
          </ul>
        </div>

        {/* Rescuer Rotation Advice */}
        <div className="rounded-2xl bg-secondary/30 border border-border/50 p-4 mt-3 flex items-start gap-3 text-xs text-muted-foreground">
          <Users className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div>
            <strong className="text-foreground">Fatigue warning:</strong> Compression quality drops noticeably after 2 minutes of continuous pumping. Swap rescuers seamlessly every 2 minutes if another bystander is present.
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CPRMode;
