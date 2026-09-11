"use client";

import React from "react";
import { RouterDecision, SSTResult, ChlorophyllResult, AdvisoryResult, SynthesisResult } from "../lib/types";
import { GitFork, Thermometer, Waves, ShieldAlert, BrainCircuit, CheckCircle2, ArrowDown, Cpu } from "lucide-react";

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
    <div className="w-full hud-panel rounded-xl p-4 font-mono flex flex-col gap-3">
      {/* Topology Header */}
      <div className="flex items-center justify-between pb-2 border-b border-ocean-800/80">
        <div className="flex items-center gap-2">
          <GitFork className="w-4 h-4 text-bioglow-cyan" />
          <h3 className="text-xs uppercase tracking-widest text-white font-bold">
            LangGraph Multi-Agent Topology & Handoff
          </h3>
        </div>
        <span className="text-[10px] text-slate-400">
          {selectedAgents.length > 0 ? `${selectedAgents.length} Specialists Summoned` : "Standby State"}
        </span>
      </div>

      {/* Router Rationale Callout */}
      {routerDecision && (
        <div className="p-2.5 rounded-lg bg-[#020b18] border border-bioglow-cyan/30 text-[11px] flex items-start gap-2">
          <span className="w-2 h-2 rounded-full bg-bioglow-cyan mt-1 flex-shrink-0 animate-ping"></span>
          <div>
            <span className="text-bioglow-cyan font-bold uppercase">Router Rationale: </span>
            <span className="text-slate-300 font-sans">{routerDecision.reasoning}</span>
          </div>
        </div>
      )}

      {/* Visual Agent Flow Nodes */}
      <div className="flex flex-col items-center gap-3 pt-1">
        {/* Tier 1: Router Node */}
        <div
          className={`w-full max-w-sm flex items-center justify-between px-3.5 py-2 rounded-lg border transition-all text-xs ${
            routerDecision
              ? "bg-bioglow-cyan/20 border-bioglow-cyan text-white shadow-[0_0_12px_rgba(0,240,255,0.25)]"
              : isStreaming
              ? "bg-bioglow-cyan/10 border-bioglow-cyan text-bioglow-cyan animate-pulse"
              : "bg-[#040f1f] border-ocean-800 text-slate-400"
          }`}
        >
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-bioglow-cyan" />
            <div>
              <span className="font-bold block text-[11px]">AI INTENT ROUTER</span>
              <span className="text-[9px] text-slate-400">Parameter Decomposition & Dispatch</span>
            </div>
          </div>
          {routerDecision && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
        </div>

        {/* Tier 2: Specialists Cluster */}
        <div className="w-full grid grid-cols-3 gap-2.5">
          {/* SST Specialist */}
          <div
            className={`p-2.5 rounded-lg border flex flex-col justify-between transition-all text-center ${
              sstResult
                ? "bg-bioglow-cyan/15 border-bioglow-cyan/70 text-white shadow-[0_0_12px_rgba(0,240,255,0.2)]"
                : sstActive
                ? "bg-bioglow-cyan/10 border-bioglow-cyan animate-pulse text-bioglow-cyan"
                : hasSST
                ? "bg-[#040f1f] border-ocean-800 text-slate-300"
                : "bg-[#020712] border-ocean-900/60 text-slate-600 opacity-40"
            }`}
          >
            <div>
              <Thermometer className={`w-4 h-4 mx-auto mb-1 ${sstResult || sstActive ? "text-bioglow-cyan" : "text-slate-500"}`} />
              <span className="font-bold text-[10px] block">SST SPECIALIST</span>
              <span className="text-[8px] text-slate-400">NOAA OISST (xarray)</span>
            </div>
            {sstResult?.latest && (
              <span className="mt-1 text-[11px] font-extrabold text-emerald-400">
                {sstResult.latest.value_c}°C
              </span>
            )}
          </div>

          {/* Chlorophyll Specialist */}
          <div
            className={`p-2.5 rounded-lg border flex flex-col justify-between transition-all text-center ${
              chlorophyllResult
                ? "bg-bioglow-aqua/15 border-bioglow-aqua/70 text-white shadow-[0_0_12px_rgba(0,229,163,0.2)]"
                : chlActive
                ? "bg-bioglow-aqua/10 border-bioglow-aqua animate-pulse text-bioglow-aqua"
                : hasChl
                ? "bg-[#040f1f] border-ocean-800 text-slate-300"
                : "bg-[#020712] border-ocean-900/60 text-slate-600 opacity-40"
            }`}
          >
            <div>
              <Waves className={`w-4 h-4 mx-auto mb-1 ${chlorophyllResult || chlActive ? "text-bioglow-aqua" : "text-slate-500"}`} />
              <span className="font-bold text-[10px] block">CHL-A SPECIALIST</span>
              <span className="text-[8px] text-slate-400">VIIRS DINEOF</span>
            </div>
            {chlorophyllResult?.latest && (
              <span className="mt-1 text-[11px] font-extrabold text-bioglow-aqua">
                {chlorophyllResult.latest.chlorophyll_mg_m3} mg/m³
              </span>
            )}
          </div>

          {/* Advisory Specialist */}
          <div
            className={`p-2.5 rounded-lg border flex flex-col justify-between transition-all text-center ${
              advisoryResult
                ? "bg-amber-500/15 border-amber-500/70 text-white shadow-[0_0_12px_rgba(245,158,11,0.2)]"
                : advActive
                ? "bg-amber-500/10 border-amber-500 animate-pulse text-amber-400"
                : hasAdv
                ? "bg-[#040f1f] border-ocean-800 text-slate-300"
                : "bg-[#020712] border-ocean-900/60 text-slate-600 opacity-40"
            }`}
          >
            <div>
              <ShieldAlert className={`w-4 h-4 mx-auto mb-1 ${advisoryResult || advActive ? "text-amber-400" : "text-slate-500"}`} />
              <span className="font-bold text-[10px] block">ADVISORY AGENT</span>
              <span className="text-[8px] text-slate-400">CDPH / INCOIS</span>
            </div>
            {advisoryResult && (
              <span className="mt-1 text-[11px] font-extrabold text-amber-400">
                {advisoryResult.active_advisories?.length || 0} Notice(s)
              </span>
            )}
          </div>
        </div>

        {/* Tier 3: Deterministic Ecological Gate & Synthesizer */}
        <div
          className={`w-full max-w-sm flex items-center justify-between px-3.5 py-2 rounded-lg border transition-all text-xs ${
            synthesisResult
              ? "bg-gradient-to-r from-bioglow-cyan/20 to-bioglow-aqua/20 border-bioglow-cyan text-white shadow-[0_0_12px_rgba(0,240,255,0.3)]"
              : synthActive
              ? "bg-bioglow-cyan/10 border-bioglow-cyan animate-pulse text-bioglow-cyan"
              : "bg-[#040f1f] border-ocean-800 text-slate-400"
          }`}
        >
          <div className="flex items-center gap-2">
            <BrainCircuit className="w-4 h-4 text-bioglow-cyan" />
            <div>
              <span className="font-bold block text-[11px]">DETERMINISTIC GATE &amp; SYNTHESIS</span>
              <span className="text-[9px] text-slate-400">Pre-LLM Matrix + Evidence-Grounding</span>
            </div>
          </div>
          {synthesisResult && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
        </div>
      </div>
    </div>
  );
};
