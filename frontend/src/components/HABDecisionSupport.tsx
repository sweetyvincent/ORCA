"use client";

import React, { useState } from "react";
import { HABAssessment, SynthesisResult, SSTResult, ChlorophyllResult, AdvisoryResult } from "../lib/types";
import {
  ShieldAlert,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  FileCheck2,
  Layers,
  ChevronRight,
  Info,
  Microscope,
} from "lucide-react";

interface HABDecisionSupportProps {
  habAssessment: HABAssessment | null;
  synthesisResult: SynthesisResult | null;
  sstResult: SSTResult | null;
  chlorophyllResult: ChlorophyllResult | null;
  advisoryResult: AdvisoryResult | null;
}

export const HABDecisionSupport: React.FC<HABDecisionSupportProps> = ({
  habAssessment,
  synthesisResult,
  sstResult,
  chlorophyllResult,
  advisoryResult,
}) => {
  const [viewTab, setViewTab] = useState<"synthesis" | "factors" | "uncertainties" | "provenance">("synthesis");

  if (!habAssessment && !synthesisResult && !sstResult) {
    return (
      <div className="w-full hud-panel rounded-xl p-6 text-center font-mono text-xs text-slate-500 flex flex-col items-center justify-center min-h-[220px]">
        <Microscope className="w-8 h-8 text-ocean-700 mb-2 animate-pulse" />
        <span className="text-slate-400 font-bold uppercase tracking-wider">Awaiting Multi-Agent Telemetry Stream</span>
        <p className="text-[11px] text-slate-500 mt-1 max-w-sm">
          Select a coastal mission sector or enter an oceanographic inquiry to engage the LangGraph specialist pipeline.
        </p>
      </div>
    );
  }

  const classification = habAssessment?.classification || "EVALUATED";
  const score = habAssessment?.score || 0.45;

  const getBadgeStyle = (cls: string) => {
    switch (cls) {
      case "HIGHER CONCERN":
        return "bg-rose-500/20 text-rose-300 border-rose-500/60 shadow-[0_0_15px_rgba(244,63,94,0.3)]";
      case "ELEVATED":
        return "bg-amber-500/20 text-amber-300 border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.3)]";
      case "MODERATE":
        return "bg-sky-500/20 text-sky-300 border-sky-500/60 shadow-[0_0_15px_rgba(14,165,233,0.3)]";
      case "LOW":
      default:
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/60 shadow-[0_0_15px_rgba(16,185,129,0.3)]";
    }
  };

  return (
    <div className="w-full hud-panel rounded-xl p-4 font-mono flex flex-col gap-3">
      {/* Top Banner: Scientific Assessment Headline */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-ocean-800/80">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-bioglow-cyan" />
          <div>
            <h3 className="text-xs uppercase tracking-widest text-slate-200 font-bold">
              Harmful Algal Bloom · Environmental Favourability
            </h3>
            <span className="text-[10px] text-slate-400 block font-sans">
              Deterministic Ecological Signal · Multi-Specialist Synthesis
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400">
            Signal Index: <span className="font-bold text-white">{(score * 100).toFixed(0)}/100</span>
          </span>
          <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-widest border uppercase ${getBadgeStyle(classification)}`}>
            {classification}
          </span>
        </div>
      </div>

      {/* Numerical Composite Risk Bar */}
      <div className="w-full bg-[#020a16] p-2.5 rounded-lg border border-ocean-800/80">
        <div className="flex justify-between items-center text-[10px] text-slate-400 mb-1.5">
          <span>LOW (0.00)</span>
          <span>MODERATE (0.25)</span>
          <span>ELEVATED (0.45)</span>
          <span>HIGHER CONCERN (0.70+)</span>
        </div>
        <div className="w-full h-2.5 bg-ocean-950 rounded-full overflow-hidden border border-ocean-800 relative">
          <div
            className={`h-full transition-all duration-700 rounded-full ${
              score >= 0.7
                ? "bg-gradient-to-r from-amber-500 to-rose-500"
                : score >= 0.45
                ? "bg-gradient-to-r from-sky-500 to-amber-500"
                : "bg-gradient-to-r from-emerald-500 to-sky-500"
            }`}
            style={{ width: `${Math.max(8, score * 100)}%` }}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-ocean-800 pb-2 text-xs overflow-x-auto">
        <button
          onClick={() => setViewTab("synthesis")}
          className={`px-3 py-1.5 rounded-md transition-all whitespace-nowrap ${
            viewTab === "synthesis"
              ? "bg-bioglow-cyan/20 text-bioglow-cyan border border-bioglow-cyan/40 font-bold"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          SYNTHESIZED REASONING
        </button>
        <button
          onClick={() => setViewTab("factors")}
          className={`px-3 py-1.5 rounded-md transition-all whitespace-nowrap ${
            viewTab === "factors"
              ? "bg-bioglow-aqua/20 text-bioglow-aqua border border-bioglow-aqua/40 font-bold"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          CONTRIBUTING EVIDENCE
        </button>
        <button
          onClick={() => setViewTab("uncertainties")}
          className={`px-3 py-1.5 rounded-md transition-all whitespace-nowrap ${
            viewTab === "uncertainties"
              ? "bg-amber-500/20 text-amber-400 border border-amber-500/40 font-bold"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          CRITICAL UNKNOWNS
        </button>
        <button
          onClick={() => setViewTab("provenance")}
          className={`px-3 py-1.5 rounded-md transition-all whitespace-nowrap ${
            viewTab === "provenance"
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          TELEMETRY PROVENANCE
        </button>
      </div>

      {/* Tab Content */}
      <div className="text-xs">
        {/* 1. Synthesis Tab */}
        {viewTab === "synthesis" && synthesisResult && (
          <div className="space-y-2.5 animate-in fade-in duration-200">
            <div className="p-3.5 rounded-lg bg-[#030d1c] border border-ocean-800">
              <span className="text-bioglow-cyan font-bold block mb-1.5 text-sm">
                {synthesisResult.favourability_headline}
              </span>
              <p className="text-slate-200 leading-relaxed text-xs sm:text-[13px] font-sans">
                {synthesisResult.natural_language_summary}
              </p>
            </div>

            {/* Regional Ecological Context Box */}
            {habAssessment?.regional_context && (
              <div className="p-2.5 rounded-lg bg-[#041224] border border-bioglow-cyan/30 text-[11px] text-slate-300">
                <span className="text-bioglow-cyan font-semibold">Regional Ecological Dynamics: </span>
                <span className="font-sans">{habAssessment.regional_context}</span>
              </div>
            )}
          </div>
        )}

        {/* 2. Contributing Factors Tab */}
        {viewTab === "factors" && habAssessment && (
          <div className="space-y-2 animate-in fade-in duration-200">
            {habAssessment.factors.map((factor, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-lg bg-[#030d1c] border border-ocean-800 flex items-start gap-2.5"
              >
                {factor.effect === "supporting" ? (
                  <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-200 text-[11px]">{factor.name}</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-ocean-800 text-slate-300 uppercase">
                      Weight: {(factor.weight * 100).toFixed(0)}%
                    </span>
                  </div>
                  <p className="text-slate-300 text-[11px] mt-0.5 font-sans leading-normal">
                    {factor.evidence}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 3. Uncertainties Tab */}
        {viewTab === "uncertainties" && (
          <div className="space-y-2 animate-in fade-in duration-200">
            <div className="p-3 rounded-lg bg-[#030d1c] border border-amber-500/30">
              <span className="font-bold text-amber-300 text-xs flex items-center gap-1.5 mb-2">
                <HelpCircle className="w-4 h-4 text-amber-400" />
                Essential Scientific Limitations & Sampling Needs
              </span>
              <ul className="space-y-1.5 text-[11px] text-slate-300 font-sans list-disc list-inside">
                <li>
                  <strong className="text-slate-200">Species Taxonomy:</strong> Satellite optical radiometers measure total chlorophyll-a pigment. They cannot distinguish toxic diatoms (*Pseudo-nitzschia*) from benign phytoplankton without in-situ microscopic or qPCR validation.
                </li>
                <li>
                  <strong className="text-slate-200">Depth Penetration:</strong> Infrared SST measures the skin temperature (top ~1mm); ocean colour observes ~1 optical attenuation depth. Neither detects subsurface thin layers or internal pycnocline waves.
                </li>
                <li>
                  <strong className="text-slate-200">Nutrient Stoichiometry:</strong> Stratification promotes blooms only when silica/nitrogen/phosphorus ratios favour the specific harmful assemblage.
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* 4. Telemetry Provenance Tab */}
        {viewTab === "provenance" && (
          <div className="space-y-2 animate-in fade-in duration-200 text-[11px]">
            <div className="p-2.5 rounded bg-[#030d1c] border border-ocean-800 flex justify-between items-center">
              <div>
                <span className="font-bold text-bioglow-cyan block">NOAA OISST v2.1 AVHRR</span>
                <span className="text-[10px] text-slate-400">0.25° Daily Gridded · 1971–2000 Baseline</span>
              </div>
              <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold">
                LIVE
              </span>
            </div>
            <div className="p-2.5 rounded bg-[#030d1c] border border-ocean-800 flex justify-between items-center">
              <div>
                <span className="font-bold text-bioglow-aqua block">VIIRS NOAA-20 DINEOF Gap-Filled</span>
                <span className="text-[10px] text-slate-400">Level-3 Global 2-4km Daily Composite</span>
              </div>
              <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold">
                LIVE
              </span>
            </div>
            <div className="p-2.5 rounded bg-[#030d1c] border border-ocean-800 flex justify-between items-center">
              <div>
                <span className="font-bold text-amber-400 block">CDPH & NOAA NCCOS Coastal Network</span>
                <span className="text-[10px] text-slate-400">Official Marine Biotoxin Bulletins</span>
              </div>
              <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold">
                ACTIVE
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
