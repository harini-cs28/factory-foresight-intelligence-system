import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { machineApi } from "../../api/machineApi";
import { MachineItem } from "../../types/machine";
import { LoadingState } from "../common/LoadingState";
import { ErrorState } from "../common/ErrorState";
import {
  Activity,
  RefreshCw,
  Filter,
  ArrowRight,
  Share2,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
} from "lucide-react";

export const MachineFleet: React.FC = () => {
  const [machines, setMachines] = useState<MachineItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lineFilter, setLineFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const fetchFleet = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await machineApi.getMachines();
      setMachines(data);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Unable to fetch machine fleet from backend.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFleet();
  }, []);

  if (isLoading) {
    return <LoadingState message="Connecting to Textile Machinery Fleet..." />;
  }

  if (error && machines.length === 0) {
    return (
      <ErrorState
        title="Fleet Telemetry Unavailable"
        message={error}
        onRetry={fetchFleet}
      />
    );
  }

  const filteredMachines = machines.filter((m) => {
    const status = m.latest_prediction?.health_status || "HEALTHY";
    if (lineFilter !== "ALL" && m.production_line !== lineFilter) return false;
    if (statusFilter !== "ALL" && status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E7EB]">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-6 h-6 text-[#D99A00]" />
            <h1 className="text-xl font-bold text-[#1F2933] font-mono tracking-tight">
              MACHINE FLEET MONITOR
            </h1>
          </div>
          <p className="text-xs text-[#667085] mt-1">
            Real-time status of all {machines.length} production assets across spinning, weaving, dyeing, and finishing lines.
          </p>
        </div>

        <button
          onClick={fetchFleet}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#FFFFFF] hover:bg-[#FFF3C4] border border-[#E5E7EB] hover:border-[#F4B400] text-[#1F2933] text-xs font-semibold transition-all shadow-xs cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#D99A00]" />
          <span>Refresh Fleet</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-xs">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#667085] uppercase tracking-wider font-mono">
            Line:
          </span>
          {["ALL", "Line-A", "Line-B", "Line-C"].map((l) => (
            <button
              key={l}
              onClick={() => setLineFilter(l)}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                lineFilter === l
                  ? "bg-[#FFF3C4] text-[#1F2933] border border-[#F4B400]"
                  : "bg-[#FFFDF5] text-[#667085] border border-[#E5E7EB] hover:bg-[#F8F9FA]"
              }`}
            >
              {l}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#667085] uppercase tracking-wider font-mono">
            Status:
          </span>
          {["ALL", "HEALTHY", "AT_RISK", "CRITICAL"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                statusFilter === s
                  ? "bg-[#FFF3C4] text-[#1F2933] border border-[#F4B400]"
                  : "bg-[#FFFDF5] text-[#667085] border border-[#E5E7EB] hover:bg-[#F8F9FA]"
              }`}
            >
              {s.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Fleet Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMachines.map((m) => {
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
              className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] hover:border-[#F4B400] transition-all shadow-xs flex flex-col justify-between space-y-4 group"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-bold text-[#D99A00] font-mono tracking-wider">
                      {m.production_line}
                    </span>
                    <h3 className="text-base font-bold text-[#1F2933] font-mono">
                      {m.machine_id} &ndash; {m.process}
                    </h3>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border font-mono uppercase ${
                      status === "CRITICAL"
                        ? "bg-rose-50 text-[#EF4444] border-rose-200"
                        : status === "AT_RISK"
                        ? "bg-amber-50 text-[#F59E0B] border-amber-200"
                        : "bg-emerald-50 text-[#22C55E] border-emerald-200"
                    }`}
                  >
                    {status.replace("_", " ")}
                  </span>
                </div>

                {/* Telemetry Metrics */}
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <div className="p-2.5 rounded-xl bg-[#FFFDF5] border border-[#E5E7EB]">
                    <div className="text-[10px] uppercase font-mono text-[#667085]">Failure Risk</div>
                    <div className="text-base font-bold font-mono text-[#1F2933]">{failProb}%</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#FFFDF5] border border-[#E5E7EB]">
                    <div className="text-[10px] uppercase font-mono text-[#667085]">Estimated RUL</div>
                    <div className="text-base font-bold font-mono text-[#1F2933]">{rul} Cyc</div>
                  </div>
                </div>

                {/* Logistics Readiness */}
                <div className="mt-3 text-[11px] text-[#667085] space-y-1 font-mono">
                  <div className="flex justify-between">
                    <span>Criticality:</span>
                    <span className="font-bold text-[#1F2933]">{m.criticality}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Spare Parts:</span>
                    <span className="font-bold text-[#1F2933]">{m.spare_part_available || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Window:</span>
                    <span className="font-bold text-[#1F2933]">{m.maintenance_window || "N/A"}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-[#E5E7EB] flex items-center justify-between gap-2">
                <Link
                  to={`/plant-manager/cascade?machineId=${m.machine_id}`}
                  className="flex-1 text-center py-1.5 px-2 rounded-lg bg-[#FFFDF5] hover:bg-[#FFF3C4] border border-[#E5E7EB] text-xs font-semibold text-[#1F2933] transition-colors flex items-center justify-center gap-1.5"
                >
                  <Share2 className="w-3.5 h-3.5 text-[#D99A00]" />
                  <span>Cascade</span>
                </Link>

                <Link
                  to={`/plant-manager/maintenance-priorities?machineId=${m.machine_id}`}
                  className="flex-1 text-center py-1.5 px-2 rounded-lg bg-[#FFFDF5] hover:bg-[#FFF3C4] border border-[#E5E7EB] text-xs font-semibold text-[#1F2933] transition-colors flex items-center justify-center gap-1.5"
                >
                  <Wrench className="w-3.5 h-3.5 text-[#D99A00]" />
                  <span>Priorities</span>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
