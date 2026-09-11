import re
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
from backend.app.models.schemas import LocationResolved, RegionBbox, Timeframe

# Curated high-precision coastal database
KNOWN_COASTAL_REGIONS = {
    "california": {
        "name": "California Coast",
        "lat": 35.2,
        "lon": -121.2,
        "bbox": RegionBbox(min_lat=33.5, max_lat=37.5, min_lon=-123.5, max_lon=-119.5),
        "coastal_zone": "California Current System (NE Pacific)"
    },
    "kerala": {
        "name": "Kerala Coast",
        "lat": 9.9,
        "lon": 75.8,
        "bbox": RegionBbox(min_lat=8.2, max_lat=11.8, min_lon=74.5, max_lon=76.8),
        "coastal_zone": "Malabar Upwelling Zone (Arabian Sea)"
    },
    "mumbai": {
        "name": "Mumbai Coast",
        "lat": 18.9,
        "lon": 72.6,
        "bbox": RegionBbox(min_lat=18.0, max_lat=19.8, min_lon=71.5, max_lon=73.2),
        "coastal_zone": "Konkan Coastal Shelf (Central Eastern Arabian Sea)"
    },
    "arabian sea": {
        "name": "Arabian Sea",
        "lat": 15.0,
        "lon": 68.0,
        "bbox": RegionBbox(min_lat=10.0, max_lat=22.0, min_lon=60.0, max_lon=74.0),
        "coastal_zone": "Northern Indian Ocean Basin"
    },
    "bay of bengal": {
        "name": "Bay of Bengal",
        "lat": 14.5,
        "lon": 85.0,
        "bbox": RegionBbox(min_lat=10.0, max_lat=20.0, min_lon=80.0, max_lon=92.0),
        "coastal_zone": "Eastern Indian Ocean Marine Shelf"
    },
    "florida": {
        "name": "Florida Gulf Coast",
        "lat": 27.5,
        "lon": -83.2,
        "bbox": RegionBbox(min_lat=25.5, max_lat=29.5, min_lon=-85.0, max_lon=-82.0),
        "coastal_zone": "West Florida Shelf (Gulf of Mexico)"
    },
    "goa": {
        "name": "Goa Coast",
        "lat": 15.4,
        "lon": 73.5,
        "bbox": RegionBbox(min_lat=14.8, max_lat=16.0, min_lon=72.8, max_lon=74.0),
        "coastal_zone": "Central West Coast of India"
    },
    "chennai": {
        "name": "Chennai Coast",
        "lat": 13.1,
        "lon": 80.4,
        "bbox": RegionBbox(min_lat=12.2, max_lat=14.0, min_lon=79.8, max_lon=81.2),
        "coastal_zone": "Coromandel Coast (SW Bay of Bengal)"
    },
    "monterey": {
        "name": "Monterey Bay",
        "lat": 36.6,
        "lon": -122.0,
        "bbox": RegionBbox(min_lat=36.3, max_lat=37.0, min_lon=-122.4, max_lon=-121.7),
        "coastal_zone": "Monterey Bay National Marine Sanctuary"
    }
}

class LocationResolverAgent:
    """
    Parses natural language queries to resolve coastal target coordinates,
    bounding box, and observation timeframe.
    """

    def resolve(self, question: str) -> LocationResolved:
        q_lower = question.lower()
        now = datetime.utcnow()
        
        # Timeframe extraction
        start_date = (now - timedelta(days=7)).strftime("%Y-%m-%d")
        end_date = now.strftime("%Y-%m-%d")

        if "14 days" in q_lower or "two weeks" in q_lower:
            start_date = (now - timedelta(days=14)).strftime("%Y-%m-%d")
        elif "30 days" in q_lower or "month" in q_lower:
            start_date = (now - timedelta(days=30)).strftime("%Y-%m-%d")
        elif "next week" in q_lower:
            # For next week, historical recent window is used to assess current trajectory
            start_date = (now - timedelta(days=7)).strftime("%Y-%m-%d")

        # Match against known coastal database
        for key, loc_data in KNOWN_COASTAL_REGIONS.items():
            if key in q_lower:
                return LocationResolved(
                    location_name=loc_data["name"],
                    latitude=loc_data["lat"],
                    longitude=loc_data["lon"],
                    region_bbox=loc_data["bbox"],
                    timeframe=Timeframe(start=start_date, end=end_date),
                    coastal_zone=loc_data["coastal_zone"],
                    confidence=0.98
                )

        # Regex fallback for coordinate extraction like "lat 34.5 lon -120.2"
        coord_match = re.search(r"lat(?:itude)?\s*[:=]?\s*([+-]?\d+(?:\.\d+)?)\s*,?\s*lon(?:gitude)?\s*[:=]?\s*([+-]?\d+(?:\.\d+)?)", q_lower)
        if coord_match:
            lat = float(coord_match.group(1))
            lon = float(coord_match.group(2))
            return LocationResolved(
                location_name=f"Custom Marine Coords ({lat:.2f}, {lon:.2f})",
                latitude=lat,
                longitude=lon,
                region_bbox=RegionBbox(min_lat=lat-0.5, max_lat=lat+0.5, min_lon=lon-0.5, max_lon=lon+0.5),
                timeframe=Timeframe(start=start_date, end=end_date),
                coastal_zone="Custom User Coordinates",
                confidence=0.95
            )

        # Default fallback: California Coast (primary demo target)
        default_loc = KNOWN_COASTAL_REGIONS["california"]
        return LocationResolved(
            location_name=default_loc["name"],
            latitude=default_loc["lat"],
            longitude=default_loc["lon"],
            region_bbox=default_loc["bbox"],
            timeframe=Timeframe(start=start_date, end=end_date),
            coastal_zone=default_loc["coastal_zone"],
            confidence=0.75
        )

location_resolver = LocationResolverAgent()
