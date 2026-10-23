# First30.ai — Release Smoke-Test & Clinical Governance Checklist

**Version:** 1.0.0-rc1  
**Target Environment:** Web PWA (Desktop, iOS Safari, Android Chrome)  
**Governance Status:** Technical Architecture Verified · Clinical Safety Audit Cataloged · Pediatric Presets Deferred Pending Independent Review  

---

## 1. User Journey: Emergency Guidance (Citizen Mode)

| Test Item | Verification Method | Status | Notes / Limitations |
| :--- | :--- | :--- | :--- |
| **All 15 Protocols Reachable** | Automated route alias test & category audit | **Pass** | Verified all 15 categories load valid steps and instructions without 404 or dead-end screens. |
| **Poisoning Route Alias** | Navigate `/emergency/poisoning` vs `/emergency/poison` | **Pass** | Normalizer in `getEmergencyFlowById` ensures both resolve cleanly to `poison`. |
| **Initial Assessment Questions** | Complete assessment questions in flow | **Pass** | Answers map directly to `symptom_reported` timeline events with `bystander_reported` provenance. |
| **Step Navigation (Next/Back)** | Step through instructions via Done/Previous | **Pass** | Displaying an instruction is recorded as `instruction_presented` (app); confirming Done records `action_confirmed`. |
| **Skip Step (`Can't do this`)** | Click `Can't do this` | **Pass** | Records `observation_recorded` ("Bystander skipped step") without fabricating completed action. |
| **Emergency Telephone Dialer** | Click `Call Emergency` (`tel:911`) | **Pass** | Opens device dialer. App explicitly records that call answer/connection status is unverified. |
| **Essential Steps Offline Availability** | Load cached protocol without internet | **Pass** | Guidance text and SVGs bundled in local app bundle; zero network dependency during emergency. |
| **Physical Action Execution** | Physical bystander technique | **Needs Clinical / Field Review** | Software cannot verify user hand placement, compression force, or wound dressing firmness. |

---

## 2. User Journey: CPR Precision Mode

| Test Item | Verification Method | Status | Notes / Limitations |
| :--- | :--- | :--- | :--- |
| **Default Target Cadence** | Web Audio look-ahead scheduler | **Pass** | Configured for 110 BPM (clamped within AHA/ERC safe range 90–130 BPM). |
| **30:2 Cadence Cycle Counter** | 30 compressions followed by 2 breath chimes | **Pass** | Dual-tone sound design (800 Hz woodblock click for compressions, 400 Hz chime for rescue breaths). |
| **2-Minute Rescuer Swap Alert** | Elapsed time interval check | **Pass** | Prompts bystander to swap rescuers at 2 minutes to prevent compression fatigue. |
| **Screen Wake Lock Acquisition** | `useScreenWakeLock` hook on active session | **Pass** | Acquires sentinel on mount; reacquires on `visibilitychange` foreground return. |
| **Wake Lock Unsupported Fallback** | Test in browser without Wake Lock API | **Pass** | Displays `Screen may sleep` status indicator in focused safety header. |
| **Voice Narration Audio Ducking** | Trigger voice coaching while CPR metronome is running | **Pass** | Metronome smoothly ducks to 30% volume during spoken instruction and ramps back to 100%. |
| **Incoming Phone Call / Audio Interruption** | Simulate OS audio interruption / backgrounding | **Needs Manual Device Testing** | When OS interrupts Web Audio, session freezes and displays "Resume CPR" control; physical cellular interrupt requires real device. |
| **Adult Protocol Scope Labeling** | Inspect CPR header and checklist | **Pass** | Prominently displays `Adult Protocol (AHA / ERC Layperson)`. |
| **Pediatric CPR Preset Exclusion** | Inspect code and clinical limitations | **Needs Clinical Review** | Pediatric/infant presets excluded pending qualified clinical review of 15:2 ratio and compression depths. |

---

## 3. User Journey: Emergency Handoff & Data Provenance

