import React, { useState } from 'react';
import { HandoffData, AssessmentStatus } from '@/types/emergencyHandoff';
import { saveActiveSession } from '@/services/emergencySessionService';
import { X, Save, Plus, Trash2, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface EditHandoffModalProps {
  data: HandoffData;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: HandoffData) => void;
}

export const EditHandoffModal: React.FC<EditHandoffModalProps> = ({
  data,
  isOpen,
  onClose,
  onSave,
}) => {
  const [responsivenessStatus, setResponsivenessStatus] = useState<AssessmentStatus>(
    data.condition.responsiveness.status
  );
  const [responsivenessVal, setResponsivenessVal] = useState(
    data.condition.responsiveness.value || ''
  );

  const [breathingStatus, setBreathingStatus] = useState<AssessmentStatus>(
    data.condition.breathing.status
  );
  const [breathingVal, setBreathingVal] = useState(data.condition.breathing.value || '');

  const [injuriesStatus, setInjuriesStatus] = useState<AssessmentStatus>(
    data.condition.visibleInjuriesOrBleeding.status
  );
  const [injuriesVal, setInjuriesVal] = useState(
    data.condition.visibleInjuriesOrBleeding.value || ''
  );

  const [allergiesVal, setAllergiesVal] = useState(data.condition.allergies.value || '');
  const [historyVal, setHistoryVal] = useState(data.condition.medicalHistory.value || '');
  const [userNotes, setUserNotes] = useState(data.userNotes || '');

  const [newActionText, setNewActionText] = useState('');
  const [actionsList, setActionsList] = useState(data.actionsTaken);

  if (!isOpen) return null;

  const handleAddAction = () => {
    if (!newActionText.trim()) return;
    const newAct = {
      id: `custom-act-${Date.now()}`,
      action: newActionText.trim(),
      source: 'bystander_confirmed' as const,
      timestamp: new Date().toISOString(),
    };
    setActionsList((prev) => [...prev, newAct]);
    setNewActionText('');
  };

  const handleRemoveAction = (id: string) => {
    setActionsList((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updated: HandoffData = {
      ...data,
      condition: {
        ...data.condition,
        responsiveness: {
          status: responsivenessStatus,
          value: responsivenessStatus === 'reported' ? responsivenessVal : undefined,
          source: 'bystander_reported',
        },
        breathing: {
          status: breathingStatus,
          value: breathingStatus === 'reported' ? breathingVal : undefined,
          source: 'bystander_reported',
        },
        visibleInjuriesOrBleeding: {
          status: injuriesStatus,
          value: injuriesStatus === 'reported' ? injuriesVal : undefined,
          source: 'bystander_reported',
        },
        allergies: {
          status: allergiesVal.trim() ? 'reported' : 'unknown',
          value: allergiesVal.trim() || undefined,
          source: 'bystander_reported',
        },
        medicalHistory: {
          status: historyVal.trim() ? 'reported' : 'unknown',
          value: historyVal.trim() || undefined,
          source: 'bystander_reported',
        },
      },
      actionsTaken: actionsList,
      userNotes: userNotes.trim(),
      // Add timeline event tracking manual edit
      timeline: [
        ...data.timeline,
        {
          id: `ev-edit-${Date.now()}`,
          type: 'observation_recorded',
          timestamp: new Date().toISOString(),
          description: 'Bystander reviewed and updated handoff condition details',
          source: 'bystander_confirmed',
        },
      ],
    };

    saveActiveSession(updated);
    onSave(updated);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Edit Emergency Handoff Details"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/75 p-3 sm:p-4 flex items-center justify-center animate-in fade-in duration-150"
    >
      <div className="w-full max-w-xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-teal-400" />
            <h2 className="text-base font-bold text-foreground">Edit Handoff Details</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-5 text-xs">
          {/* Responsiveness */}
          <div>
            <label className="font-semibold text-foreground block mb-1.5">Responsiveness</label>
            <div className="grid grid-cols-3 gap-2 mb-2">
              {(['reported', 'not_assessed', 'unknown'] as AssessmentStatus[]).map((st) => (
                <button
                  type="button"
                  key={st}
                  onClick={() => setResponsivenessStatus(st)}
                  className={`py-1.5 px-2 rounded-lg border text-center transition-all ${
                    responsivenessStatus === st
                      ? 'bg-teal-500/20 border-teal-500/50 text-teal-300 font-bold'
                      : 'bg-secondary/40 border-border text-muted-foreground'
                  }`}
                >
                  {st === 'reported' ? 'Reported' : st === 'not_assessed' ? 'Not Assessed' : 'Unknown'}
                </button>
              ))}
            </div>
            {responsivenessStatus === 'reported' && (
              <Input
                placeholder="e.g. Unresponsive, Faint response to voice, Alert"
                value={responsivenessVal}
                onChange={(e) => setResponsivenessVal(e.target.value)}
                className="h-8 text-xs"
              />
            )}
          </div>

          {/* Breathing Status */}
          <div>
            <label className="font-semibold text-foreground block mb-1.5">Breathing Status</label>
            <div className="grid grid-cols-3 gap-2 mb-2">
              {(['reported', 'not_assessed', 'unknown'] as AssessmentStatus[]).map((st) => (
                <button
                  type="button"
                  key={st}
                  onClick={() => setBreathingStatus(st)}
                  className={`py-1.5 px-2 rounded-lg border text-center transition-all ${
                    breathingStatus === st
                      ? 'bg-teal-500/20 border-teal-500/50 text-teal-300 font-bold'
                      : 'bg-secondary/40 border-border text-muted-foreground'
                  }`}
                >
                  {st === 'reported' ? 'Reported' : st === 'not_assessed' ? 'Not Assessed' : 'Unknown'}
                </button>
              ))}
            </div>
            {breathingStatus === 'reported' && (
              <Input
                placeholder="e.g. Normal, Gasping/agonal, Shallow wheeze, No breathing"
                value={breathingVal}
                onChange={(e) => setBreathingVal(e.target.value)}
                className="h-8 text-xs"
              />
            )}
          </div>

          {/* Visible Injuries or Bleeding */}
          <div>
            <label className="font-semibold text-foreground block mb-1.5">Visible Injuries / Bleeding</label>
            <div className="grid grid-cols-3 gap-2 mb-2">
              {(['reported', 'not_assessed', 'unknown'] as AssessmentStatus[]).map((st) => (
                <button
                  type="button"
                  key={st}
                  onClick={() => setInjuriesStatus(st)}
                  className={`py-1.5 px-2 rounded-lg border text-center transition-all ${
                    injuriesStatus === st
                      ? 'bg-teal-500/20 border-teal-500/50 text-teal-300 font-bold'
                      : 'bg-secondary/40 border-border text-muted-foreground'
                  }`}
                >
                  {st === 'reported' ? 'Reported' : st === 'not_assessed' ? 'Not Assessed' : 'Unknown'}
                </button>
              ))}
            </div>
            {injuriesStatus === 'reported' && (
              <Input
                placeholder="e.g. Laceration on right arm, Head hematoma, No visible blood"
                value={injuriesVal}
                onChange={(e) => setInjuriesVal(e.target.value)}
                className="h-8 text-xs"
              />
            )}
          </div>

          {/* Allergies & Medical History */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-foreground block mb-1">Known Allergies</label>
              <Input
                placeholder="e.g. Penicillin, Peanuts (leave blank if unknown)"
                value={allergiesVal}
                onChange={(e) => setAllergiesVal(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
            <div>
              <label className="font-semibold text-foreground block mb-1">Medical History / Meds</label>
              <Input
                placeholder="e.g. Cardiac history, Asthma, Diabetic"
                value={historyVal}
                onChange={(e) => setHistoryVal(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
          </div>

          {/* Actions Taken Outside App */}
          <div>
            <label className="font-semibold text-foreground block mb-1.5">Actions Taken</label>
            <div className="space-y-1.5 mb-2">
              {actionsList.map((act) => (
                <div
                  key={act.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-secondary/50 border border-border"
                >
                  <span className="text-foreground">{act.action}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveAction(act.id)}
                    className="text-muted-foreground hover:text-red-400 p-1"
                    title="Remove action"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add action (e.g. Applied direct pressure, Assisted inhaler)"
                value={newActionText}
                onChange={(e) => setNewActionText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddAction();
                  }
                }}
                className="h-8 text-xs flex-1"
              />
              <Button type="button" onClick={handleAddAction} size="sm" variant="outline" className="h-8 text-xs px-2.5">
                <Plus className="w-3.5 h-3.5 mr-1" /> Add
              </Button>
            </div>
          </div>

          {/* Additional Notes */}
          <div>
            <label className="font-semibold text-foreground block mb-1">
              Bystander Notes (optional note for responders)
            </label>
            <Textarea
              placeholder="e.g. Found on floor by coworkers; breathing worsened 3 minutes ago..."
              value={userNotes}
              onChange={(e) => setUserNotes(e.target.value)}
              className="text-xs min-h-[70px] resize-none"
            />
          </div>

          {/* Footer Save Button */}
          <div className="pt-2 flex justify-end gap-2 border-t border-border">
            <Button type="button" variant="outline" size="sm" onClick={onClose} className="text-xs h-9">
              Cancel
            </Button>
            <Button type="submit" size="sm" className="bg-teal-600 hover:bg-teal-500 text-white text-xs h-9 gap-1.5">
              <Save className="w-3.5 h-3.5" /> Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditHandoffModal;
