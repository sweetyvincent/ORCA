from typing import List, Optional, Dict, Any, Literal
from pydantic import BaseModel, Field
from datetime import datetime

class RegionBbox(BaseModel):
    min_lat: float
    max_lat: float
    min_lon: float
    max_lon: float

class Timeframe(BaseModel):
    start: str
    end: str

class LocationResolved(BaseModel):
    location_name: str
    latitude: float
    longitude: float
    region_bbox: RegionBbox
    timeframe: Timeframe
    coastal_zone: Optional[str] = None
    confidence: float = 1.0

class RouterDecision(BaseModel):
    agents: List[str]
    reasoning: str
    needs_synthesis: bool = True
    needs_advisory: bool = False

class SSTObservationPoint(BaseModel):
    timestamp: str
    sst_c: Optional[float] = None
    anom_c: Optional[float] = None

class SSTTrend(BaseModel):
    period_days: int = 7
    slope_c_per_day: float = 0.0
    direction: Literal["warming", "cooling", "stable"] = "stable"
    confidence_r2: Optional[float] = None

class SSTLatest(BaseModel):
    value_c: float
    timestamp: str

class SSTAnomaly(BaseModel):
    value_c: float
    baseline: str = "1971-2000 Climatology Baseline (NOAA OISST v2.1)"

class DataSourceMeta(BaseModel):
    provider: str
    dataset: str
    resolution: str
    accessed_at: str
    status: Literal["live", "cached", "degraded", "fallback"] = "live"
    freshness_label: str = "LIVE"

class SSTResult(BaseModel):
    agent: str = "sst"
    status: Literal["success", "warning", "error"] = "success"
    location: Dict[str, Any]
    latest: Optional[SSTLatest] = None
    trend: Optional[SSTTrend] = None
    anomaly: Optional[SSTAnomaly] = None
    source: DataSourceMeta
    confidence_note: str
    time_series: List[SSTObservationPoint] = Field(default_factory=list)
    raw_request: Optional[str] = None
    error_message: Optional[str] = None

class ChlorophyllObservationPoint(BaseModel):
    timestamp: str
    chlorophyll_mg_m3: Optional[float] = None
    is_missing_or_cloud: bool = False

class ChlorophyllTrend(BaseModel):
    period_days: int = 7
    direction: Literal["elevating", "declining", "stable", "insufficient_data"] = "stable"
    delta_mg_m3: float = 0.0

class ChlorophyllLatest(BaseModel):
    chlorophyll_mg_m3: float
    timestamp: str

class ChlorophyllBaseline(BaseModel):
    relative_status: Literal["baseline", "elevated", "high", "sparse"] = "baseline"
    percentile_estimate: Optional[float] = None
    reference: str = "Regional coastal seasonal baseline"

class ChlorophyllQuality(BaseModel):
    valid_obs_pct: float = 100.0
    cloud_gap_detected: bool = False
    gap_filled: bool = True

class ChlorophyllResult(BaseModel):
    agent: str = "chlorophyll"
    status: Literal["success", "warning", "error"] = "success"
    location: Dict[str, Any]
    latest: Optional[ChlorophyllLatest] = None
    trend: Optional[ChlorophyllTrend] = None
    baseline_comparison: Optional[ChlorophyllBaseline] = None
    data_quality: ChlorophyllQuality = Field(default_factory=ChlorophyllQuality)
    source: DataSourceMeta
    confidence_note: str
    time_series: List[ChlorophyllObservationPoint] = Field(default_factory=list)
    raw_request: Optional[str] = None
    error_message: Optional[str] = None

class AdvisoryItem(BaseModel):
    title: str
    region: str
    severity: Literal["advisory", "watch", "warning", "info"] = "info"
    issued_at: str
    source: str
    description: str
    advisory_type: str

class AdvisoryResult(BaseModel):
    agent: str = "advisory"
    status: Literal["success", "warning", "error"] = "success"
    active_advisories: List[AdvisoryItem] = Field(default_factory=list)
    source: DataSourceMeta
    timestamp: str
    summary: str

class HABFactor(BaseModel):
    name: str
    effect: Literal["supporting", "neutral", "mitigating", "unknown"]
    evidence: str
    weight: float = 1.0

class HABAssessment(BaseModel):
    classification: Literal["LOW", "MODERATE", "ELEVATED", "HIGHER CONCERN"]
    score: float = Field(ge=0.0, le=1.0)
    factors: List[HABFactor] = Field(default_factory=list)
    regional_context: str
    limitations: List[str] = Field(default_factory=list)
    computed_at: str

class SynthesisResult(BaseModel):
    natural_language_summary: str
    favourability_headline: str
    sst_findings: Optional[str] = None
    chlorophyll_findings: Optional[str] = None
    advisory_findings: Optional[str] = None
    combined_reasoning: str
    scientific_uncertainties: List[str]
    citations: List[Dict[str, str]]
    generated_at: str

class AskRequest(BaseModel):
    question: str
    conversation_id: Optional[str] = None
    demo_mode: bool = False

class StreamEvent(BaseModel):
    type: str
    node: Optional[str] = None
    data: Any = None
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat() + "Z")
