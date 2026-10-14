import apiClient from "./axios";
import { ExplainabilityResponse } from "../types/explainability";

export const explainabilityApi = {
  getExplainability: async (machineId: string): Promise<ExplainabilityResponse> => {
    const response = await apiClient.get<ExplainabilityResponse>(
      `/api/explainability/${machineId}`
    );
    return response.data;
  },
};
