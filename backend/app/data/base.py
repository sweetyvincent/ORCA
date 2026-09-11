from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
from backend.app.models.schemas import LocationResolved

class MarineDataProvider(ABC):
    @abstractmethod
    async def fetch(self, location: LocationResolved, timeframe: Optional[str] = None) -> Dict[str, Any]:
        """Fetch real data for given resolved location and timeframe."""
        pass

    @abstractmethod
    def provider_name(self) -> str:
        pass
