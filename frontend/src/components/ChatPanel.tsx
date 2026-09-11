"use client";

import React, { useState } from "react";
import {
  ORCAPipelineState,
  LocationResolved,
  SSTResult,
  ChlorophyllResult,
  AdvisoryResult,
  HABAssessment,
  SynthesisResult,
} from "../lib/types";
import {
  Send,
  Loader2,
  Terminal,
  FileText,
  Search,
  AlertOctagon,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  ExternalLink,
} from "lucide-react";

interface ChatPanelProps {
  state: ORCAPipelineState;
  onSubmit: (question: string) => void;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ state, onSubmit }) => {
  const [inputVal, setInputVal] = useState("");
  const [activeTab, setActiveTab] = useState<"synthesis" | "observed" | "derived" | "reasoning">("synthesis");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim() || state.isStreaming) return;
    onSubmit(inputVal.trim());
  };

  const {
    isStreaming,
    location,
    routerDecision,
    sstResult,
    chlorophyllResult,
    advisoryResult,
    habAssessment,
    synthesisResult,
    error,
  } = state;

  return (
    <div className="w-full glass-panel rounded-xl p-4 border border-ocean-800/80 flex flex-col font-mono">
      {/* Input Box */}
      <form onSubmit={handleSubmit} className="w-full mb-4">
        <div className="relative flex items-center">
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            disabled={isStreaming}
            placeholder="Ask about ocean conditions, temperature, chlorophyll, blooms, or coastal risk..."
            className="w-full bg-ocean-950/90 border border-ocean-700/80 focus:border-bioglow-cyan rounded-xl py-3 pl-11 pr-24 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-bioglow-cyan shadow-inner disabled:opacity-60 transition-all"
          />
          <Terminal className="w-4 h-4 text-bioglow-cyan absolute left-4" />
          <button
            type="submit"
            disabled={!inputVal.trim() || isStreaming}
            className="absolute right-2 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-bioglow-cyan to-bioglow-blue text-ocean-950 font-bold text-xs flex items-center gap-1.5 hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-cyan-glow"
          >
            {isStreaming ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>REASONING...</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>EXECUTE</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Router Notification / Why Badge */}
      {routerDecision && (
        <div className="mb-4 p-2.5 rounded-lg bg-ocean-900/60 border border-bioglow-cyan/30 flex items-start gap-2.5 text-xs">
          <div className="mt-0.5 flex-shrink-0">
            <span className="w-2 h-2 rounded-full bg-bioglow-cyan inline-block animate-pulse"></span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-bioglow-cyan uppercase">AI Router Decision:</span>
              <span className="text-slate-200">
                {routerDecision.agents.map((a) => a.toUpperCase()).join(" + ")}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              <span className="text-slate-300 font-semibold">Justification: </span>
              {routerDecision.reasoning}
            </p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-rose-950/40 border border-rose-500/50 text-rose-300 text-xs flex items-center gap-2">
          <AlertOctagon className="w-4 h-4 flex-shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Honest AI Category Tabs */}
      {(synthesisResult || sstResult || chlorophyllResult) && (
        <div className="flex flex-col flex-1">
          <div className="flex items-center gap-1 border-b border-ocean-800 pb-2 mb-3 text-xs overflow-x-auto">
            <button
              onClick={() => setActiveTab("synthesis")}
              className={`px-3 py-1.5 rounded-md transition-all whitespace-nowrap ${
                activeTab === "synthesis"
                  ? "bg-bioglow-cyan/20 text-bioglow-cyan border border-bioglow-cyan/40 font-bold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              LLM SYNTHESIS
            </button>
            <button
              onClick={() => setActiveTab("observed")}
              className={`px-3 py-1.5 rounded-md transition-all whitespace-nowrap ${
                activeTab === "observed"
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              OBSERVED DATA
            </button>
            <button
              onClick={() => setActiveTab("derived")}
              className={`px-3 py-1.5 rounded-md transition-all whitespace-nowrap ${
                activeTab === "derived"
                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/40 font-bold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              DERIVED SIGNALS
            </button>
            <button
              onClick={() => setActiveTab("reasoning")}
              className={`px-3 py-1.5 rounded-md transition-all whitespace-nowrap ${
                activeTab === "reasoning"
                  ? "bg-sky-500/20 text-sky-300 border border-sky-500/40 font-bold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              HAB REASONING
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 text-xs">
            {/* 1. Synthesis Tab */}
            {activeTab === "synthesis" && synthesisResult && (
              <div className="space-y-3 animate-in fade-in duration-200">
                <div className="p-3 rounded-lg bg-ocean-950/60 border border-ocean-800">
                  <span className="text-bioglow-cyan font-bold block mb-1">
                    {synthesisResult.favourability_headline}
                  </span>
                  <p className="text-slate-200 leading-relaxed text-[13px] font-sans">
                    {synthesisResult.natural_language_summary}
                  </p>
                </div>

                {/* Agent Evidence Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {synthesisResult.sst_findings && (
                    <div className="p-2.5 rounded-lg bg-ocean-900/40 border border-ocean-800">
                      <span className="text-[10px] uppercase tracking-wider text-bioglow-cyan font-bold block mb-1">
                        SST Agent Finding
                      </span>
                      <p className="text-slate-300 text-[11px] leading-normal font-sans">
                        {synthesisResult.sst_findings}
                      </p>
                    </div>
                  )}

                  {synthesisResult.chlorophyll_findings && (
                    <div className="p-2.5 rounded-lg bg-ocean-900/40 border border-ocean-800">
                      <span className="text-[10px] uppercase tracking-wider text-bioglow-aqua font-bold block mb-1">
                        Chlorophyll Agent Finding
                      </span>
                      <p className="text-slate-300 text-[11px] leading-normal font-sans">
                        {synthesisResult.chlorophyll_findings}
                      </p>
                    </div>
                  )}
                </div>

                {/* Uncertainties Callout */}
                {synthesisResult.scientific_uncertainties.length > 0 && (
                  <div className="p-2.5 rounded-lg bg-ocean-950/80 border border-ocean-800/80">
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1.5 mb-1">
                      <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                      Scientific Uncertainties & Limitations
                    </span>
                    <ul className="list-disc list-inside text-[11px] text-slate-400 space-y-0.5 font-sans">
                      {synthesisResult.scientific_uncertainties.map((u, idx) => (
                        <li key={idx}>{u}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* 2. Observed Data Tab */}
            {activeTab === "observed" && (
              <div className="space-y-2.5 animate-in fade-in duration-200">
                <div className="p-3 rounded-lg bg-ocean-950/60 border border-emerald-500/30">
                  <span className="text-emerald-400 font-bold uppercase tracking-wider text-[11px] block mb-2">
                    Raw Oceanographic Telemetry
                  </span>
                  <div className="space-y-2 text-slate-300">
                    {sstResult?.latest && (
                      <div className="flex justify-between py-1 border-b border-ocean-800/60">
                        <span className="text-slate-400">Sea Surface Temperature (SST):</span>
                        <span className="font-bold text-white">{sstResult.latest.value_c}°C</span>
                      </div>
                    )}
                    {chlorophyllResult?.latest && (
                      <div className="flex justify-between py-1 border-b border-ocean-800/60">
                        <span className="text-slate-400">Chlorophyll-a Concentration:</span>
                        <span className="font-bold text-bioglow-aqua">{chlorophyllResult.latest.chlorophyll_mg_m3} mg/m³</span>
                      </div>
                    )}
                    {location && (
                      <div className="flex justify-between py-1 border-b border-ocean-800/60">
                        <span className="text-slate-400">Target Coordinates:</span>
                        <span className="text-slate-200">{location.latitude}°N, {location.longitude}°E</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 3. Derived Signals Tab */}
            {activeTab === "derived" && (
              <div className="space-y-2.5 animate-in fade-in duration-200">
                <div className="p-3 rounded-lg bg-ocean-950/60 border border-amber-500/30">
                  <span className="text-amber-400 font-bold uppercase tracking-wider text-[11px] block mb-2">
                    Computed Statistical Signals
                  </span>
                  <div className="space-y-2 text-slate-300">
                    {sstResult?.trend && (
                      <div className="flex justify-between py-1 border-b border-ocean-800/60">
                        <span className="text-slate-400">7-Day SST Linear Slope:</span>
                        <span className="font-bold text-slate-200">{sstResult.trend.slope_c_per_day} °C/day ({sstResult.trend.direction})</span>
                      </div>
                    )}
                    {sstResult?.anomaly && (
                      <div className="flex justify-between py-1 border-b border-ocean-800/60">
                        <span className="text-slate-400">Thermal Anomaly (1971-2000 Baseline):</span>
                        <span className="font-bold text-slate-200">{sstResult.anomaly.value_c > 0 ? "+" : ""}{sstResult.anomaly.value_c} °C</span>
                      </div>
                    )}
                    {chlorophyllResult?.baseline_comparison && (
                      <div className="flex justify-between py-1 border-b border-ocean-800/60">
                        <span className="text-slate-400">Chlorophyll Relative Status:</span>
                        <span className="font-bold text-slate-200 uppercase">{chlorophyllResult.baseline_comparison.relative_status}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 4. Reasoning Tab */}
            {activeTab === "reasoning" && (
              <div className="space-y-2.5 animate-in fade-in duration-200">
                {habAssessment ? (
                  <div className="p-3 rounded-lg bg-ocean-950/60 border border-sky-500/30">
                    <span className="text-sky-400 font-bold uppercase tracking-wider text-[11px] block mb-2">
                      Deterministic Multi-Factor Evaluation
                    </span>
                    <p className="text-slate-300 mb-2 font-sans">{habAssessment.regional_context}</p>
                    <div className="space-y-1.5">
                      {habAssessment.factors.map((f, i) => (
                        <div key={i} className="text-[11px] text-slate-300">
                          <span className="text-bioglow-cyan font-semibold">{f.name}: </span>
                          <span>{f.evidence}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-slate-500 text-center py-6">
                    Awaiting multi-agent reasoning execution...
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
