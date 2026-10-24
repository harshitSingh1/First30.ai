import { Check, ChevronDown } from 'lucide-react';
import { useEmergencyRegion, EMERGENCY_REGIONS } from '@/contexts/EmergencyRegionContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface EmergencyNumberSelectorProps {
  variant?: 'header' | 'compact' | 'emergency-focused';
  className?: string;
}

export const EmergencyNumberSelector = ({
  className = '',
}: EmergencyNumberSelectorProps) => {
  const { emergencyNumber, selectedCountry, setRegionByCountryCode } =
    useEmergencyRegion();

  const currentRegion = EMERGENCY_REGIONS.find((r) => r.code === selectedCountry) || EMERGENCY_REGIONS[0];
  const numberOnly = (emergencyNumber || currentRegion.number).replace(/[^\d+]/g, '') || currentRegion.number;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          title={`Emergency region: ${currentRegion.name} (${numberOnly}) — Click to change`}
          className={`min-h-[44px] h-10 px-3 rounded-xl border border-border/60 bg-secondary/40 hover:bg-secondary/70 text-foreground transition-colors flex items-center gap-1.5 text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${className}`}
        >
          <span className="font-mono font-bold text-primary">{numberOnly}</span>
          <span className="text-sm ml-0.5 leading-none">{currentRegion.flag}</span>
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-popover border-border shadow-xl rounded-xl">
        <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
          Dialing for life-threatening emergencies
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {EMERGENCY_REGIONS.map((region) => {
          const isSelected = region.code === selectedCountry;
          return (
            <DropdownMenuItem
              key={region.code}
              onClick={() => setRegionByCountryCode(region.code)}
              className="flex items-center justify-between cursor-pointer py-2 text-sm"
            >
              <span className="flex items-center gap-2">
                <span className="text-base">{region.flag}</span>
                <span className="font-medium">{region.name}</span>
              </span>
              <span className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-primary">{region.number}</span>
                {isSelected && <Check className="w-4 h-4 text-primary" />}
              </span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default EmergencyNumberSelector;
