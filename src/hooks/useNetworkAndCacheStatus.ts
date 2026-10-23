import { useState, useEffect, useCallback } from 'react';

export type CacheReadiness = 'unsupported' | 'idle' | 'preparing' | 'ready' | 'error';

export interface NetworkAndCacheStatus {
  isOnline: boolean;
  isServiceWorkerSupported: boolean;
  isServiceWorkerActive: boolean;
  cacheReadiness: CacheReadiness;
  hasWaitingUpdate: boolean;
  cachedProtocolsCount: number;
  lastCheckedTime: Date | null;
  checkStatus: () => Promise<void>;
  applyUpdate: () => void;
}

export function useNetworkAndCacheStatus(): NetworkAndCacheStatus {
  const [isOnline, setIsOnline] = useState<boolean>(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [isServiceWorkerSupported, setIsServiceWorkerSupported] = useState<boolean>(false);
  const [isServiceWorkerActive, setIsServiceWorkerActive] = useState<boolean>(false);
  const [cacheReadiness, setCacheReadiness] = useState<CacheReadiness>('idle');
  const [hasWaitingUpdate, setHasWaitingUpdate] = useState<boolean>(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const [lastCheckedTime, setLastCheckedTime] = useState<Date | null>(null);

  // Core emergency flows are bundled in code (15 categories)
  const cachedProtocolsCount = 15;

  const checkStatus = useCallback(async () => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      setIsServiceWorkerSupported(false);
      setCacheReadiness('unsupported');
      setLastCheckedTime(new Date());
      return;
    }

    setIsServiceWorkerSupported(true);

    try {
      const registration = await navigator.serviceWorker.getRegistration();

      if (!registration) {
        // In local development or before registration resolves
        if (navigator.serviceWorker.controller) {
          setIsServiceWorkerActive(true);
          setCacheReadiness('ready');
        } else {
          setCacheReadiness('preparing');
        }
        setLastCheckedTime(new Date());
        return;
      }

      // Check if there is an update waiting
      if (registration.waiting) {
        setHasWaitingUpdate(true);
        setWaitingWorker(registration.waiting);
      } else {
        setHasWaitingUpdate(false);
      }

      // Check if active or installing
      if (registration.active) {
        setIsServiceWorkerActive(true);

        // Verify if cache storage has any cached entries
        if ('caches' in window) {
          const keys = await caches.keys();
          const pwaCaches = keys.filter(
            (k) => k.includes('workbox') || k.includes('first30') || k.includes('precache')
          );
          if (pwaCaches.length > 0 || keys.length > 0) {
            setCacheReadiness('ready');
          } else {
            setCacheReadiness('preparing');
          }
        } else {
          setCacheReadiness('ready');
        }
      } else if (registration.installing) {
        setCacheReadiness('preparing');
      } else {
        setCacheReadiness('preparing');
      }
    } catch (err) {
      console.warn('Cache status evaluation error:', err);
      // Even if cache inspection fails, bundled code remains locally operable
      setCacheReadiness('error');
    } finally {
      setLastCheckedTime(new Date());
    }
  }, []);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    checkStatus();

    // Check periodically or on SW state changes
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
    isServiceWorkerSupported,
    isServiceWorkerActive,
    cacheReadiness,
    hasWaitingUpdate,
    cachedProtocolsCount,
    lastCheckedTime,
    checkStatus,
    applyUpdate,
  };
}

export default useNetworkAndCacheStatus;
