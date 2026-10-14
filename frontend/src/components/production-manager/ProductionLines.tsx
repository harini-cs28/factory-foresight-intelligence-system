import React, { useState, useEffect } from "react";
import { machineApi } from "../../api/machineApi";
import { MachineItem } from "../../types/machine";
import { LoadingState } from "../common/LoadingState";
import { ErrorState } from "../common/ErrorState";
import {
  Layers,
  RefreshCw,
  Activity,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
} from "lucide-react";

export const ProductionLines: React.FC = () => {
  const [machines, setMachines] = useState<MachineItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLine, setSelectedLine] = useState<string>("Line-A");

  const fetchMachines = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await machineApi.getMachines();
      setMachines(data);
    } catch (err: any) {
      setError("Failed to fetch production lines telemetry.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMachines();
  }, []);

  if (isLoading) {
    return <LoadingState message="Loading Production Lines Architecture & Telemetry..." />;
  }

  if (error && machines.length === 0) {
    return (
      <ErrorState
        title="Lines Data Unavailable"
        message={error}
        onRetry={fetchMachines}
      />
    );
  }

  const linesMap = new Map<string, MachineItem[]>();
  machines.forEach((m) => {
    const list = linesMap.get(m.production_line) || [];
    list.push(m);
    linesMap.set(m.production_line, list);
  });

  const lines = Array.from(linesMap.keys());
  const currentLineMachines = linesMap.get(selectedLine) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E7EB]">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-6 h-6 text-[#D99A00]" />
            <h1 className="text-xl font-bold text-[#1F2933] font-mono tracking-tight">
              PRODUCTION LINES ARCHITECTURE &amp; AVAILABILITY
            </h1>
          </div>
          <p className="text-xs text-[#667085] mt-1">
            Production line segmentation, equipment readiness, line health index, and throughput exposure.
          </p>
        </div>

        <button
          onClick={fetchMachines}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#FFFFFF] hover:bg-[#FFF3C4] border border-[#E5E7EB] hover:border-[#F4B400] text-[#1F2933] text-xs font-semibold transition-all shadow-xs cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#D99A00]" />
          <span>Refresh Lines</span>
        </button>
      </div>

      {/* Line Switcher */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {lines.map((lineName) => {
          const lMachines = linesMap.get(lineName) || [];
          const atRiskCount = lMachines.filter(
            (m) =>
              m.latest_prediction?.health_status === "CRITICAL" ||
              m.latest_prediction?.health_status === "AT_RISK"
          ).length;
          const isSelected = selectedLine === lineName;

          return (
            <button
              key={lineName}
              onClick={() => setSelectedLine(lineName)}
              className={`p-5 rounded-2xl border text-left transition-all cursor-pointer ${
                isSelected
                  ? "bg-[#FFF3C4] border-[#F4B400] shadow-sm"
                  : "bg-[#FFFFFF] border-[#E5E7EB] hover:bg-[#FFFDF5]"
              }`}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold font-mono text-[#1F2933]">{lineName}</h3>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border font-mono ${
                    atRiskCount > 0
                      ? "bg-rose-50 text-[#EF4444] border-rose-200"
                      : "bg-emerald-50 text-[#22C55E] border-emerald-200"
                  }`}
                >
                  {atRiskCount > 0 ? `${atRiskCount} At Risk` : "Normal"}
                </span>
              </div>
              <p className="text-xs text-[#667085] mt-2">
                {lMachines.length} Process Assets | {lMachines.map((m) => m.process).join(", ")}
              </p>
            </button>
          );
        })}
      </div>

      {/* Selected Line Machines Detail */}
      <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
          <h2 className="text-sm font-bold text-[#1F2933] font-mono uppercase tracking-wider">
            {selectedLine} &ndash; Machine Stations ({currentLineMachines.length} Units)
          </h2>
          <span className="text-xs text-[#667085] font-mono">Sequential Production Flow</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentLineMachines.map((m) => {
            const status = m.latest_prediction?.health_status || "HEALTHY";
            const failProb = m.latest_prediction
              ? Math.round(m.latest_prediction.failure_probability * 100)
              : 0;
            const rul = m.latest_prediction
              ? m.latest_prediction.predicted_rul.toFixed(1)
              : "N/A";

            return (
              <div
                key={m.machine_id}
                className="p-4 rounded-xl bg-[#FFFDF5] border border-[#E5E7EB] space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-bold font-mono text-sm text-[#1F2933]">
                      {m.machine_id}
                    </div>
                    <div className="text-xs text-[#667085]">{m.process}</div>
                  </div>
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded-full border font-mono ${
                      status === "CRITICAL"
                        ? "bg-rose-50 text-[#EF4444] border-rose-200"
                        : status === "AT_RISK"
                        ? "bg-amber-50 text-[#F59E0B] border-amber-200"
                        : "bg-emerald-50 text-[#22C55E] border-emerald-200"
                    }`}
                  >
                    {status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-2 border-t border-[#E5E7EB]">
                  <div>
                    <span className="text-[#667085] block text-[10px]">RISK</span>
                    <span className="font-bold text-[#1F2933]">{failProb}%</span>
                  </div>
                  <div>
                    <span className="text-[#667085] block text-[10px]">RUL</span>
                    <span className="font-bold text-[#1F2933]">{rul} Cyc</span>
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
