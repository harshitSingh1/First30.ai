import { useState, useCallback, useMemo } from 'react';
import { EmergencyFlow, EmergencySummaryData, CollectedInput, Priority } from '@/types/emergency';
import { getEmergencyFlowById } from '@/data/emergencyFlows';

interface UseEmergencyFlowReturn {
  flow: EmergencyFlow | undefined;
  currentStepIndex: number;
  currentStep: EmergencyFlow['steps'][0] | undefined;
  totalSteps: number;
  progress: number;
  isFirstStep: boolean;
  isLastStep: boolean;
  completedSteps: string[];
  skippedSteps: string[];
  collectedInputs: CollectedInput[];
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  skipCurrentStep: () => void;
  resetFlow: () => void;
  addInput: (input: CollectedInput) => void;
  getSummaryData: (duration: number) => EmergencySummaryData;
  calculatePriority: () => Priority;
}

export const useEmergencyFlow = (categoryId: string): UseEmergencyFlowReturn => {
  const flow = useMemo(() => getEmergencyFlowById(categoryId), [categoryId]);
  
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [skippedSteps, setSkippedSteps] = useState<string[]>([]);
  const [collectedInputs, setCollectedInputs] = useState<CollectedInput[]>([]);
  const [startTime] = useState(() => new Date());

  const totalSteps = flow?.steps.length ?? 0;
  const currentStep = flow?.steps[currentStepIndex];
  const progress = totalSteps > 0 ? ((currentStepIndex + 1) / totalSteps) * 100 : 0;
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === totalSteps - 1;

  const addInput = useCallback((input: CollectedInput) => {
    setCollectedInputs((prev) => {
      const existing = prev.findIndex((i) => i.questionId === input.questionId);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = input;
        return updated;
      }
      return [...prev, input];
    });
  }, []);

  const goToNextStep = useCallback(() => {
    if (!currentStep) return;
    
    setCompletedSteps((prev) => [...prev, currentStep.title]);
    
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    }
  }, [currentStep, currentStepIndex, totalSteps]);

  const goToPreviousStep = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
      setCompletedSteps((prev) => prev.slice(0, -1));
    }
  }, [currentStepIndex]);

  const skipCurrentStep = useCallback(() => {
    if (!currentStep) return;
    
    setSkippedSteps((prev) => [...prev, currentStep.title]);
    
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    }
  }, [currentStep, currentStepIndex, totalSteps]);

  const resetFlow = useCallback(() => {
    setCurrentStepIndex(0);
    setCompletedSteps([]);
    setSkippedSteps([]);
    setCollectedInputs([]);
  }, []);

  const calculatePriority = useCallback((): Priority => {
    if (!flow) return 'P3';
    
    let priority = flow.priorityHint;
    
    // Increase priority based on critical answers
    const criticalAnswers = collectedInputs.filter((input) => {
      const answer = input.answer.toLowerCase();
      return (
        answer === 'no' && input.questionId.includes('breathing') ||
        answer === 'no' && input.questionId.includes('response') ||
        answer === 'severe' ||
        answer === 'yes' && input.questionId.includes('shock') ||
        answer === 'large' ||
        answer === '5+min'
      );
    });

    if (criticalAnswers.length > 0) {
      priority = 'P1';
    } else if (criticalAnswers.length === 0 && flow.priorityHint === 'P1') {
      priority = 'P2';
    }

    return priority;
  }, [flow, collectedInputs]);

  const getSummaryData = useCallback(
    (duration: number): EmergencySummaryData => {
      const calculatedPriority = calculatePriority();
      
      // Generate key observations from collected inputs
      const keyObservations = collectedInputs.map((input) => `${input.question}: ${input.answer}`);
      
      // Generate actions taken from completed steps
      const actionsTaken = completedSteps;

      return {
        category: flow?.category || 'Unknown Emergency',
        categoryIcon: flow?.icon || 'alert-circle',
        priority: flow?.priorityHint || 'P3',
        calculatedPriority,
        stepsCompleted: completedSteps,
        stepsSkipped: skippedSteps,
        totalSteps,
        duration,
        startTime,
        endTime: new Date(),
        collectedInputs,
        keyObservations,
        actionsTaken,
      };
    },
    [flow, completedSteps, skippedSteps, totalSteps, startTime, collectedInputs, calculatePriority]
  );

  return {
    flow,
    currentStepIndex,
    currentStep,
    totalSteps,
    progress,
    isFirstStep,
    isLastStep,
    completedSteps,
    skippedSteps,
    collectedInputs,
    goToNextStep,
    goToPreviousStep,
    skipCurrentStep,
    resetFlow,
    addInput,
    getSummaryData,
    calculatePriority,
  };
};
