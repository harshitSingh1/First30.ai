import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Play, CheckCircle2, XCircle, Trophy } from 'lucide-react';

const SCENARIOS = [
  { id: 'choking-child', title: 'Choking Child', prompt: 'A 4-year-old just swallowed a grape and cannot cough or speak. What do you do first?' },
  { id: 'heart-attack', title: 'Heart Attack', prompt: 'A 58-year-old adult clutches their chest, sweating, breathing fast. Walk through your first actions.' },
  { id: 'burns', title: 'Kitchen Burn', prompt: 'An adult spilled boiling water on their forearm. Skin is red and blistering. What is your first 60 seconds?' },
  { id: 'unconscious', title: 'Unconscious Patient', prompt: 'You find an adult collapsed on the floor, breathing shallowly, not responding to voice. What now?' },
  { id: 'bleeding', title: 'Severe Bleeding', prompt: 'A teenager has a deep cut on the leg, bright red blood is pulsing out. What do you do first?' },
] as const;

interface Result {
  scenarioId: string;
  score: number;
  feedback: string;
  recommendation: string;
}

function scoreResponse(input: string, scenarioId: string): Result {
  const t = input.toLowerCase();
  let score = 30;
  const hits: string[] = [];
  if (/911|112|emergenc(y|ies)|call/.test(t)) { score += 25; hits.push('called for help'); }
  if (/check|breath|conscious|respons/.test(t)) { score += 15; hits.push('assessed responsiveness'); }
  if (/cool water|cold water|run.*water|rinse/.test(t) && scenarioId === 'burns') { score += 20; hits.push('cooled the burn'); }
  if (/back blow|heimlich|abdominal thrust/.test(t) && scenarioId === 'choking-child') { score += 25; hits.push('used choking protocol'); }
  if (/aspirin|chew/.test(t) && scenarioId === 'heart-attack') { score += 10; hits.push('considered aspirin'); }
  if (/cpr|compression/.test(t) && scenarioId === 'unconscious') { score += 20; hits.push('considered CPR'); }
  if (/press|pressure|cloth|tourniquet|elevat/.test(t) && scenarioId === 'bleeding') { score += 25; hits.push('applied pressure'); }
  if (/calm|reassur/.test(t)) { score += 5; hits.push('kept patient calm'); }
  score = Math.min(score, 100);
  return {
    scenarioId,
    score,
    feedback: hits.length ? `You ${hits.join(', ')}.` : 'Your response missed key first-response actions.',
    recommendation: score >= 80
      ? 'Strong response. Try a higher-difficulty scenario next.'
      : score >= 50
        ? 'Decent start. Practice the matching guided flow to lock in the steps.'
        : 'Review the relevant emergency flow and Smart First Aid Kit training before retrying.',
  };
}

export default function SimulationMode() {
  const [active, setActive] = useState<typeof SCENARIOS[number] | null>(null);
  const [response, setResponse] = useState('');
  const [result, setResult] = useState<Result | null>(null);

  return (
    <div className="glass-card-strong rounded-2xl p-5 border border-border/40">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">Simulation & Training Mode</h3>
          <p className="text-xs text-muted-foreground">
            Agents evaluate your response and update the Preparedness graph.
          </p>
        </div>
        <Trophy className="w-5 h-5 text-primary" />
      </div>

      {!active && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {SCENARIOS.map(s => (
            <button key={s.id}
              onClick={() => { setActive(s); setResult(null); setResponse(''); }}
              className="text-left p-3 rounded-xl glass-card hover:bg-primary/5 transition-all border border-border/40">
              <div className="text-sm font-medium mb-1">{s.title}</div>
              <div className="text-[11px] text-muted-foreground line-clamp-2">{s.prompt}</div>
            </button>
          ))}
        </div>
      )}

      {active && !result && (
        <div>
          <div className="text-sm mb-2 font-medium">{active.title}</div>
          <div className="text-sm text-muted-foreground mb-3 p-3 rounded-lg bg-secondary/40">{active.prompt}</div>
          <textarea value={response} onChange={(e) => setResponse(e.target.value)}
            placeholder="Type the first actions you would take…"
            className="w-full min-h-24 p-3 rounded-lg bg-background border border-border/60 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
          <div className="flex gap-2 mt-3">
            <Button onClick={() => setResult(scoreResponse(response, active.id))}
              disabled={!response.trim()}>
              <Play className="w-4 h-4 mr-2" /> Evaluate
            </Button>
            <Button variant="ghost" onClick={() => setActive(null)}>Cancel</Button>
          </div>
        </div>
      )}

      {active && result && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            {result.score >= 70
              ? <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              : <XCircle className="w-5 h-5 text-amber-500" />}
            <div className="font-semibold">{active.title} — Response Score: {result.score}/100</div>
          </div>
          <div className="grid md:grid-cols-2 gap-3 mb-4">
            <div className="p-3 rounded-lg bg-secondary/40">
              <div className="text-[11px] uppercase tracking-widest text-muted-foreground mb-1">Preparedness Feedback</div>
              <div className="text-sm">{result.feedback}</div>
            </div>
            <div className="p-3 rounded-lg bg-secondary/40">
              <div className="text-[11px] uppercase tracking-widest text-muted-foreground mb-1">Recommended Training</div>
              <div className="text-sm">{result.recommendation}</div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => { setActive(null); setResult(null); }}>Try another scenario</Button>
            <Button variant="ghost" onClick={() => { setResult(null); setResponse(''); }}>Retry this one</Button>
          </div>
        </div>
      )}
    </div>
  );
}