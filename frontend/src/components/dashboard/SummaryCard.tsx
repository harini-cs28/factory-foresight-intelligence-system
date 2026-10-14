import React from "react";

interface SummaryCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: string;
  variant?: "default" | "healthy" | "at_risk" | "critical" | "yellow";
  className?: string;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  variant = "default",
  className = "",
}) => {
  const borderAccents = {
    default: "border-[#E5E7EB]",
    healthy: "border-[#E5E7EB] hover:border-emerald-300",
    at_risk: "border-[#E5E7EB] hover:border-amber-300",
    critical: "border-[#E5E7EB] hover:border-rose-300",
    yellow: "border-[#E5E7EB] hover:border-[#F4B400]/60",
  };

  const valueColors = {
    default: "text-[#1F2933]",
    healthy: "text-emerald-600",
    at_risk: "text-amber-600",
    critical: "text-rose-600",
    yellow: "text-[#1F2933]",
  };

  const iconWrappers = {
    default: "bg-[#FFFDF5] text-[#1F2933] border-[#E5E7EB]",
    healthy: "bg-emerald-50 text-emerald-600 border-emerald-100",
    at_risk: "bg-amber-50 text-amber-600 border-amber-100",
    critical: "bg-rose-50 text-rose-600 border-rose-100",
    yellow: "bg-[#FFF3C4] text-[#1F2933] border-[#F4B400]/30",
  };

  return (
    <div
      className={`p-5 rounded-2xl bg-[#FFFFFF] border ${borderAccents[variant]} shadow-xs transition-all duration-200 hover:shadow-sm flex flex-col justify-between ${className}`}
    >
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-[#667085]">
          {title}
        </span>
        {icon && (
          <div
            className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 ${iconWrappers[variant]}`}
          >
            {icon}
          </div>
        )}
      </div>

      <div className="space-y-1">
        <div className="flex items-baseline gap-2">
          <span className={`text-2xl sm:text-3xl font-bold tracking-tight ${valueColors[variant]}`}>
            {value}
          </span>
          {trend && (
            <span className="text-xs font-medium text-[#667085]">{trend}</span>
          )}
        </div>

        {subtitle && (
          <p className="text-xs text-[#667085] font-normal leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};

