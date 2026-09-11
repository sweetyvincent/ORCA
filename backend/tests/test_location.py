import pytest
from backend.app.agents.location import location_resolver

def test_resolve_california():
    loc = location_resolver.resolve("Will conditions favour a harmful algal bloom near California next week?")
    assert "California" in loc.location_name
    assert loc.latitude == 35.2
    assert loc.longitude == -121.2
    assert loc.region_bbox.min_lat < loc.latitude < loc.region_bbox.max_lat

def test_resolve_kerala():
    loc = location_resolver.resolve("What is happening off the coast of Kerala?")
    assert "Kerala" in loc.location_name
    assert loc.latitude == 9.9
    assert loc.longitude == 75.8

def test_resolve_mumbai():
    loc = location_resolver.resolve("Show me chlorophyll conditions near Mumbai.")
    assert "Mumbai" in loc.location_name
    assert loc.latitude == 18.9

def test_resolve_custom_coords():
    loc = location_resolver.resolve("Check ocean conditions at lat 25.5 lon -80.2")
    assert loc.latitude == 25.5
    assert loc.longitude == -80.2

def test_timeframe_parsing():
    loc = location_resolver.resolve("Analyze conditions over the last 14 days near California")
    assert loc.timeframe.start != loc.timeframe.end
