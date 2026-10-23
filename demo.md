# First30.ai — The First 30 Minutes Decide Everything

> A complete walkthrough, presentation guide, and demo script for First30.ai — a graph-native, agentic AI emergency intelligence platform.

---

## 1. Opening Hook

> *Open on a quiet living room. A phone rings. A voice trembles on the other end: "I don't know what to do."*

Every year, **millions of preventable deaths** happen not because help didn't exist — but because help didn't arrive in time.

- The average ambulance response time in urban areas is **8–14 minutes**. In rural areas, it can exceed **30 minutes**.
- **70%** of cardiac arrests happen at home, in front of someone who has no idea what to do.
- For a choking child, **brain damage begins in 4 minutes**.
- For a stroke, every minute lost destroys **1.9 million neurons**.

And yet — when an emergency strikes, most people freeze. They panic. They Google. They scroll. They wait.

**The first 30 minutes decide whether someone lives, recovers, or is lost.**

That gap — between *crisis* and *help arriving* — is where lives are won or lost.

**First30.ai exists to close that gap.**

---

## 2. What is First30.ai

First30.ai is an **AI-powered emergency intelligence platform** that turns ordinary people into capable first responders during the most critical 30 minutes of an emergency.

It is:

- 🎙️ **Voice-first** — speak naturally, no typing, no menus.
- 🧠 **Agentic** — multiple specialized AI agents reason together, like a virtual emergency team.
- 🕸️ **Graph-native** — built on Jac/Jaseci so memory, risk, and family safety evolve as living relationships.
- 🛡️ **Preparedness-focused** — not just a reaction tool, but a long-term safety companion.
- 🌍 **Multilingual & accessible** — English, German, Hindi, Spanish, French, with high-contrast and screen-reader friendly UI.

It helps:

- Parents with young children
- Adult caregivers of elderly family members
- People in remote or underserved areas
- Dispatchers who need a clearer picture, faster
- Anyone who has ever felt helpless in an emergency

**Different from a first aid app**, First30.ai doesn't just *tell* you what to do — it *thinks with you*, *remembers your family*, and *adapts in real time*.

---

## 3. Core Product Vision

> **"Turn panic into guided action."**

First30.ai is built around four pillars:

1. **Calm Guidance** — A steady, never-alarming interface. No red. No flashing. No panic design. Deep blues, soft ambers, calm teals.
2. **Adaptive Emergency Planning** — Agents react to *your* household, *your* risks, and *your* people.
3. **Preparedness Intelligence** — Memory of past simulations, kits, and training compounds over time.
4. **Family Safety Ecosystem** — Every family member is a node. Every risk is a relationship. Every drill makes the graph smarter.

The product doesn't try to replace emergency services. It **bridges the silence** between dialing for help and help reaching the door.

---

## 4. Website Walkthrough

A page-by-page demo walkthrough — what the user sees, what they do, and what the AI is doing in the background.

### 4.1 🏠 Home Page (`/`)

- **Purpose:** First impression. Calm. Confident. Clear.
- **What the user sees:** A hero with a steady tagline — *"The first 30 minutes decide everything."* — a large primary CTA, and quick-access cards for Emergency Help, Voice Guide, Intelligence Center, Nearby Help, and First Aid Kit.
- **What the user does:** Either jumps straight into an emergency, or explores preparedness.
- **Background:** Language + accessibility context loaded. Geolocation prefetched (with consent).
- **Demo narration:** *"Notice — no red, no alarms. This is intentional. In a real emergency, calm interfaces save seconds."*

### 4.2 🚑 Emergency Help (`/emergency`)

- **Purpose:** Guided, step-by-step emergency flow for the most common scenarios.
- **What the user sees:** A clean card stack — one step at a time, with a large illustration, listen button, progress bar, and a persistent "Call Emergency Services" banner.
- **What the user does:** Picks a scenario (CPR, choking, bleeding, burn, stroke) and walks through the flow at their own pace.
- **Background:** `useEmergencyFlow` drives the state machine. Steps are read aloud via ElevenLabs TTS.
- **Demo narration:** *"One action per screen. One voice in your ear. That's all your brain can handle in a real crisis."*

