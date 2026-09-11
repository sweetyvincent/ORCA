import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

class Settings(BaseSettings):
    # App
    PROJECT_NAME: str = "ORCA"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    
    # AI API Keys
    ANTHROPIC_API_KEY: str = Field(default_factory=lambda: os.getenv("ANTHROPIC_API_KEY", ""))
    
    # Marine Data Endpoints
    ERDDAP_OISST_URL: str = "https://coastwatch.pfeg.noaa.gov/erddap/griddap/ncdcOisst21Agg.json"
    ERDDAP_CHLA_URL: str = "https://coastwatch.pfeg.noaa.gov/erddap/griddap/nesdisVHNnoaaSNPPnoaa20NRTchlaGapfilledDaily.json"
    ERDDAP_CHLA_OPTICAL_URL: str = "https://coastwatch.pfeg.noaa.gov/erddap/griddap/nesdisVHNnoaa20chlaDaily.json"
    
    COPERNICUS_USERNAME: str = Field(default_factory=lambda: os.getenv("COPERNICUS_USERNAME", ""))
    COPERNICUS_PASSWORD: str = Field(default_factory=lambda: os.getenv("COPERNICUS_PASSWORD", ""))
    NASA_OCEANCOLOR_BASE_URL: str = "https://oceancolor.gsfc.nasa.gov"
    
    # Feature Flags
    ENABLE_ADVISORY_AGENT: bool = True
    
    # Cache & Network
    CACHE_TTL_SECONDS: int = 3600
    REQUEST_TIMEOUT_SECONDS: float = 12.0
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://127.0.0.1:3000", "*"]
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
