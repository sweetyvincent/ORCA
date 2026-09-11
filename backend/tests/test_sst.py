import pytest
from backend.app.data.noaa_oisst import noaa_sst_provider

def test_coords_normalization():
    # Longitude -121.2 should normalize to (360 - 121.2) = 238.8
    lat, lon = noaa_sst_provider._normalize_coords(35.2, -121.2)
    assert lat == 35.2
    assert lon == 238.8

    # Positive longitude should stay as is
    lat, lon = noaa_sst_provider._normalize_coords(10.0, 75.0)
    assert lat == 10.0
    assert lon == 75.0
