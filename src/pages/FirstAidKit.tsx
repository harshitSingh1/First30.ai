import Layout from '@/components/layout/Layout';
import { useFirstAidKit } from '@/hooks/useFirstAidKit';
import KitAssessmentFlow from '@/components/firstaid/KitAssessmentFlow';
import KitResultsList from '@/components/firstaid/KitResultsList';
import KitTrainingMode from '@/components/firstaid/KitTrainingMode';
import KitScenarioList from '@/components/firstaid/KitScenarioList';
import KitScenarioPractice from '@/components/firstaid/KitScenarioPractice';
import { Button } from '@/components/ui/button';
import { Package, RotateCcw, Target } from 'lucide-react';
import PWAInstallButton from '@/components/pwa/PWAInstallButton';

const FirstAidKit = () => {
  const {
    phase,
    setPhase,
    currentStep,
    totalSteps,
    assessment,
    updateAssessment,
    nextStep,
    prevStep,
    skipStep,
    isStepValid,
    generatedKit,
    allKitItems,
    selectedItem,
    setSelectedItem,
    relevantScenarios,
    selectedScenario,
    setSelectedScenario,
    scenarioStep,
    nextScenarioStep,
    resetScenario,
    resetAll,
  } = useFirstAidKit();

  const renderContent = () => {
    // Training mode for individual item
    if (phase === 'training' && selectedItem) {
      return (
        <KitTrainingMode
          item={selectedItem}
          onBack={() => {
            setSelectedItem(null);
            setPhase('results');
          }}
          allItems={allKitItems}
          onSelectItem={setSelectedItem}
        />
      );
    }

    // Scenario practice
    if (phase === 'scenario' && selectedScenario) {
      return (
        <KitScenarioPractice
          scenario={selectedScenario}
          currentStep={scenarioStep}
          onNextStep={nextScenarioStep}
          onReset={resetScenario}
          onBack={() => {
            resetScenario();
            setPhase('results');
          }}
        />
      );
    }

    // Scenario list
    if (phase === 'scenario' && !selectedScenario) {
      return (
        <KitScenarioList
          scenarios={relevantScenarios}
          onSelectScenario={(scenario) => {
            setSelectedScenario(scenario);
          }}
          onBack={() => setPhase('results')}
        />
      );
    }

    // Results view
    if (phase === 'results' && generatedKit) {
      return (
        <>
          <KitResultsList
            essential={generatedKit.essential}
            ageSpecific={generatedKit.ageSpecific}
            riskSpecific={generatedKit.riskSpecific}
            optional={generatedKit.optional}
            onSelectItem={(item) => {
              setSelectedItem(item);
              setPhase('training');
            }}
            onStartTraining={() => {
              if (allKitItems.length > 0) {
                setSelectedItem(allKitItems[0]);
                setPhase('training');
              }
            }}
          />
          
          {/* Additional Actions */}
          <div className="max-w-5xl mx-auto mt-10 pt-10 border-t border-border/50">
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button
                variant="outline"
                onClick={() => setPhase('scenario')}
                className="gap-2"
              >
                <Target className="w-4 h-4" />
                Practice Scenarios
              </Button>
              <Button
                variant="ghost"
                onClick={resetAll}
                className="gap-2 text-muted-foreground"
              >
                <RotateCcw className="w-4 h-4" />
                Start Over
              </Button>
            </div>

            {/* Install PWA for offline home & vehicle readiness */}
            <div className="mt-8 max-w-xl mx-auto">
              <PWAInstallButton variant="card" />
            </div>
          </div>
        </>
      );
    }

    // Default: Assessment flow
    return (
      <KitAssessmentFlow
        currentStep={currentStep}
        totalSteps={totalSteps}
        assessment={assessment}
        onUpdate={updateAssessment}
        onNext={nextStep}
        onPrev={prevStep}
        onSkip={skipStep}
        isValid={isStepValid()}
      />
    );
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Page Header - only show on assessment phase */}
        {phase === 'assessment' && (
          <div className="text-center mb-12 animate-fade-in">
            <div className="w-20 h-20 rounded-2xl bg-primary/15 flex items-center justify-center mx-auto mb-6">
              <Package className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              Build Your First Aid Kit
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A personalized kit based on your people, risks, and environment.
            </p>
          </div>
        )}

        {renderContent()}
      </div>
    </Layout>
  );
};

export default FirstAidKit;
