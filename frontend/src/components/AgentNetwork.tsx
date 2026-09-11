import React from "react";
import { RouterDecision, SSTResult, ChlorophyllResult, AdvisoryResult, SynthesisResult } from "../lib/types";
import { GitFork, Thermometer, Waves, ShieldAlert, BrainCircuit, Check } from "lucide-react";

interface AgentNetworkProps {
  isStreaming: boolean;
  routerDecision: RouterDecision | null;
  sstResult: SSTResult | null;
  chlorophyllResult: ChlorophyllResult | null;
  advisoryResult: AdvisoryResult | null;
  synthesisResult: SynthesisResult | null;
}

export const AgentNetwork: React.FC<AgentNetworkProps> = ({
  isStreaming,
  routerDecision,
  sstResult,
  chlorophyllResult,
  advisoryResult,
  synthesisResult,
}) => {
  const selectedAgents = routerDecision?.agents || [];
  const hasSST = selectedAgents.includes("sst");
  const hasChl = selectedAgents.includes("chlorophyll");
  const hasAdv = selectedAgents.includes("advisory");

  const sstActive = isStreaming && hasSST && !sstResult;
  const chlActive = isStreaming && hasChl && !chlorophyllResult;
  const advActive = isStreaming && hasAdv && !advisoryResult;
  const synthActive = isStreaming && (!!sstResult || !!chlorophyllResult) && !synthesisResult;

  return (
    <div className="w-full glass-panel rounded-xl p-4 flex flex-col border border-ocean-800/80">
      <div className="flex items-center justify-between pb-2 border-b border-ocean-800/60 mb-4">
        <div className="flex items-center gap-2">
          <GitFork className="w-4 h-4 text-bioglow-cyan" />
          <h3 className="text-xs font-mono uppercase tracking-widest text-slate-200 font-bold">
            Live Multi-Agent Network Topology
          </h3>
        </div>
        <span className="text-[10px] font-mono text-slate-400">
          {selectedAgents.length > 0 ? `${selectedAgents.length} Agents Dispatched` : "Idle State"}
        </span>
      </div>

      <div className="relative flex flex-col items-center justify-between py-2 gap-6 font-mono text-xs">
        {/* Router Node */}
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
            routerDecision
              ? "bg-bioglow-cyan/20 border-bioglow-cyan text-white shadow-cyan-glow"
              : isStreaming
              ? "bg-bioglow-cyan/10 border-bioglow-cyan animate-pulse text-bioglow-cyan"
              : "bg-ocean-900 border-ocean-700 text-slate-400"
          }`}
        >
          <GitFork className="w-4 h-4 text-bioglow-cyan" />
          <span className="font-semibold">AI ROUTER NODE</span>
          {routerDecision && <Check className="w-3.5 h-3.5 text-emerald-400" />}
        </div>

        {/* Connecting Animated Line from Router */}
        <div className="w-0.5 h-4 bg-gradient-to-b from-bioglow-cyan to-transparent"></div>

        {/* Specialist Tier (SST, Chlorophyll, Advisory) */}
        <div className="grid grid-cols-3 gap-3 w-full">
          {/* SST Specialist */}
          <div
            className={`flex flex-col items-center text-center p-3 rounded-xl border transition-all ${
              sstResult
                ? "bg-bioglow-cyan/15 border-bioglow-cyan/70 text-slate-100 shadow-cyan-glow"
                : sstActive
                ? "bg-bioglow-cyan/10 border-bioglow-cyan animate-pulse text-bioglow-cyan"
                : hasSST
                ? "bg-ocean-900 border-ocean-700 text-slate-300"
                : "bg-ocean-950/40 border-ocean-900/60 text-slate-600 opacity-40"
            }`}
          >
            <Thermometer className={`w-5 h-5 mb-1 ${sstResult || sstActive ? "text-bioglow-cyan" : "text-slate-500"}`} />
            <span className="font-bold text-[11px]">SST AGENT</span>
            <span className="text-[9px] text-slate-400 mt-0.5">NOAA OISST v2.1</span>
            {sstResult?.latest && (
              <span className="mt-1 text-emerald-400 font-bold text-[10px]">
                {sstResult.latest.value_c}°C
              </span>
            )}
          </div>

          {/* Chlorophyll Specialist */}
          <div
            className={`flex flex-col items-center text-center p-3 rounded-xl border transition-all ${
              chlorophyllResult
                ? "bg-bioglow-aqua/15 border-bioglow-aqua/70 text-slate-100 shadow-aqua-glow"
                : chlActive
                ? "bg-bioglow-aqua/10 border-bioglow-aqua animate-pulse text-bioglow-aqua"
                : hasChl
                ? "bg-ocean-900 border-ocean-700 text-slate-300"
                : "bg-ocean-950/40 border-ocean-900/60 text-slate-600 opacity-40"
            }`}
          >
            <Waves className={`w-5 h-5 mb-1 ${chlorophyllResult || chlActive ? "text-bioglow-aqua" : "text-slate-500"}`} />
            <span className="font-bold text-[11px]">CHLOROPHYLL</span>
            <span className="text-[9px] text-slate-400 mt-0.5">VIIRS DINEOF</span>
            {chlorophyllResult?.latest && (
              <span className="mt-1 text-emerald-400 font-bold text-[10px]">
                {chlorophyllResult.latest.chlorophyll_mg_m3} mg/m³
              </span>
            )}
          </div>

          {/* Advisory Specialist */}
          <div
            className={`flex flex-col items-center text-center p-3 rounded-xl border transition-all ${
              advisoryResult
                ? "bg-amber-500/15 border-amber-500/60 text-slate-100"
                : advActive
                ? "bg-amber-500/10 border-amber-500 animate-pulse text-amber-400"
                : hasAdv
                ? "bg-ocean-900 border-ocean-700 text-slate-300"
                : "bg-ocean-950/40 border-ocean-900/60 text-slate-600 opacity-40"
            }`}
          >
            <ShieldAlert className={`w-5 h-5 mb-1 ${advisoryResult || advActive ? "text-amber-400" : "text-slate-500"}`} />
            <span className="font-bold text-[11px]">ADVISORY</span>
            <span className="text-[9px] text-slate-400 mt-0.5">Coastal Health</span>
            {advisoryResult && (
              <span className="mt-1 text-amber-400 font-bold text-[10px]">
                {advisoryResult.active_advisories.length} Notice(s)
              </span>
            )}
          </div>
        </div>

        {/* Connecting Lines to Synthesizer */}
        <div className="w-0.5 h-4 bg-gradient-to-t from-bioglow-cyan to-transparent"></div>

        {/* Synthesizer Node */}
        <div
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg border transition-all ${
            synthesisResult
              ? "bg-gradient-to-r from-bioglow-cyan/20 to-bioglow-aqua/20 border-bioglow-cyan text-white shadow-cyan-glow"
              : synthActive
              ? "bg-bioglow-cyan/10 border-bioglow-cyan animate-pulse text-bioglow-cyan"
              : "bg-ocean-900 border-ocean-700 text-slate-400"
          }`}
        >
          <BrainCircuit className="w-4 h-4 text-bioglow-cyan" />
          <div className="flex flex-col text-left">
            <span className="font-bold tracking-wide">ORCA REASONING & SYNTHESIS</span>
            <span className="text-[9px] text-slate-400">Deterministic HAB Engine + Multi-Stream LLM</span>
          </div>
          {synthesisResult && <Check className="w-4 h-4 text-emerald-400 ml-2" />}
        </div>
      </div>
    </div>
  );
};
