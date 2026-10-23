export type EventSource = 'bystander_reported' | 'bystander_confirmed' | 'app_recorded';

export type AssessmentStatus = 'reported' | 'not_assessed' | 'unknown';

export type HandoffEventType =
  | 'session_started'
  | 'symptom_reported'
  | 'observation_recorded'
  | 'instruction_presented'
  | 'action_confirmed'
  | 'action_reported'
  | 'cpr_started'
  | 'cpr_paused'
  | 'cpr_resumed'
  | 'cpr_stopped'
  | 'emergency_call_link_opened'
  | 'note_added'
  | 'handoff_generated';

export interface HandoffTimelineEvent {
  id: string;
  type: HandoffEventType;
  timestamp: string; // ISO string
  elapsedSeconds?: number;
  description: string;
  source: EventSource;
  protocolId?: string;
  metadata?: Record<string, string | number | boolean>;
}

export interface ConditionField {
  status: AssessmentStatus;
  value?: string;
  source?: EventSource;
}

export interface ConfirmedAction {
  id: string;
  action: string;
  source: EventSource;
  timestamp?: string;
  elapsedSeconds?: number;
}

export interface CPRSessionMetrics {
  totalCompressionsRecorded: number;
  totalCyclesRecorded: number;
  durationSeconds: number;
  rescuerSwapsPrompted: number;
  bpmTarget: number;
}

export interface IncidentOverview {
  selectedGuidance: string; // Label: Selected emergency guidance / reported concern
  sessionStartTime: string | null;
  summaryGeneratedTime: string;
  location: string | null;
  countryRegion: string | null;
  peopleCount: string | null;
  guidanceMode: string;
}

export interface PersonCondition {
  ageGroup: ConditionField;
  responsiveness: ConditionField;
  breathing: ConditionField;
  visibleInjuriesOrBleeding: ConditionField;
  medicalHistory: ConditionField;
  allergies: ConditionField;
  symptomsOrObservations: Array<{
    id: string;
    text: string;
    source: EventSource;
    timestamp?: string;
  }>;
}

export interface HandoffData {
  incident: IncidentOverview;
  condition: PersonCondition;
  timeline: HandoffTimelineEvent[];
  actionsTaken: ConfirmedAction[];
  cprMetrics?: CPRSessionMetrics;
  importantUnknowns: string[];
  userNotes?: string;
  returnUrl?: string;
}
