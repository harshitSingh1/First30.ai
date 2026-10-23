import { useState, useEffect } from 'react';
import { MapPin, Navigation, Loader2, Building2, Pill, Shield, Flame, ExternalLink } from 'lucide-react';
import { NearbyService } from '@/types/emergency';
import { UserLocation, getGoogleMapsSearchUrl } from '@/services/locationService';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface InteractiveMapRealProps {
  services: NearbyService[];
  selectedType?: string;
  userLocation: UserLocation | null;
  isLoading: boolean;
}

const typeConfig = {
  hospital: { color: '#14b8a6', icon: Building2, label: 'Hospital' },
  pharmacy: { color: '#22c55e', icon: Pill, label: 'Pharmacy' },
  police: { color: '#3b82f6', icon: Shield, label: 'Police' },
  fire: { color: '#f59e0b', icon: Flame, label: 'Fire Station' },
};

const InteractiveMapReal = ({ services, selectedType, userLocation, isLoading }: InteractiveMapRealProps) => {
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMapReady(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const filteredServices = selectedType 
    ? services.filter(s => s.type === selectedType)
    : services;

  // Calculate positions based on actual lat/lng if available
  const getServicePosition = (service: any, index: number, total: number) => {
    // If we have real lat/lng and user location, calculate relative position
    if (service.lat && service.lng && userLocation) {
      const latDiff = (service.lat - userLocation.lat) * 500;
      const lngDiff = (service.lng - userLocation.lng) * 500;
      
      // Clamp to reasonable bounds
      const top = Math.max(10, Math.min(90, 50 + latDiff));
      const left = Math.max(10, Math.min(90, 50 + lngDiff));
      
      return { top: `${top}%`, left: `${left}%` };
    }
    
    // Fallback to circular distribution
    const angle = (index / total) * 2 * Math.PI;
    const radius = 25 + Math.random() * 15;
    return {
      top: `${50 + Math.sin(angle) * radius}%`,
      left: `${50 + Math.cos(angle) * radius}%`,
    };
  };

  const openGoogleMaps = (type?: string) => {
    if (userLocation) {
      const url = getGoogleMapsSearchUrl(userLocation, type || 'hospital');
      window.open(url, '_blank');
    }
  };

  return (
    <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-b from-secondary/50 to-background/80 border border-border/50">
      {/* Map grid background */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(hsl(var(--primary) / 0.1) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--primary) / 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '30px 30px',
        }}
      />

      {/* Radial glow from center */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at 50% 50%, hsl(var(--primary) / 0.15) 0%, transparent 50%)',
        }}
      />

      {isLoading || !mapReady ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-10 h-10 mx-auto mb-3 text-primary animate-spin" />
            <p className="text-muted-foreground">
              {isLoading ? 'Finding nearby services...' : 'Loading map...'}
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* User location marker */}
          {userLocation && (
            <div 
              className="absolute z-20 transform -translate-x-1/2 -translate-y-1/2"
              style={{ top: '50%', left: '50%' }}
            >
              <div className="relative">
                <div className="absolute w-20 h-20 -inset-7 bg-primary/20 rounded-full animate-ping" />
                <div className="absolute w-12 h-12 -inset-3 bg-primary/30 rounded-full" />
                <div className="w-6 h-6 bg-primary rounded-full shadow-lg flex items-center justify-center">
                  <Navigation className="w-3 h-3 text-primary-foreground fill-current" />
                </div>
              </div>
            </div>
          )}

          {/* Service markers */}
          {filteredServices.slice(0, 15).map((service, index) => {
            const config = typeConfig[service.type];
            const Icon = config.icon;
            const position = getServicePosition(service, index, filteredServices.length);
            
            return (
              <div
                key={service.id}
                className={cn(
                  'absolute z-10 transform -translate-x-1/2 -translate-y-1/2',
                  'transition-all duration-300 hover:scale-125 cursor-pointer',
                  'group'
                )}
                style={position}
              >
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center shadow-lg ring-2 ring-white/20"
                  style={{ backgroundColor: config.color }}
                >
                  <Icon className="w-4 h-4 text-white" />
                </div>
                
                {/* Tooltip on hover */}
                <div className={cn(
                  'absolute bottom-full left-1/2 -translate-x-1/2 mb-2',
                  'px-3 py-2 rounded-lg bg-popover text-popover-foreground',
                  'text-xs whitespace-nowrap shadow-xl border border-border/50',
                  'opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none',
                  'max-w-[200px]'
                )}>
                  <p className="font-medium truncate">{service.name}</p>
                  <p className="text-muted-foreground">{service.distance}</p>
                </div>
              </div>
            );
          })}

          {/* No location message */}
          {!userLocation && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm">
              <div className="text-center p-6">
                <MapPin className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground">Enable location to see the map</p>
              </div>
            </div>
          )}

          {/* Map controls */}
          <div className="absolute bottom-4 right-4 flex flex-col gap-2">
            <button className="w-10 h-10 rounded-xl bg-background/80 backdrop-blur-sm border border-border/50 flex items-center justify-center text-foreground hover:bg-background transition-colors">
              <span className="text-lg font-bold">+</span>
            </button>
            <button className="w-10 h-10 rounded-xl bg-background/80 backdrop-blur-sm border border-border/50 flex items-center justify-center text-foreground hover:bg-background transition-colors">
              <span className="text-lg font-bold">−</span>
            </button>
          </div>

          {/* Open in Google Maps button */}
          <Button 
            onClick={() => openGoogleMaps(selectedType)}
            className="absolute bottom-4 left-4 gap-2 shadow-lg"
            disabled={!userLocation}
          >
            <ExternalLink className="w-4 h-4" />
            Open in Maps
          </Button>
        </>
      )}
    </div>
  );
};

export default InteractiveMapReal;
