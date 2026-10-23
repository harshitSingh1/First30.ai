import { useState } from 'react';
import { DispatchPlan, RecommendedQuestion } from '@/types/dispatcher';
import { Priority } from '@/types/emergency';
import PriorityBadge from './PriorityBadge';
import { 
  Ambulance, 
  Flame, 
  Shield, 
  CheckCircle2, 
  Circle, 
  AlertTriangle,
  ThumbsUp,
  Pencil,
  X,
  MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

interface DispatchTriagePanelProps {
  plan: DispatchPlan | null;
  className?: string;
}

const DispatchTriagePanel = ({ plan, className }: DispatchTriagePanelProps) => {
  const [questions, setQuestions] = useState<RecommendedQuestion[]>(plan?.suggestedQuestions || []);
  
  const toggleQuestion = (id: string) => {
    setQuestions(prev => 
      prev.map(q => q.id === id ? { ...q, asked: !q.asked } : q)
    );
  };

  const handleApprove = () => {
    toast.success('Dispatch plan approved and sent to units');
  };

  const handleEdit = () => {
    toast.info('Edit mode - modify dispatch details');
  };

  const handleCancel = () => {
    toast.warning('Dispatch plan cancelled');
  };

  const getServiceIcon = (service: string) => {
    switch (service) {
      case 'ems':
        return <Ambulance className="w-4 h-4" />;
      case 'fire':
        return <Flame className="w-4 h-4" />;
      case 'police':
        return <Shield className="w-4 h-4" />;
      default:
        return <Ambulance className="w-4 h-4" />;
    }
  };

  const getServiceColor = (service: string) => {
    switch (service) {
      case 'ems':
        return 'bg-emergency/20 border-emergency/30 text-emergency';
      case 'fire':
        return 'bg-orange-500/20 border-orange-500/30 text-orange-400';
      case 'police':
        return 'bg-blue-500/20 border-blue-500/30 text-blue-400';
      default:
        return 'bg-primary/20 border-primary/30 text-primary';
    }
  };

  if (!plan) {
    return (
      <div className={cn("flex flex-col items-center justify-center h-full text-muted-foreground", className)}>
        <Ambulance className="w-12 h-12 mb-4 opacity-30" />
        <p className="text-sm">No dispatch plan</p>
        <p className="text-xs mt-1">Generate from call analysis</p>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Triage Level Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">Triage Level</span>
        </div>
        <PriorityBadge priority={plan.triageLevel} size="lg" />
      </div>

      <ScrollArea className="flex-1 pr-2">
        <div className="space-y-4">
          {/* Dispatch Units */}
          <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
            <h4 className="text-xs font-semibold text-primary uppercase mb-3 flex items-center gap-2">
              <Ambulance className="w-4 h-4" />
              Recommended Dispatch
            </h4>
            <div className="space-y-2">
              {plan.recommendations.map((rec) => (
                <div 
                  key={rec.id}
                  className={cn(
                    "p-2.5 rounded-lg border flex items-start gap-3",
                    getServiceColor(rec.service)
                  )}
                >
                  <div className="mt-0.5">{getServiceIcon(rec.service)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold uppercase">{rec.service}</span>
                      {rec.eta && (
                        <span className="text-xs opacity-80">ETA: {rec.eta}</span>
                      )}
                    </div>
                    <p className="text-xs opacity-80 mt-0.5">{rec.reason}</p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Unit Pills */}
            <div className="flex gap-2 mt-3 pt-3 border-t border-border/30">
              {plan.dispatchUnits.map((unit) => (
                <div 
                  key={unit}
                  className="px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-semibold flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3 h-3" />
                  {unit}
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Questions */}
          <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
            <h4 className="text-xs font-semibold text-primary uppercase mb-3 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Recommended Questions
            </h4>
            <div className="space-y-2">
              {questions.map((q) => (
                <div
                  key={q.id}
                  className={cn(
                    "flex items-start gap-3 p-2 rounded-lg transition-all cursor-pointer hover:bg-muted/50",
                    q.asked && "opacity-60"
                  )}
                  onClick={() => toggleQuestion(q.id)}
                >
                  <Checkbox 
                    checked={q.asked} 
                    className="mt-0.5"
                  />
                  <div className="flex-1">
                    <p className={cn(
                      "text-sm text-foreground",
                      q.asked && "line-through"
                    )}>
                      {q.question}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground capitalize">{q.category}</span>
                      {q.critical && (
                        <span className="text-xs text-emergency flex items-center gap-0.5">
                          <AlertTriangle className="w-3 h-3" />
                          Critical
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          {plan.notes && (
            <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Notes</h4>
              <p className="text-sm text-foreground">{plan.notes}</p>
            </div>
          )}

          {/* Safety Guardrail */}
          <div className="p-3 rounded-lg bg-warning/10 border border-warning/20">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-xs font-semibold text-warning uppercase">Safety Guardrail</h4>
                <p className="text-xs text-warning/80 mt-1">
                  AI recommendations are decision support only. They do not constitute medical diagnosis. 
                  Final dispatch decisions rest with trained personnel.
                </p>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* Action Buttons */}
      <div className="mt-4 pt-4 border-t border-border/50 space-y-2">
        <Button 
          className="w-full bg-success hover:bg-success/90 text-white"
          onClick={handleApprove}
        >
          <ThumbsUp className="w-4 h-4 mr-2" />
          Approve & Dispatch
        </Button>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={handleEdit}
          >
            <Pencil className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button 
            variant="outline" 
            className="flex-1 border-emergency/30 text-emergency hover:bg-emergency/10"
            onClick={handleCancel}
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DispatchTriagePanel;
