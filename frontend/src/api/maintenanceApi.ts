import apiClient from "./axios";
import {
  RecommendationResponse,
  RecommendationHistoryItem,
  WorkOrderItem,
  CreateWorkOrderRequest,
} from "../types/maintenance";


export const maintenanceApi = {
  getRecommendation: async (machineId: string): Promise<RecommendationResponse> => {
    const response = await apiClient.get<RecommendationResponse>(
      `/api/maintenance/recommendations/${machineId}`
    );
    return response.data;
  },

  getRecommendationHistory: async (machineId: string): Promise<RecommendationHistoryItem[]> => {
    const response = await apiClient.get<RecommendationHistoryItem[]>(
      `/api/maintenance/recommendations/${machineId}/history`
    );
    return response.data;
  },

  getWorkOrders: async (statusFilter?: string): Promise<WorkOrderItem[]> => {
    const response = await apiClient.get<WorkOrderItem[]>("/api/maintenance/work-orders", {
      params: statusFilter ? { status_filter: statusFilter } : undefined,
    });
    return response.data;
  },

  createWorkOrder: async (data: CreateWorkOrderRequest): Promise<WorkOrderItem> => {
    const response = await apiClient.post<WorkOrderItem>("/api/maintenance/work-orders", data);
    return response.data;
  },

  updateWorkOrderStatus: async (
    recordId: number,
    status: string
  ): Promise<WorkOrderItem> => {
    const response = await apiClient.patch<WorkOrderItem>(
      `/api/maintenance/work-orders/${recordId}/status`,
      { status }
    );
    return response.data;
  },

  getMaintenanceHistory: async (machineId?: string): Promise<WorkOrderItem[]> => {
    const response = await apiClient.get<WorkOrderItem[]>("/api/maintenance/history", {
      params: machineId ? { machine_id: machineId } : undefined,
    });
    return response.data;
  },
};


