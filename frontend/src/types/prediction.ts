export type HealthStatus = "HEALTHY" | "AT_RISK" | "CRITICAL";

export interface PredictionData {
  id?: number;
  machine_id: string;
  failure_probability: number;
  failure_prediction: boolean;
  predicted_rul: number;
  health_status: HealthStatus;
  model_version: string;
  created_at?: string;
}

export interface SensorDataInput {
  machine_id: string;
  temperature_c: number;
  vibration_mm_s: number;
  motor_current_a: number;
  rpm: number;
  pressure_bar: number;
  load_percentage: number;
  operating_hours: number;
  maintenance_count: number;
}
