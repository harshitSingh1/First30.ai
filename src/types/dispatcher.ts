import { Priority } from './emergency';

export interface TranscriptEntry {
  id: string;
  timestamp: Date;
  speaker: 'caller' | 'dispatcher' | 'system';
  message: string;
  flagged?: boolean;
}

export interface AISummary {
  chiefComplaint: string;
  patientInfo: {
    ageGroup: string;
    conscious: boolean;
    breathing: boolean;
    injuries: string[];
  };
  keyObservations: string[];
  riskFactors: string[];
  timeline: string[];
}

export interface DispatchRecommendation {
  id: string;
  service: 'ems' | 'fire' | 'police' | 'all';
  priority: Priority;
  reason: string;
  eta?: string;
}

export interface RecommendedQuestion {
  id: string;
  question: string;
  category: 'medical' | 'safety' | 'location' | 'context';
  asked: boolean;
  critical?: boolean;
}

export interface DispatchPlan {
  recommendations: DispatchRecommendation[];
  suggestedQuestions: RecommendedQuestion[];
  triageLevel: Priority;
  dispatchUnits: ('EMS' | 'Fire' | 'Police')[];
  notes: string;
}

export type TimelinePhase = '0-2' | '2-5' | '5-15' | '15-30';

export interface CallSession {
  id: string;
  startTime: Date;
  currentPhase: TimelinePhase;
  transcript: TranscriptEntry[];
  aiSummary: AISummary | null;
  dispatchPlan: DispatchPlan | null;
  status: 'active' | 'dispatched' | 'resolved';
}
