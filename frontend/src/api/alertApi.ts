import apiClient from "./axios";
import {
  AlertItem,
  AlertSummaryResponse,
  AlertAcknowledgeResponse,
} from "../types/alert";

export const alertApi = {
  getAlerts: async (params?: {
    severity?: string;
    is_acknowledged?: boolean;
    limit?: number;
  }): Promise<AlertSummaryResponse> => {
    const response = await apiClient.get<AlertSummaryResponse>("/api/alerts", {
      params,
    });
    return response.data;
  },

  getMachineAlerts: async (machineId: string): Promise<AlertItem[]> => {
    const response = await apiClient.get<AlertItem[]>(`/api/alerts/${machineId}`);
    return response.data;
  },

  acknowledgeAlert: async (alertId: number): Promise<AlertAcknowledgeResponse> => {
    const response = await apiClient.patch<AlertAcknowledgeResponse>(
      `/api/alerts/${alertId}/acknowledge`
    );
    return response.data;
  },

  evaluateAlerts: async (): Promise<AlertSummaryResponse> => {
    const response = await apiClient.post<AlertSummaryResponse>("/api/alerts/evaluate");
    return response.data;
  },
};
