import React from "react";
import { AgentTraceStep, TraceNodeStatus } from "../lib/types";
import { CheckCircle2, AlertTriangle, XCircle, Loader2, CircleDot, Cpu } from "lucide-react";

interface AgentTraceProps {
  steps: AgentTraceStep[];
  isStreaming: boolean;
  presentationMode?: boolean;
}

const StatusIcon: React.FC<{ status: TraceNodeStatus }> = ({ status }) => {
  switch (status) {
    case "running":
      return <Loader2 className="w-4 h-4 text-bioglow-cyan animate-spin" />;
    case "success":
      return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
    case "warning":
      return <AlertTriangle className="w-4 h-4 text-amber-400" />;
    case "error":
      return <XCircle className="w-4 h-4 text-rose-500" />;
    case "queued":
    default:
      return <CircleDot className="w-4 h-4 text-slate-600" />;
  }
};

export const AgentTrace: React.FC<AgentTraceProps> = ({
  steps,
  isStreaming,
  presentationMode = false,
}) => {
  return (
    <div className="w-full glass-panel rounded-xl p-4 flex flex-col h-full overflow-hidden border border-ocean-800/80">
      <div className="flex items-center justify-between pb-3 border-b border-ocean-800 mb-3">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-bioglow-cyan" />
          <h2 className="text-xs font-mono uppercase tracking-widest text-slate-200 font-bold">
            LangGraph Execution Trace
          </h2>
        </div>
        {isStreaming && (
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-bioglow-cyan/15 text-[10px] font-mono text-bioglow-cyan border border-bioglow-cyan/30 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-bioglow-cyan"></span>
            ACTIVE ORCHESTRATION
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 font-mono">
        {steps.map((step, idx) => {
          const isRunning = step.status === "running";
          const isSuccess = step.status === "success";
          const isWarn = step.status === "warning";
          const isQueued = step.status === "queued";

          return (
            <div
              key={step.id}
              className={`p-2.5 rounded-lg border transition-all ${
                isRunning
                  ? "bg-bioglow-cyan/10 border-bioglow-cyan/50 shadow-cyan-glow"
                  : isSuccess
                  ? "bg-ocean-900/40 border-ocean-700/60"
                  : isWarn
                  ? "bg-amber-950/20 border-amber-500/40"
                  : "bg-ocean-950/30 border-ocean-900 opacity-60"
              }`}
            >
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5 flex-shrink-0">
                  <StatusIcon status={step.status} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-semibold tracking-wide ${
                        isRunning
                          ? "text-bioglow-cyan"
                          : isSuccess
                          ? "text-slate-100"
                          : isWarn
                          ? "text-amber-300"
                          : "text-slate-400"
                      }`}
                    >
                      {step.title}
                    </span>
                    <span className="text-[10px] text-slate-500 uppercase">
                      {step.status}
                    </span>
                  </div>

                  {step.subtitle && (
                    <p
                      className={`text-[11px] mt-0.5 truncate ${
                        isRunning
                          ? "text-bioglow-cyan/90"
                          : isWarn
                          ? "text-amber-400/80"
                          : "text-slate-400"
                      }`}
                    >
                      {step.subtitle}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