| Test Item | Verification Method | Status | Notes / Limitations |
| :--- | :--- | :--- | :--- |
| **Data Provenance Separation** | Audit Handoff card and plain-text export | **Pass** | Explicitly separates `Reported by bystander`, `Confirmed by user`, and `Recorded by First30.ai`. |
| **No Inferred Actions** | Advance steps without clicking Done | **Pass** | Displaying an instruction is never counted as an action taken. |
| **Explicit Unknowns Maintained** | Inspect condition fields when unassessed | **Pass** | Displays `Not assessed` or `Unknown / Not provided`; never invents vital signs or symptoms. |
| **No Backfilled Timestamps** | Audit timeline event creation | **Pass** | Timestamps recorded only at actual moment of user action or timer event. |
| **Duplicate Event Suppression** | Simulate rapid React re-renders | **Pass** | Suppresses duplicate events within 500ms window of same type and description. |
| **Edit Handoff Details** | Open `EditHandoffModal` and update observations | **Pass** | Allows bystander to add/correct notes, allergies, responsiveness, and breathing status. |
| **Copy Summary to Clipboard** | Click `Copy` button | **Pass** | Copies formatted plain-text handoff with provenance headers; shows Sonner feedback toast. |
| **Native Web Share API** | Click `Share` button on mobile browser | **Needs Manual Device Testing** | Uses `navigator.share` where supported; gracefully falls back to clipboard copy. |
| **Print / Save as PDF** | Click `Print / PDF` button | **Pass** | Uses browser-native `window.print()` with `@media print` clean layout and print-specific disclaimer header. |
| **Clear Current Session Data** | Confirm clear dialog | **Pass** | Wipes active session from `sessionStorage` and RAM, confirming zero retention on device. |

---

## 4. User Journey: Privacy & In-Memory Session Behavior

| Test Item | Verification Method | Status | Notes / Limitations |
| :--- | :--- | :--- | :--- |
| **Zero Cloud Transmission** | Network monitor during emergency guidance & handoff | **Pass** | Zero outbound requests sent to external servers during triage, CPR, or summary generation. |
| **No Sensitive Data in PWA Cache** | Inspect Workbox cache manifest | **Pass** | Workbox caches only static static bundle assets (`.js`, `.css`, `.svg`, `.webmanifest`). |
| **No Incident Data in URLs** | Inspect browser navigation history | **Pass** | Route paths use only category IDs (`/emergency/bleeding`, `/cpr`, `/summary`); no clinical data in query strings. |
| **No Console Logging of Patient Data** | Code audit of logging statements | **Pass** | Patient observations and notes are never logged to `console.log`. |
| **Ephemeral Session Reset on Reload** | Refresh browser window | **Pass** | Stored in volatile `sessionStorage`/RAM. Reloading or closing the tab cleanly discards session data. |

---

## 5. User Journey: Offline PWA Operation

| Test Item | Verification Method | Status | Notes / Limitations |
| :--- | :--- | :--- | :--- |
| **Web App Manifest Verification** | Inspect `dist/manifest.webmanifest` | **Pass** | Contains `name`, `short_name`, `theme_color`, `start_url`, and icons (192, 512, maskable). |
| **Service Worker Registration** | Inspect `src/main.tsx` | **Pass** | Registered via `virtual:pwa-register` with `immediate: true` and background update hooks. |
| **Precache Asset Count** | Inspect Vite build log | **Pass** | 23 critical bundle entries precached (1,722 KiB). |
| **Offline Route Navigation** | Disconnect network and load `/cpr` or `/emergency/burns` | **Pass** | Workbox `navigateFallback: '/index.html'` serves cached SPA shell and local protocol data. |
| **Offline Diagnostic Indicator** | Toggle browser offline mode | **Pass** | Offline badge informs user that protocols are running from local device cache. |
| **Nearby Facilities Offline State** | Open `/map` while offline | **Pass** | Map clearly states live GPS search and external routing require active network connectivity. |
| **Service Worker Background Updates** | Publish app update | **Pass** | Updates cache in background without interrupting active guidance or CPR audio. |

