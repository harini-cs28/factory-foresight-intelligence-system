export interface OriginMachineInfo {
  machine_id: string;
  process: string;
  production_line: string;
  criticality: string;
  production_priority?: string;
  production_impact?: string;
}

export interface AffectedMachineInfo {
  machine_id: string;
  process?: string;
  production_line: string;
  cascade_level: number;
  dependency_level: number;
  direct_source: string;
  criticality?: string;
  estimated_repair_hours?: number;
  estimated_downtime_cost_per_hour_inr?: number;
}

export interface CascadeInfo {
  affected_machine_count: number;
  maximum_cascade_level: number;
  affected_machines: AffectedMachineInfo[];
}

export interface ProductionImpactInfo {
  affected_production_lines: string[];
  estimated_total_repair_hours: number;
  estimated_potential_downtime_cost: number;
  impact_severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" | string;
}

export interface ImpactResponse {
  origin_machine: OriginMachineInfo;
  cascade: CascadeInfo;
  production_impact: ProductionImpactInfo;
}
