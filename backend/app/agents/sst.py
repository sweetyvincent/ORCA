from backend.app.models.schemas import LocationResolved, SSTResult
from backend.app.data.noaa_oisst import noaa_sst_provider

class SSTSpecialistAgent:
    """Specialist agent responsible for sea-surface temperature observations."""
    
    async def execute(self, location: LocationResolved, timeframe: str = "7d") -> SSTResult:
        return await noaa_sst_provider.fetch(location, timeframe)

sst_specialist = SSTSpecialistAgent()
