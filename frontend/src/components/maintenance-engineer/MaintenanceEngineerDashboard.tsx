import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { machineApi } from "../../api/machineApi";
import { alertApi } from "../../api/alertApi";
import { maintenanceApi } from "../../api/maintenanceApi";
import { MachineItem } from "../../types/machine";
import { AlertItem } from "../../types/alert";
import { WorkOrderItem, RecommendationResponse } from "../../types/maintenance";
import { LoadingState } from "../common/LoadingState";
import { ErrorState } from "../common/ErrorState";
import {
  ListTodo,
  RefreshCw,
  Wrench,
  AlertTriangle,
  Clock,
  ArrowRight,
  CheckCircle2,
  Check,
  Activity,
  Layers,
  Cpu,
  Share2,
} from "lucide-react";

export const MaintenanceEngineerDashboard: React.FC = () => {
  const [machines, setMachines] = useState<MachineItem[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrderItem[]>([]);
  const [selectedMachineId, setSelectedMachineId] = useState<string>("SPIN-01");
  const [recommendation, setRecommendation] = useState<RecommendationResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [machinesData, alertsData, ordersData] = await Promise.all([
        machineApi.getMachines(),
        alertApi.getAlerts({ is_acknowledged: false, limit: 10 }),
        maintenanceApi.getWorkOrders(),
      ]);
      setMachines(machinesData);
      setAlerts(alertsData.alerts);
      setWorkOrders(ordersData);

      // Select highest risk machine initially
      const sorted = [...machinesData].sort((a, b) => {
        const aRisk = a.latest_prediction?.failure_probability || 0;
        const bRisk = b.latest_prediction?.failure_probability || 0;
        return bRisk - aRisk;
      });
      const topMachine = sorted[0]?.machine_id || "SPIN-01";
      setSelectedMachineId(topMachine);

      try {
        const rec = await maintenanceApi.getRecommendation(topMachine);
        setRecommendation(rec);
      } catch (e) {
        // Non-fatal
      }
    } catch (err: any) {
      setError("Failed to load Maintenance Intelligence work queue.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSelectMachine = async (mId: string) => {
    setSelectedMachineId(mId);
    try {
      const rec = await maintenanceApi.getRecommendation(mId);
      setRecommendation(rec);
    } catch (e) {
      setRecommendation(null);
    }
  };

  const handleAcknowledgeAlert = async (alertId: number) => {
    try {
      await alertApi.acknowledgeAlert(alertId);
      setAlerts((prev) => prev.filter((a) => a.id !== alertId));
      setActionSuccess("Alert acknowledged successfully.");
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (e) {
      // Handled
    }
  };

  const handleUpdateOrderStatus = async (recordId: number, status: string) => {
    try {
      const updated = await maintenanceApi.updateWorkOrderStatus(recordId, status);
      setWorkOrders((prev) => prev.map((o) => (o.id === recordId ? updated : o)));
      setActionSuccess(`Work Order #${recordId} set to ${status}.`);
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (e) {
      // Handled
    }
  };

  if (isLoading) {
    return <LoadingState message="Loading Maintenance Intelligence Work Queue..." />;
  }

  if (error && machines.length === 0) {
    return (
      <ErrorState
        title="Work Queue Unavailable"
        message={error}
        onRetry={fetchData}
      />
    );
  }

  const selectedMachine = machines.find((m) => m.machine_id === selectedMachineId) || machines[0];
  const lowRulMachines = machines
    .filter((m) => m.latest_prediction && m.latest_prediction.predicted_rul < 25)
    .sort((a, b) => (a.latest_prediction?.predicted_rul || 0) - (b.latest_prediction?.predicted_rul || 0));

  const scheduledOrders = workOrders.filter((w) => w.status === "SCHEDULED" || w.status === "IN_PROGRESS");

  return (
    <div className="space-y-6">
      {/* Workspace Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E7EB]">
        <div>
          <div className="flex items-center gap-2">
            <ListTodo className="w-6 h-6 text-[#D99A00]" />
            <h1 className="text-xl font-bold text-[#1F2933] font-mono tracking-tight">
              MY MAINTENANCE WORK QUEUE
            </h1>
          </div>
          <p className="text-xs text-[#667085] mt-1">
            Actionable inspection queue, active work orders, low-RUL machinery, and prescriptive repairs.
          </p>
        </div>

        <button
          onClick={fetchData}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#FFFFFF] hover:bg-[#FFF3C4] border border-[#E5E7EB] hover:border-[#F4B400] text-[#1F2933] text-xs font-semibold transition-all shadow-xs cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#D99A00]" />
          <span>Refresh Queue</span>
        </button>
      </div>

      {actionSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Top Action Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-[#667085]">
            <span className="font-bold uppercase tracking-wider font-mono">IMMEDIATE INSPECTION</span>
            <AlertTriangle className="w-4 h-4 text-[#EF4444]" />
          </div>
          <div className="text-2xl font-extrabold text-[#EF4444] font-mono">
            {lowRulMachines.length}{" "}
            <span className="text-xs font-normal text-[#667085]">Machines &lt; 25 Cyc</span>
          </div>
          <p className="text-[11px] text-[#667085]">Urgent maintenance required</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-[#667085]">
            <span className="font-bold uppercase tracking-wider font-mono">ACTIVE WORK ORDERS</span>
            <Wrench className="w-4 h-4 text-[#D99A00]" />
          </div>
          <div className="text-2xl font-extrabold text-[#1F2933] font-mono">
            {scheduledOrders.length}{" "}
            <span className="text-xs font-normal text-[#667085]">In Progress / Scheduled</span>
          </div>
          <p className="text-[11px] text-[#667085]">Assigned repair jobs</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-[#667085]">
            <span className="font-bold uppercase tracking-wider font-mono">UNACKNOWLEDGED ALERTS</span>
            <AlertTriangle className="w-4 h-4 text-[#F59E0B]" />
          </div>
          <div className="text-2xl font-extrabold text-[#1F2933] font-mono">
            {alerts.length}{" "}
            <span className="text-xs font-normal text-[#667085]">Active Alarms</span>
          </div>
          <p className="text-[11px] text-[#667085]">Requiring technician review</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-[#667085]">
            <span className="font-bold uppercase tracking-wider font-mono">TECHNICIAN STATUS</span>
            <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
          </div>
          <div className="text-2xl font-extrabold text-[#22C55E] font-mono">
            READY
          </div>
          <p className="text-[11px] text-[#667085]">Toolkits &amp; parts staged</p>
        </div>
      </div>

      {/* Main Work Queue Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: High Priority Queue Selection */}
        <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#1F2933] font-mono">
              Action Queue Priority List
            </h3>
            <span className="text-[10px] text-[#667085] font-mono">Click to inspect</span>
          </div>

          <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
            {machines.map((m) => {
              const isSelected = m.machine_id === selectedMachineId;
              const prob = m.latest_prediction
                ? Math.round(m.latest_prediction.failure_probability * 100)
                : 0;
              const rul = m.latest_prediction
                ? m.latest_prediction.predicted_rul.toFixed(1)
                : "N/A";
              const isCrit = m.latest_prediction?.health_status === "CRITICAL";

              return (
                <button
                  key={m.machine_id}
                  onClick={() => handleSelectMachine(m.machine_id)}
                  className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? "bg-[#FFF3C4] border-[#F4B400] shadow-xs"
                      : "bg-[#FFFDF5] border-[#E5E7EB] hover:bg-[#FFFFFF]"
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold font-mono text-xs text-[#1F2933]">
                        {m.machine_id}
                      </span>
                      <span className="text-[10px] text-[#667085] font-mono">
                        {m.production_line}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#667085] truncate">{m.process}</div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-bold font-mono text-[#1F2933]">
                      RUL: {rul} Cyc
                    </div>
                    <div
                      className={`text-[10px] font-bold font-mono ${
                        isCrit ? "text-[#EF4444]" : "text-[#D99A00]"
                      }`}
                    >
                      {prob}% Risk
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right 2 Columns: Selected Machine Prescriptive Panel & Work Orders */}
        <div className="lg:col-span-2 space-y-6">
          {selectedMachine && (
            <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-xs space-y-5">
              {/* Machine Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5E7EB] pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#FFF3C4] text-[#D99A00] border border-[#F4B400]/40">
                      {selectedMachine.production_line}
                    </span>
                    <h2 className="text-xl font-bold text-[#1F2933] font-mono">
                      {selectedMachine.machine_id} &ndash; {selectedMachine.process}
                    </h2>
                  </div>
                  <p className="text-xs text-[#667085] mt-1">
                    Spare Part: <span className="font-bold text-[#1F2933]">{selectedMachine.spare_part_available || "N/A"}</span> | Window: <span className="font-bold text-[#1F2933]">{selectedMachine.maintenance_window || "N/A"}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    to={`/maintenance-engineer/diagnostics?machineId=${selectedMachine.machine_id}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#FFFDF5] hover:bg-[#FFF3C4] border border-[#E5E7EB] text-xs font-semibold text-[#1F2933] transition-colors"
                  >
                    <Activity className="w-3.5 h-3.5 text-[#D99A00]" />
                    <span>Diagnostics</span>
                  </Link>
                  <Link
                    to={`/maintenance-engineer/failure-rul?machineId=${selectedMachine.machine_id}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#FFFDF5] hover:bg-[#FFF3C4] border border-[#E5E7EB] text-xs font-semibold text-[#1F2933] transition-colors"
                  >
                    <Cpu className="w-3.5 h-3.5 text-[#D99A00]" />
                    <span>RUL Curve</span>
                  </Link>
                </div>
              </div>

              {/* Recommendation Card */}
              {recommendation ? (
                <div className="p-4 rounded-xl bg-[#FFFDF5] border border-[#F4B400]/40 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-bold text-[#D99A00] uppercase flex items-center gap-1.5">
                      <Wrench className="w-4 h-4" />
                      Prescriptive Action Plan
                    </span>
                    <span className="text-[#1F2933] font-bold">
                      Est. Duration: {recommendation.estimated_repair_hours}h
                    </span>
                  </div>
                  <div className="text-sm font-bold text-[#1F2933]">
                    {recommendation.recommended_action}
                  </div>
                  <div className="text-xs text-[#667085] leading-relaxed">
                    {recommendation.reason}
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-[#FFFDF5] border border-[#E5E7EB] text-xs text-[#667085]">
                  Generating prescriptive recommendation for {selectedMachine.machine_id}...
                </div>
              )}

              {/* Associated Work Orders */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#1F2933] font-mono">
                    Assigned Work Orders for {selectedMachine.machine_id}
                  </h3>
                  <Link
                    to="/maintenance-engineer/work-orders"
                    className="text-[11px] font-bold text-[#D99A00] hover:underline"
                  >
                    All Work Orders
                  </Link>
                </div>

                {workOrders.filter((w) => w.machine_id === selectedMachine.machine_id).length === 0 ? (
                  <div className="p-4 rounded-xl bg-[#FFFDF5] border border-[#E5E7EB] text-xs text-[#667085] text-center">
                    No active work orders logged for {selectedMachine.machine_id}.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {workOrders
                      .filter((w) => w.machine_id === selectedMachine.machine_id)
                      .map((wo) => (
                        <div
                          key={wo.id}
                          className="p-3.5 rounded-xl bg-[#FFFDF5] border border-[#E5E7EB] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold font-mono text-[#1F2933]">
                                WO #{wo.id} &ndash; {wo.maintenance_type}
                              </span>
                              <span
                                className={`text-[9px] font-bold px-2 py-0.2 rounded-full border font-mono ${
                                  wo.status === "COMPLETED"
                                    ? "bg-emerald-50 text-[#22C55E] border-emerald-200"
                                    : wo.status === "IN_PROGRESS"
                                    ? "bg-amber-50 text-[#F59E0B] border-amber-200"
                                    : "bg-[#FFF3C4] text-[#1F2933] border-[#F4B400]/40"
                                }`}
                              >
                                {wo.status}
                              </span>
                            </div>
                            <div className="text-[11px] text-[#667085] mt-0.5">{wo.description}</div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {wo.status !== "IN_PROGRESS" && wo.status !== "COMPLETED" && (
                              <button
                                onClick={() => handleUpdateOrderStatus(wo.id, "IN_PROGRESS")}
                                className="px-2.5 py-1 rounded bg-[#FFF3C4] hover:bg-[#F4B400] text-[#1F2933] font-bold text-[11px] font-mono transition-colors cursor-pointer"
                              >
                                Start Job
                              </button>
                            )}
                            {wo.status !== "COMPLETED" && (
                              <button
                                onClick={() => handleUpdateOrderStatus(wo.id, "COMPLETED")}
                                className="px-2.5 py-1 rounded bg-[#22C55E] hover:bg-emerald-600 text-[#FFFFFF] font-bold text-[11px] font-mono transition-colors cursor-pointer"
                              >
                                Mark Done
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* Actionable Alerts Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#1F2933] font-mono">
                    Active Alerts for {selectedMachine.machine_id}
                  </h3>
                  <Link
                    to="/maintenance-engineer/alerts"
                    className="text-[11px] font-bold text-[#D99A00] hover:underline"
                  >
                    Alert Center
                  </Link>
                </div>

                {alerts.filter((a) => a.machine_id === selectedMachine.machine_id).length === 0 ? (
                  <div className="p-4 rounded-xl bg-[#FFFDF5] border border-[#E5E7EB] text-xs text-[#22C55E] flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>No unacknowledged alerts for {selectedMachine.machine_id}. All sensor limits within bounds.</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {alerts
                      .filter((a) => a.machine_id === selectedMachine.machine_id)
                      .map((alt) => (
                        <div
                          key={alt.id}
                          className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between text-xs"
                        >
                          <div>
                            <div className="font-bold text-rose-800">{alt.message}</div>
                            <div className="text-[10px] text-rose-600 font-mono">
                              Triggered: {new Date(alt.created_at || Date.now()).toLocaleTimeString()}
                            </div>

                          </div>

                          <button
                            onClick={() => handleAcknowledgeAlert(alt.id)}
                            className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-700 text-[#FFFFFF] font-bold text-[11px] font-mono transition-colors cursor-pointer"
                          >
                            Acknowledge
                          </button>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
