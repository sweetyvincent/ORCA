import pytest
from backend.app.reasoning.hab import hab_reasoning_engine
from backend.app.models.schemas import (
    SSTResult, SSTLatest, SSTTrend, SSTAnomaly, DataSourceMeta,
    ChlorophyllResult, ChlorophyllLatest, ChlorophyllTrend, ChlorophyllBaseline
)

def test_hab_reasoning_elevated():
    sst = SSTResult(
        agent="sst",
        status="success",
        location={"name": "California Coast", "lat": 35.2, "lon": -121.2},
        latest=SSTLatest(value_c=18.5, timestamp="2026-08-26T12:00:00Z"),
        trend=SSTTrend(period_days=7, slope_c_per_day=0.06, direction="warming"),
        anomaly=SSTAnomaly(value_c=1.2, baseline="NOAA Baseline"),
        source=DataSourceMeta(provider="NOAA", dataset="OISST", resolution="0.25", accessed_at="2026-08-26T12:00:00Z"),
        confidence_note="Test observation"
    )

    chl = ChlorophyllResult(
        agent="chlorophyll",
        status="success",
        location={"name": "California Coast", "lat": 35.2, "lon": -121.2},
        latest=ChlorophyllLatest(chlorophyll_mg_m3=2.8, timestamp="2026-08-26T12:00:00Z"),
        trend=ChlorophyllTrend(period_days=7, direction="elevating", delta_mg_m3=0.8),
        baseline_comparison=ChlorophyllBaseline(relative_status="high", percentile_estimate=90.0),
        source=DataSourceMeta(provider="Copernicus", dataset="VIIRS", resolution="2km", accessed_at="2026-08-26T12:00:00Z"),
        confidence_note="Test observation"
    )

    assessment = hab_reasoning_engine.evaluate("California Coast", sst=sst, chlorophyll=chl)
    assert assessment.classification in ["ELEVATED", "HIGHER CONCERN"]
    assert assessment.score >= 0.45
    assert len(assessment.factors) == 2
    assert any("favourability signal" in lim for lim in assessment.limitations)

def test_hab_reasoning_low():
    sst = SSTResult(
        agent="sst",
        status="success",
        location={"name": "California Coast", "lat": 35.2, "lon": -121.2},
        latest=SSTLatest(value_c=14.0, timestamp="2026-08-26T12:00:00Z"),
        trend=SSTTrend(period_days=7, slope_c_per_day=-0.04, direction="cooling"),
        anomaly=SSTAnomaly(value_c=-0.8, baseline="NOAA Baseline"),
        source=DataSourceMeta(provider="NOAA", dataset="OISST", resolution="0.25", accessed_at="2026-08-26T12:00:00Z"),
        confidence_note="Test cooling"
    )

    chl = ChlorophyllResult(
        agent="chlorophyll",
        status="success",
        location={"name": "California Coast", "lat": 35.2, "lon": -121.2},
        latest=ChlorophyllLatest(chlorophyll_mg_m3=0.3, timestamp="2026-08-26T12:00:00Z"),
        trend=ChlorophyllTrend(period_days=7, direction="declining", delta_mg_m3=-0.2),
        baseline_comparison=ChlorophyllBaseline(relative_status="sparse", percentile_estimate=20.0),
        source=DataSourceMeta(provider="Copernicus", dataset="VIIRS", resolution="2km", accessed_at="2026-08-26T12:00:00Z"),
        confidence_note="Test low"
    )

    assessment = hab_reasoning_engine.evaluate("California Coast", sst=sst, chlorophyll=chl)
    assert assessment.classification in ["LOW", "MODERATE"]
    assert assessment.score < 0.45
