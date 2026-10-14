import React from "react";
import { CheckCircle2, AlertTriangle, AlertOctagon, HelpCircle } from "lucide-react";

interface LiveHealthIndicatorProps {
  status: "HEALTHY" | "AT_RISK" | "CRITICAL" | "UNKNOWN" | string;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
}

export const LiveHealthIndicator: React.FC<LiveHealthIndicatorProps> = ({
  status,
  size = "md",
  showIcon = true,
}) => {
  const normalizedStatus = status ? status.toUpperCase() : "UNKNOWN";

  const getStatusConfig = () => {
    switch (normalizedStatus) {
      case "HEALTHY":
        return {
          label: "HEALTHY",
          bg: "bg-emerald-50",
          text: "text-emerald-800",
          border: "border-emerald-200",
          dot: "bg-emerald-500",
          icon: CheckCircle2,
        };
      case "AT_RISK":
        return {
          label: "AT RISK",
          bg: "bg-[#FFF3C4]",
          text: "text-[#1F2933]",
          border: "border-[#F4B400]/40",
          dot: "bg-[#D99A00]",
          icon: AlertTriangle,
        };
      case "CRITICAL":
        return {
          label: "CRITICAL",
          bg: "bg-rose-50",
          text: "text-rose-800",
          border: "border-rose-200",
          dot: "bg-rose-500 animate-ping",
          icon: AlertOctagon,
        };
      default:
        return {
          label: "NO DATA",
          bg: "bg-[#F8F9FA]",
          text: "text-[#667085]",
          border: "border-[#E5E7EB]",
          dot: "bg-[#667085]",
          icon: HelpCircle,
        };
    }
  };

  const config = getStatusConfig();
  const IconComponent = config.icon;

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs gap-1.5",
    md: "px-2.5 py-1 text-xs font-semibold gap-2",
    lg: "px-3.5 py-1.5 text-sm font-semibold gap-2.5",
  }[size];

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16,
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-md border ${config.bg} ${config.text} ${config.border} ${sizeClasses}`}
    >
      <span className={`w-2 h-2 rounded-full ${config.dot}`} />
      {showIcon && <IconComponent size={iconSizes} className="shrink-0" />}
      <span>{config.label}</span>
    </span>
  );
};
