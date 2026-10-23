import { useState, useEffect, useCallback, useRef } from 'react';

interface UseEmergencyTimerReturn {
  elapsedTime: number;
  formattedTime: string;
  isRunning: boolean;
  start: () => void;
  stop: () => void;
  reset: () => void;
  toggle: () => void;
}

export const useEmergencyTimer = (autoStart = true): UseEmergencyTimerReturn => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isRunning, setIsRunning] = useState(autoStart);

  const accumulatedMsRef = useRef<number>(0);
  const startTimestampRef = useRef<number | null>(autoStart ? (typeof performance !== 'undefined' ? performance.now() : Date.now()) : null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const getMonotonicNow = (): number => {
    return typeof performance !== 'undefined' ? performance.now() : Date.now();
  };

  useEffect(() => {
    if (isRunning) {
      if (startTimestampRef.current === null) {
        startTimestampRef.current = getMonotonicNow();
      }

      intervalRef.current = setInterval(() => {
        if (startTimestampRef.current !== null) {
          const currentRunMs = getMonotonicNow() - startTimestampRef.current;
          const totalSeconds = Math.floor((accumulatedMsRef.current + currentRunMs) / 1000);
          setElapsedTime(totalSeconds);
        }
      }, 250);
    } else {
      if (startTimestampRef.current !== null) {
        accumulatedMsRef.current += getMonotonicNow() - startTimestampRef.current;
        startTimestampRef.current = null;
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning]);

  const start = useCallback(() => {
    if (!isRunning) {
      startTimestampRef.current = getMonotonicNow();
      setIsRunning(true);
    }
  }, [isRunning]);

  const stop = useCallback(() => {
    if (isRunning) {
      if (startTimestampRef.current !== null) {
        accumulatedMsRef.current += getMonotonicNow() - startTimestampRef.current;
        startTimestampRef.current = null;
      }
      setIsRunning(false);
    }
  }, [isRunning]);

  const reset = useCallback(() => {
    accumulatedMsRef.current = 0;
    startTimestampRef.current = isRunning ? getMonotonicNow() : null;
    setElapsedTime(0);
  }, [isRunning]);

  const toggle = useCallback(() => {
    setIsRunning((prev) => !prev);
  }, []);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    elapsedTime,
    formattedTime: formatTime(elapsedTime),
    isRunning,
    start,
    stop,
    reset,
    toggle,
  };
};

// CPR-specific timer with rhythm tracking
interface UseCPRTimerReturn extends UseEmergencyTimerReturn {
  compressionCount: number;
  breathCount: number;
  cycleCount: number;
  isCompressionPhase: boolean;
  bpm: number;
}

export const useCPRTimer = (): UseCPRTimerReturn => {
  const timer = useEmergencyTimer(false);
  const [compressionCount, setCompressionCount] = useState(0);
  const [breathCount, setBreathCount] = useState(0);
  const [isCompressionPhase, setIsCompressionPhase] = useState(true);
  
  const bpm = 110; // Target: 100-120 BPM
  const compressionsPerCycle = 30;
  const breathsPerCycle = 2;

  // Calculate cycle count
  const cycleCount = Math.floor(compressionCount / compressionsPerCycle);

  const addCompression = useCallback(() => {
    setCompressionCount((prev) => prev + 1);
    if ((compressionCount + 1) % compressionsPerCycle === 0) {
      setIsCompressionPhase(false);
    }
  }, [compressionCount]);

  const addBreath = useCallback(() => {
    setBreathCount((prev) => prev + 1);
    if ((breathCount + 1) % breathsPerCycle === 0) {
      setIsCompressionPhase(true);
    }
  }, [breathCount]);

  return {
    ...timer,
    compressionCount,
    breathCount,
    cycleCount,
    isCompressionPhase,
    bpm,
  };
};