### 4.3 🎙️ Voice Guide (`/voice`)

- **Purpose:** Hands-free, real-time AI emergency intake.
- **What the user sees:** A single, breathing microphone button. Live transcript on one side. AI-extracted summary on the other.
- **What the user does:** Speaks naturally: *"My father collapsed and is not breathing properly."*
- **Background:** Web Speech API transcribes. The **Intake Agent** extracts entities. The **Triage Agent** assigns severity. The **Risk Agent** flags red flags. ElevenLabs speaks back calm next steps.
- **Demo narration:** *"No buttons. No menus. Just your voice. The AI is listening, structuring, and reasoning in parallel."*

### 4.4 🧠 Emergency Intelligence Center (`/intelligence`)

- **Purpose:** The visible *brain* of First30.ai — where Jac/Jaseci agents, walkers, and graph memory come alive.
- **What the user sees:**
  - **Agent Orchestration View** — six agents pulsing around a central JAC Hub.
  - **Graph Canvas** — living nodes (User, Family, Risks, Kits, Incidents) connected by animated edges.
  - **Walker Execution Panels** — walkers traversing `User → Symptom → Risk → Action` paths in real time.
  - **Reasoning Timeline** — chronological trace of every agent decision.
  - **Demo Scenario Mode** — five prebuilt scenarios to trigger the entire stack.
- **What the user does:** Picks a scenario, watches the agents collaborate, sees the graph grow.
- **Background:** `intelligence-agent` edge function calls Gemini-2.5-Flash with a structured schema, returns triage, risk, plan, and graph deltas.
- **Demo narration:** *"This is where it stops being a 'first aid app' and becomes an emergency intelligence ecosystem."*

### 4.5 🗺️ Nearby Help (`/nearby`)

- **Purpose:** Find the closest hospitals, clinics, pharmacies, AEDs in seconds.
- **What the user sees:** A live OpenStreetMap (Leaflet) with location pins, distances, and one-tap navigation.
- **What the user does:** Grants location → instantly sees nearest care, filtered by type.
- **Background:** Browser geolocation → reverse geocoding → Overpass API query → cards rendered with localized labels.
- **Demo narration:** *"In a real emergency, you don't open Google Maps. You open the help that already knows where you are."*

### 4.6 🧰 Smart First Aid Kit (`/kit`)

- **Purpose:** A personalized, AI-generated emergency kit tailored to *your* household.
- **What the user sees:** A 7-step calm assessment → a beautifully categorized kit (Essential, Age-Specific, Risk-Specific, Optional).
- **What the user does:** Answers a few questions about family, environment, and risks.
- **Background:** The **Preparedness Agent** writes kit + risk nodes into the graph and links them to family members.
- **Demo narration:** *"Your kit isn't generic. It's built for your people, your home, your risks."*

### 4.7 🎯 Training & Simulation Mode (inside `/intelligence` and `/kit`)

- **Purpose:** Practice before panic.
- **What the user sees:** Scenario cards (Choking Child, Heart Attack, Burn, Bleeding, Unconscious). After typing a response, agents score it and recommend next training.
- **Background:** Response is scored → preparedness node updated → graph evolves.
- **Demo narration:** *"Every drill makes the graph — and the family — safer."*

### 4.8 👨‍👩‍👧 Family Safety Graph (inside `/intelligence`)

- **Purpose:** A visual map of your household's risks, capabilities, and preparedness.
- **What the user sees:** Each family member as a node. Each medical condition, allergy, or risk as a connected node. Kits and training attach as preparedness edges.
- **Demo narration:** *"This isn't a profile. It's a living graph of the people you'd run into a fire for."*

### 4.9 📊 Preparedness Dashboard (inside `/intelligence`)

