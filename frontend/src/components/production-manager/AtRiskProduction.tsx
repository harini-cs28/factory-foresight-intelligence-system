import React, { useState, useEffect } from "react";
import { machineApi } from "../../api/machineApi";
import { MachineItem } from "../../types/machine";
import { LoadingState } from "../common/LoadingState";
import { ErrorState } from "../common/ErrorState";
import {
  AlertTriangle,
  RefreshCw,
  Layers,
  CheckCircle2,
  AlertOctagon,
  ArrowRight,
  TrendingDown,
} from "lucide-react";

export const AtRiskProduction: React.FC = () => {
  const [machines, setMachines] = useState<MachineItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMachines = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await machineApi.getMachines();
      setMachines(data);
    } catch (err: any) {
      setError("Failed to fetch process risk telemetry.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMachines();
  }, []);

  if (isLoading) {
    return <LoadingState message="Evaluating At-Risk Textile Production Processes..." />;
  }

  if (error && machines.length === 0) {
    return (
      <ErrorState
        title="Process Telemetry Unavailable"
        message={error}
        onRetry={fetchMachines}
      />
    );
  }

  // Aggregate by manufacturing process
  const processMap = new Map<string, MachineItem[]>();
  machines.forEach((m) => {
    const list = processMap.get(m.process) || [];
    list.push(m);
    processMap.set(m.process, list);
  });

  const processes = Array.from(processMap.entries()).map(([procName, procMachines]) => {
    const atRisk = procMachines.filter(
      (m) =>
        m.latest_prediction?.health_status === "CRITICAL" ||
        m.latest_prediction?.health_status === "AT_RISK"
    );
    const hasCrit = procMachines.some(
      (m) => m.latest_prediction?.health_status === "CRITICAL"
    );

    return {
      name: procName,
      machines: procMachines,
      atRiskCount: atRisk.length,
      hasCritical: hasCrit,
      status: hasCrit ? "CRITICAL" : atRisk.length > 0 ? "AT_RISK" : "HEALTHY",
    };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E7EB]">
        <div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-[#D99A00]" />
            <h1 className="text-xl font-bold text-[#1F2933] font-mono tracking-tight">
              AT-RISK PRODUCTION STAGES
            </h1>
          </div>
          <p className="text-xs text-[#667085] mt-1">
            Manufacturing process vulnerability assessment across spinning, carding, drawing, weaving, dyeing, and finishing.
          </p>
        </div>

        <button
          onClick={fetchMachines}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#FFFFFF] hover:bg-[#FFF3C4] border border-[#E5E7EB] hover:border-[#F4B400] text-[#1F2933] text-xs font-semibold transition-all shadow-xs cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#D99A00]" />
          <span>Refresh Stages</span>
        </button>
      </div>

      {/* Process Stages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {processes.map((proc) => (
          <div
            key={proc.name}
            className={`p-5 rounded-2xl border flex flex-col justify-between space-y-4 shadow-xs ${
              proc.hasCritical
                ? "bg-[#FFFDF5] border-[#EF4444]/40"
                : proc.atRiskCount > 0
                ? "bg-[#FFFDF5] border-[#F59E0B]/40"
                : "bg-[#FFFFFF] border-[#E5E7EB]"
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold font-mono text-[#1F2933]">{proc.name}</h3>
                <span
                  className={`text-[9px] font-bold px-2 py-0.5 rounded-full border font-mono ${
                    proc.hasCritical
                      ? "bg-rose-50 text-[#EF4444] border-rose-200"
                      : proc.atRiskCount > 0
                      ? "bg-amber-50 text-[#F59E0B] border-amber-200"
                      : "bg-emerald-50 text-[#22C55E] border-emerald-200"
                  }`}
                >
                  {proc.status}
                </span>
              </div>

              <div className="mt-3 space-y-1 text-xs text-[#667085]">
                <div className="flex justify-between">
                  <span>Assigned Units:</span>
                  <span className="font-bold text-[#1F2933]">{proc.machines.length} Units</span>
                </div>
                <div className="flex justify-between">
                  <span>At-Risk Equipment:</span>
                  <span
                    className={`font-bold ${
                      proc.atRiskCount > 0 ? "text-[#EF4444]" : "text-[#22C55E]"
                    }`}
                  >
                    {proc.atRiskCount} Units
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E5E7EB]">
              <div className="text-[10px] uppercase font-mono text-[#667085] mb-1">
                Equipment Nodes
              </div>
              <div className="flex flex-wrap gap-1">
                {proc.machines.map((m) => (
                  <span
                    key={m.machine_id}
                    className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#FFFDF5] border border-[#E5E7EB] text-[#1F2933]"
                  >
                    {m.machine_id}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
