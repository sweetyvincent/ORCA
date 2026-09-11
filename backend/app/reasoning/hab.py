from datetime import datetime, timezone, timedelta
from typing import Dict, Any, Optional, List, Tuple

IST = timezone(timedelta(hours=5, minutes=30), name="IST")
from backend.app.models.schemas import (
    SSTResult,
    ChlorophyllResult,
    AdvisoryResult,
    HABAssessment,
    HABFactor
)

# Regional thresholds and ecological sensitivity matrix
REGIONAL_HAB_CONFIG = {
    "california": {
        "name": "California Current Ecosystem",
        "chl_baseline_mg_m3": 1.2,
        "chl_elevated_mg_m3": 2.2,
        "sst_warming_threshold_c_per_day": 0.03,
        "sst_warm_anomaly_c": 0.8,
        "key_species": "Pseudo-nitzschia spp. (Domoic acid / ASP), Alexandrium catenella (PSP)",
        "mechanism": "Post-upwelling relaxation followed by coastal thermal stratification and nutrient retention."
    },
    "arabian sea": {
        "name": "Arabian Sea Upwelling & Monsoon Zone",
        "chl_baseline_mg_m3": 0.6,
        "chl_elevated_mg_m3": 1.5,
        "sst_warming_threshold_c_per_day": 0.04,
        "sst_warm_anomaly_c": 0.7,
        "key_species": "Noctiluca scintillans (green/red), Trichodesmium erythraeum",
        "mechanism": "Thermal stratification coupled with monsoon nutrient runoff and hypoxic subsurface waters."
    },
    "kerala": {
        "name": "Malabar Coast Upwelling System",
        "chl_baseline_mg_m3": 0.8,
        "chl_elevated_mg_m3": 1.8,
        "sst_warming_threshold_c_per_day": 0.03,
        "sst_warm_anomaly_c": 0.6,
        "key_species": "Noctiluca scintillans, Cochlodinium polykrikoides",
        "mechanism": "Coastal upwelling during southwest monsoon transition followed by surface insolation."
    },
    "mumbai": {
        "name": "Konkan Coastal Shelf",
        "chl_baseline_mg_m3": 0.9,
        "chl_elevated_mg_m3": 2.0,
        "sst_warming_threshold_c_per_day": 0.03,
        "sst_warm_anomaly_c": 0.7,
        "key_species": "Trichodesmium spp., Dinophysis spp.",
        "mechanism": "Nearshore organic loading combined with calm, warm sea-surface conditions."
    },
    "bay of bengal": {
        "name": "Bay of Bengal Stratified Basin",
        "chl_baseline_mg_m3": 0.7,
        "chl_elevated_mg_m3": 1.6,
        "sst_warming_threshold_c_per_day": 0.03,
        "sst_warm_anomaly_c": 0.6,
        "key_species": "Trichodesmium erythraeum, Gymnodinium spp.",
        "mechanism": "Freshwater riverine cap creating strong vertical stratification and rapid surface warming."
    },
    "default": {
        "name": "General Temperate / Subtropical Marine Zone",
        "chl_baseline_mg_m3": 1.0,
        "chl_elevated_mg_m3": 2.0,
        "sst_warming_threshold_c_per_day": 0.03,
        "sst_warm_anomaly_c": 0.75,
        "key_species": "Regional phytoplankton assemblage",
        "mechanism": "Combined thermal stratification and elevated chlorophyll biomass."
    }
}

