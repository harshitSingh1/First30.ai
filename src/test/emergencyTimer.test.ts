import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useEmergencyTimer } from '@/hooks/useEmergencyTimer';

describe('useEmergencyTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('formats initial state to 00:00 and autoStart=false stays idle', () => {
    const { result } = renderHook(() => useEmergencyTimer(false));
    expect(result.current.elapsedTime).toBe(0);
    expect(result.current.formattedTime).toBe('00:00');
    expect(result.current.isRunning).toBe(false);
  });

  it('increments time correctly when running', () => {
    const { result } = renderHook(() => useEmergencyTimer(true));
    expect(result.current.isRunning).toBe(true);

    act(() => {
      vi.advanceTimersByTime(2500);
    });

    expect(result.current.elapsedTime).toBe(2);
    expect(result.current.formattedTime).toBe('00:02');

    act(() => {
      vi.advanceTimersByTime(61000);
    });

    expect(result.current.elapsedTime).toBe(63);
    expect(result.current.formattedTime).toBe('01:03');
  });

  it('supports pause and resume without losing accumulated time', () => {
    const { result } = renderHook(() => useEmergencyTimer(false));

    act(() => {
      result.current.start();
    });

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(result.current.elapsedTime).toBe(3);

    // Pause timer
    act(() => {
      result.current.stop();
    });

    // Advance 5 seconds while paused
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    // Should still be 3 seconds
    expect(result.current.elapsedTime).toBe(3);

    // Resume timer
    act(() => {
      result.current.start();
    });

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(result.current.elapsedTime).toBe(5);
  });

  it('resets time to 00:00 on reset', () => {
    const { result } = renderHook(() => useEmergencyTimer(true));

    act(() => {
      vi.advanceTimersByTime(10000);
    });

    expect(result.current.elapsedTime).toBe(10);

    act(() => {
      result.current.reset();
    });

    expect(result.current.elapsedTime).toBe(0);
    expect(result.current.formattedTime).toBe('00:00');
  });
});
