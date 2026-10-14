import apiClient from "./axios";
import { User, UserRole } from "../types/auth";
import { MachineItem } from "../types/machine";
import {
  ModelsAndServicesResponse,
  SystemConfigurationResponse,
  AuditLogItem,
} from "../types/admin";

export const adminApi = {
  getUsers: async (): Promise<User[]> => {
    const response = await apiClient.get<User[]>("/api/admin/users");
    return response.data;
  },

  updateUserRoleOrStatus: async (
    userId: number,
    data: { role?: UserRole; is_active?: boolean }
  ): Promise<User> => {
    const response = await apiClient.patch<User>(`/api/admin/users/${userId}`, data);
    return response.data;
  },

  getMachineRegistry: async (): Promise<MachineItem[]> => {
    const response = await apiClient.get<MachineItem[]>("/api/admin/machines");
    return response.data;
  },

  updateMachineRegistry: async (
    machineId: string,
    data: { criticality?: string; process?: string; production_line?: string }
  ): Promise<MachineItem> => {
    const response = await apiClient.patch<MachineItem>(
      `/api/admin/machines/${machineId}`,
      data
    );
    return response.data;
  },

  getModelAndServiceStatus: async (): Promise<ModelsAndServicesResponse> => {
    const response = await apiClient.get<ModelsAndServicesResponse>(
      "/api/admin/models-and-services"
    );
    return response.data;
  },

  getSystemConfig: async (): Promise<SystemConfigurationResponse> => {
    const response = await apiClient.get<SystemConfigurationResponse>(
      "/api/admin/system/config"
    );
    return response.data;
  },

  getAuditLogs: async (limit: number = 50): Promise<AuditLogItem[]> => {
    const response = await apiClient.get<AuditLogItem[]>("/api/admin/audit-logs", {
      params: { limit },
    });
    return response.data;
  },
};
