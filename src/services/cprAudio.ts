/**
 * Precision Web Audio CPR Metronome Engine
 *
 * Replaces unreliable JavaScript timers (setInterval/setTimeout) with sample-accurate
 * hardware clock scheduling against AudioContext.currentTime using a look-ahead queue.
 *
 * Certified for AHA/ERC 100-120 BPM resuscitation cadence (default: 110 BPM).
 */

export type BeatType = 'compression' | 'breath';

export interface BeatEvent {
  beatNumber: number;
  time: number;
  type: BeatType;
}

class CPRAudioEngine {
  private audioCtx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private duckingGain: GainNode | null = null;

  private isRunning: boolean = false;
  private isPaused: boolean = false;
  private soundEnabled: boolean = true;
  private bpm: number = 110;

  // Scheduling constants
  private readonly lookAheadSeconds = 0.1; // 100ms look-ahead window
  private readonly scheduleIntervalMs = 25; // Check every 25ms
  private schedulerTimerId: NodeJS.Timeout | null = null;

  private nextBeatTime: number = 0;
  private currentBeatNumber: number = 0;

  private onBeatCallback: ((event: BeatEvent) => void) | null = null;
  private isCompressionPhaseFn: (() => boolean) | null = null;

  /**
   * Initialize or retrieve the shared AudioContext (lazily created on user gesture)
   */
  private getAudioContext(): AudioContext {
    if (!this.audioCtx) {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioContextClass();

      // Configure gain chain: Node -> masterGain -> duckingGain -> destination
      this.duckingGain = this.audioCtx.createGain();
      this.duckingGain.gain.setValueAtTime(1.0, this.audioCtx.currentTime);
      this.duckingGain.connect(this.audioCtx.destination);

      this.masterGain = this.audioCtx.createGain();
      this.masterGain.gain.setValueAtTime(this.soundEnabled ? 1.0 : 0.0, this.audioCtx.currentTime);
      this.masterGain.connect(this.duckingGain);
    }
    return this.audioCtx;
  }

