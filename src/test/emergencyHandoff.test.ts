import { describe, it, expect, beforeEach } from 'vitest';
import {
  createDefaultSession,
  addTimelineEvent,
  addConfirmedAction,
  updateConditionField,
  formatPlainTextHandoff,
  getActiveSession,
  saveActiveSession,
  clearActiveSession,
  convertSummaryDataToHandoff,
} from '@/services/emergencySessionService';
import { getEmergencyFlowById, getEmergencyCategories } from '@/data/emergencyFlows';
import { EmergencySummaryData } from '@/types/emergency';

describe('Emergency Handoff & Session Event Model', () => {
  beforeEach(() => {
    clearActiveSession();
  });

  it('initializes default session with explicit not_assessed/unknown fields and no fabricated data', () => {
    const session = createDefaultSession('Severe Bleeding', 'Standard Guidance', '/emergency/bleeding');

    expect(session.incident.selectedGuidance).toBe('Severe Bleeding');
    expect(session.incident.location).toBeNull();
    expect(session.incident.sessionStartTime).toBeTruthy();

    // Verify condition fields are not assumed
    expect(session.condition.ageGroup.status).toBe('not_assessed');
    expect(session.condition.responsiveness.status).toBe('not_assessed');
    expect(session.condition.breathing.status).toBe('not_assessed');
    expect(session.condition.visibleInjuriesOrBleeding.status).toBe('not_assessed');
    expect(session.condition.medicalHistory.status).toBe('unknown');
    expect(session.condition.allergies.status).toBe('unknown');

    // Important unknowns are explicitly tracked
    expect(session.importantUnknowns.length).toBeGreaterThan(0);
    expect(session.actionsTaken.length).toBe(0);
    expect(session.timeline.length).toBe(1);
    expect(session.timeline[0].type).toBe('session_started');
    expect(session.timeline[0].source).toBe('app_recorded');
  });

  it('records instructions presented as app_recorded and actions confirmed as bystander_confirmed', () => {
    let session = createDefaultSession('Severe Bleeding', 'Standard Guidance');

    // Present instruction (app_recorded)
    session = addTimelineEvent(session, {
      type: 'instruction_presented',
      timestamp: new Date().toISOString(),
      elapsedSeconds: 5,
      description: 'Instruction presented: Step 1 — Direct Pressure',
      source: 'app_recorded',
    });

    expect(session.timeline.length).toBe(2);
    expect(session.timeline[1].source).toBe('app_recorded');
    expect(session.actionsTaken.length).toBe(0); // Instruction presentation is NOT an action taken

    // Confirm action (bystander_confirmed)
    session = addConfirmedAction(session, 'Direct Pressure Applied', 'bystander_confirmed', 20);

    expect(session.actionsTaken.length).toBe(1);
    expect(session.actionsTaken[0].action).toBe('Direct Pressure Applied');
    expect(session.actionsTaken[0].source).toBe('bystander_confirmed');
    expect(session.actionsTaken[0].elapsedSeconds).toBe(20);
  });

  it('prevents rapid duplicate timeline events from React re-renders', () => {
    let session = createDefaultSession('Choking', 'Standard Guidance');
    const nowIso = new Date().toISOString();

    session = addTimelineEvent(session, {
      type: 'instruction_presented',
      timestamp: nowIso,
      elapsedSeconds: 10,
      description: 'Step 1 — Ask are you choking',
      source: 'app_recorded',
    });

    const countAfterFirst = session.timeline.length;

    // Simulate immediate re-render with identical timestamp and description
    session = addTimelineEvent(session, {
      type: 'instruction_presented',
      timestamp: nowIso,
      elapsedSeconds: 10,
      description: 'Step 1 — Ask are you choking',
      source: 'app_recorded',
    });

    expect(session.timeline.length).toBe(countAfterFirst);
  });

  it('updates condition fields and cleans up matching important unknowns', () => {
    let session = createDefaultSession('Breathing Trouble', 'Standard Guidance');
    expect(session.importantUnknowns.some((u) => u.toLowerCase().includes('allergies'))).toBe(true);

    session = updateConditionField(
      session,
      'allergies',
      'reported',
      'Penicillin allergy reported by family',
      'bystander_reported'
    );

    expect(session.condition.allergies.status).toBe('reported');
    expect(session.condition.allergies.value).toBe('Penicillin allergy reported by family');
    expect(session.condition.allergies.source).toBe('bystander_reported');

    // Unknown for allergies should now be cleared
    expect(session.importantUnknowns.some((u) => u.toLowerCase().includes('allergies'))).toBe(false);
  });

  it('formats plain-text handoff with provenance headers and medical disclaimers', () => {
    let session = createDefaultSession('Chest Pain', 'Cardiac Protocol');
    session = addConfirmedAction(session, 'Aspirin 325mg chewed', 'bystander_confirmed', 45);
    session = updateConditionField(
      session,
      'responsiveness',
      'reported',
      'Alert but pale and sweating',
      'bystander_reported'
    );

    const plainText = formatPlainTextHandoff(session);

    expect(plainText).toContain('FIRST30.AI — EMERGENCY HANDOFF');
    expect(plainText).toContain('NOTICE: Information provided by bystander');
    expect(plainText).toContain('Reported: Alert but pale and sweating');
    expect(plainText).toContain('Aspirin 325mg chewed — Reported & confirmed by bystander');
    expect(plainText).toContain('Zero cloud transmission');
  });

  it('handles in-memory session persistence and clearing', () => {
    const session = createDefaultSession('Seizure', 'Standard Guidance');
    saveActiveSession(session);

    const retrieved = getActiveSession();
    expect(retrieved).not.toBeNull();
    expect(retrieved?.incident.selectedGuidance).toBe('Seizure');

    clearActiveSession();
    const afterClear = getActiveSession();
    expect(afterClear).toBeNull();
  });

  it('converts legacy EmergencySummaryData to structured HandoffData without data loss', () => {
    const legacyData: EmergencySummaryData = {
      category: 'Severe Bleeding',
      categoryIcon: 'droplets',
      priority: 'P1',
      calculatedPriority: 'P1',
      stepsCompleted: ['Direct Pressure'],
      stepsSkipped: [],
      totalSteps: 8,
      duration: 120,
      startTime: new Date('2026-10-21T10:00:00Z'),
      endTime: new Date('2026-10-21T10:02:00Z'),
      collectedInputs: [{ questionId: 'bleed-age', question: 'Age', answer: 'Adult' }],
      keyObservations: ['Heavy arterial bleed on forearm'],
      actionsTaken: ['Applied tourniquet above wound'],
      location: '123 Market St',
      consciousness: 'alert',
      breathing: 'normal',
      bleeding: 'severe',
    };

    const handoff = convertSummaryDataToHandoff(legacyData);

    expect(handoff.incident.selectedGuidance).toBe('Severe Bleeding');
    expect(handoff.incident.location).toBe('123 Market St');
    expect(handoff.condition.responsiveness.value).toBe('alert');
    expect(handoff.condition.breathing.value).toBe('normal');
    expect(handoff.condition.visibleInjuriesOrBleeding.value).toBe('severe');
    expect(handoff.actionsTaken.some((a) => a.action === 'Applied tourniquet above wound')).toBe(true);
    expect(handoff.condition.symptomsOrObservations.some((o) => o.text.includes('Age: Adult'))).toBe(true);
  });

  it('includes CPR metrics with unverified physical delivery notice in handoff text', () => {
    const session = createDefaultSession('Cardiac Arrest', 'CPR Precision Mode');
    session.cprMetrics = {
      totalCompressionsRecorded: 90,
      totalCyclesRecorded: 3,
      durationSeconds: 50,
      rescuerSwapsPrompted: 0,
      bpmTarget: 110,
    };

    const text = formatPlainTextHandoff(session);
    expect(text).toContain('CPR METRICS — RECORDED BY APP METRONOME');
    expect(text).toContain('Total compressions paced: 90');
    expect(text).toContain('Completed 30:2 cycles: 3');
    expect(text).toContain('App recorded; physical delivery unverified');
  });
});

describe('15 Emergency Protocols Consistency & Route Aliases', () => {
  it('ensures all 15 flows have valid steps, non-empty titles, and instructions', () => {
    const categories = getEmergencyCategories();
    expect(categories.length).toBe(15);

    categories.forEach((cat) => {
      const flow = getEmergencyFlowById(cat.id);
      expect(flow).toBeDefined();
      expect(flow?.steps.length).toBeGreaterThan(0);

      flow?.steps.forEach((step, idx) => {
        expect(step.id).toBeTruthy();
        expect(step.title.trim().length).toBeGreaterThan(0);
        expect(step.instruction.trim().length).toBeGreaterThan(0);
      });
    });
  });

  it('normalizes route aliases (poisoning -> poison, cpr -> unconscious)', () => {
    const poisoningFlow = getEmergencyFlowById('poisoning');
    expect(poisoningFlow).toBeDefined();
    expect(poisoningFlow?.id).toBe('poison');

    const cprFlow = getEmergencyFlowById('cpr');
    expect(cprFlow).toBeDefined();
    expect(cprFlow?.id).toBe('unconscious');
  });
});
