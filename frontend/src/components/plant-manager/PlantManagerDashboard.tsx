import React, { useState, useEffect } from "react";
import { machineApi } from "../../api/machineApi";
import { alertApi } from "../../api/alertApi";
import { DashboardOverviewResponse, MachineItem } from "../../types/machine";
import { AlertItem } from "../../types/alert";
import { LoadingState } from "../common/LoadingState";
import { ErrorState } from "../common/ErrorState";
import { PlantManagerDashboard as DashboardView } from "../dashboard/PlantManagerDashboard";

export const PlantManagerDashboard: React.FC = () => {
  const [overview, setOverview] = useState<DashboardOverviewResponse | null>(null);
  const [machines, setMachines] = useState<MachineItem[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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
          "Unable to load factory command telemetry from the FFIS backend."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (isLoading) {
    return <LoadingState message="Aggregating Factory Command Center telemetry..." />;
  }

  if (error || !overview) {
    return (
      <ErrorState
        title="Factory Command Telemetry Unavailable"
        message={error || "Could not retrieve factory data."}
        onRetry={fetchDashboardData}
      />
    );
  }

  return (
    <DashboardView
      overview={overview}
      machines={machines}
      alerts={alerts}
      onRefresh={fetchDashboardData}
    />
  );
};
