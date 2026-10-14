import React from "react";
import { LucideIcon } from "lucide-react";

interface SensorValueCardProps {
  label: string;
  value: number;
  unit: string;
  icon: LucideIcon;
  normalRange?: string;
  status?: "normal" | "warning" | "critical";
  delta?: number;
}

export const SensorValueCard: React.FC<SensorValueCardProps> = ({
  label,
  value,
  unit,
  icon: Icon,
  normalRange,
  status = "normal",
}) => {
  const getStatusStyle = () => {
    switch (status) {
      case "critical":
        return {
          border: "border-rose-200 hover:border-rose-400",
          bg: "bg-white",
          iconBg: "bg-rose-50 text-rose-600 border-rose-200",
          valColor: "text-rose-600",
          badge: "bg-rose-50 text-rose-800 border-rose-200",
          badgeText: "CRITICAL",
        };
      case "warning":
        return {
          border: "border-[#F4B400]/40 hover:border-[#F4B400]",
          bg: "bg-[#FFFDF5]",
          iconBg: "bg-[#FFF3C4] text-[#D99A00] border-[#F4B400]/40",
          valColor: "text-amber-700",
          badge: "bg-[#FFF3C4] text-[#1F2933] border-[#F4B400]/40",
          badgeText: "ELEVATED",
        };
      default:
        return {
          border: "border-[#E5E7EB] hover:border-[#F4B400]",
          bg: "bg-white",
          iconBg: "bg-[#FFFDF5] text-[#D99A00] border-[#E5E7EB]",
          valColor: "text-[#1F2933]",
          badge: "bg-emerald-50 text-emerald-800 border-emerald-200",
          badgeText: "NOMINAL",
        };
    }
  };

  const styles = getStatusStyle();

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border p-4 transition-all duration-300 shadow-xs ${styles.border} ${styles.bg}`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-[#667085] uppercase tracking-wider">{label}</span>
        <div className={`p-2 rounded-xl border ${styles.iconBg}`}>
          <Icon size={18} />
        </div>
      </div>

      <div className="flex items-baseline gap-2">
        <span className={`text-2xl font-bold font-mono tracking-tight ${styles.valColor}`}>
          {typeof value === "number" ? value.toFixed(1) : value}
        </span>
        <span className="text-xs font-semibold text-[#667085]">{unit}</span>
      </div>

      <div className="mt-3 pt-2.5 border-t border-[#E5E7EB] flex items-center justify-between text-xs">
        {normalRange ? (
          <span className="text-[#667085]">
            Nominal: <span className="text-[#1F2933] font-mono">{normalRange}</span>
          </span>
        ) : (
          <span className="text-[#667085]">Telemetry Stream</span>
        )}
        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${styles.badge}`}>
          {styles.badgeText}
        </span>
      </div>
    </div>
  );
};
