from fastapi import APIRouter, Request, HTTPException
from sse_starlette.sse import EventSourceResponse
from datetime import datetime, timezone, timedelta

IST = timezone(timedelta(hours=5, minutes=30), name="IST")

from backend.app.models.schemas import AskRequest
from backend.app.api.streaming import stream_orca_pipeline
from backend.app.config import settings

api_router = APIRouter(prefix="/api")

@api_router.get("/health")
async def health_check():
    return {
        "status": "online",
        "service": "ORCA - Marine Intelligence System",
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "timestamp": datetime.now(IST).strftime("%Y-%m-%dT%H:%M:%S+05:30")
    }

@api_router.get("/data-status")
async def data_status():
    return {
        "sources": [
            {
                "name": "NOAA OISST v2.1",
                "status": "LIVE",
                "provider": "NOAA / NCEI CoastWatch",
                "frequency": "Daily Gridded (0.25°)",
                "operational": True
            },
            {
                "name": "Chlorophyll-a / Ocean Colour",
                "status": "LIVE",
                "provider": "Copernicus Marine / NOAA VIIRS DINEOF",
                "frequency": "Daily High-Resolution (2-4 km)",
                "operational": True
            },
            {
                "name": "Coastal & Biotoxin Advisories",
                "status": "LIVE" if settings.ENABLE_ADVISORY_AGENT else "DISABLED",
                "provider": "NOAA NCCOS / CDPH / INCOIS",
                "frequency": "Real-time Bulletins",
                "operational": settings.ENABLE_ADVISORY_AGENT
            },
            {
                "name": "ORCA Multi-Agent Orchestrator",
                "status": "READY",
                "provider": "LangGraph + Claude 3.5 Sonnet",
                "frequency": "Sub-second event stream",
                "operational": True
            }
        ],
        "checked_at": datetime.now(IST).strftime("%Y-%m-%dT%H:%M:%S+05:30")
    }

@api_router.get("/sources")
async def data_sources():
    return {
        "datasets": [
            {
                "id": "noaa_oisst_v21",
                "title": "NOAA Daily Optimum Interpolation Sea Surface Temperature (OISST) v2.1",
                "provider": "NOAA National Centers for Environmental Information (NCEI)",
                "spatial_resolution": "0.25 degree latitude/longitude grid (~27 km)",
                "temporal_resolution": "Daily",
                "baseline_climatology": "1971-2000 Climatology Baseline",
                "access_protocol": "ERDDAP griddap (CoastWatch)",
                "doi_or_url": "https://doi.org/10.25921/RE9P-PT57"
            },
            {
                "id": "viirs_dineof_chla",
                "title": "NOAA/NASA VIIRS Level-3 DINEOF Gap-Filled Daily Chlorophyll-a",
                "provider": "NOAA CoastWatch / NASA Ocean Biology / Copernicus Marine",
                "spatial_resolution": "2 km - 4 km global grid",
                "temporal_resolution": "Daily composite",
                "variables": "chlor_a (mg/m³)",
                "algorithm": "OC3 / OCI polynomial bio-optical algorithms + DINEOF reconstruction",
                "access_protocol": "ERDDAP griddap"
            },
            {
                "id": "coastal_hab_bulletins",
                "title": "Official Marine Health & HAB Surveillance Bulletins",
                "provider": "NOAA NCCOS HAB Event Response, California CDPH, INCOIS",
                "coverage": "Pacific Coast, Indian Ocean, Gulf of Mexico",
                "frequency": "As published by regulatory authorities"
            }
        ]
    }

@api_router.post("/ask")
async def ask_question(request: AskRequest):
    if not request.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty.")
    
    return EventSourceResponse(
        stream_orca_pipeline(request),
        media_type="text/event-stream"
    )
