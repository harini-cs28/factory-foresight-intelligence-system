import React from "react";
import { Link } from "react-router-dom";
import { DashboardOverviewResponse, MachineItem } from "../../types/machine";
import { AlertItem } from "../../types/alert";
import { SummaryCard } from "./SummaryCard";
import { StatusBadge } from "../common/StatusBadge";
import {
  Layers,
  GitFork,
  Clock,
  ArrowRight,
  Factory,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
} from "lucide-react";

interface ProductionManagerDashboardProps {
  overview: DashboardOverviewResponse;
  machines: MachineItem[];
  alerts: AlertItem[];
}

export const ProductionManagerDashboard: React.FC<ProductionManagerDashboardProps> = ({
  overview,
  machines,
}) => {
  // Aggregate production lines
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
      impactLevel,
      estimatedDowntime,
    };
  });

  const linesAtRiskCount = linesList.filter((l) => l.isAtRisk).length;
  const totalEstimatedDowntime = linesList.reduce(
    (acc, l) => acc + l.estimatedDowntime,
    0
  );

  const atRiskMachines = machines.filter(
    (m) =>
      m.latest_prediction?.health_status === "CRITICAL" ||
      m.latest_prediction?.health_status === "AT_RISK"
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1F2933] tracking-tight">
            PRODUCTION RISK CENTER
          </h1>
          <p className="text-xs sm:text-sm text-[#667085] mt-1">
            Analyze line availability, production bottleneck exposure, and cascade output risks.
          </p>
        </div>

        <Link
          to="/impact/M01"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#F4B400] hover:bg-[#D99A00] text-xs font-bold text-[#1F2933] transition-all shadow-xs self-start sm:self-auto"
        >
          <GitFork className="w-4 h-4" />
          <span>Cascade Impact Graph</span>
        </Link>
      </div>

      {/* TOP 4 CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="Production Lines"
          value={linesList.length}
          subtitle="Monitored Line Segments"
          icon={<Layers className="w-4 h-4 text-[#F4B400]" />}
          variant="yellow"
        />

        <SummaryCard
          title="Lines At Risk"
          value={linesAtRiskCount}
          subtitle={linesAtRiskCount > 0 ? "Potential Bottlenecks" : "All Lines Optimal"}
          icon={<AlertTriangle className="w-4 h-4 text-amber-600" />}
          variant={linesAtRiskCount > 0 ? "at_risk" : "healthy"}
        />

        <SummaryCard
          title="Machines Affecting Production"
          value={overview.at_risk_count + overview.critical_count}
          subtitle="Degrading Production Units"
          icon={<Factory className="w-4 h-4 text-[#1F2933]" />}
          variant={overview.critical_count > 0 ? "critical" : "default"}
        />

        <SummaryCard
          title="Potential Downtime"
          value={`${totalEstimatedDowntime.toFixed(1)} hrs`}
          subtitle="Estimated Output Impact"
          icon={<Clock className="w-4 h-4 text-[#1F2933]" />}
          variant="default"
        />
      </div>

      {/* PRODUCTION LINE RISK */}
      <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
          <div>
            <h2 className="text-lg font-bold text-[#1F2933]">
              Production Line Risk
            </h2>
            <p className="text-xs text-[#667085] mt-0.5">
              Continuity impact and downstream downtime exposure for each textile stage.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {linesList.map((line) => (
            <div
              key={line.name}
              className="p-5 rounded-xl bg-[#FFFDF5] border border-[#E5E7EB] hover:border-[#F4B400] transition-colors flex flex-col justify-between space-y-4 shadow-xs"
            >
              <div className="flex items-center justify-between pb-2 border-b border-[#E5E7EB]">
                <div>
                  <h3 className="text-sm font-bold text-[#1F2933] font-mono">
                    {line.name}
                  </h3>
                  <p className="text-[11px] text-[#667085]">
                    {line.machines.length} Connected Machinery Assets
                  </p>
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded text-[11px] font-bold ${
                    line.isAtRisk
                      ? "bg-[#FFF3C4] text-[#1F2933] border border-[#F4B400]/40"
                      : "bg-emerald-100 text-emerald-800"
                  }`}
                >
                  {line.isAtRisk ? "At Risk" : "Optimal"}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-[#667085]">
                  <span>Machines Affected:</span>
                  <span className="font-bold text-[#1F2933]">
                    {line.atRiskCount} {line.atRiskCount === 1 ? "machine" : "machines"} affected
                  </span>
                </div>

                <div className="flex justify-between text-[#667085]">
                  <span>Production Impact:</span>
                  <span
                    className={`font-bold ${
                      line.impactLevel === "HIGH"
                        ? "text-rose-600"
                        : line.impactLevel === "MEDIUM"
                        ? "text-amber-600"
                        : "text-emerald-600"
                    }`}
                  >
                    {line.impactLevel} production impact
                  </span>
                </div>

                <div className="flex justify-between text-[#667085]">
                  <span>Potential Downtime:</span>
                  <span className="font-bold text-[#1F2933]">
                    {line.estimatedDowntime > 0
                      ? `${line.estimatedDowntime.toFixed(1)} hrs estimated downtime`
                      : "0 hrs (Nominal)"}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-[#E5E7EB]">
                <Link
                  to={`/impact/${line.machines[0]?.machine_id || "M01"}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1F2933] hover:text-[#D99A00] transition-colors"
                >
                  <span>View Impact</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AT-RISK MACHINES (PRODUCTION PERSPECTIVE) */}
      <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
          <div>
            <h2 className="text-lg font-bold text-[#1F2933]">
              At-Risk Machinery Affecting Output
            </h2>
            <p className="text-xs text-[#667085] mt-0.5">
              Production consequences and remaining run-time before critical throughput degradation.
            </p>
          </div>
        </div>

        {atRiskMachines.length === 0 ? (
          <div className="p-6 rounded-xl bg-emerald-50/70 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="font-bold">No production interruptions expected.</p>
              <p className="text-emerald-800 text-[11px] mt-0.5">
                All textile lines running at full scheduled capacity.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {atRiskMachines.map((m) => {
              const isCrit = m.latest_prediction?.health_status === "CRITICAL";
              const failProb = m.latest_prediction
                ? Math.round(m.latest_prediction.failure_probability * 100)
                : 70;
              const rul = m.latest_prediction
                ? m.latest_prediction.predicted_rul.toFixed(1)
                : "12.0";

              return (
                <div
                  key={m.machine_id}
                  className="p-4 rounded-xl bg-[#FFFDF5] border border-[#E5E7EB] hover:border-[#F4B400] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold font-mono text-[#1F2933]">
                        {m.machine_id}
                      </span>
                      <span className="text-xs text-[#667085]">
                        • {m.process}
                      </span>
                      <span className="text-xs font-bold text-[#1F2933]">
                        ({m.production_line})
                      </span>
                      <StatusBadge
                        status={m.latest_prediction?.health_status || "AT_RISK"}
                        size="sm"
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[#667085]">
                      <span>
                        Failure Risk: <strong className="text-amber-800">{failProb}%</strong>
                      </span>
                      <span>
                        RUL: <strong className="text-[#1F2933]">{rul} hrs</strong>
                      </span>
                      <span>
                        Production Impact:{" "}
                        <strong className={isCrit ? "text-rose-600" : "text-amber-600"}>
                          {isCrit ? "HIGH Line Stoppage Risk" : "Moderate Buffer Capacity Risk"}
                        </strong>
                      </span>
                    </div>
                  </div>

                  <Link
                    to={`/impact/${m.machine_id}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#FFFFFF] hover:bg-[#FFF3C4] border border-[#E5E7EB] text-xs font-bold text-[#1F2933] transition-colors shrink-0 self-start sm:self-auto"
                  >
                    <span>Inspect Cascade Impact</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

