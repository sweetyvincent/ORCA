"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Terminal,
  Send,
  Loader2,
  Sparkles,
  CornerDownLeft,
  Bot,
  User,
  ShieldAlert,
  Thermometer,
  Waves,
  FileText,
  HelpCircle,
  Copy,
  Check,
  RotateCcw,
  ExternalLink,
} from "lucide-react";
import {
  SynthesisResult,
  HABAssessment,
  SSTResult,
  ChlorophyllResult,
  AdvisoryResult,
  RouterDecision,
  LocationResolved,
} from "../lib/types";

interface TacticalConsoleProps {
  isStreaming: boolean;
  onSubmit: (query: string) => void;
  currentQuery?: string;
  synthesisResult?: SynthesisResult | null;
  habAssessment?: HABAssessment | null;
  sstResult?: SSTResult | null;
  chlorophyllResult?: ChlorophyllResult | null;
  advisoryResult?: AdvisoryResult | null;
  routerDecision?: RouterDecision | null;
  location?: LocationResolved | null;
}

export const TacticalConsole: React.FC<TacticalConsoleProps> = ({
  isStreaming,
  onSubmit,
  currentQuery,
  synthesisResult,
  habAssessment,
  sstResult,
  chlorophyllResult,
  advisoryResult,
  routerDecision,
  location,
}) => {
  const [inputVal, setInputVal] = useState("");
  const [copied, setCopied] = useState(false);
  const scrollAnchorRef = useRef<HTMLDivElement>(null);

  // Auto-scroll when new response arrives
  useEffect(() => {
    if (synthesisResult || isStreaming) {
      scrollAnchorRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [synthesisResult, isStreaming]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim() || isStreaming) return;
    onSubmit(inputVal.trim());
    setInputVal("");
  };

  const handleCopy = () => {
    if (!synthesisResult) return;
    const textToCopy = `[ORCA Marine Intelligence Briefing]\nHeadline: ${synthesisResult.favourability_headline}\n\nSummary:\n${synthesisResult.natural_language_summary}\n\nSST: ${synthesisResult.sst_findings || "N/A"}\nChlorophyll-a: ${synthesisResult.chlorophyll_findings || "N/A"}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const hasContent = Boolean(currentQuery || synthesisResult || isStreaming);

  const presets = [
    "Will conditions favour a harmful algal bloom near California next week?",
    "What is the sea surface temperature and trend slope near Kerala?",
    "Are there active coastal biotoxin advisories near Mumbai?",
    "Analyze thermal stratification and chlorophyll in the Arabian Sea",
  ];

  return (
    <div className="w-full hud-panel rounded-xl p-4 sm:p-5 font-mono flex flex-col gap-4 border border-ocean-700/80 shadow-2xl">
      {/* Console Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-ocean-800">
        <div className="flex items-center gap-2 text-bioglow-cyan">
          <Terminal className="w-4 h-4 text-bioglow-cyan" />
          <span className="font-bold text-xs uppercase tracking-widest text-slate-200">
            ORCA // SCIENTIFIC CHATBOT & MISSION INTELLIGENCE CONSOLE
          </span>
        </div>

        <div className="flex items-center gap-2 text-[10px] text-slate-400">
          <span className="px-2 py-0.5 rounded bg-ocean-900 border border-ocean-700/80 text-bioglow-cyan font-bold">
            LANGGRAPH MULTI-AGENT
          </span>
          <span className="px-2 py-0.5 rounded bg-ocean-900 border border-ocean-700/80 text-emerald-400 font-bold">
            NOAA & COPERNICUS
          </span>
        </div>
      </div>

      {/* CONVERSATION STREAM & CHATBOT REPLY DISPLAY */}
      {hasContent ? (
        <div className="flex flex-col gap-3.5 max-h-[500px] overflow-y-auto pr-1 select-text">
          {/* 1. Operator (User) Query */}
          {currentQuery && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-[#030e20] border border-bioglow-cyan/30">
              <div className="w-7 h-7 rounded-md bg-bioglow-cyan/20 border border-bioglow-cyan/40 flex items-center justify-center flex-shrink-0 text-bioglow-cyan">
                <User className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                  <span className="font-bold text-bioglow-cyan uppercase">OPERATOR INQUIRY</span>
                  <span>{new Date().toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour12: false })} IST</span>
                </div>
                <p className="text-sm font-semibold text-white font-sans tracking-wide">
                  "{currentQuery}"
                </p>
              </div>
            </div>
          )}

          {/* 2. Streaming Progress State */}
          {isStreaming && (
            <div className="flex items-start gap-3 p-3.5 rounded-lg bg-[#020b18] border border-bioglow-cyan/40 animate-pulse">
              <div className="w-7 h-7 rounded-md bg-bioglow-cyan/20 border border-bioglow-cyan/40 flex items-center justify-center flex-shrink-0 text-bioglow-cyan">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
              <div className="flex-1 text-xs">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-bioglow-cyan uppercase tracking-wider">
                    ORCA AGENTS REASONING...
                  </span>
                  <span className="w-2 h-2 rounded-full bg-bioglow-cyan animate-ping"></span>
                </div>
                <p className="text-slate-300 font-sans text-xs">
                  Routing query across NOAA OISST (4D NetCDF) and Copernicus VIIRS DINEOF specialists. Calculating thermal slopes and checking regional ecological gates...
                </p>
              </div>
            </div>
          )}

          {/* 3. The Chatbot Reply Card (AI Synthesis Narrative) */}
          {synthesisResult && (
            <div className="flex items-start gap-3 p-4 rounded-lg bg-[#031326] border-2 border-bioglow-cyan/50 shadow-[0_0_25px_rgba(0,240,255,0.15)] animate-in fade-in duration-300">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-bioglow-cyan to-ocean-800 border border-bioglow-cyan/80 flex items-center justify-center flex-shrink-0 text-ocean-950 shadow-md">
                <Bot className="w-5 h-5 text-ocean-950 stroke-[2.5]" />
              </div>

              <div className="flex-1 flex flex-col gap-3">
                {/* Chatbot Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-ocean-700/60">
                  <div>
                    <span className="text-[11px] font-bold text-bioglow-cyan uppercase tracking-wider block">
                      ORCA MARINE INTELLIGENCE // EXECUTIVE BRIEFING
                    </span>
                    <span className="text-xs font-semibold text-white font-sans">
                      {synthesisResult.favourability_headline}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {habAssessment && (
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                        habAssessment.classification === "HIGHER CONCERN"
                          ? "bg-rose-500/20 text-rose-300 border-rose-500/50"
                          : habAssessment.classification === "ELEVATED"
                          ? "bg-amber-500/20 text-amber-300 border-amber-500/50"
                          : "bg-emerald-500/20 text-emerald-300 border-emerald-500/50"
                      }`}>
                        SIGNAL: {habAssessment.classification} ({(habAssessment.score * 100).toFixed(0)}/100)
                      </span>
                    )}

                    <button
                      onClick={handleCopy}
                      className="p-1.5 rounded hover:bg-ocean-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                      title="Copy response to clipboard"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Primary Natural Language Chatbot Answer */}
                <div className="p-3 rounded-lg bg-[#020a16] border border-ocean-700/60">
                  <p className="text-xs sm:text-sm text-slate-100 font-sans leading-relaxed">
                    {synthesisResult.natural_language_summary}
                  </p>
                </div>

                {/* Specialist Evidence Streams */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono">
                  {synthesisResult.sst_findings && (
                    <div className="p-2.5 rounded bg-[#020814] border border-amber-500/30">
                      <div className="flex items-center gap-1.5 text-amber-400 font-bold text-[10px] uppercase mb-1">
                        <Thermometer className="w-3.5 h-3.5" />
                        <span>SST SPECIALIST (NOAA OISST)</span>
                      </div>
                      <p className="text-slate-300 text-[11px] font-sans leading-snug">
                        {synthesisResult.sst_findings}
                      </p>
                    </div>
                  )}

                  {synthesisResult.chlorophyll_findings && (
                    <div className="p-2.5 rounded bg-[#020814] border border-bioglow-aqua/30">
                      <div className="flex items-center gap-1.5 text-bioglow-aqua font-bold text-[10px] uppercase mb-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>CHLOROPHYLL (VIIRS DINEOF)</span>
                      </div>
                      <p className="text-slate-300 text-[11px] font-sans leading-snug">
                        {synthesisResult.chlorophyll_findings}
                      </p>
                    </div>
                  )}
                </div>

                {/* Advisory notice if present */}
                {synthesisResult.advisory_findings && (
                  <div className="p-2.5 rounded bg-[#020814] border border-rose-500/30 text-xs">
                    <div className="flex items-center gap-1.5 text-rose-400 font-bold text-[10px] uppercase mb-1">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>COASTAL ADVISORY NOTICE</span>
                    </div>
                    <p className="text-slate-300 text-[11px] font-sans">
                      {synthesisResult.advisory_findings}
                    </p>
                  </div>
                )}

                {/* Scientific Limitations & Sampling Needs */}
                {synthesisResult.scientific_uncertainties?.length > 0 && (
                  <div className="p-2.5 rounded bg-[#020914] border border-ocean-700/60 text-[11px] text-slate-400">
                    <span className="text-[10px] font-bold text-slate-300 uppercase flex items-center gap-1 mb-1">
                      <HelpCircle className="w-3 h-3 text-amber-400" />
                      Scientific Caveats & Recommended Field Validation:
                    </span>
                    <ul className="list-disc list-inside space-y-0.5 font-sans">
                      {synthesisResult.scientific_uncertainties.map((u, i) => (
                        <li key={i}>{u}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Data Attributions */}
                {synthesisResult.citations && (
                  <div className="pt-2 border-t border-ocean-800 flex flex-wrap items-center gap-3 text-[10px] text-slate-400">
                    <span className="text-slate-500 font-bold uppercase">VERIFIED SOURCES:</span>
                    {synthesisResult.citations.map((c, idx) => (
                      <span key={idx} className="bg-ocean-900/60 px-2 py-0.5 rounded border border-ocean-800">
                        {c.name}: {c.dataset}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <div ref={scrollAnchorRef} />
        </div>
      ) : (
        /* Empty State: Quick Prompt Suggestions */
        <div className="flex flex-col gap-2 py-2">
          <span className="text-xs text-slate-400 font-sans flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-bioglow-cyan" />
            Suggested Marine Inquiries:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {presets.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onSubmit(preset)}
                className="text-left p-2.5 rounded-lg bg-[#030d1c] border border-ocean-800 hover:border-bioglow-cyan/60 hover:bg-ocean-900/60 text-[11px] text-slate-300 hover:text-white transition-all cursor-pointer font-sans"
              >
                "{preset}"
              </button>
            ))}
          </div>
        </div>
      )}

      {/* INPUT FORM */}
      <form onSubmit={handleSubmit} className="relative flex items-center pt-1 border-t border-ocean-800/80">
        <div className="absolute left-3 flex items-center gap-1.5 text-bioglow-cyan pointer-events-none select-none text-xs">
          <Terminal className="w-4 h-4" />
          <span className="hidden sm:inline font-bold">ORCA://QUERY&gt;</span>
        </div>

        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          disabled={isStreaming}
          placeholder="Ask a question or enter coordinates (e.g. 'Will conditions favour a harmful algal bloom near California next week?')..."
          className="w-full bg-[#020914] border border-ocean-700/80 focus:border-bioglow-cyan rounded-lg py-3 pl-10 sm:pl-36 pr-28 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-bioglow-cyan shadow-inner disabled:opacity-60 transition-all font-mono"
        />

        <button
          type="submit"
          disabled={!inputVal.trim() || isStreaming}
          className="absolute right-2 px-4 py-2 rounded-md bg-gradient-to-r from-bioglow-cyan to-bioglow-blue text-ocean-950 font-bold text-xs flex items-center gap-1.5 hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(0,240,255,0.4)] cursor-pointer"
        >
          {isStreaming ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>REASONING...</span>
            </>
          ) : (
            <>
              <span>DISPATCH</span>
              <CornerDownLeft className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};

