import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Menu,
  Activity,
  Phone,
  ArrowLeft,
  ShieldAlert,
  Sun,
  Moon,
  X,
  Package,
  MapPin,
  Mic,
  Brain,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import LanguageSelector from '@/components/accessibility/LanguageSelector';
import EmergencyNumberSelector from './EmergencyNumberSelector';
import { useEmergencyRegion } from '@/contexts/EmergencyRegionContext';
import { useScreenWakeLock } from '@/hooks/useScreenWakeLock';
import PWAInstallButton from '@/components/pwa/PWAInstallButton';
import OfflineDiagnosticBadge from '@/components/pwa/OfflineDiagnosticBadge';
import BrandLogo from '@/components/brand/BrandLogo';

const standardNavItems = [
  { label: 'Emergency Help', path: '/citizen' },
  { label: 'First Aid Kit', path: '/first-aid-kit' },
  { label: 'Nearby Help', path: '/map' },
  { label: 'Voice Guide', path: '/voice' },
];

const drawerNavItems = [
  { label: 'Emergency Help', path: '/citizen', icon: ShieldAlert },
  { label: 'First Aid Kit', path: '/first-aid-kit', icon: Package },
  { label: 'Nearby Help', path: '/map', icon: MapPin },
  { label: 'Voice Guide', path: '/voice', icon: Mic },
  { label: 'CPR Rhythm Practice', path: '/cpr', icon: Activity },
  { label: 'Intelligence Center', path: '/intelligence', icon: Brain },
];

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const { emergencyNumber } = useEmergencyRegion();

  const isEmergencyActive =
    location.pathname.startsWith('/emergency') || location.pathname === '/cpr';

  const { isSupported: isWakeLockSupported, isActive: isWakeLockActive } = useScreenWakeLock(isEmergencyActive);

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  // FOCUSED EMERGENCY HEADER (Active Mode)
  if (isEmergencyActive) {
    return (
      <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur-md border-b border-border/40 shadow-sm pt-[env(safe-area-inset-top,0px)]">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-2 md:gap-4">
          {/* Left: Exit Emergency */}
          <button
            onClick={() => navigate('/citizen')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors shrink-0"
          >
            <ArrowLeft className="w-4 h-4 text-primary" />
            <span className="hidden sm:inline">Exit Emergency</span>
            <span className="sm:hidden">Exit</span>
          </button>

          {/* Center: Calm Emergency Status, Wake Lock & Offline Reassurance Badges */}
          <div className="flex items-center gap-2 md:gap-3 text-xs md:text-sm font-semibold">
            <div className="hidden sm:flex items-center gap-1.5 text-foreground/90">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
              <span className="tracking-wide">Active Guidance</span>
            </div>

            {/* Offline Diagnostic Badge */}
            <OfflineDiagnosticBadge compact />

            {/* Screen Wake Lock Badge */}
            <div
              title={
                isWakeLockActive
                  ? 'Screen wake lock active: display will stay awake'
                  : isWakeLockSupported
                  ? 'Screen wake lock standby'
                  : 'Screen wake lock unsupported on this device: adjust screen timeout in device settings if needed'
              }
              className={`px-2 py-0.5 rounded-md text-[11px] font-medium flex items-center gap-1.5 transition-colors ${
                isWakeLockActive
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'bg-secondary/60 text-muted-foreground border border-border/50'
              }`}
            >
              {isWakeLockActive ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  <span className="hidden md:inline">Screen awake</span>
                  <span className="md:hidden">Awake</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="hidden md:inline">Screen may sleep</span>
                  <span className="md:hidden">May sleep</span>
                </>
              )}
            </div>
          </div>

          {/* Right: Country toggle + Call button */}
          <div className="flex items-center gap-2 shrink-0">
            <EmergencyNumberSelector />
            <a
              href={`tel:${emergencyNumber}`}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs md:text-sm flex items-center gap-2 shadow-md transition-transform active:scale-95"
            >
              <Phone className="w-4 h-4" />
              <span>Call {emergencyNumber}</span>
            </a>
          </div>
        </div>
      </header>
    );
  }

  // STANDARD HEADER (3-Zone Contract)
  return (
    <header className="sticky top-0 z-50 w-full bg-background/90 backdrop-blur-md border-b border-border/40 shadow-xs pt-[env(safe-area-inset-top,0px)]">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4 md:gap-8">
        {/* Zone 1: Brand Wordmark */}
        <Link to="/" className="flex items-center shrink-0">
          <BrandLogo size="md" />
        </Link>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-muted-foreground">
          {standardNavItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`hover:text-foreground transition-colors whitespace-nowrap py-1 ${
                isActive(item.path) ? 'text-primary font-semibold' : ''
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Zone 3: Emergency Number Selector + Install + Primary Emergency CTA */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* PWA Install Button (renders when installable) */}
          <PWAInstallButton variant="header" />

          <EmergencyNumberSelector />
          
          <div className="hidden sm:block">
            <LanguageSelector variant="compact" />
          </div>

          {/* Mobile Menu Trigger & Polished Hamburger Sidebar Drawer */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Open navigation menu"
                className="h-11 w-11 min-h-[44px] min-w-[44px] text-foreground"
              >
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>

            <SheetContent
              side="right"
              className="w-[85vw] max-w-sm sm:w-80 h-[100dvh] flex flex-col p-0 bg-background border-l border-border/60 pt-[env(safe-area-inset-top,0px)] pb-[env(safe-area-inset-bottom,0px)] [&>button:last-child]:hidden"
            >
              <SheetTitle className="sr-only">First30.ai Menu</SheetTitle>
              <SheetDescription className="sr-only">
                Offline emergency guidance, installation options, language switcher, and app navigation
              </SheetDescription>

              {/* Section A: Header */}
              <div className="flex items-center justify-between px-4 py-3.5 border-b border-border/40 shrink-0">
                <Link
                  to="/"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <BrandLogo size="sm" textSize="text-base" />
                </Link>

                <SheetClose asChild>
                  <button
                    type="button"
                    aria-label="Close navigation menu"
                    className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary/60 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </SheetClose>
              </div>

              {/* Scrollable Drawer Body */}
              <div className="flex-1 overflow-y-auto divide-y divide-border/30 space-y-0">
                {/* Section B: Offline Readiness Card */}
                <div className="px-4 py-3">
                  <OfflineDiagnosticBadge variant="drawer" />
                </div>

                {/* Section C: Install First30 Card */}
                <div className="px-4 py-3">
                  <PWAInstallButton variant="drawer" />
                </div>

                {/* Section D: Language Selector */}
                <div className="px-4 py-3">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5 px-0.5">
                    Language
                  </div>
                  <LanguageSelector variant="drawer" />
                </div>

                {/* Section E: Navigation */}
                <div className="px-4 py-3">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2 px-0.5">
                    Navigation
                  </div>
                  <nav className="space-y-1" aria-label="Sidebar Navigation">
                    {drawerNavItems.map((item) => {
                      const ItemIcon = item.icon;
                      const active = isActive(item.path);
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={() => setIsOpen(false)}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl min-h-[44px] text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary border-l-2 ${
                            active
                              ? 'bg-primary/15 text-primary font-semibold border-primary shadow-xs'
                              : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50 border-transparent'
                          }`}
                        >
                          <ItemIcon
                            className={`w-4 h-4 shrink-0 transition-colors ${
                              active ? 'text-primary' : 'text-muted-foreground'
                            }`}
                          />
                          <span className="truncate">{item.label}</span>
                        </Link>
                      );
                    })}
                  </nav>
                </div>
              </div>

              {/* Section F: Footer */}
              <div className="mt-auto px-4 py-3.5 border-t border-border/40 bg-secondary/15 shrink-0">
                <p className="text-[11px] leading-relaxed text-muted-foreground">
                  For life-threatening emergencies, always dial{' '}
                  <span className="font-semibold text-foreground">{emergencyNumber}</span> or local emergency dispatch services.
                </p>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
