"use client";

import React, { useState, useEffect } from "react";
import { Radio, Database, Shield, MonitorPlay, Sparkles, Activity, Clock, Layers } from "lucide-react";

interface TacticalHeaderProps {
  presentationMode: boolean;
  setPresentationMode: (val: boolean) => void;
  demoMode: boolean;
  setDemoMode: (val: boolean) => void;
  onOpenProvenance: () => void;
}

export const TacticalHeader: React.FC<TacticalHeaderProps> = ({
  presentationMode,
  setPresentationMode,
  demoMode,
  setDemoMode,
  onOpenProvenance,
}) => {
  const [utcTime, setUtcTime] = useState<string>("");

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setUtcTime(now.toUTCString().slice(17, 25) + " UTC");
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="w-full bg-[#030914]/90 backdrop-blur-xl border-b border-ocean-800/80 px-4 lg:px-6 py-3 flex flex-wrap items-center justify-between gap-3 z-30 sticky top-0 font-mono">
      {/* Brand & Mission Badge */}
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-bioglow-cyan/25 to-blue-900/40 border border-bioglow-cyan/50 shadow-[0_0_15px_rgba(0,240,255,0.3)]">
          <Radio className="w-5 h-5 text-bioglow-cyan animate-pulse" />
          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-bioglow-cyan opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-bioglow-cyan"></span>
          </span>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-widest text-white flex items-center gap-2">
              ORCA
              <span className="text-[10px] font-mono tracking-widest px-2 py-0.5 rounded bg-bioglow-cyan/15 text-bioglow-cyan border border-bioglow-cyan/30">
                VELOHACK 2K26 // ISRO
              </span>
            </h1>
          </div>
          <p className="text-[11px] text-slate-400 tracking-wide font-sans">
            Ocean Reasoning & Coastal Analytics · Multi-Agent Intelligence Core
          </p>
        </div>
      </div>

      {/* Satellite Constellations & Telemetry Links */}
      <div className="hidden xl:flex items-center gap-3 text-xs">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#051426] border border-ocean-800">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse"></span>
          <div className="flex flex-col">
            <span className="text-[9px] text-slate-400 uppercase">NOAA OISST v2.1</span>
            <span className="text-[11px] text-emerald-400 font-bold">4D GRIDDED · xarray</span>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#051426] border border-ocean-800">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse"></span>
          <div className="flex flex-col">
            <span className="text-[9px] text-slate-400 uppercase">VIIRS DINEOF</span>
            <span className="text-[11px] text-emerald-400 font-bold">OPTICAL SWATH · 2-4km</span>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#051426] border border-ocean-800">
          <span className="w-2 h-2 rounded-full bg-bioglow-cyan shadow-[0_0_8px_rgba(0,240,255,0.8)]"></span>
          <div className="flex flex-col">
            <span className="text-[9px] text-slate-400 uppercase">LANGGRAPH ROUTER</span>
            <span className="text-[11px] text-bioglow-cyan font-bold">CONDITIONAL DISPATCH</span>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#051426] border border-ocean-800 text-slate-300">
          <Clock className="w-3.5 h-3.5 text-bioglow-cyan" />
          <span className="text-[11px] font-bold text-slate-200">{utcTime || "UTC MISSION"}</span>
        </div>
      </div>

      {/* Control Actions */}
      <div className="flex items-center gap-2 text-xs">
        <button
          onClick={() => setDemoMode(!demoMode)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-mono transition-all ${
            demoMode
              ? "bg-bioglow-aqua/20 border-bioglow-aqua text-bioglow-aqua shadow-aqua-glow"
              : "bg-[#06162a] border-ocean-800 text-slate-300 hover:border-ocean-700"
          }`}
          title="Toggle Guided Demo Mode"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">DEMO</span>
          <span className={`text-[9px] px-1 rounded font-bold ${demoMode ? "bg-bioglow-aqua text-ocean-950" : "bg-ocean-900 text-slate-400"}`}>
            {demoMode ? "ON" : "OFF"}
          </span>
        </button>

        <button
          onClick={() => setPresentationMode(!presentationMode)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-mono transition-all ${
            presentationMode
              ? "bg-bioglow-cyan/20 border-bioglow-cyan text-bioglow-cyan shadow-cyan-glow"
              : "bg-[#06162a] border-ocean-800 text-slate-300 hover:border-ocean-700"
          }`}
          title="Toggle Presentation Mode for Judges"
        >
          <MonitorPlay className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">PRESENTATION</span>
        </button>

        <button
          onClick={onOpenProvenance}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#06162a] border border-ocean-800 text-slate-300 hover:border-bioglow-cyan/60 hover:text-bioglow-cyan transition-all"
          title="Open Data Provenance Architecture"
        >
          <Database className="w-3.5 h-3.5 text-bioglow-cyan" />
          <span className="hidden md:inline">PROVENANCE</span>
        </button>
      </div>
    </header>
  );
};
