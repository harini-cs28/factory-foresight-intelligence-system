import apiClient from "./axios";
import { PredictionData, SensorDataInput } from "../types/prediction";

export const predictionApi = {
  predictMachineHealth: async (sensorData: SensorDataInput): Promise<PredictionData> => {
    const response = await apiClient.post<PredictionData>("/api/predictions/predict", sensorData);
    return response.data;
  },
};
