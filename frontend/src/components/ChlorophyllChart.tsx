"use client";

import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts";
import { ChlorophyllResult } from "../lib/types";
import { Waves, CloudRain } from "lucide-react";

interface ChlorophyllChartProps {
  chlorophyllResult: ChlorophyllResult | null;
}

export const ChlorophyllChart: React.FC<ChlorophyllChartProps> = ({ chlorophyllResult }) => {
  if (!chlorophyllResult || !chlorophyllResult.time_series || chlorophyllResult.time_series.length === 0) {
    return (
      <div className="w-full h-56 glass-panel rounded-xl p-4 flex flex-col justify-center items-center text-slate-500 font-mono text-xs border border-ocean-800">
        <Waves className="w-6 h-6 text-ocean-700 mb-2" />
        <span>Awaiting Chlorophyll-a telemetry...</span>
      </div>
    );
  }

  const chartData = chlorophyllResult.time_series.map((pt) => ({
    date: pt.timestamp.slice(5, 10),
    chla: pt.chlorophyll_mg_m3 !== null ? pt.chlorophyll_mg_m3 : 0.05, // small placeholder bar for cloud gaps
    isCloudGap: pt.is_missing_or_cloud,
    originalValue: pt.chlorophyll_mg_m3,
  }));

  return (
    <div className="w-full glass-panel rounded-xl p-4 border border-ocean-800 flex flex-col font-mono">
      <div className="flex items-center justify-between pb-2 border-b border-ocean-800/60 mb-3">
        <div className="flex items-center gap-2">
          <Waves className="w-4 h-4 text-bioglow-aqua" />
          <h3 className="text-xs uppercase tracking-widest text-slate-200 font-bold">
            Chlorophyll-a Biomass Timeline
          </h3>
        </div>
        <div className="flex items-center gap-3 text-[10px]">
          <span className="text-bioglow-aqua">
            {chlorophyllResult.data_quality.valid_obs_pct}% Valid Pixels
          </span>
          {chlorophyllResult.data_quality.cloud_gap_detected && (
            <span className="flex items-center gap-1 text-slate-400">
              <CloudRain className="w-3 h-3 text-slate-400" />
              Cloud gaps present
            </span>
          )}
        </div>
      </div>

      <div className="w-full h-44">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#0e233d" />
            <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 10 }} />
            <YAxis stroke="#64748b" tick={{ fontSize: 10 }} unit=" mg" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#040d1a",
                borderColor: "#00e5a3",
                borderRadius: "8px",
                fontSize: "11px",
                fontFamily: "monospace",
              }}
              formatter={(val: any, name?: any, item?: any) => {
                if (item?.payload?.isCloudGap) {
                  return ["Cloud Covered / Missing", "Observation"];
                }
                return [`${item?.payload?.originalValue ?? val} mg/m³`, "Chlorophyll-a"];
              }}
            />
            <Bar dataKey="chla" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.isCloudGap ? "#334155" : "#00e5a3"}
                  stroke={entry.isCloudGap ? "#64748b" : "#00f0ff"}
                  strokeDasharray={entry.isCloudGap ? "2 2" : "none"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-ocean-800/40">
        <span>Source: {chlorophyllResult.source.provider}</span>
        <span>Dataset: {chlorophyllResult.source.dataset}</span>
      </div>
    </div>
  );
};
