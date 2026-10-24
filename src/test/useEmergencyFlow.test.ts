import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useEmergencyFlow } from '@/hooks/useEmergencyFlow';

describe('useEmergencyFlow step calculation & accuracy', () => {
  it('correctly records 100% steps when all steps are completed including final step', () => {
    const { result } = renderHook(() => useEmergencyFlow('bleeding'));
    const total = result.current.totalSteps;
    expect(total).toBeGreaterThan(0);

    // Complete all steps one by one through the end
    for (let i = 0; i < total; i++) {
      act(() => {
        result.current.goToNextStep();
      });
    }

    expect(result.current.completedSteps.length).toBe(total);
    expect(result.current.skippedSteps.length).toBe(0);

    const summary = result.current.getSummaryData(60);
    expect(summary.stepsCompleted.length).toBe(total);
    expect(summary.stepsSkipped.length).toBe(0);
    expect(summary.totalSteps).toBe(total);
  });

  it('correctly tracks skipped steps without counting them as completed', () => {
    const { result } = renderHook(() => useEmergencyFlow('bleeding'));
    const total = result.current.totalSteps;

    // Complete step 0
    act(() => {
      result.current.goToNextStep();
    });

    // Skip step 1
    act(() => {
      result.current.skipCurrentStep();
    });

    // Complete step 2
    act(() => {
      result.current.goToNextStep();
    });

    expect(result.current.completedSteps.length).toBe(2);
    expect(result.current.skippedSteps.length).toBe(1);

    const summary = result.current.getSummaryData(45);
    expect(summary.stepsCompleted.length).toBe(2);
    expect(summary.stepsSkipped.length).toBe(1);
  });

  it('allows going back to a previous step and correcting it', () => {
    const { result } = renderHook(() => useEmergencyFlow('bleeding'));

    // Complete step 0
    act(() => {
      result.current.goToNextStep();
    });
    expect(result.current.currentStepIndex).toBe(1);

    // Skip step 1
    act(() => {
      result.current.skipCurrentStep();
    });
    expect(result.current.currentStepIndex).toBe(2);
    expect(result.current.skippedSteps.length).toBe(1);

    // Go back to step 1
    act(() => {
      result.current.goToPreviousStep();
    });
    expect(result.current.currentStepIndex).toBe(1);

    // Now complete step 1
    act(() => {
      result.current.goToNextStep();
    });
    expect(result.current.currentStepIndex).toBe(2);
    expect(result.current.completedSteps.length).toBe(2);
    expect(result.current.skippedSteps.length).toBe(0);
  });
});
