import { User, UserRole } from "./auth";
import { MachineItem } from "./machine";

export interface ServiceStatusItem {
  name: string;
  status: "OPERATIONAL" | "ACTIVE" | "STANDBY" | "DEGRADED" | string;
  version?: string;
  port?: number;
  latency_ms?: number;
  host?: string;
  database?: string;
  pool_status?: string;
  monitored_nodes?: number;
  sampling_frequency?: string;
  backend?: string;
  features_analyzed?: number;
}

export interface ModelMetrics {
  algorithm: string;
  file_present: boolean;
  accuracy?: number;
  precision?: number;
  recall?: number;
  f1_score?: number;
  roc_auc?: number;
  mae_cycles?: number;
  rmse_cycles?: number;
  r2_score?: number;
}

export interface ModelsAndServicesResponse {
  services: ServiceStatusItem[];
  models: {
    version: string;
    failure_classifier: ModelMetrics;
    rul_regressor: ModelMetrics;
    feature_columns: string[];
    feature_importances: Record<string, number>;
  };
}

export interface SystemConfigurationResponse {
  project_name: string;
  version: string;
  api_v1_prefix: string;
  cors_origins: string[];
  access_token_expire_minutes: number;
  thresholds: {
    critical_risk_threshold: number;
    critical_rul_threshold: number;
    at_risk_risk_min: number;
    at_risk_rul_max: number;
    healthy_risk_max: number;
    healthy_rul_min: number;
  };
  dataset_files: {
    sensor_data_csv: string;
    dependencies_csv: string;
    factory_context_csv: string;
  };
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  category: "USER_MANAGEMENT" | "ALERT_GOVERNANCE" | "INFERENCE_EVENT" | "MAINTENANCE" | string;
  actor: string;
  action: string;
  details: string;
  severity: "INFO" | "WARNING" | "CRITICAL";
}
