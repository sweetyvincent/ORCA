from backend.app.models.schemas import LocationResolved, AdvisoryResult
from backend.app.data.advisory_source import coastal_advisory_provider

class CoastalAdvisoryAgent:
    """Specialist agent responsible for coastal biotoxin, fisheries, and public health advisories."""
    
    async def execute(self, location: LocationResolved) -> AdvisoryResult:
        return await coastal_advisory_provider.fetch(location)

coastal_advisory_agent = CoastalAdvisoryAgent()
