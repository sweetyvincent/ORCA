"use client";

import React, { useState, useEffect } from "react";
import { Radio, ArrowRight, Sparkles, Compass } from "lucide-react";

interface HeroSequenceProps {
  onDismiss: () => void;
}

export const HeroSequence: React.FC<HeroSequenceProps> = ({ onDismiss }) => {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setStage(1), 400);
    const t2 = setTimeout(() => setStage(2), 1200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-radial-dark p-6 font-mono select-none animate-in fade-in duration-500">
      {/* Background Floating Telemetry Badges */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30 text-xs font-mono">
        <div className="absolute top-1/4 left-1/5 animate-pulse text-bioglow-cyan border border-bioglow-cyan/30 px-2 py-1 rounded">
          SST · NOAA OISST v2.1 (0.25°)
        </div>
        <div className="absolute bottom-1/3 right-1/4 animate-pulse text-bioglow-aqua border border-bioglow-aqua/30 px-2 py-1 rounded delay-300">
          CHL-A · VIIRS DINEOF (2 km)
        </div>
        <div className="absolute top-1/3 right-1/5 animate-pulse text-slate-400 border border-slate-700 px-2 py-1 rounded delay-700">
          LANGGRAPH STATE MACHINE
        </div>
        <div className="absolute bottom-1/4 left-1/4 animate-pulse text-amber-400 border border-amber-500/30 px-2 py-1 rounded delay-500">
          HAB RISK COMPOSITE SIGNAL
        </div>
      </div>

      {/* Hero Content */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-2xl">
        <div className="relative mb-4 flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-bioglow-cyan/25 to-bioglow-blue/20 border border-bioglow-cyan/60 shadow-cyan-glow">
          <Radio className="w-8 h-8 text-bioglow-cyan animate-pulse" />
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold tracking-widest text-white mb-2 font-mono">
          ORCA
        </h1>
        <p className="text-xs md:text-sm uppercase tracking-widest text-bioglow-cyan font-semibold mb-4">
          Ocean Reasoning & Coastal Analytics
        </p>

        <p className="text-sm md:text-base text-slate-300 font-sans tracking-wide max-w-lg mb-8 leading-relaxed">
          “Ask the ocean. Let specialized agents find the signal.”
        </p>

        <div className="flex items-center gap-4">
          <button
            onClick={onDismiss}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-bioglow-cyan to-bioglow-blue text-ocean-950 font-bold text-sm hover:opacity-90 transition-all shadow-cyan-glow cursor-pointer"
          >
            <span>ENTER COMMAND CENTER</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={onDismiss}
          className="mt-6 text-xs text-slate-500 hover:text-slate-300 transition-all underline underline-offset-4 cursor-pointer"
        >
          Skip Intro (Direct to Live Telemetry)
        </button>
      </div>
    </div>
  );
};
