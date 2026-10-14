import React from "react";
import { Link } from "react-router-dom";
import { DashboardOverviewResponse, MachineItem } from "../../types/machine";
import { StatusBadge } from "../common/StatusBadge";
import { AlertOctagon, Layers, ArrowRight, ShieldCheck } from "lucide-react";

interface FactorySummaryProps {
  overview: DashboardOverviewResponse;
  machines: MachineItem[];
}

export const FactorySummary: React.FC<FactorySummaryProps> = ({
  overview,
  machines,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 my-6">
      {/* Critical Machines Action List */}
      <div className="lg:col-span-2 p-6 rounded-2xl bg-[#FFFFFF] border border-[#E5E8E6] shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <AlertOctagon className="w-5 h-5 text-rose-600" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#1F2933] font-mono">
              Immediate Critical Attention Assets
            </h3>
          </div>
          <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-800">
            {overview.critical_count} Machines Critical
          </span>
        </div>

        {overview.critical_machines.length === 0 ? (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <p className="text-xs font-mono">
              All machines operating within normal nominal parameters. No immediate critical failure risk detected.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {machines
              .filter((m) => overview.critical_machines.includes(m.machine_id))
              .map((machine) => (
                <div
                  key={machine.machine_id}
                  className="p-4 rounded-xl bg-[#FFFDF5] border border-rose-200 hover:border-rose-400 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all shadow-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span className="text-sm font-bold text-[#1F2933] font-mono">
                        {machine.machine_id}
                      </span>
                      <span className="text-xs text-[#667085] font-mono">
                        • {machine.process}
                      </span>
                      <StatusBadge
                        status={machine.latest_prediction?.health_status || "CRITICAL"}
                        size="sm"
                      />
                    </div>
                    <div className="flex items-center gap-4 text-xs text-[#667085] font-mono">
                      <span>
                        Line: <span className="text-[#1F2933] font-semibold">{machine.production_line}</span>
                      </span>
                      <span>
                        Criticality:{" "}
                        <span className="text-amber-800 font-bold">{machine.criticality}</span>
                      </span>
                      {machine.latest_prediction && (
                        <span>
                          RUL:{" "}
                          <span className="text-rose-700 font-bold">
                            {machine.latest_prediction.predicted_rul.toFixed(1)} hrs
                          </span>
                        </span>
                      )}
                    </div>
                  </div>

                  <Link
                    to={`/intelligence/${machine.machine_id}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-900 border border-rose-300 text-xs font-mono font-bold transition-all shrink-0"
                  >
                    <span>Analyze Machine</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Production Lines Overview */}
      <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E5E8E6] shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#F4B400]" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#1F2933] font-mono">
              Monitored Production Lines
            </h3>
          </div>
          <span className="text-xs font-mono text-[#667085] font-bold">
            {overview.affected_production_lines.length} Lines
          </span>
        </div>

        <div className="space-y-2.5">
          {overview.affected_production_lines.map((line) => {
            const lineMachines = machines.filter((m) => m.production_line === line);
            const lineCritical = lineMachines.filter(
              (m) => m.latest_prediction?.health_status === "CRITICAL"
            ).length;
            const lineAtRisk = lineMachines.filter(
              (m) => m.latest_prediction?.health_status === "AT_RISK"
            ).length;

            return (
              <div
                key={line}
                className="p-3.5 rounded-xl bg-[#FFFDF5] border border-[#E5E8E6] flex items-center justify-between hover:border-[#F4B400] transition-colors"
              >
                <div>
                  <span className="text-xs font-bold text-[#1F2933] font-mono">{line}</span>
                  <p className="text-[11px] text-[#667085] font-mono">
                    {lineMachines.length} Machinery Assets Connected
                  </p>
                </div>

                <div className="flex items-center gap-1.5 font-mono text-xs">
                  {lineCritical > 0 ? (
                    <span className="px-2 py-0.5 rounded bg-rose-100 border border-rose-300 text-rose-800 font-bold">
                      {lineCritical} Critical
                    </span>
                  ) : lineAtRisk > 0 ? (
                    <span className="px-2 py-0.5 rounded bg-[#FFF3C4] border border-[#F4B400]/40 text-[#1F2933] font-bold">
                      {lineAtRisk} At Risk
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold">
                      Nominal
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