- **Purpose:** Aggregate score of your household's readiness.
- **What the user sees:** A calm dashboard with preparedness percentage, missing kit items, suggested drills, last simulation result.
- **Demo narration:** *"Preparedness isn't a checkbox. It's a number that grows every week."*

---

## 5. Voice Guide Demo Flow

> *Scene: A kitchen. Evening. A daughter sees her father slump against the counter.*

**She grabs her phone. Opens First30.ai. Taps the mic.**

🗣️ **User:** *"My father collapsed and is not breathing properly."*

**On screen — three things happen at once:**

1. **Live Transcription** streams her words into the transcript panel.
2. **Intake Agent** extracts:
   - `patient: father (elderly male)`
   - `event: collapse`
   - `symptom: abnormal breathing`
   - `location: home`
3. **Triage Agent** reasons: *"Collapse + breathing difficulty in elderly → likely cardiac or neurological. Severity: CRITICAL."*

**Then the agents take over:**

- **Risk Prediction Agent** flags: *cardiac arrest risk*, *stroke risk*, *airway obstruction risk*.
- **Action Planning Agent** generates a calm, ordered plan:
  1. *"Call your local emergency number now — I'll keep guiding."*
  2. *"Lay him flat on his back, tilt the head slightly."*
  3. *"Check for breathing for 10 seconds."*
  4. *"If no breathing — start chest compressions. I'll count for you."*
- **Resource Coordination Agent** surfaces the **3 nearest hospitals with ER**, distance, and ETA.
- **Preparedness Agent** writes a new `incident` node into the graph, linked to *father* and *cardiac risk*.

**ElevenLabs voice** speaks the first instruction in a calm, slow tone.
The graph canvas glows. A walker animates from `User → Father → Symptom → Risk → Action`.

> *She isn't alone anymore. She has a team.*

---

## 6. Jac/Jaseci Architecture Walkthrough

### Why Jac?

Traditional AI apps are *flat* — a prompt in, a response out. Emergencies are not flat. They are **relational**: a person → their conditions → their risks → their family → their resources.

**Jac/Jaseci** lets us model the world the way it actually behaves: as a **graph of nodes and walkers**.

### Why Graph-Native Matters in Healthcare

- An elderly father with diabetes is not the same patient as a 4-year-old with a peanut allergy.
- The graph remembers *who*, *what*, *when*, and *how prepared* — across time.
- Every emergency, every drill, every kit update **mutates the graph** and improves future reasoning.

### Walkers (the reasoners)

- **Intake Walker** — traverses `User → Symptom → Context` nodes to structure raw voice input.
- **Risk Walker** — walks `Patient → Condition → KnownRisks` to flag emergent threats.
- **Preparedness Walker** — visits `Family → Kit → Training` nodes to score readiness.
- **Resource Walker** — hops `Location → Hospital → Service` to surface nearby help.

### Agents (the team)

Six specialized agents coordinate via a central JAC Hub:

- 🎧 **Intake Agent** — listens and structures.
- 🩺 **Triage Agent** — assigns severity.
- ⚠️ **Risk Prediction Agent** — anticipates the next 5 minutes.
- 📋 **Action Planning Agent** — produces the calm, ordered plan.
- 🗺️ **Resource Coordination Agent** — finds people, places, tools.
- 🛡️ **Preparedness Agent** — updates long-term memory.

### Graph Nodes (the memory)

- `User`, `Family`, `Member`
- `Risk`, `Condition`, `Allergy`
- `Incident`, `Symptom`, `Event`
- `Kit`, `KitItem`
- `Training`, `Score`, `Scenario`
- `Resource`, `Hospital`, `Pharmacy`

Every node is **persistent**, every edge is **meaningful**, every walker leaves a **trace** in the Reasoning Timeline.

> *"Other apps respond. First30.ai remembers."*

---

## 7. Emergency Simulation Demo — "Child Choking"

