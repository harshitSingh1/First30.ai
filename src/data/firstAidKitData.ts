import { 
  Bandage, 
  Scissors, 
  Thermometer, 
  Heart, 
  Shield, 
  Droplets, 
  Flame, 
  Hand, 
  Eye,
  Pill,
  Stethoscope,
  Activity,
  Baby,
  Users,
  Building,
  GraduationCap,
  MapPin,
  Plane,
  Home,
  Factory,
  Dumbbell,
  ChefHat,
  Trees,
  AlertCircle,
  Phone,
  FileText,
  Sparkles,
  type LucideIcon
} from 'lucide-react';

// Types
export interface KitQuestion {
  id: string;
  title: string;
  subtitle?: string;
  type: 'single' | 'multi' | 'number';
  options?: KitOption[];
  optional?: boolean;
  helperText?: string;
}

export interface KitOption {
  id: string;
  label: string;
  icon?: LucideIcon;
  description?: string;
}

export interface KitItem {
  id: string;
  name: string;
  icon: LucideIcon;
  category: 'essential' | 'age-specific' | 'risk-specific' | 'optional';
  whyNeeded: string;
  whenToUse: string;
  howToUse: string[];
  mistakesToAvoid: string[];
  conditions?: string[]; // Conditions that trigger this item
  practiceScenario?: string;
}

export interface PracticeScenario {
  id: string;
  title: string;
  description: string;
  situation: string;
  itemsToUse: string[];
  steps: string[];
  confirmation: string;
}

export interface KitAssessment {
  kitType: string;
  peopleCount: number;
  ageGroups: string[];
  healthConditions: string[];
  environments: string[];
  pastIncidents: string[];
  futureRisks: string[];
}

// Assessment Questions
export const kitQuestions: KitQuestion[] = [
  {
    id: 'kitType',
    title: 'Who is this kit for?',
    subtitle: 'Select the primary use case for your first aid kit',
    type: 'single',
    options: [
      { id: 'individual', label: 'Individual', icon: Users, description: 'Personal use kit' },
      { id: 'family', label: 'Family', icon: Home, description: 'Home and family kit' },
      { id: 'office', label: 'Office / Organization', icon: Building, description: 'Workplace first aid' },
      { id: 'school', label: 'School', icon: GraduationCap, description: 'Educational institution' },
      { id: 'public', label: 'Public Place', icon: MapPin, description: 'Gym, mall, event space' },
      { id: 'travel', label: 'Travel Kit', icon: Plane, description: 'Portable emergency kit' },
    ],
  },
  {
    id: 'peopleCount',
    title: 'How many people?',
    subtitle: 'This helps determine quantities',
    type: 'number',
    helperText: 'Approximate is fine',
  },
  {
    id: 'ageGroups',
    title: 'Age groups involved',
    subtitle: 'Select all that apply',
    type: 'multi',
    options: [
      { id: 'infants', label: 'Infants (0–1)', icon: Baby },
      { id: 'children', label: 'Children (2–12)', icon: Users },
      { id: 'teenagers', label: 'Teenagers', icon: Users },
      { id: 'adults', label: 'Adults', icon: Users },
      { id: 'elderly', label: 'Elderly (60+)', icon: Users },
    ],
  },
  {
    id: 'healthConditions',
    title: 'Known health considerations',
    subtitle: 'This helps personalize your kit',
    type: 'multi',
    optional: true,
    options: [
      { id: 'asthma', label: 'Asthma / breathing issues', icon: Activity },
      { id: 'heart', label: 'Heart conditions', icon: Heart },
      { id: 'diabetes', label: 'Diabetes', icon: Droplets },
      { id: 'allergies', label: 'Severe allergies', icon: AlertCircle },
      { id: 'seizures', label: 'Seizure history', icon: Activity },
      { id: 'none', label: 'None / Not sure', icon: Shield },
    ],
  },
  {
    id: 'environments',
    title: 'Environment & risks',
    subtitle: 'Where will this kit be used?',
    type: 'multi',
    options: [
      { id: 'home', label: 'Home', icon: Home },
      { id: 'office', label: 'Office', icon: Building },
      { id: 'factory', label: 'Factory / Industrial', icon: Factory },
      { id: 'construction', label: 'Construction site', icon: Building },
      { id: 'school', label: 'School', icon: GraduationCap },
      { id: 'sports', label: 'Sports / Gym', icon: Dumbbell },
      { id: 'kitchen', label: 'Kitchen / Cooking area', icon: ChefHat },
      { id: 'outdoor', label: 'Outdoor / Travel', icon: Trees },
    ],
  },
  {
    id: 'pastIncidents',
    title: 'Past incidents',
    subtitle: 'Have any of these happened before?',
    type: 'multi',
    optional: true,
    options: [
      { id: 'cuts', label: 'Cuts / bleeding', icon: Droplets },
      { id: 'burns', label: 'Burns', icon: Flame },
      { id: 'falls', label: 'Falls / fractures', icon: AlertCircle },
      { id: 'choking', label: 'Choking', icon: Activity },
      { id: 'allergic', label: 'Allergic reactions', icon: AlertCircle },
      { id: 'electric', label: 'Electric shock', icon: Activity },
      { id: 'heat', label: 'Heat exhaustion', icon: Thermometer },
      { id: 'none', label: 'None', icon: Shield },
    ],
  },
  {
    id: 'futureRisks',
    title: 'Most likely future risks',
    subtitle: 'What emergencies are you preparing for?',
    type: 'multi',
    optional: true,
    options: [
      { id: 'minor', label: 'Minor injuries', icon: Bandage },
      { id: 'severe-bleeding', label: 'Severe bleeding', icon: Droplets },
      { id: 'burns', label: 'Burns', icon: Flame },
      { id: 'cardiac', label: 'Cardiac emergency', icon: Heart },
      { id: 'child-accidents', label: 'Child-related accidents', icon: Baby },
      { id: 'outdoor', label: 'Outdoor accidents', icon: Trees },
    ],
  },
];

