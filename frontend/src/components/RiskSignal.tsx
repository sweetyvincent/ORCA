import React from "react";
import { HABAssessment } from "../lib/types";
import { AlertCircle, CheckCircle, Info, ShieldAlert } from "lucide-react";

interface RiskSignalProps {
  assessment: HABAssessment | null;
}

export const RiskSignal: React.FC<RiskSignalProps> = ({ assessment }) => {
  if (!assessment) return null;

  const getBadgeColor = (cls: string) => {
    switch (cls) {
      case "HIGHER CONCERN":
        return "bg-rose-500/20 text-rose-400 border-rose-500/60 shadow-[0_0_15px_rgba(244,63,94,0.3)]";
      case "ELEVATED":
        return "bg-amber-500/20 text-amber-400 border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.3)]";
      case "MODERATE":
        return "bg-sky-500/20 text-sky-300 border-sky-500/60 shadow-[0_0_15px_rgba(14,165,233,0.3)]";
      case "LOW":
      default:
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/60 shadow-[0_0_15px_rgba(16,185,129,0.3)]";
    }
  };

  return (
    <div className="w-full glass-panel rounded-xl p-4 border border-ocean-800/80 flex flex-col font-mono">
      <div className="flex items-center justify-between pb-3 border-b border-ocean-800/60">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-bioglow-cyan" />
          <h3 className="text-xs uppercase tracking-widest text-slate-200 font-bold">
            HAB Environmental Favourability Signal
          </h3>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-bold border tracking-wider uppercase ${getBadgeColor(assessment.classification)}`}>
          {assessment.classification}
        </span>
      </div>

      {/* Numerical Index Bar */}
      <div className="mt-3">
        <div className="flex justify-between items-center text-xs text-slate-400 mb-1">
          <span>Signal Score (Multi-Factor Index)</span>
          <span className="font-bold text-slate-200">{(assessment.score * 100).toFixed(0)} / 100</span>
        </div>
        <div className="w-full h-2 bg-ocean-950 rounded-full overflow-hidden border border-ocean-800">
          <div
            className={`h-full transition-all duration-700 rounded-full ${
              assessment.score >= 0.7
                ? "bg-gradient-to-r from-amber-500 to-rose-500"
                : assessment.score >= 0.45
                ? "bg-gradient-to-r from-sky-500 to-amber-500"
                : "bg-gradient-to-r from-emerald-500 to-sky-500"
            }`}
            style={{ width: `${Math.max(5, assessment.score * 100)}%` }}
          />
        </div>
      </div>

      {/* Regional Ecological Context */}
      <div className="mt-3 p-2.5 rounded-lg bg-ocean-900/40 border border-ocean-800 text-[11px] text-slate-300">
        <span className="text-bioglow-cyan font-semibold">Ecological Context: </span>
        {assessment.regional_context}
      </div>

      {/* Contributing Factors */}
      <div className="mt-3 space-y-2">
        <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
          Contributing Evidence Streams
        </span>
        {assessment.factors.map((factor, idx) => (
          <div
            key={idx}
            className="flex items-start gap-2 p-2 rounded-md bg-ocean-950/50 border border-ocean-800/80 text-[11px]"
          >
            {factor.effect === "supporting" ? (
              <AlertCircle className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
            ) : factor.effect === "mitigating" ? (
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
            ) : (
              <Info className="w-3.5 h-3.5 text-sky-400 mt-0.5 flex-shrink-0" />
            )}
            <div>
              <span className="font-semibold text-slate-200">{factor.name}: </span>
              <span className="text-slate-300">{factor.evidence}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Scientific Honesty Disclaimer */}
      <div className="mt-3 p-2 rounded bg-ocean-950 border border-ocean-800/60 text-[10px] text-slate-400">
        <span className="text-slate-300 font-semibold">Scientific Caveats: </span>
        {assessment.limitations[0]}
      </div>
    </div>
  );
};
