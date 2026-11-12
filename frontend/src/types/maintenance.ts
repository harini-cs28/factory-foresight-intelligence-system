export type MaintenancePriority = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | string;

export interface DecisionFactors {
  failure_probability: number;
  predicted_rul: number;
  health_status: string;
  machine_criticality: string;
  production_priority?: string;
  production_impact?: string;
  impact_severity: string;
  affected_machine_count: number;
  technician_available: boolean;
  spare_part_available: boolean;
  maintenance_window: string;
}

export interface RecommendationResponse {
  id?: number;
  machine_id: string;
  prediction_id?: number;
  priority: MaintenancePriority;
  recommended_action: string;
  reason: string;
  recommended_window: string;
  estimated_repair_hours: number;
  decision_factors?: DecisionFactors;
  created_at?: string;
}

export interface RecommendationHistoryItem {
  id: number;
  machine_id: string;
  prediction_id?: number;
  priority: MaintenancePriority;
  recommended_action: string;
  reason: string;
  recommended_window: string;
  estimated_repair_hours: number;
  created_at: string;
}

export interface WorkOrderItem {
  id: number;
  machine_id: string;
  process?: string;
  production_line?: string;
  criticality?: string;
  maintenance_type: string;
  description?: string;
  status: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | string;
  scheduled_at?: string;
  completed_at?: string;
  created_at: string;
}

export interface CreateWorkOrderRequest {
  machine_id: string;
  maintenance_type?: string;
  description?: string;
  scheduled_at?: string;
}


