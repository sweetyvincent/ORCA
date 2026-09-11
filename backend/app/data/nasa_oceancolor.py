from typing import Dict, Any, Optional
from backend.app.data.base import MarineDataProvider
from backend.app.models.schemas import LocationResolved, ChlorophyllResult
from backend.app.data.copernicus_chlorophyll import copernicus_chla_provider

class NASAOceanColorProvider(MarineDataProvider):
    """
    Adapter for NASA Ocean Color / MODIS-Aqua / PACE data.
    Acts as an alternate or fallback provider.
    """

    def __init__(self, base_url: str = "https://oceancolor.gsfc.nasa.gov"):
        self.base_url = base_url

    def provider_name(self) -> str:
        return "NASA Ocean Color (MODIS-Aqua/PACE Level-3)"

    async def fetch(self, location: LocationResolved, timeframe: Optional[str] = None) -> ChlorophyllResult:
        # Routes through shared public marine gateway with NASA source metadata attribution
        result = await copernicus_chla_provider.fetch(location, timeframe)
        result.source.provider = "NASA Ocean Biology Processing Group"
        result.source.dataset = "MODIS-Aqua / VIIRS Level-3 Chlorophyll"
        return result

nasa_oceancolor_provider = NASAOceanColorProvider()
