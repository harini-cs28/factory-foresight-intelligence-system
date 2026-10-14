from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any


class SensorReading(BaseModel):
    machine_id: str = Field(..., description="Unique machine identifier (e.g. SPIN-01)")
    cycle: int = Field(..., description="Operating cycle count")
    temperature_c: float = Field(..., description="Operating temperature in Celsius")
    vibration_mm_s: float = Field(..., description="Vibration velocity in mm/s")
    motor_current_a: float = Field(..., description="Motor current in Amperes")
    rpm: float = Field(..., description="Rotational speed in RPM")
    pressure_bar: float = Field(..., description="Hydraulic/pneumatic pressure in Bar")
    load_percentage: float = Field(..., description="Machine mechanical load percentage")
    operating_hours: Optional[float] = Field(default=None, description="Total machine operating hours")
    maintenance_count: Optional[int] = Field(default=None, description="Past maintenance interventions")
    process: Optional[str] = Field(default=None, description="Textile process stage")
    production_line: Optional[str] = Field(default=None, description="Assigned production line")
    timestamp: Optional[str] = Field(default=None, description="ISO timestamp of observation")


class LatestSensorsResponse(BaseModel):
    machines: List[SensorReading]
    total_machines: int
    simulation_interval_seconds: float
    is_simulator_running: bool


class MachineHistoryResponse(BaseModel):
    machine_id: str
    readings_count: int
    readings: List[SensorReading]


class LivePredictionResponse(BaseModel):
    machine_id: str
    cycle: int
    temperature_c: float
    vibration_mm_s: float
    motor_current_a: float
    rpm: float
    pressure_bar: float
    load_percentage: float
    failure_probability: float
    failure_prediction: bool
    predicted_rul: float
    health_status: str
    model_version: str
    timestamp: str
