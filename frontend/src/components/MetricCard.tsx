import React from "react";
import { SSTResult, ChlorophyllResult, HABAssessment } from "../lib/types";
import { Thermometer, Waves, TrendingUp, AlertTriangle, Clock } from "lucide-react";

interface MetricCardsProps {
  sstResult: SSTResult | null;
  chlorophyllResult: ChlorophyllResult | null;
  habAssessment: HABAssessment | null;
}

export const MetricCardRow: React.FC<MetricCardsProps> = ({
  sstResult,
  chlorophyllResult,
  habAssessment,
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 w-full font-mono">
      {/* 1. SST Metric */}
      <div className="glass-panel p-3 rounded-xl border border-ocean-800 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[10px] uppercase font-bold tracking-wider">Sea Surface Temp</span>
          <Thermometer className="w-3.5 h-3.5 text-bioglow-cyan" />
        </div>
        <div className="mt-2">
          <span className="text-xl lg:text-2xl font-bold text-white tracking-tight">
            {sstResult?.latest ? `${sstResult.latest.value_c}°C` : "--"}
          </span>
          <p className="text-[10px] text-slate-400 mt-0.5 truncate">
            {sstResult?.source ? sstResult.source.dataset : "Awaiting telemetry"}
          </p>
        </div>
      </div>

      {/* 2. SST Anomaly / Trend */}
      <div className="glass-panel p-3 rounded-xl border border-ocean-800 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[10px] uppercase font-bold tracking-wider">Thermal Signal</span>
          <TrendingUp className="w-3.5 h-3.5 text-bioglow-cyan" />
        </div>
        <div className="mt-2">
          <span
            className={`text-xl lg:text-2xl font-bold tracking-tight ${
              (sstResult?.anomaly?.value_c || 0) > 0.5 ? "text-amber-400" : "text-emerald-400"
            }`}
          >
            {sstResult?.anomaly ? `${sstResult.anomaly.value_c > 0 ? "+" : ""}${sstResult.anomaly.value_c}°C` : "--"}
          </span>
          <p className="text-[10px] text-slate-400 mt-0.5 truncate">
            {sstResult?.trend ? `${sstResult.trend.direction} (${(sstResult.trend.slope_c_per_day ?? 0) > 0 ? "+" : ""}${sstResult.trend.slope_c_per_day ?? 0}°C/d)` : "7-day trend"}
          </p>
        </div>
      </div>

      {/* 3. Chlorophyll-a */}
      <div className="glass-panel p-3 rounded-xl border border-ocean-800 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[10px] uppercase font-bold tracking-wider">Chlorophyll-a</span>
          <Waves className="w-3.5 h-3.5 text-bioglow-aqua" />
        </div>
        <div className="mt-2">
          <span className="text-xl lg:text-2xl font-bold text-bioglow-aqua tracking-tight">
            {chlorophyllResult?.latest ? `${chlorophyllResult.latest.chlorophyll_mg_m3}` : "--"}
            <span className="text-xs ml-1 text-slate-400 font-normal">mg/m³</span>
          </span>
          <p className="text-[10px] text-slate-400 mt-0.5 truncate">
            {chlorophyllResult?.baseline_comparison ? `${chlorophyllResult.baseline_comparison.relative_status} status` : "VIIRS DINEOF"}
          </p>
        </div>
      </div>

      {/* 4. HAB Favourability */}
      <div className="glass-panel p-3 rounded-xl border border-ocean-800 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[10px] uppercase font-bold tracking-wider">HAB Signal</span>
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
        </div>
        <div className="mt-2">
          <span
            className={`text-base lg:text-lg font-bold tracking-wider uppercase ${
              habAssessment?.classification === "HIGHER CONCERN"
                ? "text-rose-400"
                : habAssessment?.classification === "ELEVATED"
                ? "text-amber-400"
                : habAssessment?.classification === "MODERATE"
                ? "text-sky-400"
                : habAssessment?.classification === "LOW"
                ? "text-emerald-400"
                : "text-slate-400"
            }`}
          >
            {habAssessment?.classification || "--"}
          </span>
          <p className="text-[10px] text-slate-400 mt-0.5 truncate">
            {habAssessment ? `Score: ${habAssessment.score}` : "Multi-factor"}
          </p>
        </div>
      </div>

      {/* 5. Data Freshness */}
      <div className="glass-panel p-3 rounded-xl border border-ocean-800 flex flex-col justify-between col-span-2 md:col-span-1">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[10px] uppercase font-bold tracking-wider">Data Freshness</span>
          <Clock className="w-3.5 h-3.5 text-bioglow-cyan" />
        </div>
        <div className="mt-2">
          <span className="text-base lg:text-lg font-bold text-emerald-400 tracking-tight">
            {sstResult?.source.freshness_label || "LIVE TELEMETRY"}
          </span>
          <p className="text-[10px] text-slate-400 mt-0.5 truncate">
            {sstResult?.latest ? `Observed: ${sstResult.latest.timestamp.slice(0, 10)}` : "Daily sync"}
          </p>
        </div>
      </div>
    </div>
  );
};
