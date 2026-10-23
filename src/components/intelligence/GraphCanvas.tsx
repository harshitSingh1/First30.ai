import { useMemo } from 'react';

export type GraphNode = {
  id: string;
  type: string;
  label: string;
};
export type GraphEdge = { from: string; to: string; label?: string };

interface Props {
  nodes: GraphNode[];
  edges: GraphEdge[];
  activeNodeIds?: string[];
}

const typeColor: Record<string, string> = {
  user: 'hsl(var(--primary))',
  family: 'hsl(180 70% 55%)',
  risk: 'hsl(38 90% 60%)',
  incident: 'hsl(280 60% 65%)',
  scenario: 'hsl(200 80% 60%)',
  kit: 'hsl(160 60% 55%)',
  training: 'hsl(220 70% 65%)',
  resource: 'hsl(195 80% 55%)',
  event: 'hsl(35 85% 60%)',
  score: 'hsl(170 70% 55%)',
  symptom: 'hsl(45 90% 60%)',
  agent: 'hsl(var(--primary))',
};

function colorFor(type: string) {
  const k = type?.toLowerCase() ?? '';
  for (const key of Object.keys(typeColor)) if (k.includes(key)) return typeColor[key];
  return 'hsl(var(--primary))';
}

// Deterministic circular layout with type clustering
function layout(nodes: GraphNode[], w: number, h: number) {
  const cx = w / 2, cy = h / 2;
  const center = nodes.find(n => n.type?.toLowerCase().includes('user')) ?? nodes[0];
  const others = nodes.filter(n => n.id !== center?.id);
  const r = Math.min(w, h) * 0.36;
  const pos: Record<string, { x: number; y: number }> = {};
  if (center) pos[center.id] = { x: cx, y: cy };
  others.forEach((n, i) => {
    const a = (i / Math.max(others.length, 1)) * Math.PI * 2 - Math.PI / 2;
    pos[n.id] = { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r };
  });
  return pos;
}

export default function GraphCanvas({ nodes, edges, activeNodeIds = [] }: Props) {
  const w = 560, h = 420;
  const positions = useMemo(() => layout(nodes, w, h), [nodes]);
  const active = new Set(activeNodeIds);

  return (
    <div className="relative w-full h-full rounded-2xl glass-card-strong overflow-hidden">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full">
        <defs>
          <radialGradient id="bgGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="hsl(var(--primary) / 0.18)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
          <filter id="nodeGlow"><feGaussianBlur stdDeviation="2.5" /></filter>
        </defs>
        <rect width={w} height={h} fill="url(#bgGlow)" />

        {/* edges */}
        {edges.map((e, i) => {
          const a = positions[e.from]; const b = positions[e.to];
          if (!a || !b) return null;
          const isActive = active.has(e.from) || active.has(e.to);
          return (
            <g key={`e-${i}`}>
              <line x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                stroke={isActive ? 'hsl(var(--primary))' : 'hsl(var(--border))'}
                strokeWidth={isActive ? 1.8 : 1}
                strokeOpacity={isActive ? 0.9 : 0.45}
                strokeDasharray={isActive ? '4 4' : undefined}
              >
                {isActive && <animate attributeName="stroke-dashoffset" from="0" to="16" dur="1s" repeatCount="indefinite" />}
              </line>
              {e.label && isActive && (
                <text x={(a.x + b.x) / 2} y={(a.y + b.y) / 2 - 4}
                  fill="hsl(var(--muted-foreground))" fontSize="9" textAnchor="middle">{e.label}</text>
              )}
            </g>
          );
        })}

        {/* nodes */}
        {nodes.map((n) => {
          const p = positions[n.id]; if (!p) return null;
          const c = colorFor(n.type);
          const isActive = active.has(n.id);
          const r = isActive ? 16 : 12;
          return (
            <g key={n.id} transform={`translate(${p.x},${p.y})`}>
              {isActive && (
                <circle r={r + 8} fill={c} opacity={0.18}>
                  <animate attributeName="r" values={`${r + 4};${r + 14};${r + 4}`} dur="2.2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.05;0.28;0.05" dur="2.2s" repeatCount="indefinite" />
                </circle>
              )}
              <circle r={r} fill={c} opacity={0.95} filter="url(#nodeGlow)" />
              <circle r={r} fill="hsl(var(--background))" opacity={0.35} />
              <text y={r + 12} textAnchor="middle" fontSize="10"
                fill="hsl(var(--foreground))" className="font-medium">{n.label}</text>
              <text y={-r - 4} textAnchor="middle" fontSize="8"
                fill="hsl(var(--muted-foreground))">{n.type}</text>
            </g>
          );
        })}
      </svg>
      <div className="absolute top-3 left-3 text-[10px] uppercase tracking-widest text-muted-foreground">
        Jac Graph Memory · {nodes.length} nodes · {edges.length} edges
      </div>
    </div>
  );
}