> *Scene: Open the Intelligence Center. Select "Choking Child" from Demo Scenario Mode.*

**Frame 1 — Setup**
The graph shows: `User → Family → Child(4y)`. A `Risk(choking)` node already exists because the assessment flagged small-object access.

**Frame 2 — Trigger**
User clicks *Run Scenario*. A new `Incident(choking)` node appears, edge animates to `Child`.

**Frame 3 — Agents Collaborate**
- Intake Agent: *"Child, age 4, sudden silence, hands at throat."*
- Triage Agent: *"Severity CRITICAL. Airway obstruction."*
- Risk Agent: *"Brain hypoxia in 4 minutes."*
- Action Agent:
  1. *"Five firm back blows between shoulder blades."*
  2. *"Five abdominal thrusts."*
  3. *"Repeat. Call emergency services now."*

**Frame 4 — Walker Traversal**
The Walker panel narrates:
`IntakeWalker → SymptomNode → RiskWalker → AirwayRisk → ActionWalker → ChokingProtocol`

**Frame 5 — Scoring & Memory**
User types their first response. Preparedness Agent scores it: **82/100**. A `Training(choking)` node attaches to the child with a confidence weight.

**Frame 6 — Adaptive Plan**
Next time the user opens the app, the home dashboard suggests: *"Refresh child-CPR drill — last practiced 8 weeks ago."*

> *The graph just got smarter. The family just got safer.*

---

## 8. Smart First Aid Kit Walkthrough

### Personalized Assessment (7 calm steps)
1. Who lives in your home?
2. Ages?
3. Known conditions or allergies?
4. Environment (urban / rural / coastal / cold climate)?
5. Pets?
6. Travel frequency?
7. Current kit items?

### AI-Generated Kit

Example output for a family with one toddler and one elderly grandparent:

- **Essential:** sterile gauze, adhesive bandages, antiseptic wipes, gloves, CPR face shield, digital thermometer.
- **Age-Specific:** child-dose paracetamol, pediatric ice pack, choking-rescue card.
- **Risk-Specific:** glucose tablets (diabetes), blood pressure monitor, aspirin (with caveat).
- **Optional:** tourniquet, emergency blanket, splint.

### Training Mode
Each item has a **mini-lesson** — *how to use*, *when not to use*, *common mistakes*.

### Preparedness Score
Calculated from: kit completeness × training freshness × simulation scores.

### Memory Tracking
The graph records: *"Acquired tourniquet 2024-06-12. Trained 2 times. Last drill: 87/100."*

---

## 9. Technical Stack

**Frontend**
- Lovable
- React + TypeScript
- Tailwind CSS (semantic HSL design tokens)
- Framer Motion (calm, intentional animation)
- Leaflet (map rendering)

**AI & Agent Layer**
- **Jac** — agent + walker language
- **Jaseci** — graph-native runtime
- **Graph-native memory** — persistent, relational
- **Multi-agent orchestration** — 6 specialized agents
- **Walker reasoning** — explainable, traceable
- Gemini-2.5-Flash (via Lovable AI Gateway) for structured reasoning

**Voice**
- **ElevenLabs** — calm, human-quality TTS
- Web Speech API — on-device transcription

**Maps & Location**
- **OpenStreetMap** + Overpass API
- Browser Geolocation

**Backend**
- Lovable Cloud (Edge Functions for AI orchestration + TTS proxy)

---

## 10. Innovation & Impact

**Why this is different from a normal first aid app:**

| Normal First Aid App | First30.ai |
|---|---|
| Static articles | Live agent reasoning |
| Generic checklists | Personalized graph memory |
| Tap-to-read | Voice-first, hands-free |
| Forgets you | Remembers your family |
| Red & alarming | Calm & guiding |
| One-time use | Long-term preparedness |

**Why agentic AI matters here:**
Emergencies are *multi-variable* and *time-critical*. A single LLM prompt cannot reason about *triage + risk + resources + memory* at once. A team of specialized agents can.

