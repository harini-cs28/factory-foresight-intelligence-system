export type AssistantLanguage = "en" | "ta" | "tanglish";

export interface ContributingSensorItem {
  feature: string;
  value: number;
  shap_value: number;
  impact: string;
}

export interface AssistantSourceData {
  machine_id?: string;
  process?: string;
  production_line?: string;
  health_status?: "HEALTHY" | "AT_RISK" | "CRITICAL" | string;
  failure_probability?: number;
  predicted_rul?: number;
  criticality?: string;
  top_contributing_sensors: ContributingSensorItem[];
  recommended_action?: string;
  priority?: string;
  affected_downstream_machines: string[];
  affected_machine_count: number;
  technician_available?: string;
  spare_part_available?: string;
  maintenance_window?: string;
  data_sources: string[];
}

export interface AssistantChatRequest {
  message: string;
  language: AssistantLanguage;
  machine_id?: string;
  conversation_id?: string;
}

export interface AssistantChatResponse {
  reply: string;
  language: AssistantLanguage;
  related_machine_ids: string[];
  source_data?: AssistantSourceData;
  conversation_id?: string;
}

export interface QuickQuestionItem {
  id: string;
  label: string;
  question: string;
  language: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
  language: AssistantLanguage;
  sourceData?: AssistantSourceData;
  relatedMachineIds?: string[];
}
