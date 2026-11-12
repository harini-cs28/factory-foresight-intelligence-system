import React from "react";
import { Link } from "react-router-dom";
import { DashboardOverviewResponse, MachineItem } from "../../types/machine";
import { AlertItem } from "../../types/alert";
import {
  Activity,
  AlertTriangle,
  AlertOctagon,
  Layers,
  Clock,
  ArrowRight,
  Wrench,
  CheckCircle2,
  Cpu,
  RefreshCw,
} from "lucide-react";

interface PlantManagerDashboardProps {
  overview: DashboardOverviewResponse;
  machines: MachineItem[];
  alerts?: AlertItem[];
  onRefresh?: () => void;
}

export const PlantManagerDashboard: React.FC<PlantManagerDashboardProps> = ({
  overview,
  machines,
  onRefresh,
}) => {
  // 1. Factory Health Calculations from actual backend data
  const totalMachines = overview.total_machines || machines.length || 1;
  const healthyCount = overview.healthy_count || 0;
  const atRiskCount = overview.at_risk_count || 0;
  const criticalCount = overview.critical_count || 0;
  const factoryHealthPercent = Math.round((healthyCount / totalMachines) * 100);

  // Health state tone
  const healthTone =
    factoryHealthPercent >= 80
      ? { text: "Healthy Operations", color: "text-[#22C55E]", bg: "bg-emerald-50", border: "border-emerald-200" }
      : factoryHealthPercent >= 50
      ? { text: "Attention Required", color: "text-[#F59E0B]", bg: "bg-[#FEF3C7]", border: "border-[#F59E0B]/30" }
      : { text: "Critical Attention", color: "text-[#EF4444]", bg: "bg-[#FEE2E2]", border: "border-[#EF4444]/30" };

  // 2. Critical & At-Risk Machines Watchlist sorted by operational priority
  const evaluatedMachines = [...machines].map((m) => {
    const isCrit =
      m.latest_prediction?.health_status === "CRITICAL" ||
      overview.critical_machines.includes(m.machine_id);
    const isAtRisk = m.latest_prediction?.health_status === "AT_RISK";
    const status = isCrit ? "CRITICAL" : isAtRisk ? "AT_RISK" : "HEALTHY";
    const failureProb = m.latest_prediction ? m.latest_prediction.failure_probability : 0;
    const rul = m.latest_prediction ? m.latest_prediction.predicted_rul : 999;

    return {
      ...m,
      computedStatus: status,
      failureProb,
      rul,
    };
  });

  // Sort: 1. Critical first, 2. Highest failure probability, 3. Lowest RUL
  const watchlist = evaluatedMachines
    .filter((m) => m.computedStatus === "CRITICAL" || m.computedStatus === "AT_RISK")
    .sort((a, b) => {
      if (a.computedStatus === "CRITICAL" && b.computedStatus !== "CRITICAL") return -1;
      if (a.computedStatus !== "CRITICAL" && b.computedStatus === "CRITICAL") return 1;
      if (b.failureProb !== a.failureProb) return b.failureProb - a.failureProb;
      return a.rul - b.rul;
    });

  // 3. Production Lines Risk Aggregation
  const linesMap = new Map<string, MachineItem[]>();
  machines.forEach((m) => {
    const line = m.production_line || "General";
    const list = linesMap.get(line) || [];
    list.push(m);
    linesMap.set(line, list);
  });

  const linesList = Array.from(linesMap.entries()).map(([lineName, lineMachines]) => {
    const lineCriticalCount = lineMachines.filter(
      (m) =>
        m.latest_prediction?.health_status === "CRITICAL" ||
        overview.critical_machines.includes(m.machine_id)
    ).length;

    const lineAtRiskCount = lineMachines.filter(
      (m) => m.latest_prediction?.health_status === "AT_RISK"
    ).length;

    const totalLineRisk = lineCriticalCount + lineAtRiskCount;
    const isLineCritical = lineCriticalCount > 0;
    const isLineAtRisk = !isLineCritical && lineAtRiskCount > 0;

    const status = isLineCritical ? "Critical" : isLineAtRisk ? "At Risk" : "Healthy";
    const impactLevel = isLineCritical ? "High" : isLineAtRisk ? "Medium" : "Low";
    const estimatedDowntime = isLineCritical
      ? lineCriticalCount * 6.0 + lineAtRiskCount * 2.5
      : lineAtRiskCount * 3.0;

    return {
      name: lineName,
      status,
      machinesAtRisk: totalLineRisk,
      impactLevel,
      estimatedDowntime,
      isCritical: isLineCritical,
      isAtRisk: isLineAtRisk,
      totalUnits: lineMachines.length,
    };
  });

  const linesAtRiskCount = linesList.filter((l) => l.machinesAtRisk > 0).length;
  const totalEstimatedDowntime = linesList.reduce((acc, l) => acc + l.estimatedDowntime, 0);

  // 4. Prescriptive Maintenance Priorities
  const maintenancePriorities = watchlist.slice(0, 5).map((m) => {
    const isCrit = m.computedStatus === "CRITICAL";
    const failPercent = Math.round(m.failureProb * 100);
    const rulCycles = Math.round(m.rul);

    return {
      machineId: m.machine_id,
      process: m.process,
      line: m.production_line,
      priority: isCrit ? "URGENT" : "PREVENTIVE",
      recommendedAction: isCrit
        ? "Schedule urgent maintenance inspection"
        : "Perform scheduled condition servicing",
      shortReason: isCrit
        ? `${failPercent}% failure risk and ${rulCycles} cycles RUL.`
        : `Elevated operational risk with ${rulCycles} cycles remaining useful life.`,
    };
  });

  // Horizontal distribution percentages
  const healthyPct = ((healthyCount / totalMachines) * 100).toFixed(1);
  const atRiskPct = ((atRiskCount / totalMachines) * 100).toFixed(1);
  const criticalPct = ((criticalCount / totalMachines) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      {/* 4. PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E7EB]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1F2933] tracking-tight">
            FACTORY COMMAND CENTER
          </h1>
          <p className="text-xs sm:text-sm text-[#667085] mt-1">
            Factory health, production risk, and maintenance priorities at a glance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Subtle Operational Status */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FFFFFF] border border-[#E5E7EB] text-xs text-[#1F2933] shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
            <span className="font-semibold text-[#1F2933]">Factory Operational</span>
          </div>

          {onRefresh && (
            <button
              onClick={onRefresh}
              title="Refresh operational telemetry"
              className="p-2 rounded-xl bg-[#FFFFFF] hover:bg-[#FFF3C4] border border-[#E5E7EB] hover:border-[#F4B400] text-[#1F2933] transition-all shadow-xs cursor-pointer"
            >
              <RefreshCw className="w-4 h-4 text-[#D99A00]" />
            </button>
          )}
        </div>
      </div>

      {/* 9-15. TOP KPI ROW (EXACTLY 5 CARDS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {/* CARD 1: FACTORY HEALTH */}
        <div className="p-5 rounded-[14px] bg-[#FFFFFF] border border-[#E5E7EB] shadow-[0_2px_8px_rgba(31,41,51,0.05)] flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#667085]">
              FACTORY HEALTH
            </span>
            <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${healthTone.bg} ${healthTone.border}`}>
              <Activity className={`w-5 h-5 ${healthTone.color}`} />
            </div>
          </div>
          <div className="space-y-0.5">
            <div className={`text-3xl font-bold tracking-tight ${healthTone.color}`}>
              {factoryHealthPercent}%
            </div>
            <p className="text-xs text-[#667085] font-medium">{healthTone.text}</p>
          </div>
        </div>

        {/* CARD 2: CRITICAL MACHINES */}
        <div className="p-5 rounded-[14px] bg-[#FFFFFF] border border-[#E5E7EB] shadow-[0_2px_8px_rgba(31,41,51,0.05)] flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#667085]">
              CRITICAL MACHINES
            </span>
            <div className="w-10 h-10 rounded-xl bg-[#FEE2E2] border border-[#EF4444]/20 flex items-center justify-center shrink-0">
              <AlertOctagon className="w-5 h-5 text-[#EF4444]" />
            </div>
          </div>
          <div className="space-y-0.5">
            <div className="text-3xl font-bold tracking-tight text-[#EF4444]">
              {criticalCount}
            </div>
            <p className="text-xs text-[#667085] font-medium">
              {criticalCount > 0 ? "Require attention" : "None critical"}
            </p>
          </div>
        </div>

        {/* CARD 3: MACHINES AT RISK */}
        <div className="p-5 rounded-[14px] bg-[#FFFFFF] border border-[#E5E7EB] shadow-[0_2px_8px_rgba(31,41,51,0.05)] flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#667085]">
              MACHINES AT RISK
            </span>
            <div
              className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${
                atRiskCount > 0
                  ? "bg-[#FEF3C7] border-[#F59E0B]/30"
                  : "bg-[#DCFCE7] border-[#22C55E]/20"
              }`}
            >
              <AlertTriangle
                className={`w-5 h-5 ${atRiskCount > 0 ? "text-[#F59E0B]" : "text-[#22C55E]"}`}
              />
            </div>
          </div>
          <div className="space-y-0.5">
            <div
              className={`text-3xl font-bold tracking-tight ${
                atRiskCount > 0 ? "text-[#F59E0B]" : "text-[#22C55E]"
              }`}
            >
              {atRiskCount}
            </div>
            <p className="text-xs text-[#667085] font-medium">
              {atRiskCount > 0 ? "Elevated risk" : "Currently stable"}
            </p>
          </div>
        </div>

        {/* CARD 4: LINES AT RISK */}
        <div className="p-5 rounded-[14px] bg-[#FFFFFF] border border-[#E5E7EB] shadow-[0_2px_8px_rgba(31,41,51,0.05)] flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#667085]">
              LINES AT RISK
            </span>
            <div
              className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${
                linesAtRiskCount > 0
                  ? "bg-[#FEF3C7] border-[#F59E0B]/30"
                  : "bg-[#FFFDF5] border-[#E5E7EB]"
              }`}
            >
              <Layers
                className={`w-5 h-5 ${
                  linesAtRiskCount > 0 ? "text-[#F59E0B]" : "text-[#667085]"
                }`}
              />
            </div>
          </div>
          <div className="space-y-0.5">
            <div
              className={`text-3xl font-bold tracking-tight ${
                linesAtRiskCount > 0 ? "text-[#F59E0B]" : "text-[#1F2933]"
              }`}
            >
              {linesAtRiskCount}
            </div>
            <p className="text-xs text-[#667085] font-medium">Lines affected</p>
          </div>
        </div>

        {/* CARD 5: POTENTIAL DOWNTIME */}
        <div className="p-5 rounded-[14px] bg-[#FFFFFF] border border-[#E5E7EB] shadow-[0_2px_8px_rgba(31,41,51,0.05)] flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#667085]">
              POTENTIAL DOWNTIME
            </span>
            <div className="w-10 h-10 rounded-xl bg-[#FFFDF5] border border-[#E5E7EB] flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-[#1F2933]" />
            </div>
          </div>
          <div className="space-y-0.5">
            <div className="text-3xl font-bold tracking-tight text-[#1F2933]">
              {totalEstimatedDowntime.toFixed(1)}{" "}
              <span className="text-base font-normal text-[#667085]">hrs</span>
            </div>
            <p className="text-xs text-[#667085] font-medium">Estimated impact</p>
          </div>
        </div>
      </div>

      {/* 16. FACTORY RISK OVERVIEW */}
      <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-[#1F2933]">
              FACTORY RISK OVERVIEW
            </h2>
            <p className="text-xs text-[#667085] mt-0.5">
              Machine health distribution across {totalMachines} active assets
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs font-medium">
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
          </div>
        </div>

        {/* Clean Segmented Horizontal Progress Bar */}
        <div className="w-full h-3 rounded-full bg-[#F8F9FA] border border-[#E5E7EB] overflow-hidden flex">
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

      {/* 17-19. CRITICAL MACHINE WATCHLIST */}
      <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-[#1F2933]">
              CRITICAL MACHINE WATCHLIST
            </h2>
            <p className="text-xs text-[#667085] mt-0.5">
              Machines requiring immediate operational attention.
            </p>
          </div>

          <Link
            to="/plant-manager/machines"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1F2933] hover:text-[#D99A00] transition-colors"
          >
            <span>View All Machines</span>
            <ArrowRight className="w-4 h-4 text-[#F4B400]" />
          </Link>
        </div>

        {watchlist.length === 0 ? (
          <div className="p-8 rounded-xl bg-[#FFFDF5] border border-emerald-200 text-center flex flex-col items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-[#22C55E] mb-2" />
            <h4 className="text-sm font-bold text-[#1F2933]">No critical machines</h4>
            <p className="text-xs text-[#667085] mt-1 max-w-md">
              No machines currently require critical attention. All factory assets are operating within nominal thresholds.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-[#E5E7EB]">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E5E7EB] text-[#667085] uppercase tracking-wider bg-[#FFFDF5] font-semibold">
                  <th className="p-3.5">MACHINE</th>
                  <th className="p-3.5">PROCESS</th>
                  <th className="p-3.5">LINE</th>
                  <th className="p-3.5">FAILURE RISK</th>
                  <th className="p-3.5">RUL</th>
                  <th className="p-3.5">STATUS</th>
                  <th className="p-3.5 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {watchlist.map((m) => {
                  const isCrit = m.computedStatus === "CRITICAL";
                  const failProbFormatted = `${Math.round(m.failureProb * 100)}%`;
                  const rulFormatted = `${m.rul.toFixed(0)} cycles`;

                  return (
                    <tr
                      key={m.machine_id}
                      className="hover:bg-[#FFFDF5] transition-colors bg-[#FFFFFF] text-[#1F2933]"
                    >
                      <td className="p-3.5 font-bold font-mono text-[#1F2933]">
                        {m.machine_id}
                      </td>
                      <td className="p-3.5 font-medium">{m.process}</td>
                      <td className="p-3.5 text-[#667085]">{m.production_line}</td>
                      <td className="p-3.5 font-bold font-mono">
                        <span className={isCrit ? "text-[#EF4444]" : "text-[#F59E0B]"}>
                          {failProbFormatted}
                        </span>
                      </td>
                      <td className="p-3.5 text-[#667085] font-mono">{rulFormatted}</td>
                      <td className="p-3.5">
                        <span
                          className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                            isCrit
                              ? "bg-[#FEE2E2] text-[#EF4444]"
                              : "bg-[#FEF3C7] text-[#F59E0B]"
                          }`}
                        >
                          {m.computedStatus.replace("_", " ")}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <Link
                          to={`/intelligence/${m.machine_id}`}
                          className="inline-flex items-center gap-1 font-semibold text-[#1F2933] hover:text-[#D99A00] transition-colors"
                        >
                          <span>View</span>
                          <ArrowRight className="w-3.5 h-3.5 text-[#F4B400]" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 20-23. TWO-COLUMN SECTION: PRODUCTION LINE RISK & MAINTENANCE PRIORITIES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT COLUMN: PRODUCTION LINE RISK */}
        <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-xs space-y-4">
          <div className="pb-3 border-b border-[#E5E7EB]">
            <h2 className="text-base sm:text-lg font-semibold text-[#1F2933]">
              PRODUCTION LINE RISK
            </h2>
            <p className="text-xs text-[#667085] mt-0.5">
              Production continuity impact per manufacturing line.
            </p>
          </div>

          <div className="space-y-3">
            {linesList.map((line) => {
              const statusBadgeStyle =
                line.status === "Critical"
                  ? "bg-[#FEE2E2] text-[#EF4444]"
                  : line.status === "At Risk"
                  ? "bg-[#FEF3C7] text-[#F59E0B]"
                  : "bg-[#DCFCE7] text-[#22C55E]";

              const impactBadgeStyle =
                line.impactLevel === "High"
                  ? "text-[#EF4444]"
                  : line.impactLevel === "Medium"
                  ? "text-[#F59E0B]"
                  : "text-[#22C55E]";

              return (
                <div
                  key={line.name}
                  className="p-4 rounded-xl bg-[#FFFFFF] border border-[#E5E7EB] hover:border-[#F4B400] transition-all space-y-2 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold font-mono text-[#1F2933]">
                      {line.name}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${statusBadgeStyle}`}
                    >
                      {line.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs pt-1 border-t border-[#E5E7EB]/60">
                    <div>
                      <span className="text-[#667085] block text-[11px]">Machines at Risk:</span>
                      <strong className="text-[#1F2933] font-mono">{line.machinesAtRisk} units</strong>
                    </div>
                    <div>
                      <span className="text-[#667085] block text-[11px]">Production Impact:</span>
                      <strong className={impactBadgeStyle}>{line.impactLevel} Impact</strong>
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <span className="text-[#667085] block text-[11px]">Estimated Downtime:</span>
                      <strong className="text-[#1F2933] font-mono">
                        {line.estimatedDowntime > 0
                          ? `${line.estimatedDowntime.toFixed(1)} hrs`
                          : "0 hrs"}
                      </strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: MAINTENANCE PRIORITIES */}
        <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-xs space-y-4">
          <div className="pb-3 border-b border-[#E5E7EB]">
            <h2 className="text-base sm:text-lg font-semibold text-[#1F2933]">
              MAINTENANCE PRIORITIES
            </h2>
            <p className="text-xs text-[#667085] mt-0.5">
              Prescriptive maintenance decisions prioritized by operational risk.
            </p>
          </div>

          {maintenancePriorities.length === 0 ? (
            <div className="p-8 rounded-xl bg-[#FFFDF5] border border-[#E5E7EB] text-center flex flex-col items-center justify-center">
              <CheckCircle2 className="w-7 h-7 text-[#22C55E] mb-2" />
              <h4 className="text-sm font-bold text-[#1F2933]">No pending maintenance actions</h4>
              <p className="text-xs text-[#667085] mt-1">
                All factory assets are operating within nominal parameters.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {maintenancePriorities.map((item) => (
                <div
                  key={item.machineId}
                  className="p-4 rounded-xl bg-[#FFFFFF] border border-[#E5E7EB] hover:border-[#F4B400] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold font-mono text-[#1F2933]">
                        {item.machineId}
                      </span>
                      <span className="text-xs text-[#667085]">
                        ({item.process} • {item.line})
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          item.priority === "URGENT"
                            ? "bg-[#FEE2E2] text-[#EF4444]"
                            : "bg-[#FEF3C7] text-[#F59E0B]"
                        }`}
                      >
                        {item.priority}
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-[#1F2933]">
                      {item.recommendedAction}
                    </p>
                    <p className="text-xs text-[#667085]">{item.shortReason}</p>
                  </div>

                  <Link
                    to={`/maintenance/${item.machineId}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FFFFFF] hover:bg-[#FFF3C4] border border-[#E5E7EB] hover:border-[#F4B400] text-xs font-bold text-[#1F2933] transition-all shadow-xs shrink-0 self-start sm:self-auto"
                  >
                    <Wrench className="w-3.5 h-3.5 text-[#D99A00]" />
                    <span>Work Order</span>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
