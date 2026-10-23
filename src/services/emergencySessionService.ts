import {
  HandoffData,
  HandoffTimelineEvent,
  ConfirmedAction,
  EventSource,
  AssessmentStatus,
} from '@/types/emergencyHandoff';
import { EmergencySummaryData } from '@/types/emergency';

const SESSION_STORAGE_KEY = 'first30_active_emergency_session';

export function getActiveSession(): HandoffData | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as HandoffData;
  } catch (err) {
    console.warn('Failed to parse active emergency session from sessionStorage:', err);
    return null;
  }
}

export function saveActiveSession(session: HandoffData): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  } catch (err) {
    console.warn('Failed to save active emergency session:', err);
  }
}

export function clearActiveSession(): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
  } catch (err) {
    console.warn('Failed to clear active emergency session:', err);
  }
}

export function createDefaultSession(
  selectedGuidance: string,
  guidanceMode: string = 'Standard Protocol',
  returnUrl?: string
): HandoffData {
  const now = new Date();
  const nowIso = now.toISOString();

  return {
    incident: {
      selectedGuidance,
      sessionStartTime: nowIso,
      summaryGeneratedTime: nowIso,
      location: null,
      countryRegion: null,
      peopleCount: null,
      guidanceMode,
    },
    condition: {
      ageGroup: { status: 'not_assessed' },
      responsiveness: { status: 'not_assessed' },
      breathing: { status: 'not_assessed' },
      visibleInjuriesOrBleeding: { status: 'not_assessed' },
      medicalHistory: { status: 'unknown' },
      allergies: { status: 'unknown' },
      symptomsOrObservations: [],
    },
    timeline: [
      {
        id: `ev-start-${Date.now()}`,
        type: 'session_started',
        timestamp: nowIso,
        elapsedSeconds: 0,
        description: `Emergency guidance session started for reported concern: ${selectedGuidance}`,
        source: 'app_recorded',
      },
    ],
    actionsTaken: [],
    importantUnknowns: [
      'Incident onset time unknown',
      'Medical history not provided',
      'Known allergies not provided',
      'Prescription medications not provided',
    ],
    userNotes: '',
    returnUrl,
  };
}

