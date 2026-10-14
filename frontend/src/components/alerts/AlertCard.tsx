import React, { useState } from "react";
import { AlertItem } from "../../types/alert";
import { AlertBadge } from "./AlertBadge";
import { Check, Clock, ArrowRight, Wrench, Cpu, CheckCircle2, UserCheck } from "lucide-react";
import { Link } from "react-router-dom";

interface AlertCardProps {
  alert: AlertItem;
  onAcknowledge: (alertId: number) => Promise<void>;
  canAcknowledge?: boolean;
}

export const AlertCard: React.FC<AlertCardProps> = ({
  alert,
  onAcknowledge,
  canAcknowledge = true,
}) => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleAck = async () => {
    setIsSubmitting(true);
    try {
      await onAcknowledge(alert.id);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (ts?: string | null) => {
    if (!ts) return "Recently";
    try {
      const d = new Date(ts);
      return d.toLocaleString([], {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return ts;
    }
  };

  const isCritical = alert.severity === "CRITICAL";

  return (
    <div
      className={`rounded-2xl border p-5 transition-all duration-300 shadow-xs ${
        alert.is_acknowledged
          ? "border-[#E5E7EB] bg-[#F8F9FA] opacity-75"
          : isCritical
          ? "border-rose-200 bg-white"
          : alert.severity === "HIGH"
          ? "border-[#F4B400]/40 bg-[#FFFDF5]"
          : "border-[#E5E7EB] bg-white"
      }`}
    >
      {/* Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to={`/intelligence/${alert.machine_id}`}
            className="text-base font-extrabold font-mono text-[#1F2933] hover:text-[#D99A00] transition-colors"
          >
            {alert.machine_id}
          </Link>
          <span className="text-xs text-[#667085]">({alert.production_line} • {alert.process})</span>
          <AlertBadge severity={alert.severity} alertType={alert.alert_type} />
        </div>

        <div className="flex items-center gap-1.5 text-xs text-[#667085]">
          <Clock size={12} />
          <span>{formatTime(alert.created_at)}</span>
        </div>
      </div>

      {/* Alert Title and Message */}
      <div className="mb-3.5">
        <h4 className="text-sm font-bold text-[#1F2933] mb-1">{alert.title}</h4>
        <p className="text-xs text-[#667085] leading-relaxed">{alert.message}</p>
      </div>

      {/* Recommended Action Box */}
      {alert.recommended_action && (
        <div className="p-3 rounded-xl bg-[#FFFDF5] border border-[#E5E7EB] mb-4 text-xs">
          <span className="font-bold text-[#D99A00] uppercase tracking-wider text-[10px] block mb-0.5">
            Recommended Action
          </span>
          <span className="text-[#1F2933]">{alert.recommended_action}</span>
        </div>
      )}

      {/* Footer with Status and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[#E5E7EB]">
        <div className="text-xs">
          {alert.is_acknowledged ? (
            <div className="flex items-center gap-1.5 text-emerald-700">
              <CheckCircle2 size={14} />
              <span>
                Acknowledged by <strong className="text-[#1F2933]">{alert.acknowledged_by || "Staff"}</strong>
                {alert.acknowledged_at && (
                  <span className="text-[#667085] font-mono ml-1.5">
                    ({formatTime(alert.acknowledged_at)})
                  </span>
                )}
              </span>
            </div>
          ) : (
            <span className="text-amber-700 text-[11px] font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D99A00] animate-ping" />
              Pending Operator Review
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Link
            to={`/intelligence/${alert.machine_id}`}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#FFFFFF] hover:bg-[#FFF3C4] text-xs font-semibold text-[#1F2933] border border-[#E5E7EB] hover:border-[#F4B400] transition-all shadow-xs"
          >
            <Cpu size={12} className="text-[#D99A00]" />
            <span>Diagnose</span>
          </Link>

          <Link
            to={`/maintenance/${alert.machine_id}`}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#FFFFFF] hover:bg-[#FFF3C4] text-xs font-semibold text-[#1F2933] border border-[#E5E7EB] hover:border-[#F4B400] transition-all shadow-xs"
          >
            <Wrench size={12} className="text-[#D99A00]" />
            <span>Work Order</span>
          </Link>

          {!alert.is_acknowledged && canAcknowledge && (
            <button
              onClick={handleAck}
              disabled={isSubmitting}
              className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-[#F4B400] hover:bg-[#D99A00] text-[#1F2933] text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              <Check size={13} />
              <span>{isSubmitting ? "Saving..." : "Acknowledge"}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
