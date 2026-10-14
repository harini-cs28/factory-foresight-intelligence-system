from typing import List, Optional
from pydantic import BaseModel, ConfigDict
from app.schemas.prediction import PredictionResponse


class MachineItem(BaseModel):
    id: int
    machine_id: str
    process: str
    production_line: str
    criticality: str
    latest_prediction: Optional[PredictionResponse] = None
    technician_available: Optional[str] = None
    spare_part_available: Optional[str] = None
    maintenance_window: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class SensorHistoryItem(BaseModel):
    machine_id: str
    process: str
    production_line: str
    cycle: int
    temperature_c: float
    vibration_mm_s: float
    motor_current_a: float
    rpm: float
    pressure_bar: float
    load_percentage: float
    operating_hours: int
    maintenance_count: int
    rul_cycles: int
    failure_within_20_cycles: int


class DashboardOverviewResponse(BaseModel):
    total_machines: int
    healthy_count: int
    at_risk_count: int
    critical_count: int
    critical_machines: List[str]
    high_priority_maintenance_count: int
    affected_production_lines: List[str]


class UpdateMachineRequest(BaseModel):
    criticality: Optional[str] = None
    process: Optional[str] = None
    production_line: Optional[str] = None

