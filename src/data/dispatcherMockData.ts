import { TranscriptEntry, AISummary, DispatchPlan, RecommendedQuestion, CallSession } from '@/types/dispatcher';
import { EmergencySummaryData } from '@/types/emergency';

export const mockTranscript: TranscriptEntry[] = [
  {
    id: '1',
    timestamp: new Date(Date.now() - 180000),
    speaker: 'dispatcher',
    message: '911, what is your emergency?'
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 170000),
    speaker: 'caller',
    message: 'My father collapsed! He\'s not responding!',
    flagged: true
  },
  {
    id: '3',
    timestamp: new Date(Date.now() - 160000),
    speaker: 'dispatcher',
    message: 'I understand. Is he breathing?'
  },
  {
    id: '4',
    timestamp: new Date(Date.now() - 150000),
    speaker: 'caller',
    message: 'I don\'t know... I can\'t tell. He\'s on the floor.',
    flagged: true
  },
  {
    id: '5',
    timestamp: new Date(Date.now() - 140000),
    speaker: 'system',
    message: '⚠️ AI Detection: Possible cardiac arrest'
  },
  {
    id: '6',
    timestamp: new Date(Date.now() - 130000),
    speaker: 'dispatcher',
    message: 'Check his chest. Is it rising and falling?'
  },
  {
    id: '7',
    timestamp: new Date(Date.now() - 120000),
    speaker: 'caller',
    message: 'No, I don\'t think so. What do I do?!'
  },
  {
    id: '8',
    timestamp: new Date(Date.now() - 110000),
    speaker: 'dispatcher',
    message: 'Help is on the way. I\'ll guide you through CPR.'
  },
  {
    id: '9',
    timestamp: new Date(Date.now() - 100000),
    speaker: 'system',
    message: '🚑 EMS dispatched - Unit 7 - ETA 6 min'
  }
];

export const mockAISummary: AISummary = {
  chiefComplaint: 'Adult male collapsed, unresponsive, not breathing',
  patientInfo: {
    ageGroup: 'Elderly (60+)',
    conscious: false,
    breathing: false,
    injuries: ['Possible cardiac arrest', 'Fall-related injury unknown']
  },
  keyObservations: [
    'Patient unresponsive to verbal/physical stimuli',
    'No visible chest rise detected by caller',
    'Sudden onset - collapsed without warning',
    'Caller highly distressed - first responder guidance initiated'
  ],
  riskFactors: [
    'Age >60 years',
    'Sudden collapse (cardiac event likely)',
    'No breathing detected',
    'Time-critical intervention required'
  ],
  timeline: [
    '0:00 - Call received',
    '0:10 - Collapse reported',
    '0:30 - Breathing check initiated',
    '0:50 - Cardiac arrest suspected',
    '1:20 - EMS dispatched',
    '1:30 - CPR guidance started'
  ]
};

export const mockRecommendedQuestions: RecommendedQuestion[] = [
  {
    id: 'q1',
    question: 'Is there an AED (defibrillator) nearby?',
    category: 'medical',
    asked: false,
    critical: true
  },
  {
    id: 'q2',
    question: 'Does the patient have any known heart conditions?',
    category: 'medical',
    asked: true
  },
  {
    id: 'q3',
    question: 'Is anyone else there who can help with CPR?',
    category: 'safety',
    asked: false,
    critical: true
  },
  {
    id: 'q4',
    question: 'What is the exact address? Any landmarks?',
    category: 'location',
    asked: true
  },
  {
    id: 'q5',
    question: 'Is the front door unlocked for responders?',
    category: 'safety',
    asked: false
  },
  {
    id: 'q6',
    question: 'Are there any pets that need to be secured?',
    category: 'safety',
    asked: false
  }
];

export const mockDispatchPlan: DispatchPlan = {
  recommendations: [
    {
      id: 'r1',
      service: 'ems',
      priority: 'P1',
      reason: 'Suspected cardiac arrest - immediate ALS required',
      eta: '6 min'
    },
    {
      id: 'r2',
      service: 'fire',
      priority: 'P2',
      reason: 'Additional personnel for CPR assistance',
      eta: '4 min'
    }
  ],
  suggestedQuestions: mockRecommendedQuestions,
  triageLevel: 'P1',
  dispatchUnits: ['EMS', 'Fire'],
  notes: 'High priority cardiac call. CPR in progress. Consider air ambulance if rural location.'
};

