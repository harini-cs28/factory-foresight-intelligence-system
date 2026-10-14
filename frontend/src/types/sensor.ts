export interface SensorReading {
  machine_id: string;
  cycle: number;
  temperature_c: number;
  vibration_mm_s: number;
  motor_current_a: number;
  rpm: number;
  pressure_bar: number;
  load_percentage: number;
  operating_hours?: number;
  maintenance_count?: number;
  process?: string;
  production_line?: string;
  timestamp?: string;
}

export interface LatestSensorsResponse {
  machines: SensorReading[];
  total_machines: number;
  simulation_interval_seconds: number;
  is_simulator_running: boolean;
}

export interface MachineHistoryResponse {
  machine_id: string;
  readings_count: number;
  readings: SensorReading[];
}

export interface LivePredictionResponse {
  machine_id: string;
  cycle: number;
  temperature_c: number;
  vibration_mm_s: number;
  motor_current_a: number;
  rpm: number;
  pressure_bar: number;
  load_percentage: number;
  failure_probability: number;
  failure_prediction: boolean;
  predicted_rul: number;
  health_status: "HEALTHY" | "AT_RISK" | "CRITICAL";
  model_version: string;
  timestamp: string;
}
