import { useState, useCallback, useRef } from "react";
import { ORCAPipelineState, StreamEvent, AgentTraceStep } from "../lib/types";
import { streamORCAQuery } from "../lib/api";

const INITIAL_STEPS: AgentTraceStep[] = [
  { id: "query", title: "Query Processing", status: "queued" },
  { id: "location", title: "Location Resolver", status: "queued" },
  { id: "router", title: "Router Agent", status: "queued" },
  { id: "sst", title: "SST Specialist Agent", subtitle: "NOAA OISST v2.1", status: "queued" },
  { id: "chlorophyll", title: "Chlorophyll Specialist", subtitle: "Copernicus / VIIRS DINEOF", status: "queued" },
  { id: "advisory", title: "Advisory Specialist", subtitle: "Coastal Notices & Biotoxins", status: "queued" },
  { id: "hab_reasoning", title: "HAB Reasoning Engine", subtitle: "Deterministic Regional Matrix", status: "queued" },
  { id: "synthesizer", title: "Synthesis Agent", subtitle: "Evidence Grounding", status: "queued" },
];

export function useORCAStream() {
  const [state, setState] = useState<ORCAPipelineState>({
    isStreaming: false,
    question: "",
    location: null,
    routerDecision: null,
    sstResult: null,
    chlorophyllResult: null,
    advisoryResult: null,
    habAssessment: null,
    synthesisResult: null,
    traceSteps: INITIAL_STEPS,
    error: null,
  });

  const abortRef = useRef<(() => void) | null>(null);

  const updateStep = (id: string, updates: Partial<AgentTraceStep>) => {
    setState((prev) => ({
      ...prev,
      traceSteps: prev.traceSteps.map((step) =>
        step.id === id ? { ...step, ...updates } : step
      ),
    }));
  };

  const submitQuestion = useCallback((question: string) => {
    if (!question.trim()) return;

    if (abortRef.current) {
      abortRef.current();
    }

    // Reset state for new run
    setState((prev) => ({
      ...prev,
      isStreaming: true,
      question,
      // Retain previous stream telemetry as visual baseline until new stream events arrive
      sstResult: prev.sstResult,
      chlorophyllResult: prev.chlorophyllResult,
      advisoryResult: prev.advisoryResult,
      habAssessment: null,
      synthesisResult: null,
      traceSteps: INITIAL_STEPS.map((s) =>
        s.id === "query" ? { ...s, status: "running", subtitle: `"${question}"` } : { ...s, status: "queued" }
      ),
      error: null,
    }));

    const abort = streamORCAQuery(question, {
      onEvent: (ev: StreamEvent) => {
        const { type, node, data } = ev;

        if (type === "query_received") {
          updateStep("query", { status: "success" });
          updateStep("location", { status: "running" });
        } else if (type === "location_resolved") {
          setState((prev) => ({ ...prev, location: data }));
          updateStep("location", {
            status: "success",
            subtitle: `${data.location_name} (${data.latitude}°, ${data.longitude}°)`,
          });
          updateStep("router", { status: "running" });
        } else if (type === "router_completed") {
          setState((prev) => ({ ...prev, routerDecision: data }));
          const agents: string[] = data.agents || [];
          updateStep("router", {
            status: "success",
            subtitle: `${agents.length} specialist(s) selected: ${agents.join(", ")}`,
          });

          // Mark active specialists as running, inactive as skipped/hidden
          if (agents.includes("sst")) updateStep("sst", { status: "running" });
          if (agents.includes("chlorophyll")) updateStep("chlorophyll", { status: "running" });
          if (agents.includes("advisory")) updateStep("advisory", { status: "running" });
        } else if (type === "agent_completed") {
          if (node === "sst") {
            setState((prev) => ({ ...prev, sstResult: data }));
            const isWarn = data.status === "warning";
            updateStep("sst", {
              status: isWarn ? "warning" : "success",
              subtitle: data.latest ? `${data.latest.value_c}°C · ${data.trend?.direction || 'stable'}` : "Completed",
            });
          } else if (node === "chlorophyll") {
            setState((prev) => ({ ...prev, chlorophyllResult: data }));
            const isWarn = data.status === "warning";
            updateStep("chlorophyll", {
              status: isWarn ? "warning" : "success",
              subtitle: data.latest ? `${data.latest.chlorophyll_mg_m3} mg/m³ · ${data.baseline_comparison?.relative_status || 'baseline'}` : "Completed",
            });
          } else if (node === "advisory") {
            setState((prev) => ({ ...prev, advisoryResult: data }));
            updateStep("advisory", {
              status: "success",
              subtitle: `${data.active_advisories?.length || 0} notice(s) active`,
            });
          }
          updateStep("hab_reasoning", { status: "running" });
        } else if (type === "reasoning_completed") {
          setState((prev) => ({ ...prev, habAssessment: data }));
          updateStep("hab_reasoning", {
            status: "success",
            subtitle: `Signal: ${data.classification} (Score: ${data.score})`,
          });
          updateStep("synthesizer", { status: "running" });
        } else if (type === "synthesis_completed") {
          setState((prev) => ({ ...prev, synthesisResult: data }));
          updateStep("synthesizer", {
            status: "success",
            subtitle: "Evidence synthesized transparently",
          });
        } else if (type === "final") {
          setState((prev) => ({
            ...prev,
            isStreaming: false,
            location: data.location || prev.location,
            routerDecision: data.router_decision || prev.routerDecision,
            sstResult: data.sst_result || prev.sstResult,
            chlorophyllResult: data.chlorophyll_result || prev.chlorophyllResult,
            advisoryResult: data.advisory_result || prev.advisoryResult,
            habAssessment: data.hab_assessment || prev.habAssessment,
            synthesisResult: data.synthesis_result || prev.synthesisResult,
          }));
        } else if (type === "error") {
          setState((prev) => ({
            ...prev,
            isStreaming: false,
            error: data.error || "Execution error",
          }));
        }
      },
      onError: (errMsg: string) => {
        setState((prev) => ({
          ...prev,
          isStreaming: false,
          error: errMsg,
        }));
      },
      onComplete: () => {
        setState((prev) => ({ ...prev, isStreaming: false }));
      },
    });

    abortRef.current = abort;
  }, []);

  return {
    state,
    submitQuestion,
  };
}
