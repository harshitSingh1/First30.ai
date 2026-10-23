import { useEffect, useRef } from 'react';
import { Route } from 'lucide-react';

interface Props {
  lines: string[];
}

export default function WalkerStream({ lines }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [lines]);

  return (
    <div className="glass-card rounded-xl p-4 border border-border/40">
      <div className="flex items-center gap-2 mb-3">
        <Route className="w-4 h-4 text-primary" />
        <div className="text-sm font-semibold">Active Walkers</div>
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground ml-auto">
          Jac traversal
        </span>
      </div>
      <div ref={ref} className="space-y-1.5 text-xs max-h-44 overflow-y-auto pr-2 font-mono">
        {lines.length === 0 && (
          <div className="text-muted-foreground italic">No walkers active.</div>
        )}
        {lines.map((l, i) => (
          <div key={i} className="flex gap-2 items-start">
            <span className="text-primary mt-0.5">›</span>
            <span className="text-foreground/80">{l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}