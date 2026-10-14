from typing import List, Optional
from pydantic import BaseModel, ConfigDict


class OriginMachineInfo(BaseModel):
    machine_id: str
    process: str
    production_line: str
    criticality: str
    production_priority: Optional[str] = None
    production_impact: Optional[str] = None


class AffectedMachineInfo(BaseModel):
    machine_id: str
    process: Optional[str] = None
    production_line: str
    cascade_level: int
    dependency_level: int
    direct_source: str
    criticality: Optional[str] = None
    estimated_repair_hours: Optional[float] = None
    estimated_downtime_cost_per_hour_inr: Optional[int] = None


class CascadeInfo(BaseModel):
    affected_machine_count: int
    maximum_cascade_level: int
    affected_machines: List[AffectedMachineInfo]


class ProductionImpactInfo(BaseModel):
    affected_production_lines: List[str]
    estimated_total_repair_hours: float
    estimated_potential_downtime_cost: float
    impact_severity: str


class ImpactResponse(BaseModel):
    origin_machine: OriginMachineInfo
    cascade: CascadeInfo
    production_impact: ProductionImpactInfo

    model_config = ConfigDict(from_attributes=True)
