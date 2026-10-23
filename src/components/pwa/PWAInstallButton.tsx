import React, { useState } from 'react';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { Download, Share2, PlusSquare, X, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PWAInstallButtonProps {
  variant?: 'header' | 'hero' | 'card' | 'drawer';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ variant = 'header', className = '' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [showBrowserModal, setShowBrowserModal] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  // If already running standalone, display a subtle indicator or nothing
  if (isInstalled) {
    if (variant === 'card') {
      return (
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-2 rounded-xl border border-emerald-500/20">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>App installed &amp; offline ready on this device</span>
        </div>
      );
    }
    if (variant === 'drawer') {
      return (
        <div className={`p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/8 text-left ${className}`}>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1.5">
                <span className="text-xs font-semibold text-foreground">First30 Installed</span>
                <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-md border border-emerald-500/30">
                  Ready
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground truncate">
                Instant access on this device
              </p>
            </div>
          </div>
        </div>
      );
    }
    return null;
  }

  // Handle Chromium / Android native prompt, with actionable fallback for all browsers
  const handleInstallClick = async () => {
    if (isInstallable) {
      const outcome = await install();
      if (outcome) {
        setInstallSuccess(true);
      } else {
        // If dismissed or failed, show instructions
        setShowBrowserModal(true);
      }
    } else if (isIOS) {
      setShowIOSModal(true);
    } else {
      setShowBrowserModal(true);
    }
  };

  return (
    <>
      {variant === 'header' && (
        <button
          onClick={handleInstallClick}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all ${className}`}
          title="Install First30 on your device for instant offline access"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Install App</span>
          <span className="sm:hidden">Install</span>
        </button>
      )}

      {variant === 'hero' && (
        <Button
          onClick={handleInstallClick}
          variant="outline"
          size="sm"
          className={`h-9 px-4 rounded-xl text-xs font-semibold border-teal-500/30 text-teal-400 hover:bg-teal-500/10 transition-colors flex items-center gap-2 ${className}`}
        >
          <Download className="w-3.5 h-3.5" />
          <span>Install for Offline Emergencies</span>
        </Button>
      )}

      {variant === 'card' && (
        <div className="bg-card/70 border border-border/70 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4 text-teal-400" />
              <h4 className="text-sm font-semibold text-foreground">Save First30 to Home Screen</h4>
            </div>
            <p className="text-xs text-muted-foreground">
              Instant one-tap launch with all 15 emergency protocols, CPR pacing, and timers functioning 100% offline.
            </p>
          </div>
          <Button
            onClick={handleInstallClick}
            size="sm"
            className="bg-teal-600 hover:bg-teal-500 text-white shrink-0 rounded-xl text-xs font-medium"
          >
            {isIOS ? 'Show iOS Instructions' : 'Install First30'}
          </Button>
        </div>
      )}

      {variant === 'drawer' && (
        <div className={`p-3 rounded-xl border border-border/70 bg-card/70 text-left ${className}`}>
          <div className="flex items-start gap-2.5 mb-2.5">
            <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 mt-0.5">
              <Download className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-semibold text-foreground">Install First30</h4>
              <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">
                Quick access from your home screen or desktop
              </p>
            </div>
          </div>
          <Button
            onClick={handleInstallClick}
            size="sm"
            className="w-full h-8.5 min-h-[36px] text-xs font-semibold rounded-lg bg-teal-600 hover:bg-teal-500 text-white shadow-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>
              {isIOS ? 'Install on iOS' : isInstallable ? 'Install First30' : 'How to Install'}
            </span>
          </Button>
        </div>
      )}

      {/* iOS Safari manual installation modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-2xl bg-card border border-border p-6 shadow-2xl relative text-left">
            <button
              onClick={() => setShowIOSModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400">
                <Download className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Install on iPhone / iPad</h3>
                <p className="text-[11px] text-muted-foreground">iOS Safari installation steps</p>
              </div>
            </div>

            <ol className="text-xs text-muted-foreground space-y-3.5 my-4">
              <li className="flex items-start gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-500/20 text-[10px] font-bold text-teal-300">
                  1
                </span>
                <span>
                  Tap the <Share2 className="w-3.5 h-3.5 inline mx-1 text-primary" /> <strong>Share</strong> button at the bottom of Safari.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-500/20 text-[10px] font-bold text-teal-300">
                  2
                </span>
                <span>
                  Scroll down the share sheet and tap <PlusSquare className="w-3.5 h-3.5 inline mx-1 text-primary" /> <strong>Add to Home Screen</strong>.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-500/20 text-[10px] font-bold text-teal-300">
                  3
                </span>
                <span>
                  Tap <strong>Add</strong> in the top-right corner to place First30 directly on your home screen.
                </span>
              </li>
            </ol>

            <Button
              onClick={() => setShowIOSModal(false)}
              className="w-full mt-2 rounded-xl text-xs font-semibold bg-teal-600 hover:bg-teal-500 text-white min-h-[44px]"
            >
              Got it
            </Button>
          </div>
        </div>
      )}

      {/* Desktop / Android / General browser manual installation modal */}
      {showBrowserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-card border border-border p-6 shadow-2xl relative text-left">
            <button
              onClick={() => setShowBrowserModal(false)}
              className="absolute top-4 right-4 p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400">
                <Download className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Install First30 on Your Device</h3>
                <p className="text-[11px] text-muted-foreground">Instant launch &amp; 100% offline emergency access</p>
              </div>
            </div>

            <div className="text-xs text-muted-foreground space-y-3.5 my-4">
              <div className="p-3 rounded-xl bg-secondary/50 border border-border/50">
                <p className="font-semibold text-foreground text-xs mb-1">Chrome / Edge / Chromium Browsers:</p>
                <p className="text-[11px] leading-relaxed">
                  Look for the <strong>Install</strong> icon (<Download className="w-3 h-3 inline mx-0.5 text-primary" />) in your browser address bar on the right, or click the browser menu (<strong>⋮</strong> or <strong>⋯</strong>) and select <strong>&quot;Install First30&quot;</strong> or <strong>&quot;Add to Home screen&quot;</strong>.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-secondary/50 border border-border/50">
                <p className="font-semibold text-foreground text-xs mb-1">Firefox &amp; Other Mobile Browsers:</p>
                <p className="text-[11px] leading-relaxed">
                  Tap the menu button (<strong>⋮</strong> or <strong>≡</strong>) and choose <strong>&quot;Install&quot;</strong> or <strong>&quot;Add to Home screen&quot;</strong> to save First30 with offline support.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-secondary/50 border border-border/50">
                <p className="font-semibold text-foreground text-xs mb-1">Safari on Mac or iPad:</p>
                <p className="text-[11px] leading-relaxed">
                  Click <strong>File</strong> in the top menu bar &rarr; <strong>&quot;Add to Dock...&quot;</strong> or use the Share icon &rarr; <strong>&quot;Add to Home Screen&quot;</strong>.
                </p>
              </div>
            </div>

            <Button
              onClick={() => setShowBrowserModal(false)}
              className="w-full mt-2 rounded-xl text-xs font-semibold bg-teal-600 hover:bg-teal-500 text-white min-h-[44px]"
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default PWAInstallButton;