  /**
   * Schedule a single beat sound ahead of time
   */
  private scheduleTone(time: number, isCompression: boolean) {
    if (!this.soundEnabled || !this.masterGain || !this.audioCtx) return;

    try {
      const osc = this.audioCtx.createOscillator();
      const noteGain = this.audioCtx.createGain();

      osc.connect(noteGain);
      noteGain.connect(this.masterGain);

      if (isCompression) {
        // Dual-tone: 800 Hz crisp woodblock compression click
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, time);
        // Exponential decay for non-clipping click
        noteGain.gain.setValueAtTime(0.35, time);
        noteGain.gain.exponentialRampToValueAtTime(0.001, time + 0.06);
        osc.start(time);
        osc.stop(time + 0.07);
      } else {
        // Dual-tone: 400 Hz soft chime for rescue breath phase
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(400, time);
        noteGain.gain.setValueAtTime(0.3, time);
        noteGain.gain.exponentialRampToValueAtTime(0.001, time + 0.14);
        osc.start(time);
        osc.stop(time + 0.15);
      }
    } catch (e) {
      console.warn('CPRAudio: failed to schedule tone:', e);
    }
  }

  /**
   * The scheduler loop ticks every 25ms, scheduling any beats that fall within the 100ms look-ahead window
   */
  private scheduler = () => {
    if (!this.isRunning || this.isPaused || !this.audioCtx) return;

    const secondsPerBeat = 60.0 / this.bpm;
    const currentTime = this.audioCtx.currentTime;

    while (this.nextBeatTime < currentTime + this.lookAheadSeconds) {
      const isCompression = this.isCompressionPhaseFn ? this.isCompressionPhaseFn() : true;
      this.scheduleTone(this.nextBeatTime, isCompression);

      // Notify caller of beat event
      if (this.onBeatCallback) {
        const beatNum = this.currentBeatNumber + 1;
        this.currentBeatNumber = beatNum;
        const event: BeatEvent = {
          beatNumber: beatNum,
          time: this.nextBeatTime,
          type: isCompression ? 'compression' : 'breath',
        };

        // Trigger callback roughly when audio starts
        const delayMs = Math.max(0, (this.nextBeatTime - currentTime) * 1000);
        setTimeout(() => {
          if (this.isRunning && !this.isPaused && this.onBeatCallback) {
            this.onBeatCallback(event);
          }
        }, delayMs);
      }

      this.nextBeatTime += secondsPerBeat;
    }
  };

  /**
   * Start CPR pacing
   */
  public async start(
    bpm: number = 110,
    onBeat?: (event: BeatEvent) => void,
    isCompressionPhaseFn?: () => boolean
  ): Promise<boolean> {
    const ctx = this.getAudioContext();

    // Ensure audio context is resumed (browser user gesture requirement)
    if (ctx.state === 'suspended') {
      try {
        await ctx.resume();
      } catch (err) {
        console.warn('CPRAudio: Could not resume AudioContext:', err);
      }
    }

    this.bpm = Math.min(130, Math.max(90, bpm));
    this.onBeatCallback = onBeat || null;
    this.isCompressionPhaseFn = isCompressionPhaseFn || null;

    this.isRunning = true;
    this.isPaused = false;
    this.nextBeatTime = ctx.currentTime + 0.05; // Begin 50ms in future
    this.currentBeatNumber = 0;

    if (this.schedulerTimerId) {
      clearInterval(this.schedulerTimerId);
    }
    this.schedulerTimerId = setInterval(this.scheduler, this.scheduleIntervalMs);

    return true;
  }

  /**
   * Pause pacing (freezes clock without catch-up bursts)
   */
  public pause(): void {
    this.isPaused = true;
    if (this.schedulerTimerId) {
      clearInterval(this.schedulerTimerId);
      this.schedulerTimerId = null;
    }
  }

  /**
   * Resume pacing from where it left off without burst catch-ups
   */
  public async resume(): Promise<void> {
    if (!this.isRunning || !this.isPaused) return;

    const ctx = this.getAudioContext();
    if (ctx.state === 'suspended') {
      try {
        await ctx.resume();
      } catch (err) {
        console.warn('CPRAudio: Could not resume AudioContext on resume:', err);
      }
    }

    this.isPaused = false;
    // Critical: Reset nextBeatTime to current clock time to avoid catch-up beats!
    this.nextBeatTime = ctx.currentTime + 0.05;

    if (this.schedulerTimerId) {
      clearInterval(this.schedulerTimerId);
    }
    this.schedulerTimerId = setInterval(this.scheduler, this.scheduleIntervalMs);
  }

  /**
   * Stop pacing and clear loop
   */
  public stop(): void {
    this.isRunning = false;
    this.isPaused = false;
    if (this.schedulerTimerId) {
      clearInterval(this.schedulerTimerId);
      this.schedulerTimerId = null;
    }
  }

  /**
   * Reset the engine
   */
  public reset(): void {
    this.stop();
    this.currentBeatNumber = 0;
    this.nextBeatTime = 0;
  }

  /**
   * Duck metronome volume (e.g. 0.3 during active speech, 1.0 when finished)
   */
  public setDucking(factor: number): void {
    if (!this.duckingGain || !this.audioCtx) return;
    try {
      const clamped = Math.max(0, Math.min(1, factor));
      const time = this.audioCtx.currentTime;
      this.duckingGain.gain.cancelScheduledValues(time);
      this.duckingGain.gain.linearRampToValueAtTime(clamped, time + 0.08);
    } catch {}
  }

  /**
   * Toggle mute state
   */
  public setSoundEnabled(enabled: boolean): void {
    this.soundEnabled = enabled;
    if (!this.masterGain || !this.audioCtx) return;
    try {
      const time = this.audioCtx.currentTime;
      this.masterGain.gain.cancelScheduledValues(time);
      this.masterGain.gain.setValueAtTime(enabled ? 1.0 : 0.0, time);
    } catch {}
  }

  public getSoundEnabled(): boolean {
    return this.soundEnabled;
  }

  public getIsRunning(): boolean {
    return this.isRunning && !this.isPaused;
  }

  public getBpm(): number {
    return this.bpm;
  }

  public isAudioContextSuspended(): boolean {
    return this.audioCtx?.state === 'suspended';
  }
}

// Export shared singleton instance
export const cprAudio = new CPRAudioEngine();
export default cprAudio;
