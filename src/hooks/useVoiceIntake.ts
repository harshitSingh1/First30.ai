import { useState, useCallback, useMemo } from 'react';
import { Language } from '@/contexts/LanguageContext';

export type UrgencyLevel = 'critical' | 'high' | 'medium' | 'low';
export type ConsciousState = 'yes' | 'no' | 'unknown';
export type BreathingState = 'normal' | 'abnormal' | 'not_breathing' | 'unknown';
export type BleedingState = 'none' | 'minor' | 'severe' | 'unknown';
export type AgeGroup = 'infant' | 'child' | 'adult' | 'elderly' | 'unknown';

export interface EmergencySummary {
  emergencyType: string | null;
  conscious: ConsciousState;
  breathing: BreathingState;
  bleeding: BleedingState;
  ageGroup: AgeGroup;
  location: string | null;
  timeStarted: Date;
  additionalInfo: string[];
  urgencyLevel: UrgencyLevel;
}

export interface IntakeQuestion {
  id: string;
  questionKey: string;
  field: keyof EmergencySummary | 'initial' | 'additional';
  options?: { value: string; labelKey: string }[];
}

const intakeQuestions: IntakeQuestion[] = [
  {
    id: 'initial',
    questionKey: 'voice.question.initial',
    field: 'initial',
  },
  {
    id: 'conscious',
    questionKey: 'voice.question.conscious',
    field: 'conscious',
    options: [
      { value: 'yes', labelKey: 'voice.option.yes' },
      { value: 'no', labelKey: 'voice.option.no' },
      { value: 'unknown', labelKey: 'voice.option.notSure' },
    ],
  },
  {
    id: 'breathing',
    questionKey: 'voice.question.breathing',
    field: 'breathing',
    options: [
      { value: 'normal', labelKey: 'voice.option.breathingNormal' },
      { value: 'abnormal', labelKey: 'voice.option.breathingDifficult' },
      { value: 'not_breathing', labelKey: 'voice.option.notBreathing' },
      { value: 'unknown', labelKey: 'voice.option.notSure' },
    ],
  },
  {
    id: 'bleeding',
    questionKey: 'voice.question.bleeding',
    field: 'bleeding',
    options: [
      { value: 'none', labelKey: 'voice.option.nobleeding' },
      { value: 'minor', labelKey: 'voice.option.minorBleeding' },
      { value: 'severe', labelKey: 'voice.option.severeBleeding' },
    ],
  },
  {
    id: 'age',
    questionKey: 'voice.question.age',
    field: 'ageGroup',
    options: [
      { value: 'infant', labelKey: 'voice.option.infant' },
      { value: 'child', labelKey: 'voice.option.child' },
      { value: 'adult', labelKey: 'voice.option.adult' },
      { value: 'elderly', labelKey: 'voice.option.elderly' },
    ],
  },
  {
    id: 'location',
    questionKey: 'voice.question.location',
    field: 'location',
  },
];

// Keywords for emergency type detection (multi-language and Hinglish)
const emergencyKeywords: Record<string, string[]> = {
  bleeding: ['bleed', 'bleeding', 'blood', 'cut', 'wound', 'blut', 'sangre', 'sang', 'खून', 'khoon', 'chot', 'kat gaya'],
  unconscious: ['unconscious', 'not responding', 'passed out', 'fainted', 'bewusstlos', 'inconsciente', 'बेहोश', 'behosh', 'behoshi', 'chakkar', 'gira'],
  breathing: ['breathing', 'breathe', 'asthma', 'choking', 'cant breathe', 'atmen', 'respirar', 'सांस', 'saans', 'dama', 'ghutan'],
  chest: ['chest pain', 'heart attack', 'heart', 'brustschmerz', 'dolor de pecho', 'छाती', 'दिल', 'chhati', 'dil', 'chaati', 'seene mein dard'],
  stroke: ['stroke', 'face drooping', 'arm weak', 'speech', 'schlaganfall', 'accidente cerebrovascular', 'स्ट्रोक', 'lakwa', 'faalij'],
  choking: ['choking', 'choke', 'cant swallow', 'ersticken', 'atragantamiento', 'गला', 'atki', 'phas gaya'],
  burns: ['burn', 'burned', 'fire', 'verbrennung', 'quemadura', 'जलना', 'aag', 'jal gaya', 'garam paani'],
  seizure: ['seizure', 'convulsion', 'shaking', 'krampf', 'convulsión', 'दौरा', 'daura', 'jhatke', 'mirgi'],
  fracture: ['broken', 'fracture', 'bone', 'sprain', 'bruch', 'fractura', 'टूटा', 'haddi', 'toot', 'moch'],
  head: ['head injury', 'concussion', 'hit head', 'kopfverletzung', 'lesión en la cabeza', 'सिर', 'sir', 'sar pe chot'],
  poison: ['poison', 'poisoning', 'swallowed', 'chemical', 'vergiftung', 'envenenamiento', 'ज़हर', 'zeher', 'chemical pee liya'],
  allergy: ['allergy', 'allergic', 'swelling', 'allergie', 'alergia', 'एलर्जी', 'khujli', 'soojan'],
  fever: ['fever', 'temperature', 'hot', 'fieber', 'fiebre', 'बुखार', 'bukhar', 'tez garam'],
  electric: ['electric', 'shock', 'electrocuted', 'stromschlag', 'descarga eléctrica', 'बिजली', 'current', 'jhatka'],
  drowning: ['drowning', 'water', 'pool', 'ertrinken', 'ahogamiento', 'डूबना', 'doobna', 'paani mein doob'],
};

