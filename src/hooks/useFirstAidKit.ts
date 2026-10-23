import { useState, useCallback } from 'react';
import { 
  KitAssessment, 
  kitQuestions, 
  generatePersonalizedKit, 
  getRelevantScenarios,
  KitItem,
  PracticeScenario
} from '@/data/firstAidKitData';

export type KitPhase = 'assessment' | 'results' | 'training' | 'scenario';

interface UseFirstAidKitReturn {
  // Phase management
  phase: KitPhase;
  setPhase: (phase: KitPhase) => void;
  
  // Assessment state
  currentStep: number;
  totalSteps: number;
  assessment: Partial<KitAssessment>;
  updateAssessment: (field: keyof KitAssessment, value: any) => void;
  nextStep: () => void;
  prevStep: () => void;
  skipStep: () => void;
  isStepValid: () => boolean;
  
  // Generated kit
  generatedKit: {
    essential: KitItem[];
    ageSpecific: KitItem[];
    riskSpecific: KitItem[];
    optional: KitItem[];
  } | null;
  generateKit: () => void;
  allKitItems: KitItem[];
  
  // Training
  selectedItem: KitItem | null;
  setSelectedItem: (item: KitItem | null) => void;
  
  // Scenarios
  relevantScenarios: PracticeScenario[];
  selectedScenario: PracticeScenario | null;
  setSelectedScenario: (scenario: PracticeScenario | null) => void;
  scenarioStep: number;
  nextScenarioStep: () => void;
  resetScenario: () => void;
  
  // Reset
  resetAll: () => void;
}

const initialAssessment: Partial<KitAssessment> = {
  kitType: '',
  peopleCount: 1,
  ageGroups: [],
  healthConditions: [],
  environments: [],
  pastIncidents: [],
  futureRisks: [],
};

export function useFirstAidKit(): UseFirstAidKitReturn {
  const [phase, setPhase] = useState<KitPhase>('assessment');
  const [currentStep, setCurrentStep] = useState(0);
  const [assessment, setAssessment] = useState<Partial<KitAssessment>>(initialAssessment);
  const [generatedKit, setGeneratedKit] = useState<ReturnType<typeof generatePersonalizedKit> | null>(null);
  const [selectedItem, setSelectedItem] = useState<KitItem | null>(null);
  const [selectedScenario, setSelectedScenario] = useState<PracticeScenario | null>(null);
  const [scenarioStep, setScenarioStep] = useState(0);

  const totalSteps = kitQuestions.length;

  const updateAssessment = useCallback((field: keyof KitAssessment, value: any) => {
    setAssessment(prev => ({ ...prev, [field]: value }));
  }, []);

  const isStepValid = useCallback(() => {
    const question = kitQuestions[currentStep];
    if (question.optional) return true;
    
    const value = assessment[question.id as keyof KitAssessment];
    
    if (question.type === 'single') {
      return !!value && value !== '';
    }
    if (question.type === 'multi') {
      return Array.isArray(value) && value.length > 0;
    }
    if (question.type === 'number') {
      return typeof value === 'number' && value > 0;
    }
    return false;
  }, [currentStep, assessment]);

  const nextStep = useCallback(() => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Generate kit and move to results
      const fullAssessment: KitAssessment = {
        kitType: assessment.kitType || 'individual',
        peopleCount: assessment.peopleCount || 1,
        ageGroups: assessment.ageGroups || [],
        healthConditions: assessment.healthConditions || [],
        environments: assessment.environments || [],
        pastIncidents: assessment.pastIncidents || [],
        futureRisks: assessment.futureRisks || [],
      };
      const kit = generatePersonalizedKit(fullAssessment);
      setGeneratedKit(kit);
      setPhase('results');
    }
  }, [currentStep, totalSteps, assessment]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const skipStep = useCallback(() => {
    nextStep();
  }, [nextStep]);

  const generateKit = useCallback(() => {
    const fullAssessment: KitAssessment = {
      kitType: assessment.kitType || 'individual',
      peopleCount: assessment.peopleCount || 1,
      ageGroups: assessment.ageGroups || [],
      healthConditions: assessment.healthConditions || [],
      environments: assessment.environments || [],
      pastIncidents: assessment.pastIncidents || [],
      futureRisks: assessment.futureRisks || [],
    };
    const kit = generatePersonalizedKit(fullAssessment);
    setGeneratedKit(kit);
  }, [assessment]);

  const allKitItems = generatedKit 
    ? [...generatedKit.essential, ...generatedKit.ageSpecific, ...generatedKit.riskSpecific, ...generatedKit.optional]
    : [];

  const relevantScenarios = generatedKit 
    ? getRelevantScenarios(allKitItems.map(item => item.id))
    : [];

  const nextScenarioStep = useCallback(() => {
    if (selectedScenario && scenarioStep < selectedScenario.steps.length) {
      setScenarioStep(prev => prev + 1);
    }
  }, [selectedScenario, scenarioStep]);

  const resetScenario = useCallback(() => {
    setScenarioStep(0);
    setSelectedScenario(null);
  }, []);

  const resetAll = useCallback(() => {
    setPhase('assessment');
    setCurrentStep(0);
    setAssessment(initialAssessment);
    setGeneratedKit(null);
    setSelectedItem(null);
    setSelectedScenario(null);
    setScenarioStep(0);
  }, []);

  return {
    phase,
    setPhase,
    currentStep,
    totalSteps,
    assessment,
    updateAssessment,
    nextStep,
    prevStep,
    skipStep,
    isStepValid,
    generatedKit,
    generateKit,
    allKitItems,
    selectedItem,
    setSelectedItem,
    relevantScenarios,
    selectedScenario,
    setSelectedScenario,
    scenarioStep,
    nextScenarioStep,
    resetScenario,
    resetAll,
  };
}
