import { AISummary } from '@/types/dispatcher';
import { Brain, User, AlertCircle, Clock, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AISummaryPanelProps {
  summary: AISummary | null;
  className?: string;
}

const AISummaryPanel = ({ summary, className }: AISummaryPanelProps) => {
  if (!summary) {
    return (
      <div className={cn("flex flex-col items-center justify-center h-full text-muted-foreground", className)}>
        <Brain className="w-12 h-12 mb-4 opacity-30" />
        <p className="text-sm">Awaiting call data...</p>
        <p className="text-xs mt-1">AI summary will appear here</p>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col h-full", className)}>
      <div className="flex items-center gap-2 mb-3">
        <Brain className="w-4 h-4 text-primary" />
        <span className="text-xs text-muted-foreground uppercase tracking-wider">AI Analysis</span>
      </div>

      <ScrollArea className="flex-1 pr-2">
        <div className="space-y-4">
          {/* Chief Complaint */}
          <div className="p-3 rounded-lg bg-emergency/10 border border-emergency/20">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-emergency" />
              <span className="text-xs font-semibold text-emergency uppercase">Chief Complaint</span>
            </div>
            <p className="text-sm font-medium text-foreground">{summary.chiefComplaint}</p>
          </div>

          {/* Patient Info */}
          <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold text-primary uppercase">Patient Info</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Age: </span>
                <span className="text-foreground">{summary.patientInfo.ageGroup}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Conscious: </span>
                <span className={summary.patientInfo.conscious ? "text-success" : "text-emergency"}>
                  {summary.patientInfo.conscious ? 'Yes' : 'No'}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Breathing: </span>
                <span className={summary.patientInfo.breathing ? "text-success" : "text-emergency"}>
                  {summary.patientInfo.breathing ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
            {summary.patientInfo.injuries.length > 0 && (
              <div className="mt-2 pt-2 border-t border-border/30">
                <span className="text-xs text-muted-foreground">Injuries/Conditions:</span>
                <ul className="mt-1 space-y-1">
                  {summary.patientInfo.injuries.map((injury, i) => (
                    <li key={i} className="text-xs text-foreground flex items-start gap-1">
                      <span className="text-emergency mt-0.5">•</span>
                      {injury}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Key Observations */}
          <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold text-primary uppercase">Key Observations</span>
            </div>
            <ul className="space-y-1.5">
              {summary.keyObservations.map((obs, i) => (
                <li key={i} className="text-xs text-foreground flex items-start gap-2">
                  <span className="text-primary font-bold">{i + 1}.</span>
                  {obs}
                </li>
              ))}
            </ul>
          </div>

          {/* Risk Factors */}
          <div className="p-3 rounded-lg bg-warning/10 border border-warning/20">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-warning" />
              <span className="text-xs font-semibold text-warning uppercase">Risk Factors</span>
            </div>
            <ul className="space-y-1">
              {summary.riskFactors.map((risk, i) => (
                <li key={i} className="text-xs text-foreground flex items-start gap-1">
                  <span className="text-warning">⚠</span>
                  {risk}
                </li>
              ))}
            </ul>
          </div>

          {/* Timeline */}
          <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold text-primary uppercase">Call Timeline</span>
            </div>
            <div className="space-y-1.5">
              {summary.timeline.map((event, i) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                  <span className="text-foreground">{event}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default AISummaryPanel;
