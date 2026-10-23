import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { searchLocationByQuery, PRESET_CITIES } from '@/services/locationService';
import { mockNearbyServices } from '@/data/emergencyFlows';
import { useVoiceIntake } from '@/hooks/useVoiceIntake';

describe('Sprint Bug Fixes & Verifications', () => {
  describe('Location Services and Fallbacks', () => {
    it('successfully resolves preset cities for manual search without GPS', async () => {
      const delhi = await searchLocationByQuery('New Delhi');
      expect(delhi).not.toBeNull();
      expect(delhi?.lat).toBeCloseTo(28.6139, 2);
      expect(delhi?.displayName).toContain('Delhi');

      const london = await searchLocationByQuery('London');
      expect(london).not.toBeNull();
      expect(london?.lat).toBeCloseTo(51.5074, 2);

      const berlin = await searchLocationByQuery('berlin');
      expect(berlin).not.toBeNull();
      expect(berlin?.lat).toBeCloseTo(52.5200, 2);
    });

    it('demonstration mock data is tagged with explicit demo_perimeter provenance', () => {
      expect(mockNearbyServices.length).toBeGreaterThan(0);
      mockNearbyServices.forEach((service) => {
        expect(service.dataSource).toBe('demo_perimeter');
      });
    });

    it('verifies preset city dictionary is comprehensive', () => {
      expect(Object.keys(PRESET_CITIES).length).toBeGreaterThanOrEqual(10);
      expect(PRESET_CITIES['delhi']).toBeDefined();
      expect(PRESET_CITIES['mumbai']).toBeDefined();
      expect(PRESET_CITIES['new york']).toBeDefined();
      expect(PRESET_CITIES['san francisco']).toBeDefined();
    });
  });

  describe('Voice Intake Progression & Hinglish Detection', () => {
    it('detects emergency type from Hinglish keywords', () => {
      const { result } = renderHook(() => useVoiceIntake());

      act(() => {
        result.current.processUserResponse('bahut zyada khoon beh raha hai cut lag gaya');
      });

      expect(result.current.summary.emergencyType).toContain('Bleeding');
      expect(result.current.currentQuestionIndex).toBe(1);
    });

    it('advances cleanly through all questions to complete state without repeating location', () => {
      const { result } = renderHook(() => useVoiceIntake());

      // Question 0: Initial
      act(() => {
        result.current.processUserResponse('Saans lene mein takleef ho rahi hai');
      });
      expect(result.current.summary.emergencyType).toContain('Breathing');
      expect(result.current.currentQuestionIndex).toBe(1);

      // Question 1: Conscious
      act(() => {
        result.current.answerWithOption('yes');
      });
      expect(result.current.summary.conscious).toBe('yes');
      expect(result.current.currentQuestionIndex).toBe(2);

      // Question 2: Breathing
      act(() => {
        result.current.answerWithOption('abnormal');
      });
      expect(result.current.summary.breathing).toBe('abnormal');
      expect(result.current.currentQuestionIndex).toBe(3);

      // Question 3: Bleeding
      act(() => {
        result.current.answerWithOption('none');
      });
      expect(result.current.summary.bleeding).toBe('none');
      expect(result.current.currentQuestionIndex).toBe(4);

      // Question 4: Age
      act(() => {
        result.current.answerWithOption('adult');
      });
      expect(result.current.summary.ageGroup).toBe('adult');
      expect(result.current.currentQuestionIndex).toBe(5);

      // Question 5: Location (Last question)
      act(() => {
        result.current.processUserResponse('Connaught Place, New Delhi');
      });

      // After last question: index is 6, currentQuestion is null, isComplete is true
      expect(result.current.currentQuestionIndex).toBe(6);
      expect(result.current.currentQuestion).toBeNull();
      expect(result.current.isComplete).toBe(true);
      expect(result.current.summary.location).toBe('Connaught Place, New Delhi');
      expect(result.current.summary.emergencyType).toBeTruthy();
    });
  });
});