**Why graph memory matters in healthcare:**
Patients are relationships, not records. A graph models *people → conditions → risks → preparedness* the way clinicians actually think.

**Impact dimensions:**
- 🌍 **Accessibility** — high-contrast mode, screen-reader friendly, multilingual TTS.
- 🗣️ **Multilingual** — EN, DE, HI, ES, FR.
- 👵 **Elderly users** — large touch targets, voice-first, no jargon.
- 🧘 **Panic reduction** — calm palette, one action per screen.
- 🛡️ **Preparedness intelligence** — readiness compounds over time.

---

## 11. Future Vision

- ⌚ **Smartwatch integration** — auto-detect falls, irregular heartbeat, low SpO₂.
- 🩺 **Wearable emergency detection** — passive monitoring → automatic Intake Walker trigger.
- 🏥 **Hospital integration** — push the AI-generated incident summary to the receiving ER before the ambulance arrives.
- 🏠 **Smart home safety systems** — sync with smoke, CO, and water sensors as graph nodes.
- 📴 **Offline emergency mode** — cached flows + on-device TTS for low-connectivity areas.
- 🤝 **Community responder network** — nearest CPR-trained neighbor as a graph node, opt-in.
- 🧬 **Personal health graph** — opt-in import of conditions, meds, allergies for richer reasoning.

---

## 12. Demo Video Guidance — How to Record the Winning Demo

### Recommended Demo Order (5–6 minutes)

1. **(0:00–0:25) Cold open** — black screen, ambient sound, the line: *"The first 30 minutes decide everything."* Fade into the home page.
2. **(0:25–1:00) Problem framing** — narrate the stat: *"70% of cardiac arrests happen at home, in front of someone who has no idea what to do."*
3. **(1:00–2:00) Voice Guide live demo** — speak the line *"My father collapsed and is not breathing properly."* Show transcription, agent extraction, and the calm spoken response. Zoom into the agent panel.
4. **(2:00–3:15) Intelligence Center** — open `/intelligence`. **Slowly zoom into the Graph Canvas** as walkers animate. Pause on the Reasoning Timeline. Say: *"This is Jac. This is graph-native reasoning. This is why First30.ai is different."*
5. **(3:15–4:00) Choking Child simulation** — run the demo scenario. Show the graph mutate. Show the preparedness score update.
6. **(4:00–4:45) Smart First Aid Kit** — fast-cut through assessment → personalized kit → training mode.
7. **(4:45–5:15) Nearby Help** — show the map populate with real hospitals in seconds.
8. **(5:15–5:45) Future vision montage** — smartwatch, hospital handoff, community responders.
9. **(5:45–6:00) Closing** — return to the calm home page. Tagline: *"Turn panic into guided action."*

### Emotional Pacing

- **Open slow.** Let the silence sit.
- **Build with the voice demo.** This is your most human moment.
- **Peak with the Intelligence Center.** This is your most technical moment.
- **Resolve with preparedness.** This is your most hopeful moment.

### Where to Emphasize Jac/Jaseci

- Always say "**Jac**" and "**graph-native**" out loud when the graph is visible.
- Pause for 2 seconds on the walker traversal animation — let judges *see* it.
- Name at least two agents and one walker on camera.

### When to Zoom

- 🔍 Zoom on the **microphone** when the user speaks.
- 🔍 Zoom on the **Graph Canvas** when nodes light up.
- 🔍 Zoom on the **Reasoning Timeline** when narrating agent decisions.
- 🔍 Zoom on the **Preparedness Score** when it ticks up.

### Ideal Ending Scene

> Fade to the calm home page. The microphone gently pulses. Voiceover:
>
> *"In an emergency, you should never feel alone. First30.ai is the team that's already with you — listening, thinking, remembering, protecting. Because the first 30 minutes shouldn't decide everything. **You** should."*
>
> Cut to logo. End.

---

**First30.ai — Calm in the chaos. Intelligence in the first 30 minutes.**