export const mockCallSession: CallSession = {
  id: 'call-001',
  startTime: new Date(Date.now() - 180000),
  currentPhase: '2-5',
  transcript: mockTranscript,
  aiSummary: mockAISummary,
  dispatchPlan: mockDispatchPlan,
  status: 'active'
};

// Generate dispatch data from citizen emergency summary
export const generateFromCitizenSummary = (summary: EmergencySummaryData): {
  aiSummary: AISummary;
  dispatchPlan: DispatchPlan;
  transcript: TranscriptEntry[];
} => {
  const aiSummary: AISummary = {
    chiefComplaint: `${summary.category} emergency - ${summary.keyObservations[0] || 'Details pending'}`,
    patientInfo: {
      ageGroup: summary.collectedInputs.find(i => i.questionId.includes('age'))?.answer || 'Unknown',
      conscious: summary.collectedInputs.find(i => i.question.toLowerCase().includes('conscious'))?.answer === 'Yes',
      breathing: summary.collectedInputs.find(i => i.question.toLowerCase().includes('breathing'))?.answer !== 'No',
      injuries: summary.keyObservations
    },
    keyObservations: summary.keyObservations,
    riskFactors: [
      `Priority: ${summary.calculatedPriority}`,
      `Duration: ${Math.floor(summary.duration / 60)} minutes`,
      ...summary.stepsSkipped.length > 0 ? [`${summary.stepsSkipped.length} steps skipped`] : []
    ],
    timeline: [
      `Started: ${summary.startTime.toLocaleTimeString()}`,
      ...summary.actionsTaken.map((action, i) => `Step ${i + 1}: ${action}`)
    ]
  };

  const questions: RecommendedQuestion[] = [
    {
      id: 'gen-q1',
      question: 'What is the current status of the patient?',
      category: 'medical',
      asked: false,
      critical: true
    },
    {
      id: 'gen-q2',
      question: 'Is professional help needed immediately?',
      category: 'medical',
      asked: false,
      critical: summary.calculatedPriority === 'P1'
    },
    {
      id: 'gen-q3',
      question: 'What is the exact location?',
      category: 'location',
      asked: !!summary.location
    },
    {
      id: 'gen-q4',
      question: 'Are there any changes since the summary was created?',
      category: 'context',
      asked: false
    }
  ];

  const dispatchPlan: DispatchPlan = {
    recommendations: [
      {
        id: 'gen-r1',
        service: 'ems',
        priority: summary.calculatedPriority,
        reason: `${summary.category} - ${summary.keyObservations[0] || 'Emergency response required'}`
      }
    ],
    suggestedQuestions: questions,
    triageLevel: summary.calculatedPriority,
    dispatchUnits: summary.calculatedPriority === 'P1' ? ['EMS', 'Fire'] : ['EMS'],
    notes: `Generated from Citizen Mode summary. ${summary.stepsCompleted.length} steps completed, ${summary.stepsSkipped.length} skipped.`
  };

  const transcript: TranscriptEntry[] = [
    {
      id: 'gen-t1',
      timestamp: summary.startTime,
      speaker: 'system',
      message: `📱 Citizen Mode Summary Received - ${summary.category}`
    },
    ...summary.collectedInputs.map((input, i) => ({
      id: `gen-t${i + 2}`,
      timestamp: new Date(summary.startTime.getTime() + i * 30000),
      speaker: 'caller' as const,
      message: `${input.question}: ${input.answer}`,
      flagged: input.answer === 'No' && input.question.toLowerCase().includes('breathing')
    })),
    {
      id: `gen-t-end`,
      timestamp: summary.endTime,
      speaker: 'system',
      message: `✅ Summary completed - Priority ${summary.calculatedPriority}`
    }
  ];

  return { aiSummary, dispatchPlan, transcript };
};
