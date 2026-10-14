from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class PredictionRequest(BaseModel):
    machine_id: str = Field(..., description="Unique machine identifier (e.g., SPIN-01, WEAV-01)")
    temperature_c: float = Field(..., ge=0.0, le=200.0, description="Operating temperature in Celsius")
    vibration_mm_s: float = Field(..., ge=0.0, le=50.0, description="Vibration velocity RMS in mm/s")
    motor_current_a: float = Field(..., ge=0.0, le=100.0, description="Motor current in Amperes")
    rpm: float = Field(..., ge=0.0, le=5000.0, description="Spindle / drive rotational speed in RPM")
    pressure_bar: float = Field(..., ge=0.0, le=20.0, description="Operating pressure in bar")
    load_percentage: float = Field(..., ge=0.0, le=100.0, description="Machine load capacity percentage (0-100%)")
    operating_hours: int = Field(..., ge=0, description="Total cumulative operating hours")
    maintenance_count: int = Field(..., ge=0, description="Number of past maintenance interventions")


class PredictionResponse(BaseModel):
    id: Optional[int] = None
    machine_id: str
    failure_probability: float
    failure_prediction: bool
    predicted_rul: float
    health_status: str
    model_version: str
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
