import { useEffect, useRef, useState } from 'react';
import { Play, Square, Sparkles, ShieldAlert, Heart, Workflow, MapPin, Cpu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ReasoningTimeline, { ReasoningStep } from './ReasoningTimeline';

type Scenario = {
  id: string;
  title: string;
  blurb: string;
  steps: ReasoningStep[];
  recommendations: string[];
};

const SCENARIOS: Scenario[] = [
  {
    id: 'choking-child',
    title: 'Choking Child',
    blurb: '4-year-old, swallowed grape, cannot cough.',
    recommendations: [
      '5 back blows between shoulder blades',
      'Alternate with 5 chest thrusts',
      'Call 112 / 911 immediately',
      'Do NOT do blind finger sweeps',
    ],
    steps: [
      { agent: 'Intake Agent', icon: Sparkles, processed: 'voice: "child choking, can\'t breathe"', decision: 'symptom: airway obstruction', triggers: 'RiskWalker', t: '00:00' },
      { agent: 'Risk Walker', icon: Heart, processed: 'child + airway subgraph', decision: 'classified as P1 airway emergency', triggers: 'TriageAgent', t: '00:01' },
      { agent: 'Triage Agent', icon: ShieldAlert, processed: 'risk + age + consciousness', decision: 'Critical · escalation window 2 min', triggers: 'ActionPlanner', t: '00:02' },
      { agent: 'Action Planner', icon: Workflow, processed: 'pediatric choking protocol', decision: 'back blows + chest thrust plan', triggers: 'ResourceWalker', t: '00:03' },
      { agent: 'Resource Coord.', icon: MapPin, processed: 'nearby ER nodes', decision: 'identified pediatric ER · 1.2 km', triggers: 'PreparednessAgent', t: '00:04' },
      { agent: 'Preparedness Agent', icon: Cpu, processed: 'incident outcome', decision: 'added Choking-2 node to graph', t: '00:05' },
    ],
  },
  {
    id: 'cardiac',
    title: 'Elderly Cardiac Event',
    blurb: '72-year-old, chest pain, sweating, short of breath.',
    recommendations: ['Sit upright, loosen clothing', 'Consider chewable aspirin 300mg', 'Call EMS now', 'Stand by for CPR'],
    steps: [
      { agent: 'Intake Agent', icon: Sparkles, processed: 'speech + age 72', decision: 'symptoms: chest pain, dyspnea', triggers: 'RiskWalker', t: '00:00' },
      { agent: 'Risk Walker', icon: Heart, processed: 'cardiac risk subgraph', decision: 'high probability ACS', triggers: 'TriageAgent', t: '00:01' },
      { agent: 'Triage Agent', icon: ShieldAlert, processed: 'ACS indicators', decision: 'Critical · window 5 min', triggers: 'ActionPlanner', t: '00:02' },
      { agent: 'Action Planner', icon: Workflow, processed: 'cardiac protocol', decision: 'aspirin + monitoring + CPR-ready', triggers: 'ResourceWalker', t: '00:03' },
      { agent: 'Resource Coord.', icon: MapPin, processed: 'hospitals + AEDs', decision: 'nearest cath-lab 3.4 km', triggers: 'PreparednessAgent', t: '00:04' },
      { agent: 'Preparedness Agent', icon: Cpu, processed: 'incident outcome', decision: 'flagged household cardiac risk', t: '00:05' },
    ],
  },
  {
    id: 'burn',
    title: 'Kitchen Burn',
    blurb: 'Adult, boiling water on forearm, blistering.',
    recommendations: ['Cool under running water 20 min', 'Do NOT apply ice or butter', 'Cover with non-stick dressing', 'Seek care if >palm size'],
    steps: [
      { agent: 'Intake Agent', icon: Sparkles, processed: 'text: scald on forearm', decision: 'symptom: 2nd-degree burn', triggers: 'RiskWalker', t: '00:00' },
      { agent: 'Risk Walker', icon: Heart, processed: 'burn severity subgraph', decision: 'moderate severity, infection risk', triggers: 'TriageAgent', t: '00:01' },
      { agent: 'Triage Agent', icon: ShieldAlert, processed: 'BSA + depth', decision: 'High · window 15 min', triggers: 'ActionPlanner', t: '00:02' },
      { agent: 'Action Planner', icon: Workflow, processed: 'burn first-aid protocol', decision: 'cool water + dressing plan', triggers: 'PreparednessAgent', t: '00:03' },
      { agent: 'Preparedness Agent', icon: Cpu, processed: 'kit audit', decision: 'flagged missing burn gel in kit', t: '00:04' },
    ],
  },
  {
    id: 'bleeding',
    title: 'Severe Bleeding',
    blurb: 'Teen, deep leg cut, pulsing bright red blood.',
    recommendations: ['Apply firm direct pressure', 'Elevate the limb', 'Tourniquet if uncontrolled', 'Call EMS'],
    steps: [
      { agent: 'Intake Agent', icon: Sparkles, processed: 'speech: arterial bleed', decision: 'symptom: severe hemorrhage', triggers: 'RiskWalker', t: '00:00' },
      { agent: 'Risk Walker', icon: Heart, processed: 'hemorrhage subgraph', decision: 'shock risk in <5 min', triggers: 'TriageAgent', t: '00:01' },
      { agent: 'Triage Agent', icon: ShieldAlert, processed: 'bleed rate + site', decision: 'Critical · window 3 min', triggers: 'ActionPlanner', t: '00:02' },
      { agent: 'Action Planner', icon: Workflow, processed: 'STOP-THE-BLEED protocol', decision: 'pressure + tourniquet plan', triggers: 'ResourceWalker', t: '00:03' },
      { agent: 'Resource Coord.', icon: MapPin, processed: 'trauma centers', decision: 'nearest trauma ER 2.0 km', t: '00:04' },
    ],
  },
  {
    id: 'asthma',
    title: 'Asthma Attack',
    blurb: 'Known asthmatic child wheezing severely.',
    recommendations: ['Sit upright, lean forward', 'Use reliever inhaler 4 puffs', 'Wait 4 min, repeat if needed', 'Call EMS if no relief'],
    steps: [
      { agent: 'Intake Agent', icon: Sparkles, processed: 'voice + known asthma node', decision: 'symptom: bronchospasm', triggers: 'RiskWalker', t: '00:00' },
      { agent: 'Risk Walker', icon: Heart, processed: 'asthma risk subgraph', decision: 'moderate-severe exacerbation', triggers: 'TriageAgent', t: '00:01' },
      { agent: 'Triage Agent', icon: ShieldAlert, processed: 'SpO2 + RR proxies', decision: 'High · window 10 min', triggers: 'ActionPlanner', t: '00:02' },
      { agent: 'Action Planner', icon: Workflow, processed: 'pediatric asthma plan', decision: 'inhaler + reassessment loop', triggers: 'PreparednessAgent', t: '00:03' },
      { agent: 'Preparedness Agent', icon: Cpu, processed: 'training graph', decision: 'recommended inhaler training module', t: '00:04' },
    ],
  },
];

export default function DemoScenarioMode() {
  const [active, setActive] = useState<Scenario | null>(null);
  const [progress, setProgress] = useState(0);
  const intRef = useRef<number | null>(null);

  function start(s: Scenario) {
    setActive(s);
    setProgress(0);
    if (intRef.current) window.clearInterval(intRef.current);
    intRef.current = window.setInterval(() => {
      setProgress(p => {
        if (p >= s.steps.length) {
          if (intRef.current) window.clearInterval(intRef.current);
          return p;
        }
        return p + 1;
      });
    }, 900) as unknown as number;
  }
  function stop() {
    if (intRef.current) window.clearInterval(intRef.current);
    setActive(null); setProgress(0);
  }
  useEffect(() => () => { if (intRef.current) window.clearInterval(intRef.current); }, []);

  return (
    <div className="glass-card-strong rounded-2xl p-5 border border-border/40">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">Demo Scenario Mode</h3>
          <p className="text-xs text-muted-foreground">
            Trigger a prebuilt emergency. Watch agents activate, walkers traverse the graph, and memory update live.
          </p>
        </div>
        {active && (
          <Button size="sm" variant="ghost" onClick={stop}><Square className="w-4 h-4 mr-2" />Stop</Button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-4">
        {SCENARIOS.map(s => (
          <button key={s.id} onClick={() => start(s)}
            className={`text-left p-3 rounded-xl border transition-all
              ${active?.id === s.id ? 'border-primary bg-primary/10' : 'border-border/40 bg-secondary/30 hover:bg-primary/5'}`}>
            <div className="flex items-center gap-2 mb-1">
              <Play className="w-3.5 h-3.5 text-primary" />
              <div className="text-sm font-semibold">{s.title}</div>
            </div>
            <div className="text-[11px] text-muted-foreground line-clamp-2">{s.blurb}</div>
          </button>
        ))}
      </div>

      {active && (
        <div className="grid lg:grid-cols-5 gap-4">
          <div className="lg:col-span-3">
            <ReasoningTimeline steps={active.steps.slice(0, progress)} />
          </div>
          <div className="lg:col-span-2 space-y-3">
            <div className="glass-card rounded-2xl p-4 border border-border/40">
              <div className="text-sm font-semibold mb-2">Live Recommendations</div>
              <ul className="space-y-2 text-sm">
                {active.recommendations.map((r, i) => {
                  const visible = i < progress;
                  return (
                    <li key={i}
                      className={`flex items-start gap-2 p-2 rounded-lg transition-all duration-500
                        ${visible ? 'opacity-100 bg-primary/5' : 'opacity-30 bg-secondary/20'}`}>
                      <span className="mt-0.5 w-5 h-5 rounded-full bg-primary/15 text-primary text-[11px] font-semibold flex items-center justify-center">{i + 1}</span>
                      <span>{r}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
            <div className="glass-card rounded-2xl p-4 border border-border/40">
              <div className="text-sm font-semibold mb-2">Graph Memory Updates</div>
              <div className="space-y-1 text-[11px] font-mono text-muted-foreground">
                {active.steps.slice(0, progress).map((s, i) => (
                  <div key={i}>+ node({s.agent.split(' ')[0].toLowerCase()}_event_{i}) → {s.decision}</div>
                ))}
                {progress === 0 && <div>awaiting walker dispatch…</div>}
              </div>
              {progress >= active.steps.length && (
                <div className="mt-2 text-xs text-primary font-semibold">Preparedness Memory Updated ✓</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}