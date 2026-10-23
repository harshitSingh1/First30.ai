import { PracticeScenario, kitItems } from '@/data/firstAidKitData';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  CheckCircle2, 
  Play, 
  RotateCcw,
  Package,
  ChevronRight,
  Volume2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { useLanguage } from '@/contexts/LanguageContext';

interface KitScenarioPracticeProps {
  scenario: PracticeScenario;
  currentStep: number;
  onNextStep: () => void;
  onReset: () => void;
  onBack: () => void;
}

const KitScenarioPractice = ({
  scenario,
  currentStep,
  onNextStep,
  onReset,
  onBack,
}: KitScenarioPracticeProps) => {
  const { speak, isSpeaking, stop } = useTextToSpeech();

  const isComplete = currentStep >= scenario.steps.length;
  const itemsUsed = scenario.itemsToUse.map(id => kitItems.find(item => item.id === id)).filter(Boolean);

  const handleSpeak = (text: string) => {
    if (isSpeaking) {
      stop();
    } else {
      speak(text);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Scenarios
        </Button>
        <Button variant="outline" onClick={onReset} className="gap-2">
          <RotateCcw className="w-4 h-4" />
          Restart
        </Button>
      </div>

      {/* Scenario Header */}
      <div className="premium-card p-8 mb-6 animate-fade-in">
        <div className="flex items-center gap-2 text-sm text-primary font-medium mb-2">
          <Play className="w-4 h-4" />
          Practice Scenario
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
          {scenario.title}
        </h1>
        <p className="text-lg text-muted-foreground">{scenario.description}</p>
      </div>

      {/* Situation */}
      <div className="premium-card p-6 mb-6 bg-gradient-to-br from-cyan-500/5 to-transparent">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">📋 The Situation</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleSpeak(scenario.situation)}
            className={cn(isSpeaking && "text-primary")}
          >
            <Volume2 className={cn("w-4 h-4", isSpeaking && "animate-pulse")} />
          </Button>
        </div>
        <p className="text-foreground/90 text-lg leading-relaxed">{scenario.situation}</p>
      </div>

      {/* Items to Use */}
      <div className="premium-card p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Package className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Items You'll Need</h2>
        </div>
        <div className="flex flex-wrap gap-3">
          {itemsUsed.map(item => {
            if (!item) return null;
            const ItemIcon = item.icon;
            return (
              <div
                key={item.id}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 border border-primary/20"
              >
                <ItemIcon className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium text-foreground">{item.name}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Steps */}
      <div className="premium-card p-6 mb-6">
        <h2 className="text-lg font-semibold text-foreground mb-6">🎯 Steps to Follow</h2>
        
        <div className="space-y-4">
          {scenario.steps.map((step, index) => {
            const isActive = index === currentStep;
            const isDone = index < currentStep;
            const isLocked = index > currentStep;

            return (
              <div
                key={index}
                className={cn(
                  "flex items-start gap-4 p-4 rounded-xl transition-all duration-300",
                  isActive && "bg-primary/10 border-2 border-primary",
                  isDone && "bg-secondary/30",
                  isLocked && "opacity-50"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold",
                  isDone && "bg-primary text-primary-foreground",
                  isActive && "bg-primary text-primary-foreground animate-pulse",
                  isLocked && "bg-secondary text-muted-foreground"
                )}>
                  {isDone ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    index + 1
                  )}
                </div>
                <div className="flex-1">
                  <p className={cn(
                    "text-lg",
                    isActive ? "text-foreground font-medium" : "text-muted-foreground"
                  )}>
                    {step}
                  </p>
                </div>
                {isActive && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSpeak(step)}
                    className="flex-shrink-0"
                  >
                    <Volume2 className={cn("w-4 h-4", isSpeaking && "animate-pulse text-primary")} />
                  </Button>
                )}
              </div>
            );
          })}
        </div>

        {/* Action Button */}
        {!isComplete ? (
          <div className="mt-6 pt-6 border-t border-border/50">
            <Button
              onClick={onNextStep}
              className="w-full gap-2 py-6 text-lg"
            >
              {currentStep === 0 ? 'Start Practice' : 'Mark Step Complete'}
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        ) : (
          <div className="mt-6 pt-6 border-t border-border/50 text-center">
            <div className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl bg-primary/15 text-primary mb-4">
              <CheckCircle2 className="w-8 h-8" />
              <span className="text-xl font-semibold">Scenario Complete!</span>
            </div>
            <p className="text-lg text-foreground mb-2">{scenario.confirmation}</p>
            <p className="text-muted-foreground">You're more prepared for this situation now.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default KitScenarioPractice;
