import json
from datetime import datetime
from typing import Optional, List, Dict, Any

from backend.app.config import settings
from backend.app.models.schemas import (
    LocationResolved,
    SSTResult,
    ChlorophyllResult,
    AdvisoryResult,
    HABAssessment,
    SynthesisResult
)

class SynthesizerAgent:
    """
    Synthesizes structured evidence into a transparent, scientifically-grounded narrative.
    Strictly separates observed measurements from derived inferences and states limitations.
    Uses Anthropic Claude API when configured, with high-fidelity deterministic fallback.
    """

    async def synthesize(
        self,
        question: str,
        location: LocationResolved,
        sst: Optional[SSTResult] = None,
        chlorophyll: Optional[ChlorophyllResult] = None,
        advisory: Optional[AdvisoryResult] = None,
        hab: Optional[HABAssessment] = None
    ) -> SynthesisResult:
        now_str = datetime.utcnow().isoformat() + "Z"
        
        # Check if Claude API key is configured
        if settings.ANTHROPIC_API_KEY:
            try:
                return await self._call_claude(
                    question=question,
                    location=location,
                    sst=sst,
                    chlorophyll=chlorophyll,
                    advisory=advisory,
                    hab=hab,
                    now_str=now_str
                )
            except Exception as e:
                print(f"[SYNTHESIZER] Claude API error ({e}), engaging scientific fallback synthesizer.")

        return self._deterministic_scientific_synthesis(
            question=question,
            location=location,
            sst=sst,
            chlorophyll=chlorophyll,
            advisory=advisory,
            hab=hab,
            now_str=now_str
        )

    async def _call_claude(
        self,
        question: str,
        location: LocationResolved,
        sst: Optional[SSTResult],
        chlorophyll: Optional[ChlorophyllResult],
        advisory: Optional[AdvisoryResult],
        hab: Optional[HABAssessment],
        now_str: str
    ) -> SynthesisResult:
        import anthropic
        client = anthropic.AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)

        evidence_payload = {
            "location": location.model_dump(),
            "sst_evidence": sst.model_dump() if sst else None,
            "chlorophyll_evidence": chlorophyll.model_dump() if chlorophyll else None,
            "advisory_evidence": advisory.model_dump() if advisory else None,
            "deterministic_hab_classification": hab.model_dump() if hab else None
        }

        system_prompt = """You are ORCA, an advanced marine intelligence scientific synthesizer.
Your task is to synthesize oceanographic specialist evidence into a transparent, cautious scientific assessment.

NON-NEGOTIABLE SCIENTIFIC RULES:
1. Ground every statement strictly in the provided JSON evidence. NEVER invent numbers or measurements.
2. Explicitly cite which specialist agent supplied each finding.
3. Clearly distinguish OBSERVED DATA (raw measurements) from DERIVED SIGNALS (trends, anomalies) and INFERENCE.
4. If HAB favourability is evaluated, state clearly: "This is an environmental favourability signal, not a confirmed HAB forecast."
5. Return ONLY a valid JSON object matching the requested schema.
"""

        user_prompt = f"""Question: {question}

Specialist Evidence:
{json.dumps(evidence_payload, indent=2)}

Format response as a JSON object with keys:
- "natural_language_summary": string
- "favourability_headline": string (e.g. "Environmental Favourability: ELEVATED")
- "sst_findings": string summary of SST agent evidence
- "chlorophyll_findings": string summary of Chlorophyll agent evidence
- "advisory_findings": string summary of Advisory agent evidence or null
- "combined_reasoning": string detailing how physical and biological factors interact
- "scientific_uncertainties": array of strings listing critical unknowns
- "citations": array of objects {{"name": "...", "provider": "...", "dataset": "...", "timestamp": "..."}}
"""

        response = await client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=1500,
            system=system_prompt,
            messages=[{"role": "user", "content": user_prompt}]
        )

        content = response.content[0].text.strip()
        # Clean JSON markdown fences if present
        if content.startswith("```json"):
            content = content[7:]
        if content.endswith("```"):
            content = content[:-3]
        parsed = json.loads(content.strip())

        return SynthesisResult(
            natural_language_summary=parsed.get("natural_language_summary", ""),
            favourability_headline=parsed.get("favourability_headline", f"Environmental Favourability: {hab.classification if hab else 'ASSESSED'}"),
            sst_findings=parsed.get("sst_findings"),
            chlorophyll_findings=parsed.get("chlorophyll_findings"),
            advisory_findings=parsed.get("advisory_findings"),
            combined_reasoning=parsed.get("combined_reasoning", ""),
            scientific_uncertainties=parsed.get("scientific_uncertainties", []),
            citations=parsed.get("citations", []),
            generated_at=now_str
        )

    def _deterministic_scientific_synthesis(
        self,
        question: str,
        location: LocationResolved,
        sst: Optional[SSTResult],
        chlorophyll: Optional[ChlorophyllResult],
        advisory: Optional[AdvisoryResult],
        hab: Optional[HABAssessment],
        now_str: str
    ) -> SynthesisResult:
        sst_text = None
        chl_text = None
        adv_text = None
        citations = []

        if sst and sst.latest:
            sst_text = (
                f"SST Agent observed sea-surface temperature of {sst.latest.value_c}°C "
                f"with a {sst.trend.direction} trajectory ({sst.trend.slope_c_per_day:+.3f}°C/day) "
                f"and an anomaly of {sst.anomaly.value_c:+.2f}°C relative to the NOAA OISST v2.1 1971-2000 climatological baseline."
            )
            citations.append({
                "name": "SST Specialist",
                "provider": sst.source.provider,
                "dataset": sst.source.dataset,
                "timestamp": sst.latest.timestamp
            })

        if chlorophyll and chlorophyll.latest:
            chl_text = (
                f"Chlorophyll Agent observed near-surface chlorophyll-a concentration of "
                f"{chlorophyll.latest.chlorophyll_mg_m3} mg/m³ ({chlorophyll.baseline_comparison.relative_status} relative status) "
                f"with a {chlorophyll.trend.direction} trend ({chlorophyll.trend.delta_mg_m3:+.3f} mg/m³ over {chlorophyll.trend.period_days} days). "
                f"Observation validity: {chlorophyll.data_quality.valid_obs_pct}%."
            )
            citations.append({
                "name": "Chlorophyll Specialist",
                "provider": chlorophyll.source.provider,
                "dataset": chlorophyll.source.dataset,
                "timestamp": chlorophyll.latest.timestamp
            })

        if advisory and advisory.active_advisories:
            adv_titles = "; ".join([a.title for a in advisory.active_advisories[:2]])
            adv_text = f"Advisory Specialist identified active notices in sector: {adv_titles}."
            citations.append({
                "name": "Coastal Advisory Specialist",
                "provider": advisory.source.provider,
                "dataset": advisory.source.dataset,
                "timestamp": advisory.timestamp
            })

        classification = hab.classification if hab else "OBSERVED"
        favourability_headline = f"Environmental Favourability: {classification}"

        combined_reasoning = ""
        if hab:
            combined_reasoning = (
                f"Multi-agent synthesis evaluates the environmental favourability as {classification} (Risk Index: {hab.score:.2f}/1.00). "
                f"Thermal stability and biological biomass indicators converge to indicate conditions that are "
                f"{'permissive of accelerated phytoplankton accumulation' if hab.score >= 0.45 else 'consistent with typical seasonal baseline conditions'}. "
                f"{hab.regional_context}"
            )
        elif sst_text:
            combined_reasoning = "Thermal analysis complete. Stable or moderate thermal conditions observed without biological co-indicators requested."
        elif chl_text:
            combined_reasoning = "Bio-optical ocean colour assessment complete. Chlorophyll concentrations evaluated across coastal grid cells."

        summary = (
            f"Based on real-time satellite telemetry for {location.location_name}, "
            f"{combined_reasoning} "
            f"Observed SST is {sst.latest.value_c if sst and sst.latest else 'N/A'}°C, and "
            f"Chlorophyll-a is {chlorophyll.latest.chlorophyll_mg_m3 if chlorophyll and chlorophyll.latest else 'N/A'} mg/m³."
        )

        uncertainties = [
            "Thermal and optical satellite sensors sample the immediate sea surface and do not detect subsurface thin layers or internal waves.",
            "Satellite ocean colour measures total chlorophyll-a pigment; it does not differentiate between toxic species (e.g., Pseudo-nitzschia) and benign diatoms.",
            "Water column nutrient stoichiometry (N:P:Si ratios) and dissolved oxygen require in-situ shipboard or mooring validation."
        ]

        return SynthesisResult(
            natural_language_summary=summary,
            favourability_headline=favourability_headline,
            sst_findings=sst_text,
            chlorophyll_findings=chl_text,
            advisory_findings=adv_text,
            combined_reasoning=combined_reasoning,
            scientific_uncertainties=uncertainties,
            citations=citations,
            generated_at=now_str
        )

synthesizer_agent = SynthesizerAgent()
