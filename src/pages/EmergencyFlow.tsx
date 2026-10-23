import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import ProgressBar from '@/components/emergency/ProgressBar';
import StepCard from '@/components/emergency/StepCard';
import ListenButton from '@/components/emergency/ListenButton';
import EmergencySummaryCard from '@/components/emergency/EmergencySummaryCard';
import AccessibilityPanel from '@/components/accessibility/AccessibilityPanel';
import { useEmergencyFlow } from '@/hooks/useEmergencyFlow';
import { useEmergencyTimer } from '@/hooks/useEmergencyTimer';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useEmergencyRegion } from '@/contexts/EmergencyRegionContext';
import { HandoffData } from '@/types/emergencyHandoff';
import {
  getActiveSession,
  saveActiveSession,
  createDefaultSession,
  addTimelineEvent,
  addConfirmedAction,
  updateConditionField,
} from '@/services/emergencySessionService';
import { ArrowLeft, RotateCcw, X, Phone, Settings2, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

const EmergencyFlow = () => {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { autoReadEnabled, accessibleMode } = useAccessibility();
  const { speak, stop: stopSpeech } = useTextToSpeech();
  const { emergencyNumber } = useEmergencyRegion();
  
  const [showRestartDialog, setShowRestartDialog] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [showInitialQuestions, setShowInitialQuestions] = useState(true);
  const [initialAnswers, setInitialAnswers] = useState<Record<string, string>>({});
  const [showSummary, setShowSummary] = useState(false);
  const [completedDuration, setCompletedDuration] = useState<number | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const { 
    flow, 
    currentStep, 
    currentStepIndex, 
    totalSteps, 
    isLastStep, 
    isFirstStep,
    goToNextStep, 
    goToPreviousStep,
    skipCurrentStep,
    resetFlow,
    addInput,
    collectedInputs,
    getSummaryData 
  } = useEmergencyFlow(category || '');
  
  const { formattedTime, elapsedTime, stop: stopTimer, reset: resetTimer } = useEmergencyTimer(true);

  // Guarantee timer halts when summary view is shown
  useEffect(() => {
    if (showSummary) {
      stopTimer();
      setCompletedDuration((prev) => (prev !== null ? prev : elapsedTime));
    }
  }, [showSummary, stopTimer, elapsedTime]);

  // Initialize or load active emergency handoff session
  const [session, setSession] = useState<HandoffData>(() => {
    const existing = getActiveSession();
    if (existing && existing.incident.selectedGuidance === flow?.category) {
      return existing;
    }
    const newSession = createDefaultSession(
      flow?.category || 'Emergency',
      'Step-by-step Emergency Guidance',
      `/emergency/${category}`
    );
    saveActiveSession(newSession);
    return newSession;
  });

  // Track presented step instructions with app_recorded provenance
  useEffect(() => {
    if (currentStep && !showInitialQuestions) {
      setSession((prev) =>
        addTimelineEvent(prev, {
          type: 'instruction_presented',
          timestamp: new Date().toISOString(),
          elapsedSeconds: elapsedTime,
          description: `Instruction presented: Step ${currentStepIndex + 1} — ${currentStep.title}`,
          source: 'app_recorded',
          protocolId: category,
        })
      );
    }
  }, [currentStepIndex, showInitialQuestions, currentStep, category, elapsedTime]);

  // Auto-read step when it changes
  useEffect(() => {
    if (autoReadEnabled && currentStep && !showInitialQuestions) {
      const textToRead = `${currentStep.title}. ${currentStep.instruction}${currentStep.warning ? `. Warning: ${currentStep.warning}` : ''}`;
      speak(textToRead);
    }
    return () => {
      stopSpeech();
    };
  }, [currentStepIndex, autoReadEnabled, showInitialQuestions, currentStep, speak, stopSpeech]);

  if (!flow || !currentStep) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-heading-1 text-foreground mb-4">Emergency not found</h1>
          <Button onClick={() => navigate('/citizen')}>{t('flow.back')}</Button>
        </div>
      </Layout>
    );
  }

  // Handle answering an initial assessment question
  const handleAnswerQuestion = (
    q: { id: string; question: string },
    option: { label: string; value: string }
  ) => {
    setInitialAnswers((prev) => ({ ...prev, [q.id]: option.value }));
    addInput({
      questionId: q.id,
      question: q.question,
      answer: option.label,
    });

    setSession((prev) => {
      let updated = addTimelineEvent(prev, {
        type: 'symptom_reported',
        timestamp: new Date().toISOString(),
        elapsedSeconds: elapsedTime,
        description: `Bystander reported: ${q.question} = ${option.label}`,
        source: 'bystander_reported',
        protocolId: category,
      });

      const qLower = q.question.toLowerCase();
      if (qLower.includes('age')) {
        updated = updateConditionField(updated, 'ageGroup', 'reported', option.label, 'bystander_reported');
      } else if (qLower.includes('conscious') || qLower.includes('response')) {
        updated = updateConditionField(updated, 'responsiveness', 'reported', option.label, 'bystander_reported');
      } else if (qLower.includes('breath')) {
        updated = updateConditionField(updated, 'breathing', 'reported', option.label, 'bystander_reported');
      } else if (qLower.includes('bleed') || qLower.includes('wound') || qLower.includes('injur')) {
        updated = updateConditionField(updated, 'visibleInjuriesOrBleeding', 'reported', option.label, 'bystander_reported');
      }
      return updated;
    });
  };

  // Handle initial questions
  if (showInitialQuestions && flow.initialQuestions && flow.initialQuestions.length > 0) {
    const allAnswered = flow.initialQuestions.every((q) => initialAnswers[q.id]);
    
    return (
      <Layout showHeader={true} showFooter={false}>
        <div className="container mx-auto px-4 py-6 pb-24 max-w-2xl">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/citizen')} 
            className="text-muted-foreground mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            {t('flow.back')}
          </Button>

          <h1 className="text-2xl md:text-3xl font-bold text-primary mb-1">{flow.category}</h1>
          <p className="text-sm text-muted-foreground mb-6">Quick assessment before we start</p>

          <div className="space-y-4">
            {flow.initialQuestions.map((q) => (
              <div key={q.id} className="rounded-2xl bg-card border border-border/70 p-5 shadow-xs">
                <p className="font-semibold text-foreground mb-3 text-sm md:text-base">{q.question}</p>
                <div className="flex flex-wrap gap-2">
                  {q.options.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleAnswerQuestion(q, option)}
                      className={`min-h-[44px] px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                        initialAnswers[q.id] === option.value
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'bg-secondary/60 text-foreground hover:bg-secondary'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2 mt-6">
            <Button
              onClick={() => setShowInitialQuestions(false)}
              disabled={!allAnswered}
              className="w-full h-13 bg-primary hover:bg-primary/90 rounded-xl text-base font-bold disabled:opacity-50 shadow-sm"
            >
              Start Emergency Guidance
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowInitialQuestions(false)}
              className="w-full h-11 text-xs text-muted-foreground hover:text-foreground"
            >
              Skip assessment &amp; jump directly to Step 1
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const completedSteps = Array.from({ length: currentStepIndex }, (_, i) => 
    flow.steps[i]?.title || `Step ${i + 1}`
  );

  const handleDone = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => setIsTransitioning(false), 300);

    if (currentStep) {
      setSession((prev) => {
        let updated = addConfirmedAction(
          prev,
          currentStep.title,
          'bystander_confirmed',
          elapsedTime
        );
        updated = addTimelineEvent(updated, {
          type: 'action_confirmed',
          timestamp: new Date().toISOString(),
          elapsedSeconds: elapsedTime,
          description: `Bystander confirmed completing: ${currentStep.title}`,
          source: 'bystander_confirmed',
          protocolId: category,
        });
        return updated;
      });
    }

    if (isLastStep) {
      stopTimer();
      setCompletedDuration(elapsedTime);
      setShowSummary(true);
    } else {
      goToNextStep();
    }
  };

  const handleCant = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => setIsTransitioning(false), 300);

    if (currentStep) {
      setSession((prev) =>
        addTimelineEvent(prev, {
          type: 'observation_recorded',
          timestamp: new Date().toISOString(),
          elapsedSeconds: elapsedTime,
          description: `Bystander skipped step: ${currentStep.title}`,
          source: 'bystander_reported',
          protocolId: category,
        })
      );
    }

    if (isLastStep) {
      stopTimer();
      setCompletedDuration(elapsedTime);
      setShowSummary(true);
    } else {
      skipCurrentStep();
    }
  };

  const handleEndEarly = () => {
    stopTimer();
    setCompletedDuration(elapsedTime);
    setShowSummary(true);
  };

  const handleRestart = () => {
    resetTimer();
    resetFlow();
    setShowRestartDialog(false);
    setShowInitialQuestions(true);
    setInitialAnswers({});
    setShowSummary(false);
    setCompletedDuration(null);
  };

  const handleFinishSummary = () => {
    const finalDuration = completedDuration ?? elapsedTime;
    const summaryData = getSummaryData(finalDuration);
    const finalSession: HandoffData = {
      ...session,
      incident: {
        ...session.incident,
        summaryGeneratedTime: new Date().toISOString(),
      },
    };
    saveActiveSession(finalSession);
    navigate('/summary', { state: { handoffData: finalSession, summaryData } });
  };

  const handleActionButton = (action: 'cpr' | 'call911' | 'timer') => {
    if (action === 'cpr') {
      navigate('/cpr', { state: { returnTo: `/emergency/${category}`, elapsedTime } });
    } else if (action === 'call911') {
      setSession((prev) =>
        addTimelineEvent(prev, {
          type: 'emergency_call_link_opened',
          timestamp: new Date().toISOString(),
          elapsedSeconds: elapsedTime,
          description: `Device telephone link tapped to dial emergency services (${emergencyNumber}). (Note: Call connection and answer status unverified by app)`,
          source: 'app_recorded',
          protocolId: category,
        })
      );
      window.location.href = `tel:${emergencyNumber}`;
    }
  };

  const handleQuickAnswer = (questionId: string, question: string, answer: string) => {
    addInput({
      questionId,
      question,
      answer,
      stepId: currentStep.id,
    });

    setSession((prev) =>
      addTimelineEvent(prev, {
        type: 'symptom_reported',
        timestamp: new Date().toISOString(),
        elapsedSeconds: elapsedTime,
        description: `Bystander answered: ${question} = ${answer}`,
        source: 'bystander_reported',
        protocolId: category,
      })
    );
  };

  // Show intermediate summary card before navigating to full handoff
  if (showSummary) {
    return (
      <Layout showHeader={true} showFooter={false}>
        <div className="container mx-auto px-4 py-6 pb-24 max-w-2xl">
          <h1 className="text-2xl md:text-3xl font-bold text-primary mb-6">{t('summary.title')}</h1>
          
          <EmergencySummaryCard
            category={flow.category}
            collectedInputs={collectedInputs}
            stepsCompleted={completedSteps}
            totalSteps={totalSteps}
            duration={completedDuration ?? elapsedTime}
            recommendations={flow.summaryTemplate?.recommendations}
            className="mb-6"
          />

          <div className="grid gap-3">
            <Button onClick={handleFinishSummary} className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl shadow-sm">
              <ShieldAlert className="w-4 h-4 mr-2" />
              Open Emergency Responder Handoff
            </Button>
            <Button variant="outline" onClick={handleRestart} className="w-full h-12 rounded-xl">
              {t('summary.new')}
            </Button>
            <Button variant="ghost" onClick={() => navigate('/citizen')} className="w-full rounded-xl">
              {t('flow.exit')}
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showHeader={true} showFooter={false}>
      <div className="container mx-auto px-4 py-4 pb-12 max-w-2xl">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowRestartDialog(true)} 
              className="text-muted-foreground hover:text-foreground text-xs min-h-[44px]"
            >
              <RotateCcw className="w-4 h-4 mr-1.5" />
              {t('flow.restart')}
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground text-xs min-h-[44px]">
                  <Settings2 className="w-4 h-4 mr-1.5" />
                  <span>{t('a11y.mode')}</span>
                </Button>
              </SheetTrigger>
              <SheetContent className="bg-background border-border">
                <SheetHeader>
                  <SheetTitle>{t('a11y.mode')}</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <AccessibilityPanel showLanguage={false} />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Progress bar */}
        <ProgressBar
          currentStep={currentStepIndex + 1}
          totalSteps={totalSteps}
          category={flow.category}
          elapsedTime={elapsedTime}
          formattedTime={formattedTime}
          className="mb-6"
        />

        {/* Step card with top and bottom spacing */}
        <StepCard
          stepNumber={currentStepIndex + 1}
          totalSteps={totalSteps}
          title={currentStep.title}
          instruction={currentStep.instruction}
          warning={currentStep.warning}
          alternatives={currentStep.alternatives}
          actionButton={currentStep.actionButton}
          onActionButton={handleActionButton}
          quickQuestion={currentStep.quickQuestion}
          onQuickAnswer={handleQuickAnswer}
          onPrevious={() => {
            if (!isTransitioning) {
              setIsTransitioning(true);
              setTimeout(() => setIsTransitioning(false), 300);
              goToPreviousStep();
            }
          }}
          onCant={handleCant}
          onDone={handleDone}
          isFirstStep={isFirstStep}
          isLastStep={isLastStep}
          isTransitioning={isTransitioning}
          className="my-6"
        />

        {/* Listen and Replay button with comfortable spacing */}
        <div className="mt-4 mb-8 flex justify-center">
          <ListenButton
            text={`${currentStep.title}. ${currentStep.instruction}${currentStep.warning ? `. Warning: ${currentStep.warning}` : ''}`}
            stepId={currentStep.id}
          />
        </div>

        {/* Restart dialog */}
        <AlertDialog open={showRestartDialog} onOpenChange={setShowRestartDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('flow.restart')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('flow.restartConfirm')}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
              <AlertDialogAction onClick={handleRestart} className="bg-primary">
                {t('common.confirm')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Exit dialog */}
        <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('flow.exit')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('flow.exitConfirm')}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
              <AlertDialogAction onClick={handleEndEarly} className="bg-primary">
                {t('flow.viewSummary')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
};

export default EmergencyFlow;
