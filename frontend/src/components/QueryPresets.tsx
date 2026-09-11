import React from "react";
import { Sparkles } from "lucide-react";

interface QueryPresetsProps {
  onSelect: (query: string) => void;
  disabled?: boolean;
}

const PRESETS = [
  {
    label: "California HAB Risk",
    query: "Will conditions favour a harmful algal bloom near California next week?",
  },
  {
    label: "Kerala SST & Chl-a",
    query: "Compare SST and chlorophyll near Kerala.",
  },
  {
    label: "Arabian Sea Warming",
    query: "Is the Arabian Sea warming and does it coincide with elevated chlorophyll?",
  },
  {
    label: "Mumbai Chlorophyll",
    query: "Show me chlorophyll conditions near Mumbai.",
  },
  {
    label: "Coastal Advisories",
    query: "Are there coastal advisories relevant to California fisheries?",
  },
];

export const QueryPresets: React.FC<QueryPresetsProps> = ({ onSelect, disabled }) => {
  return (
    <div className="w-full flex items-center gap-2 overflow-x-auto py-1 scrollbar-none text-xs font-mono">
      <div className="flex items-center gap-1 text-slate-400 flex-shrink-0">
        <Sparkles className="w-3.5 h-3.5 text-bioglow-cyan" />
        <span className="text-[11px]">PRESETS:</span>
      </div>
      {PRESETS.map((p, idx) => (
        <button
          key={idx}
          onClick={() => onSelect(p.query)}
          disabled={disabled}
          className="flex-shrink-0 px-2.5 py-1 rounded-md bg-ocean-900/70 hover:bg-ocean-800/80 border border-ocean-700/60 hover:border-bioglow-cyan/50 text-slate-300 hover:text-bioglow-cyan transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {p.label}
        </button>
      ))}
    </div>
  );
};
