import { PracticeScenario } from '@/data/firstAidKitData';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Play, Target } from 'lucide-react';

interface KitScenarioListProps {
  scenarios: PracticeScenario[];
  onSelectScenario: (scenario: PracticeScenario) => void;
  onBack: () => void;
}

const KitScenarioList = ({ scenarios, onSelectScenario, onBack }: KitScenarioListProps) => {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" onClick={onBack} className="gap-2 mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back to Kit
        </Button>
      </div>

      <div className="text-center mb-10">
        <div className="w-20 h-20 rounded-2xl bg-primary/15 flex items-center justify-center mx-auto mb-4">
          <Target className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Practice Scenarios
        </h1>
        <p className="text-lg text-muted-foreground">
          Build confidence by walking through realistic emergency situations
        </p>
      </div>

      {scenarios.length === 0 ? (
        <div className="text-center py-12 premium-card">
          <p className="text-muted-foreground text-lg">
            No practice scenarios available for your current kit items.
          </p>
          <Button variant="outline" onClick={onBack} className="mt-4">
            Back to Kit
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {scenarios.map(scenario => (
            <button
              key={scenario.id}
              onClick={() => onSelectScenario(scenario)}
              className="premium-card p-6 text-left hover:shadow-lg transition-all duration-300 group hover:scale-[1.02]"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center group-hover:bg-primary/25 transition-colors">
                  <Play className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                    {scenario.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {scenario.steps.length} steps
                  </p>
                </div>
              </div>
              <p className="text-muted-foreground line-clamp-2">
                {scenario.description}
              </p>
              <div className="mt-4 flex items-center gap-2 text-sm text-primary font-medium">
                Start Practice
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Note */}
      <div className="mt-10 text-center">
        <p className="text-sm text-muted-foreground">
          💡 These scenarios are for education and practice only. 
          In a real emergency, always call professional help.
        </p>
      </div>
    </div>
  );
};

export default KitScenarioList;
