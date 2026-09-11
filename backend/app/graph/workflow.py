from typing import List
from langgraph.graph import StateGraph, START, END

from backend.app.graph.state import AgentState
from backend.app.graph.nodes import (
    resolve_location_node,
    router_node,
    sst_node,
    chlorophyll_node,
    advisory_node,
    hab_reasoning_node,
    synthesizer_node
)

def route_specialists(state: AgentState) -> List[str]:
    """Conditional edge router determining which specialist nodes execute."""
    # Always dispatch SST, Chlorophyll, and Advisory to ensure workbench graphs
    # (Stream Alpha, Stream Beta, Stream Gamma) always receive fresh telemetry for the sector.
    return ["sst", "chlorophyll", "advisory"]

def create_orca_graph():
    """Builds and compiles the ORCA multi-agent LangGraph state machine."""
    workflow = StateGraph(AgentState)

    # Add core nodes
    workflow.add_node("resolve_location", resolve_location_node)
    workflow.add_node("router", router_node)
    workflow.add_node("sst", sst_node)
    workflow.add_node("chlorophyll", chlorophyll_node)
    workflow.add_node("advisory", advisory_node)
    workflow.add_node("hab_reasoning", hab_reasoning_node)
    workflow.add_node("synthesizer", synthesizer_node)

    # Define linear entry pipeline
    workflow.add_edge(START, "resolve_location")
    workflow.add_edge("resolve_location", "router")

    # Conditional fan-out to specialists based on router decision
    workflow.add_conditional_edges(
        "router",
        route_specialists,
        ["sst", "chlorophyll", "advisory"]
    )

    # Specialist fan-in into HAB reasoning
    workflow.add_edge("sst", "hab_reasoning")
    workflow.add_edge("chlorophyll", "hab_reasoning")
    workflow.add_edge("advisory", "hab_reasoning")

    # Final reasoning and synthesis
    workflow.add_edge("hab_reasoning", "synthesizer")
    workflow.add_edge("synthesizer", END)

    return workflow.compile()

orca_graph = create_orca_graph()
