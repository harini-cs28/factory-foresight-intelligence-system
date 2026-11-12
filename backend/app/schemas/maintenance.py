from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict


class DecisionFactors(BaseModel):
    failure_probability: float
    predicted_rul: float
    health_status: str
    machine_criticality: str
    production_priority: Optional[str] = None
    production_impact: Optional[str] = None
    impact_severity: str
    affected_machine_count: int
    technician_available: bool
    spare_part_available: bool
    maintenance_window: str


class RecommendationResponse(BaseModel):
    id: Optional[int] = None
    machine_id: str
    prediction_id: Optional[int] = None
    priority: str
    recommended_action: str
    reason: str
    recommended_window: str
    estimated_repair_hours: float
    decision_factors: Optional[DecisionFactors] = None
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class RecommendationHistoryItem(BaseModel):
    id: int
    machine_id: str
    prediction_id: Optional[int] = None
    priority: str
    recommended_action: str
    reason: str
    recommended_window: str
    estimated_repair_hours: float
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class WorkOrderItem(BaseModel):
    id: int
    machine_id: str
    process: Optional[str] = None
    production_line: Optional[str] = None
    criticality: Optional[str] = None
    maintenance_type: str
    description: Optional[str] = None
    status: str
    scheduled_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UpdateWorkOrderStatusRequest(BaseModel):
    status: str


class CreateWorkOrderRequest(BaseModel):
    machine_id: str
    maintenance_type: Optional[str] = "Corrective"
    description: Optional[str] = None
    scheduled_at: Optional[datetime] = None


