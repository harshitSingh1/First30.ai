import { useState, useEffect, useCallback, useRef } from 'react';

export interface UseScreenWakeLockReturn {
  isSupported: boolean;
  isActive: boolean;
  error: string | null;
  request: () => Promise<boolean>;
  release: () => Promise<void>;
}

export const useScreenWakeLock = (autoRequest = false): UseScreenWakeLockReturn => {
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const sentinelRef = useRef<WakeLockSentinel | null>(null);
  const shouldBeActiveRef = useRef<boolean>(autoRequest);

  useEffect(() => {
    const supported = typeof navigator !== 'undefined' && 'wakeLock' in navigator;
    setIsSupported(supported);
  }, []);

  const release = useCallback(async () => {
    shouldBeActiveRef.current = false;
    if (sentinelRef.current) {
      try {
        await sentinelRef.current.release();
      } catch (err) {
        console.warn('WakeLock release error:', err);
      } finally {
        sentinelRef.current = null;
        setIsActive(false);
      }
    }
  }, []);

  const request = useCallback(async (): Promise<boolean> => {
    shouldBeActiveRef.current = true;
    if (typeof navigator === 'undefined' || !('wakeLock' in navigator)) {
      setError('Screen Wake Lock is not supported on this browser/device.');
      return false;
    }

    // If already active, return true
    if (sentinelRef.current && !sentinelRef.current.released) {
      setIsActive(true);
      return true;
    }

    try {
      const sentinel = await navigator.wakeLock.request('screen');
      sentinelRef.current = sentinel;
      setIsActive(true);
      setError(null);

      sentinel.addEventListener('release', () => {
        // If released by the browser (e.g. tab switch or battery save)
        if (sentinelRef.current === sentinel) {
          sentinelRef.current = null;
          setIsActive(false);
        }
      });

      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to acquire wake lock';
      setError(message);
      setIsActive(false);
      return false;
    }
  }, []);

  // Handle visibility change: re-acquire when user returns to visible tab if session is still active
  useEffect(() => {
    if (!isSupported) return;

    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && shouldBeActiveRef.current) {
        // Delay slightly to allow browser viewport to settle
        setTimeout(async () => {
          if (shouldBeActiveRef.current && (!sentinelRef.current || sentinelRef.current.released)) {
            await request();
          }
        }, 150);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isSupported, request]);

  // Handle autoRequest on mount
  useEffect(() => {
    if (autoRequest) {
      request();
    }
    return () => {
      release();
    };
  }, [autoRequest, request, release]);

  return {
    isSupported,
    isActive,
    error,
    request,
    release,
  };
};

export default useScreenWakeLock;
