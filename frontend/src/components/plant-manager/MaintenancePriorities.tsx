import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { machineApi } from "../../api/machineApi";
import { maintenanceApi } from "../../api/maintenanceApi";
import { MachineItem } from "../../types/machine";
import { RecommendationResponse } from "../../types/maintenance";
import { LoadingState } from "../common/LoadingState";
import { ErrorState } from "../common/ErrorState";
import {
  Wrench,
  RefreshCw,
  AlertTriangle,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  XCircle,
} from "lucide-react";

export const MaintenancePriorities: React.FC = () => {
  const [machines, setMachines] = useState<MachineItem[]>([]);
  const [recommendations, setRecommendations] = useState<Record<string, RecommendationResponse>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPriorities = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await machineApi.getMachines();
      setMachines(data);

      // Fetch recommendations for critical and at-risk machines
      const recMap: Record<string, RecommendationResponse> = {};
      const targetMachines = data.filter(
        (m) =>
          m.latest_prediction?.health_status === "CRITICAL" ||
          m.latest_prediction?.health_status === "AT_RISK"
      );

      await Promise.all(
        targetMachines.map(async (m) => {
          try {
            const rec = await maintenanceApi.getRecommendation(m.machine_id);
            recMap[m.machine_id] = rec;
          } catch (e) {
            // Non-fatal
          }
        })
      );
      setRecommendations(recMap);
    } catch (err: any) {
      setError("Failed to load prescriptive maintenance priorities.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPriorities();
  }, []);

  if (isLoading) {
    return <LoadingState message="Ranking Prescriptive Maintenance Priorities for Management..." />;
  }

  if (error && machines.length === 0) {
    return (
      <ErrorState
        title="Priorities Unavailable"
        message={error}
        onRetry={fetchPriorities}
      />
    );
  }

  // Sort machines by priority: Critical status first, highest failure risk, lowest RUL
  const prioritized = [...machines].sort((a, b) => {
    const aCrit = a.latest_prediction?.health_status === "CRITICAL";
    const bCrit = b.latest_prediction?.health_status === "CRITICAL";
    if (aCrit && !bCrit) return -1;
    if (!aCrit && bCrit) return 1;

    const aRisk = a.latest_prediction?.failure_probability || 0;
    const bRisk = b.latest_prediction?.failure_probability || 0;
    return bRisk - aRisk;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E7EB]">
        <div>
          <div className="flex items-center gap-2">
            <Wrench className="w-6 h-6 text-[#D99A00]" />
            <h1 className="text-xl font-bold text-[#1F2933] font-mono tracking-tight">
              MANAGEMENT MAINTENANCE PRIORITIES
            </h1>
          </div>
          <p className="text-xs text-[#667085] mt-1">
            Prescriptive decision-support ranking machines by operational risk, logistical readiness, and downstream cascade impact.
          </p>
        </div>

        <button
          onClick={fetchPriorities}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#FFFFFF] hover:bg-[#FFF3C4] border border-[#E5E7EB] hover:border-[#F4B400] text-[#1F2933] text-xs font-semibold transition-all shadow-xs cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#D99A00]" />
          <span>Refresh Priorities</span>
        </button>
      </div>

      {/* Priority Cards List */}
      <div className="space-y-4">
        {prioritized.map((m, rank) => {
          const rec = recommendations[m.machine_id];
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
              className={`p-6 rounded-2xl bg-[#FFFFFF] border transition-all shadow-xs space-y-4 ${
                status === "CRITICAL"
                  ? "border-[#EF4444]/40 bg-[#FFFDF5]"
                  : "border-[#E5E7EB]"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E7EB] pb-3">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-[#FFF3C4] text-[#D99A00] font-mono font-bold flex items-center justify-center text-xs shrink-0 border border-[#F4B400]/30">
                    #{rank + 1}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#D99A00] font-mono">
                        {m.production_line}
                      </span>
                      <h3 className="text-base font-bold text-[#1F2933] font-mono">
                        {m.machine_id} &ndash; {m.process}
                      </h3>
                    </div>
                    <p className="text-xs text-[#667085] mt-0.5">
                      Criticality: <span className="font-bold text-[#1F2933]">{m.criticality}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full border font-mono uppercase ${
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
              </div>

              {/* Metric & Readiness Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-[#FFFDF5] border border-[#E5E7EB]">
                  <div className="text-[10px] text-[#667085] font-mono uppercase">Failure Risk</div>
                  <div className="text-lg font-bold font-mono text-[#1F2933]">{failProb}%</div>
                </div>
                <div className="p-3 rounded-xl bg-[#FFFDF5] border border-[#E5E7EB]">
                  <div className="text-[10px] text-[#667085] font-mono uppercase">Remaining RUL</div>
                  <div className="text-lg font-bold font-mono text-[#1F2933]">{rul} Cyc</div>
                </div>
                <div className="p-3 rounded-xl bg-[#FFFDF5] border border-[#E5E7EB]">
                  <div className="text-[10px] text-[#667085] font-mono uppercase">Spare Parts</div>
                  <div className="text-sm font-bold font-mono text-[#1F2933]">
                    {m.spare_part_available || "N/A"}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-[#FFFDF5] border border-[#E5E7EB]">
                  <div className="text-[10px] text-[#667085] font-mono uppercase">Maintenance Window</div>
                  <div className="text-sm font-bold font-mono text-[#1F2933]">
                    {m.maintenance_window || "N/A"}
                  </div>
                </div>
              </div>

              {/* Prescriptive Recommendation Detail if available */}
              {rec && (
                <div className="p-4 rounded-xl bg-[#FFFDF5] border border-[#E5E7EB] space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-bold text-[#1F2933] uppercase">
                      Prescriptive Recommendation
                    </span>
                    <span className="text-[#D99A00] font-bold">
                      Est. Repair: {rec.estimated_repair_hours} Hours
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-[#1F2933]">{rec.recommended_action}</div>
                  <div className="text-[11px] text-[#667085]">{rec.reason}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
