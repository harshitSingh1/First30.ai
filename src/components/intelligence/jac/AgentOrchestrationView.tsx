import { useEffect, useState } from 'react';
import { Sparkles, ShieldAlert, Heart, Workflow, MapPin, Cpu, Network } from 'lucide-react';

type AgentId = 'intake' | 'triage' | 'risk' | 'action' | 'resource' | 'preparedness';

const AGENTS: { id: AgentId; label: string; icon: any; angle: number }[] = [
  { id: 'intake', label: 'Intake Agent', icon: Sparkles, angle: -90 },
  { id: 'triage', label: 'Triage Agent', icon: ShieldAlert, angle: -30 },
  { id: 'risk', label: 'Risk Prediction', icon: Heart, angle: 30 },
  { id: 'action', label: 'Action Planner', icon: Workflow, angle: 90 },
  { id: 'resource', label: 'Resource Coord.', icon: MapPin, angle: 150 },
  { id: 'preparedness', label: 'Preparedness', icon: Cpu, angle: 210 },
];

const FLOW: { from: AgentId; to: AgentId; status: string }[] = [
  { from: 'intake', to: 'triage', status: 'Processing speech input' },
  { from: 'triage', to: 'risk', status: 'Walker analyzing symptoms' },
  { from: 'risk', to: 'action', status: 'Updating emergency graph' },
  { from: 'action', to: 'resource', status: 'Planning adaptive response' },
  { from: 'resource', to: 'preparedness', status: 'Syncing preparedness memory' },
  { from: 'preparedness', to: 'intake', status: 'Awaiting next walker dispatch' },
];

interface Props {
  activeAgents?: AgentId[];
  running?: boolean;
}

export default function AgentOrchestrationView({ activeAgents = [], running = true }: Props) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setTick(v => v + 1), 1600);
    return () => clearInterval(t);
  }, [running]);

  const current = FLOW[tick % FLOW.length];
  const W = 560, H = 360, cx = W / 2, cy = H / 2, R = 130;
  const pos = (a: number) => {
    const rad = (a * Math.PI) / 180;
    return { x: cx + R * Math.cos(rad), y: cy + R * Math.sin(rad) };
  };
  const posOf = (id: AgentId) => pos(AGENTS.find(a => a.id === id)!.angle);

  return (
    <div className="glass-card-strong rounded-2xl p-5 border border-border/40">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Network className="w-4 h-4 text-primary" />
          <div className="text-sm font-semibold">Agent Orchestration View</div>
        </div>
        <div className="text-[11px] uppercase tracking-widest text-primary">
          {running ? current.status : 'idle'}
        </div>
      </div>

      <div className="relative w-full overflow-hidden rounded-xl bg-gradient-to-br from-secondary/30 to-background">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-[360px]">
          <defs>
            <radialGradient id="bgglow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="hsl(var(--primary) / 0.15)" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
            <linearGradient id="edgeflow" x1="0" x2="1">
              <stop offset="0%" stopColor="hsl(var(--primary) / 0)" />
              <stop offset="50%" stopColor="hsl(var(--primary) / 0.9)" />
              <stop offset="100%" stopColor="hsl(var(--primary) / 0)" />
            </linearGradient>
          </defs>
          <circle cx={cx} cy={cy} r={R + 60} fill="url(#bgglow)" />

          {/* base ring connections */}
          {AGENTS.map((a, i) => {
            const b = AGENTS[(i + 1) % AGENTS.length];
            const p1 = pos(a.angle); const p2 = pos(b.angle);
            return <line key={`r-${a.id}`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
              stroke="hsl(var(--border))" strokeWidth={1} strokeDasharray="3 4" opacity={0.5} />;
          })}

          {/* cross links to center */}
          {AGENTS.map(a => {
            const p = pos(a.angle);
            return <line key={`c-${a.id}`} x1={cx} y1={cy} x2={p.x} y2={p.y}
              stroke="hsl(var(--border))" strokeWidth={1} opacity={0.35} />;
          })}

          {/* active flow edge */}
          {running && (() => {
            const a = posOf(current.from); const b = posOf(current.to);
            return (
              <g key={`flow-${tick}`}>
                <line x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                  stroke="url(#edgeflow)" strokeWidth={2.5} />
                <circle r={5} fill="hsl(var(--primary))">
                  <animate attributeName="cx" from={a.x} to={b.x} dur="1.4s" repeatCount="1" />
                  <animate attributeName="cy" from={a.y} to={b.y} dur="1.4s" repeatCount="1" />
                  <animate attributeName="opacity" values="0;1;1;0" dur="1.4s" repeatCount="1" />
                </circle>
              </g>
            );
          })()}

          {/* central hub */}
          <circle cx={cx} cy={cy} r={28} fill="hsl(var(--primary) / 0.12)" stroke="hsl(var(--primary))" strokeWidth={1.5}>
            <animate attributeName="r" values="28;32;28" dur="2.2s" repeatCount="indefinite" />
          </circle>
          <text x={cx} y={cy + 4} textAnchor="middle" fontSize={10} fill="hsl(var(--primary))" fontWeight={700}>
            JAC HUB
          </text>

          {/* agents */}
          {AGENTS.map(a => {
            const p = pos(a.angle);
            const active = activeAgents.includes(a.id) || a.id === current.from || a.id === current.to;
            return (
              <g key={a.id}>
                <circle cx={p.x} cy={p.y} r={active ? 26 : 22}
                  fill={active ? 'hsl(var(--primary) / 0.18)' : 'hsl(var(--card))'}
                  stroke={active ? 'hsl(var(--primary))' : 'hsl(var(--border))'}
                  strokeWidth={active ? 2 : 1}>
                  {active && <animate attributeName="r" values="22;28;22" dur="1.6s" repeatCount="indefinite" />}
                </circle>
                <text x={p.x} y={p.y + 42} textAnchor="middle" fontSize={11}
                  fill="hsl(var(--foreground))" fontWeight={600}>
                  {a.label}
                </text>
              </g>
            );
          })}
        </svg>

        {/* icon overlays positioned absolutely on top */}
        <div className="absolute inset-0 pointer-events-none">
          {AGENTS.map(a => {
            const p = pos(a.angle);
            const Icon = a.icon;
            return (
              <div key={a.id}
                className="absolute -translate-x-1/2 -translate-y-1/2 text-primary"
                style={{ left: `${(p.x / W) * 100}%`, top: `${(p.y / H) * 100}%` }}>
                <Icon className="w-4 h-4" />
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-2 text-[11px]">
        {FLOW.slice(0, 6).map((f, i) => (
          <div key={i} className={`p-2 rounded-lg border ${i === tick % FLOW.length ? 'border-primary/50 bg-primary/5' : 'border-border/40 bg-secondary/30'}`}>
            <div className="font-medium capitalize">{f.from} → {f.to}</div>
            <div className="text-muted-foreground">{f.status}</div>
          </div>
        ))}
      </div>
    </div>
  );
}