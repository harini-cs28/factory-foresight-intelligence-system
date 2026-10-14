from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any


class RiskFactor(BaseModel):
    feature: str = Field(..., description="Feature column identifier")
    label: str = Field(..., description="Human readable feature name")
    unit: str = Field(..., description="Physical unit")
    nominal_range: str = Field(..., description="Standard nominal operating range")
    value: float = Field(..., description="Current observed feature value")
    shap_value: float = Field(..., description="Calculated SHAP attribution contribution")
    impact: str = Field(..., description="'INCREASES_RISK' or 'DECREASES_RISK' or 'NEUTRAL'")
    contribution_score: float = Field(..., description="Magnitude of attribution contribution")


class ExplainabilityResponse(BaseModel):
    machine_id: str
    process: str
    production_line: str
    criticality: str
    failure_probability: float
    predicted_rul: float
    health_status: str
    base_value: float
    explanation_summary: str
    method: str
    top_factors: List[RiskFactor]
    all_factors: List[RiskFactor]
    increasing_factors: List[RiskFactor]
    decreasing_factors: List[RiskFactor]
    sensor_features: Dict[str, float]
