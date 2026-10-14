import apiClient from "./axios";
import { ImpactResponse } from "../types/impact";

export const impactApi = {
  getMachineImpact: async (machineId: string): Promise<ImpactResponse> => {
    const response = await apiClient.get<ImpactResponse>(`/api/impact/${machineId}`);
    return response.data;
  },
};
