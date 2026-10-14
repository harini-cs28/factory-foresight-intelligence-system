import { PredictionData } from "./prediction";

export interface MachineItem {
  id: number;
  machine_id: string;
  process: string;
  production_line: string;
  criticality: string;
  latest_prediction?: PredictionData | null;
  technician_available?: string | null;
  spare_part_available?: string | null;
  maintenance_window?: string | null;
}

export interface SensorHistoryItem {
  machine_id: string;
  process: string;
  production_line: string;
  cycle: number;
  temperature_c: number;
  vibration_mm_s: number;
  motor_current_a: number;
  rpm: number;
  pressure_bar: number;
  load_percentage: number;
  operating_hours: number;
  maintenance_count: number;
  rul_cycles: number;
  failure_within_20_cycles: number;
}

export interface DashboardOverviewResponse {
  total_machines: number;
  healthy_count: number;
  at_risk_count: number;
  critical_count: number;
  critical_machines: string[];
  high_priority_maintenance_count: number;
  affected_production_lines: string[];
}
