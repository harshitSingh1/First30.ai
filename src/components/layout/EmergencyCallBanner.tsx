import { Phone, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEmergencyRegion } from '@/contexts/EmergencyRegionContext';

interface EmergencyCallBannerProps {
  emergencyNumber?: string;
  className?: string;
}

const EmergencyCallBanner = ({ 
  emergencyNumber: propNumber,
  className = '',
}: EmergencyCallBannerProps) => {
  const { emergencyNumber: contextNumber, toggleStandardNumber, selectedCountry } = useEmergencyRegion();
  const activeNumber = propNumber || contextNumber;

  const handleCall = () => {
    window.location.href = `tel:${activeNumber}`;
  };

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-50 p-3 bg-background/80 backdrop-blur-md border-t border-border/40 ${className}`}>
      <div className="container mx-auto flex items-center gap-2 max-w-xl">
        <Button
          onClick={handleCall}
          className="flex-1 h-13 bg-emergency hover:bg-emergency/90 text-emergency-foreground 
                     text-base md:text-lg font-bold rounded-xl pulse-emergency flex items-center justify-center gap-3
                     shadow-lg transition-transform active:scale-[0.99]"
          size="lg"
        >
          <Phone className="w-5 h-5 animate-pulse" />
          <span>Call Emergency: {activeNumber}</span>
        </Button>
        <button
          onClick={toggleStandardNumber}
          title="Switch standard emergency number (911 / 112)"
          className="h-13 px-3.5 rounded-xl border border-border/60 bg-secondary/60 hover:bg-secondary text-xs font-semibold flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors shrink-0"
        >
          <Globe className="w-3.5 h-3.5 text-primary" />
          <span>{selectedCountry}</span>
        </button>
      </div>
    </div>
  );
};

export default EmergencyCallBanner;
