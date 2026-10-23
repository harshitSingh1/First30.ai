import React, { useState } from 'react';
import { HandoffData } from '@/types/emergencyHandoff';
import { formatPlainTextHandoff } from '@/services/emergencySessionService';
import { 
  X, 
  Copy, 
  Check, 
  Share2, 
  ShieldAlert, 
  Clock, 
  Heart, 
  Activity, 
  AlertCircle, 
  HelpCircle,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ResponderViewModalProps {
  data: HandoffData;
  isOpen: boolean;
  onClose: () => void;
}

export const ResponderViewModal: React.FC<ResponderViewModalProps> = ({ data, isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const plainText = formatPlainTextHandoff(data);

  const handleCopy = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(plainText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } else {
        setShareFeedback('Clipboard write unsupported on this browser.');
        setTimeout(() => setShareFeedback(null), 3000);
      }
    } catch {
      setShareFeedback('Failed to copy to clipboard.');
      setTimeout(() => setShareFeedback(null), 3000);
    }
  };

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `First30 Emergency Handoff — ${data.incident.selectedGuidance}`,
          text: plainText,
        });
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          return; // User cancelled share sheet
        }
        setShareFeedback('Share not completed.');
        setTimeout(() => setShareFeedback(null), 3000);
      }
    } else {
      // Fallback to copy
      await handleCopy();
      setShareFeedback('Native share unavailable. Copied summary to clipboard.');
      setTimeout(() => setShareFeedback(null), 3500);
    }
  };

  const formatTime = (iso?: string | null) => {
    if (!iso) return 'Unknown';
    try {
      return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return iso;
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Responder Emergency Handoff"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/90 p-2 sm:p-4 flex items-center justify-center animate-in fade-in duration-150"
    >
      <div className="w-full max-w-2xl bg-slate-950 text-slate-100 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        {/* Sticky Header with high contrast */}
        <div className="bg-slate-900 border-b border-slate-800 p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight text-white uppercase">
                Emergency Handoff (Responder View)
              </h2>
              <p className="text-[11px] text-slate-400">
                High-contrast triage overview for arriving paramedics / EMTs
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close Responder View"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Clinical Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 text-sm">
          {/* Medical Disclaimer Banner */}
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <span>INFORMATION PROVIDED BY BYSTANDER &amp; APP TIMERS</span>
              <p className="font-normal text-amber-200/80 text-[11px] mt-0.5">
                Not a confirmed physician diagnosis. Review reported observations below.
              </p>
            </div>
          </div>

          {/* 1. Primary Vital Indicators */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Reported Concern
              </span>
              <span className="text-base font-bold text-teal-300 mt-1 block">
                {data.incident.selectedGuidance}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Responsiveness
              </span>
              <span className="text-base font-bold text-white mt-1 block">
                {data.condition.responsiveness.status === 'reported'
                  ? data.condition.responsiveness.value || 'Reported'
                  : data.condition.responsiveness.status === 'not_assessed'
                  ? 'Not assessed'
                  : 'Unknown'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 col-span-2 sm:col-span-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Breathing Status
              </span>
              <span className="text-base font-bold text-white mt-1 block">
                {data.condition.breathing.status === 'reported'
                  ? data.condition.breathing.value || 'Reported'
                  : data.condition.breathing.status === 'not_assessed'
                  ? 'Not assessed'
                  : 'Unknown'}
              </span>
            </div>
          </div>

          {/* 2. CPR Metrics (if active) */}
          {data.cprMetrics && data.cprMetrics.totalCompressionsRecorded > 0 && (
            <div className="p-4 rounded-xl bg-blue-950/40 border border-blue-500/40 text-blue-200">
              <div className="flex items-center gap-2 mb-2 font-bold text-sm text-blue-300">
                <Heart className="w-4 h-4 text-blue-400" />
                <span>CPR Pacing Recorded by App Metronome</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs mt-2">
                <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">Paced Compressions</span>
                  <span className="text-lg font-black text-white">{data.cprMetrics.totalCompressionsRecorded}</span>
                </div>
                <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">Cycles (30:2)</span>
                  <span className="text-lg font-black text-white">{data.cprMetrics.totalCyclesRecorded}</span>
                </div>
                <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">Cadence</span>
                  <span className="text-lg font-black text-white">{data.cprMetrics.bpmTarget} BPM</span>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 mt-2 text-center">
                App-recorded metronome beats. Delivery depth &amp; recoil unverified.
              </p>
            </div>
          )}

          {/* 3. Actions Confirmed Taken */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Actions Confirmed by Bystander</span>
            </h3>
            {data.actionsTaken.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No specific actions confirmed yet</p>
            ) : (
              <ul className="space-y-1.5">
                {data.actionsTaken.map((act) => (
                  <li
                    key={act.id}
                    className="flex items-start gap-2 text-xs p-2 rounded-lg bg-slate-900 border border-slate-800/80"
                  >
                    <span className="text-emerald-400 font-bold shrink-0">✓</span>
                    <span className="text-slate-200">{act.action}</span>
                    <span className="text-[10px] text-slate-400 ml-auto shrink-0 uppercase tracking-tight">
                      {act.source === 'app_recorded' ? 'App' : 'Bystander'}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* 4. Event Timeline */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-teal-400" />
              <span>Chronological Event Timeline</span>
            </h3>
            <div className="space-y-2 border-l-2 border-slate-800 ml-2 pl-3">
              {data.timeline.map((ev) => (
                <div key={ev.id} className="text-xs">
                  <span className="font-mono text-teal-400 text-[11px] font-bold">
                    {formatTime(ev.timestamp)}
                    {ev.elapsedSeconds !== undefined ? ` (+${Math.floor(ev.elapsedSeconds / 60)}m ${ev.elapsedSeconds % 60}s)` : ''}
                  </span>
                  <p className="text-slate-200 mt-0.5">{ev.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 5. Important Unknowns */}
          {data.importantUnknowns.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-amber-400" />
                <span>Important Unknowns / Not Assessed</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {data.importantUnknowns.map((unk, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded-lg bg-slate-900/60 border border-slate-800 text-[11px] text-slate-300 flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                    <span>{unk}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 6. Bystander Notes */}
          {data.userNotes && data.userNotes.trim() && (
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                Bystander Notes
              </h3>
              <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
                {data.userNotes}
              </p>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="bg-slate-900 border-t border-slate-800 p-3 sm:p-4 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="text-xs text-slate-400">
            {shareFeedback && <span className="text-teal-400 font-medium">{shareFeedback}</span>}
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handleCopy}
              variant="outline"
              size="sm"
              className="border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 text-xs h-9 rounded-xl gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Text'}</span>
            </Button>

            <Button
              onClick={handleShare}
              variant="outline"
              size="sm"
              className="border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 text-xs h-9 rounded-xl gap-1.5"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </Button>

            <Button
              onClick={onClose}
              size="sm"
              className="bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs h-9 rounded-xl px-4"
            >
              Close View
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResponderViewModal;
