import apiClient from "./axios";
import {
  SensorReading,
  LatestSensorsResponse,
  MachineHistoryResponse,
  LivePredictionResponse,
} from "../types/sensor";

export const sensorApi = {
  getLatestSensors: async (): Promise<LatestSensorsResponse> => {
    const response = await apiClient.get<LatestSensorsResponse>("/api/sensors/latest");
    return response.data;
  },

  getMachineLatestSensor: async (machineId: string): Promise<SensorReading> => {
    const response = await apiClient.get<SensorReading>(`/api/sensors/latest/${machineId}`);
    return response.data;
  },

  getMachineSensorHistory: async (
    machineId: string,
    limit: number = 30
  ): Promise<MachineHistoryResponse> => {
    const response = await apiClient.get<MachineHistoryResponse>(
      `/api/sensors/history/${machineId}`,
      { params: { limit } }
    );
    return response.data;
  },

  getLivePrediction: async (machineId: string): Promise<LivePredictionResponse> => {
    const response = await apiClient.post<LivePredictionResponse>(
      `/api/sensors/predict/${machineId}`
    );
    return response.data;
  },

  triggerSimulationStep: async (): Promise<{ status: string; updated_machines_count: number }> => {
    const response = await apiClient.post<{ status: string; updated_machines_count: number }>(
      "/api/sensors/step"
    );
    return response.data;
  },
};
