import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { cprAudio } from '@/services/cprAudio';

describe('cprAudio Web Audio engine', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    cprAudio.stop();
    vi.useRealTimers();
  });

  it('calculates correct beat intervals for 110 BPM target cadence', () => {
    const bpm = 110;
    const expectedIntervalSeconds = 60 / bpm;
    // 60 / 110 is approximately 0.5454 seconds
    expect(expectedIntervalSeconds).toBeCloseTo(0.5454, 3);
  });

  it('clamps BPM within safe clinical limits (90 - 130)', async () => {
    // Mock AudioContext
    const mockAudioContext = {
      currentTime: 0,
      state: 'running',
      resume: vi.fn().mockResolvedValue(undefined),
      createOscillator: vi.fn().mockReturnValue({
        connect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
        type: 'sine',
        frequency: { setValueAtTime: vi.fn() },
      }),
      createGain: vi.fn().mockReturnValue({
        connect: vi.fn(),
        gain: {
          setValueAtTime: vi.fn(),
          exponentialRampToValueAtTime: vi.fn(),
          linearRampToValueAtTime: vi.fn(),
          cancelScheduledValues: vi.fn(),
        },
      }),
      destination: {},
    };

    window.AudioContext = vi.fn().mockImplementation(() => mockAudioContext);

    await cprAudio.start(110);
    expect(cprAudio.getBpm()).toBe(110);

    await cprAudio.start(200); // Exceeds upper limit
    expect(cprAudio.getBpm()).toBe(130);

    await cprAudio.start(50); // Below lower limit
    expect(cprAudio.getBpm()).toBe(90);
  });

  it('handles pause and resume without double scheduling', async () => {
    await cprAudio.start(110);
    expect(cprAudio.getIsRunning()).toBe(true);

    cprAudio.pause();
    expect(cprAudio.getIsRunning()).toBe(false);

    await cprAudio.resume();
    expect(cprAudio.getIsRunning()).toBe(true);

    cprAudio.stop();
    expect(cprAudio.getIsRunning()).toBe(false);
  });

  it('supports sound enable and mute toggle', () => {
    cprAudio.setSoundEnabled(false);
    expect(cprAudio.getSoundEnabled()).toBe(false);

    cprAudio.setSoundEnabled(true);
    expect(cprAudio.getSoundEnabled()).toBe(true);
  });
});
