import { Layers, Cpu, Mic, Map, Network } from 'lucide-react';

const STACK = [
  {
    title: 'Frontend',
    icon: Layers,
    items: ['Lovable', 'React', 'Tailwind CSS', 'Framer Motion'],
    accent: 'hsl(var(--primary))',
  },
  {
    title: 'AI / Agent Layer',
    icon: Cpu,
    items: ['Jac', 'Jaseci', 'Graph-native memory', 'Walker orchestration'],
    accent: 'hsl(170 70% 50%)',
    highlight: true,
  },
  {
    title: 'Voice',
    icon: Mic,
    items: ['ElevenLabs TTS', 'Web Speech API'],
    accent: 'hsl(38 90% 60%)',
  },
  {
    title: 'Maps',
    icon: Map,
    items: ['OpenStreetMap', 'Leaflet'],
    accent: 'hsl(195 80% 55%)',
  },
];

export default function TechStackSection() {
  return (
    <div className="glass-card-strong rounded-2xl p-6 border border-border/40">
      <div className="flex items-center gap-2 mb-4">
        <Network className="w-5 h-5 text-primary" />
        <div>
          <h3 className="text-lg font-semibold">Architecture & Tech Stack</h3>
          <p className="text-xs text-muted-foreground">Jac/Jaseci powers the agent + graph memory layer.</p>
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {STACK.map(s => {
          const Icon = s.icon;
          return (
            <div key={s.title}
              className={`rounded-xl p-4 border ${s.highlight ? 'border-primary/60 bg-primary/5' : 'border-border/40 bg-secondary/30'}`}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: `${s.accent}22`, color: s.accent }}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="text-sm font-semibold">{s.title}</div>
                {s.highlight && (
                  <span className="ml-auto text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded-full bg-primary/15 text-primary">
                    core
                  </span>
                )}
              </div>
              <ul className="space-y-1 text-xs text-muted-foreground">
                {s.items.map(i => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-primary/60" /> {i}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}