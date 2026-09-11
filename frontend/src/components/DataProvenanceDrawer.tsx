import React from "react";
import { X, Database, CheckCircle2, ShieldCheck, Cpu, Code2 } from "lucide-react";

interface DataProvenanceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DataProvenanceDrawer: React.FC<DataProvenanceDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 font-mono">
      <div className="w-full max-w-md bg-ocean-950 border-l border-ocean-800 p-6 flex flex-col justify-between overflow-y-auto h-full shadow-2xl">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-ocean-800 mb-5">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-bioglow-cyan" />
              <h2 className="text-sm uppercase tracking-widest text-white font-bold">
                Scientific Data Provenance
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-ocean-900 border border-ocean-800 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4 text-xs">
            {/* 1. NOAA OISST */}
            <div className="p-3.5 rounded-xl bg-ocean-900/60 border border-ocean-800">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-bioglow-cyan">NOAA OISST v2.1</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  VERIFIED LIVE
                </span>
              </div>
              <ul className="space-y-1 text-slate-300 text-[11px]">
                <li><span className="text-slate-500">Provider:</span> NOAA / NCEI CoastWatch</li>
                <li><span className="text-slate-500">Dataset ID:</span> ncdcOisst21Agg</li>
                <li><span className="text-slate-500">Resolution:</span> 0.25° (~27 km) daily global grid</li>
                <li><span className="text-slate-500">Baseline:</span> 1971–2000 Climatological Baseline</li>
                <li><span className="text-slate-500">Variables:</span> sst, anom (sea surface temp & anomaly)</li>
              </ul>
            </div>

            {/* 2. Copernicus / VIIRS Chlorophyll */}
            <div className="p-3.5 rounded-xl bg-ocean-900/60 border border-ocean-800">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-bioglow-aqua">Copernicus / NOAA Ocean Colour</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  VERIFIED LIVE
                </span>
              </div>
              <ul className="space-y-1 text-slate-300 text-[11px]">
                <li><span className="text-slate-500">Provider:</span> Copernicus Marine / NOAA CoastWatch</li>
                <li><span className="text-slate-500">Sensor:</span> NOAA-20 / S-NPP VIIRS DINEOF Gap-filled</li>
                <li><span className="text-slate-500">Resolution:</span> 2 km - 4 km daily Level-3 composite</li>
                <li><span className="text-slate-500">Variable:</span> chlor_a (surface chlorophyll-a in mg/m³)</li>
                <li><span className="text-slate-500">Cloud Policy:</span> Gap-filling DINEOF + explicit flags</li>
              </ul>
            </div>

            {/* 3. LangGraph Orchestrator */}
            <div className="p-3.5 rounded-xl bg-ocean-900/60 border border-ocean-800">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-slate-200 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-bioglow-cyan" />
                  LangGraph State Machine
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-bioglow-cyan/20 text-bioglow-cyan border border-bioglow-cyan/40">
                  ORCHESTRATOR
                </span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Asynchronous state graph managing Location Resolution, Conditional Multi-Agent Fan-Out, Parallel Specialist Execution, and Streamed State Transitions over SSE.
              </p>
            </div>

            {/* 4. AI & Reasoning */}
            <div className="p-3.5 rounded-xl bg-ocean-900/60 border border-ocean-800">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-slate-200 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Honest AI Architecture
                </span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Deterministic Regional HAB Engine strictly calculates ecological risk indices prior to LLM synthesis. Anthropic Claude 3.5 Sonnet performs transparent evidence synthesis strictly constrained to empirical data.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-ocean-800 text-[10px] text-slate-500 text-center">
          ORCA Marine Intelligence · VeloHack 2K26 / Open Innovation
        </div>
      </div>
    </div>
  );
};
