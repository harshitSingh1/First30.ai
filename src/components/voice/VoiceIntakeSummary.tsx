import { 
  AlertCircle, 
  Heart, 
  Wind, 
  Droplet, 
  User, 
  MapPin, 
  Clock,
  ArrowRight,
  Copy,
  Check
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { EmergencySummary, UrgencyLevel } from '@/hooks/useVoiceIntake';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface VoiceIntakeSummaryProps {
  summary: EmergencySummary;
  suggestedCategory: string | null;
  suggestedRoute: string | null;
  className?: string;
}

const urgencyConfig: Record<UrgencyLevel, { label: string; className: string; icon: string }> = {
  critical: { 
    label: 'Critical', 
    className: 'bg-blue-600 text-white border-blue-700',
    icon: '🔵'
  },
  high: { 
    label: 'High', 
    className: 'bg-amber-500 text-white border-amber-600',
    icon: '🟡'
  },
  medium: { 
    label: 'Medium', 
    className: 'bg-teal-500 text-white border-teal-600',
    icon: '🟢'
  },
  low: { 
    label: 'Low', 
    className: 'bg-slate-500 text-white border-slate-600',
    icon: '⚪'
  },
};

const VoiceIntakeSummary = ({
  summary,
  suggestedCategory,
  suggestedRoute,
  className,
}: VoiceIntakeSummaryProps) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const formatDuration = () => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - summary.timeStarted.getTime()) / 1000);
    const mins = Math.floor(diff / 60);
    const secs = diff % 60;
    return `${mins}m ${secs}s`;
  };

  const getDisplayValue = (value: string) => {
    const displayMap: Record<string, string> = {
      'unknown': 'Not determined',
      'yes': 'Yes',
      'no': 'No',
      'normal': 'Normal',
      'abnormal': 'Difficult / Abnormal',
      'not_breathing': 'Not breathing',
      'none': 'None',
      'minor': 'Minor',
      'severe': 'Severe',
      'infant': 'Infant (0-1)',
      'child': 'Child (1-12)',
      'adult': 'Adult (12-65)',
      'elderly': 'Elderly (65+)',
    };
    return displayMap[value] || value;
  };

  const handleCopy = async () => {
    const summaryText = `
Emergency Summary
-----------------
Type: ${summary.emergencyType || 'Not determined'}
Urgency: ${urgencyConfig[summary.urgencyLevel].label}
Conscious: ${getDisplayValue(summary.conscious)}
Breathing: ${getDisplayValue(summary.breathing)}
Bleeding: ${getDisplayValue(summary.bleeding)}
Age Group: ${getDisplayValue(summary.ageGroup)}
Location: ${summary.location || 'Not provided'}
Duration: ${formatDuration()}
Time: ${summary.timeStarted.toLocaleString()}

Additional Info:
${summary.additionalInfo.join('\n')}
    `.trim();

    try {
      await navigator.clipboard.writeText(summaryText);
      setCopied(true);
      toast({ title: 'Copied!', description: 'Summary copied to clipboard' });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: 'Copy failed', variant: 'destructive' });
    }
  };

  const handleOpenGuidedSteps = () => {
    if (suggestedRoute) {
      navigate(`/emergency/${suggestedRoute}`);
    }
  };

  return (
    <div className={cn('flex flex-col h-full', className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Emergency Summary</h3>
        <Badge className={cn('text-xs', urgencyConfig[summary.urgencyLevel].className)}>
          {urgencyConfig[summary.urgencyLevel].icon} {urgencyConfig[summary.urgencyLevel].label}
        </Badge>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto pr-2">
        {/* Emergency Type */}
        <div className="premium-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <AlertCircle className="w-4 h-4" />
            <span className="text-xs uppercase tracking-wide">Emergency Type</span>
          </div>
          <p className="font-medium text-foreground">
            {summary.emergencyType || 'Emergency Assessment in Progress'}
          </p>
        </div>

        {/* Status Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Conscious */}
          <div className="premium-card p-3">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Heart className="w-3.5 h-3.5" />
              <span className="text-xs">Conscious</span>
            </div>
            <p className={cn(
              'text-sm font-medium',
              summary.conscious === 'no' ? 'text-primary' : 'text-foreground'
            )}>
              {getDisplayValue(summary.conscious)}
            </p>
          </div>

          {/* Breathing */}
          <div className="premium-card p-3">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Wind className="w-3.5 h-3.5" />
              <span className="text-xs">Breathing</span>
            </div>
            <p className={cn(
              'text-sm font-medium',
              summary.breathing === 'not_breathing' ? 'text-primary' : 'text-foreground'
            )}>
              {getDisplayValue(summary.breathing)}
            </p>
          </div>

          {/* Bleeding */}
          <div className="premium-card p-3">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Droplet className="w-3.5 h-3.5" />
              <span className="text-xs">Bleeding</span>
            </div>
            <p className={cn(
              'text-sm font-medium',
              summary.bleeding === 'severe' ? 'text-accent-foreground' : 'text-foreground'
            )}>
              {getDisplayValue(summary.bleeding)}
            </p>
          </div>

          {/* Age Group */}
          <div className="premium-card p-3">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <User className="w-3.5 h-3.5" />
              <span className="text-xs">Age Group</span>
            </div>
            <p className="text-sm font-medium text-foreground">
              {getDisplayValue(summary.ageGroup)}
            </p>
          </div>
        </div>

        {/* Location */}
        <div className="premium-card p-3">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <MapPin className="w-3.5 h-3.5" />
            <span className="text-xs">Location</span>
          </div>
          <p className="text-sm font-medium text-foreground">
            {summary.location || 'Not provided yet'}
          </p>
        </div>

        {/* Time */}
        <div className="premium-card p-3">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Clock className="w-3.5 h-3.5" />
            <span className="text-xs">Time Started</span>
          </div>
          <p className="text-sm font-medium text-foreground">
            {summary.timeStarted.toLocaleTimeString()} ({formatDuration()} ago)
          </p>
        </div>

        {/* Suggested Category / Emergency Actions */}
        {suggestedCategory ? (
          <div className="premium-card p-4 border-primary/30 bg-primary/5">
            <p className="text-sm text-muted-foreground mb-3">
              Based on your description, this appears to be:
            </p>
            <p className="font-semibold text-primary mb-4">{suggestedCategory}</p>
            
            <Button 
              onClick={handleOpenGuidedSteps}
              className="w-full gap-2 min-h-[44px]"
              disabled={!suggestedRoute}
            >
              Open Guided Emergency Steps
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <div className="premium-card p-4 border-border bg-card/60">
            <p className="text-sm text-muted-foreground mb-3">
              Ready to start step-by-step guidance:
            </p>
            <Button 
              onClick={() => navigate('/citizen')}
              className="w-full gap-2 min-h-[44px]"
            >
              Select from 15 Emergency Protocols
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Copy Button */}
      <div className="pt-4 mt-4 border-t border-border/50">
        <Button
          onClick={handleCopy}
          variant="outline"
          className="w-full gap-2"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              Copy Summary
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default VoiceIntakeSummary;
