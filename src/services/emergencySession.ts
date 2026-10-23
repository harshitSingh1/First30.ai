import { EmergencySummaryData, CollectedInput, CPRSummaryData } from '@/types/emergency';

const STORAGE_KEY = 'first30_active_emergency_session';

/**
 * Safely parse JSON dates back into Date objects
 */
function deserializeSessionData(raw: any): EmergencySummaryData {
  return {
    ...raw,
    startTime: raw.startTime ? new Date(raw.startTime) : new Date(),
    endTime: raw.endTime ? new Date(raw.endTime) : new Date(),
    stepsCompleted: Array.isArray(raw.stepsCompleted) ? raw.stepsCompleted : [],
    stepsSkipped: Array.isArray(raw.stepsSkipped) ? raw.stepsSkipped : [],
    collectedInputs: Array.isArray(raw.collectedInputs) ? raw.collectedInputs : [],
    keyObservations: Array.isArray(raw.keyObservations) ? raw.keyObservations : [],
    actionsTaken: Array.isArray(raw.actionsTaken) ? raw.actionsTaken : [],
    criticalUnknowns: Array.isArray(raw.criticalUnknowns) ? raw.criticalUnknowns : [],
  };
}

/**
 * Save current emergency session to persistent browser storage.
 * Works 100% offline, privacy-safe on the local device.
 */
export function saveEmergencySession(data: EmergencySummaryData): void {
  try {
    const payload = JSON.stringify(data);
    localStorage.setItem(STORAGE_KEY, payload);
  } catch (err) {
    console.warn('Unable to persist emergency session to localStorage', err);
  }
}

/**
 * Load saved emergency session from browser storage if active.
 */
export function loadEmergencySession(): EmergencySummaryData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return deserializeSessionData(parsed);
  } catch (err) {
    console.warn('Failed to parse emergency session from localStorage', err);
    return null;
  }
}

/**
 * Completely wipe all session data, notes, and timers from local storage.
 */
export function clearEmergencySession(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.warn('Failed to clear emergency session', err);
  }
}

/**
 * Parse collected flow questions into structured clinical handoff fields
 */
export function extractClinicalFields(inputs: CollectedInput[] = []): {
  ageGroup?: string;
  consciousness?: 'alert' | 'verbal' | 'pain' | 'unresponsive' | 'unknown';
  breathing?: 'normal' | 'difficult' | 'none' | 'agonal' | 'unknown';
  bleeding?: 'none' | 'minor' | 'severe' | 'controlled' | 'unknown';
} {
  const result: ReturnType<typeof extractClinicalFields> = {};

  inputs.forEach((item) => {
    const q = item.question.toLowerCase();
    const a = item.answer.toLowerCase();

    // Age detection
    if (item.questionId.includes('age') || q.includes('age')) {
      if (a.includes('infant')) result.ageGroup = 'infant';
      else if (a.includes('child')) result.ageGroup = 'child';
      else if (a.includes('elderly')) result.ageGroup = 'elderly';
      else if (a.includes('adult')) result.ageGroup = 'adult';
      else result.ageGroup = item.answer;
    }

    // Consciousness detection
    if (q.includes('conscious') || q.includes('responding') || q.includes('wake')) {
      if (a === 'no' || a.includes('unconscious') || a.includes('not responding')) {
        result.consciousness = 'unresponsive';
      } else if (a === 'yes' || a.includes('alert') || a.includes('awake')) {
        result.consciousness = 'alert';
      } else if (a.includes('voice') || a.includes('drowsy')) {
        result.consciousness = 'verbal';
      } else if (a.includes('pain')) {
        result.consciousness = 'pain';
      } else {
        result.consciousness = 'unknown';
      }
    }

    // Breathing detection
    if (q.includes('breathing')) {
      if (a === 'no' || a.includes('not breathing') || a.includes('stopped')) {
        result.breathing = 'none';
      } else if (a.includes('agonal') || a.includes('gasping')) {
        result.breathing = 'agonal';
      } else if (a.includes('difficult') || a.includes('abnormal') || a.includes('struggling') || a.includes('wheezing')) {
        result.breathing = 'difficult';
      } else if (a.includes('normal') || a === 'yes') {
        result.breathing = 'normal';
      }
    }

    // Bleeding detection
    if (q.includes('bleeding')) {
      if (a.includes('severe') || a.includes('heavy') || a.includes('spurting')) {
        result.bleeding = 'severe';
      } else if (a.includes('controlled') || a.includes('stopped')) {
        result.bleeding = 'controlled';
      } else if (a.includes('minor') || a.includes('slight')) {
        result.bleeding = 'minor';
      } else if (a.includes('none') || a === 'no') {
        result.bleeding = 'none';
      }
    }
  });

  return result;
}

/**
 * Format time helper
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs} sec`;
  if (secs === 0) return `${mins} min`;
  return `${mins} min ${secs} sec`;
}

/**
 * Format standard MIST / SBAR Paramedic Handoff text
 * Ready for EMS radio, dispatch CAD, or paper clipboard copy
 */
