import re
from typing import List
from backend.app.models.schemas import RouterDecision
from backend.app.config import settings

class RouterAgent:
    """
    Analyzes scientific intent to selectively dispatch specialized oceanographic agents.
    Avoids unnecessary multi-agent calls when a single parameter is requested.
    """

    def route(self, question: str) -> RouterDecision:
        q = question.lower()
        
        has_sst = any(kw in q for kw in ["sst", "temperature", "warm", "thermal", "heat", "celsius", "oisst"])
        has_chl = any(kw in q for kw in ["chlorophyll", "chl", "ocean colour", "ocean color", "phytoplankton", "biomass", "turbidity", "algae"])
        has_hab = any(kw in q for kw in ["bloom", "hab", "red tide", "favour", "favor", "algal", "toxicity", "domoic", "risk"])
        has_advisory = any(kw in q for kw in ["advisory", "fisheries", "closure", "quarantine", "warning", "bulletin", "shellfish", "safety"])

        agents: List[str] = []
        reasoning = ""

        # Compound HAB or bloom questions require both thermal and biological indicators
        if has_hab or (has_sst and has_chl):
            agents = ["sst", "chlorophyll"]
            if settings.ENABLE_ADVISORY_AGENT and (has_advisory or has_hab):
                agents.append("advisory")
                reasoning = "HAB favourability requires thermal stratification (SST), biological biomass (Chlorophyll-a), and official coastal health notices."
            else:
                reasoning = "Evaluating HAB favourability requires both thermal stratification (SST) and biological accumulation (Chlorophyll-a)."

        elif has_sst and not has_chl:
            agents = ["sst"]
            reasoning = "Specific thermal inquiry: Routing solely to SST Specialist for NOAA OISST v2.1 observations and trend slope."

        elif has_chl and not has_sst:
            agents = ["chlorophyll"]
            reasoning = "Specific ocean colour inquiry: Routing solely to Chlorophyll Specialist for satellite bio-optical measurements."

        elif has_advisory:
            agents = ["advisory"]
            reasoning = "Regulatory/coastal advisory inquiry: Routing to Coastal & Fisheries Advisory Specialist."

        else:
            # Default for general ocean condition queries: comprehensive dual-specialist check
            agents = ["sst", "chlorophyll"]
            if settings.ENABLE_ADVISORY_AGENT:
                agents.append("advisory")
            reasoning = "Comprehensive marine status query: Dispatching SST, Chlorophyll, and Advisory specialists for multi-stream synthesis."

        return RouterDecision(
            agents=agents,
            reasoning=reasoning,
            needs_synthesis=len(agents) > 1 or has_hab,
            needs_advisory="advisory" in agents
        )

router_agent = RouterAgent()
