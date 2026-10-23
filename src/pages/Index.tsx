import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import HeroIllustration from '@/components/home/HeroIllustration';
import VoiceAssistantModal from '@/components/voice/VoiceAssistantModal';
import { useEmergencyRegion } from '@/contexts/EmergencyRegionContext';
import PWAInstallButton from '@/components/pwa/PWAInstallButton';
import OfflineDiagnosticBadge from '@/components/pwa/OfflineDiagnosticBadge';
import {
  Shield,
  Heart,
  Activity,
  Mic,
  MapPin,
  Phone,
  Flame,
  Droplets,
  Wind,
  Zap,
  Waves,
  Thermometer,
  AlertTriangle,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Package,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  WifiOff,
  Lock,
  Building2,
  Stethoscope,
  Pill,
  Radio,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Index() {
  const navigate = useNavigate();
  const { emergencyNumber, selectedCountry, toggleStandardNumber } = useEmergencyRegion();
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [showAllCategories, setShowAllCategories] = useState(false);

  // Four Primary Marquee Emergency Actions (Top 4 critical mortality situations)
  const primaryEmergencies = [
    {
      id: 'cpr',
      path: '/cpr',
      title: 'Unresponsive / Not Breathing',
      subtitle: 'Victim collapsed, no pulse or irregular gasping',
      tag: 'P1 · Critical',
      tagColor: 'text-blue-400 bg-blue-500/15 border-blue-500/30',
      icon: Heart,
      iconColor: 'text-blue-400',
      bgGlow: 'hover:border-blue-500/50 hover:shadow-blue-500/10',
      actionText: 'Start CPR Mode (110 BPM)',
    },
    {
      id: 'choking',
      path: '/emergency/choking',
      title: 'Choking / Obstructed Airway',
      subtitle: 'Unable to speak, coughing weakly, clutching throat',
      tag: 'P1 · Immediate',
      tagColor: 'text-amber-400 bg-amber-500/15 border-amber-500/30',
      icon: Wind,
      iconColor: 'text-amber-400',
      bgGlow: 'hover:border-amber-500/50 hover:shadow-amber-500/10',
      actionText: 'Heimlich & Back Blows',
    },
    {
      id: 'bleeding',
      path: '/emergency/bleeding',
      title: 'Severe Bleeding / Trauma',
      subtitle: 'Arterial spurting, deep puncture or heavy blood loss',
      tag: 'P1 · Critical',
      tagColor: 'text-blue-400 bg-blue-500/15 border-blue-500/30',
      icon: Droplets,
      iconColor: 'text-blue-400',
      bgGlow: 'hover:border-blue-500/50 hover:shadow-blue-500/10',
      actionText: 'Direct Pressure Protocol',
    },
    {
      id: 'chest-pain',
      path: '/emergency/chest-pain',
      title: 'Chest Pain / Possible Stroke',
      subtitle: 'Crushing chest tightness, arm numbness or facial droop',
      tag: 'P1 · Urgent',
      tagColor: 'text-amber-400 bg-amber-500/15 border-amber-500/30',
      icon: Activity,
      iconColor: 'text-amber-400',
      bgGlow: 'hover:border-amber-500/50 hover:shadow-amber-500/10',
      actionText: 'FAST & Cardiac Guidance',
    },
  ];

  // Secondary Emergency Categories (Expandable grid)
  const secondaryEmergencies = [
    { id: 'burns', path: '/emergency/burns', title: 'Severe Burns & Scalds', desc: 'Thermal, steam or flame burns', icon: Flame },
    { id: 'seizure', path: '/emergency/seizure', title: 'Seizures & Convulsions', desc: 'Involuntary shaking, epilepsy', icon: Activity },
    { id: 'fracture', path: '/emergency/fracture', title: 'Fractures & Sprains', desc: 'Deformed limb, bone fracture', icon: Shield },
    { id: 'head-injury', path: '/emergency/head-injury', title: 'Head & Spinal Trauma', desc: 'Concussion, skull impact, dizziness', icon: AlertTriangle },
    { id: 'poisoning', path: '/emergency/poison', title: 'Poisoning & Ingestion', desc: 'Chemicals, medications, toxins', icon: AlertTriangle },
    { id: 'allergy', path: '/emergency/allergy', title: 'Severe Allergic Reaction', desc: 'Anaphylaxis, EpiPen, throat swelling', icon: Shield },
    { id: 'breathing', path: '/emergency/breathing', title: 'Asthma & Respiratory', desc: 'Severe wheezing, inhaler guidance', icon: Wind },
    { id: 'electric', path: '/emergency/electric', title: 'Electric Shock', desc: 'High voltage or household currents', icon: Zap },
    { id: 'drowning', path: '/emergency/drowning', title: 'Drowning / Submersion', desc: 'Water inhalation, rescue breaths', icon: Waves },
    { id: 'fever', path: '/emergency/fever', title: 'High Fever & Heat Stroke', desc: 'Heat exhaustion, dangerous spike', icon: Thermometer },
    { id: 'unconscious', path: '/emergency/unconscious', title: 'Fainting & Syncope', desc: 'Temporary loss of consciousness', icon: Activity },
  ];

  return (
    <Layout showHeader={true} showFooter={true} showEmergencyBanner={false}>
      {/* =========================================================================
          HERO SECTION: SPLIT MARKETING & BRAND
          ========================================================================= */}
      <section className="relative pt-6 md:pt-12 pb-12 md:pb-16 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-left">
              {/* Green Theme Badges */}
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-xs font-semibold text-emerald-400 shadow-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>No Login Required</span>
                </div>
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-xs font-semibold text-emerald-400 shadow-sm">
                  <WifiOff className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Works Offline</span>
                </div>
              </div>

              {/* Headline */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground text-balance leading-[1.12]">
                <span className="block text-foreground">Stay Calm. Act Fast.</span>
                <span className="block text-primary mt-1.5 sm:mt-2">
                  Get guided help in the first 30 minutes.
                </span>
              </h1>

              {/* Supporting Text */}
              <p className="text-base sm:text-lg text-muted-foreground max-w-xl leading-relaxed">
                Clear, step-by-step first-aid guidance, voice assistance, and nearby emergency
                resources during the critical 8–14 minutes before professional help arrives.
              </p>

              {/* Dual Mode CTAs */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <a
                  href="#emergency-actions"
                  className="inline-flex items-center justify-center h-9 px-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs shadow-xs transition-colors active:scale-[0.98] gap-1.5"
                >
                  <Activity className="w-3.5 h-3.5 shrink-0" />
                  <span>Get Emergency Help</span>
                </a>

                <PWAInstallButton variant="hero" />
              </div>

              {/* Small Trust Indicators */}
              <div className="pt-4 border-t border-border/40 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>No account needed</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>5-language voice</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Verified protocols</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-teal-400 font-semibold">100% Offline PWA</span>
                </div>
              </div>
            </div>

            {/* Right Visual: Layered Medical 3D Scene (Hidden on smaller screens) */}
            <div className="hidden lg:block lg:col-span-5 relative">
              <HeroIllustration />
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          MODE A: IMMEDIATE EMERGENCY ACTION PANEL
          ========================================================================= */}
      <section id="emergency-actions" className="py-12 bg-secondary/20 border-y border-border/40 scroll-mt-20">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Section Header with Quick Emergency Call Bar */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <div className="text-xs uppercase tracking-widest text-primary font-bold mb-1">
                Active Emergency Guidance
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
                What do you need help with?
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base mt-1">
                Choose the situation below to begin safe, one-step-at-a-time instructions.
              </p>
            </div>

            {/* Regional Direct Call Badge */}
            <div className="flex items-center gap-2 self-start md:self-auto p-2 rounded-2xl bg-card border border-border/60 shadow-sm">
              <div className="text-left px-2">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Emergency Line</div>
                <div className="text-sm font-bold font-mono text-primary flex items-center gap-1.5">
                  <span>{selectedCountry}</span>
                  <span>·</span>
                  <span>{emergencyNumber}</span>
                </div>
              </div>
              <a
                href={`tel:${emergencyNumber}`}
                className="h-10 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-transform active:scale-95"
              >
                <Phone className="w-3.5 h-3.5" />
                Call Now
              </a>
              <button
                onClick={toggleStandardNumber}
                title="Toggle 911 / 112"
                className="h-10 px-2.5 rounded-xl border border-border/60 bg-secondary/50 hover:bg-secondary text-xs text-muted-foreground hover:text-foreground"
              >
                Switch
              </button>
            </div>
          </div>

          {/* 4 Marquee Action Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {primaryEmergencies.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  onClick={() => navigate(item.path)}
                  className={`group cursor-pointer rounded-2xl bg-card border border-border/70 p-5 shadow-md transition-all duration-200 hover:-translate-y-1 ${item.bgGlow} flex flex-col justify-between`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-secondary/70 border border-border/50 flex items-center justify-center group-hover:scale-105 transition-transform">
                        <Icon className={`w-6 h-6 ${item.iconColor}`} />
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${item.tagColor}`}>
                        {item.tag}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-foreground leading-snug group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                      {item.subtitle}
                    </p>
                  </div>

                  <div className="pt-5 mt-4 border-t border-border/40 flex items-center justify-between text-xs font-semibold text-primary">
                    <span>{item.actionText}</span>
                    <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Voice-First Emergency Entry Banner */}
          <div className="mt-6 rounded-2xl bg-gradient-to-r from-card via-card to-primary/10 border border-border/80 p-5 md:p-6 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0">
                <Mic className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Prefer to speak?</h3>
                <p className="text-xs md:text-sm text-muted-foreground mt-0.5 max-w-xl">
                  Describe what happened in your own words, and First30.ai will automatically transcribe,
                  triage, and walk you through the safest steps hands-free.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-stretch sm:self-auto shrink-0">
              <Button
                onClick={() => setIsVoiceModalOpen(true)}
                className="w-full sm:w-auto h-11 px-5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm shadow-sm"
              >
                <Mic className="w-4 h-4 mr-2" />
                Open Voice Guide
              </Button>
            </div>
          </div>

          {/* Expandable Secondary Emergency Categories */}
          <div className="mt-8 pt-6 border-t border-border/40">
            <button
              onClick={() => setShowAllCategories(!showAllCategories)}
              className="w-full py-2.5 px-4 rounded-xl bg-card border border-border/60 hover:bg-secondary/40 text-sm font-semibold flex items-center justify-center gap-2 text-foreground transition-colors"
            >
              <span>{showAllCategories ? 'Hide additional emergency situations' : 'More emergency situations (11 additional flows)'}</span>
              {showAllCategories ? <ChevronUp className="w-4 h-4 text-primary" /> : <ChevronDown className="w-4 h-4 text-primary" />}
            </button>

            {showAllCategories && (
              <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-4">
                {secondaryEmergencies.map((cat) => {
                  const CatIcon = cat.icon;
                  return (
                    <Link
                      key={cat.id}
                      to={cat.path}
                      className="p-3.5 rounded-xl bg-card/60 hover:bg-card border border-border/50 hover:border-primary/40 transition-all flex items-start gap-3 group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-secondary/80 flex items-center justify-center shrink-0 text-primary group-hover:bg-primary/15 transition-colors">
                        <CatIcon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">
                          {cat.title}
                        </div>
                        <div className="text-[11px] text-muted-foreground truncate">{cat.desc}</div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* =========================================================================
          NEARBY HELP PREVIEW (Real OpenStreetMap / Overpass Radar)
          ========================================================================= */}
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="rounded-3xl bg-card border border-border/70 p-6 md:p-8 shadow-md">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-primary font-bold mb-1">
                  <MapPin className="w-3.5 h-3.5" /> Nearby Emergency Help
                </div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">Find help near you</h2>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-xl">
                  Real-time facility locator powered by OpenStreetMap. Finds nearest emergency departments,
                  24/7 pharmacies, fire stations, and automated defibrillators (AEDs).
                </p>
              </div>

              <Link to="/map">
                <Button className="h-11 px-5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm">
                  <MapPin className="w-4 h-4 mr-2" />
                  Open Live Emergency Map
                </Button>
              </Link>
            </div>

            {/* 3 Facility Cards */}
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-secondary/30 border border-border/50">
                <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center mb-3">
                  <Building2 className="w-5 h-5" />
                </div>
                <div className="text-sm font-bold text-foreground">Hospitals &amp; Trauma Centers</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Emergency rooms with active ambulance drop-off routes and emergency surgery bays.
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-secondary/30 border border-border/50">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center mb-3">
                  <Pill className="w-5 h-5" />
                </div>
                <div className="text-sm font-bold text-foreground">24/7 Pharmacies</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Instant stock locations for EpiPens, glucose paste, antiseptic supplies, and burn dressings.
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-secondary/30 border border-border/50">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center mb-3">
                  <Radio className="w-5 h-5" />
                </div>
                <div className="text-sm font-bold text-foreground">Public AED Defibrillators</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Crowdsourced life-saving automated external defibrillators located in public transits and malls.
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-border/30 flex items-center justify-between text-xs text-muted-foreground">
              <span>GPS privacy: Coordinates are calculated directly on your device.</span>
              <Link to="/map" className="text-primary hover:underline font-medium">
                Search with manual address &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          MODE B: PREPARE & PRACTICE (PEACETIME READINESS)
          ========================================================================= */}
      <section id="prepare" className="py-14 bg-secondary/15 border-t border-border/40 scroll-mt-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-left mb-10">
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-primary font-bold mb-1">
              <Package className="w-3.5 h-3.5" /> Mode B: Peacetime Training
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
              Prepared today. More confident tomorrow.
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground mt-1 max-w-2xl">
              Equip your home, vehicle, school, or workplace with complete first-aid readiness and
              interactive drills before an emergency occurs.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Build First Aid Kit */}
            <div
              onClick={() => navigate('/first-aid-kit')}
              className="cursor-pointer group p-5 rounded-2xl bg-card border border-border/70 hover:border-primary/50 shadow-sm transition-all hover:-translate-y-1 flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-teal-500/15 text-primary flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <Package className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                  Build Your First Aid Kit
                </h3>
                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                  Interactive checklist for home, car, or hiking. Audit bandage counts, antiseptics, and missing essentials.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-border/40 flex items-center justify-between text-xs font-semibold text-primary">
                <span>Kit Assessment Flow</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* 2. Learn to Use Your Kit */}
            <div
              onClick={() => navigate('/first-aid-kit')}
              className="cursor-pointer group p-5 rounded-2xl bg-card border border-border/70 hover:border-primary/50 shadow-sm transition-all hover:-translate-y-1 flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                  Learn to Use Your Kit
                </h3>
                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                  Bite-sized micro-lessons on applying tourniquets, burn gels, SAM splints, and sterile gauze correctly.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-border/40 flex items-center justify-between text-xs font-semibold text-primary">
                <span>Interactive Training</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* 3. Practice CPR Rhythm */}
            <div
              onClick={() => navigate('/cpr')}
              className="cursor-pointer group p-5 rounded-2xl bg-card border border-border/70 hover:border-primary/50 shadow-sm transition-all hover:-translate-y-1 flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-rose-500/15 text-rose-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <Heart className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                  Practice CPR Rhythm
                </h3>
                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                  Sample-accurate 110 BPM metronome with 30:2 compression/breath cadence and 2-minute rescuer swap alerts.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-border/40 flex items-center justify-between text-xs font-semibold text-primary">
                <span>Launch CPR Trainer</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* 4. Emergency Intelligence Center */}
            <div
              onClick={() => navigate('/intelligence')}
              className="cursor-pointer group p-5 rounded-2xl bg-card border border-border/70 hover:border-primary/50 shadow-sm transition-all hover:-translate-y-1 flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                  Emergency Intelligence
                </h3>
                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                  Jac-inspired graph walker architecture. Watch 6 specialized multi-agent nodes reason over emergency inputs.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-border/40 flex items-center justify-between text-xs font-semibold text-primary">
                <span>Explore Graph AI</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          HOW FIRST30.AI WORKS: 3-STEP SEQUENTIAL TIMELINE
          ========================================================================= */}
      <section className="py-14 border-t border-border/40">
        <div className="container mx-auto px-4 max-w-5xl text-center">
          <div className="text-xs uppercase tracking-widest text-primary font-bold mb-1">
            Care Protocol
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">How First30.ai Works</h2>
          <p className="text-muted-foreground text-sm max-w-xl mx-auto mt-1 mb-10">
            A calm, panic-proof pathway from the first seconds of an incident to professional handoff.
          </p>

          <div className="grid md:grid-cols-3 gap-6 relative">
            {/* Step 1 */}
            <div className="p-6 rounded-2xl bg-card border border-border/70 text-left relative">
              <div className="w-8 h-8 rounded-full bg-primary/15 text-primary text-sm font-bold flex items-center justify-center mb-4">
                1
              </div>
              <h3 className="text-base font-bold text-foreground">Select or Speak Situation</h3>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                Choose an emergency from the 15 categories or tap the microphone to describe what happened.
                Quick inline questions assess age and consciousness.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-2xl bg-card border border-border/70 text-left relative">
              <div className="w-8 h-8 rounded-full bg-primary/15 text-primary text-sm font-bold flex items-center justify-center mb-4">
                2
              </div>
              <h3 className="text-base font-bold text-foreground">Follow One Step at a Time</h3>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                Clear, high-contrast instructions with voice narration in 5 languages. Focus completely
                on the patient without walls of confusing text.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-2xl bg-card border border-border/70 text-left relative">
              <div className="w-8 h-8 rounded-full bg-primary/15 text-primary text-sm font-bold flex items-center justify-center mb-4">
                3
              </div>
              <h3 className="text-base font-bold text-foreground">Handoff to Paramedics</h3>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                When EMS arrives, hand over an instant structured summary with exact duration, steps delivered,
                and vital observations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          TRUST & SAFETY SECTION
          ========================================================================= */}
      <section className="py-12 bg-secondary/20 border-t border-border/40">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <div className="p-6 md:p-8 rounded-3xl bg-card border border-border/70 text-left space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Medical Disclaimer &amp; Safety Assurance</h3>
                <p className="text-xs text-muted-foreground">Standardized first-aid assistance guidelines</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 text-xs text-muted-foreground pt-2">
              <p className="leading-relaxed">
                <strong className="text-foreground">Not a substitute for emergency services:</strong> First30.ai is
                designed for bystander first-aid guidance during the window before professional help arrives.
                Always call <span className="text-primary font-bold">{emergencyNumber}</span> immediately for life-threatening situations.
              </p>
              <p className="leading-relaxed">
                <strong className="text-foreground">First-aid guidance only:</strong> Information provided is based
                on recognized clinical first-aid resuscitation guidelines (AHA/ERC standards) and does not constitute
                a clinical medical diagnosis.
              </p>
              <p className="leading-relaxed">
                <strong className="text-foreground">Zero data retention:</strong> First30.ai does not require an account,
                login, or credit card for emergency guidance. All audio processing and GPS location are held in ephemeral memory.
              </p>
              <p className="leading-relaxed">
                <strong className="text-foreground">Follow professional responders:</strong> When paramedics or emergency
                dispatchers give instructions, immediately defer to their professional direct commands.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Voice Assistant Modal */}
      <VoiceAssistantModal
        open={isVoiceModalOpen}
        onOpenChange={setIsVoiceModalOpen}
      />
    </Layout>
  );
}
