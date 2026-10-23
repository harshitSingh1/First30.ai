import { NearbyService } from '@/types/emergency';
import { Building2, Pill, Shield, Flame, Phone, Clock, MapPin, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MapPanelProps {
  services: NearbyService[];
  selectedType?: string;
}

const typeConfig = {
  hospital: { icon: Building2, color: 'text-red-400 bg-red-500/20' },
  pharmacy: { icon: Pill, color: 'text-green-400 bg-green-500/20' },
  police: { icon: Shield, color: 'text-blue-400 bg-blue-500/20' },
  fire: { icon: Flame, color: 'text-orange-400 bg-orange-500/20' },
};

const MapPanel = ({ services, selectedType }: MapPanelProps) => {
  const filteredServices = selectedType 
    ? services.filter(s => s.type === selectedType)
    : services;

  return (
    <div className="space-y-4">
      {/* Map placeholder */}
      <div className="glass-card aspect-video flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>Map integration coming soon</p>
        </div>
      </div>

      {/* Services list */}
      <div className="space-y-3">
        {filteredServices.map((service) => {
          const config = typeConfig[service.type];
          const Icon = config.icon;
          
          return (
            <div key={service.id} className="glass-card p-4">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl ${config.color} flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-medium text-foreground">{service.name}</h4>
                    {service.isOpen24h && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-success/20 text-success">24h</span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{service.address}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {service.distance}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {service.eta}
                    </span>
                  </div>
                </div>
              </div>
              {service.phone && (
                <div className="flex gap-2 mt-3">
                  <Button size="sm" className="flex-1 h-9" asChild>
                    <a href={`tel:${service.phone}`}>
                      <Phone className="w-4 h-4 mr-1" />
                      Call
                    </a>
                  </Button>
                  <Button size="sm" variant="outline" className="h-9">
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MapPanel;
