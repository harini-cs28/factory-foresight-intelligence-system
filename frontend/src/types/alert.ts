export type AlertSeverity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export type AlertType =
  | "FAILURE_RISK"
  | "LOW_RUL"
  | "HIGH_CASCADE_IMPACT"
  | "MAINTENANCE_REQUIRED"
  | "CRITICAL_MACHINE_RISK"
  | string;

export interface AlertItem {
  id: number;
  machine_id: string;
  process: string;
  production_line: string;
  prediction_id?: number | null;
  alert_type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  recommended_action?: string | null;
  is_acknowledged: boolean;
  created_at?: string | null;
  acknowledged_at?: string | null;
  acknowledged_by?: string | null;
}

export interface AlertAcknowledgeResponse {
  id: number;
  machine_id: string;
  is_acknowledged: boolean;
  message: string;
  acknowledged_at?: string | null;
  acknowledged_by?: string | null;
}

export interface AlertSummaryResponse {
  total_alerts: number;
  unacknowledged_count: number;
  critical_count: number;
  high_count: number;
  medium_count: number;
  alerts: AlertItem[];
}
