export interface RiskFactor {
  feature: string;
  label: string;
  unit: string;
  nominal_range: string;
  value: number;
  shap_value: number;
  impact: "INCREASES_RISK" | "DECREASES_RISK" | "NEUTRAL" | string;
  contribution_score: number;
}

export interface ExplainabilityResponse {
  machine_id: string;
  process: string;
  production_line: string;
  criticality: string;
  failure_probability: number;
  predicted_rul: number;
  health_status: "HEALTHY" | "AT_RISK" | "CRITICAL" | string;
  base_value: number;
  explanation_summary: string;
  method: string;
  top_factors: RiskFactor[];
  all_factors: RiskFactor[];
  increasing_factors: RiskFactor[];
  decreasing_factors: RiskFactor[];
  sensor_features: Record<string, number>;
}
