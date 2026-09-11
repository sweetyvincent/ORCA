from typing import TypedDict, Optional, List, Dict, Any
from backend.app.models.schemas import (
    LocationResolved,
    RouterDecision,
    SSTResult,
    ChlorophyllResult,
    AdvisoryResult,
    HABAssessment,
    SynthesisResult
)

class AgentState(TypedDict, total=False):
    # Inputs
    question: str
    conversation_id: Optional[str]
    demo_mode: bool
    
    # Node outputs
    location: Optional[LocationResolved]
    router_decision: Optional[RouterDecision]
    
    # Specialist outputs
    sst_result: Optional[SSTResult]
    chlorophyll_result: Optional[ChlorophyllResult]
    advisory_result: Optional[AdvisoryResult]
    
    # Engine & Synthesis
    hab_assessment: Optional[HABAssessment]
    synthesis_result: Optional[SynthesisResult]
    
    # Execution metadata
    events: List[Dict[str, Any]]
    error: Optional[str]
