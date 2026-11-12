from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class AssistantChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=1000, description="User's question or message")
    language: str = Field("en", description="Requested response language: 'en', 'ta', or 'tanglish'")
    machine_id: Optional[str] = Field(None, description="Active or selected machine identifier (e.g. SPIN-01)")
    conversation_id: Optional[str] = Field(None, description="Optional conversation session ID")


class AssistantSourceData(BaseModel):
    machine_id: Optional[str] = None
    process: Optional[str] = None
    production_line: Optional[str] = None
    health_status: Optional[str] = None
    failure_probability: Optional[float] = None
    predicted_rul: Optional[float] = None
    criticality: Optional[str] = None
    top_contributing_sensors: List[Dict[str, Any]] = Field(default_factory=list)
    recommended_action: Optional[str] = None
    priority: Optional[str] = None
    affected_downstream_machines: List[str] = Field(default_factory=list)
    affected_machine_count: int = 0
    technician_available: Optional[str] = None
    spare_part_available: Optional[str] = None
    maintenance_window: Optional[str] = None
    data_sources: List[str] = Field(default_factory=list)


class AssistantChatResponse(BaseModel):
    reply: str
    language: str
    related_machine_ids: List[str] = Field(default_factory=list)
    source_data: Optional[AssistantSourceData] = None
    conversation_id: Optional[str] = None


class QuickQuestionItem(BaseModel):
    id: str
    label: str
    question: str
    language: str