// First Aid Kit Items
export const kitItems: KitItem[] = [
  // Essential Items
  {
    id: 'adhesive-bandages',
    name: 'Adhesive Bandages',
    icon: Bandage,
    category: 'essential',
    whyNeeded: 'Covers small cuts and scrapes to prevent infection',
    whenToUse: 'Minor cuts, blisters, or small wounds that need protection',
    howToUse: [
      'Clean the wound with antiseptic wipe',
      'Dry the area around the wound',
      'Remove bandage backing',
      'Apply firmly, pressing edges to seal',
      'Replace daily or when wet/dirty',
    ],
    mistakesToAvoid: [
      'Applying on dirty wounds',
      'Using on deep or heavily bleeding cuts',
      'Wrapping too tightly on fingers',
    ],
    practiceScenario: 'A paper cut on your finger that stings',
  },
  {
    id: 'sterile-gauze',
    name: 'Sterile Gauze Pads',
    icon: Bandage,
    category: 'essential',
    whyNeeded: 'Absorbs blood and protects larger wounds',
    whenToUse: 'Larger wounds, cuts, or as padding under bandages',
    howToUse: [
      'Wear disposable gloves',
      'Open package without touching the pad center',
      'Place directly on wound',
      'Apply gentle pressure',
      'Secure with tape or bandage wrap',
    ],
    mistakesToAvoid: [
      'Touching the sterile surface',
      'Removing stuck gauze forcefully',
      'Using non-sterile cloth on open wounds',
    ],
    practiceScenario: 'A scrape on the knee from a fall',
  },
  {
    id: 'compression-bandage',
    name: 'Compression Bandage',
    icon: Bandage,
    category: 'essential',
    whyNeeded: 'Controls heavy bleeding and supports sprains',
    whenToUse: 'Heavy bleeding that does not stop with light pressure, or joint sprains',
    howToUse: [
      'Wear gloves for bleeding wounds',
      'Place gauze pad on wound first',
      'Start wrapping below the injury',
      'Wrap firmly but not too tight',
      'Check circulation (fingers should stay pink)',
      'Secure the end with clips or tape',
    ],
    mistakesToAvoid: [
      'Wrapping too loosely (won\'t control bleeding)',
      'Wrapping too tightly (cuts circulation)',
      'Removing to check wound frequently',
    ],
    conditions: ['severe-bleeding', 'falls'],
    practiceScenario: 'A deep cut on the forearm that\'s bleeding heavily',
  },
  {
    id: 'antiseptic-wipes',
    name: 'Antiseptic Wipes',
    icon: Sparkles,
    category: 'essential',
    whyNeeded: 'Cleans wounds to prevent infection',
    whenToUse: 'Before applying any bandage or dressing to a wound',
    howToUse: [
      'Open packet carefully',
      'Wipe from the center of wound outward',
      'Use a fresh wipe for each stroke',
      'Let the area air dry briefly',
      'Apply bandage or dressing',
    ],
    mistakesToAvoid: [
      'Wiping toward the wound',
      'Reusing wipes',
      'Using on deep wounds or burns',
    ],
    practiceScenario: 'Cleaning a small cut before bandaging',
  },
  {
    id: 'disposable-gloves',
    name: 'Disposable Gloves',
    icon: Hand,
    category: 'essential',
    whyNeeded: 'Protects both helper and patient from infection',
    whenToUse: 'Always when dealing with blood, wounds, or bodily fluids',
    howToUse: [
      'Check gloves for tears before using',
      'Pull on without touching the outside',
      'Ensure snug fit around wrists',
      'Remove by pulling from the wrist, inside-out',
      'Dispose of safely after use',
    ],
    mistakesToAvoid: [
      'Touching your face while wearing',
      'Reusing disposable gloves',
      'Pulling from fingertips when removing',
    ],
    practiceScenario: 'Preparing to help someone with a bleeding wound',
  },
  {
    id: 'scissors',
    name: 'Medical Scissors',
    icon: Scissors,
    category: 'essential',
    whyNeeded: 'Cuts bandages, tape, and clothing safely',
    whenToUse: 'Cutting bandages to size or removing clothing from injured areas',
    howToUse: [
      'Use rounded tip pointing away from skin',
      'Cut clothing along seams when possible',
      'Make clean, decisive cuts',
      'Store with safety cover',
      'Clean after each use',
    ],
    mistakesToAvoid: [
      'Using sharp-pointed scissors near skin',
      'Pulling clothing over injuries',
      'Leaving scissors open in kit',
    ],
    practiceScenario: 'Cutting a bandage to the right length',
  },
  {
    id: 'cpr-shield',
    name: 'CPR Face Shield',
    icon: Shield,
    category: 'essential',
    whyNeeded: 'Allows safe rescue breathing during CPR',
    whenToUse: 'When performing CPR on an unconscious person not breathing',
    howToUse: [
      'Place shield over the person\'s mouth and nose',
      'Ensure one-way valve is positioned correctly',
      'Create seal around the mouth',
      'Give breaths through the valve',
      'Watch for chest rise',
    ],
    mistakesToAvoid: [
      'Placing upside down',
      'Not creating proper seal',
      'Giving breaths too fast',
    ],
    conditions: ['cardiac', 'heart'],
    practiceScenario: 'Someone collapses and stops breathing',
  },
  {
    id: 'thermometer',
    name: 'Digital Thermometer',
    icon: Thermometer,
    category: 'essential',
    whyNeeded: 'Monitors body temperature for fever or hypothermia',
    whenToUse: 'When someone feels unwell, hot, or unusually cold',
    howToUse: [
      'Clean the tip with alcohol wipe',
      'Turn on and wait for ready signal',
      'Place under tongue or in armpit',
      'Wait for beep (usually 30-60 seconds)',
      'Read and record temperature',
    ],
    mistakesToAvoid: [
      'Taking temp right after eating/drinking',
      'Not cleaning between uses',
      'Ignoring low battery warnings',
    ],
    practiceScenario: 'Checking if a child has a fever',
  },
  {
    id: 'emergency-card',
    name: 'Emergency Contact Card',
    icon: Phone,
    category: 'essential',
    whyNeeded: 'Quick access to important numbers in crisis',
    whenToUse: 'Any emergency where you need to contact help or family',
    howToUse: [
      'Keep card visible at top of kit',
      'Include local emergency number',
      'List family emergency contacts',
      'Add any critical medical info',
      'Update regularly',
    ],
    mistakesToAvoid: [
      'Hiding card deep in kit',
      'Using outdated contact numbers',
      'Not including medical conditions',
    ],
    practiceScenario: 'Finding the right number to call in a panic',
  },
  // Age-Specific Items
  {
    id: 'infant-thermometer',
    name: 'Infant Thermometer',
    icon: Thermometer,
    category: 'age-specific',
    whyNeeded: 'Safe temperature reading for babies',
    whenToUse: 'When an infant seems unwell or warm',
    howToUse: [
      'Use forehead or ear mode for infants',
      'Hold steady for accurate reading',
      'Clean sensor after each use',
      'Know fever thresholds for infants',
      'Seek help if temp exceeds 38°C/100.4°F',
    ],
    mistakesToAvoid: [
      'Using adult thermometer orally on infants',
      'Ignoring mild fevers in very young babies',
      'Not rechecking if reading seems off',
    ],
    conditions: ['infants'],
    practiceScenario: 'A fussy baby who feels warm',
  },
  {
    id: 'child-bandages',
    name: 'Child-Friendly Bandages',
    icon: Bandage,
    category: 'age-specific',
    whyNeeded: 'Sized for small injuries, with fun designs to comfort children',
    whenToUse: 'Minor cuts and scrapes on children',
    howToUse: [
      'Let the child choose the bandage design',
      'Clean wound first with gentle wipes',
      'Apply bandage with comfort and care',
      'Use distraction techniques',
      'Replace when needed',
    ],
    mistakesToAvoid: [
      'Dismissing child\'s fear',
      'Pulling bandage off quickly',
      'Using adult-sized bandages',
    ],
    conditions: ['children', 'infants'],
    practiceScenario: 'A child with a scraped knee from playing',
  },
  // Risk-Specific Items
  {
    id: 'burn-gel',
    name: 'Burn Gel / Dressing',
    icon: Flame,
    category: 'risk-specific',
    whyNeeded: 'Cools burns and protects damaged skin',
    whenToUse: 'Minor burns from heat, hot liquids, or hot surfaces',
    howToUse: [
      'Cool burn under running water first (10-20 min)',
      'Pat dry gently around the burn',
      'Apply burn gel generously',
      'Cover with non-stick dressing',
      'Seek medical help for large burns',
    ],
    mistakesToAvoid: [
      'Using ice directly on burns',
      'Applying butter or oil',
      'Breaking blisters',
      'Removing stuck clothing',
    ],
    conditions: ['burns', 'kitchen'],
    practiceScenario: 'A burn from touching a hot pan',
  },
  {
    id: 'instant-cold-pack',
    name: 'Instant Cold Pack',
    icon: Sparkles,
    category: 'risk-specific',
    whyNeeded: 'Reduces swelling and pain from injuries',
    whenToUse: 'Sprains, strains, bumps, or to reduce swelling',
    howToUse: [
      'Squeeze and shake to activate',
      'Wrap in cloth before applying',
      'Apply to injured area',
      'Use for 15-20 minutes at a time',
      'Dispose after single use',
    ],
    mistakesToAvoid: [
      'Applying directly to skin',
      'Using on open wounds',
      'Leaving on too long',
    ],
    conditions: ['sports', 'falls', 'outdoor'],
    practiceScenario: 'A twisted ankle during exercise',
  },
  {
    id: 'tourniquet',
    name: 'Tourniquet',
    icon: Bandage,
    category: 'risk-specific',
    whyNeeded: 'Stops life-threatening limb bleeding',
    whenToUse: 'Only for severe, uncontrollable bleeding from arms or legs',
    howToUse: [
      'Place 2-3 inches above the wound',
      'Never place over a joint',
      'Tighten until bleeding stops',
      'Note the time of application',
      'Do not loosen once applied',
      'Seek emergency help immediately',
    ],
    mistakesToAvoid: [
      'Using for minor bleeding',
      'Placing over the wound itself',
      'Loosening to check',
      'Delaying emergency call',
    ],
    conditions: ['severe-bleeding', 'construction', 'factory'],
    practiceScenario: 'Severe cut from machinery that won\'t stop bleeding',
  },
  {
    id: 'inhaler-spacer',
    name: 'Inhaler Spacer',
    icon: Activity,
    category: 'risk-specific',
    whyNeeded: 'Helps deliver asthma medication effectively',
    whenToUse: 'When someone with asthma needs to use their inhaler',
    howToUse: [
      'Attach inhaler to spacer',
      'Shake well',
      'Have person breathe out fully',
      'Press inhaler and breathe in slowly',
      'Hold breath for 10 seconds',
      'Wait 1 minute before second puff if needed',
    ],
    mistakesToAvoid: [
      'Breathing in too fast',
      'Not shaking inhaler',
      'Using damaged spacer',
    ],
    conditions: ['asthma'],
    practiceScenario: 'Someone having an asthma attack',
  },
  {
    id: 'glucose-tablets',
    name: 'Glucose Tablets',
    icon: Pill,
    category: 'risk-specific',
    whyNeeded: 'Quickly raises blood sugar in diabetic emergencies',
    whenToUse: 'When a diabetic person shows signs of low blood sugar',
    howToUse: [
      'Recognize signs: shaking, sweating, confusion',
      'If conscious, give 3-4 tablets',
      'Wait 15 minutes',
      'Recheck and repeat if needed',
      'Follow with food when stable',
    ],
    mistakesToAvoid: [
      'Giving to unconscious person',
      'Giving too many at once',
      'Ignoring persistent symptoms',
    ],
    conditions: ['diabetes'],
    practiceScenario: 'A diabetic friend becoming shaky and confused',
  },
  {
    id: 'epipen-holder',
    name: 'EpiPen Holder/Guide',
    icon: AlertCircle,
    category: 'risk-specific',
    whyNeeded: 'Information card for severe allergic reactions',
    whenToUse: 'When someone has a severe allergic reaction',
    howToUse: [
      'Recognize anaphylaxis: swelling, hives, breathing trouble',
      'Call emergency services immediately',
      'Help locate person\'s own EpiPen',
      'Follow EpiPen instructions',
      'Keep person lying down with legs elevated',
      'Be ready to perform CPR',
    ],
    mistakesToAvoid: [
      'Waiting to see if it gets worse',
      'Having person stand or walk',
      'Not calling emergency services',
    ],
    conditions: ['allergies'],
    practiceScenario: 'Someone having a severe reaction after eating',
  },
  {
    id: 'oral-rehydration',
    name: 'Oral Rehydration Salts',
    icon: Droplets,
    category: 'risk-specific',
    whyNeeded: 'Replaces fluids and minerals lost during illness or heat',
    whenToUse: 'Dehydration from vomiting, diarrhea, or heat exhaustion',
    howToUse: [
      'Dissolve one packet in clean water',
      'Follow packet instructions for water amount',
      'Have person sip slowly',
      'Continue over several hours',
      'Seek help if symptoms persist',
    ],
    mistakesToAvoid: [
      'Using too much or too little water',
      'Drinking too fast',
      'Giving to unconscious person',
    ],
    conditions: ['heat', 'outdoor', 'travel'],
    practiceScenario: 'Someone feeling weak after being in the sun too long',
  },
  {
    id: 'eye-wash',
    name: 'Eye Wash Solution',
    icon: Eye,
    category: 'risk-specific',
    whyNeeded: 'Flushes out foreign objects or chemicals from eyes',
    whenToUse: 'When something gets in the eye or chemical splash',
    howToUse: [
      'Tilt head with affected eye down',
      'Open eye gently',
      'Flush from inner corner outward',
      'Continue for 15-20 minutes for chemicals',
      'Seek medical help after flushing',
    ],
    mistakesToAvoid: [
      'Rubbing the eye',
      'Using tap water for chemical exposure',
      'Not flushing long enough',
    ],
    conditions: ['factory', 'construction', 'kitchen'],
    practiceScenario: 'Getting cleaning product splash in the eye',
  },
  // Optional Items
  {
    id: 'antihistamine',
    name: 'Antihistamine Tablets',
    icon: Pill,
    category: 'optional',
    whyNeeded: 'Commonly used for mild allergic reactions',
    whenToUse: 'Mild allergic reactions, hives, or insect bites (not anaphylaxis)',
    howToUse: [
      'Read dosage instructions carefully',
      'Give with water',
      'Note time given',
      'Watch for improvement or worsening',
      'Consult doctor if unsure',
    ],
    mistakesToAvoid: [
      'Giving wrong dose',
      'Using for severe reactions instead of emergency help',
      'Ignoring drowsiness warnings',
    ],
    practiceScenario: 'Mild hives after an insect bite',
  },
  {
    id: 'triangular-bandage',
    name: 'Triangular Bandage',
    icon: Bandage,
    category: 'optional',
    whyNeeded: 'Creates slings for arm injuries',
    whenToUse: 'Arm injuries, fractures, or shoulder support',
    howToUse: [
      'Fold into triangle shape',
      'Support injured arm at elbow',
      'Slide bandage under arm and behind neck',
      'Tie at shoulder, not on spine',
      'Secure elbow corner with safety pin',
    ],
    mistakesToAvoid: [
      'Tying knot on neck spine',
      'Making sling too tight',
      'Moving fractured limb unnecessarily',
    ],
    conditions: ['falls', 'sports', 'outdoor'],
    practiceScenario: 'Supporting an arm after a fall',
  },
  {
    id: 'first-aid-manual',
    name: 'First Aid Quick Guide',
    icon: FileText,
    category: 'optional',
    whyNeeded: 'Step-by-step reference during emergencies',
    whenToUse: 'When unsure about proper first aid procedures',
    howToUse: [
      'Keep at top of kit for easy access',
      'Familiarize yourself before emergencies',
      'Look up specific condition',
      'Follow steps in order',
      'Use as backup to training',
    ],
    mistakesToAvoid: [
      'Burying under other supplies',
      'Never reading it beforehand',
      'Replacing proper training entirely',
    ],
    practiceScenario: 'Quickly looking up how to help someone choking',
  },
];

