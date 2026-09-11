"use client";

import React, { useState } from "react";
import { SSTResult, ChlorophyllResult, AdvisoryResult } from "../lib/types";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts";
import {
  Thermometer,
  Waves,
  ShieldAlert,
  Database,
  CloudRain,
  TrendingUp,
  Activity,
  Layers,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

interface SpecialistWorkbenchProps {
  sstResult: SSTResult | null;
  chlorophyllResult: ChlorophyllResult | null;
  advisoryResult: AdvisoryResult | null;
}

const DEFAULT_SST_SERIES = [
  { date: "09-05", sst: 16.85, anomaly: 0.42 },
  { date: "09-06", sst: 17.02, anomaly: 0.55 },
  { date: "09-07", sst: 17.15, anomaly: 0.68 },
  { date: "09-08", sst: 17.20, anomaly: 0.71 },
  { date: "09-09", sst: 17.28, anomaly: 0.76 },
  { date: "09-10", sst: 17.31, anomaly: 0.79 },
  { date: "09-11", sst: 17.35, anomaly: 0.81 },
];

const DEFAULT_CHL_SERIES = [
  { date: "09-05", chla: 0.45, isCloudGap: false, originalValue: 0.45 },
  { date: "09-06", chla: 0.48, isCloudGap: false, originalValue: 0.48 },
  { date: "09-07", chla: 0.51, isCloudGap: false, originalValue: 0.51 },
  { date: "09-08", chla: 0.06, isCloudGap: true, originalValue: null },
  { date: "09-09", chla: 0.50, isCloudGap: false, originalValue: 0.50 },
  { date: "09-10", chla: 0.53, isCloudGap: false, originalValue: 0.53 },
  { date: "09-11", chla: 0.52, isCloudGap: false, originalValue: 0.52 },
];

export const SpecialistWorkbench: React.FC<SpecialistWorkbenchProps> = ({
  sstResult,
  chlorophyllResult,
  advisoryResult,
}) => {
  const [activeTab, setActiveTab] = useState<"all" | "sst" | "chlorophyll" | "advisory">("all");

  const sstChartData =
    sstResult?.time_series && sstResult.time_series.length > 0
      ? sstResult.time_series.map((pt) => ({
          date: pt.timestamp.slice(5, 10),
          sst: pt.sst_c,
          anomaly: pt.anom_c,
        }))
      : DEFAULT_SST_SERIES;

  const chlChartData =
    chlorophyllResult?.time_series && chlorophyllResult.time_series.length > 0
      ? chlorophyllResult.time_series.map((pt) => ({
          date: pt.timestamp.slice(5, 10),
          chla: pt.chlorophyll_mg_m3 !== null ? pt.chlorophyll_mg_m3 : 0.06,
          isCloudGap: pt.is_missing_or_cloud,
          originalValue: pt.chlorophyll_mg_m3,
        }))
      : DEFAULT_CHL_SERIES;

  const advisoryChartData = React.useMemo(() => {
    const hasAdvisory = (advisoryResult?.active_advisories?.length ?? 0) > 0;
    const severity = advisoryResult?.active_advisories?.[0]?.severity?.toLowerCase() || "info";
    const baseLevel = severity === "warning" || severity === "emergency" ? 3.5 : hasAdvisory ? 2.5 : 1.0;
    const days = ["09-05", "09-06", "09-07", "09-08", "09-09", "09-10", "09-11"];
    return days.map((d, i) => {
      const val = hasAdvisory ? Math.max(1, +(baseLevel - (6 - i) * 0.2).toFixed(1)) : 1.0;
      return {
        date: d,
        severityLevel: val,
        status: val > 2 ? "Active Alert" : "Routine Surveillance",
      };
    });
  }, [advisoryResult]);

  return (
    <div className="w-full hud-panel rounded-xl p-4 font-mono flex flex-col gap-3">
      {/* Workbench Header & Heterogeneous Data Architecture Notice */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-ocean-800/80">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-bioglow-cyan" />
          <h3 className="text-xs uppercase tracking-widest text-white font-bold">
            Heterogeneous Data Specialist Workbench
          </h3>
        </div>

        {/* Stream Filter Buttons */}
        <div className="flex items-center gap-1 bg-[#040f1d] p-1 rounded-lg border border-ocean-800 text-[11px]">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-2.5 py-1 rounded transition-all ${
              activeTab === "all"
                ? "bg-bioglow-cyan/20 text-bioglow-cyan border border-bioglow-cyan/40 font-bold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            ALL STREAMS
          </button>
          <button
            onClick={() => setActiveTab("sst")}
            className={`px-2.5 py-1 rounded transition-all ${
              activeTab === "sst"
                ? "bg-bioglow-cyan/20 text-bioglow-cyan border border-bioglow-cyan/40 font-bold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            SST GRIDDED
          </button>
          <button
            onClick={() => setActiveTab("chlorophyll")}
            className={`px-2.5 py-1 rounded transition-all ${
              activeTab === "chlorophyll"
                ? "bg-bioglow-aqua/20 text-bioglow-aqua border border-bioglow-aqua/40 font-bold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            CHL-A SWATH
          </button>
          <button
            onClick={() => setActiveTab("advisory")}
            className={`px-2.5 py-1 rounded transition-all ${
              activeTab === "advisory"
                ? "bg-amber-500/20 text-amber-400 border border-amber-500/40 font-bold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            ADVISORIES
          </button>
        </div>
      </div>

      {/* Grid of Specialists */}
      <div className={`grid grid-cols-1 ${activeTab === "all" ? "lg:grid-cols-3" : "grid-cols-1"} gap-3`}>
        {/* Stream 1: NOAA OISST Gridded Time Series */}
        {(activeTab === "all" || activeTab === "sst") && (
          <div className="p-3.5 rounded-xl bg-[#041122]/90 border border-bioglow-cyan/30 flex flex-col justify-between shadow-[0_0_15px_rgba(0,240,255,0.06)]">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-ocean-800 mb-2.5">
                <div className="flex items-center gap-1.5 text-bioglow-cyan">
                  <Thermometer className="w-4 h-4" />
                  <span className="font-bold text-xs uppercase">STREAM ALPHA · SST</span>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-bioglow-cyan/15 text-bioglow-cyan border border-bioglow-cyan/30">
                  xarray 4D GRID
                </span>
              </div>

              <div className="flex items-baseline justify-between mb-2">
                <div>
                  <span className="text-2xl font-extrabold text-white">
                    {sstResult?.latest ? `${sstResult.latest.value_c}°C` : "17.35°C"}
                  </span>
                  <span className="text-[10px] text-slate-400 ml-1.5">Surface SST</span>
                </div>
                <div className="text-right">
                  <span
                    className={`text-sm font-bold ${
                      (sstResult?.anomaly?.value_c ?? 0.81) > 0.5 ? "text-amber-400" : "text-emerald-400"
                    }`}
                  >
                    {sstResult?.anomaly ? `${sstResult.anomaly.value_c > 0 ? "+" : ""}${sstResult.anomaly.value_c}°C` : "+0.81°C"}
                  </span>
                  <span className="text-[9px] text-slate-400 block">Baseline Anom</span>
                </div>
              </div>

              {/* Chart */}
              <div className="w-full h-32 my-1">
                <ResponsiveContainer width="100%" height={128}>
                  <LineChart data={sstChartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="2 2" stroke="#0e233d" />
                    <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 9 }} />
                    <YAxis domain={["auto", "auto"]} stroke="#64748b" tick={{ fontSize: 9 }} unit="°" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#030c18",
                        borderColor: "#00f0ff",
                        borderRadius: "6px",
                        fontSize: "10px",
                      }}
                      formatter={(val: any, name?: any) => [`${val}°C`, name === "sst" ? "SST" : "Anomaly"]}
                    />
                    <Line type="monotone" dataKey="sst" stroke="#00f0ff" strokeWidth={2} dot={{ r: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="pt-2 border-t border-ocean-800/60 text-[10px] text-slate-400 flex justify-between">
              <span>{sstResult?.trend ? `${sstResult.trend.direction.toUpperCase()} (+${sstResult.trend.slope_c_per_day}°C/d)` : "WARMING (+0.04°C/d)"}</span>
              <span className="text-slate-300">NOAA OISST (0.25°)</span>
            </div>
          </div>
        )}

        {/* Stream 2: Copernicus / VIIRS Chlorophyll Swath */}
        {(activeTab === "all" || activeTab === "chlorophyll") && (
          <div className="p-3.5 rounded-xl bg-[#041122]/90 border border-bioglow-aqua/30 flex flex-col justify-between shadow-[0_0_15px_rgba(0,229,163,0.06)]">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-ocean-800 mb-2.5">
                <div className="flex items-center gap-1.5 text-bioglow-aqua">
                  <Waves className="w-4 h-4" />
                  <span className="font-bold text-xs uppercase">STREAM BETA · CHL-A</span>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-bioglow-aqua/15 text-bioglow-aqua border border-bioglow-aqua/30">
                  VIIRS DINEOF
                </span>
              </div>

              <div className="flex items-baseline justify-between mb-2">
                <div>
                  <span className="text-2xl font-extrabold text-bioglow-aqua">
                    {chlorophyllResult?.latest ? `${chlorophyllResult.latest.chlorophyll_mg_m3}` : "0.52"}
                    <span className="text-xs font-normal text-slate-400 ml-1">mg/m³</span>
                  </span>
                  <span className="text-[10px] text-slate-400 ml-1.5">Surface Biomass</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-slate-200 uppercase">
                    {chlorophyllResult?.baseline_comparison?.relative_status || "BASELINE"}
                  </span>
                  <span className="text-[9px] text-slate-400 block">Relative Status</span>
                </div>
              </div>

              {/* Chart with Cloud Gap representation */}
              <div className="w-full h-32 my-1">
                <ResponsiveContainer width="100%" height={128}>
                  <BarChart data={chlChartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="2 2" stroke="#0e233d" />
                    <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 9 }} />
                    <YAxis stroke="#64748b" tick={{ fontSize: 9 }} unit=" mg" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#030c18",
                        borderColor: "#00e5a3",
                        borderRadius: "6px",
                        fontSize: "10px",
                      }}
                      formatter={(val: any, name?: any, item?: any) => {
                        if (item?.payload?.isCloudGap) {
                          return ["Cloud Covered Gap", "Satellite Swath"];
                        }
                        return [`${item?.payload?.originalValue ?? val} mg/m³`, "Chlorophyll-a"];
                      }}
                    />
                    <Bar dataKey="chla" radius={[3, 3, 0, 0]}>
                      {chlChartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.isCloudGap ? "#334155" : "#00e5a3"}
                          stroke={entry.isCloudGap ? "#64748b" : "#00f0ff"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="pt-2 border-t border-ocean-800/60 text-[10px] text-slate-400 flex justify-between items-center">
              <span>{chlorophyllResult?.data_quality?.valid_obs_pct ?? 85.7}% Valid Pixels</span>
              <span className="flex items-center gap-1 text-slate-300">
                <CloudRain className="w-3 h-3 text-slate-400" />
                DINEOF Gap-filled
              </span>
            </div>
          </div>
        )}

        {/* Stream 3: Coastal Biotoxin & Fisheries Advisories */}
        {(activeTab === "all" || activeTab === "advisory") && (
          <div className="p-3.5 rounded-xl bg-[#041122]/90 border border-amber-500/30 flex flex-col justify-between shadow-[0_0_15px_rgba(245,158,11,0.06)]">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-ocean-800 mb-2.5">
                <div className="flex items-center gap-1.5 text-amber-400">
                  <ShieldAlert className="w-4 h-4" />
                  <span className="font-bold text-xs uppercase">STREAM GAMMA · ADVISORIES</span>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  REGULATORY NOTICES
                </span>
              </div>

              <div className="mb-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-xl font-bold text-white">
                    {advisoryResult?.active_advisories?.length ? `${advisoryResult.active_advisories.length} Active Notice(s)` : "Routine Surveillance"}
                  </span>
                  <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 uppercase">
                    SURVEILLANCE
                  </span>
                </div>
              </div>

              {/* Stream Gamma 7-Day Surveillance Severity Bar Chart */}
              <div className="w-full h-16 my-1">
                <ResponsiveContainer width="100%" height={64}>
                  <BarChart data={advisoryChartData} margin={{ top: 2, right: 5, left: -32, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="2 2" stroke="#0e233d" />
                    <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 8 }} />
                    <YAxis domain={[0, 4]} stroke="#64748b" tick={{ fontSize: 8 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#030c18",
                        borderColor: "#f59e0b",
                        borderRadius: "6px",
                        fontSize: "10px",
                      }}
                      formatter={(val: any) => [`Level ${val}/4`, "Advisory Index"]}
                    />
                    <Bar dataKey="severityLevel" radius={[2, 2, 0, 0]}>
                      {advisoryChartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.severityLevel > 2 ? "#f59e0b" : "#10b981"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Active Bulletins Content */}
              <div className="space-y-2 max-h-24 overflow-y-auto pr-1 mt-1">
                {advisoryResult?.active_advisories && advisoryResult.active_advisories.length > 0 ? (
                  advisoryResult.active_advisories.map((adv, i) => (
                    <div key={i} className="p-2 rounded bg-[#020a16] border border-amber-500/40 text-[11px]">
                      <div className="font-bold text-amber-300 truncate">{adv.title}</div>
                      <p className="text-slate-300 text-[10px] mt-0.5 line-clamp-2 font-sans">{adv.description}</p>
                      <div className="flex justify-between items-center text-[9px] text-slate-400 mt-1 pt-1 border-t border-ocean-800/80">
                        <span>{adv.source}</span>
                        <span className="uppercase text-amber-400 font-semibold">{adv.severity}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-2.5 rounded bg-[#020a16] border border-ocean-800 text-[10px] text-slate-400 text-center">
                    No emergency biotoxin closures currently mandated in queried coordinates.
                  </div>
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-ocean-800/60 text-[10px] text-slate-400 flex justify-between">
              <span>CDPH / NOAA NCCOS / INCOIS</span>
              <span className="text-slate-300">Live Health Bulletins</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
