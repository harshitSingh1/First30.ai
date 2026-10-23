import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

const SYSTEM_PROMPT = `You are the Emergency Intelligence Center for First30.ai — a multi-agent reasoning system inspired by Jac/Jaseci graph-native AI.

You orchestrate FIVE collaborating agents over a single user input:
1. Intake Agent — extract entities
2. Triage Agent — assign urgency Critical/High/Medium/Low + escalation_window_minutes
3. Risk Prediction Agent — list possible RISK INDICATORS (not diagnoses)
4. Action Planning Agent — adaptive numbered first-30-minute steps
5. Resource Coordination Agent — types of nearby resources to prioritize

Also output:
- walker_trace: short narration lines describing walkers traversing graph nodes (User → Symptom → Risk etc.)
- graph_updates: new nodes/edges to merge into the persistent graph memory

Be calm, concise, non-panicking. NEVER diagnose. Always emphasize that risk indicators are NOT diagnoses and that professional help should be called.

Return ONLY valid JSON matching the requested schema.`;

const SCHEMA_HINT = `{
  "intake": {
    "symptoms": string[],
    "injuries": string[],
    "age_group": "infant"|"child"|"adult"|"elderly"|"unknown",
    "hazards": string[],
    "consciousness": "alert"|"drowsy"|"unresponsive"|"unknown",
    "breathing": "normal"|"labored"|"absent"|"unknown",
    "location": string,
    "confidence": number
  },
  "triage": {
    "level": "Critical"|"High"|"Medium"|"Low",
    "escalation_window_minutes": number,
    "reasoning": string,
    "confidence": number
  },
  "risk_indicators": [
    { "label": string, "likelihood": "low"|"moderate"|"elevated"|"high", "rationale": string }
  ],
  "action_plan": [
    { "step": number, "title": string, "instruction": string, "depends_on": string }
  ],
  "resources": [
    { "type": "hospital"|"pharmacy"|"AED"|"police"|"fire", "priority": number, "why": string }
  ],
  "walker_trace": string[],
  "graph_updates": {
    "nodes": [ { "id": string, "type": string, "label": string } ],
    "edges": [ { "from": string, "to": string, "label": string } ]
  }
}`;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: 'LOVABLE_API_KEY missing' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const { input, context } = await req.json();
    if (!input || typeof input !== 'string') {
      return new Response(JSON.stringify({ error: 'input required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userMsg = `EMERGENCY INPUT:\n"""${input}"""\n\nPERSISTENT GRAPH CONTEXT (Jac-style memory):\n${JSON.stringify(context ?? {}, null, 2)}\n\nReturn JSON ONLY matching this schema:\n${SCHEMA_HINT}`;

    const res = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userMsg },
        ],
        response_format: { type: 'json_object' },
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      return new Response(JSON.stringify({ error: 'AI gateway error', status: res.status, detail: text }), {
        status: res.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content ?? '{}';
    let parsed: unknown = {};
    try { parsed = JSON.parse(content); } catch { parsed = { raw: content }; }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});