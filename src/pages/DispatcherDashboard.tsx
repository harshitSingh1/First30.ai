import { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import DispatcherPanel from '@/components/dispatcher/DispatcherPanel';
import TranscriptPanel from '@/components/dispatcher/TranscriptPanel';
import AISummaryPanel from '@/components/dispatcher/AISummaryPanel';
import DispatchTriagePanel from '@/components/dispatcher/DispatchTriagePanel';
import TimelinePhaseCard from '@/components/dispatcher/TimelinePhaseCard';
import PriorityBadge from '@/components/dispatcher/PriorityBadge';
import { Button } from '@/components/ui/button';
import { 
  mockTranscript, 
  mockAISummary, 
  mockDispatchPlan, 
  mockCallSession,
  generateFromCitizenSummary 
} from '@/data/dispatcherMockData';
import { TranscriptEntry, AISummary, DispatchPlan, TimelinePhase } from '@/types/dispatcher';
import { EmergencySummaryData } from '@/types/emergency';
import { 
  Radio, 
  FileInput, 
  Zap, 
  PhoneCall, 
  MapPin,
  Clock,
  Users
} from 'lucide-react';
import { toast } from 'sonner';

// Mock citizen summary for demo
const mockCitizenSummary: EmergencySummaryData = {
  category: 'Breathing / Unconscious',
  categoryIcon: '🫁',
  priority: 'P1',
  calculatedPriority: 'P1',
  stepsCompleted: [
    'Ensured scene safety',
    'Called emergency services',
    'Checked for breathing',
    'Started CPR'
  ],
  stepsSkipped: ['Recovery position'],
  totalSteps: 8,
  duration: 240,
  startTime: new Date(Date.now() - 240000),
  endTime: new Date(),
  collectedInputs: [
    { questionId: 'age-group', question: 'Age group of the person?', answer: 'Adult (18-60)' },
    { questionId: 'conscious', question: 'Is the person conscious?', answer: 'No' },
    { questionId: 'breathing', question: 'Is the person breathing normally?', answer: 'No' }
  ],
  keyObservations: [
    'Patient is unresponsive',
    'No normal breathing detected',
    'CPR initiated by bystander'
  ],
  actionsTaken: [
    'Scene secured',
    'Emergency called',
    'CPR started'
  ],
  location: '123 Main Street, Apt 4B'
};

const DispatcherDashboard = () => {
  const [transcript, setTranscript] = useState<TranscriptEntry[]>(mockTranscript);
  const [aiSummary, setAiSummary] = useState<AISummary | null>(mockAISummary);
  const [dispatchPlan, setDispatchPlan] = useState<DispatchPlan | null>(mockDispatchPlan);
  const [currentPhase, setCurrentPhase] = useState<TimelinePhase>('2-5');
  const [startTime] = useState(new Date(Date.now() - 180000));
  const [isLive, setIsLive] = useState(true);

  // Simulate live updates
  useEffect(() => {
    if (!isLive) return;
    
    const interval = setInterval(() => {
      // Update phase based on elapsed time
      const elapsed = (Date.now() - startTime.getTime()) / 1000 / 60; // minutes
      if (elapsed < 2) setCurrentPhase('0-2');
      else if (elapsed < 5) setCurrentPhase('2-5');
      else if (elapsed < 15) setCurrentPhase('5-15');
      else setCurrentPhase('15-30');
    }, 1000);

    return () => clearInterval(interval);
  }, [isLive, startTime]);

  const handleGenerateFromCitizen = () => {
    toast.loading('Generating from Citizen Summary...');
    
    setTimeout(() => {
      const generated = generateFromCitizenSummary(mockCitizenSummary);
      setTranscript(generated.transcript);
      setAiSummary(generated.aiSummary);
      setDispatchPlan(generated.dispatchPlan);
      toast.success('Dashboard populated from Citizen Mode data');
    }, 1000);
  };

  const handleLoadDemo = () => {
    setTranscript(mockTranscript);
    setAiSummary(mockAISummary);
    setDispatchPlan(mockDispatchPlan);
    toast.success('Demo data loaded');
  };

  return (
    <Layout showEmergencyBanner={false} showFooter={false}>
      <div className="h-[calc(100vh-4rem)] flex flex-col">
        {/* Header Bar */}
        <div className="flex-shrink-0 px-4 py-3 border-b border-border/50 bg-background/80 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-primary" />
                <h1 className="text-lg font-bold text-foreground">Dispatcher Dashboard</h1>
              </div>
              <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-muted/50">
                  <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-success animate-pulse' : 'bg-muted-foreground'}`} />
                  <span>{isLive ? 'Live' : 'Paused'}</span>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-muted/50">
                  <PhoneCall className="w-3 h-3" />
                  <span>Call #2847</span>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-muted/50">
                  <MapPin className="w-3 h-3" />
                  <span>123 Main St</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleLoadDemo}
                className="hidden sm:flex"
              >
                <Zap className="w-4 h-4 mr-1" />
                Load Demo
              </Button>
              <Button
                size="sm"
                onClick={handleGenerateFromCitizen}
                className="bg-primary hover:bg-primary/90"
              >
                <FileInput className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Generate from</span> Citizen Summary
              </Button>
            </div>
          </div>
        </div>

        {/* Timeline Card */}
        <div className="flex-shrink-0 px-4 py-3">
          <TimelinePhaseCard 
            currentPhase={currentPhase} 
            startTime={startTime} 
          />
        </div>

        {/* Main 3-Column Layout */}
        <div className="flex-1 p-4 pt-0 min-h-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
            {/* Left: Live Transcript */}
            <DispatcherPanel 
              title="Live Transcript" 
              icon={<Radio className="w-4 h-4" />}
              headerExtra={
                <div className="flex items-center gap-1.5 text-xs">
                  <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                  <span className="text-muted-foreground">{transcript.length} entries</span>
                </div>
              }
            >
              <TranscriptPanel entries={transcript} />
            </DispatcherPanel>

            {/* Middle: AI Summary */}
            <DispatcherPanel 
              title="AI Emergency Summary"
              icon={<Zap className="w-4 h-4" />}
              headerExtra={
                aiSummary && <PriorityBadge priority={dispatchPlan?.triageLevel || 'P2'} size="sm" showLabel={false} />
              }
            >
              <AISummaryPanel summary={aiSummary} />
            </DispatcherPanel>

            {/* Right: Dispatch & Triage */}
            <DispatcherPanel 
              title="Dispatch & Triage"
              icon={<Users className="w-4 h-4" />}
              headerExtra={
                dispatchPlan && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {dispatchPlan.recommendations[0]?.eta || 'Pending'}
                  </div>
                )
              }
            >
              <DispatchTriagePanel plan={dispatchPlan} />
            </DispatcherPanel>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DispatcherDashboard;
