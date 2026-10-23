import React from 'react';
import { useNetworkAndCacheStatus } from '@/hooks/useNetworkAndCacheStatus';
import { ShieldCheck, WifiOff, Loader2, AlertCircle, HardDrive } from 'lucide-react';

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
    cacheReadiness,
    cachedProtocolsCount,
    isServiceWorkerActive,
  } = useNetworkAndCacheStatus();

  // Drawer variant: compact, restrained status card for sidebar
  if (variant === 'drawer') {
    const isOffline = !isOnline;
    const isVerified = cacheReadiness === 'ready' || isServiceWorkerActive;
    const isPreparing = cacheReadiness === 'preparing';

    let title = 'Offline Ready';
    let subtitle = 'Emergency guidance is available offline.';
    let statusLabel = 'Cached';
    let badgeColor = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
    let iconBg = 'bg-emerald-500/15 text-emerald-400';
    let Icon = ShieldCheck;

    if (isOffline) {
      title = 'Offline Mode';
      subtitle = 'Running offline from device cache.';
      statusLabel = 'Offline';
      badgeColor = 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      iconBg = 'bg-amber-500/15 text-amber-400';
      Icon = WifiOff;
    } else if (isPreparing) {
      title = 'Checking Offline Cache';
      subtitle = 'Verifying emergency guidance cache...';
      statusLabel = 'Checking';
      badgeColor = 'bg-teal-500/15 text-teal-400 border-teal-500/30';
      iconBg = 'bg-teal-500/15 text-teal-400';
      Icon = Loader2;
    } else if (!isVerified) {
      title = 'Offline Availability May Vary';
      subtitle = 'Emergency guidance available locally.';
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
            <Icon className={`w-4 h-4 ${isPreparing ? 'animate-spin' : ''}`} />
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

  // If compact mode (for headers or toolbars)
  if (compact || variant === 'compact') {
    if (!isOnline) {
      return (
        <div
          title="Working Offline — 15 locally bundled protocols and precision CPR metronome available"
          className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-amber-500/15 text-amber-300 border border-amber-500/30 ${className}`}
        >
          <WifiOff className="w-3 h-3 text-amber-400" />
          <span>Offline Ready</span>
        </div>
      );
    }

    if (cacheReadiness === 'ready' || isServiceWorkerActive) {
      return (
        <div
          title="Emergency Guidance Cached: 15 protocols and CPR engine available even without internet"
          className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 ${className}`}
        >
          <ShieldCheck className="w-3 h-3" />
          <span className="hidden sm:inline">Offline Cached</span>
        </div>
      );
    }

    if (cacheReadiness === 'preparing') {
      return (
        <div
          title="Preparing offline emergency cache..."
          className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-secondary text-muted-foreground border border-border/50 ${className}`}
        >
          <Loader2 className="w-3 h-3 animate-spin text-teal-400" />
          <span className="hidden sm:inline">Preparing Cache</span>
        </div>
      );
    }

    // Default bundled fallback
    return (
      <div
        title="Bundled local emergency flows available"
        className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-secondary text-muted-foreground border border-border/50 ${className}`}
      >
        <HardDrive className="w-3 h-3 text-teal-400" />
        <span className="hidden sm:inline">Local Flows Ready</span>
      </div>
    );
  }

  // Expanded card mode (e.g. for Preparedness Hub or Settings)
  return (
    <div
      className={`rounded-2xl border p-4 transition-all ${
        !isOnline
          ? 'bg-amber-950/20 border-amber-500/30 text-amber-200'
          : cacheReadiness === 'ready' || isServiceWorkerActive
          ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
          : 'bg-card/70 border-border/70 text-foreground'
      } ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
              !isOnline
                ? 'bg-amber-500/20 text-amber-400'
                : cacheReadiness === 'ready' || isServiceWorkerActive
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'bg-teal-500/15 text-teal-400'
            }`}
          >
            {!isOnline ? (
              <WifiOff className="w-4 h-4" />
            ) : cacheReadiness === 'ready' || isServiceWorkerActive ? (
              <ShieldCheck className="w-4 h-4" />
            ) : cacheReadiness === 'preparing' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <HardDrive className="w-4 h-4" />
            )}
          </div>
          <div>
            <h4 className="text-sm font-bold text-foreground">
              {!isOnline
                ? 'Offline Emergency Mode Active'
                : cacheReadiness === 'ready' || isServiceWorkerActive
                ? 'Emergency Guidance Available Offline'
                : cacheReadiness === 'preparing'
                ? 'Preparing Offline Emergency Cache...'
                : 'Local Protocols Ready'}
            </h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              {!isOnline
                ? `Operating without internet connection. ${cachedProtocolsCount} emergency flows and CPR metronome are running from local cache.`
                : cacheReadiness === 'ready' || isServiceWorkerActive
                ? `All ${cachedProtocolsCount} clinically-reviewed protocols, visual guidance, audio engine, and timers are verified for zero-connectivity situations.`
                : cacheReadiness === 'preparing'
                ? 'Downloading and caching emergency guidance assets in background...'
                : `${cachedProtocolsCount} core emergency protocols are bundled in code and accessible immediately.`}
            </p>
          </div>
        </div>

        <span
          className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md shrink-0 border ${
            !isOnline
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              : cacheReadiness === 'ready' || isServiceWorkerActive
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
              : 'bg-secondary text-muted-foreground border-border'
          }`}
        >
          {!isOnline ? 'Offline' : 'Cached & Ready'}
        </span>
      </div>
    </div>
  );
};

export default OfflineDiagnosticBadge;
