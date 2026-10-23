export type Priority = 'P1' | 'P2' | 'P3' | 'P4';

export type AgeGroup = 'infant' | 'child' | 'adult' | 'elderly';

export interface QuickQuestion {
  id: string;
  question: string;
  options: { label: string; value: string }[];
  required?: boolean;
}

export interface EmergencyStep {
  id: string;
  title: string;
  instruction: string;
  warning?: string;
  imagePlaceholder?: string;
  alternatives?: string[];
  quickQuestion?: QuickQuestion;
  actionButton?: {
    label: string;
    action: 'cpr' | 'call911' | 'timer';
  };
}

export interface SummaryTemplate {
  fields: string[];
  recommendations: string[];
}

export interface EmergencyFlow {
  id: string;
  category: string;
  icon: string;
  description: string;
  priorityHint: Priority;
  steps: EmergencyStep[];
  nextQuestions: string[];
  summaryTemplate: SummaryTemplate;
  initialQuestions?: QuickQuestion[];
}

export interface DispatcherCase {
  id: string;
  category: string;
  priority: Priority;
  reportedAt: Date;
  location: string;
  summary: string;
  status: 'active' | 'pending' | 'resolved';
  suggestedActions: string[];
  suggestedQuestions: string[];
  stepsCompleted: string[];
}

export interface CollectedInput {
  questionId: string;
  question: string;
  answer: string;
  stepId?: string;
}

export interface CPRSummaryData {
  compressions: number;
  cycles: number;
  durationSeconds: number;
  aedUsed?: 'yes' | 'no' | 'unknown';
  aedShocks?: number;
}

export interface EmergencySummaryData {
  category: string;
  categoryIcon: string;
  priority: Priority;
  calculatedPriority: Priority;
  stepsCompleted: string[];
  stepsSkipped: string[];
  totalSteps: number;
  duration: number;
  startTime: Date;
  endTime: Date;
  collectedInputs: CollectedInput[];
  keyObservations: string[];
  actionsTaken: string[];
  location?: string;
  notes?: string;
  // Enhanced Paramedic Handoff Fields
  ageGroup?: 'infant' | 'child' | 'adult' | 'elderly' | 'unknown' | string;
  consciousness?: 'alert' | 'verbal' | 'pain' | 'unresponsive' | 'unknown';
  breathing?: 'normal' | 'difficult' | 'none' | 'agonal' | 'unknown';
  bleeding?: 'none' | 'minor' | 'severe' | 'controlled' | 'unknown';
  cprData?: CPRSummaryData;
  symptomOnset?: string;
  timeOnsetKnown?: boolean;
  allergies?: string;
  medications?: string;
  medicalConditions?: string;
  bystanderNotes?: string;
  criticalUnknowns?: string[];
}

export interface NearbyService {
  id: string;
  name: string;
  type: 'hospital' | 'pharmacy' | 'police' | 'fire';
  address: string;
  distance: string;
  eta: string;
  phone?: string;
  isOpen24h?: boolean;
  lat?: number;
  lng?: number;
  dataSource?: 'overpass_live' | 'demo_perimeter';
}
