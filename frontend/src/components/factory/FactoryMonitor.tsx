import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { machineApi } from "../../api/machineApi";
import { MachineItem, DashboardOverviewResponse } from "../../types/machine";
import { LoadingState } from "../common/LoadingState";
import { ErrorState } from "../common/ErrorState";
import { EmptyState } from "../common/EmptyState";
import {
  Factory,
  Layers,
  ArrowRight,
  RefreshCw,
  Activity,
  AlertTriangle,
  AlertOctagon,
  Clock,
  CheckCircle2,
  Share2,
  Cpu,
} from "lucide-react";

// Standard sequence of textile manufacturing processes
const STANDARD_PROCESS_FLOW = [
  "Spinning",
  "Carding",
  "Drawing",
  "Ring Frame",
  "Weaving",
  "Dyeing",
  "Finishing",
  "Packing",
];

export const FactoryMonitor: React.FC = () => {
  const [machines, setMachines] = useState<MachineItem[]>([]);
  const [overview, setOverview] = useState<DashboardOverviewResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFactoryData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [machinesData, overviewData] = await Promise.all([
        machineApi.getMachines(),
        machineApi.getDashboardOverview(),
      ]);
      setMachines(machinesData);
      setOverview(overviewData);
    } catch (err: any) {
      setError(
        err?.response?.data?.detail || "Unable to load factory data."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFactoryData();
  }, []);

  if (isLoading) {
    return <LoadingState message="Loading factory data..." />;
  }

  if (error || !overview) {
    return (
      <ErrorState
        title="Unable to load factory data"
        message={error || "Could not retrieve production line data from backend."}
        onRetry={fetchFactoryData}
      />
    );
  }

  if (machines.length === 0) {
    return (
      <EmptyState
        title="No production line data available."
        message="No active machines or production lines are currently registered in the database."
      />
    );
  }

  // 1. Factory Summary KPIs
  const totalMachines = overview.total_machines || machines.length;
  const healthyCount = overview.healthy_count;
  const atRiskCount = overview.at_risk_count;
  const criticalCount = overview.critical_count;

  // 2. Production Line Aggregation
  const linesMap = new Map<string, MachineItem[]>();
  machines.forEach((m) => {
    const lineName = m.production_line || "General Line";
    const list = linesMap.get(lineName) || [];
    list.push(m);
    linesMap.set(lineName, list);
  });

  const linesList = Array.from(linesMap.entries()).map(([lineName, lineMachines]) => {
    const critMachines = lineMachines.filter(
      (m) =>
        m.latest_prediction?.health_status === "CRITICAL" ||
        overview.critical_machines.includes(m.machine_id)
    );
    const atRiskMachines = lineMachines.filter(
      (m) => m.latest_prediction?.health_status === "AT_RISK"
    );

    const isCritical = critMachines.length > 0;
    const isAtRisk = !isCritical && atRiskMachines.length > 0;
    const status = isCritical ? "CRITICAL" : isAtRisk ? "AT RISK" : "HEALTHY";
    const machinesAtRiskCount = critMachines.length + atRiskMachines.length;
    const impactLevel = isCritical ? "HIGH" : isAtRisk ? "MEDIUM" : "LOW";
    const estimatedDowntime = isCritical
      ? critMachines.length * 6.0 + atRiskMachines.length * 2.5
      : atRiskMachines.length * 3.0;

    return {
      name: lineName,
      status,
      totalUnits: lineMachines.length,
      machinesAtRiskCount,
      impactLevel,
      estimatedDowntime,
      machines: lineMachines,
      degradedMachines: [...critMachines, ...atRiskMachines],
      isCritical,
      isAtRisk,
    };
  });

  const linesRequiringAttention = linesList.filter(
    (l) => l.status === "CRITICAL" || l.status === "AT RISK"
  );

  // 3. Process Flow Evaluation
  const processFlowNodes = STANDARD_PROCESS_FLOW.map((procName) => {
    const procMachines = machines.filter(
      (m) => m.process.toLowerCase().trim() === procName.toLowerCase().trim()
    );

    const hasCrit = procMachines.some(
      (m) =>
        m.latest_prediction?.health_status === "CRITICAL" ||
        overview.critical_machines.includes(m.machine_id)
    );
    const hasAtRisk =
      !hasCrit &&
      procMachines.some((m) => m.latest_prediction?.health_status === "AT_RISK");

    const status = hasCrit ? "CRITICAL" : hasAtRisk ? "AT_RISK" : "HEALTHY";

    return {
      name: procName,
      count: procMachines.length,
      status,
      machines: procMachines,
    };
  });

  // 4. Percentage distribution for Factory Risk Summary
  const healthyPct = ((healthyCount / (totalMachines || 1)) * 100).toFixed(1);
  const atRiskPct = ((atRiskCount / (totalMachines || 1)) * 100).toFixed(1);
  const criticalPct = ((criticalCount / (totalMachines || 1)) * 100).toFixed(1);

  return (
    <div className="space-y-8">
      {/* 2 & 6. PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E7EB]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1F2933] tracking-tight">
            FACTORY OVERVIEW
          </h1>
          <p className="text-xs sm:text-sm text-[#667085] mt-1">
            Production-line health and operational risk across the textile plant.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchFactoryData}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#FFFFFF] hover:bg-[#FFF3C4] border border-[#E5E7EB] hover:border-[#F4B400] text-[#1F2933] text-xs font-semibold transition-all shadow-xs cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#D99A00]" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* 7. FACTORY SUMMARY ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* TOTAL MACHINES */}
        <div className="p-5 rounded-[14px] bg-[#FFFFFF] border border-[#E5E7EB] shadow-[0_2px_8px_rgba(31,41,51,0.05)] flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#667085]">
              TOTAL MACHINES
            </span>
            <div className="w-10 h-10 rounded-xl bg-[#FFFDF5] border border-[#E5E7EB] flex items-center justify-center shrink-0">
              <Factory className="w-5 h-5 text-[#1F2933]" />
            </div>
          </div>
          <div className="space-y-0.5">
            <div className="text-3xl font-bold tracking-tight text-[#1F2933]">
              {totalMachines}
            </div>
            <p className="text-xs text-[#667085] font-medium">Monitored plant assets</p>
          </div>
        </div>

        {/* HEALTHY */}
        <div className="p-5 rounded-[14px] bg-[#FFFFFF] border border-[#E5E7EB] shadow-[0_2px_8px_rgba(31,41,51,0.05)] flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#667085]">
              HEALTHY
            </span>
            <div className="w-10 h-10 rounded-xl bg-[#DCFCE7] border border-[#22C55E]/30 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 text-[#22C55E]" />
            </div>
          </div>
          <div className="space-y-0.5">
            <div className="text-3xl font-bold tracking-tight text-[#22C55E]">
              {healthyCount}
            </div>
            <p className="text-xs text-[#667085] font-medium">Nominal operations ({healthyPct}%)</p>
          </div>
        </div>

        {/* AT RISK */}
        <div className="p-5 rounded-[14px] bg-[#FFFFFF] border border-[#E5E7EB] shadow-[0_2px_8px_rgba(31,41,51,0.05)] flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#667085]">
              AT RISK
            </span>
            <div className="w-10 h-10 rounded-xl bg-[#FEF3C7] border border-[#F59E0B]/30 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-[#F59E0B]" />
            </div>
          </div>
          <div className="space-y-0.5">
            <div className="text-3xl font-bold tracking-tight text-[#F59E0B]">
              {atRiskCount}
            </div>
            <p className="text-xs text-[#667085] font-medium">Elevated risk ({atRiskPct}%)</p>
          </div>
        </div>

        {/* CRITICAL */}
        <div className="p-5 rounded-[14px] bg-[#FFFFFF] border border-[#E5E7EB] shadow-[0_2px_8px_rgba(31,41,51,0.05)] flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#667085]">
              CRITICAL
            </span>
            <div className="w-10 h-10 rounded-xl bg-[#FEE2E2] border border-[#EF4444]/30 flex items-center justify-center shrink-0">
              <AlertOctagon className="w-5 h-5 text-[#EF4444]" />
            </div>
          </div>
          <div className="space-y-0.5">
            <div className="text-3xl font-bold tracking-tight text-[#EF4444]">
              {criticalCount}
            </div>
            <p className="text-xs text-[#667085] font-medium">Require attention ({criticalPct}%)</p>
          </div>
        </div>
      </div>

      {/* 8-11. PRODUCTION LINE OVERVIEW */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold text-[#1F2933]">
              PRODUCTION LINE OVERVIEW
            </h2>
            <p className="text-xs text-[#667085] mt-0.5">
              Operational status and disruption risk across all active textile manufacturing lines.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {linesList.map((line) => {
            const statusBadge =
              line.status === "CRITICAL"
                ? { bg: "bg-[#FEE2E2]", text: "text-[#EF4444]", dot: "bg-[#EF4444]" }
                : line.status === "AT RISK"
                ? { bg: "bg-[#FEF3C7]", text: "text-[#F59E0B]", dot: "bg-[#F59E0B]" }
                : { bg: "bg-[#DCFCE7]", text: "text-[#22C55E]", dot: "bg-[#22C55E]" };

            const impactTextColor =
              line.impactLevel === "HIGH"
                ? "text-[#EF4444]"
                : line.impactLevel === "MEDIUM"
                ? "text-[#F59E0B]"
                : "text-[#22C55E]";

            return (
              <div
                key={line.name}
                className="p-5 rounded-[14px] bg-[#FFFFFF] border border-[#E5E7EB] shadow-[0_2px_8px_rgba(31,41,51,0.05)] hover:border-[#F4B400] transition-all space-y-4 flex flex-col justify-between"
              >
                <div>
                  {/* Line Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
                    <div>
                      <h3 className="text-base font-bold font-mono text-[#1F2933]">
                        {line.name}
                      </h3>
                      <p className="text-xs text-[#667085] mt-0.5">
                        {line.totalUnits} Machines Installed
                      </p>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${statusBadge.bg} ${statusBadge.text}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot}`} />
                      {line.status}
                    </span>
                  </div>

                  {/* Line Metrics */}
                  <div className="grid grid-cols-2 gap-3 py-3 text-xs">
                    <div className="p-3 rounded-xl bg-[#FFFDF5] border border-[#E5E7EB]">
                      <span className="text-[#667085] block text-[11px]">Machines at Risk</span>
                      <strong
                        className={`text-sm font-bold font-mono ${
                          line.machinesAtRiskCount > 0 ? "text-[#EF4444]" : "text-[#22C55E]"
                        }`}
                      >
                        {line.machinesAtRiskCount} {line.machinesAtRiskCount === 1 ? "Unit" : "Units"}
                      </strong>
                    </div>

                    <div className="p-3 rounded-xl bg-[#FFFDF5] border border-[#E5E7EB]">
                      <span className="text-[#667085] block text-[11px]">Production Impact</span>
                      <strong className={`text-sm font-bold ${impactTextColor}`}>
                        {line.impactLevel}
                      </strong>
                    </div>

                    <div className="col-span-2 p-3 rounded-xl bg-[#FFFDF5] border border-[#E5E7EB] flex items-center justify-between">
                      <span className="text-[#667085] text-[11px]">Estimated Downtime</span>
                      <strong className="text-sm font-bold font-mono text-[#1F2933]">
                        {line.estimatedDowntime > 0
                          ? `${line.estimatedDowntime.toFixed(1)} hrs`
                          : "0 hrs (Nominal)"}
                      </strong>
                    </div>
                  </div>

                  {/* Line Units Badges */}
                  <div className="pt-2">
                    <span className="text-[11px] font-semibold text-[#667085] block mb-2">
                      Line Machinery Units:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {line.machines.map((m) => {
                        const isMDisabled =
                          m.latest_prediction?.health_status === "CRITICAL" ||
                          overview.critical_machines.includes(m.machine_id);
                        const isMAtRisk = m.latest_prediction?.health_status === "AT_RISK";

                        const badgeColor = isMDisabled
                          ? "bg-[#FEE2E2] text-[#EF4444] border-[#EF4444]/30"
                          : isMAtRisk
                          ? "bg-[#FEF3C7] text-[#F59E0B] border-[#F59E0B]/30"
                          : "bg-[#FFFFFF] text-[#1F2933] border-[#E5E7EB]";

                        return (
                          <Link
                            key={m.machine_id}
                            to={`/intelligence/${m.machine_id}`}
                            title={`${m.machine_id} (${m.process})`}
                            className={`px-2 py-1 rounded-md text-[11px] font-mono font-semibold border transition-colors hover:border-[#F4B400] ${badgeColor}`}
                          >
                            {m.machine_id}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Footer link to Impact */}
                {line.degradedMachines.length > 0 && (
                  <div className="pt-3 border-t border-[#E5E7EB]">
                    <Link
                      to={`/impact/${line.degradedMachines[0].machine_id}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1F2933] hover:text-[#D99A00] transition-colors"
                    >
                      <Share2 className="w-3.5 h-3.5 text-[#F4B400]" />
                      <span>View Line Cascade Impact →</span>
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 12-13. FACTORY PROCESS FLOW */}
      <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E5E7EB]">
          <div>
            <h2 className="text-lg font-semibold text-[#1F2933]">
              PRODUCTION FLOW
            </h2>
            <p className="text-xs text-[#667085] mt-0.5">
              Major textile manufacturing sequential stages and operational health status.
            </p>
          </div>
        </div>

        {/* Process Flow Nodes */}
        <div className="flex flex-wrap items-center gap-3 py-2">
          {processFlowNodes.map((proc, idx, arr) => {
            const statusDot =
              proc.status === "CRITICAL"
                ? "bg-[#EF4444]"
                : proc.status === "AT_RISK"
                ? "bg-[#F59E0B]"
                : "bg-[#22C55E]";

            const statusBorder =
              proc.status === "CRITICAL"
                ? "border-rose-200 bg-rose-50/40"
                : proc.status === "AT_RISK"
                ? "border-amber-200 bg-amber-50/40"
                : "border-[#E5E7EB] bg-[#FFFFFF]";

            return (
              <React.Fragment key={proc.name}>
                <div
                  className={`p-3.5 rounded-xl border ${statusBorder} shadow-xs space-y-1 min-w-[130px] flex-1 sm:flex-initial`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[#1F2933]">
                      {proc.name}
                    </span>
                    <span className={`w-2 h-2 rounded-full shrink-0 ${statusDot}`} />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[#667085]">
                    <span>{proc.count} {proc.count === 1 ? "unit" : "units"}</span>
                    <span
                      className={`font-semibold text-[10px] uppercase ${
                        proc.status === "CRITICAL"
                          ? "text-[#EF4444]"
                          : proc.status === "AT_RISK"
                          ? "text-[#F59E0B]"
                          : "text-[#22C55E]"
                      }`}
                    >
                      {proc.status.replace("_", " ")}
                    </span>
                  </div>
                </div>

                {idx < arr.length - 1 && (
                  <ArrowRight className="w-4 h-4 text-[#F4B400] shrink-0 hidden sm:block" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* 14. FACTORY RISK SUMMARY */}
      <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E5E7EB]">
          <div>
            <h2 className="text-lg font-semibold text-[#1F2933]">
              FACTORY RISK SUMMARY
            </h2>
            <p className="text-xs text-[#667085] mt-0.5">
              Plant asset distribution and disruption footprint.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-medium">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E]" />
              <span className="text-[#1F2933]">
                Healthy: <strong>{healthyCount}</strong> ({healthyPct}%)
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
              <span className="text-[#1F2933]">
                At Risk: <strong>{atRiskCount}</strong> ({atRiskPct}%)
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
              <span className="text-[#1F2933]">
                Critical: <strong>{criticalCount}</strong> ({criticalPct}%)
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F4B400]" />
              <span className="text-[#1F2933]">
                Lines Affected: <strong>{linesRequiringAttention.length}</strong> / {linesList.length}
              </span>
            </div>
          </div>
        </div>

        {/* Visual Distribution Segmented Bar */}
        <div className="w-full h-3.5 rounded-full bg-[#F8F9FA] border border-[#E5E7EB] overflow-hidden flex">
          {healthyCount > 0 && (
            <div
              style={{ width: `${(healthyCount / totalMachines) * 100}%` }}
              className="h-full bg-[#22C55E] transition-all duration-500"
              title={`Healthy: ${healthyCount}`}
            />
          )}
          {atRiskCount > 0 && (
            <div
              style={{ width: `${(atRiskCount / totalMachines) * 100}%` }}
              className="h-full bg-[#F59E0B] transition-all duration-500"
              title={`At Risk: ${atRiskCount}`}
            />
          )}
          {criticalCount > 0 && (
            <div
              style={{ width: `${(criticalCount / totalMachines) * 100}%` }}
              className="h-full bg-[#EF4444] transition-all duration-500"
              title={`Critical: ${criticalCount}`}
            />
          )}
        </div>
      </div>

      {/* 15. HIGH-IMPACT LINES (LINES REQUIRING ATTENTION) */}
      <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
          <div>
            <h2 className="text-lg font-semibold text-[#1F2933]">
              LINES REQUIRING ATTENTION
            </h2>
            <p className="text-xs text-[#667085] mt-0.5">
              Production lines containing critical or at-risk machinery requiring intervention.
            </p>
          </div>
        </div>

        {linesRequiringAttention.length === 0 ? (
          <div className="p-8 rounded-xl bg-[#FFFDF5] border border-emerald-200 text-center flex flex-col items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-[#22C55E] mb-2" />
            <h4 className="text-sm font-bold text-[#1F2933]">All Production Lines Healthy</h4>
            <p className="text-xs text-[#667085] mt-1">
              No production lines are currently experiencing active degradation or risk.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {linesRequiringAttention.map((line) => (
              <div
                key={line.name}
                className="p-4 rounded-xl bg-[#FFFFFF] border border-[#E5E7EB] hover:border-[#F4B400] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold font-mono text-[#1F2933]">
                      {line.name}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        line.status === "CRITICAL"
                          ? "bg-[#FEE2E2] text-[#EF4444]"
                          : "bg-[#FEF3C7] text-[#F59E0B]"
                      }`}
                    >
                      {line.status}
                    </span>
                  </div>

                  <p className="text-xs text-[#667085]">
                    <strong className="text-[#1F2933]">{line.machinesAtRiskCount} machines affected</strong> •{" "}
                    <span className="font-semibold text-[#EF4444]">{line.impactLevel} Production Impact</span> •{" "}
                    <span>Estimated Downtime: <strong className="text-[#1F2933]">{line.estimatedDowntime.toFixed(1)} hrs</strong></span>
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
                  {line.degradedMachines.length > 0 && (
                    <Link
                      to={`/impact/${line.degradedMachines[0].machine_id}`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#FFFFFF] hover:bg-[#FFF3C4] border border-[#E5E7EB] hover:border-[#F4B400] text-xs font-bold text-[#1F2933] transition-all shadow-xs"
                    >
                      <Share2 className="w-3.5 h-3.5 text-[#D99A00]" />
                      <span>View Impact</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#F4B400]" />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
