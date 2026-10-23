import { jsPDF } from 'jspdf';
import { HandoffData } from '@/types/emergencyHandoff';

export interface EmergencyCardPdfData {
  category: string;
  duration: string;
  completedStepsCount: number;
  totalStepsCount: number;
  stepsCompleted: string[];
  collectedInputs: Array<{ question: string; answer: string }>;
  recommendations?: string[];
  completedAt?: string;
}

/**
 * Generates and downloads a clean, clinical-grade PDF for the Emergency Summary Card
 */
export const downloadEmergencyCardPdf = (data: EmergencyCardPdfData): boolean => {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const contentWidth = pageWidth - margin * 2;
    let y = 15;

    const checkPageBreak = (neededHeight: number) => {
      if (y + neededHeight > pageHeight - margin) {
        doc.addPage();
        y = margin + 5;
        // Mini header on subsequent pages
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(120, 120, 120);
        doc.text('First30.ai — Emergency Protocol Summary (Cont.)', margin, y - 2);
        doc.setDrawColor(220, 220, 220);
        doc.line(margin, y, margin + contentWidth, y);
        y += 6;
      }
    };

    // --- Header Banner ---
    doc.setFillColor(15, 23, 42); // Slate 900
    doc.rect(margin, y, contentWidth, 22, 'F');

    doc.setFillColor(220, 38, 38); // Red emergency badge accent
    doc.rect(margin, y, 4, 22, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text('FIRST30.AI — EMERGENCY PROTOCOL SUMMARY', margin + 8, y + 8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184); // Slate 400
    doc.text('On-Scene Bystander Incident & Triage Record', margin + 8, y + 15);

    y += 28;

    // --- Overview Metrics Box ---
    doc.setFillColor(248, 250, 252); // Slate 50
    doc.setDrawColor(226, 232, 240); // Slate 200
    doc.roundedRect(margin, y, contentWidth, 26, 2, 2, 'FD');

    // Category
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('EMERGENCY CATEGORY', margin + 4, y + 6);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text(data.category, margin + 4, y + 13);

    // Date & Time
    const timestamp = data.completedAt || new Date().toLocaleString();
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`Recorded: ${timestamp}`, margin + 4, y + 20);

    // Duration Column
    const col2X = margin + contentWidth * 0.55;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('TOTAL DURATION', col2X, y + 6);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(180, 83, 9); // Amber 700
    doc.text(data.duration, col2X, y + 13);

    // Protocol Progress Column
    const col3X = margin + contentWidth * 0.8;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('PROGRESS', col3X, y + 6);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(22, 101, 52); // Green 700
    doc.text(`${data.completedStepsCount}/${data.totalStepsCount} Steps`, col3X, y + 13);

    y += 32;

    // --- Section: Assessment Responses ---
    if (data.collectedInputs.length > 0) {
      checkPageBreak(25);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      doc.text('1. Initial Assessment & Bystander Responses', margin, y);
      y += 5;

      data.collectedInputs.forEach((input) => {
        checkPageBreak(14);
        doc.setFillColor(241, 245, 249);
        doc.setDrawColor(226, 232, 240);
        doc.roundedRect(margin, y, contentWidth, 12, 1.5, 1.5, 'FD');

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(71, 85, 105);
        doc.text(input.question, margin + 4, y + 4.5);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(15, 23, 42);
        doc.text(`Answer: ${input.answer}`, margin + 4, y + 9);

        y += 14;
      });

      y += 4;
    }

    // --- Section: Completed Protocol Steps ---
    if (data.stepsCompleted.length > 0) {
      checkPageBreak(25);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      doc.text('2. Completed Protocol Actions', margin, y);
      y += 5;

      data.stepsCompleted.forEach((step, idx) => {
        const stepText = `${idx + 1}. ${step}`;
        const lines = doc.splitTextToSize(stepText, contentWidth - 10);
        const itemHeight = Math.max(7, lines.length * 4.5 + 2);

        checkPageBreak(itemHeight + 2);

        doc.setFillColor(240, 253, 244); // Light emerald
        doc.setDrawColor(187, 247, 208);
        doc.roundedRect(margin, y, contentWidth, itemHeight, 1, 1, 'FD');

        // Checkmark badge
        doc.setFillColor(34, 197, 94);
        doc.circle(margin + 4, y + 4, 2, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6);
        doc.text('v', margin + 3.2, y + 4.8);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(20, 83, 45); // Dark emerald
        doc.text(lines, margin + 8, y + 4.5);

        y += itemHeight + 2.5;
      });

      y += 4;
    }

    // --- Section: Clinical Recommendations ---
    if (data.recommendations && data.recommendations.length > 0) {
      checkPageBreak(25);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      doc.text('3. Paramedic & Emergency Handoff Recommendations', margin, y);
      y += 5;

      data.recommendations.forEach((rec) => {
        const lines = doc.splitTextToSize(`* ${rec}`, contentWidth - 8);
        const itemHeight = Math.max(7, lines.length * 4.5 + 2);

        checkPageBreak(itemHeight + 2);

        doc.setFillColor(254, 252, 232); // Amber light
        doc.setDrawColor(254, 240, 138);
        doc.roundedRect(margin, y, contentWidth, itemHeight, 1, 1, 'FD');

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(113, 63, 18);
        doc.text(lines, margin + 4, y + 4.5);

        y += itemHeight + 2.5;
      });

      y += 4;
    }

    // --- Footer Notice ---
    checkPageBreak(18);
    y = Math.max(y + 2, pageHeight - margin - 15);
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, y, margin + contentWidth, y);
    y += 4;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(
      'First30.ai Emergency Guidance Record | Ephemeral on-scene bystander timeline | Zero cloud transmission guarantee',
      margin,
      y
    );
    doc.text(
      `File generated: ${new Date().toISOString()}`,
      margin,
      y + 3.5
    );

    // Save PDF
    const safeCategory = data.category.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const filename = `First30-Emergency-Summary-${safeCategory}-${new Date().toISOString().slice(0, 10)}.pdf`;
    doc.save(filename);
    return true;
  } catch (error) {
    console.error('[PDFGenerator] Failed to generate PDF:', error);
    return false;
  }
};

