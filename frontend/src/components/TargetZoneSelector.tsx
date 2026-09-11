import React from "react";
import { Compass, Target, MapPin } from "lucide-react";

interface TargetZoneSelectorProps {
  onSelectZone: (zoneName: string, query: string) => void;
  currentZone?: string;
  disabled?: boolean;
}

const SECTORS = [
  {
    name: "California Upwelling",
    region: "NE Pacific Shelf",
    coords: "35.2°N, 121.2°W",
    query: "Will conditions favour a harmful algal bloom near California next week?",
    highlight: true,
  },
  {
    name: "Kerala Malabar",
    region: "SW India Upwelling",
    coords: "9.9°N, 75.8°E",
    query: "Analyze SST, chlorophyll, and upwelling telemetry near Kerala Malabar coast.",
    highlight: false,
  },
  {
    name: "Arabian Sea Basin",
    region: "Monsoon Stratified",
    coords: "15.0°N, 68.0°E",
    query: "Assess sea surface temperature and chlorophyll-a biomass in the Arabian Sea.",
    highlight: false,
  },
  {
    name: "Mumbai Konkan",
    region: "E. Arabian Shelf",
    coords: "18.9°N, 72.6°E",
    query: "Assess sea surface temperature, chlorophyll, and coastal notices near Mumbai.",
    highlight: false,
  },
  {
    name: "Bay of Bengal",
    region: "E. India Basin",
    coords: "14.5°N, 85.0°E",
    query: "Evaluate thermal stratification and chlorophyll concentrations in the Bay of Bengal.",
    highlight: false,
  },
  {
    name: "California Fisheries",
    region: "CDPH Advisory Zone",
    coords: "36.6°N, 122.0°W",
    query: "Are there coastal biotoxin advisories and bloom conditions in California fisheries?",
    highlight: false,
  },
];

export const TargetZoneSelector: React.FC<TargetZoneSelectorProps> = ({
  onSelectZone,
  currentZone,
  disabled = false,
}) => {
  return (
    <div className="w-full flex items-center gap-2 overflow-x-auto py-2 scrollbar-none font-mono text-xs">
      <div className="flex items-center gap-1.5 text-bioglow-cyan font-bold flex-shrink-0 mr-1 pl-1">
        <Target className="w-4 h-4 animate-pulse" />
        <span className="text-[11px] tracking-wider uppercase">TACTICAL SECTORS:</span>
      </div>

      {SECTORS.map((s, idx) => {
        const isSelected = currentZone && currentZone.toLowerCase().includes(s.name.toLowerCase().split(" ")[0]);
        return (
          <button
            key={idx}
            onClick={() => onSelectZone(s.name, s.query)}
            disabled={disabled}
            className={`flex-shrink-0 px-3 py-1.5 rounded-lg border transition-all text-left flex flex-col disabled:opacity-50 disabled:cursor-not-allowed ${
              isSelected
                ? "bg-bioglow-cyan/20 border-bioglow-cyan text-white shadow-[0_0_12px_rgba(0,240,255,0.3)]"
                : s.highlight
                ? "bg-[#05182e] border-bioglow-cyan/40 text-slate-200 hover:border-bioglow-cyan"
                : "bg-[#041122] border-ocean-800 text-slate-300 hover:border-ocean-700 hover:text-white"
            }`}
          >
            <div className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-bioglow-cyan animate-ping" : "bg-slate-500"}`}></span>
              <span className="font-bold text-[11px]">{s.name}</span>
            </div>
            <span className="text-[9px] text-slate-400 mt-0.5">{s.coords} · {s.region}</span>
          </button>
        );
      })}
    </div>
  );
};