const emergencyTypeMap: Record<string, string> = {
  bleeding: 'Severe Bleeding / Cuts',
  unconscious: 'Unconscious / Not Responding',
  breathing: 'Breathing Trouble / Asthma',
  chest: 'Chest Pain / Heart Attack',
  stroke: 'Stroke (FAST Test)',
  choking: 'Choking',
  burns: 'Burns',
  seizure: 'Seizure',
  fracture: 'Fracture / Sprain',
  head: 'Head Injury / Concussion',
  poison: 'Poisoning / Chemical Exposure',
  allergy: 'Allergic Reaction / Anaphylaxis',
  fever: 'Fever (Child/Adult)',
  electric: 'Electric Shock',
  drowning: 'Drowning / Near-Drowning',
};

const emergencyRouteMap: Record<string, string> = {
  bleeding: 'bleeding',
  unconscious: 'unconscious',
  breathing: 'breathing',
  chest: 'chest-pain',
  stroke: 'stroke',
  choking: 'choking',
  burns: 'burns',
  seizure: 'seizure',
  fracture: 'fracture',
  head: 'head-injury',
  poison: 'poisoning',
  allergy: 'allergic-reaction',
  fever: 'fever',
  electric: 'electric-shock',
  drowning: 'drowning',
};

interface UseVoiceIntakeReturn {
  currentQuestionIndex: number;
  currentQuestion: IntakeQuestion | null;
  summary: EmergencySummary;
  isComplete: boolean;
  suggestedCategory: string | null;
  suggestedRoute: string | null;
  processUserResponse: (text: string) => void;
  answerWithOption: (value: string) => void;
  reset: () => void;
  goToNextQuestion: () => void;
}

