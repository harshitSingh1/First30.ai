import { TimelinePhase } from '@/types/dispatcher';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimelinePhaseCardProps {
  currentPhase: TimelinePhase;
  startTime: Date;
  className?: string;
}

const phases: { id: TimelinePhase; label: string; description: string }[] = [
  { id: '0-2', label: '0–2 min', description: 'Initial Assessment' },
  { id: '2-5', label: '2–5 min', description: 'Dispatch & Guidance' },
  { id: '5-15', label: '5–15 min', description: 'Response En Route' },
  { id: '15-30', label: '15–30 min', description: 'Extended Care' }
];

const TimelinePhaseCard = ({ currentPhase, startTime, className }: TimelinePhaseCardProps) => {
  const getElapsedTime = () => {
    const elapsed = Math.floor((Date.now() - startTime.getTime()) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getPhaseIndex = (phase: TimelinePhase) => phases.findIndex(p => p.id === phase);
  const currentIndex = getPhaseIndex(currentPhase);

  return (
    <div className={cn("glass-card-strong p-4", className)}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">Call Timeline</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span className="text-sm font-mono text-primary">{getElapsedTime()}</span>
        </div>
      </div>

      {/* Timeline Bar */}
      <div className="relative">
        {/* Background Track */}
        <div className="flex gap-1 mb-2">
          {phases.map((phase, index) => (
            <div
              key={phase.id}
              className={cn(
                "flex-1 h-2 rounded-full transition-all duration-500",
                index <= currentIndex 
                  ? index === currentIndex 
                    ? "bg-primary animate-pulse" 
                    : "bg-primary/60"
                  : "bg-muted/50"
              )}
            />
          ))}
        </div>

        {/* Phase Labels */}
        <div className="flex gap-1">
          {phases.map((phase, index) => (
            <div
              key={phase.id}
              className={cn(
                "flex-1 text-center transition-all",
                index === currentIndex && "scale-105"
              )}
            >
              <div
                className={cn(
                  "py-2 px-1 rounded-lg",
                  index === currentIndex 
                    ? "bg-primary/20 border border-primary/30" 
                    : index < currentIndex 
                      ? "bg-muted/30" 
                      : ""
                )}
              >
                <div className={cn(
                  "text-xs font-bold",
                  index === currentIndex 
                    ? "text-primary" 
                    : index < currentIndex 
                      ? "text-muted-foreground" 
                      : "text-muted-foreground/50"
                )}>
                  {phase.label}
                </div>
                <div className={cn(
                  "text-[10px] mt-0.5 leading-tight",
                  index === currentIndex 
                    ? "text-primary/80" 
                    : "text-muted-foreground/60"
                )}>
                  {phase.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Current Phase Indicator */}
      <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Current Phase</span>
        <span className="text-sm font-semibold text-primary">
          {phases.find(p => p.id === currentPhase)?.description}
        </span>
      </div>
    </div>
  );
};

export default TimelinePhaseCard;
