import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { EmergencySummaryData } from '@/types/emergency';
import { Check, Info, AlertCircle, Heart, User, Clock, MapPin, Pill, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HandoffEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: EmergencySummaryData;
  onSave: (updatedData: EmergencySummaryData) => void;
}

export const HandoffEditorModal: React.FC<HandoffEditorModalProps> = ({
  isOpen,
  onClose,
  data,
  onSave,
}) => {
  const [consciousness, setConsciousness] = useState<
    'alert' | 'verbal' | 'pain' | 'unresponsive' | 'unknown'
  >(data.consciousness || 'unknown');

  const [breathing, setBreathing] = useState<
    'normal' | 'difficult' | 'none' | 'agonal' | 'unknown'
  >(data.breathing || 'unknown');

  const [bleeding, setBleeding] = useState<
    'none' | 'minor' | 'severe' | 'controlled' | 'unknown'
  >(data.bleeding || 'unknown');

  const [ageGroup, setAgeGroup] = useState<string>(data.ageGroup || 'unknown');
  const [symptomOnset, setSymptomOnset] = useState<string>(data.symptomOnset || '');
  const [location, setLocation] = useState<string>(data.location || '');
  const [allergies, setAllergies] = useState<string>(data.allergies || '');
  const [medications, setMedications] = useState<string>(data.medications || '');
  const [medicalConditions, setMedicalConditions] = useState<string>(data.medicalConditions || '');
  const [bystanderNotes, setBystanderNotes] = useState<string>(data.bystanderNotes || '');

  const handleSave = () => {
    const updated: EmergencySummaryData = {
      ...data,
      consciousness,
      breathing,
      bleeding,
      ageGroup,
      symptomOnset: symptomOnset.trim() || undefined,
      location: location.trim() || undefined,
      allergies: allergies.trim() || undefined,
      medications: medications.trim() || undefined,
      medicalConditions: medicalConditions.trim() || undefined,
      bystanderNotes: bystanderNotes.trim() || undefined,
      timeOnsetKnown: symptomOnset.trim().length > 0 && symptomOnset !== 'Unknown',
    };

    onSave(updated);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto p-5 sm:p-6 bg-slate-900 text-white border-slate-700">
        <DialogHeader className="space-y-1.5 pb-2 border-b border-slate-800">
          <DialogTitle className="text-xl font-bold flex items-center gap-2 text-white">
            <Heart className="w-5 h-5 text-teal-400" />
            Bystander Observation Notes
          </DialogTitle>
          <DialogDescription className="text-slate-400 text-xs sm:text-sm">
            Share what you know with the emergency responder. Unknown details can be left blank.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/60 flex items-start gap-2.5 text-xs text-slate-300">
          <Info className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
          <span>
            <strong>Honest reporting is safety-critical:</strong> Paramedics prefer knowing a detail is <em>unknown</em> rather than guessing.
          </span>
        </div>

        <div className="space-y-5 py-2">
          {/* Patient Responsiveness / Consciousness */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-teal-400" />
              Consciousness / Responsiveness (AVPU)
            </Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { val: 'alert', label: 'Alert & Awake' },
                { val: 'verbal', label: 'Responds to Voice' },
                { val: 'pain', label: 'Responds to Pain' },
                { val: 'unresponsive', label: 'Unresponsive', alert: true },
                { val: 'unknown', label: 'Unknown' },
              ].map((opt) => (
                <button
                  type="button"
                  key={opt.val}
                  onClick={() => setConsciousness(opt.val as any)}
                  className={cn(
                    'py-2 px-3 text-xs rounded-lg font-medium border text-left transition-all',
                    consciousness === opt.val
                      ? opt.alert
                        ? 'bg-rose-950/80 border-rose-500 text-rose-200 ring-1 ring-rose-500'
                        : 'bg-teal-950/80 border-teal-400 text-teal-200 ring-1 ring-teal-400'
                      : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Breathing */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Breathing Status
            </Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { val: 'normal', label: 'Normal breathing' },
                { val: 'difficult', label: 'Difficult / Wheezing' },
                { val: 'agonal', label: 'Agonal / Gasping', alert: true },
                { val: 'none', label: 'No breathing (CPR)', alert: true },
                { val: 'unknown', label: 'Unknown' },
              ].map((opt) => (
                <button
                  type="button"
                  key={opt.val}
                  onClick={() => setBreathing(opt.val as any)}
                  className={cn(
                    'py-2 px-3 text-xs rounded-lg font-medium border text-left transition-all',
                    breathing === opt.val
                      ? opt.alert
                        ? 'bg-rose-950/80 border-rose-500 text-rose-200 ring-1 ring-rose-500'
                        : 'bg-teal-950/80 border-teal-400 text-teal-200 ring-1 ring-teal-400'
                      : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Bleeding */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Bleeding
            </Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { val: 'none', label: 'None observed' },
                { val: 'minor', label: 'Minor / Superficial' },
                { val: 'severe', label: 'Severe / Heavy', alert: true },
                { val: 'controlled', label: 'Controlled with pressure' },
                { val: 'unknown', label: 'Unknown' },
              ].map((opt) => (
                <button
                  type="button"
                  key={opt.val}
                  onClick={() => setBleeding(opt.val as any)}
                  className={cn(
                    'py-2 px-3 text-xs rounded-lg font-medium border text-left transition-all',
                    bleeding === opt.val
                      ? opt.alert
                        ? 'bg-rose-950/80 border-rose-500 text-rose-200 ring-1 ring-rose-500'
                        : 'bg-teal-950/80 border-teal-400 text-teal-200 ring-1 ring-teal-400'
                      : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Age Group */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Approximate Age
            </Label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { val: 'infant', label: 'Infant (<1y)' },
                { val: 'child', label: 'Child (1-12y)' },
                { val: 'adult', label: 'Adult' },
                { val: 'elderly', label: 'Elderly (65+)' },
                { val: 'unknown', label: 'Unknown' },
              ].map((opt) => (
                <button
                  type="button"
                  key={opt.val}
                  onClick={() => setAgeGroup(opt.val)}
                  className={cn(
                    'py-2 px-2 text-center text-xs rounded-lg font-medium border transition-all',
                    ageGroup === opt.val
                      ? 'bg-teal-950/80 border-teal-400 text-teal-200 ring-1 ring-teal-400'
                      : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Onset Time & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-teal-400" />
                When did symptoms begin?
              </Label>
              <Input
                placeholder="e.g. 10 minutes ago, suddenly collapsed"
                value={symptomOnset}
                onChange={(e) => setSymptomOnset(e.target.value)}
                className="h-10 text-xs bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-teal-400" />
                Exact Location / Entry Point
              </Label>
              <Input
                placeholder="e.g. Apt 3B, front door unlocked"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="h-10 text-xs bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500"
              />
            </div>
          </div>

          {/* Allergies, Medications, Conditions */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Pill className="w-3.5 h-3.5 text-amber-400" />
              Medical History (Leave blank if not known)
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="space-y-1">
                <Label className="text-[11px] text-slate-400">Allergies</Label>
                <Input
                  placeholder="e.g. Penicillin, Peanuts"
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  className="h-9 text-xs bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] text-slate-400">Medications</Label>
                <Input
                  placeholder="e.g. Blood thinners, Insulin"
                  value={medications}
                  onChange={(e) => setMedications(e.target.value)}
                  className="h-9 text-xs bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] text-slate-400">Past Conditions</Label>
                <Input
                  placeholder="e.g. Diabetes, Cardiac, Asthma"
                  value={medicalConditions}
                  onChange={(e) => setMedicalConditions(e.target.value)}
                  className="h-9 text-xs bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500"
                />
              </div>
            </div>
          </div>

          {/* Bystander notes */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-300">
              Additional Bystander Notes
            </Label>
            <Textarea
              rows={2}
              placeholder="e.g. Empty pill bottle on bedside, seizure lasted ~2 min, complained of chest pain before passing out..."
              value={bystanderNotes}
              onChange={(e) => setBystanderNotes(e.target.value)}
              className="text-xs bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500 resize-none"
            />
          </div>
        </div>

        <DialogFooter className="pt-2 border-t border-slate-800 flex gap-2 sm:gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xs h-10 flex-1 sm:flex-none"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            className="bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs h-10 px-5 flex-1 sm:flex-none"
          >
            <Check className="w-4 h-4 mr-1.5" />
            Save Handoff Information
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