export const useVoiceIntake = (): UseVoiceIntakeReturn => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [summary, setSummary] = useState<EmergencySummary>({
    emergencyType: null,
    conscious: 'unknown',
    breathing: 'unknown',
    bleeding: 'unknown',
    ageGroup: 'unknown',
    location: null,
    timeStarted: new Date(),
    additionalInfo: [],
    urgencyLevel: 'medium',
  });

  const detectEmergencyType = useCallback((text: string): string | null => {
    const lowerText = text.toLowerCase();
    
    for (const [category, keywords] of Object.entries(emergencyKeywords)) {
      for (const keyword of keywords) {
        if (lowerText.includes(keyword.toLowerCase())) {
          return category;
        }
      }
    }
    return null;
  }, []);

  const calculateUrgency = useCallback((summary: EmergencySummary): UrgencyLevel => {
    // Critical conditions
    if (summary.conscious === 'no' || summary.breathing === 'not_breathing') {
      return 'critical';
    }
    
    // High priority conditions
    if (
      summary.breathing === 'abnormal' ||
      summary.bleeding === 'severe' ||
      summary.emergencyType?.includes('stroke') ||
      summary.emergencyType?.includes('chest')
    ) {
      return 'high';
    }
    
    // Medium priority
    if (summary.bleeding === 'minor' || summary.ageGroup === 'infant' || summary.ageGroup === 'elderly') {
      return 'medium';
    }
    
    return 'low';
  }, []);

  const processUserResponse = useCallback((text: string) => {
    const currentQuestion = intakeQuestions[currentQuestionIndex];
    if (!currentQuestion) return;

    setSummary(prev => {
      const newSummary = { ...prev };
      
      if (currentQuestion.field === 'initial') {
        // Detect emergency type from initial description
        const detectedType = detectEmergencyType(text);
        if (detectedType) {
          newSummary.emergencyType = emergencyTypeMap[detectedType] || detectedType;
        }
        newSummary.additionalInfo = [...prev.additionalInfo, text];
      } else if (currentQuestion.field === 'location') {
        newSummary.location = text;
      } else if (currentQuestion.field === 'additional') {
        newSummary.additionalInfo = [...prev.additionalInfo, text];
      } else if (currentQuestion.options) {
        // Try to match spoken response to options
        const lowerText = text.toLowerCase();
        const matchedOption = currentQuestion.options.find(opt => 
          lowerText.includes(opt.value.toLowerCase()) ||
          lowerText.includes('yes') && opt.value === 'yes' ||
          lowerText.includes('no') && opt.value === 'no' ||
          lowerText.includes('ja') && opt.value === 'yes' ||
          lowerText.includes('nein') && opt.value === 'no' ||
          lowerText.includes('sí') && opt.value === 'yes' ||
          lowerText.includes('oui') && opt.value === 'yes' ||
          lowerText.includes('non') && opt.value === 'no' ||
          lowerText.includes('हाँ') && opt.value === 'yes' ||
          lowerText.includes('नहीं') && opt.value === 'no' ||
          lowerText.includes('haan') && opt.value === 'yes' ||
          lowerText.includes('nahi') && opt.value === 'no' ||
          lowerText.includes('ha') && opt.value === 'yes' ||
          lowerText.includes('na') && opt.value === 'no'
        );
        
        if (matchedOption) {
          (newSummary as Record<string, unknown>)[currentQuestion.field] = matchedOption.value;
        }
      }
      
      // If we are on the final question, ensure emergencyType has a sensible fallback so summary is never stuck on Analyzing
      if (currentQuestionIndex === intakeQuestions.length - 1 && !newSummary.emergencyType) {
        newSummary.emergencyType = 'General Emergency Assessment';
      }

      newSummary.urgencyLevel = calculateUrgency(newSummary);
      return newSummary;
    });

    // Advance to next question or complete
    setCurrentQuestionIndex(prev => prev + 1);
  }, [currentQuestionIndex, detectEmergencyType, calculateUrgency]);

  const answerWithOption = useCallback((value: string) => {
    const currentQuestion = intakeQuestions[currentQuestionIndex];
    if (!currentQuestion || currentQuestion.field === 'initial' || currentQuestion.field === 'additional') return;

    setSummary(prev => {
      const newSummary = { ...prev };
      (newSummary as Record<string, unknown>)[currentQuestion.field] = value;
      newSummary.urgencyLevel = calculateUrgency(newSummary);
      return newSummary;
    });

    setCurrentQuestionIndex(prev => prev + 1);
  }, [currentQuestionIndex, calculateUrgency]);

  const goToNextQuestion = useCallback(() => {
    setCurrentQuestionIndex(prev => prev + 1);
  }, []);

  const reset = useCallback(() => {
    setCurrentQuestionIndex(0);
    setSummary({
      emergencyType: null,
      conscious: 'unknown',
      breathing: 'unknown',
      bleeding: 'unknown',
      ageGroup: 'unknown',
      location: null,
      timeStarted: new Date(),
      additionalInfo: [],
      urgencyLevel: 'medium',
    });
  }, []);

  const currentQuestion = useMemo(() => {
    return intakeQuestions[currentQuestionIndex] || null;
  }, [currentQuestionIndex]);

  const isComplete = currentQuestionIndex >= intakeQuestions.length;

  // Determine suggested category based on detected emergency type
  const suggestedCategory = useMemo(() => {
    if (!summary.emergencyType) return null;
    return summary.emergencyType;
  }, [summary.emergencyType]);

  const suggestedRoute = useMemo(() => {
    if (!summary.emergencyType) return null;
    
    // Find matching route from the emergency type
    for (const [key, typeName] of Object.entries(emergencyTypeMap)) {
      if (summary.emergencyType === typeName) {
        return emergencyRouteMap[key] || null;
      }
    }
    return null;
  }, [summary.emergencyType]);

  return {
    currentQuestionIndex,
    currentQuestion,
    summary,
    isComplete,
    suggestedCategory,
    suggestedRoute,
    processUserResponse,
    answerWithOption,
    reset,
    goToNextQuestion,
  };
};