// Practice Scenarios
export const practiceScenarios: PracticeScenario[] = [
  {
    id: 'child-nosebleed',
    title: 'Child with Nosebleed',
    description: 'A 7-year-old gets a nosebleed while playing',
    situation: 'A child suddenly has blood coming from their nose. They are scared but conscious and breathing normally. The bleeding is steady but not severe.',
    itemsToUse: ['disposable-gloves', 'sterile-gauze', 'antiseptic-wipes'],
    steps: [
      'Stay calm and comfort the child',
      'Put on disposable gloves',
      'Have the child sit upright and lean slightly forward',
      'Pinch the soft part of the nose firmly',
      'Hold for 10-15 minutes without checking',
      'Apply a cold pack to the bridge of nose if available',
      'Clean the face gently with antiseptic wipes',
      'Seek medical help if bleeding continues past 20 minutes',
    ],
    confirmation: 'Great job! You handled the nosebleed calmly and correctly.',
  },
  {
    id: 'kitchen-burn',
    title: 'Burn in Kitchen',
    description: 'Someone touches a hot pan while cooking',
    situation: 'While cooking, a person accidentally touches a hot pan handle. They have a red, painful burn on their palm about 2 inches across. No blisters yet.',
    itemsToUse: ['burn-gel', 'sterile-gauze', 'adhesive-bandages'],
    steps: [
      'Move away from the heat source',
      'Cool the burn under cool running water for 10-20 minutes',
      'Do not use ice, butter, or oil',
      'Pat the area dry gently',
      'Apply burn gel to the affected area',
      'Cover loosely with sterile gauze',
      'Secure with tape, not too tight',
      'Take over-the-counter pain relief if needed',
    ],
    confirmation: 'Well done! You treated the burn safely and prevented further damage.',
  },
  {
    id: 'office-cut',
    title: 'Office Cut Injury',
    description: 'A paper cut turns into a deeper cut from scissors',
    situation: 'A colleague cuts their finger while using scissors at their desk. The cut is about 1 inch long and bleeding moderately. They are conscious and calm.',
    itemsToUse: ['disposable-gloves', 'antiseptic-wipes', 'sterile-gauze', 'adhesive-bandages'],
    steps: [
      'Put on disposable gloves',
      'Apply pressure with sterile gauze',
      'Hold pressure for 5-10 minutes',
      'Once bleeding slows, clean around wound with antiseptic wipe',
      'Apply a fresh sterile gauze pad',
      'Secure with adhesive bandage or tape',
      'Advise them to keep hand elevated',
      'Suggest a tetanus check if not recently vaccinated',
    ],
    confirmation: 'Excellent! You handled the cut professionally and safely.',
  },
  {
    id: 'suspected-fracture',
    title: 'Fall with Suspected Fracture',
    description: 'Someone falls and can\'t move their arm',
    situation: 'An elderly person falls on wet floor. They are holding their arm, which looks swollen near the wrist. They can\'t move it without severe pain. They are conscious and breathing normally.',
    itemsToUse: ['instant-cold-pack', 'triangular-bandage', 'compression-bandage'],
    steps: [
      'Keep the person calm and still',
      'Do not move the injured arm unnecessarily',
      'Support the arm in the position found',
      'Apply cold pack wrapped in cloth to reduce swelling',
      'Create a sling using triangular bandage if trained',
      'Call for medical help',
      'Monitor for shock symptoms',
      'Keep them warm and comfortable while waiting',
    ],
    confirmation: 'Great work! You kept them stable and safe while waiting for help.',
  },
];

