import { useState, useRef, MouseEvent } from 'react';
import {
  Heart,
  Activity,
  ShieldCheck,
  Zap,
  MapPin,
  PhoneCall,
  Mic,
  Sparkles,
} from 'lucide-react';

export const HeroIllustration = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setRotate({
      x: -(y / rect.height) * 8,
      y: (x / rect.width) * 8,
    });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full max-w-[500px] h-[480px] mx-auto flex items-center justify-center select-none overflow-visible"
      style={{ perspective: 1000 }}
    >
      {/* Background Multi-Layer Ambient Glow */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-teal-500/25 via-primary/15 to-emerald-500/20 blur-3xl pointer-events-none" />
      <div className="absolute w-[88%] h-[88%] rounded-full border border-teal-500/20 animate-[spin_80s_linear_infinite] pointer-events-none" />
      <div className="absolute w-[74%] h-[74%] rounded-full border border-dashed border-teal-500/30 animate-[spin_50s_linear_infinite_reverse] pointer-events-none" />
      <div className="absolute w-[58%] h-[58%] rounded-full border border-primary/25 pointer-events-none" />

      {/* SVG Arc Guide Lines for '(' and ')' visual emphasis */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-10"
        viewBox="0 0 500 480"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Left arc guide '(' connecting the 3 left icons */}
        <path
          d="M 55 85 Q 12 240 55 395"
          stroke="hsl(175 70% 42% / 0.35)"
          strokeWidth="2"
          strokeDasharray="4 6"
        />
        {/* Right arc guide ')' connecting the 3 right icons */}
        <path
          d="M 445 85 Q 488 240 445 395"
          stroke="hsl(175 70% 42% / 0.35)"
          strokeWidth="2"
          strokeDasharray="4 6"
        />
      </svg>

      {/* 3D Tilted Scene Canvas */}
      <div
        className="relative w-full h-full p-4 transition-transform duration-200 ease-out flex items-center justify-center"
        style={{
          transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
          transformStyle: 'preserve-3d',
        }}
      >
        {/* =========================================================================
            6 FLOATING ICONS FORMING '(' ON THE LEFT AND ')' ON THE RIGHT
            ========================================================================= */}

        {/* --- LEFT ARC '(' --- */}
        {/* 1. Top-Left: Heart (Cardiac & CPR) */}
        <div
          className="absolute z-30 animate-float-a"
          style={{
            left: '6%',
            top: '14%',
            transform: 'translateZ(55px)',
          }}
        >
          <div className="group relative flex items-center justify-center w-12 h-12 md:w-13 md:h-13 rounded-2xl bg-rose-500/15 backdrop-blur-xl border border-rose-500/40 text-rose-400 shadow-lg shadow-rose-500/25 hover:scale-110 transition-transform cursor-pointer">
            <Heart className="w-6 h-6 animate-pulse" />
            <span className="absolute left-full ml-2 px-2 py-1 rounded-md bg-card/90 border border-border/80 text-[10px] font-semibold text-foreground whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md">
              Cardiac & CPR
            </span>
          </div>
        </div>

        {/* 2. Mid-Left: Activity (Pulse & Vital Signs) - bulges furthest to the left for '(' shape */}
        <div
          className="absolute z-30 animate-float-b"
          style={{
            left: '-2%',
            top: '47%',
            transform: 'translateZ(65px)',
          }}
        >
          <div className="group relative flex items-center justify-center w-13 h-13 md:w-14 md:h-14 rounded-2xl bg-emerald-500/15 backdrop-blur-xl border border-emerald-500/40 text-emerald-400 shadow-xl shadow-emerald-500/25 hover:scale-110 transition-transform cursor-pointer">
            <Activity className="w-6 h-6" />
            <span className="absolute left-full ml-2 px-2 py-1 rounded-md bg-card/90 border border-border/80 text-[10px] font-semibold text-foreground whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md">
              Vital Signs & Vitals
            </span>
          </div>
        </div>

        {/* 3. Bottom-Left: ShieldCheck (Clinical Protocols) */}
        <div
          className="absolute z-30 animate-float-c"
          style={{
            left: '6%',
            top: '80%',
            transform: 'translateZ(55px)',
          }}
        >
          <div className="group relative flex items-center justify-center w-12 h-12 md:w-13 md:h-13 rounded-2xl bg-teal-500/15 backdrop-blur-xl border border-teal-500/40 text-teal-300 shadow-lg shadow-teal-500/25 hover:scale-110 transition-transform cursor-pointer">
            <ShieldCheck className="w-6 h-6" />
            <span className="absolute left-full ml-2 px-2 py-1 rounded-md bg-card/90 border border-border/80 text-[10px] font-semibold text-foreground whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md">
              Verified Protocols
            </span>
          </div>
        </div>

        {/* --- RIGHT ARC ')' --- */}
        {/* 4. Top-Right: Zap (AED Defibrillation & Shock) */}
        <div
          className="absolute z-30 animate-float-b"
          style={{
            right: '6%',
            top: '14%',
            transform: 'translateZ(55px)',
          }}
        >
          <div className="group relative flex items-center justify-center w-12 h-12 md:w-13 md:h-13 rounded-2xl bg-amber-500/15 backdrop-blur-xl border border-amber-500/40 text-amber-400 shadow-lg shadow-amber-500/25 hover:scale-110 transition-transform cursor-pointer">
            <Zap className="w-6 h-6" />
            <span className="absolute right-full mr-2 px-2 py-1 rounded-md bg-card/90 border border-border/80 text-[10px] font-semibold text-foreground whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md">
              AED & Shock
            </span>
          </div>
        </div>

        {/* 5. Mid-Right: MapPin (Hospital & EMS Radar) - bulges furthest to the right for ')' shape */}
        <div
          className="absolute z-30 animate-float-a"
          style={{
            right: '-2%',
            top: '47%',
            transform: 'translateZ(65px)',
          }}
        >
          <div className="group relative flex items-center justify-center w-13 h-13 md:w-14 md:h-14 rounded-2xl bg-blue-500/15 backdrop-blur-xl border border-blue-500/40 text-blue-400 shadow-xl shadow-blue-500/25 hover:scale-110 transition-transform cursor-pointer">
            <MapPin className="w-6 h-6" />
            <span className="absolute right-full mr-2 px-2 py-1 rounded-md bg-card/90 border border-border/80 text-[10px] font-semibold text-foreground whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md">
              Nearby EMS & Hospitals
            </span>
          </div>
        </div>

        {/* 6. Bottom-Right: PhoneCall (Instant 112/911 Emergency Dial) */}
        <div
          className="absolute z-30 animate-float-c"
          style={{
            right: '6%',
            top: '80%',
            transform: 'translateZ(55px)',
          }}
        >
          <div className="group relative flex items-center justify-center w-12 h-12 md:w-13 md:h-13 rounded-2xl bg-purple-500/15 backdrop-blur-xl border border-purple-500/40 text-purple-400 shadow-lg shadow-purple-500/25 hover:scale-110 transition-transform cursor-pointer">
            <PhoneCall className="w-6 h-6" />
            <span className="absolute right-full mr-2 px-2 py-1 rounded-md bg-card/90 border border-border/80 text-[10px] font-semibold text-foreground whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md">
              Direct Emergency Dial
            </span>
          </div>
        </div>

        {/* =========================================================================
            TOP & BOTTOM SATELLITE STATUS BADGES
            ========================================================================= */}
        {/* Top Satellite Badge: Voice Guidance */}
        <div
          className="absolute -top-1 md:top-2 z-20 px-3.5 py-1.5 rounded-full bg-card/90 backdrop-blur-md border border-teal-500/30 shadow-lg flex items-center gap-2 animate-float-a"
          style={{ transform: 'translateZ(50px)' }}
        >
          <div className="w-5 h-5 rounded-full bg-teal-500/20 text-primary flex items-center justify-center">
            <Mic className="w-3 h-3" />
          </div>
          <span className="text-xs font-semibold text-foreground">
            Voice Guided · 5 Languages
          </span>
        </div>

        {/* Bottom Satellite Badge: Zero Login & Offline */}
        <div
          className="absolute -bottom-1 md:bottom-2 z-20 px-3.5 py-1.5 rounded-full bg-card/90 backdrop-blur-md border border-emerald-500/30 shadow-lg flex items-center gap-2 animate-float-b"
          style={{ transform: 'translateZ(50px)' }}
        >
          <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Sparkles className="w-3 h-3" />
          </div>
          <span className="text-xs font-semibold text-foreground">
            Zero Login · 100% Offline
          </span>
        </div>

        {/* =========================================================================
            CENTRAL GLASS CORE (FIRST30 CLINICAL ENGINE)
            ========================================================================= */}
        <div
          className="relative z-10 w-52 h-52 md:w-60 md:h-60 rounded-3xl bg-gradient-to-b from-card/95 via-card/85 to-card/75 backdrop-blur-2xl border-2 border-teal-500/35 shadow-2xl shadow-teal-500/20 flex flex-col items-center justify-center p-5 text-center"
          style={{ transform: 'translateZ(40px)' }}
        >
          {/* Active Status Chip */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-bold tracking-wider text-emerald-400 uppercase mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping mr-0.5" />
            Live Guidance Active
          </div>

          {/* Medical Cross Symbol Emblem */}
          <div className="relative w-18 h-18 md:w-20 md:h-20 rounded-2xl bg-white p-2.5 flex items-center justify-center shadow-xl shadow-teal-500/30 mb-2 overflow-hidden border border-teal-500/30">
            <img
              src="/assets/logo.png"
              alt="First30 Emblem"
              className="w-full h-full object-contain"
            />
          </div>

          <div className="text-sm font-bold tracking-tight text-foreground">First30 Engine</div>
          <div className="text-[11px] text-muted-foreground">Critical Pre-EMS Protocols</div>

          {/* Calming Voice & Cadence Waveform Simulator */}
          <div className="flex items-center gap-1 mt-2.5 h-4">
            {[35, 75, 50, 95, 65, 90, 45, 85, 60, 75, 45].map((h, i) => (
              <span
                key={i}
                className="w-1 bg-gradient-to-t from-teal-500 to-emerald-400 rounded-full"
                style={{
                  height: `${h}%`,
                  animation: `pulse 1.6s ease-in-out infinite ${i * 0.12}s`,
                }}
              />
            ))}
          </div>

          {/* Sub-label */}
          <div className="text-[10px] font-medium text-teal-400/90 mt-2">
            110 BPM Metronome Ready
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroIllustration;
