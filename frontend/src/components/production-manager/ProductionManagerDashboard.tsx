import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { machineApi } from "../../api/machineApi";
import { alertApi } from "../../api/alertApi";
import { DashboardOverviewResponse, MachineItem } from "../../types/machine";
import { AlertItem } from "../../types/alert";
import { LoadingState } from "../common/LoadingState";
import { ErrorState } from "../common/ErrorState";
import {
  Layers,
  RefreshCw,
  GitFork,
  Clock,
  ArrowRight,
  Factory,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  Activity,
} from "lucide-react";

export const ProductionManagerDashboard: React.FC = () => {
  const [overview, setOverview] = useState<DashboardOverviewResponse | null>(null);
  const [machines, setMachines] = useState<MachineItem[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProductionData = async () => {
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
          "Unable to load production risk telemetry from the FFIS backend."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProductionData();
  }, []);

  if (isLoading) {
    return <LoadingState message="Aggregating Production Risk & Line Availability..." />;
  }

  if (error || !overview) {
    return (
      <ErrorState
        title="Production Risk Telemetry Unavailable"
        message={error || "Could not retrieve production data."}
        onRetry={fetchProductionData}
      />
    );
  }

  // Aggregate by Production Line
  const linesMap = new Map<string, MachineItem[]>();
  machines.forEach((m) => {
    const list = linesMap.get(m.production_line) || [];
    list.push(m);
    linesMap.set(m.production_line, list);
  });

  const linesList = Array.from(linesMap.entries()).map(([lineName, lineMachines]) => {
    const lineAtRisk = lineMachines.filter(
      (m) =>
        m.latest_prediction?.health_status === "AT_RISK" ||
        m.latest_prediction?.health_status === "CRITICAL"
    );

    const hasCritical = lineMachines.some(
      (m) => m.latest_prediction?.health_status === "CRITICAL"
    );

    const estimatedDowntime = lineAtRisk.length > 0 ? lineAtRisk.length * 4.5 : 0;
    const impactLevel = hasCritical ? "HIGH" : lineAtRisk.length > 0 ? "MEDIUM" : "LOW";

    return {
      name: lineName,
      machines: lineMachines,
      atRiskCount: lineAtRisk.length,
      isAtRisk: lineAtRisk.length > 0,
      hasCritical,
      impactLevel,
      estimatedDowntime,
    };
  });

  const linesAtRiskCount = linesList.filter((l) => l.isAtRisk).length;
  const totalEstimatedDowntime = linesList.reduce((acc, l) => acc + l.estimatedDowntime, 0);

  // Critical bottleneck machines (high risk + high criticality)
  const bottlenecks = machines
    .filter(
      (m) =>
        (m.criticality === "CRITICAL" || m.criticality === "HIGH") &&
        (m.latest_prediction?.health_status === "CRITICAL" ||
          m.latest_prediction?.health_status === "AT_RISK")
    )
    .sort((a, b) => {
      const aRisk = a.latest_prediction?.failure_probability || 0;
      const bRisk = b.latest_prediction?.failure_probability || 0;
      return bRisk - aRisk;
    });

  return (
    <div className="space-y-6">
      {/* Workspace Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E7EB]">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-6 h-6 text-[#D99A00]" />
            <h1 className="text-xl font-bold text-[#1F2933] font-mono tracking-tight">
              PRODUCTION RISK CENTER
            </h1>
          </div>
          <p className="text-xs text-[#667085] mt-1">
            Production line availability, bottleneck equipment, downstream cascade exposure, and operational downtime risk.
          </p>
        </div>

        <button
          onClick={fetchProductionData}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#FFFFFF] hover:bg-[#FFF3C4] border border-[#E5E7EB] hover:border-[#F4B400] text-[#1F2933] text-xs font-semibold transition-all shadow-xs cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#D99A00]" />
          <span>Refresh Production</span>
        </button>
      </div>

      {/* Production Risk KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-[#667085]">
            <span className="font-bold uppercase tracking-wider font-mono">TOTAL LINES MONITORED</span>
            <Factory className="w-4 h-4 text-[#D99A00]" />
          </div>
          <div className="text-2xl font-extrabold text-[#1F2933] font-mono">
            {linesList.length} <span className="text-xs font-normal text-[#667085]">Production Lines</span>
          </div>
          <p className="text-[11px] text-[#667085]">Line-A, Line-B, Line-C</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-[#667085]">
            <span className="font-bold uppercase tracking-wider font-mono">LINES AT RISK</span>
            <AlertTriangle className="w-4 h-4 text-[#F59E0B]" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-[#F59E0B]">
            {linesAtRiskCount} <span className="text-xs font-normal text-[#667085]">of {linesList.length} Lines</span>
          </div>
          <p className="text-[11px] text-[#667085]">Exposed to machine failure</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-[#667085]">
            <span className="font-bold uppercase tracking-wider font-mono">BOTTLENECK MACHINES</span>
            <GitFork className="w-4 h-4 text-[#EF4444]" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-[#EF4444]">
            {bottlenecks.length} <span className="text-xs font-normal text-[#667085]">Critical Bottlenecks</span>
          </div>
          <p className="text-[11px] text-[#667085]">High cascading impact</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-[#667085]">
            <span className="font-bold uppercase tracking-wider font-mono">ESTIMATED DOWNTIME EXPOSURE</span>
            <TrendingDown className="w-4 h-4 text-[#D99A00]" />
          </div>
          <div className="text-2xl font-extrabold text-[#1F2933] font-mono">
            {totalEstimatedDowntime.toFixed(1)}{" "}
            <span className="text-xs font-normal text-[#667085]">Hours</span>
          </div>
          <p className="text-[11px] text-[#667085]">Cumulative operational risk</p>
        </div>
      </div>

      {/* Production Lines Overview */}
      <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#D99A00]" />
            <h2 className="text-sm font-bold text-[#1F2933] font-mono uppercase tracking-wider">
              Production Line Health &amp; Availability
            </h2>
          </div>
          <Link
            to="/production-manager/lines"
            className="text-xs font-bold text-[#D99A00] hover:underline flex items-center gap-1"
          >
            <span>Line Breakdown</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {linesList.map((line) => (
            <div
              key={line.name}
              className={`p-5 rounded-xl border flex flex-col justify-between space-y-4 ${
                line.hasCritical
                  ? "bg-[#FFFDF5] border-[#EF4444]/40"
                  : line.isAtRisk
                  ? "bg-[#FFFDF5] border-[#F59E0B]/40"
                  : "bg-[#FFFFFF] border-[#E5E7EB]"
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-[#1F2933] font-mono">{line.name}</h3>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border font-mono ${
                      line.hasCritical
                        ? "bg-rose-50 text-[#EF4444] border-rose-200"
                        : line.isAtRisk
                        ? "bg-amber-50 text-[#F59E0B] border-amber-200"
                        : "bg-emerald-50 text-[#22C55E] border-emerald-200"
                    }`}
                  >
                    {line.hasCritical ? "Critical" : line.isAtRisk ? "At Risk" : "Healthy"}
                  </span>
                </div>

                <div className="mt-3 space-y-1.5 text-xs text-[#667085]">
                  <div className="flex justify-between">
                    <span>Total Machines:</span>
                    <span className="font-bold text-[#1F2933]">{line.machines.length} Units</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Machines at Risk:</span>
                    <span
                      className={`font-bold ${
                        line.atRiskCount > 0 ? "text-[#EF4444]" : "text-[#22C55E]"
                      }`}
                    >
                      {line.atRiskCount} Units
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Est. Line Downtime:</span>
                    <span className="font-bold text-[#1F2933]">{line.estimatedDowntime}h</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#E5E7EB] flex items-center justify-between text-xs">
                <span className="text-[#667085]">Impact Level:</span>
                <span className="font-bold font-mono text-[#1F2933]">{line.impactLevel}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottlenecks & Downstream Exposure */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Critical Bottlenecks List */}
        <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
            <div className="flex items-center gap-2">
              <GitFork className="w-5 h-5 text-[#EF4444]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#1F2933] font-mono">
                Bottleneck Equipment
              </h3>
            </div>
            <Link
              to="/production-manager/schedule-bottlenecks"
              className="text-[11px] font-bold text-[#D99A00] hover:underline"
            >
              Bottleneck Matrix
            </Link>
          </div>

          <div className="space-y-2">
            {bottlenecks.map((m) => (
              <div
                key={m.machine_id}
                className="p-3.5 rounded-xl bg-[#FFFDF5] border border-[#E5E7EB] flex items-center justify-between text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold font-mono text-[#1F2933]">{m.machine_id}</span>
                    <span className="text-[10px] text-[#667085] font-mono">{m.production_line}</span>
                  </div>
                  <div className="text-[11px] text-[#667085]">{m.process}</div>
                </div>

                <div className="text-right">
                  <div className="font-mono font-bold text-[#EF4444]">
                    {Math.round((m.latest_prediction?.failure_probability || 0) * 100)}% Failure Risk
                  </div>
                  <div className="text-[10px] text-[#667085] font-mono">
                    RUL: {m.latest_prediction?.predicted_rul.toFixed(1)} Cyc
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Schedule & Operational Limits Notice */}
        <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-[#E5E7EB] pb-3">
            <Clock className="w-5 h-5 text-[#D99A00]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#1F2933] font-mono">
              Production Schedule &amp; Output Integrity
            </h3>
          </div>

          <div className="p-4 rounded-xl bg-[#FFFDF5] border border-[#F4B400]/40 space-y-2">
            <div className="text-xs font-bold text-[#1F2933] flex items-center gap-1.5">
              <span>Authentic Data Policy</span>
            </div>
            <p className="text-xs text-[#667085] leading-relaxed">
              Per FFIS operational governance standards, production scheduling outputs, shift batch quantities, and financial delivery delays are strictly bound to verified factory telemetry. Fabricated or simulated production quotas are prohibited.
            </p>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1.5 border-b border-[#E5E7EB]">
              <span className="text-[#667085]">Scheduled Shift Windows:</span>
              <span className="font-mono font-bold text-[#1F2933]">Available / Next Shift / Planned</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#E5E7EB]">
              <span className="text-[#667085]">Batch Output Scheduling:</span>
              <span className="font-mono text-[#D99A00] font-bold">Awaiting ERP Integration</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-[#667085]">Cascade Vulnerability Index:</span>
              <span className="font-mono font-bold text-[#22C55E]">High Fidelity Telemetry Bound</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
