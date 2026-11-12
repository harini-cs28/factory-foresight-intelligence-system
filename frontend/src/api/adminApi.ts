import apiClient from "./axios";
import { User, UserRole } from "../types/auth";
import { MachineItem } from "../types/machine";
import {
  ModelsAndServicesResponse,
  SystemConfigurationResponse,
  AuditLogItem,
  AuditLogsResponse,
} from "../types/admin";

export interface AuditLogFilters {
  page?: number;
  pageSize?: number;
  startDate?: string;
  endDate?: string;
  userFilter?: string;
  roleFilter?: string;
  actionType?: string;
  resultStatus?: string;
}

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

  getAuditLogs: async (
    filtersOrLimit?: number | AuditLogFilters
  ): Promise<AuditLogsResponse> => {
    let params: Record<string, any> = {};

    if (typeof filtersOrLimit === "number") {
      params = { page_size: filtersOrLimit, page: 1 };
    } else if (filtersOrLimit) {
      params = {
        page: filtersOrLimit.page || 1,
        page_size: filtersOrLimit.pageSize || 20,
        start_date: filtersOrLimit.startDate || undefined,
        end_date: filtersOrLimit.endDate || undefined,
        user_filter: filtersOrLimit.userFilter || undefined,
        role_filter: filtersOrLimit.roleFilter || undefined,
        action_type: filtersOrLimit.actionType || undefined,
        result_status: filtersOrLimit.resultStatus || undefined,
      };
    }

    const response = await apiClient.get<AuditLogsResponse>("/api/admin/audit-logs", {
      params,
    });
    return response.data;
  },
};
