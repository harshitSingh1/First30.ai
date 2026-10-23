import { KitItem } from '@/data/firstAidKitData';
import { cn } from '@/lib/utils';
import { ChevronRight, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface KitItemCardProps {
  item: KitItem;
  onLearnMore: () => void;
  onListen?: () => void;
  isListening?: boolean;
}

const KitItemCard = ({ item, onLearnMore, onListen, isListening }: KitItemCardProps) => {
  const Icon = item.icon;

  const categoryColors = {
    essential: 'bg-primary/10 border-primary/30 text-primary',
    'age-specific': 'bg-cyan-500/10 border-cyan-500/30 text-cyan-600',
    'risk-specific': 'bg-amber-500/10 border-amber-500/30 text-amber-600',
    optional: 'bg-secondary border-border/50 text-muted-foreground',
  };

  const categoryLabels = {
    essential: 'Essential',
    'age-specific': 'Age-Specific',
    'risk-specific': 'Risk-Specific',
    optional: 'Recommended',
  };

  return (
    <div className="premium-card p-5 hover:shadow-lg transition-all duration-300 group">
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className={cn(
          "w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0",
          "bg-primary/10 group-hover:bg-primary/15 transition-colors"
        )}>
          <Icon className="w-7 h-7 text-primary" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-semibold text-foreground">{item.name}</h3>
            <span className={cn(
              "px-2 py-0.5 text-xs font-medium rounded-full border flex-shrink-0",
              categoryColors[item.category]
            )}>
              {categoryLabels[item.category]}
            </span>
          </div>
          
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {item.whyNeeded}
          </p>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onLearnMore}
              className="text-primary hover:text-primary hover:bg-primary/10 gap-1 px-3"
            >
              Learn how to use
              <ChevronRight className="w-4 h-4" />
            </Button>

            {onListen && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onListen}
                className={cn(
                  "gap-1 px-3",
                  isListening 
                    ? "text-primary bg-primary/10" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Volume2 className={cn("w-4 h-4", isListening && "animate-pulse")} />
                Listen
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KitItemCard;
