import json
import asyncio
from datetime import datetime, timezone, timedelta
from typing import AsyncGenerator, Dict, Any

IST = timezone(timedelta(hours=5, minutes=30), name="IST")

from backend.app.graph.workflow import orca_graph
from backend.app.models.schemas import AskRequest, StreamEvent

def create_event(event_type: str, node: str = None, data: Any = None) -> str:
    """Formats an SSE message string with IST timestamp."""
    payload = StreamEvent(
        type=event_type,
        node=node,
        data=data,
        timestamp=datetime.now(IST).strftime("%Y-%m-%dT%H:%M:%S+05:30")
    )
    # Ensure serializable format
    data_json = json.dumps(payload.model_dump(mode="json"))
    return f"event: {event_type}\ndata: {data_json}\n\n"

async def stream_orca_pipeline(req: AskRequest) -> AsyncGenerator[str, None]:
    """
    Executes the LangGraph marine intelligence pipeline and streams live execution
    events over Server-Sent Events (SSE).
    """
    yield create_event("query_received", data={"question": req.question, "conversation_id": req.conversation_id})

    accumulated_state: Dict[str, Any] = {
        "question": req.question,
        "conversation_id": req.conversation_id,
        "demo_mode": req.demo_mode,
        "events": []
    }

    try:
        # Run LangGraph streaming execution
        async for chunk in orca_graph.astream(accumulated_state, stream_mode="updates"):
            for node_name, node_output in chunk.items():
                # Merge node output into accumulated state
                accumulated_state.update(node_output)

                if node_name == "resolve_location":
                    loc = node_output.get("location")
                    yield create_event(
                        "location_resolved",
                        node="resolve_location",
                        data=loc.model_dump(mode="json") if loc else {}
                    )

                elif node_name == "router":
                    decision = node_output.get("router_decision")
                    yield create_event(
                        "router_completed",
                        node="router",
                        data=decision.model_dump(mode="json") if decision else {}
                    )

                elif node_name == "sst":
                    res = node_output.get("sst_result")
                    yield create_event(
                        "agent_completed",
                        node="sst",
                        data=res.model_dump(mode="json") if res else {}
                    )

                elif node_name == "chlorophyll":
                    res = node_output.get("chlorophyll_result")
                    yield create_event(
                        "agent_completed",
                        node="chlorophyll",
                        data=res.model_dump(mode="json") if res else {}
                    )

                elif node_name == "advisory":
                    res = node_output.get("advisory_result")
                    yield create_event(
                        "agent_completed",
                        node="advisory",
                        data=res.model_dump(mode="json") if res else {}
                    )

                elif node_name == "hab_reasoning":
                    hab = node_output.get("hab_assessment")
                    yield create_event(
                        "reasoning_completed",
                        node="hab_reasoning",
                        data=hab.model_dump(mode="json") if hab else {}
                    )

                elif node_name == "synthesizer":
                    synth = node_output.get("synthesis_result")
                    yield create_event(
                        "synthesis_completed",
                        node="synthesizer",
                        data=synth.model_dump(mode="json") if synth else {}
                    )

        # Final complete payload
        final_payload = {
            "question": req.question,
            "location": accumulated_state.get("location").model_dump(mode="json") if accumulated_state.get("location") else None,
            "router_decision": accumulated_state.get("router_decision").model_dump(mode="json") if accumulated_state.get("router_decision") else None,
            "sst_result": accumulated_state.get("sst_result").model_dump(mode="json") if accumulated_state.get("sst_result") else None,
            "chlorophyll_result": accumulated_state.get("chlorophyll_result").model_dump(mode="json") if accumulated_state.get("chlorophyll_result") else None,
            "advisory_result": accumulated_state.get("advisory_result").model_dump(mode="json") if accumulated_state.get("advisory_result") else None,
            "hab_assessment": accumulated_state.get("hab_assessment").model_dump(mode="json") if accumulated_state.get("hab_assessment") else None,
            "synthesis_result": accumulated_state.get("synthesis_result").model_dump(mode="json") if accumulated_state.get("synthesis_result") else None,
            "completed_at": datetime.now(IST).strftime("%Y-%m-%dT%H:%M:%S+05:30")
        }
        yield create_event("final", data=final_payload)

    except Exception as exc:
        err_msg = f"Pipeline execution error: {str(exc)}"
        print(f"[STREAM] {err_msg}")
        yield create_event("error", data={"error": err_msg})
