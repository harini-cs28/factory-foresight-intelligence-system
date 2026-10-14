import apiClient from "./axios";
import { MachineItem, SensorHistoryItem, DashboardOverviewResponse } from "../types/machine";

export const machineApi = {
  getMachines: async (): Promise<MachineItem[]> => {
    const response = await apiClient.get<MachineItem[]>("/api/machines");
    return response.data;
  },

  getMachineById: async (machineId: string): Promise<MachineItem> => {
    const response = await apiClient.get<MachineItem>(`/api/machines/${machineId}`);
    return response.data;
  },

  getSensorHistory: async (
    machineId: string,
    limit: number = 30
  ): Promise<SensorHistoryItem[]> => {
    const response = await apiClient.get<SensorHistoryItem[]>(
      `/api/machines/${machineId}/sensor-history`,
      { params: { limit } }
    );
    return response.data;
  },

  getDashboardOverview: async (): Promise<DashboardOverviewResponse> => {
    const response = await apiClient.get<DashboardOverviewResponse>("/api/dashboard/overview");
    return response.data;
  },
};