export function addTimelineEvent(
  session: HandoffData,
  event: Omit<HandoffTimelineEvent, 'id'>
): HandoffData {
  // Prevent duplicate events within 500ms of same type and description
  const isDuplicate = session.timeline.some(
    (existing) =>
      existing.type === event.type &&
      existing.description === event.description &&
      Math.abs(new Date(existing.timestamp).getTime() - new Date(event.timestamp).getTime()) < 500
  );

  if (isDuplicate) return session;

  const newEvent: HandoffTimelineEvent = {
    ...event,
    id: `ev-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  };

  const updated: HandoffData = {
    ...session,
    timeline: [...session.timeline, newEvent],
  };

  saveActiveSession(updated);
  return updated;
}

export function addConfirmedAction(
  session: HandoffData,
  actionText: string,
  source: EventSource = 'bystander_confirmed',
  elapsedSeconds?: number
): HandoffData {
  const isDuplicate = session.actionsTaken.some((a) => a.action === actionText);
  if (isDuplicate) return session;

  const newAction: ConfirmedAction = {
    id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    action: actionText,
    source,
    timestamp: new Date().toISOString(),
    elapsedSeconds,
  };

  const updated: HandoffData = {
    ...session,
    actionsTaken: [...session.actionsTaken, newAction],
  };

  saveActiveSession(updated);
  return updated;
}

export function updateConditionField(
  session: HandoffData,
  field: 'ageGroup' | 'responsiveness' | 'breathing' | 'visibleInjuriesOrBleeding' | 'medicalHistory' | 'allergies',
  status: AssessmentStatus,
  value?: string,
  source: EventSource = 'bystander_reported'
): HandoffData {
  const updated: HandoffData = {
    ...session,
    condition: {
      ...session.condition,
      [field]: { status, value, source },
    },
  };

  // Remove matching unknown from importantUnknowns if now reported
  if (status === 'reported') {
    updated.importantUnknowns = updated.importantUnknowns.filter((item) => {
      const lower = item.toLowerCase();
      if (field === 'breathing' && lower.includes('breathing')) return false;
      if (field === 'medicalHistory' && lower.includes('medical history')) return false;
      if (field === 'allergies' && lower.includes('allergies')) return false;
      return true;
    });
  }

  saveActiveSession(updated);
  return updated;
}

function formatStatus(status: AssessmentStatus, value?: string, source?: EventSource): string {
  if (status === 'reported') {
    const val = value ? `: ${value}` : '';
    const src = source === 'bystander_confirmed' ? ' (Confirmed by bystander)' : ' (Reported by bystander)';
    return `Reported${val}${src}`;
  }
  if (status === 'not_assessed') {
    return 'Not assessed';
  }
  return 'Unknown / Not provided';
}

export function formatPlainTextHandoff(data: HandoffData): string {
  const formatTime = (isoString?: string | null) => {
    if (!isoString) return 'Unknown';
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return isoString;
    }
  };

  const formatDate = (isoString?: string | null) => {
    if (!isoString) return 'Unknown';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return isoString;
    }
  };

  const formatElapsed = (secs?: number) => {
    if (secs === undefined || secs === null) return '';
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `+${mins}m ${remainder}s`;
  };

  const sections: string[] = [];

  sections.push(`═══════════════════════════════════════════════════════`);
  sections.push(`         FIRST30.AI — EMERGENCY HANDOFF`);
  sections.push(`═══════════════════════════════════════════════════════`);
  sections.push(
    `NOTICE: Information provided by bystander and app timers. Not a verified medical diagnosis or paramedic assessment.\n`
  );

  // Incident Overview
  sections.push(`[INCIDENT OVERVIEW]`);
  sections.push(`• Selected emergency guidance: ${data.incident.selectedGuidance}`);
  sections.push(`• Emergency guidance mode: ${data.incident.guidanceMode}`);
  sections.push(
    `• Session started: ${formatDate(data.incident.sessionStartTime)} at ${formatTime(data.incident.sessionStartTime)}`
  );
  sections.push(
    `• Summary generated: ${formatDate(data.incident.summaryGeneratedTime)} at ${formatTime(data.incident.summaryGeneratedTime)}`
  );
  if (data.incident.location) {
    sections.push(`• Location: ${data.incident.location} (Provided by user)`);
  }
  if (data.incident.countryRegion) {
    sections.push(`• Region / Country code: ${data.incident.countryRegion}`);
  }
  if (data.incident.peopleCount) {
    sections.push(`• Number of affected people: ${data.incident.peopleCount}`);
  }
  sections.push('');

  // Person's Condition
  sections.push(`[PERSON'S REPORTED CONDITION]`);
  sections.push(`• Responsiveness: ${formatStatus(data.condition.responsiveness.status, data.condition.responsiveness.value, data.condition.responsiveness.source)}`);
  sections.push(`• Breathing status: ${formatStatus(data.condition.breathing.status, data.condition.breathing.value, data.condition.breathing.source)}`);
  sections.push(`• Approximate age group: ${formatStatus(data.condition.ageGroup.status, data.condition.ageGroup.value, data.condition.ageGroup.source)}`);
  sections.push(`• Visible injuries / bleeding: ${formatStatus(data.condition.visibleInjuriesOrBleeding.status, data.condition.visibleInjuriesOrBleeding.value, data.condition.visibleInjuriesOrBleeding.source)}`);
  sections.push(`• Relevant medical history: ${formatStatus(data.condition.medicalHistory.status, data.condition.medicalHistory.value, data.condition.medicalHistory.source)}`);
  sections.push(`• Known allergies: ${formatStatus(data.condition.allergies.status, data.condition.allergies.value, data.condition.allergies.source)}`);

  if (data.condition.symptomsOrObservations.length > 0) {
    sections.push(`• Other observations:`);
    data.condition.symptomsOrObservations.forEach((obs) => {
      const src = obs.source === 'bystander_confirmed' ? 'Confirmed by bystander' : 'Reported by bystander';
      sections.push(`   - ${obs.text} (${src})`);
    });
  }
  sections.push('');

  // CPR Metrics if available
  if (data.cprMetrics && data.cprMetrics.totalCompressionsRecorded > 0) {
    sections.push(`[CPR METRICS — RECORDED BY APP METRONOME]`);
    sections.push(`• Total compressions paced: ${data.cprMetrics.totalCompressionsRecorded} (App recorded; physical delivery unverified)`);
    sections.push(`• Completed 30:2 cycles: ${data.cprMetrics.totalCyclesRecorded}`);
    sections.push(`• Active duration: ${formatElapsed(data.cprMetrics.durationSeconds)}`);
    sections.push(`• Target tempo: ${data.cprMetrics.bpmTarget} BPM`);
    if (data.cprMetrics.rescuerSwapsPrompted > 0) {
      sections.push(`• Rescuer fatigue swap alerts prompted: ${data.cprMetrics.rescuerSwapsPrompted}`);
    }
    sections.push('');
  }

  // Timeline of Events
  sections.push(`[CHRONOLOGICAL TIMELINE OF EVENTS]`);
  if (data.timeline.length === 0) {
    sections.push(`• No timeline events recorded`);
  } else {
    data.timeline.forEach((ev) => {
      const timeStr = formatTime(ev.timestamp);
      const elapsedStr = ev.elapsedSeconds !== undefined ? ` (${formatElapsed(ev.elapsedSeconds)})` : '';
      const srcLabel =
        ev.source === 'app_recorded'
          ? 'Recorded by First30.ai'
          : ev.source === 'bystander_confirmed'
          ? 'Confirmed by bystander'
          : 'Reported by bystander';
      sections.push(`• [${timeStr}${elapsedStr}] ${ev.description} — ${srcLabel}`);
    });
  }
  sections.push('');

  // Actions Taken
  sections.push(`[ACTIONS TAKEN]`);
  if (data.actionsTaken.length === 0) {
    sections.push(`• No actions explicitly confirmed by bystander`);
  } else {
    data.actionsTaken.forEach((act) => {
      const srcLabel =
        act.source === 'bystander_confirmed'
          ? 'Reported & confirmed by bystander'
          : act.source === 'app_recorded'
          ? 'Recorded by First30.ai'
          : 'Reported by bystander';
      sections.push(`✓ ${act.action} — ${srcLabel}`);
    });
  }
  sections.push('');

  // Important Unknowns
  if (data.importantUnknowns.length > 0) {
    sections.push(`[IMPORTANT UNKNOWNS / NOT ASSESSED]`);
    data.importantUnknowns.forEach((unk) => {
      sections.push(`? ${unk}`);
    });
    sections.push('');
  }

  // Bystander Notes
  if (data.userNotes && data.userNotes.trim()) {
    sections.push(`[BYSTANDER NOTES]`);
    sections.push(`${data.userNotes.trim()} (Direct note entered by bystander)`);
    sections.push('');
  }

  // Provenance statement
  sections.push(`═══════════════════════════════════════════════════════`);
  sections.push(`DATA PROVENANCE & PRIVACY`);
  sections.push(`• Stored locally in browser session memory during this emergency.`);
  sections.push(`• Zero cloud transmission, zero external analytics.`);
  sections.push(`• Generated offline by First30.ai.`);
  sections.push(`═══════════════════════════════════════════════════════`);

  return sections.join('\n');
}

export function convertSummaryDataToHandoff(summary: EmergencySummaryData): HandoffData {
  const session = createDefaultSession(summary.category, 'Standard Guidance', '/citizen');
  
  if (summary.startTime) {
    const sTime = summary.startTime instanceof Date ? summary.startTime.toISOString() : String(summary.startTime);
    session.incident.sessionStartTime = sTime;
  }
  
  if (summary.endTime) {
    const eTime = summary.endTime instanceof Date ? summary.endTime.toISOString() : String(summary.endTime);
    session.incident.summaryGeneratedTime = eTime;
  }
  
  session.incident.location = summary.location || null;

  if (summary.cprData) {
    session.cprMetrics = {
      totalCompressionsRecorded: summary.cprData.compressions,
      totalCyclesRecorded: summary.cprData.cycles,
      durationSeconds: summary.cprData.durationSeconds,
      rescuerSwapsPrompted: Math.floor(summary.cprData.durationSeconds / 120),
      bpmTarget: 110,
    };
  }

  if (summary.consciousness) {
    session.condition.responsiveness = {
      status: summary.consciousness === 'unknown' ? 'unknown' : 'reported',
      value: summary.consciousness === 'unknown' ? undefined : summary.consciousness,
      source: 'bystander_reported',
    };
  }

  if (summary.breathing) {
    session.condition.breathing = {
      status: summary.breathing === 'unknown' ? 'unknown' : 'reported',
      value: summary.breathing === 'unknown' ? undefined : summary.breathing,
      source: 'bystander_reported',
    };
  }

  if (summary.bleeding) {
    session.condition.visibleInjuriesOrBleeding = {
      status: summary.bleeding === 'unknown' ? 'unknown' : 'reported',
      value: summary.bleeding === 'unknown' ? undefined : summary.bleeding,
      source: 'bystander_reported',
    };
  }

  if (summary.ageGroup && summary.ageGroup !== 'unknown') {
    session.condition.ageGroup = {
      status: 'reported',
      value: String(summary.ageGroup),
      source: 'bystander_reported',
    };
  }

  if (summary.allergies) {
    session.condition.allergies = {
      status: 'reported',
      value: summary.allergies,
      source: 'bystander_reported',
    };
  }

  if (summary.medications || summary.medicalConditions) {
    const val = [summary.medicalConditions, summary.medications ? `Meds: ${summary.medications}` : '']
      .filter(Boolean)
      .join('; ');
    session.condition.medicalHistory = {
      status: 'reported',
      value: val,
      source: 'bystander_reported',
    };
  }

  if (summary.bystanderNotes) {
    session.userNotes = summary.bystanderNotes;
  }

  if (summary.collectedInputs && summary.collectedInputs.length > 0) {
    summary.collectedInputs.forEach((inp) => {
      session.condition.symptomsOrObservations.push({
        id: `obs-${inp.questionId}`,
        text: `${inp.question}: ${inp.answer}`,
        source: 'bystander_reported',
      });
    });
  }

  if (summary.actionsTaken && summary.actionsTaken.length > 0) {
    summary.actionsTaken.forEach((act) => {
      session.actionsTaken.push({
        id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        action: act,
        source: 'bystander_confirmed',
      });
    });
  }

  return session;
}
