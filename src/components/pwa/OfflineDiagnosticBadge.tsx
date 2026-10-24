import React from 'react';
import { useNetworkAndCacheStatus } from '@/hooks/useNetworkAndCacheStatus';
import { ShieldCheck, WifiOff, Loader2, HardDrive, RefreshCw } from 'lucide-react';

interface OfflineDiagnosticBadgeProps {
  className?: string;
  compact?: boolean;
  variant?: 'compact' | 'card' | 'drawer';
}

export const OfflineDiagnosticBadge: React.FC<OfflineDiagnosticBadgeProps> = ({
  className = '',
  compact = false,
  variant,
}) => {
  const {
    isOnline,
    cacheStatus,
    cachedProtocolsCount,
    isServiceWorkerActive,
    checkStatus,
  } = useNetworkAndCacheStatus();

  const isOffline = !isOnline;
  const isChecking = cacheStatus === 'checking';
  const isReady = cacheStatus === 'ready' || isServiceWorkerActive;

  // 1. DRAWER VARIANT (Hamburger Sidebar)
  if (variant === 'drawer') {
    let title = 'Offline Ready';
    let subtitle = '15 emergency protocols available offline.';
    let statusLabel = 'Ready';
    let badgeColor = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
    let iconBg = 'bg-emerald-500/15 text-emerald-400';
    let Icon = ShieldCheck;

    if (isOffline) {
      title = 'Offline Mode Active';
      subtitle = 'Operating from local device storage.';
      statusLabel = 'Offline';
      badgeColor = 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      iconBg = 'bg-amber-500/15 text-amber-400';
      Icon = WifiOff;
    } else if (isChecking) {
      title = 'Verifying Cache';
      subtitle = 'Checking offline emergency assets...';
      statusLabel = 'Checking';
      badgeColor = 'bg-teal-500/15 text-teal-400 border-teal-500/30';
      iconBg = 'bg-teal-500/15 text-teal-400';
      Icon = Loader2;
    } else if (!isReady) {
      title = 'Local Protocols Ready';
      subtitle = '15 emergency flows bundled locally.';
      statusLabel = 'Standby';
      badgeColor = 'bg-secondary text-muted-foreground border-border/60';
      iconBg = 'bg-secondary text-muted-foreground';
      Icon = HardDrive;
    }

    return (
      <div
        className={`rounded-xl border border-teal-500/20 bg-teal-500/8 p-3 flex items-center justify-between gap-2.5 transition-all ${className}`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}>
            <Icon className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-semibold text-foreground truncate">{title}</h4>
            <p className="text-[11px] text-muted-foreground truncate">{subtitle}</p>
          </div>
        </div>
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border shrink-0 ${badgeColor}`}>
          {statusLabel}
        </span>
      </div>
    );
  }

  // 2. COMPACT VARIANT (Headers, Toolbars, Badges)
  if (compact || variant === 'compact') {
    if (isOffline) {
      return (
        <div
          title="Operating offline — 15 locally bundled protocols and precision CPR metronome available"
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-amber-500/15 text-amber-300 border border-amber-500/30 shrink-0 ${className}`}
        >
          <WifiOff className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>Offline Ready</span>
        </div>
      );
    }

    if (isChecking) {
      return (
        <div
          title="Verifying offline emergency cache..."
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-teal-500/15 text-teal-400 border border-teal-500/30 shrink-0 ${className}`}
        >
          <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-400 shrink-0" />
          <span className="hidden sm:inline">Checking Cache</span>
          <span className="sm:hidden">Checking</span>
        </div>
      );
    }

    if (isReady) {
      return (
        <div
          title="Emergency Guidance Cached: 15 protocols and CPR engine available even without internet"
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shrink-0 ${className}`}
        >
          <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
          <span className="hidden sm:inline">Offline Cached</span>
          <span className="sm:hidden">Ready</span>
        </div>
      );
    }

    // Default bundled fallback (standby)
    return (
      <div
        title="15 emergency protocols bundled locally on device"
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-secondary text-muted-foreground border border-border/50 shrink-0 ${className}`}
      >
        <HardDrive className="w-3.5 h-3.5 text-teal-400 shrink-0" />
        <span className="hidden sm:inline">Local Flows Ready</span>
        <span className="sm:hidden">Local Ready</span>
      </div>
    );
  }

  // 3. EXPANDED CARD VARIANT (Citizen Mode, Settings, Preparedness Hub)
  return (
    <div
      className={`rounded-2xl border p-4 transition-all ${
        isOffline
          ? 'bg-amber-950/20 border-amber-500/30 text-amber-200'
          : isReady
          ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
          : 'bg-card/70 border-border/70 text-foreground'
      } ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              isOffline
                ? 'bg-amber-500/20 text-amber-400'
                : isChecking
                ? 'bg-teal-500/20 text-teal-400'
                : isReady
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'bg-teal-500/15 text-teal-400'
            }`}
          >
            {isOffline ? (
              <WifiOff className="w-4.5 h-4.5" />
            ) : isChecking ? (
              <Loader2 className="w-4.5 h-4.5 animate-spin" />
            ) : isReady ? (
              <ShieldCheck className="w-4.5 h-4.5" />
            ) : (
              <HardDrive className="w-4.5 h-4.5" />
            )}
          </div>
          <div>
            <h4 className="text-sm font-bold text-foreground">
              {isOffline
                ? 'Offline Emergency Mode Active'
                : isChecking
                ? 'Verifying Offline Cache...'
                : isReady
                ? 'Emergency Guidance Available Offline'
                : 'Local Protocols Ready'}
            </h4>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
              {isOffline
                ? `Operating without internet connection. All ${cachedProtocolsCount} emergency flows and CPR metronome run from local storage.`
                : isChecking
                ? 'Checking local protocol availability and offline service worker storage...'
                : isReady
                ? `All ${cachedProtocolsCount} clinically-reviewed protocols, visual guidance, audio engine, and timers are verified for zero-connectivity situations.`
                : `${cachedProtocolsCount} core emergency protocols are bundled in code and accessible immediately.`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 pt-2 sm:pt-0">
          {!isReady && !isChecking && (
            <button
              onClick={() => checkStatus()}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-secondary/80 hover:bg-secondary text-foreground border border-border/60 transition-colors min-h-[36px]"
              title="Verify offline emergency cache storage"
            >
              <RefreshCw className="w-3.5 h-3.5 text-primary" />
              <span>Verify</span>
            </button>
          )}

          <span
            className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-md shrink-0 border ${
              isOffline
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : isChecking
                ? 'bg-teal-500/20 text-teal-400 border-teal-500/40'
                : isReady
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                : 'bg-secondary text-muted-foreground border-border'
            }`}
          >
            {isOffline ? 'Offline' : isChecking ? 'Checking' : isReady ? 'Cached & Ready' : 'Standby'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default OfflineDiagnosticBadge;
