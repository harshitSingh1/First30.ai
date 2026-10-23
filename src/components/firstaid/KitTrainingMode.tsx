import { KitItem } from '@/data/firstAidKitData';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  Volume2, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  BookOpen,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';

interface KitTrainingModeProps {
  item: KitItem;
  onBack: () => void;
  allItems: KitItem[];
  onSelectItem: (item: KitItem) => void;
}

const KitTrainingMode = ({ item, onBack, allItems, onSelectItem }: KitTrainingModeProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showMistakes, setShowMistakes] = useState(false);
  const [autoRead, setAutoRead] = useState(false);
  const { speak, isSpeaking, stop } = useTextToSpeech();

  const Icon = item.icon;
  const currentItemIndex = allItems.findIndex(i => i.id === item.id);

  const handleSpeak = (text: string) => {
    if (isSpeaking) {
      stop();
    } else {
      speak(text);
    }
  };

  const handleNextItem = () => {
    if (currentItemIndex < allItems.length - 1) {
      onSelectItem(allItems[currentItemIndex + 1]);
      setCurrentStep(0);
      setShowMistakes(false);
    }
  };

  const handlePrevItem = () => {
    if (currentItemIndex > 0) {
      onSelectItem(allItems[currentItemIndex - 1]);
      setCurrentStep(0);
      setShowMistakes(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Kit
        </Button>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Item {currentItemIndex + 1} of {allItems.length}
          </span>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrevItem}
              disabled={currentItemIndex === 0}
              className="w-8 h-8"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleNextItem}
              disabled={currentItemIndex === allItems.length - 1}
              className="w-8 h-8"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Item Header */}
      <div className="premium-card p-8 mb-6 animate-fade-in">
        <div className="flex items-start gap-6">
          <div className="w-20 h-20 rounded-2xl bg-primary/15 flex items-center justify-center flex-shrink-0">
            <Icon className="w-10 h-10 text-primary" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              {item.name}
            </h1>
            <p className="text-lg text-muted-foreground mb-4">
              {item.whyNeeded}
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSpeak(item.whyNeeded)}
                className={cn(
                  "gap-2",
                  isSpeaking && "text-primary border-primary"
                )}
              >
                <Volume2 className={cn("w-4 h-4", isSpeaking && "animate-pulse")} />
                {isSpeaking ? 'Stop' : 'Listen'}
              </Button>
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  checked={autoRead}
                  onChange={(e) => setAutoRead(e.target.checked)}
                  className="rounded border-border"
                />
                Auto-read steps
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* When to Use */}
      <div className="premium-card p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/15 flex items-center justify-center">
            <Clock className="w-5 h-5 text-cyan-600" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">When to Use</h2>
        </div>
        <p className="text-foreground/90 text-lg">{item.whenToUse}</p>
      </div>

      {/* How to Use - Steps */}
      <div className="premium-card p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">How to Use</h2>
        </div>

        <div className="space-y-4">
          {item.howToUse.map((step, index) => (
            <div
              key={index}
              className={cn(
                "flex items-start gap-4 p-4 rounded-xl transition-all duration-300 cursor-pointer",
                index === currentStep
                  ? "bg-primary/10 border-2 border-primary"
                  : index < currentStep
                  ? "bg-secondary/30 opacity-60"
                  : "bg-card/30 hover:bg-card/50"
              )}
              onClick={() => setCurrentStep(index)}
            >
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold",
                index === currentStep
                  ? "bg-primary text-primary-foreground"
                  : index < currentStep
                  ? "bg-primary/50 text-primary-foreground"
                  : "bg-secondary text-muted-foreground"
              )}>
                {index < currentStep ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  index + 1
                )}
              </div>
              <div className="flex-1">
                <p className={cn(
                  "text-lg",
                  index === currentStep ? "text-foreground font-medium" : "text-muted-foreground"
                )}>
                  {step}
                </p>
              </div>
              {index === currentStep && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSpeak(step);
                  }}
                  className="flex-shrink-0"
                >
                  <Volume2 className={cn("w-4 h-4", isSpeaking && "animate-pulse text-primary")} />
                </Button>
              )}
            </div>
          ))}
        </div>

        {/* Step Navigation */}
        <div className="flex items-center justify-between mt-6 pt-6 border-t border-border/50">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous Step
          </Button>
          <span className="text-sm text-muted-foreground">
            Step {currentStep + 1} of {item.howToUse.length}
          </span>
          <Button
            onClick={() => {
              if (currentStep < item.howToUse.length - 1) {
                setCurrentStep(currentStep + 1);
              }
            }}
            disabled={currentStep === item.howToUse.length - 1}
            className="gap-2"
          >
            Next Step
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Mistakes to Avoid */}
      <div className="premium-card p-6 mb-6">
        <button
          onClick={() => setShowMistakes(!showMistakes)}
          className="w-full flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">Common Mistakes to Avoid</h2>
          </div>
          <ChevronRight className={cn(
            "w-5 h-5 text-muted-foreground transition-transform",
            showMistakes && "rotate-90"
          )} />
        </button>

        {showMistakes && (
          <div className="mt-6 space-y-3 animate-fade-in">
            {item.mistakesToAvoid.map((mistake, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20"
              >
                <span className="text-amber-600 font-bold">✕</span>
                <p className="text-foreground/90">{mistake}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Practice Scenario */}
      {item.practiceScenario && (
        <div className="premium-card p-6 bg-gradient-to-br from-primary/5 to-transparent">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
              <span className="text-lg">💡</span>
            </div>
            <h2 className="text-xl font-semibold text-foreground">Practice Scenario</h2>
          </div>
          <p className="text-lg text-foreground/90 italic">
            "{item.practiceScenario}"
          </p>
          <p className="text-sm text-muted-foreground mt-3">
            Think through how you would use this item in this situation.
          </p>
        </div>
      )}
    </div>
  );
};

export default KitTrainingMode;
