"use client";

import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { SSTResult } from "../lib/types";
import { Thermometer } from "lucide-react";

interface SSTChartProps {
  sstResult: SSTResult | null;
}

export const SSTChart: React.FC<SSTChartProps> = ({ sstResult }) => {
  if (!sstResult || !sstResult.time_series || sstResult.time_series.length === 0) {
    return (
      <div className="w-full h-56 glass-panel rounded-xl p-4 flex flex-col justify-center items-center text-slate-500 font-mono text-xs border border-ocean-800">
        <Thermometer className="w-6 h-6 text-ocean-700 mb-2" />
        <span>Awaiting SST telemetry time-series...</span>
      </div>
    );
  }

  const chartData = sstResult.time_series.map((pt) => ({
    date: pt.timestamp.slice(5, 10), // MM-DD
    sst: pt.sst_c,
    anomaly: pt.anom_c,
  }));

  const minSst = Math.floor(Math.min(...chartData.map((d) => d.sst || 20)) - 1);
  const maxSst = Math.ceil(Math.max(...chartData.map((d) => d.sst || 20)) + 1);

  return (
    <div className="w-full glass-panel rounded-xl p-4 border border-ocean-800 flex flex-col font-mono">
      <div className="flex items-center justify-between pb-2 border-b border-ocean-800/60 mb-3">
        <div className="flex items-center gap-2">
          <Thermometer className="w-4 h-4 text-bioglow-cyan" />
          <h3 className="text-xs uppercase tracking-widest text-slate-200 font-bold">
            SST 7-Day Observation Time Series
          </h3>
        </div>
        <span className="text-[10px] text-bioglow-cyan">
          {sstResult.trend?.direction ? sstResult.trend.direction.toUpperCase() : "STABLE"} ({(sstResult.trend?.slope_c_per_day ?? 0) > 0 ? "+" : ""}{sstResult.trend?.slope_c_per_day ?? 0}°C/day)
        </span>
      </div>

      <div className="w-full h-44">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#0e233d" />
            <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 10 }} />
            <YAxis domain={[minSst, maxSst]} stroke="#64748b" tick={{ fontSize: 10 }} unit="°" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#040d1a",
                borderColor: "#00f0ff",
                borderRadius: "8px",
                fontSize: "11px",
                fontFamily: "monospace",
              }}
              formatter={(val: any, name?: any) => [
                `${val}°C`,
                name === "sst" ? "Sea Surface Temp" : "Anomaly",
              ]}
            />
            <Line
              type="monotone"
              dataKey="sst"
              stroke="#00f0ff"
              strokeWidth={2}
              dot={{ r: 3, fill: "#00f0ff" }}
              activeDot={{ r: 5, fill: "#ffffff", stroke: "#00f0ff" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-ocean-800/40">
        <span>Source: {sstResult.source.provider}</span>
        <span>Resolution: {sstResult.source.resolution}</span>
      </div>
    </div>
  );
};