export function formatParamedicHandoff(data: EmergencySummaryData): string {
  const startTime = data.startTime ? new Date(data.startTime) : new Date();
  const formatTime = (d: Date) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const formatDate = (d: Date) => d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });

  const consciousnessLabel = 
    data.consciousness === 'alert' ? 'Alert & oriented' :
    data.consciousness === 'verbal' ? 'Responds to Verbal stimuli' :
    data.consciousness === 'pain' ? 'Responds to Pain only' :
    data.consciousness === 'unresponsive' ? 'UNRESPONSIVE' : 'UNKNOWN / Not assessed';

  const breathingLabel =
    data.breathing === 'normal' ? 'Normal respiration' :
    data.breathing === 'difficult' ? 'Difficult / Labored breathing' :
    data.breathing === 'agonal' ? 'AGONAL / Gasping' :
    data.breathing === 'none' ? 'APNEIC (Not breathing)' : 'UNKNOWN / Not assessed';

  const bleedingLabel =
    data.bleeding === 'none' ? 'None observed' :
    data.bleeding === 'minor' ? 'Minor / Superficial' :
    data.bleeding === 'severe' ? 'SEVERE / Arterial or active heavy bleed' :
    data.bleeding === 'controlled' ? 'Bleeding controlled via direct pressure' : 'UNKNOWN / Not assessed';

  const ageLabel = data.ageGroup ? data.ageGroup.toUpperCase() : 'UNKNOWN';

  // Critical unknowns list
  const unknownsList = [
    data.timeOnsetKnown === false || !data.symptomOnset ? 'Exact symptom onset time: UNKNOWN' : null,
    data.allergies ? `Allergies: ${data.allergies}` : 'Allergies: UNKNOWN / Not verified',
    data.medications ? `Current medications: ${data.medications}` : 'Current medications: UNKNOWN / Not verified',
    data.medicalConditions ? `Past medical history: ${data.medicalConditions}` : 'Past medical history: UNKNOWN / Not verified',
    ...(data.criticalUnknowns || []),
  ].filter(Boolean);

  let cprSection = '';
  if (data.cprData && (data.cprData.compressions > 0 || data.cprData.durationSeconds > 0)) {
    cprSection = `
[CPR & RESUSCITATION METRICS]
• Total compressions delivered: ${data.cprData.compressions}
• Completed 30:2 cycles: ${data.cprData.cycles}
• Active CPR duration: ${formatDuration(data.cprData.durationSeconds)}
• AED applied: ${data.cprData.aedUsed ? data.cprData.aedUsed.toUpperCase() : 'UNKNOWN'}
${data.cprData.aedShocks ? `• AED shocks delivered: ${data.cprData.aedShocks}` : ''}`;
  }

  const observations = data.keyObservations?.length > 0
    ? data.keyObservations.map((o) => `• ${o}`).join('\n')
    : '• None recorded';

  const actions = data.actionsTaken?.length > 0
    ? data.actionsTaken.map((a) => `✓ ${a}`).join('\n')
    : '• None recorded';

  const skipped = data.stepsSkipped?.length > 0
    ? `\n[PROTOCOL STEPS SKIPPED]\n${data.stepsSkipped.map((s) => `⊘ ${s}`).join('\n')}`
    : '';

  const notes = data.bystanderNotes?.trim()
    ? `\n[BYSTANDER NOTES]\n${data.bystanderNotes.trim()}`
    : '';

  return `
═══════════════════════════════════════════════════════════════
        FIRST30.AI — PARAMEDIC EMERGENCY HANDOFF (MIST)
═══════════════════════════════════════════════════════════════

INCIDENT: ${data.category.toUpperCase()}
TRIAGE LEVEL: ${data.calculatedPriority} (${
    data.calculatedPriority === 'P1' ? 'CRITICAL / LIFE-THREATENING' :
    data.calculatedPriority === 'P2' ? 'URGENT' :
    data.calculatedPriority === 'P3' ? 'MODERATE' : 'LOW'
  })
DATE: ${formatDate(startTime)} | STARTED: ${formatTime(startTime)}
ACTIVE DURATION: ${formatDuration(data.duration)}
LOCATION: ${data.location || 'Not provided'}
APPROX AGE / GROUP: ${ageLabel}

───────────────────────────────────────────────────────────────
[PATIENT STATUS (AVPU / VITALS AT SCENE)]
• Consciousness: ${consciousnessLabel}
• Respiration:   ${breathingLabel}
• Bleeding:      ${bleedingLabel}
${data.symptomOnset ? `• Reported Onset: ${data.symptomOnset}` : ''}
${cprSection}
───────────────────────────────────────────────────────────────
[INTERVENTIONS & ACTIONS PERFORMED]
${actions}
${skipped}
───────────────────────────────────────────────────────────────
[KEY SCENE OBSERVATIONS]
${observations}

───────────────────────────────────────────────────────────────
[CRITICAL UNKNOWNS / NOT VERIFIED (DO NOT ASSUME NEGATIVE)]
${unknownsList.map((u) => `• ${u}`).join('\n')}
${notes}
───────────────────────────────────────────────────────────────
DISCLAIMER: Bystander-gathered observation aid for first responder
handoff. Not a formal physician diagnosis or clinical record.
First30.ai Emergency Response System
═══════════════════════════════════════════════════════════════`.trim();
}
