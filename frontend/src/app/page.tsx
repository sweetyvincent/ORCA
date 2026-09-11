"use client";

import React, { useState, useEffect } from "react";
import { CommandHeader } from "../components/CommandHeader";
import { OceanGlobe } from "../components/OceanGlobe";
import { AgentTrace } from "../components/AgentTrace";
import { AgentNetwork } from "../components/AgentNetwork";
import { RiskSignal } from "../components/RiskSignal";
import { MetricCardRow } from "../components/MetricCard";
import { SSTChart } from "../components/SSTChart";
import { ChlorophyllChart } from "../components/ChlorophyllChart";
import { QueryPresets } from "../components/QueryPresets";
import { ChatPanel } from "../components/ChatPanel";
import { DataProvenanceDrawer } from "../components/DataProvenanceDrawer";
import { HeroSequence } from "../components/HeroSequence";
import { useORCAStream } from "../hooks/useORCAStream";

export default function ORCAObservatory() {
  const [showHero, setShowHero] = useState(true);
  const [presentationMode, setPresentationMode] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const [provenanceOpen, setProvenanceOpen] = useState(false);

  const { state, submitQuestion } = useORCAStream();

  // If demo mode is toggled on and no question has run, run the suggested California HAB query
  useEffect(() => {
    if (demoMode && !state.question && !state.isStreaming) {
      submitQuestion("Will conditions favour a harmful algal bloom near California next week?");
    }
  }, [demoMode, state.question, state.isStreaming, submitQuestion]);

  return (
    <main className="min-h-screen bg-radial-dark text-slate-100 flex flex-col relative selection:bg-bioglow-cyan selection:text-ocean-950">
      {/* 1. Cinematic Hero Entry */}
      {showHero && <HeroSequence onDismiss={() => setShowHero(false)} />}

      {/* 2. Command Header */}
      <CommandHeader
        presentationMode={presentationMode}
        setPresentationMode={setPresentationMode}
        demoMode={demoMode}
        setDemoMode={setDemoMode}
        onOpenProvenance={() => setProvenanceOpen(true)}
      />

      {/* 3. Main Command Center Workspace */}
      <div className="flex-1 max-w-[1720px] w-full mx-auto p-3 lg:p-5 flex flex-col gap-4">
        {/* Top Observatory Row: 3D Globe + Agent Architecture */}
        <div className={`grid grid-cols-1 ${presentationMode ? "lg:grid-cols-12" : "lg:grid-cols-12"} gap-4`}>
          {/* Left: 3D Ocean Globe & Environmental Telemetry */}
          <div className={`${presentationMode ? "lg:col-span-7" : "lg:col-span-7"} flex flex-col gap-4`}>
            <div className="h-[380px] lg:h-[430px] w-full">
              <OceanGlobe
                location={state.location}
                sstResult={state.sstResult}
                chlorophyllResult={state.chlorophyllResult}
                presentationMode={presentationMode}
              />
            </div>

            {/* Time Series Charts Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <SSTChart sstResult={state.sstResult} />
              <ChlorophyllChart chlorophyllResult={state.chlorophyllResult} />
            </div>
          </div>

          {/* Right: Multi-Agent Network & Live Execution Trace */}
          <div className={`${presentationMode ? "lg:col-span-5" : "lg:col-span-5"} flex flex-col gap-4`}>
            {/* Live Agent Network */}
            <AgentNetwork
              isStreaming={state.isStreaming}
              routerDecision={state.routerDecision}
              sstResult={state.sstResult}
              chlorophyllResult={state.chlorophyllResult}
              advisoryResult={state.advisoryResult}
              synthesisResult={state.synthesisResult}
            />

            {/* Live LangGraph Trace */}
            <div className="flex-1 min-h-[260px]">
              <AgentTrace
                steps={state.traceSteps}
                isStreaming={state.isStreaming}
                presentationMode={presentationMode}
              />
            </div>

            {/* HAB Favourability Signal Assessment */}
            {state.habAssessment && (
              <RiskSignal assessment={state.habAssessment} />
            )}
          </div>
        </div>

        {/* Middle: Dashboard Metrics Summary */}
        <MetricCardRow
          sstResult={state.sstResult}
          chlorophyllResult={state.chlorophyllResult}
          habAssessment={state.habAssessment}
        />

        {/* Bottom: Query Presets & Command Center Chat */}
        <div className="flex flex-col gap-2">
          <QueryPresets onSelect={(q) => submitQuestion(q)} disabled={state.isStreaming} />
          <ChatPanel state={state} onSubmit={(q) => submitQuestion(q)} />
        </div>
      </div>

      {/* 4. Data Provenance Drawer */}
      <DataProvenanceDrawer
        isOpen={provenanceOpen}
        onClose={() => setProvenanceOpen(false)}
      />
    </main>
  );
}