---

## 6. User Journey: Voice & AI Graceful Fallbacks

| Test Item | Verification Method | Status | Notes / Limitations |
| :--- | :--- | :--- | :--- |
| **Web Speech API Local Synthesis** | Test text-to-speech without network | **Pass** | Falls back cleanly to local browser `window.speechSynthesis`; skips remote API calls. |
| **Microphone Permission Denied** | Deny browser microphone prompt in Voice Assistant | **Pass** | Displays calm permission notice and immediately provides text input fallback. |
| **Speech Recognition Unsupported** | Test in browser without `webkitSpeechRecognition` | **Pass** | Shows keyboard text intake interface without blocking access to triage flows. |
| **Emergency Intelligence Simulation** | Inspect Intelligence Center | **Pass** | Clearly identifies simulated offline AI agent triage; does not claim live cloud dispatch connectivity. |
| **No External API Keys in Bundle** | Audit bundle strings and `.env.example` | **Pass** | Zero third-party API keys or secrets bundled in client code. |

---

## 7. Medical-Content & Clinical Governance Review Catalog

| Item | Location in Code | Current Text / Configuration | Clinical Review Requirement | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Aspirin in Chest Pain** | `src/data/emergencyFlows.ts` (`chest-5`) | *"If NOT allergic and no bleeding problems, give one aspirin (325mg) to chew. Warning: Skip if allergic or on blood thinners."* | Regional clinical dosage variation (e.g., US AHA 325mg chewable vs UK NHS 300mg dispersible vs EU 150–300mg). Requires local medical director authorization before public deployment in specific jurisdictions. | **Needs Clinical Review** |
| **CPR Protocol Scope** | `src/pages/CPRMode.tsx` | *110 BPM, 30:2 ratio, Adult protocol notice* | Verified against AHA/ERC layperson guidelines for adults. Pediatric and infant CPR must remain separate and undergo pediatric emergency medicine review before addition. | **Needs Clinical Review** |
| **Choking Back Blows & Thrusts** | `src/data/emergencyFlows.ts` (`choking-3`, `choking-4`) | *5 back blows alternating with 5 abdominal thrusts (Heimlich)* | Verified against Red Cross & AHA adult choking protocols. Notice included for infant chest thrusts with 2 fingers. | **Pass (Layperson Standard)** |
| **Severe Bleeding Direct Pressure** | `src/data/emergencyFlows.ts` (`bleeding-3`, `bleeding-4`) | *Firm continuous pressure with clean cloth for 10–15 min; do not remove soaked layers* | Verified against Stop the Bleed guidelines. Tourniquet guidance deferred to trained responders. | **Pass (Layperson Standard)** |
| **Burn Cooling Duration** | `src/data/emergencyFlows.ts` (`burns-2`) | *Cool running water for 10–20 minutes; avoid ice or butter* | Verified against international burn first aid consensus. | **Pass (Layperson Standard)** |
| **Seizure Non-Restraint** | `src/data/emergencyFlows.ts` (`seizure-2`, `seizure-4`) | *Do not restrain; do not put anything in mouth; protect head; recovery position after* | Verified against Epilepsy Foundation safety guidelines. | **Pass (Layperson Standard)** |

---

## 8. Release Decision & Sign-off

| Milestone | Target | Actual | Decision |
| :--- | :--- | :--- | :--- |
| **Unit Test Suite** | 100% Pass | 25 / 25 Passing | **Approved** |
| **ESLint Static Analysis** | 0 Errors | 0 Errors | **Approved** |
| **Production Build** | Clean bundle generation | Vite built in ~10s, 23 precache entries | **Approved** |
| **Technical Architecture** | Complete Phases 1–5 | Full provenance, wake lock, PWA, print export | **Approved for Limited Pilot** |
| **Full Public Unrestricted Launch** | Requires Clinical Governance | Regional clinical director sign-off pending | **Hold for Medical Director Sign-off** |
