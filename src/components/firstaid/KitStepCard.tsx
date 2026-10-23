import { useState } from 'react';
import { KitQuestion, KitOption } from '@/data/firstAidKitData';
import { cn } from '@/lib/utils';
import { Check, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface KitStepCardProps {
  question: KitQuestion;
  value: any;
  onChange: (value: any) => void;
}

const KitStepCard = ({ question, value, onChange }: KitStepCardProps) => {
  const handleSingleSelect = (optionId: string) => {
    onChange(optionId);
  };

  const handleMultiSelect = (optionId: string) => {
    const currentValues = Array.isArray(value) ? value : [];
    if (currentValues.includes(optionId)) {
      onChange(currentValues.filter((v: string) => v !== optionId));
    } else {
      // If selecting "none", clear other selections
      if (optionId === 'none') {
        onChange(['none']);
      } else {
        // Remove "none" if selecting something else
        onChange([...currentValues.filter((v: string) => v !== 'none'), optionId]);
      }
    }
  };

  const handleNumberChange = (delta: number) => {
    const currentValue = typeof value === 'number' ? value : 1;
    const newValue = Math.max(1, currentValue + delta);
    onChange(newValue);
  };

  if (question.type === 'number') {
    return (
      <div className="flex flex-col items-center gap-6">
        <div className="flex items-center gap-6">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleNumberChange(-1)}
            className="w-14 h-14 rounded-xl text-2xl border-border/50 hover:bg-primary/10"
          >
            <Minus className="w-6 h-6" />
          </Button>
          <div className="w-24 text-center">
            <Input
              type="number"
              value={value || 1}
              onChange={(e) => onChange(Math.max(1, parseInt(e.target.value) || 1))}
              className="text-4xl font-bold text-center h-20 bg-card/50 border-border/50"
              min={1}
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleNumberChange(1)}
            className="w-14 h-14 rounded-xl text-2xl border-border/50 hover:bg-primary/10"
          >
            <Plus className="w-6 h-6" />
          </Button>
        </div>
        {question.helperText && (
          <p className="text-sm text-muted-foreground">{question.helperText}</p>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {question.options?.map((option) => {
        const isSelected = question.type === 'single' 
          ? value === option.id
          : Array.isArray(value) && value.includes(option.id);
        
        const Icon = option.icon;

        return (
          <button
            key={option.id}
            onClick={() => question.type === 'single' 
              ? handleSingleSelect(option.id) 
              : handleMultiSelect(option.id)
            }
            className={cn(
              "relative p-5 rounded-2xl border-2 transition-all duration-300",
              "flex flex-col items-center gap-3 text-center",
              "hover:scale-[1.02] hover:shadow-lg",
              isSelected
                ? "border-primary bg-primary/10 shadow-md"
                : "border-border/50 bg-card/30 hover:bg-card/50"
            )}
          >
            {/* Selection indicator */}
            <div className={cn(
              "absolute top-3 right-3 w-6 h-6 rounded-full border-2 transition-all",
              "flex items-center justify-center",
              isSelected
                ? "bg-primary border-primary"
                : "border-muted-foreground/30"
            )}>
              {isSelected && <Check className="w-4 h-4 text-primary-foreground" />}
            </div>

            {Icon && (
              <div className={cn(
                "w-14 h-14 rounded-xl flex items-center justify-center transition-colors",
                isSelected ? "bg-primary/20" : "bg-secondary/50"
              )}>
                <Icon className={cn(
                  "w-7 h-7 transition-colors",
                  isSelected ? "text-primary" : "text-muted-foreground"
                )} />
              </div>
            )}

            <div>
              <p className={cn(
                "font-semibold transition-colors",
                isSelected ? "text-foreground" : "text-foreground/80"
              )}>
                {option.label}
              </p>
              {option.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {option.description}
                </p>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default KitStepCard;
