"use client";

import React, { useState } from "react";
import { Terminal, Send, Loader2, Sparkles, CornerDownLeft } from "lucide-react";

interface TacticalConsoleProps {
  isStreaming: boolean;
  onSubmit: (query: string) => void;
  currentQuery?: string;
}

export const TacticalConsole: React.FC<TacticalConsoleProps> = ({
  isStreaming,
  onSubmit,
  currentQuery,
}) => {
  const [inputVal, setInputVal] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim() || isStreaming) return;
    onSubmit(inputVal.trim());
  };

  return (
    <div className="w-full hud-panel rounded-xl p-3.5 font-mono">
      <form onSubmit={handleSubmit} className="relative flex items-center">
        {/* Terminal Prefix */}
        <div className="absolute left-3.5 flex items-center gap-1.5 text-bioglow-cyan pointer-events-none select-none text-xs">
          <Terminal className="w-4 h-4" />
          <span className="hidden sm:inline font-bold">ORCA://COMMAND&gt;</span>
        </div>

        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          disabled={isStreaming}
          placeholder="Enter coastal coordinates or marine query (e.g. 'Will conditions favour a harmful algal bloom near California next week?')..."
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
              <span>ORCHESTRATING...</span>
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
