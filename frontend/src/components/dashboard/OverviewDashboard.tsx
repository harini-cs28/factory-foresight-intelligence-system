import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { machineApi } from "../../api/machineApi";
import { alertApi } from "../../api/alertApi";
import { DashboardOverviewResponse, MachineItem } from "../../types/machine";
import { AlertItem } from "../../types/alert";
import { PlantManagerDashboard } from "./PlantManagerDashboard";
import { MaintenanceEngineerDashboard } from "./MaintenanceEngineerDashboard";
import { ProductionManagerDashboard } from "./ProductionManagerDashboard";
import { AdminDashboardView } from "./AdminDashboardView";
import { LoadingState } from "../common/LoadingState";
import { ErrorState } from "../common/ErrorState";
import { RefreshCw } from "lucide-react";

export const OverviewDashboard: React.FC = () => {
  const { user } = useAuth();
  const [overview, setOverview] = useState<DashboardOverviewResponse | null>(null);
  const [machines, setMachines] = useState<MachineItem[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const role = user?.role || "PLANT_MANAGER";

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [overviewData, machinesData, alertsData] = await Promise.all([
        machineApi.getDashboardOverview(),
        machineApi.getMachines(),
        alertApi.getAlerts({ limit: 20 }),
      ]);
      setOverview(overviewData);
      setMachines(machinesData);
      setAlerts(alertsData.alerts);
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ||
          "Unable to load operational data from the FFIS backend."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (isLoading) {
    return <LoadingState message="Aggregating real-time factory intelligence..." />;
  }

  if (error || !overview) {
    return (
      <ErrorState
        title="Operational Data Unavailable"
        message={error || "Could not retrieve operational factory data."}
        onRetry={fetchDashboardData}
      />
    );
  }

  if (role === "MAINTENANCE_ENGINEER") {
    return (
      <MaintenanceEngineerDashboard
        overview={overview}
        machines={machines}
        alerts={alerts}
      />
    );
  }

  if (role === "PRODUCTION_MANAGER") {
    return (
      <ProductionManagerDashboard
        overview={overview}
        machines={machines}
        alerts={alerts}
      />
    );
  }

  if (role === "ADMIN") {
    return <AdminDashboardView overview={overview} machines={machines} />;
  }

  return (
    <PlantManagerDashboard
      overview={overview}
      machines={machines}
      alerts={alerts}
      onRefresh={fetchDashboardData}
    />
  );
};

