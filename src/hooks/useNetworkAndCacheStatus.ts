import { useState, useEffect, useCallback, useRef } from 'react';

export type NetworkState = 'online' | 'offline' | 'unknown';
export type CacheVerificationState = 'idle' | 'checking' | 'ready' | 'unavailable';

// Backward compatibility alias for existing code/tests
export type CacheReadiness = CacheVerificationState;

export interface NetworkAndCacheStatus {
  isOnline: boolean;
  networkStatus: NetworkState;
  cacheStatus: CacheVerificationState;
  cacheReadiness: CacheVerificationState;
  isServiceWorkerSupported: boolean;
  isServiceWorkerActive: boolean;
  hasWaitingUpdate: boolean;
  cachedProtocolsCount: number;
  lastCheckedTime: Date | null;
  checkStatus: () => Promise<void>;
  applyUpdate: () => void;
}

const VERIFICATION_TIMEOUT_MS = 3500;

export function useNetworkAndCacheStatus(): NetworkAndCacheStatus {
  const [networkStatus, setNetworkStatus] = useState<NetworkState>(() => {
    if (typeof navigator === 'undefined') return 'unknown';
    return navigator.onLine ? 'online' : 'offline';
  });

  const isOnline = networkStatus === 'online';

  const [isServiceWorkerSupported, setIsServiceWorkerSupported] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' && 'serviceWorker' in navigator;
  });

  const [isServiceWorkerActive, setIsServiceWorkerActive] = useState<boolean>(() => {
    return (
      typeof navigator !== 'undefined' &&
      'serviceWorker' in navigator &&
      Boolean(navigator.serviceWorker.controller)
    );
  });

  const [cacheStatus, setCacheStatus] = useState<CacheVerificationState>('idle');
  const [hasWaitingUpdate, setHasWaitingUpdate] = useState<boolean>(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const [lastCheckedTime, setLastCheckedTime] = useState<Date | null>(null);

  const isVerifyingRef = useRef(false);

  // Core emergency flows are bundled in code (15 categories)
  const cachedProtocolsCount = 15;

  const verifyCacheStorage = async (): Promise<boolean> => {
    if (typeof window === 'undefined' || !('caches' in window)) {
      return false;
    }
    try {
      const keys = await caches.keys();
      const pwaCaches = keys.filter(
        (k) =>
          k.includes('workbox') ||
          k.includes('first30') ||
          k.includes('precache') ||
          k.includes('runtime')
      );
      return pwaCaches.length > 0 || keys.length > 0;
    } catch {
      return false;
    }
  };

  const checkStatus = useCallback(async () => {
    if (isVerifyingRef.current) return;
    isVerifyingRef.current = true;
    setCacheStatus('checking');

    // Bounded timeout to guarantee we never hang in 'checking'
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const timeoutPromise = new Promise<'timeout'>((resolve) => {
      timeoutId = setTimeout(() => resolve('timeout'), VERIFICATION_TIMEOUT_MS);
    });

    const runVerification = async (): Promise<CacheVerificationState> => {
      if (typeof window === 'undefined') {
        return 'unavailable';
      }

      // Sync network status with current browser state
      if (typeof navigator !== 'undefined') {
        setNetworkStatus(navigator.onLine ? 'online' : 'offline');
      }

      const swSupported = 'serviceWorker' in navigator;
      setIsServiceWorkerSupported(swSupported);

      // Check controller status
      const hasController = swSupported && Boolean(navigator.serviceWorker.controller);
      if (hasController) {
        setIsServiceWorkerActive(true);
      }

      // Check Service Worker registration
      let hasActiveRegistration = false;
      if (swSupported) {
        try {
          const registration = await navigator.serviceWorker.getRegistration();
          if (registration) {
            if (registration.waiting) {
              setHasWaitingUpdate(true);
              setWaitingWorker(registration.waiting);
            } else {
              setHasWaitingUpdate(false);
            }

            if (registration.active) {
              setIsServiceWorkerActive(true);
              hasActiveRegistration = true;
            }
          }
        } catch (err) {
          console.warn('Service worker registration check error:', err);
        }
      }

      // Verify Cache Storage API
      const hasCachedAssets = await verifyCacheStorage();

      if (hasController || hasActiveRegistration || hasCachedAssets) {
        return 'ready';
      }

      // If SW is supported and ready, or bundled flows exist but SW cache is unready
      return 'unavailable';
    };

    try {
      const result = await Promise.race([runVerification(), timeoutPromise]);
      if (result === 'timeout') {
        setCacheStatus('unavailable');
      } else {
        setCacheStatus(result);
      }
    } catch (err) {
      console.warn('Cache verification error:', err);
      setCacheStatus('unavailable');
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
      isVerifyingRef.current = false;
      setLastCheckedTime(new Date());
    }
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      setNetworkStatus('online');
      checkStatus();
    };

    const handleOffline = () => {
      setNetworkStatus('offline');
      // When offline, immediately transition out of checking if it was in progress
      if (isVerifyingRef.current) {
        setCacheStatus('ready');
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial status check
    checkStatus();

    // Listen for Service Worker controller changes (e.g. activation of new worker)
    let swChangeHandler: (() => void) | null = null;
    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      swChangeHandler = () => {
        setIsServiceWorkerActive(Boolean(navigator.serviceWorker.controller));
        checkStatus();
      };
      navigator.serviceWorker.addEventListener('controllerchange', swChangeHandler);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (swChangeHandler && typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('controllerchange', swChangeHandler);
      }
    };
  }, [checkStatus]);

  const applyUpdate = useCallback(() => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  }, [waitingWorker]);

  return {
    isOnline,
    networkStatus,
    cacheStatus,
    cacheReadiness: cacheStatus, // Backwards-compatible alias
    isServiceWorkerSupported,
    isServiceWorkerActive,
    hasWaitingUpdate,
    cachedProtocolsCount,
    lastCheckedTime,
    checkStatus,
    applyUpdate,
  };
}

export default useNetworkAndCacheStatus;
