import React from "react";
import { Link } from "react-router-dom";
import { MachineItem } from "../../types/machine";
import { ArrowRight } from "lucide-react";

interface MachineCardProps {
  machine: MachineItem;
}

export const MachineCard: React.FC<MachineCardProps> = ({ machine }) => {
  const pred = machine.latest_prediction;
  const isCrit = pred?.health_status === "CRITICAL";
  const isAtRisk = pred?.health_status === "AT_RISK";
  const healthStatus = isCrit ? "CRITICAL" : isAtRisk ? "AT_RISK" : "HEALTHY";

  const failProbFormatted = pred ? `${Math.round(pred.failure_probability * 100)}%` : "—";
  const rulFormatted = pred ? `${Math.round(pred.predicted_rul)} cycles` : "—";

  const statusBadge =
    healthStatus === "CRITICAL"
      ? { bg: "bg-[#FEE2E2]", text: "text-[#EF4444]", label: "CRITICAL" }
      : healthStatus === "AT_RISK"
      ? { bg: "bg-[#FEF3C7]", text: "text-[#F59E0B]", label: "AT RISK" }
      : { bg: "bg-[#DCFCE7]", text: "text-[#22C55E]", label: "HEALTHY" };

  const riskValueColor =
    healthStatus === "CRITICAL"
      ? "text-[#EF4444]"
      : healthStatus === "AT_RISK"
      ? "text-[#F59E0B]"
      : "text-[#1F2933]";

  const criticalityStyle =
    machine.criticality?.toUpperCase() === "CRITICAL"
      ? "bg-[#FEE2E2] text-[#EF4444]"
      : machine.criticality?.toUpperCase() === "HIGH"
      ? "bg-[#FEF3C7] text-[#F59E0B]"
      : "bg-[#F8F9FA] text-[#667085]";

  return (
    <div className="p-5 rounded-[14px] bg-[#FFFFFF] border border-[#E5E7EB] hover:border-[#F4B400] shadow-[0_2px_8px_rgba(31,41,51,0.05)] transition-all flex flex-col justify-between space-y-4 group hover:shadow-md">
      <div>
        {/* TOP: Machine ID, Line, Status */}
        <div className="flex items-start justify-between gap-2 pb-3 border-b border-[#E5E7EB]">
          <div>
            <h3 className="text-lg font-bold text-[#1F2933] tracking-tight">
              {machine.machine_id}
            </h3>
            <p className="text-xs text-[#667085] mt-0.5">
              {machine.process} • {machine.production_line}
            </p>
          </div>

          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${statusBadge.bg} ${statusBadge.text}`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            {statusBadge.label}
          </span>
        </div>

        {/* FAILURE RISK & RUL */}
        <div className="grid grid-cols-2 gap-3 py-3 text-xs">
          <div className="p-3 rounded-xl bg-[#FFFDF5] border border-[#E5E7EB]">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#667085] block mb-0.5">
              FAILURE RISK
            </span>
            <span className={`text-2xl font-bold tracking-tight ${riskValueColor}`}>
              {failProbFormatted}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#FFFDF5] border border-[#E5E7EB]">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#667085] block mb-0.5">
              RUL
            </span>
            <span className="text-2xl font-bold tracking-tight text-[#1F2933]">
              {rulFormatted}
            </span>
          </div>
        </div>

        {/* CRITICALITY */}
        <div className="flex items-center justify-between text-xs pt-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#667085]">
            CRITICALITY
          </span>
          <span
            className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${criticalityStyle}`}
          >
            {machine.criticality || "MEDIUM"}
          </span>
        </div>
      </div>

      {/* BOTTOM: View Intelligence Link */}
      <div className="pt-3 border-t border-[#E5E7EB] flex items-center justify-end">
        <Link
          to={`/intelligence/${machine.machine_id}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#D99A00] hover:text-[#F4B400] transition-colors"
        >
          <span>View Intelligence</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#F4B400] group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
};
