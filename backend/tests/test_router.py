import pytest
from backend.app.agents.router import router_agent

def test_route_sst_only():
    dec = router_agent.route("What is the SST near California?")
    assert "sst" in dec.agents
    assert "chlorophyll" not in dec.agents

def test_route_warming_question():
    dec = router_agent.route("Is the water getting warmer in the Arabian Sea?")
    assert "sst" in dec.agents
    assert "chlorophyll" not in dec.agents

def test_route_chlorophyll_only():
    dec = router_agent.route("Show me chlorophyll conditions near Mumbai.")
    assert "chlorophyll" in dec.agents
    assert "sst" not in dec.agents

def test_route_hab_compound():
    dec = router_agent.route("Will conditions favour a harmful algal bloom near California next week?")
    assert "sst" in dec.agents
    assert "chlorophyll" in dec.agents
    assert dec.needs_synthesis is True

def test_route_compare_compound():
    dec = router_agent.route("Compare SST and chlorophyll near Kerala")
    assert "sst" in dec.agents
    assert "chlorophyll" in dec.agents

def test_route_advisory():
    dec = router_agent.route("Are there coastal fisheries advisories in this area?")
    assert "advisory" in dec.agents
