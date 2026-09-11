from typing import Dict, Any
from backend.app.graph.state import AgentState
from backend.app.agents.location import location_resolver
from backend.app.agents.router import router_agent
from backend.app.agents.sst import sst_specialist
from backend.app.agents.chlorophyll import chlorophyll_specialist
from backend.app.agents.advisory import coastal_advisory_agent
from backend.app.reasoning.hab import hab_reasoning_engine
from backend.app.agents.synthesizer import synthesizer_agent

async def resolve_location_node(state: AgentState) -> Dict[str, Any]:
    question = state.get("question", "")
    location = location_resolver.resolve(question)
    return {"location": location}

async def router_node(state: AgentState) -> Dict[str, Any]:
    question = state.get("question", "")
    decision = router_agent.route(question)
    return {"router_decision": decision}

async def sst_node(state: AgentState) -> Dict[str, Any]:
    location = state["location"]
    result = await sst_specialist.execute(location)
    return {"sst_result": result}

async def chlorophyll_node(state: AgentState) -> Dict[str, Any]:
    location = state["location"]
    result = await chlorophyll_specialist.execute(location)
    return {"chlorophyll_result": result}

async def advisory_node(state: AgentState) -> Dict[str, Any]:
    location = state["location"]
    result = await coastal_advisory_agent.execute(location)
    return {"advisory_result": result}

async def hab_reasoning_node(state: AgentState) -> Dict[str, Any]:
    location = state["location"]
    sst_res = state.get("sst_result")
    chl_res = state.get("chlorophyll_result")
    adv_res = state.get("advisory_result")
    
    # Only run HAB reasoning if we have both SST & Chlorophyll or a HAB query
    hab_res = hab_reasoning_engine.evaluate(
        location_name=location.location_name,
        sst=sst_res,
        chlorophyll=chl_res,
        advisory=adv_res
    )
    return {"hab_assessment": hab_res}

async def synthesizer_node(state: AgentState) -> Dict[str, Any]:
    question = state.get("question", "")
    location = state["location"]
    sst_res = state.get("sst_result")
    chl_res = state.get("chlorophyll_result")
    adv_res = state.get("advisory_result")
    hab_res = state.get("hab_assessment")

    synth = await synthesizer_agent.synthesize(
        question=question,
        location=location,
        sst=sst_res,
        chlorophyll=chl_res,
        advisory=adv_res,
        hab=hab_res
    )
    return {"synthesis_result": synth}
