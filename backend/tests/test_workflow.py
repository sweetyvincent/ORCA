import asyncio
import pytest
from backend.app.graph.workflow import orca_graph

def test_workflow_end_to_end():
    async def _run():
        initial_state = {
            "question": "What is the sea surface temperature near California?",
            "conversation_id": "test_conv_1",
            "demo_mode": False
        }
        result = await orca_graph.ainvoke(initial_state)
        assert result["location"] is not None
        assert "California" in result["location"].location_name
        assert result["router_decision"] is not None
        assert "sst" in result["router_decision"].agents
        assert result["sst_result"] is not None
        assert result["synthesis_result"] is not None
        assert len(result["synthesis_result"].citations) > 0

    asyncio.run(_run())