// Helper function to get kit items based on assessment
export function generatePersonalizedKit(assessment: KitAssessment): {
  essential: KitItem[];
  ageSpecific: KitItem[];
  riskSpecific: KitItem[];
  optional: KitItem[];
} {
  const essential = kitItems.filter(item => item.category === 'essential');
  
  const ageSpecific = kitItems.filter(item => {
    if (item.category !== 'age-specific') return false;
    if (!item.conditions) return false;
    return item.conditions.some(condition => 
      assessment.ageGroups.includes(condition)
    );
  });
  
  const allConditions = [
    ...assessment.healthConditions,
    ...assessment.environments,
    ...assessment.pastIncidents,
    ...assessment.futureRisks,
  ];
  
  const riskSpecific = kitItems.filter(item => {
    if (item.category !== 'risk-specific') return false;
    if (!item.conditions) return false;
    return item.conditions.some(condition => 
      allConditions.includes(condition)
    );
  });
  
  const optional = kitItems.filter(item => item.category === 'optional');
  
  return { essential, ageSpecific, riskSpecific, optional };
}

// Get relevant scenarios based on kit items
export function getRelevantScenarios(kitItemIds: string[]): PracticeScenario[] {
  return practiceScenarios.filter(scenario =>
    scenario.itemsToUse.some(itemId => kitItemIds.includes(itemId))
  );
}
