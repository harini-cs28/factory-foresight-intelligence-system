from pydantic import BaseModel, Field
from typing import List, Optional


class AlertResponse(BaseModel):
    id: int
    machine_id: str
    process: str
    production_line: str
    prediction_id: Optional[int] = None
    alert_type: str
    severity: str
    title: str
    message: str
    recommended_action: Optional[str] = None
    is_acknowledged: bool
    created_at: Optional[str] = None
    acknowledged_at: Optional[str] = None
    acknowledged_by: Optional[str] = None
    failure_probability: Optional[float] = None
    predicted_rul: Optional[float] = None
    triggering_condition: Optional[str] = None


class AlertAcknowledgeResponse(BaseModel):
    id: int
    machine_id: str
    is_acknowledged: bool
    message: str
    acknowledged_at: Optional[str] = None
    acknowledged_by: Optional[str] = None
    failure_probability: Optional[float] = None
    predicted_rul: Optional[float] = None
    triggering_condition: Optional[str] = None


class AlertSummaryResponse(BaseModel):
    total_alerts: int
    unacknowledged_count: int
    critical_count: int
    high_count: int
    medium_count: int
    alerts: List[AlertResponse]
