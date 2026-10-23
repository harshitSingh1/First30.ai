import React, { useState } from 'react';
import { useNetworkAndCacheStatus } from '@/hooks/useNetworkAndCacheStatus';
import { WifiOff, ShieldCheck, RefreshCw, AlertCircle, Check, Info } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export const OfflineIndicator: React.FC = () => {
  const {
    isOnline,
    cacheReadiness,
    hasWaitingUpdate,
    applyUpdate,
    cachedProtocolsCount,
  } = useNetworkAndCacheStatus();

  const [dismissed, setDismissed] = useState(false);
  const location = useLocation();

  // Active emergency routes where user shouldn't be interrupted with invasive banners
  const isEmergencyActive =
    location.pathname.startsWith('/emergency') || location.pathname === '/cpr';

  // If user is online, no waiting update, and cache is ready, show nothing intrusive
  if (isOnline && !hasWaitingUpdate) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:right-auto sm:max-w-md z-50 pointer-events-auto">
      {/* 1. Offline Mode Banner */}
      {!isOnline && (
        <div
          role="status"
          aria-live="polite"
          className="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl bg-slate-900/95 border border-amber-500/40 text-amber-300 shadow-xl backdrop-blur-md text-xs font-medium"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
              <WifiOff className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="font-semibold text-foreground flex items-center gap-1.5">
                Offline Mode Active
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {cachedProtocolsCount} Flows Ready
                </span>
              </p>
              <p className="text-[11px] text-muted-foreground">
                All 15 emergency protocols &amp; CPR metronome function 100% offline. Live map requires internet.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 2. Non-Intrusive App Update Available (Deferred during active emergency) */}
      {isOnline && hasWaitingUpdate && !isEmergencyActive && !dismissed && (
        <div
          role="alert"
          className="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl bg-slate-900/95 border border-teal-500/40 text-teal-300 shadow-xl backdrop-blur-md text-xs font-medium"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-teal-500/20 flex items-center justify-center text-teal-400 shrink-0">
              <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Updated Protocols Available</p>
              <p className="text-[11px] text-muted-foreground">
                A new version of emergency guidance is cached.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={applyUpdate}
              className="px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-semibold text-[11px] transition-colors"
            >
              Update
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground"
            >
              Later
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfflineIndicator;
