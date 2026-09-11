"use client";

import React, { useState, useEffect } from "react";
import { TacticalHeader } from "../components/TacticalHeader";
import { TargetZoneSelector } from "../components/TargetZoneSelector";
import { OceanGlobe } from "../components/OceanGlobe";
import { SpecialistWorkbench } from "../components/SpecialistWorkbench";
import { AgentNetwork } from "../components/AgentNetwork";
import { AgentTrace } from "../components/AgentTrace";
import { HABDecisionSupport } from "../components/HABDecisionSupport";
import { TacticalConsole } from "../components/TacticalConsole";
import { DataProvenanceDrawer } from "../components/DataProvenanceDrawer";
import { HeroSequence } from "../components/HeroSequence";
import { useORCAStream } from "../hooks/useORCAStream";

export default function ORCAMissionControl() {
  const [showHero, setShowHero] = useState(true);
  const [presentationMode, setPresentationMode] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const [provenanceOpen, setProvenanceOpen] = useState(false);

  const { state, submitQuestion } = useORCAStream();

  // If demo mode is enabled and no query has run, automatically run California HAB query
  useEffect(() => {
    if (demoMode && !state.question && !state.isStreaming) {
      submitQuestion("Will conditions favour a harmful algal bloom near California next week?");
    }
  }, [demoMode, state.question, state.isStreaming, submitQuestion]);

  const handleSelectSector = (sectorName: string, query: string) => {
    submitQuestion(query);
  };

  return (
    <main className="min-h-screen bg-[#020710] text-slate-100 flex flex-col relative selection:bg-bioglow-cyan selection:text-ocean-950 font-mono">
      {/* 1. Cinematic Hero Entry */}
      {showHero && <HeroSequence onDismiss={() => setShowHero(false)} />}

      {/* 2. Tactical Mission Header */}
      <TacticalHeader
        presentationMode={presentationMode}
        setPresentationMode={setPresentationMode}
        demoMode={demoMode}
        setDemoMode={setDemoMode}
        onOpenProvenance={() => setProvenanceOpen(true)}
      />

      {/* 3. Primary Command Center Canvas */}
      <div className="flex-1 max-w-[1780px] w-full mx-auto p-3 lg:p-5 flex flex-col gap-4">
        {/* Quick Coastal Mission Target Selector */}
        <TargetZoneSelector
          onSelectZone={handleSelectSector}
          currentZone={state.location?.location_name}
          disabled={state.isStreaming}
        />

        {/* Dual-Column Strategic Mission Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* LEFT STRATEGIC SECTOR: 3D Geospatial Globe & Heterogeneous Data Streams */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {/* 3D Earth Ocean Telemetry Globe */}
            <div className="h-[390px] lg:h-[440px] w-full">
              <OceanGlobe
                location={state.location}
                sstResult={state.sstResult}
                chlorophyllResult={state.chlorophyllResult}
                presentationMode={presentationMode}
              />
            </div>

            {/* Specialist Heterogeneous Workbench */}
            <SpecialistWorkbench
              sstResult={state.sstResult}
              chlorophyllResult={state.chlorophyllResult}
              advisoryResult={state.advisoryResult}
            />
          </div>

          {/* RIGHT STRATEGIC SECTOR: LangGraph Architecture & Scientific Decision Support */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {/* LangGraph Multi-Agent Topology */}
            <AgentNetwork
              isStreaming={state.isStreaming}
              routerDecision={state.routerDecision}
              sstResult={state.sstResult}
              chlorophyllResult={state.chlorophyllResult}
              advisoryResult={state.advisoryResult}
              synthesisResult={state.synthesisResult}
            />

            {/* Live LangGraph Trace */}
            <div className="min-h-[260px]">
              <AgentTrace
                steps={state.traceSteps}
                isStreaming={state.isStreaming}
                presentationMode={presentationMode}
              />
            </div>

            {/* HAB Environmental Favourability Decision Support Deck */}
            <HABDecisionSupport
              habAssessment={state.habAssessment}
              synthesisResult={state.synthesisResult}
              sstResult={state.sstResult}
              chlorophyllResult={state.chlorophyllResult}
              advisoryResult={state.advisoryResult}
            />
          </div>
        </div>

        {/* Tactical Mission Input Console */}
        <div className="w-full mt-1">
          <TacticalConsole
            isStreaming={state.isStreaming}
            onSubmit={(q) => submitQuestion(q)}
            currentQuery={state.question}
          />
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
