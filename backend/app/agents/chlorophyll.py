from backend.app.models.schemas import LocationResolved, ChlorophyllResult
from backend.app.data.copernicus_chlorophyll import copernicus_chla_provider

class ChlorophyllSpecialistAgent:
    """Specialist agent responsible for satellite ocean colour and chlorophyll-a observations."""
    
    async def execute(self, location: LocationResolved, timeframe: str = "7d") -> ChlorophyllResult:
        return await copernicus_chla_provider.fetch(location, timeframe)

chlorophyll_specialist = ChlorophyllSpecialistAgent()
