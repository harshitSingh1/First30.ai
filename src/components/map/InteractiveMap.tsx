import { useState, useEffect } from 'react';
import { MapPin, Navigation, Loader2, Building2, Pill, Shield, Flame } from 'lucide-react';
import { NearbyService } from '@/types/emergency';
import { cn } from '@/lib/utils';

interface InteractiveMapProps {
  services: NearbyService[];
  selectedType?: string;
}

const typeConfig = {
  hospital: { color: '#f87171', icon: Building2 },
  pharmacy: { color: '#4ade80', icon: Pill },
  police: { color: '#60a5fa', icon: Shield },
  fire: { color: '#fb923c', icon: Flame },
};

const InteractiveMap = ({ services, selectedType }: InteractiveMapProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [userLocation, setUserLocation] = useState({ lat: 40.7128, lng: -74.006 });

  useEffect(() => {
    // Simulate map loading
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const filteredServices = selectedType 
    ? services.filter(s => s.type === selectedType)
    : services;

  // Generate mock positions for services around the center
  const getServicePosition = (index: number, total: number) => {
    const angle = (index / total) * 2 * Math.PI;
    const radius = 30 + Math.random() * 15;
    return {
      top: `${50 + Math.sin(angle) * radius}%`,
      left: `${50 + Math.cos(angle) * radius}%`,
    };
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
          background: 'radial-gradient(circle at 50% 50%, hsl(187 85% 43% / 0.1) 0%, transparent 50%)',
        }}
      />

      {isLoading ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-10 h-10 mx-auto mb-3 text-primary animate-spin" />
            <p className="text-muted-foreground">Loading map...</p>
          </div>
        </div>
      ) : (
        <>
          {/* User location marker */}
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

          {/* Service markers */}
          {filteredServices.map((service, index) => {
            const config = typeConfig[service.type];
            const Icon = config.icon;
            const position = getServicePosition(index, filteredServices.length);
            
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
                  className="w-8 h-8 rounded-full flex items-center justify-center shadow-lg"
                  style={{ backgroundColor: config.color }}
                >
                  <Icon className="w-4 h-4 text-white" />
                </div>
                
                {/* Tooltip on hover */}
                <div className={cn(
                  'absolute bottom-full left-1/2 -translate-x-1/2 mb-2',
                  'px-3 py-1.5 rounded-lg bg-popover text-popover-foreground',
                  'text-xs whitespace-nowrap shadow-xl border border-border/50',
                  'opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none'
                )}>
                  {service.name}
                  <span className="text-muted-foreground ml-2">{service.distance}</span>
                </div>
              </div>
            );
          })}

          {/* Map controls */}
          <div className="absolute bottom-4 right-4 flex flex-col gap-2">
            <button className="w-10 h-10 rounded-xl bg-background/80 backdrop-blur-sm border border-border/50 flex items-center justify-center text-foreground hover:bg-background transition-colors">
              <span className="text-lg font-bold">+</span>
            </button>
            <button className="w-10 h-10 rounded-xl bg-background/80 backdrop-blur-sm border border-border/50 flex items-center justify-center text-foreground hover:bg-background transition-colors">
              <span className="text-lg font-bold">−</span>
            </button>
          </div>

          {/* Location button */}
          <button className="absolute bottom-4 left-4 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium flex items-center gap-2 shadow-lg hover:opacity-90 transition-opacity">
            <MapPin className="w-4 h-4" />
            My Location
          </button>
        </>
      )}
    </div>
  );
};

export default InteractiveMap;
