import React from "react";
import { HealthStatus } from "../../types/prediction";
import { ShieldCheck, AlertTriangle, AlertOctagon, Activity } from "lucide-react";

interface HealthIndicatorProps {
  status: HealthStatus | string;
  failureProbability: number;
}

export const HealthIndicator: React.FC<HealthIndicatorProps> = ({
  status,
  failureProbability,
}) => {
  const normStatus = (status || "HEALTHY").toUpperCase();
  const probPercent = Math.min(100, Math.max(0, failureProbability * 100));

  const getStatusDetails = () => {
    if (normStatus === "CRITICAL") {
      return {
        label: "CRITICAL RISK",
        desc: "Severe anomaly detected. Machine requires immediate shutdown or servicing.",
        icon: <AlertOctagon className="w-8 h-8 text-rose-600" />,
        barColor: "bg-rose-500",
        textColor: "text-rose-600",
        borderColor: "border-rose-200 bg-white",
      };
    }
    if (normStatus === "AT_RISK") {
      return {
        label: "AT RISK",
        desc: "Wear degradation observed. Preventive maintenance recommended before failure.",
        icon: <AlertTriangle className="w-8 h-8 text-[#D99A00]" />,
        barColor: "bg-[#F4B400]",
        textColor: "text-[#D99A00]",
        borderColor: "border-[#F4B400]/40 bg-white",
      };
    }
    return {
      label: "NOMINAL & HEALTHY",
      desc: "All sensor parameters within standard operational thresholds.",
      icon: <ShieldCheck className="w-8 h-8 text-emerald-600" />,
      barColor: "bg-emerald-500",
      textColor: "text-emerald-700",
      borderColor: "border-emerald-200 bg-white",
    };
  };

  const details = getStatusDetails();

  return (
    <div className={`p-6 rounded-2xl border ${details.borderColor} shadow-xs space-y-4`}>
      <div className="flex items-start justify-between">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#667085]">
            Real-Time Machine State
          </span>
          <h3 className={`text-xl font-bold font-mono ${details.textColor} mt-1`}>
            {details.label}
          </h3>
          <p className="text-xs text-[#667085] mt-1 max-w-md">{details.desc}</p>
        </div>
        <div className="p-3 rounded-xl bg-[#FFFDF5] border border-[#E5E7EB]">
          {details.icon}
        </div>
      </div>

      {/* Failure Probability Progress Gauge */}
      <div className="space-y-1.5 pt-2 border-t border-[#E5E7EB]">
        <div className="flex justify-between items-center text-xs">
          <span className="text-[#667085] flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-[#D99A00]" />
            Failure Likelihood (Next 20 Cycles)
          </span>
          <span className={`font-bold font-mono ${details.textColor}`}>
            {probPercent.toFixed(2)}%
          </span>
        </div>

        <div className="w-full h-3 bg-[#F8F9FA] rounded-full overflow-hidden border border-[#E5E7EB]">
          <div
            className={`h-full ${details.barColor} transition-all duration-500 rounded-full`}
            style={{ width: `${Math.max(4, probPercent)}%` }}
          />
        </div>
      </div>
    </div>
  );
};
