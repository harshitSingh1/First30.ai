import { useEffect, useState } from 'react';
import { Footprints, Activity, ShieldCheck, Package } from 'lucide-react';

interface Walker {
  id: string;
  name: string;
  icon: any;
  color: string;
  path: string[];
  logs: string[];
}

const WALKERS: Walker[] = [
  {
    id: 'intake',
    name: 'Intake Walker',
    icon: Footprints,
    color: 'hsl(var(--primary))',
    path: ['User', 'Symptom', 'Risk', 'Action'],
    logs: [
      'Walker entered User node',
      'Extracted symptom: breathing abnormal',
      'Walker identified respiratory distress risk',
      'Spawned ActionWalker',
    ],
  },
  {
    id: 'risk',
    name: 'Risk Walker',
    icon: Activity,
    color: 'hsl(38 90% 60%)',
    path: ['Symptom', 'Risk', 'Family', 'History'],
    logs: [
      'Walker reading family risk subgraph',
      'Found child asthma node',
      'Cross-checked with past incident node',
      'Escalated to TriageAgent',
    ],
  },
  {
    id: 'preparedness',
    name: 'Preparedness Walker',
    icon: ShieldCheck,
    color: 'hsl(170 70% 55%)',
    path: ['Kit', 'Training', 'Score', 'User'],
    logs: [
      'Audited first-aid kit completeness',
      'Detected missing burn gel',
      'Walker updated preparedness memory',
      'Score recalculated → 64',
    ],
  },
  {
    id: 'resource',
    name: 'Resource Walker',
    icon: Package,
    color: 'hsl(195 80% 55%)',
    path: ['Home', 'Resource', 'Hospital', 'AED'],
    logs: [
      'Walker traversed location graph',
      'Ranked nearest hospital · 1.2 km',
      'Identified public AED node',
      'Returned ordered resource list',
    ],
  },
];

function WalkerCard({ w, running }: { w: Walker; running: boolean }) {
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setStep(s => (s + 1) % w.path.length), 1200);
    return () => clearInterval(t);
  }, [running, w.path.length]);

  const Icon = w.icon;
  return (
    <div className="glass-card rounded-2xl p-4 border border-border/40">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: `${w.color}22`, color: w.color }}>
            <Icon className="w-4 h-4" />
          </div>
          <div className="text-sm font-semibold">{w.name}</div>
        </div>
        <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full bg-primary/10 text-primary">
          {running ? 'traversing' : 'idle'}
        </span>
      </div>

      {/* path traversal */}
      <div className="flex items-center justify-between gap-1 mb-3">
        {w.path.map((node, i) => (
          <div key={node} className="flex items-center gap-1 flex-1">
            <div className={`flex-1 text-center text-[10px] py-1.5 rounded-md border transition-all
              ${i === step ? 'border-primary bg-primary/10 text-primary scale-105' : 'border-border/40 bg-secondary/30 text-muted-foreground'}`}>
              {node}
            </div>
            {i < w.path.length - 1 && (
              <div className={`w-3 h-px ${i < step ? 'bg-primary' : 'bg-border'}`} />
            )}
          </div>
        ))}
      </div>

      {/* logs */}
      <div className="bg-background/60 rounded-lg p-2 font-mono text-[11px] space-y-1 max-h-24 overflow-hidden">
        {w.logs.slice(0, step + 1).map((l, i) => (
          <div key={i} className={i === step ? 'text-primary' : 'text-muted-foreground'}>
            <span className="opacity-60">›</span> {l}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function WalkerExecutionPanels({ running = true }: { running?: boolean }) {
  return (
    <div className="grid md:grid-cols-2 gap-3">
      {WALKERS.map(w => <WalkerCard key={w.id} w={w} running={running} />)}
    </div>
  );
}