import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import EmergencyCallBanner from './EmergencyCallBanner';
import OfflineIndicator from '@/components/pwa/OfflineIndicator';

interface LayoutProps {
  children: ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
  showEmergencyBanner?: boolean;
}

const Layout = ({ 
  children, 
  showHeader = true, 
  showFooter = true,
  showEmergencyBanner = false,
}: LayoutProps) => {
  const location = useLocation();
  
  // Active step flows have dedicated action controls; avoid overlapping floating banner
  const isDedicatedStepFlow = 
    location.pathname.startsWith('/emergency') || 
    location.pathname === '/cpr' ||
    location.pathname === '/summary';

  // Show emergency banner on citizen discovery or map unless suppressed
  const shouldShowBanner = !isDedicatedStepFlow && (showEmergencyBanner || location.pathname === '/citizen' || location.pathname === '/map');

  return (
    <div className="min-h-screen min-h-[100dvh] w-full overflow-x-hidden flex flex-col bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      {/* Subtle radial ambient highlight */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(20,184,166,0.08),rgba(255,255,255,0))] pointer-events-none" />
      
      {showHeader && <Header />}
      
      <main className={`flex-1 relative z-10 w-full ${shouldShowBanner ? 'pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))]' : ''}`}>
        {children}
      </main>
      
      {showFooter && !isDedicatedStepFlow && <Footer />}
      
      {shouldShowBanner && <EmergencyCallBanner />}

      {/* Persistent non-intrusive offline connectivity status & safe update prompt */}
      <OfflineIndicator isBannerPresent={shouldShowBanner} />
    </div>
  );
};

export default Layout;
