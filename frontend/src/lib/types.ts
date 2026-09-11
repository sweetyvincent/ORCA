export interface RegionBbox {
  min_lat: number;
  max_lat: number;
  min_lon: number;
  max_lon: number;
}

export interface Timeframe {
  start: string;
  end: string;
}

export interface LocationResolved {
  location_name: string;
  latitude: number;
  longitude: number;
  region_bbox: RegionBbox;
  timeframe: Timeframe;
  coastal_zone?: string;
  confidence: number;
}

export interface RouterDecision {
  agents: string[];
  reasoning: string;
  needs_synthesis: boolean;
  needs_advisory: boolean;
}

export interface DataSourceMeta {
  provider: string;
  dataset: string;
  resolution: string;
  accessed_at: string;
  status: "live" | "cached" | "degraded" | "fallback";
  freshness_label: string;
}

export interface SSTObservationPoint {
  timestamp: string;
  sst_c: number | null;
  anom_c: number | null;
}

export interface SSTTrend {
  period_days: number;
  slope_c_per_day: number;
  direction: "warming" | "cooling" | "stable";
  confidence_r2?: number;
}

export interface SSTLatest {
  value_c: number;
  timestamp: string;
}

export interface SSTAnomaly {
  value_c: number;
  baseline: string;
}

export interface SSTResult {
  agent: "sst";
  status: "success" | "warning" | "error";
  location: { name: string; lat: number; lon: number };
  latest?: SSTLatest;
  trend?: SSTTrend;
  anomaly?: SSTAnomaly;
  source: DataSourceMeta;
  confidence_note: string;
  time_series: SSTObservationPoint[];
  raw_request?: string;
  error_message?: string;
}

export interface ChlorophyllObservationPoint {
  timestamp: string;
  chlorophyll_mg_m3: number | null;
  is_missing_or_cloud: boolean;
}

export interface ChlorophyllTrend {
  period_days: number;
  direction: "elevating" | "declining" | "stable" | "insufficient_data";
  delta_mg_m3: number;
}

export interface ChlorophyllLatest {
  chlorophyll_mg_m3: number;
  timestamp: string;
}

export interface ChlorophyllBaseline {
  relative_status: "baseline" | "elevated" | "high" | "sparse";
  percentile_estimate?: number;
  reference: string;
}

export interface ChlorophyllQuality {
  valid_obs_pct: number;
  cloud_gap_detected: boolean;
  gap_filled: boolean;
}

export interface ChlorophyllResult {
  agent: "chlorophyll";
  status: "success" | "warning" | "error";
  location: { name: string; lat: number; lon: number };
  latest?: ChlorophyllLatest;
  trend?: ChlorophyllTrend;
  baseline_comparison?: ChlorophyllBaseline;
  data_quality: ChlorophyllQuality;
  source: DataSourceMeta;
  confidence_note: string;
  time_series: ChlorophyllObservationPoint[];
  raw_request?: string;
  error_message?: string;
}

export interface AdvisoryItem {
  title: string;
  region: string;
  severity: "advisory" | "watch" | "warning" | "info";
  issued_at: string;
  source: string;
  description: string;
  advisory_type: string;
}

export interface AdvisoryResult {
  agent: "advisory";
  status: "success" | "warning" | "error";
  active_advisories: AdvisoryItem[];
  source: DataSourceMeta;
  timestamp: string;
  summary: string;
}

export interface HABFactor {
  name: string;
  effect: "supporting" | "neutral" | "mitigating" | "unknown";
  evidence: string;
  weight: number;
}

export interface HABAssessment {
  classification: "LOW" | "MODERATE" | "ELEVATED" | "HIGHER CONCERN";
  score: number;
  factors: HABFactor[];
  regional_context: string;
  limitations: string[];
  computed_at: string;
}

export interface SynthesisResult {
  natural_language_summary: string;
  favourability_headline: string;
  sst_findings?: string;
  chlorophyll_findings?: string;
  advisory_findings?: string;
  combined_reasoning: string;
  scientific_uncertainties: string[];
  citations: Array<{
    name: string;
    provider: string;
    dataset: string;
    timestamp: string;
  }>;
  generated_at: string;
}

export type TraceNodeStatus = "queued" | "running" | "success" | "warning" | "error";

export interface AgentTraceStep {
  id: string;
  title: string;
  subtitle?: string;
  status: TraceNodeStatus;
  timestamp?: string;
  details?: any;
}

export interface StreamEvent {
  type: string;
  node?: string;
  data?: any;
  timestamp?: string;
}

export interface ORCAPipelineState {
  isStreaming: boolean;
  question: string;
  location: LocationResolved | null;
  routerDecision: RouterDecision | null;
  sstResult: SSTResult | null;
  chlorophyllResult: ChlorophyllResult | null;
  advisoryResult: AdvisoryResult | null;
  habAssessment: HABAssessment | null;
  synthesisResult: SynthesisResult | null;
  traceSteps: AgentTraceStep[];
  error: string | null;
}
