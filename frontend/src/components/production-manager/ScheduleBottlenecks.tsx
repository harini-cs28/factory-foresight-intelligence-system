import React, { useState, useEffect } from "react";
import { machineApi } from "../../api/machineApi";
import { MachineItem } from "../../types/machine";
import { LoadingState } from "../common/LoadingState";
import { ErrorState } from "../common/ErrorState";
import {
  Clock,
  RefreshCw,
  GitFork,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Layers,
  HelpCircle,
} from "lucide-react";

export const ScheduleBottlenecks: React.FC = () => {
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
      setError("Failed to fetch bottleneck data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMachines();
  }, []);

  if (isLoading) {
    return <LoadingState message="Analyzing Critical Production Bottlenecks & Shift Windows..." />;
  }

  if (error && machines.length === 0) {
    return (
      <ErrorState
        title="Bottleneck Data Unavailable"
        message={error}
        onRetry={fetchMachines}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E7EB]">
        <div>
          <div className="flex items-center gap-2">
            <Clock className="w-6 h-6 text-[#D99A00]" />
            <h1 className="text-xl font-bold text-[#1F2933] font-mono tracking-tight">
              SCHEDULE &amp; BOTTLENECK ANALYSIS
            </h1>
          </div>
          <p className="text-xs text-[#667085] mt-1">
            Equipment bottleneck vulnerability, shift maintenance buffers, and scheduling integration status.
          </p>
        </div>

        <button
          onClick={fetchMachines}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#FFFFFF] hover:bg-[#FFF3C4] border border-[#E5E7EB] hover:border-[#F4B400] text-[#1F2933] text-xs font-semibold transition-all shadow-xs cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#D99A00]" />
          <span>Refresh Analysis</span>
        </button>
      </div>

      {/* Unavailable State Notice (Per Prompt Requirement) */}
      <div className="p-5 rounded-2xl bg-[#FFFDF5] border border-[#F4B400]/50 space-y-3">
        <div className="flex items-center gap-2 text-sm font-bold text-[#1F2933]">
          <AlertCircle className="w-4 h-4 text-[#D99A00]" />
          <span>Detailed Production Output &amp; Work-Order Quotas: Unavailable</span>
        </div>
        <p className="text-xs text-[#667085] leading-relaxed">
          In compliance with FFIS platform integrity requirements, batch target metrics, daily fabric yardage quotas, and discrete delivery schedules are strictly not fabricated. This module is operating on verified telemetry and shift maintenance windows. Full MES/ERP production schedule ingestion is awaiting enterprise connector activation.
        </p>
      </div>

      {/* Verified Bottleneck Equipment Matrix */}
      <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
          <div className="flex items-center gap-2">
            <GitFork className="w-5 h-5 text-[#D99A00]" />
            <h2 className="text-sm font-bold text-[#1F2933] font-mono uppercase tracking-wider">
              Identified Bottleneck Stations &amp; Shift Maintenance Windows
            </h2>
          </div>
          <span className="text-xs text-[#667085] font-mono">Verified Factory Context</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {machines.map((m) => {
            const isCrit = m.latest_prediction?.health_status === "CRITICAL";
            const isAtRisk = m.latest_prediction?.health_status === "AT_RISK";
            const failProb = m.latest_prediction
              ? Math.round(m.latest_prediction.failure_probability * 100)
              : 0;

            return (
              <div
                key={m.machine_id}
                className="p-4 rounded-xl bg-[#FFFDF5] border border-[#E5E7EB] space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-[#D99A00] font-mono">
                      {m.production_line}
                    </span>
                    <h3 className="text-sm font-bold text-[#1F2933] font-mono">
                      {m.machine_id} &ndash; {m.process}
                    </h3>
                  </div>
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded-full border font-mono ${
                      isCrit
                        ? "bg-rose-50 text-[#EF4444] border-rose-200"
                        : isAtRisk
                        ? "bg-amber-50 text-[#F59E0B] border-amber-200"
                        : "bg-emerald-50 text-[#22C55E] border-emerald-200"
                    }`}
                  >
                    {isCrit ? "Critical" : isAtRisk ? "At Risk" : "Healthy"}
                  </span>
                </div>

                <div className="space-y-1 text-xs font-mono text-[#667085]">
                  <div className="flex justify-between">
                    <span>Criticality:</span>
                    <span className="font-bold text-[#1F2933]">{m.criticality}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Maintenance Window:</span>
                    <span className="font-bold text-[#1F2933]">{m.maintenance_window || "NEXT_SHIFT"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Failure Probability:</span>
                    <span className="font-bold text-[#1F2933]">{failProb}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
