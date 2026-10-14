import React from "react";
import { CheckCircle2, AlertTriangle, AlertOctagon, ShieldAlert } from "lucide-react";

interface StatusBadgeProps {
  status?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status = "UNKNOWN",
  size = "md",
  className = "",
}) => {
  const normStatus = (status || "UNKNOWN").toUpperCase().replace(/\s+/g, "_");

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs font-semibold gap-1",
    md: "px-2.5 py-1 text-xs font-semibold gap-1.5",
    lg: "px-3.5 py-1.5 text-sm font-bold gap-2",
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-3.5 h-3.5",
    lg: "w-4 h-4",
  };

  if (normStatus === "HEALTHY" || normStatus === "NORMAL" || normStatus === "LOW") {
    return (
      <span
        className={`inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/15 text-emerald-400 font-mono tracking-wide ${sizeClasses[size]} ${className}`}
      >
        <CheckCircle2 className={`${iconSizes[size]} text-emerald-400 shrink-0`} />
        <span>{normStatus === "LOW" ? "LOW PRIORITY" : "HEALTHY"}</span>
      </span>
    );
  }

  if (normStatus === "AT_RISK" || normStatus === "MEDIUM" || normStatus === "HIGH") {
    return (
      <span
        className={`inline-flex items-center rounded-full border border-amber-500/30 bg-amber-500/15 text-amber-400 font-mono tracking-wide ${sizeClasses[size]} ${className}`}
      >
        <AlertTriangle className={`${iconSizes[size]} text-amber-400 shrink-0`} />
        <span>{normStatus === "AT_RISK" ? "AT RISK" : normStatus}</span>
      </span>
    );
  }

  if (normStatus === "CRITICAL" || normStatus === "URGENT") {
    return (
      <span
        className={`inline-flex items-center rounded-full border border-rose-500/40 bg-rose-500/20 text-rose-400 font-mono tracking-wide animate-pulse ${sizeClasses[size]} ${className}`}
      >
        <AlertOctagon className={`${iconSizes[size]} text-rose-400 shrink-0`} />
        <span>CRITICAL</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center rounded-full border border-slate-600/40 bg-slate-700/20 text-slate-300 font-mono tracking-wide ${sizeClasses[size]} ${className}`}
    >
      <ShieldAlert className={`${iconSizes[size]} text-slate-400 shrink-0`} />
      <span>{normStatus}</span>
    </span>
  );
};
