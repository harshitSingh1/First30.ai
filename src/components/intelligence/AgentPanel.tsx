import { LucideIcon } from 'lucide-react';

export type AgentStatus = 'idle' | 'thinking' | 'done' | 'error';

interface Props {
  name: string;
  icon: LucideIcon;
  status: AgentStatus;
  task: string;
  reasoning: string;
  confidence?: number;
}

const statusColor: Record<AgentStatus, string> = {
  idle: 'bg-muted text-muted-foreground',
  thinking: 'bg-primary/15 text-primary',
  done: 'bg-emerald-500/15 text-emerald-500',
  error: 'bg-amber-500/15 text-amber-600',
};

export default function AgentPanel({ name, icon: Icon, status, task, reasoning, confidence }: Props) {
  return (
    <div className="glass-card rounded-xl p-4 border border-border/40">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="w-4 h-4 text-primary" />
          </div>
          <div className="font-semibold text-sm">{name}</div>
        </div>
        <span className={`text-[10px] px-2 py-1 rounded-full font-medium ${statusColor[status]}`}>
          {status === 'thinking' && <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary mr-1 animate-pulse" />}
          {status.toUpperCase()}
        </span>
      </div>
      <div className="text-xs text-muted-foreground mb-1">Task</div>
      <div className="text-sm mb-2">{task}</div>
      <div className="text-xs text-muted-foreground mb-1">Latest reasoning</div>
      <div className="text-xs leading-relaxed text-foreground/80 min-h-[2.5rem]">
        {reasoning || <span className="text-muted-foreground italic">awaiting input…</span>}
      </div>
      {confidence !== undefined && (
        <div className="mt-3">
          <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
            <span>Confidence</span><span>{Math.round(confidence * 100)}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
            <div className="h-full bg-primary transition-all duration-700"
              style={{ width: `${Math.round(confidence * 100)}%` }} />
          </div>
        </div>
      )}
    </div>
  );
}