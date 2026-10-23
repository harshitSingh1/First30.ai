import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import SafetyAlertBanner from '@/components/emergency/SafetyAlertBanner';
import { ResponderViewModal } from '@/components/emergency/ResponderViewModal';
import { EditHandoffModal } from '@/components/emergency/EditHandoffModal';
import {
  HandoffData,
  AssessmentStatus,
  EventSource,
} from '@/types/emergencyHandoff';
import {
  getActiveSession,
  saveActiveSession,
  clearActiveSession,
  createDefaultSession,
  formatPlainTextHandoff,
  convertSummaryDataToHandoff,
} from '@/services/emergencySessionService';
import { downloadHandoffSessionPdf } from '@/utils/pdfGenerator';
import {
  ShieldAlert,
  Edit3,
  Copy,
  Download,
  Share2,
  Printer,
  ArrowLeft,
  Trash2,
  Clock,
  MapPin,
  Heart,
  CheckCircle2,
  HelpCircle,
  Lock,
  User,
  AlertCircle,
  FileText,
  Activity,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const EmergencySummary = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Load session from state or session storage or convert from legacy summaryData
  const [session, setSession] = useState<HandoffData>(() => {
    if (location.state?.handoffData) {
      saveActiveSession(location.state.handoffData);
      return location.state.handoffData as HandoffData;
    }
    const stored = getActiveSession();
    if (stored) return stored;

    if (location.state?.summaryData) {
      const converted = convertSummaryDataToHandoff(location.state.summaryData);
      saveActiveSession(converted);
      return converted;
    }

    const defaultSession = createDefaultSession('General Emergency', 'Standard Guidance', '/citizen');
    saveActiveSession(defaultSession);
    return defaultSession;
  });

  const [showResponderModal, setShowResponderModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [copied, setCopied] = useState(false);

  // Sync to session storage on change
  useEffect(() => {
    saveActiveSession(session);
  }, [session]);

  const handleCopy = async () => {
    try {
      const text = formatPlainTextHandoff(session);
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Handoff summary copied to clipboard');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error('Failed to copy to clipboard');
    }
  };

  const handleDownload = () => {
    try {
      const text = formatPlainTextHandoff(session);
      const safeCategory = (session.incident.selectedGuidance || 'Emergency')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-');
      const filename = `First30-Emergency-Handoff-${safeCategory}-${new Date().toISOString().slice(0, 10)}.txt`;

      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Emergency summary downloaded');
    } catch {
      toast.error('Failed to download emergency summary');
    }
  };

  const handleShare = async () => {
    const text = formatPlainTextHandoff(session);
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `First30 Emergency Handoff — ${session.incident.selectedGuidance}`,
          text,
        });
        toast.success('Handoff shared');
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          return;
        }
        await handleCopy();
      }
    } else {
      await handleCopy();
    }
  };

  const handlePrint = () => {
    try {
      const generated = downloadHandoffSessionPdf(session);
      if (generated) {
        toast.success('Paramedic Handoff PDF downloaded to your device');
      }
      if (typeof window !== 'undefined' && window.print) {
        try {
          window.print();
        } catch {
          // Handled silently if in sandboxed iframe
        }
      }
    } catch {
      handleDownload();
    }
  };

  const handleClearSession = () => {
    clearActiveSession();
    toast.success('Emergency session data cleared');
    navigate('/citizen');
  };

  const formatTime = (isoString?: string | null) => {
    if (!isoString) return 'Not recorded';
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return isoString;
    }
  };

  const formatElapsed = (secs?: number) => {
    if (secs === undefined || secs === null) return '';
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `+${mins}m ${remainder}s`;
  };

  const renderStatusBadge = (status: AssessmentStatus, value?: string, source?: EventSource) => {
    if (status === 'reported') {
      const srcLabel = source === 'bystander_confirmed' ? 'Confirmed by user' : 'Reported by bystander';
      return (
        <div>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            {value || 'Reported'}
          </span>
          <span className="text-[10px] text-muted-foreground block mt-0.5">{srcLabel}</span>
        </div>
      );
    }
    if (status === 'not_assessed') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-secondary text-muted-foreground border border-border/50">
          Not assessed
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
        Unknown / Not provided
      </span>
    );
  };

  return (
    <Layout showHeader={false}>
      <div className="container mx-auto px-4 py-6 pb-28 max-w-3xl">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between gap-2 mb-6 print:hidden">
          <button
            onClick={() => {
              if (session.returnUrl) {
                navigate(session.returnUrl);
              } else {
                navigate('/citizen');
              }
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-primary" />
            <span>Return to Guidance</span>
          </button>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowEditModal(true)}
              className="text-xs h-8 rounded-xl gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5 text-primary" />
              <span>Edit Details</span>
            </Button>

            <Button
              onClick={() => setShowResponderModal(true)}
              size="sm"
              className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold h-8 rounded-xl gap-1.5 shadow-sm"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Show to Responder</span>
            </Button>
          </div>
        </div>

        {/* Page Title */}
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Emergency Handoff Summary
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-lg mx-auto">
            Structured incident information for arriving paramedics, EMTs, and emergency dispatchers
          </p>
        </div>

        {/* Safety Disclaimer */}
        <div className="mb-6">
          <SafetyAlertBanner
            variant="warning"
            message="INFORMATION PROVIDED BY BYSTANDER & APP TIMERS: This is not a verified medical diagnosis. Present this summary to arriving emergency responders."
          />
        </div>

        {/* Primary Handoff Card */}
        <div className="glass-card-strong rounded-2xl p-5 sm:p-6 border border-border/60 shadow-lg space-y-6 print:bg-white print:text-black print:border-black print:shadow-none">
          {/* Print Header */}
          <div className="hidden print:block pb-3 border-b border-black text-xs">
            <div className="flex justify-between items-center font-bold">
              <span>First30.ai — Emergency Handoff</span>
              <span>Printed: {new Date().toLocaleString()}</span>
            </div>
            <p className="text-[10px] text-gray-700 mt-0.5">
              NOTICE: Layperson observations and app timer recordings. Not a physician diagnosis.
            </p>
          </div>
          {/* Header Row: Guidance & Timing */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b border-border/40">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary block">
                Reported Emergency
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mt-0.5">
                {session.incident.selectedGuidance}
              </h2>
              <span className="text-xs text-muted-foreground mt-0.5 block">
                Guidance Mode: {session.incident.guidanceMode}
              </span>
            </div>

            <div className="flex flex-col items-start sm:items-end text-xs text-muted-foreground gap-1 bg-secondary/30 p-2.5 rounded-xl border border-border/40 shrink-0">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-primary" />
                <span>Started: <strong>{formatTime(session.incident.sessionStartTime)}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                <span>Generated: <strong>{formatTime(session.incident.summaryGeneratedTime)}</strong></span>
              </div>
              {session.incident.location && (
                <div className="flex items-center gap-1.5 text-foreground font-medium">
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                  <span>{session.incident.location}</span>
                </div>
              )}
            </div>
          </div>

          {/* Person's Vital Condition Grid */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              <span>Reported Patient Condition</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="p-3 rounded-xl bg-secondary/30 border border-border/40">
                <span className="text-xs font-semibold text-muted-foreground block mb-1">
                  Responsiveness / Consciousness
                </span>
                {renderStatusBadge(
                  session.condition.responsiveness.status,
                  session.condition.responsiveness.value,
                  session.condition.responsiveness.source
                )}
              </div>

              <div className="p-3 rounded-xl bg-secondary/30 border border-border/40">
                <span className="text-xs font-semibold text-muted-foreground block mb-1">
                  Breathing Status
                </span>
                {renderStatusBadge(
                  session.condition.breathing.status,
                  session.condition.breathing.value,
                  session.condition.breathing.source
                )}
              </div>

              <div className="p-3 rounded-xl bg-secondary/30 border border-border/40">
                <span className="text-xs font-semibold text-muted-foreground block mb-1">
                  Approximate Age Group
                </span>
                {renderStatusBadge(
                  session.condition.ageGroup.status,
                  session.condition.ageGroup.value,
                  session.condition.ageGroup.source
                )}
              </div>

              <div className="p-3 rounded-xl bg-secondary/30 border border-border/40">
                <span className="text-xs font-semibold text-muted-foreground block mb-1">
                  Visible Injuries / Bleeding
                </span>
                {renderStatusBadge(
                  session.condition.visibleInjuriesOrBleeding.status,
                  session.condition.visibleInjuriesOrBleeding.value,
                  session.condition.visibleInjuriesOrBleeding.source
                )}
              </div>
            </div>

            {/* Medical History & Allergies */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 text-sm">
              <div className="p-3 rounded-xl bg-secondary/20 border border-border/30">
                <span className="text-xs font-semibold text-muted-foreground block mb-1">
                  Known Allergies
                </span>
                {renderStatusBadge(
                  session.condition.allergies.status,
                  session.condition.allergies.value,
                  session.condition.allergies.source
                )}
              </div>

              <div className="p-3 rounded-xl bg-secondary/20 border border-border/30">
                <span className="text-xs font-semibold text-muted-foreground block mb-1">
                  Relevant Medical History
                </span>
                {renderStatusBadge(
                  session.condition.medicalHistory.status,
                  session.condition.medicalHistory.value,
                  session.condition.medicalHistory.source
                )}
              </div>
            </div>

            {/* Specific Bystander Observations */}
            {session.condition.symptomsOrObservations.length > 0 && (
              <div className="mt-3 p-3 rounded-xl bg-secondary/20 border border-border/30 text-xs">
                <span className="font-semibold text-foreground block mb-1.5">
                  Specific Observations Reported:
                </span>
                <ul className="space-y-1">
                  {session.condition.symptomsOrObservations.map((obs) => (
                    <li key={obs.id} className="text-muted-foreground flex items-start gap-1.5">
                      <span className="text-primary font-bold">•</span>
                      <span>{obs.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* CPR Metrics Panel (If Paced in App) */}
          {session.cprMetrics && session.cprMetrics.totalCompressionsRecorded > 0 && (
            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300">
              <div className="flex items-center gap-2 font-bold text-sm text-blue-200 mb-2">
                <Heart className="w-4 h-4 text-blue-400" />
                <span>CPR Pacing Metrics (Recorded by App Metronome)</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-background/80 p-2.5 rounded-lg border border-border/40">
                  <span className="text-muted-foreground text-[10px] block">Compressions</span>
                  <span className="text-lg font-black text-foreground">
                    {session.cprMetrics.totalCompressionsRecorded}
                  </span>
                </div>
                <div className="bg-background/80 p-2.5 rounded-lg border border-border/40">
                  <span className="text-muted-foreground text-[10px] block">Completed Cycles</span>
                  <span className="text-lg font-black text-foreground">
                    {session.cprMetrics.totalCyclesRecorded}
                  </span>
                </div>
                <div className="bg-background/80 p-2.5 rounded-lg border border-border/40">
                  <span className="text-muted-foreground text-[10px] block">Target Cadence</span>
                  <span className="text-lg font-black text-foreground">
                    {session.cprMetrics.bpmTarget} BPM
                  </span>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground mt-2 text-center">
                Audio metronome clock data. Physical compression delivery depth and recoil are unverified.
              </p>
            </div>
          )}

          {/* Confirmed Actions */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Actions Confirmed by User</span>
            </h3>

            {session.actionsTaken.length === 0 ? (
              <p className="text-xs text-muted-foreground italic p-2.5 rounded-lg bg-secondary/20">
                No physical actions explicitly confirmed yet
              </p>
            ) : (
              <div className="space-y-1.5">
                {session.actionsTaken.map((act) => (
                  <div
                    key={act.id}
                    className="flex items-start justify-between gap-2 p-2.5 rounded-xl bg-secondary/30 border border-border/40 text-xs"
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">✓</span>
                      <span className="text-foreground font-medium">{act.action}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground shrink-0 uppercase tracking-tight">
                      {act.source === 'app_recorded' ? 'Recorded by App' : 'Confirmed by User'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Chronological Event Timeline */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              <span>Chronological Event Timeline</span>
            </h3>

            {session.timeline.length === 0 ? (
              <p className="text-xs text-muted-foreground italic p-2.5 rounded-lg bg-secondary/20">
                No timeline events recorded
              </p>
            ) : (
              <div className="space-y-2 border-l-2 border-primary/30 ml-2.5 pl-3.5">
                {session.timeline.map((ev) => (
                  <div key={ev.id} className="text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-primary font-bold text-[11px]">
                        {formatTime(ev.timestamp)}
                        {ev.elapsedSeconds !== undefined ? ` (${formatElapsed(ev.elapsedSeconds)})` : ''}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-secondary text-muted-foreground">
                        {ev.source === 'app_recorded'
                          ? 'Recorded by First30.ai'
                          : ev.source === 'bystander_confirmed'
                          ? 'Confirmed by User'
                          : 'Reported by Bystander'}
                      </span>
                    </div>
                    <p className="text-foreground mt-0.5">{ev.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Important Unknowns / Not Assessed */}
          {session.importantUnknowns.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-amber-400" />
                <span>Important Unknowns / Not Assessed</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {session.importantUnknowns.map((unk, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded-lg bg-amber-500/5 border border-amber-500/20 text-xs text-amber-300/90 flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                    <span>{unk}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bystander Note */}
          {session.userNotes && session.userNotes.trim() && (
            <div className="p-3 rounded-xl bg-secondary/30 border border-border/40 text-xs">
              <span className="font-bold text-foreground block mb-1">Bystander Notes:</span>
              <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {session.userNotes}
              </p>
            </div>
          )}

          {/* Action Toolbar */}
          <div className="pt-4 border-t border-border/40 flex flex-wrap gap-2.5 print:hidden">
            <Button
              onClick={() => setShowResponderModal(true)}
              className="flex-1 min-w-[140px] h-10 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs rounded-xl gap-2 shadow-sm"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Show to Responder</span>
            </Button>

            <Button
              variant="outline"
              onClick={() => setShowEditModal(true)}
              className="h-10 text-xs rounded-xl gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5 text-primary" />
              <span>Edit Details</span>
            </Button>

            <Button
              variant="outline"
              onClick={handleDownload}
              className="h-10 text-xs rounded-xl gap-1.5"
              title="Download structured emergency handoff text file"
            >
              <Download className="w-3.5 h-3.5 text-primary" />
              <span>Download (.txt)</span>
            </Button>

            <Button
              variant="outline"
              onClick={handleCopy}
              className="h-10 text-xs rounded-xl gap-1.5"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </Button>

            <Button
              variant="outline"
              onClick={handleShare}
              className="h-10 text-xs rounded-xl gap-1.5"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </Button>

            <Button
              variant="outline"
              onClick={handlePrint}
              className="h-10 text-xs rounded-xl gap-1.5"
              title="Print or Save Handoff as PDF"
            >
              <Printer className="w-3.5 h-3.5 text-primary" />
              <span>Print / PDF</span>
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-10 text-xs text-muted-foreground hover:text-destructive rounded-xl gap-1.5 ml-auto"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear Session</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear Emergency Session?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will delete all in-memory clinical observations, CPR counters, and event timelines from this device. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleClearSession}
                    className="bg-destructive hover:bg-destructive/90 text-destructive-foreground font-semibold"
                  >
                    Yes, Clear Session Data
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Patient Privacy & Ephemeral Memory Guarantee */}
        <div className="mt-6 p-4 rounded-2xl bg-secondary/30 border border-border/40 text-center text-xs text-muted-foreground">
          <p className="font-semibold text-foreground flex items-center justify-center gap-1.5 mb-1">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            Zero-Cloud Privacy Guarantee
          </p>
          <p className="leading-relaxed">
            This paramedic handoff summary is held exclusively in temporary browser memory (sessionStorage/RAM) on this device. No medical observations, CPR cadences, or incident details are cached to persistent disk or uploaded to any third-party cloud. Closing or reloading this tab resets the session.
          </p>
        </div>

        {/* Modals */}
        <ResponderViewModal
          data={session}
          isOpen={showResponderModal}
          onClose={() => setShowResponderModal(false)}
        />

        <EditHandoffModal
          data={session}
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSave={(updated) => {
            setSession(updated);
            saveActiveSession(updated);
            setShowEditModal(false);
            toast.success('Handoff details updated');
          }}
        />
      </div>
    </Layout>
  );
};

export default EmergencySummary;
