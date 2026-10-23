import { Priority } from '@/types/emergency';
import { cn } from '@/lib/utils';

interface PriorityBadgeProps {
  priority: Priority;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  showPulse?: boolean;
}

// Calm priority colors - no red!
const priorityConfig = {
  P1: { 
    label: 'Critical', 
    color: 'bg-blue-600/20 text-blue-400 border-blue-500/30',
    ring: 'ring-blue-500/30',
    pulse: true 
  },
  P2: { 
    label: 'High', 
    color: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    ring: 'ring-amber-500/30',
    pulse: false 
  },
  P3: { 
    label: 'Medium', 
    color: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
    ring: 'ring-teal-500/30',
    pulse: false 
  },
  P4: { 
    label: 'Low', 
    color: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
    ring: 'ring-slate-500/30',
    pulse: false 
  }
};

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
  lg: 'px-4 py-1.5 text-base font-bold'
};

const PriorityBadge = ({ priority, size = 'md', showLabel = true, showPulse = true }: PriorityBadgeProps) => {
  const config = priorityConfig[priority];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-semibold border",
        config.color,
        sizeClasses[size],
        showPulse && config.pulse && "pulse-calm"
      )}
    >
      <span className="font-bold">{priority}</span>
      {showLabel && <span className="opacity-90">• {config.label}</span>}
    </span>
  );
};

export default PriorityBadge;