/**
 * Generates and downloads a full paramedic handoff PDF for HandoffData session
 */
export const downloadHandoffSessionPdf = (session: HandoffData): boolean => {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const contentWidth = pageWidth - margin * 2;
    let y = 15;

    const checkPageBreak = (neededHeight: number) => {
      if (y + neededHeight > pageHeight - margin) {
        doc.addPage();
        y = margin + 5;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(120, 120, 120);
        doc.text('First30.ai — Paramedic Handoff Record (Cont.)', margin, y - 2);
        doc.setDrawColor(220, 220, 220);
        doc.line(margin, y, margin + contentWidth, y);
        y += 6;
      }
    };

    // Header
    doc.setFillColor(15, 23, 42);
    doc.rect(margin, y, contentWidth, 22, 'F');
    doc.setFillColor(37, 99, 235); // Blue
    doc.rect(margin, y, 4, 22, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text('FIRST30.AI — PARAMEDIC & RESPONDER HANDOFF', margin + 8, y + 8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(148, 163, 184);
    doc.text(`Incident: ${session.incident.selectedGuidance} | Generated: ${new Date().toLocaleString()}`, margin + 8, y + 15);

    y += 28;

    // Clinical Status Overview
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, y, contentWidth, 22, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('CONSCIOUSNESS', margin + 4, y + 5);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text((session.clinical.consciousnessLevel.value || 'Not assessed').toUpperCase(), margin + 4, y + 11);

    const c2X = margin + contentWidth * 0.35;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('BREATHING', c2X, y + 5);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text((session.clinical.breathingStatus.value || 'Not assessed').toUpperCase(), c2X, y + 11);

    const c3X = margin + contentWidth * 0.7;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('SEVERE BLEEDING', c3X, y + 5);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text((session.clinical.severeBleeding.value || 'Not assessed').toUpperCase(), c3X, y + 11);

    y += 28;

    // Timeline Events
    if (session.timeline.events.length > 0) {
      checkPageBreak(25);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      doc.text('Chronological Scene Timeline', margin, y);
      y += 5;

      session.timeline.events.forEach((evt) => {
        const timeStr = evt.timestamp ? new Date(evt.timestamp).toLocaleTimeString() : 'Scene';
        const lines = doc.splitTextToSize(`[${timeStr}] ${evt.description}`, contentWidth - 8);
        const itemHeight = Math.max(6, lines.length * 4 + 2);

        checkPageBreak(itemHeight + 2);

        doc.setFillColor(241, 245, 249);
        doc.setDrawColor(226, 232, 240);
        doc.roundedRect(margin, y, contentWidth, itemHeight, 1, 1, 'FD');

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(30, 41, 59);
        doc.text(lines, margin + 4, y + 3.8);

        y += itemHeight + 2;
      });

      y += 4;
    }

    // Save PDF
    const safeCat = (session.incident.selectedGuidance || 'Emergency').toLowerCase().replace(/[^a-z0-9]/g, '-');
    const filename = `First30-Paramedic-Handoff-${safeCat}-${new Date().toISOString().slice(0, 10)}.pdf`;
    doc.save(filename);
    return true;
  } catch (error) {
    console.error('[PDFGenerator] Failed to generate handoff PDF:', error);
    return false;
  }
};
