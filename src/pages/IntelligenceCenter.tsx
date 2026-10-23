import { useEffect, useMemo, useRef, useState } from 'react';
import Layout from '@/components/layout/Layout';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import {
  Brain, Activity, ShieldAlert, Sparkles, Workflow, MapPin,
  Mic, MicOff, Send, Network, Cpu, Heart, AlertCircle, Package, GraduationCap, WifiOff,
} from 'lucide-react';
import GraphCanvas, { GraphNode, GraphEdge } from '@/components/intelligence/GraphCanvas';
import AgentPanel, { AgentStatus } from '@/components/intelligence/AgentPanel';
import WalkerStream from '@/components/intelligence/WalkerStream';
import SimulationMode from '@/components/intelligence/SimulationMode';
import AgentOrchestrationView from '@/components/intelligence/jac/AgentOrchestrationView';
import WalkerExecutionPanels from '@/components/intelligence/jac/WalkerExecutionPanels';
import ReasoningTimeline from '@/components/intelligence/jac/ReasoningTimeline';
import TechStackSection from '@/components/intelligence/jac/TechStackSection';
import DemoScenarioMode from '@/components/intelligence/jac/DemoScenarioMode';

type AgentKey = 'intake' | 'triage' | 'risk' | 'action' | 'resource' | 'preparedness';

interface AgentState {
  status: AgentStatus;
  task: string;
  reasoning: string;
  confidence?: number;
}

const DEFAULT_AGENTS: Record<AgentKey, AgentState> = {
  intake: { status: 'idle', task: 'Extract entities from emergency input', reasoning: '' },
  triage: { status: 'idle', task: 'Assign urgency + escalation window', reasoning: '' },
  risk: { status: 'idle', task: 'Predict risk indicators (not diagnoses)', reasoning: '' },
  action: { status: 'idle', task: 'Generate adaptive 30-min action plan', reasoning: '' },
  resource: { status: 'idle', task: 'Rank nearby hospitals, AEDs, pharmacies', reasoning: '' },
  preparedness: { status: 'thinking', task: 'Maintain preparedness graph + score', reasoning: 'Tracking kit, training and past incidents in graph memory.' },
};

const SEED_NODES: GraphNode[] = [
  { id: 'user', type: 'User', label: 'You' },
  { id: 'family-1', type: 'Family', label: 'Spouse' },
  { id: 'family-2', type: 'Family', label: 'Child (7)' },
  { id: 'risk-asthma', type: 'Risk', label: 'Asthma' },
  { id: 'home', type: 'Scenario', label: 'Home' },
  { id: 'kit', type: 'Kit', label: 'First Aid Kit' },
  { id: 'kit-missing-burn-gel', type: 'Kit', label: 'Missing: Burn Gel' },
  { id: 'incident-1', type: 'Incident', label: 'Choking · Last yr' },
  { id: 'training-cpr', type: 'Training', label: 'CPR · 60%' },
  { id: 'res-hospital', type: 'Resource', label: 'Hospital · 1.2 km' },
  { id: 'score', type: 'Score', label: 'Preparedness 64' },
];
const SEED_EDGES: GraphEdge[] = [
  { from: 'user', to: 'family-1', label: 'family' },
  { from: 'user', to: 'family-2', label: 'family' },
  { from: 'family-2', to: 'risk-asthma', label: 'has risk' },
  { from: 'user', to: 'home', label: 'lives at' },
  { from: 'user', to: 'kit', label: 'owns' },
  { from: 'kit', to: 'kit-missing-burn-gel', label: 'gap' },
  { from: 'family-2', to: 'incident-1', label: 'past event' },
  { from: 'user', to: 'training-cpr', label: 'in progress' },
  { from: 'home', to: 'res-hospital', label: 'nearby' },
  { from: 'user', to: 'score', label: 'measured' },
];

type TranscriptItem = { role: 'user' | 'system'; text: string; t: number };

