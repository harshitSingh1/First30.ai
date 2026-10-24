import React, { useState } from 'react';
import { useNetworkAndCacheStatus } from '@/hooks/useNetworkAndCacheStatus';
import { WifiOff, RefreshCw } from 'lucide-react';
import { useLocation } from 'react-router-dom';

interface OfflineIndicatorProps {
  isBannerPresent?: boolean;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ isBannerPresent = false }) => {
  const {
    isOnline,
    hasWaitingUpdate,
    applyUpdate,
    cachedProtocolsCount,
  } = useNetworkAndCacheStatus();

  const [dismissed, setDismissed] = useState(false);
  const location = useLocation();

  // Active emergency routes where user shouldn't be interrupted with invasive banners
  const isEmergencyActive =
    location.pathname.startsWith('/emergency') || location.pathname === '/cpr';

  // If user is online, no waiting update, show nothing intrusive
  if (isOnline && !hasWaitingUpdate) {
    return null;
  }

  return (
    <div
      className={`fixed ${
        isBannerPresent
          ? 'bottom-[calc(5.5rem+env(safe-area-inset-bottom,0px))]'
          : 'bottom-[calc(1rem+env(safe-area-inset-bottom,0px))]'
      } left-4 right-4 sm:right-auto sm:max-w-md z-40 pointer-events-auto transition-all`}
    >
      {/* 1. Offline Mode Banner */}
      {!isOnline && (
        <div
          role="status"
          aria-live="polite"
          className="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl bg-slate-900/95 border border-amber-500/40 text-amber-300 shadow-xl backdrop-blur-md text-xs font-medium"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
              <WifiOff className="w-4 h-4" />
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
            <div className="w-7 h-7 rounded-lg bg-teal-500/20 flex items-center justify-center text-teal-400 shrink-0">
              {/* Static icon: no accidental continuous spinning */}
              <RefreshCw className="w-4 h-4" />
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
              className="min-h-[44px] px-3 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs transition-colors flex items-center justify-center"
            >
              Update
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="min-h-[44px] px-2.5 py-2 text-xs text-muted-foreground hover:text-foreground flex items-center justify-center"
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
