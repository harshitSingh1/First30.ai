import { Sparkles, ShieldAlert, Heart, Workflow, MapPin, Cpu } from 'lucide-react';

export interface ReasoningStep {
  agent: string;
  icon?: any;
  processed: string;
  decision: string;
  triggers?: string;
  t?: string;
}

const DEFAULT_STEPS: ReasoningStep[] = [
  { agent: 'Intake Agent', icon: Sparkles, processed: 'speech: "breathing is fast and shallow"', decision: 'extracted symptom: breathing abnormal', triggers: 'RiskWalker', t: '00:00' },
  { agent: 'Risk Walker', icon: Heart, processed: 'symptom subgraph + family risks', decision: 'detected respiratory emergency', triggers: 'TriageAgent', t: '00:01' },
  { agent: 'Triage Agent', icon: ShieldAlert, processed: 'risk indicators + vitals', decision: 'escalated urgency → Critical', triggers: 'ActionPlanner', t: '00:02' },
  { agent: 'Action Planner', icon: Workflow, processed: 'protocol library + patient context', decision: 'generated CPR + airway plan', triggers: 'ResourceWalker', t: '00:03' },
  { agent: 'Resource Coord.', icon: MapPin, processed: 'geo nodes within 5 km', decision: 'identified nearest hospital + AED', triggers: 'PreparednessAgent', t: '00:04' },
  { agent: 'Preparedness Agent', icon: Cpu, processed: 'graph delta + outcome', decision: 'updated preparedness score → 64', t: '00:05' },
];

export default function ReasoningTimeline({ steps = DEFAULT_STEPS }: { steps?: ReasoningStep[] }) {
  return (
    <div className="glass-card-strong rounded-2xl p-5 border border-border/40">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-sm font-semibold">Agentic Reasoning Timeline</div>
          <div className="text-[11px] text-muted-foreground">
            Each row: which agent acted · what it processed · its decision · next walker triggered.
          </div>
        </div>
        <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full bg-primary/10 text-primary">
          Jac walker trace
        </span>
      </div>

      <div className="relative pl-6">
        <div className="absolute left-2 top-1 bottom-1 w-px bg-border" />
        <div className="space-y-3">
          {steps.map((s, i) => {
            const Icon = s.icon ?? Sparkles;
            return (
              <div key={i} className="relative">
                <div className="absolute -left-[18px] top-1.5 w-3 h-3 rounded-full bg-primary ring-4 ring-primary/15" />
                <div className="p-3 rounded-xl bg-secondary/30 border border-border/40">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-primary" />
                      <div className="text-sm font-semibold">{s.agent}</div>
                    </div>
                    {s.t && <span className="text-[10px] text-muted-foreground font-mono">{s.t}</span>}
                  </div>
                  <div className="grid md:grid-cols-3 gap-2 text-xs">
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Processed</div>
                      <div>{s.processed}</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Decision</div>
                      <div className="text-foreground">{s.decision}</div>
                    </div>
                    {s.triggers && (
                      <div>
                        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Triggered</div>
                        <div className="text-primary font-medium">→ {s.triggers}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}