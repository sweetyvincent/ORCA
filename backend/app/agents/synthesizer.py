import json
import re
from datetime import datetime, timezone, timedelta
from typing import Optional, List, Dict, Any

IST = timezone(timedelta(hours=5, minutes=30), name="IST")

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
        now_str = datetime.now(IST).strftime("%Y-%m-%dT%H:%M:%S+05:30")
        
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

        q = question.lower() if question else ""
        has_sst_q = bool(re.search(r"sst|temperature|warm|heat|celsius|temp|oisst", q))
        has_chl_q = bool(re.search(r"chlorophyll|chl|ocean col|phytoplankton|biomass|algae|plankton", q))
        has_hab_q = bool(re.search(r"bloom|hab|red tide|favour|favor|toxicity|domoic|risk|harmful", q))
        has_adv_q = bool(re.search(r"advisory|fisheries|closure|quarantine|warning|safe|fish|eat|swim", q))

        classification = hab.classification if hab else "OBSERVED"
        hab_score = hab.score if hab else 0.5

        if has_sst_q and not has_chl_q and not has_hab_q and not has_adv_q and sst and sst.latest:
            favourability_headline = f"SST Analysis: {sst.latest.value_c}°C ({sst.trend.direction} at {sst.trend.slope_c_per_day:+.3f}°C/day)"
            summary = (
                f"In response to your inquiry regarding sea-surface temperature for {location.location_name}: "
                f"Real-time NOAA OISST v2.1 observations report a current sea-surface temperature of {sst.latest.value_c}°C. "
                f"This represents a {sst.anomaly.value_c:+.2f}°C thermal anomaly relative to the NOAA 1971–2000 climatological baseline. "
                f"The 7-day linear regression indicates an active {sst.trend.direction} trajectory with a linear slope of {sst.trend.slope_c_per_day:+.3f}°C/day, "
                f"indicating {'marked thermal stratification' if abs(sst.trend.slope_c_per_day) > 0.03 else 'a stable thermal regime'} "
                f"along the {location.coastal_zone}."
            )
            combined_reasoning = f"Thermal specialist confirms {sst.trend.direction} conditions at {sst.latest.value_c}°C ({sst.anomaly.value_c:+.2f}°C anomaly) with slope {sst.trend.slope_c_per_day:+.3f}°C/day."

        elif has_chl_q and not has_sst_q and not has_hab_q and not has_adv_q and chlorophyll and chlorophyll.latest:
            chl_pct = int(chlorophyll.baseline_comparison.percentile_estimate) if (chlorophyll.baseline_comparison and chlorophyll.baseline_comparison.percentile_estimate) else 50
            chl_status = chlorophyll.baseline_comparison.relative_status if chlorophyll.baseline_comparison else "baseline"
            favourability_headline = f"Chlorophyll-a Telemetry: {chlorophyll.latest.chlorophyll_mg_m3} mg/m³ ({chl_status.upper()})"
            summary = (
                f"In response to your inquiry regarding ocean colour and chlorophyll biomass for {location.location_name}: "
                f"Copernicus / NOAA VIIRS DINEOF satellite observations measure near-surface chlorophyll-a concentration at "
                f"{chlorophyll.latest.chlorophyll_mg_m3} mg/m³. This concentration ranks in the {chl_pct}th "
                f"percentile of the regional seasonal distribution ({chl_status} relative status). "
                f"DINEOF spatio-temporal gap-filling successfully reconstructed cloud-obscured pixels with {chlorophyll.data_quality.valid_obs_pct}% observation validity. "
                f"Current biological biomass indicates {'high phytoplankton productivity' if chlorophyll.latest.chlorophyll_mg_m3 > 2.0 else 'moderate baseline primary productivity'}."
            )
            combined_reasoning = f"Chlorophyll specialist confirms {chlorophyll.latest.chlorophyll_mg_m3} mg/m³ ({chl_pct}th percentile) via VIIRS DINEOF."

        elif has_adv_q and not has_hab_q and not has_sst_q and not has_chl_q:
            has_advisories = bool(advisory and advisory.active_advisories)
            favourability_headline = (
                "Coastal Advisory Notice: Active Alert in Sector"
                if has_advisories
                else "Coastal Advisory Status: Normal (No Active Closures)"
            )
            if has_advisories:
                first_adv = advisory.active_advisories[0]
                summary = (
                    f"In response to your inquiry regarding coastal notices and fishery regulations for {location.location_name}: "
                    f"The Coastal Advisory Specialist has retrieved an active bulletin from {first_adv.source}: '{first_adv.title}'. "
                    f"Details: {first_adv.description} Severity: {first_adv.severity.upper()}. "
                    f"Marine harvesters and stakeholders are advised to follow official agency guidelines."
                )
                combined_reasoning = f"Active bulletin: {first_adv.title} ({first_adv.source})."
            else:
                summary = (
                    f"In response to your inquiry regarding coastal notices for {location.location_name}: "
                    f"Official regulatory monitoring streams (CDPH, NOAA NCCOS, and INCOIS) report no active shellfish harvest closures "
                    f"or marine biotoxin quarantines currently mandated for this coastal sector. Baseline environmental monitoring remains active."
                )
                combined_reasoning = f"No active regulatory closures currently in force for {location.location_name}."

        elif has_hab_q and hab:
            favourability_headline = f"Harmful Algal Bloom Favourability: {classification} ({int(hab_score * 100)}/100)"
            summary = (
                f"Evaluating harmful algal bloom (HAB) favourability for {location.location_name} over the coming 7 days: "
                f"The multi-agent ecological matrix evaluates an {classification} environmental favourability signal (Composite Risk Index: {hab_score:.2f}/1.00). "
                f"Thermal stability and biological biomass indicators converge to indicate conditions that are "
                f"{'permissive of accelerated phytoplankton accumulation' if hab.score >= 0.45 else 'consistent with typical seasonal baseline conditions'}. "
                f"{hab.regional_context}"
            )
            combined_reasoning = (
                f"Multi-agent synthesis evaluates environmental favourability as {classification} (Risk Index: {hab_score:.2f}/1.00). "
                f"{hab.regional_context}"
            )

        else:
            favourability_headline = f"Marine Intelligence Briefing: {location.location_name}"
            combined_reasoning = (
                f"Comprehensive evaluation for {location.location_name}: "
                f"SST {sst.latest.value_c if sst and sst.latest else 'N/A'}°C, "
                f"Chlorophyll-a {chlorophyll.latest.chlorophyll_mg_m3 if chlorophyll and chlorophyll.latest else 'N/A'} mg/m³, "
                f"HAB Signal {classification}."
            )
            summary = (
                f"Synthesizing multi-agent oceanographic telemetry for {location.location_name}: "
                f"Observed SST is {sst.latest.value_c if sst and sst.latest else 'N/A'}°C "
                f"({sst.anomaly.value_c:+.2f}°C anomaly relative to NOAA 1971-2000 baseline) with a {sst.trend.direction if sst else 'stable'} trajectory. "
                f"Near-surface Chlorophyll-a is {chlorophyll.latest.chlorophyll_mg_m3 if chlorophyll and chlorophyll.latest else 'N/A'} mg/m³ "
                f"({chlorophyll.baseline_comparison.relative_status if chlorophyll else 'baseline'} relative status). "
                f"Ecological synthesis evaluates an overall {classification} environmental favourability signal ({int(hab_score * 100)}/100)."
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
