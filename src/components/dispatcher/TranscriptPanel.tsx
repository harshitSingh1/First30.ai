import { TranscriptEntry } from '@/types/dispatcher';
import { User, Headphones, Bot, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TranscriptPanelProps {
  entries: TranscriptEntry[];
  className?: string;
}

const TranscriptPanel = ({ entries, className }: TranscriptPanelProps) => {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit',
      hour12: false 
    });
  };

  const getSpeakerIcon = (speaker: TranscriptEntry['speaker']) => {
    switch (speaker) {
      case 'caller':
        return <User className="w-4 h-4" />;
      case 'dispatcher':
        return <Headphones className="w-4 h-4" />;
      case 'system':
        return <Bot className="w-4 h-4" />;
    }
  };

  const getSpeakerStyle = (speaker: TranscriptEntry['speaker']) => {
    switch (speaker) {
      case 'caller':
        return 'bg-blue-500/20 border-blue-500/30 text-blue-300';
      case 'dispatcher':
        return 'bg-primary/20 border-primary/30 text-primary';
      case 'system':
        return 'bg-amber-500/20 border-amber-500/30 text-amber-300';
    }
  };

  return (
    <div className={cn("flex flex-col h-full", className)}>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
        <span className="text-xs text-muted-foreground uppercase tracking-wider">Live Transcript</span>
      </div>
      
      <ScrollArea className="flex-1 pr-2">
        <div className="space-y-2">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className={cn(
                "p-3 rounded-lg border transition-all",
                getSpeakerStyle(entry.speaker),
                entry.flagged && "ring-1 ring-emergency/50"
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  {getSpeakerIcon(entry.speaker)}
                  <span className="text-xs font-medium capitalize">{entry.speaker}</span>
                  {entry.flagged && (
                    <AlertTriangle className="w-3 h-3 text-emergency" />
                  )}
                </div>
                <span className="text-xs opacity-60 font-mono">{formatTime(entry.timestamp)}</span>
              </div>
              <p className="text-sm leading-relaxed">{entry.message}</p>
            </div>
          ))}
        </div>
      </ScrollArea>
      
      <div className="mt-3 pt-3 border-t border-border/50">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-blue-400" />
            <span>Caller</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span>Dispatcher</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-amber-400" />
            <span>System</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TranscriptPanel;
