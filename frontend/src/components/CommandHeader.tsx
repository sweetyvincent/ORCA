import React from "react";
import { Activity, Radio, Shield, Database, Sparkles, MonitorPlay } from "lucide-react";

interface CommandHeaderProps {
  presentationMode: boolean;
  setPresentationMode: (val: boolean) => void;
  demoMode: boolean;
  setDemoMode: (val: boolean) => void;
  onOpenProvenance: () => void;
}

export const CommandHeader: React.FC<CommandHeaderProps> = ({
  presentationMode,
  setPresentationMode,
  demoMode,
  setDemoMode,
  onOpenProvenance,
}) => {
  return (
    <header className="w-full bg-ocean-950/80 backdrop-blur-xl border-b border-ocean-800/60 px-4 lg:px-6 py-2.5 flex items-center justify-between z-30 sticky top-0">
      {/* Brand Identity */}
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-bioglow-cyan/20 to-bioglow-blue/10 border border-bioglow-cyan/40 shadow-cyan-glow">
          <Radio className="w-5 h-5 text-bioglow-cyan animate-pulse" />
          <span className="absolute -top-1 -right-1 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-bioglow-cyan opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-bioglow-cyan"></span>
          </span>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-wider text-white font-mono flex items-center gap-1.5">
              ORCA
              <span className="text-[10px] uppercase font-sans tracking-widest px-1.5 py-0.5 rounded bg-bioglow-cyan/15 text-bioglow-cyan border border-bioglow-cyan/30">
                v1.0 ISRO/VeloHack
              </span>
            </h1>
          </div>
          <p className="text-[11px] text-slate-400 font-sans tracking-wide">
            Ocean Reasoning & Coastal Analytics · Multi-Agent Marine Intelligence
          </p>
        </div>
      </div>

      {/* Real-time Telemetry Indicators */}
      <div className="hidden md:flex items-center gap-4 text-xs font-mono">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-ocean-900 border border-ocean-700/50">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse"></span>
          <span className="text-slate-300">NOAA OISST v2.1:</span>
          <span className="text-emerald-400 font-semibold">LIVE</span>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-ocean-900 border border-ocean-700/50">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse"></span>
          <span className="text-slate-300">VIIRS CHL-A:</span>
          <span className="text-emerald-400 font-semibold">LIVE</span>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-ocean-900 border border-ocean-700/50">
          <span className="w-2 h-2 rounded-full bg-bioglow-cyan shadow-[0_0_8px_rgba(0,240,255,0.8)]"></span>
          <span className="text-slate-300">AI ROUTER:</span>
          <span className="text-bioglow-cyan font-semibold">READY</span>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center gap-2 text-xs">
        <button
          onClick={() => setDemoMode(!demoMode)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border font-mono transition-all ${
            demoMode
              ? "bg-bioglow-aqua/20 border-bioglow-aqua text-bioglow-aqua shadow-aqua-glow"
              : "bg-ocean-900/60 border-ocean-700 text-slate-300 hover:border-ocean-600"
          }`}
          title="Toggle Guided Demo Mode"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>DEMO MODE</span>
          <span className={`text-[10px] px-1 rounded ${demoMode ? "bg-bioglow-aqua text-ocean-950 font-bold" : "bg-ocean-800 text-slate-400"}`}>
            {demoMode ? "ON" : "OFF"}
          </span>
        </button>

        <button
          onClick={() => setPresentationMode(!presentationMode)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border font-mono transition-all ${
            presentationMode
              ? "bg-bioglow-cyan/20 border-bioglow-cyan text-bioglow-cyan shadow-cyan-glow"
              : "bg-ocean-900/60 border-ocean-700 text-slate-300 hover:border-ocean-600"
          }`}
          title="Toggle High-Contrast Presentation Mode for Judges"
        >
          <MonitorPlay className="w-3.5 h-3.5" />
          <span>PRESENTATION</span>
        </button>

        <button
          onClick={onOpenProvenance}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-ocean-900/60 border border-ocean-700 text-slate-300 hover:border-bioglow-cyan/50 hover:text-bioglow-cyan transition-all font-mono"
          title="View Data Provenance & Architecture"
        >
          <Database className="w-3.5 h-3.5 text-bioglow-cyan" />
          <span className="hidden sm:inline">DATA PROVENANCE</span>
        </button>
      </div>
    </header>
  );
};