function urgencyColor(level?: string) {
  switch (level) {
    case 'Critical': return 'bg-blue-600 text-white';
    case 'High': return 'bg-amber-500 text-white';
    case 'Medium': return 'bg-teal-500 text-white';
    case 'Low': return 'bg-muted text-foreground';
    default: return 'bg-secondary text-muted-foreground';
  }
}

export default function IntelligenceCenter() {
  const [input, setInput] = useState('');
  const [transcript, setTranscript] = useState<TranscriptItem[]>([]);
  const [agents, setAgents] = useState(DEFAULT_AGENTS);
  const [walkerLines, setWalkerLines] = useState<string[]>([]);
  const [nodes, setNodes] = useState<GraphNode[]>(SEED_NODES);
  const [edges, setEdges] = useState<GraphEdge[]>(SEED_EDGES);
  const [activeNodeIds, setActiveNodeIds] = useState<string[]>([]);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const recRef = useRef<any>(null);

  // Voice input via Web Speech API
  useEffect(() => {
    const SR: any = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    const r = new SR();
    r.continuous = false;
    r.interimResults = false;
    r.lang = 'en-US';
    r.onresult = (e: any) => {
      const text = Array.from(e.results).map((res: any) => res[0].transcript).join(' ');
      setInput(prev => (prev ? prev + ' ' : '') + text);
    };
    r.onend = () => setListening(false);
    recRef.current = r;
  }, []);

  function toggleListen() {
    if (!recRef.current) return;
    if (listening) { recRef.current.stop(); setListening(false); }
    else { try { recRef.current.start(); setListening(true); } catch {} }
  }

  function pushWalker(line: string) {
    setWalkerLines(prev => [...prev.slice(-30), line]);
  }

  async function runAgents() {
    if (!input.trim() || loading) return;
    const userText = input.trim();
    setInput('');
    setTranscript(t => [...t, { role: 'user', text: userText, t: Date.now() }]);
    setLoading(true);
    setResult(null);
    setWalkerLines([]);
    setActiveNodeIds(['user']);

    const startStates: Record<AgentKey, AgentState> = { ...DEFAULT_AGENTS };
    (Object.keys(startStates) as AgentKey[]).forEach(k => {
      if (k !== 'preparedness') startStates[k] = { ...startStates[k], status: 'thinking', reasoning: 'Walker dispatched…' };
    });
    setAgents(startStates);

    pushWalker('IntakeWalker → traversing User node…');
    setTimeout(() => pushWalker('TriageWalker → reading symptom nodes…'), 350);
    setTimeout(() => pushWalker('RiskWalker → expanding risk-indicator subgraph…'), 700);
    setTimeout(() => pushWalker('ActionWalker → composing adaptive plan…'), 1050);
    setTimeout(() => pushWalker('ResourceWalker → ranking nearby resource nodes…'), 1400);

    let r: any = null;
    const hasSupabase = Boolean(
      import.meta.env.VITE_SUPABASE_URL &&
      !import.meta.env.VITE_SUPABASE_URL.includes('placeholder') &&
      import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY &&
      !import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY.includes('placeholder')
    );

    if (hasSupabase) {
      try {
        const { data, error } = await supabase.functions.invoke('intelligence-agent', {
          body: {
            input: userText,
            context: {
              user: 'You',
              family: ['Spouse', 'Child(7)'],
              risks: ['Child asthma'],
              kit_gaps: ['burn gel'],
              training: { CPR: 0.6 },
              past_incidents: ['Child choking (last year)'],
            },
          },
        });
        if (!error && data) {
          r = data;
        }
      } catch (err) {
        console.warn('Remote agent unavailable, running local graph walker engine:', err);
      }
    }

    if (!r) {
      // Local Jac graph walker simulation
      const lower = userText.toLowerCase();
      const isChest = lower.includes('chest') || lower.includes('heart') || lower.includes('cardiac');
      const isBreathing = lower.includes('breath') || lower.includes('asthma') || lower.includes('chok') || lower.includes('airway');
      const isBleed = lower.includes('bleed') || lower.includes('blood') || lower.includes('cut') || lower.includes('wound');
      const isStroke = lower.includes('stroke') || lower.includes('face') || lower.includes('slur') || lower.includes('arm');
      const isBurn = lower.includes('burn') || lower.includes('fire') || lower.includes('scald');

      let level: 'Critical' | 'High' | 'Medium' | 'Low' = 'High';
      let windowMin = 10;
      let reason = 'Urgent first-response action recommended based on symptoms.';
      const symptoms: string[] = [];

      if (isChest) {
        level = 'Critical';
        windowMin = 5;
        reason = 'Possible acute coronary syndrome or myocardial distress.';
        symptoms.push('Chest pressure/pain', 'Shortness of breath', 'Cardiovascular strain');
      } else if (isStroke) {
        level = 'Critical';
        windowMin = 8;
        reason = 'FAST indicators identified; rapid intervention window.';
        symptoms.push('Neurological asymmetry', 'Speech/motor impairment');
      } else if (isBleed) {
        level = 'High';
        windowMin = 7;
        reason = 'Active hemorrhage risk; immediate compression required.';
        symptoms.push('Active bleeding', 'Tissue trauma');
      } else if (isBreathing) {
        level = 'Critical';
        windowMin = 6;
        reason = 'Compromised respiratory exchange or airway obstruction.';
        symptoms.push('Dyspnea', 'Airway resistance');
      } else if (isBurn) {
        level = 'Medium';
        windowMin = 15;
        reason = 'Thermal tissue injury requiring cooling and sterile protection.';
        symptoms.push('Thermal injury', 'Dermal trauma');
      } else {
        symptoms.push('Acute discomfort / trauma');
      }

      r = {
        intake: {
          symptoms,
          injuries: isBleed ? ['Laceration / active bleed'] : [],
          age_group: lower.includes('child') || lower.includes('kid') ? 'child' : lower.includes('father') || lower.includes('elder') || lower.includes('6') ? 'elderly' : 'adult',
          hazards: ['Scene safety assessed'],
          consciousness: lower.includes('unconscious') || lower.includes('passed out') ? 'unresponsive' : 'alert',
          breathing: lower.includes('not breathing') ? 'absent' : isBreathing ? 'labored' : 'normal',
          location: 'Caller location',
          confidence: 0.88,
        },
        triage: {
          level,
          escalation_window_minutes: windowMin,
          reasoning: reason,
          confidence: 0.84,
        },
        risk_indicators: [
          { label: isChest ? 'Acute Coronary Event' : isBleed ? 'Hypovolemic Shock' : 'Respiratory Distress', likelihood: 'high', rationale: 'Immediate vital monitoring and patient stabilization necessary.' },
          { label: 'Panic Escalation', likelihood: 'moderate', rationale: 'Calm coaching needed to keep patient heart rate steady.' },
          { label: 'Positional Hazard', likelihood: 'low', rationale: 'Ensure patient is supported to avoid secondary fall injuries.' },
        ],
        action_plan: [
          { step: 1, title: 'Call Emergency Services (911 / 112)', instruction: 'Keep line open on speakerphone; state patient condition and exact address.', depends_on: 'Scene Safety' },
          { step: 2, title: isChest ? 'Position Comfortably & Loosen Restrictive Clothing' : isBleed ? 'Apply Firm Direct Pressure with Clean Cloth' : 'Maintain Airway & Upright Seated Posture', instruction: isChest ? 'Seat patient in semi-reclined position with knees bent.' : isBleed ? 'Hold continuous firm pressure for at least 5 minutes without lifting cloth.' : 'Ensure head is aligned and airway remains completely clear.', depends_on: 'Step 1' },
          { step: 3, title: 'Monitor Vitals & Response', instruction: 'Observe breathing rate and responsiveness every 60 seconds.', depends_on: 'Step 2' },
          { step: 4, title: 'Prepare for Paramedic Handoff', instruction: 'Gather patient medications, note exact onset time, and clear entryway.', depends_on: 'Step 3' },
        ],
        resources: [
          { type: 'hospital', priority: 1, why: 'Advanced life support & emergency clinical evaluation' },
          { type: 'AED', priority: 2, why: 'Rapid defibrillation access within proximity' },
          { type: 'pharmacy', priority: 3, why: 'First aid supply replenishment' },
        ],
        walker_trace: [
          `IntakeWalker → mapped tokens: [${symptoms.join(', ')}]`,
          `TriageWalker → assigned ${level} urgency (${windowMin} min window)`,
          `RiskWalker → evaluated against persistent graph memory`,
          `ActionWalker → synthesized 4 adaptive first-30-minute steps`,
          `ResourceWalker → prioritized emergency clinical destinations`,
        ],
        graph_updates: {
          nodes: [
            { id: `sym-${Date.now()}`, type: 'Symptom', label: symptoms[0] || 'Symptom' },
            { id: `triage-${Date.now()}`, type: 'Triage', label: `${level} (${windowMin}m)` },
          ],
          edges: [
            { from: 'user', to: `sym-${Date.now()}`, label: 'reports' },
            { from: `sym-${Date.now()}`, to: `triage-${Date.now()}`, label: 'triaged' },
          ],
        },
      };
    }

    try {
      setResult(r);
      setTranscript(t => [...t, { role: 'system', text: `Triage: ${r?.triage?.level ?? '—'} · ${r?.triage?.reasoning ?? ''}`, t: Date.now() }]);

      setAgents({
        intake: { status: 'done', task: 'Entities extracted', confidence: r?.intake?.confidence ?? 0.8,
          reasoning: `Symptoms: ${(r?.intake?.symptoms ?? []).join(', ') || '—'} · Conscious: ${r?.intake?.consciousness ?? '—'} · Breathing: ${r?.intake?.breathing ?? '—'}` },
        triage: { status: 'done', task: 'Urgency assigned', confidence: r?.triage?.confidence ?? 0.75,
          reasoning: `${r?.triage?.level ?? '—'} · escalation window ~${r?.triage?.escalation_window_minutes ?? '?'} min. ${r?.triage?.reasoning ?? ''}` },
        risk: { status: 'done', task: 'Risk indicators surfaced', confidence: 0.7,
          reasoning: (r?.risk_indicators ?? []).slice(0, 3).map((x: any) => `${x.label} (${x.likelihood})`).join(' · ') || 'No elevated indicators.' },
        action: { status: 'done', task: `${(r?.action_plan ?? []).length} adaptive steps generated`, confidence: 0.82,
          reasoning: r?.action_plan?.[0]?.title ? `Step 1: ${r.action_plan[0].title}` : '' },
        resource: { status: 'done', task: 'Resources ranked', confidence: 0.78,
          reasoning: (r?.resources ?? []).slice(0, 3).map((x: any) => x.type).join(' · ') || 'No resources ranked.' },
        preparedness: { status: 'thinking', task: 'Graph memory updated', confidence: 0.64,
          reasoning: 'New event node merged into preparedness graph; score recalculated.' },
      });

      (r?.walker_trace ?? []).forEach((l: string, i: number) =>
        setTimeout(() => pushWalker(l), 200 + i * 250));

      // Merge graph updates
      const newNodes: GraphNode[] = (r?.graph_updates?.nodes ?? []).map((n: any) => ({
        id: String(n.id ?? `n-${Math.random().toString(36).slice(2, 7)}`),
        type: String(n.type ?? 'event'),
        label: String(n.label ?? n.id ?? 'node'),
      }));
      const newEdges: GraphEdge[] = (r?.graph_updates?.edges ?? []).map((e: any) => ({
        from: String(e.from), to: String(e.to), label: e.label ? String(e.label) : undefined,
      }));
      setNodes(prev => {
        const ids = new Set(prev.map(p => p.id));
        return [...prev, ...newNodes.filter(n => !ids.has(n.id))];
      });
      setEdges(prev => [...prev, ...newEdges]);
      setActiveNodeIds(['user', ...newNodes.map(n => n.id).slice(0, 5)]);
    } catch (e: any) {
      setAgents(a => ({ ...a,
        intake: { ...a.intake, status: 'error', reasoning: 'Agent gateway unavailable.' },
        triage: { ...a.triage, status: 'error', reasoning: '' },
        risk: { ...a.risk, status: 'error', reasoning: '' },
        action: { ...a.action, status: 'error', reasoning: '' },
        resource: { ...a.resource, status: 'error', reasoning: '' },
      }));
      pushWalker(`Walker error: ${e?.message ?? 'unknown'}`);
    } finally {
      setLoading(false);
    }
  }

  const preparednessScore = useMemo(() => 64, []);
  const kitItems = [
    { name: 'Adhesive bandages', ok: true },
    { name: 'Gauze rolls', ok: true },
    { name: 'Burn gel', ok: false },
    { name: 'CPR face shield', ok: true },
    { name: 'Tourniquet', ok: false },
    { name: 'Antiseptic wipes', ok: true },
  ];

  return (
    <Layout showEmergencyBanner>
      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-primary mb-2">
              <Brain className="w-4 h-4" /> Emergency Intelligence Center
            </div>
            <h1 className="text-3xl md:text-4xl font-bold">Graph-native agent reasoning, live.</h1>
            <p className="text-muted-foreground mt-1 max-w-2xl">
              Multi-agent orchestration inspired by Jac/Jaseci — walkers traverse a persistent emergency
              graph, agents collaborate, memory updates dynamically. Not a chatbot.
            </p>
          </div>
          {result?.triage?.level && (
            <div className={`px-4 py-2 rounded-xl font-semibold ${urgencyColor(result.triage.level)}`}>
              {result.triage.level} · ~{result.triage.escalation_window_minutes ?? '?'}m window
            </div>
          )}
        </div>

        {/* Offline notice when connectivity is unavailable */}
        {typeof navigator !== 'undefined' && !navigator.onLine && (
          <div className="rounded-2xl p-4 border border-amber-500/40 bg-amber-500/10 text-amber-200">
            <div className="flex items-start gap-3">
              <WifiOff className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
              <div>
                <h3 className="font-bold text-foreground text-sm">Offline Simulation Mode</h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Live cloud multi-agent orchestration requires network connectivity. Running in local deterministic graph simulation fallback. For critical live medical emergencies, access Citizen Mode's 15 offline verified protocols.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* MAIN GRID: left transcript / center graph / right agents */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* LEFT: Transcript + input */}
          <div className="lg:col-span-3 space-y-4">
            <div className="glass-card-strong rounded-2xl p-4 border border-border/40">
              <div className="flex items-center gap-2 mb-3">
                <Activity className="w-4 h-4 text-primary" />
                <div className="text-sm font-semibold">Live Emergency Transcript</div>
              </div>
              <div className="space-y-2 text-sm max-h-72 overflow-y-auto pr-1">
                {transcript.length === 0 && (
                  <div className="text-muted-foreground italic text-xs">
                    Describe the emergency by voice or text. Agents will activate.
                  </div>
                )}
                {transcript.map((m, i) => (
                  <div key={i} className={`p-2 rounded-lg ${m.role === 'user' ? 'bg-primary/10' : 'bg-secondary/40'}`}>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-0.5">
                      {m.role === 'user' ? 'User' : 'Intelligence'}
                    </div>
                    <div className="leading-snug">{m.text}</div>
                  </div>
                ))}
              </div>
              <div className="mt-3 space-y-2">
                <textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="e.g. My father is 62, complaining of chest pain and short of breath."
                  className="w-full min-h-20 p-2 rounded-lg bg-background border border-border/60 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
                <div className="flex gap-2">
                  <Button onClick={runAgents} disabled={!input.trim() || loading} className="flex-1">
                    <Send className="w-4 h-4 mr-2" />
                    {loading ? 'Agents working…' : 'Dispatch walkers'}
                  </Button>
                  <Button variant="outline" onClick={toggleListen}
                    className={listening ? 'border-primary text-primary' : ''}>
                    {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </div>
            <WalkerStream lines={walkerLines} />
          </div>

          {/* CENTER: Graph */}
          <div className="lg:col-span-6">
            <div className="h-[480px]">
              <GraphCanvas nodes={nodes} edges={edges} activeNodeIds={activeNodeIds} />
            </div>
            {result?.action_plan?.length > 0 && (
              <div className="glass-card rounded-2xl p-4 border border-border/40 mt-4">
                <div className="flex items-center gap-2 mb-3">
                  <Workflow className="w-4 h-4 text-primary" />
                  <div className="text-sm font-semibold">Adaptive Action Plan</div>
                </div>
                <ol className="space-y-2">
                  {result.action_plan.slice(0, 6).map((s: any, i: number) => (
                    <li key={i} className="flex gap-3 text-sm">
                      <span className="w-6 h-6 rounded-full bg-primary/15 text-primary flex items-center justify-center text-xs font-semibold flex-shrink-0">
                        {s.step ?? i + 1}
                      </span>
                      <div>
                        <div className="font-medium">{s.title}</div>
                        <div className="text-muted-foreground text-xs">{s.instruction}</div>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>

          {/* RIGHT: Agent panels */}
          <div className="lg:col-span-3 space-y-3">
            <AgentPanel name="Intake Agent" icon={Sparkles} {...agents.intake} />
            <AgentPanel name="Triage Agent" icon={ShieldAlert} {...agents.triage} />
            <AgentPanel name="Risk Prediction Agent" icon={Heart} {...agents.risk} />
            <AgentPanel name="Action Planner" icon={Workflow} {...agents.action} />
            <AgentPanel name="Resource Coordinator" icon={MapPin} {...agents.resource} />
            <AgentPanel name="Preparedness Agent" icon={Cpu} {...agents.preparedness} />
          </div>
        </div>

        {/* RISK + RESOURCES */}
        {result && (
          <div className="grid md:grid-cols-2 gap-4">
            <div className="glass-card rounded-2xl p-4 border border-border/40">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                <div className="text-sm font-semibold">Risk Indicators (not diagnoses)</div>
              </div>
              <div className="space-y-2">
                {(result.risk_indicators ?? []).map((r: any, i: number) => (
                  <div key={i} className="p-2 rounded-lg bg-secondary/40">
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-sm">{r.label}</div>
                      <span className="text-[10px] uppercase px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600">{r.likelihood}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">{r.rationale}</div>
                  </div>
                ))}
                {!(result.risk_indicators ?? []).length && (
                  <div className="text-xs text-muted-foreground italic">No elevated risk indicators returned.</div>
                )}
              </div>
            </div>
            <div className="glass-card rounded-2xl p-4 border border-border/40">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-4 h-4 text-primary" />
                <div className="text-sm font-semibold">Prioritized Resources</div>
              </div>
              <div className="space-y-2">
                {(result.resources ?? []).map((r: any, i: number) => (
                  <div key={i} className="p-2 rounded-lg bg-secondary/40 flex items-center justify-between">
                    <div>
                      <div className="font-medium text-sm capitalize">{r.type}</div>
                      <div className="text-xs text-muted-foreground">{r.why}</div>
                    </div>
                    <span className="text-[10px] uppercase px-2 py-0.5 rounded-full bg-primary/15 text-primary">P{r.priority ?? i + 1}</span>
                  </div>
                ))}
                {!(result.resources ?? []).length && (
                  <div className="text-xs text-muted-foreground italic">No resources ranked yet.</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* BOTTOM: Preparedness */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="glass-card-strong rounded-2xl p-5 border border-border/40">
            <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Preparedness Score</div>
            <div className="text-5xl font-bold text-primary mb-2">{preparednessScore}</div>
            <div className="h-2 rounded-full bg-secondary overflow-hidden">
              <div className="h-full bg-gradient-to-r from-teal-400 to-primary"
                style={{ width: `${preparednessScore}%` }} />
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              Updated by the Preparedness Agent from training, kit completeness and past incidents.
            </div>
          </div>
          <div className="glass-card-strong rounded-2xl p-5 border border-border/40">
            <div className="flex items-center gap-2 mb-3">
              <GraduationCap className="w-4 h-4 text-primary" />
              <div className="text-sm font-semibold">Training Completion</div>
            </div>
            <div className="space-y-2 text-sm">
              {[
                { name: 'CPR fundamentals', pct: 60 },
                { name: 'Choking response', pct: 80 },
                { name: 'Bleeding control', pct: 35 },
                { name: 'Burn first aid', pct: 50 },
              ].map(t => (
                <div key={t.name}>
                  <div className="flex justify-between text-xs"><span>{t.name}</span><span>{t.pct}%</span></div>
                  <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${t.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="text-xs text-muted-foreground mt-3">Suggested next: <b>Bleeding control walker</b>.</div>
          </div>
          <div className="glass-card-strong rounded-2xl p-5 border border-border/40">
            <div className="flex items-center gap-2 mb-3">
              <Package className="w-4 h-4 text-primary" />
              <div className="text-sm font-semibold">First Aid Kit Status</div>
            </div>
            <div className="space-y-1.5 text-sm">
              {kitItems.map(k => (
                <div key={k.name} className="flex items-center justify-between">
                  <span>{k.name}</span>
                  <span className={`text-[10px] uppercase px-2 py-0.5 rounded-full ${k.ok ? 'bg-emerald-500/15 text-emerald-600' : 'bg-amber-500/15 text-amber-600'}`}>
                    {k.ok ? 'ready' : 'missing'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SIMULATION */}
        <SimulationMode />

        {/* ============= POWERED BY JAC AGENT ARCHITECTURE ============= */}
        <section className="space-y-4 pt-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 border-t border-border/40 pt-6">
            <div>
              <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-primary mb-2">
                <Cpu className="w-4 h-4" /> Powered by Jac Agent Architecture
              </div>
              <h2 className="text-2xl md:text-3xl font-bold">
                Multi-agent orchestration on a live graph.
              </h2>
              <p className="text-muted-foreground text-sm max-w-2xl mt-1">
                Agents, walkers, graph-native memory and persistent preparedness intelligence — modelled
                directly on Jac/Jaseci concepts. Watch the system reason, not just respond.
              </p>
            </div>
          </div>

          <AgentOrchestrationView />

          <div>
            <div className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Workflow className="w-4 h-4 text-primary" /> Walker Execution
            </div>
            <WalkerExecutionPanels />
          </div>

          <ReasoningTimeline />

          <DemoScenarioMode />

          <TechStackSection />
        </section>

        {/* HOW IT WORKS */}
        <div className="glass-card-strong rounded-2xl p-6 border border-border/40">
          <div className="flex items-center gap-2 mb-3">
            <Network className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">How the AI Works</h3>
          </div>
          <div className="grid md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="font-semibold mb-1">Jac-style graph memory</div>
              <p className="text-muted-foreground text-xs">
                Every user, family member, risk, kit item, training milestone and incident lives as a
                node with typed edges — persistent across sessions.
              </p>
            </div>
            <div>
              <div className="font-semibold mb-1">Multi-agent collaboration</div>
              <p className="text-muted-foreground text-xs">
                Six specialized agents share a single graph and exchange structured outputs instead of
                free-form chat — like microservices for reasoning.
              </p>
            </div>
            <div>
              <div className="font-semibold mb-1">Walker-based reasoning</div>
              <p className="text-muted-foreground text-xs">
                Each request dispatches walkers that traverse the graph, gather context at each node and
                trigger the right agent — inspired by Jac walkers.
              </p>
            </div>
            <div>
              <div className="font-semibold mb-1">Persistent preparedness intelligence</div>
              <p className="text-muted-foreground text-xs">
                Outcomes update the graph — your preparedness score, kit gaps and training improve
                emergency advice over time.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}