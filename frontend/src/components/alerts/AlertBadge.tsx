import React from "react";
import { AlertSeverity, AlertType } from "../../types/alert";
import { AlertOctagon, AlertTriangle, Info, Bell, ShieldAlert, Wrench, Share2 } from "lucide-react";

interface AlertBadgeProps {
  severity: AlertSeverity;
  alertType?: AlertType;
  showIcon?: boolean;
}

export const AlertBadge: React.FC<AlertBadgeProps> = ({
  severity,
  alertType,
  showIcon = true,
}) => {
  const getSeverityStyle = () => {
    switch (severity?.toUpperCase()) {
      case "CRITICAL":
        return {
          bg: "bg-rose-50",
          text: "text-rose-800",
          border: "border-rose-200",
          dot: "bg-rose-500 animate-ping",
          icon: AlertOctagon,
        };
      case "HIGH":
        return {
          bg: "bg-[#FFF3C4]",
          text: "text-[#1F2933]",
          border: "border-[#F4B400]/40",
          dot: "bg-[#D99A00]",
          icon: AlertTriangle,
        };
      case "MEDIUM":
        return {
          bg: "bg-[#FFFDF5]",
          text: "text-[#1F2933]",
          border: "border-[#E5E7EB]",
          dot: "bg-[#D99A00]",
          icon: Info,
        };
      default:
        return {
          bg: "bg-[#F8F9FA]",
          text: "text-[#667085]",
          border: "border-[#E5E7EB]",
          dot: "bg-[#667085]",
          icon: Bell,
        };
    }
  };

  const style = getSeverityStyle();
  const IconComponent = style.icon;

  const formatType = (type?: string) => {
    if (!type) return "";
    return type.replace(/_/g, " ");
  };

  return (
    <div className="flex items-center gap-2">
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-bold uppercase tracking-wider border ${style.bg} ${style.text} ${style.border}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
        {showIcon && <IconComponent size={12} />}
        <span>{severity}</span>
      </span>

      {alertType && (
        <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-lg bg-[#F8F9FA] text-[#667085] border border-[#E5E7EB]">
          {formatType(alertType)}
        </span>
      )}
    </div>
  );
};