class HABReasoningEngine:
    """
    Deterministic rule-based reasoning engine combining physical (SST) and biological (Chlorophyll)
    evidence streams. Evaluates risk signals using regional ecological thresholds.
    """

    def _get_regional_config(self, location_name: str) -> Dict[str, Any]:
        loc_lower = location_name.lower()
        for key, conf in REGIONAL_HAB_CONFIG.items():
            if key in loc_lower:
                return conf
        return REGIONAL_HAB_CONFIG["default"]

    def evaluate(
        self,
        location_name: str,
        sst: Optional[SSTResult] = None,
        chlorophyll: Optional[ChlorophyllResult] = None,
        advisory: Optional[AdvisoryResult] = None
    ) -> HABAssessment:
        conf = self._get_regional_config(location_name)
        factors: List[HABFactor] = []
        score = 0.1  # Baseline minimal score

        # 1. SST Evaluation
        sst_factor = None
        if sst and sst.latest:
            val_c = sst.latest.value_c
            slope = sst.trend.slope_c_per_day if sst.trend else 0.0
            direction = sst.trend.direction if sst.trend else "stable"
            anom = sst.anomaly.value_c if sst.anomaly else 0.0

            if anom >= conf["sst_warm_anomaly_c"] and direction == "warming":
                score += 0.35
                sst_factor = HABFactor(
                    name="Sea Surface Temperature (SST)",
                    effect="supporting",
                    evidence=f"Observed SST is {val_c}°C with positive anomaly (+{anom}°C) and active warming trend (+{slope}°C/day). Promotes stratification.",
                    weight=0.35
                )
            elif anom > 0 or direction == "warming":
                score += 0.20
                sst_factor = HABFactor(
                    name="Sea Surface Temperature (SST)",
                    effect="supporting",
                    evidence=f"Observed SST is {val_c}°C with mild positive anomaly (+{anom}°C). Thermal conditions are permissive.",
                    weight=0.20
                )
            elif direction == "cooling" or anom < -0.5:
                score -= 0.05
                sst_factor = HABFactor(
                    name="Sea Surface Temperature (SST)",
                    effect="mitigating",
                    evidence=f"Observed SST is {val_c}°C with negative anomaly ({anom}°C) or cooling trend ({slope}°C/day). Less favourable for thermal stratification.",
                    weight=-0.05
                )
            else:
                sst_factor = HABFactor(
                    name="Sea Surface Temperature (SST)",
                    effect="neutral",
                    evidence=f"Observed SST is {val_c}°C near seasonal climatology ({anom:+.2f}°C).",
                    weight=0.0
                )
            factors.append(sst_factor)

        # 2. Chlorophyll Evaluation
        chl_factor = None
        if chlorophyll and chlorophyll.latest:
            chla_val = chlorophyll.latest.chlorophyll_mg_m3
            chl_trend = chlorophyll.trend.direction if chlorophyll.trend else "stable"

            if chla_val >= conf["chl_elevated_mg_m3"]:
                score += 0.45
                chl_factor = HABFactor(
                    name="Chlorophyll-a Biomass",
                    effect="supporting",
                    evidence=f"Chlorophyll-a concentration is {chla_val} mg/m³ (exceeds regional threshold {conf['chl_elevated_mg_m3']} mg/m³). High phytoplankton biomass indicated.",
                    weight=0.45
                )
            elif chla_val >= conf["chl_baseline_mg_m3"] or chl_trend == "elevating":
                score += 0.25
                chl_factor = HABFactor(
                    name="Chlorophyll-a Biomass",
                    effect="supporting",
                    evidence=f"Chlorophyll-a is {chla_val} mg/m³ with {chl_trend} trajectory (baseline: {conf['chl_baseline_mg_m3']} mg/m³). Moderate accumulation.",
                    weight=0.25
                )
            else:
                chl_factor = HABFactor(
                    name="Chlorophyll-a Biomass",
                    effect="neutral",
                    evidence=f"Chlorophyll-a is {chla_val} mg/m³ within expected regional oligotrophic/seasonal baseline.",
                    weight=0.0
                )
            factors.append(chl_factor)

        # 3. Advisory Evaluation (if present)
        if advisory and advisory.active_advisories:
            adv_count = len(advisory.active_advisories)
            score += 0.15
            factors.append(HABFactor(
                name="Coastal / Fisheries Advisory",
                effect="supporting",
                evidence=f"{adv_count} active coastal advisory/surveillance bulletin(s) found in target sector: '{advisory.active_advisories[0].title}'.",
                weight=0.15
            ))

        # Clamp score between 0.0 and 1.0
        clamped_score = max(0.0, min(1.0, round(score, 2)))

        # Classification mapping
        if clamped_score >= 0.70:
            classification = "HIGHER CONCERN"
        elif clamped_score >= 0.45:
            classification = "ELEVATED"
        elif clamped_score >= 0.25:
            classification = "MODERATE"
        else:
            classification = "LOW"

        limitations = [
            "This assessment provides an environmental favourability signal based on surface satellite observations, NOT a confirmed bloom forecast.",
            "Satellite observations detect aggregate chlorophyll biomass; they cannot identify toxic species (e.g. Pseudo-nitzschia vs benign diatoms) without in-situ microscopy.",
            "Surface temperature and ocean colour reflect upper water column layers and do not account for subsurface thin layers, currents, or nutrient stoichiometry (N:P:Si ratios)."
        ]

        regional_context = f"{conf['name']}: {conf['mechanism']} Common taxa include: {conf['key_species']}."

        return HABAssessment(
            classification=classification,
            score=clamped_score,
            factors=factors,
            regional_context=regional_context,
            limitations=limitations,
            computed_at=datetime.now(IST).strftime("%Y-%m-%dT%H:%M:%S+05:30")
        )

hab_reasoning_engine = HABReasoningEngine()
