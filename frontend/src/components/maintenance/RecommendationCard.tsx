import React from "react";
import { RecommendationResponse } from "../../types/maintenance";
import { StatusBadge } from "../common/StatusBadge";
import { Wrench, Calendar, Clock, AlertCircle, FileText, CheckCircle2 } from "lucide-react";

interface RecommendationCardProps {
  recommendation: RecommendationResponse;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({ recommendation }) => {
  const priority = recommendation.priority.toUpperCase();

  const getPriorityStyle = () => {
    if (priority === "CRITICAL" || priority === "EMERGENCY") {
      return {
        bg: "bg-white border-rose-200",
        badgeBg: "bg-rose-50 border-rose-200 text-rose-800",
        text: "text-rose-600",
      };
    }
    if (priority === "HIGH") {
      return {
        bg: "bg-white border-[#F4B400]/40",
        badgeBg: "bg-[#FFF3C4] border-[#F4B400]/40 text-[#1F2933]",
        text: "text-[#D99A00]",
      };
    }
    if (priority === "MEDIUM") {
      return {
        bg: "bg-white border-[#E5E7EB]",
        badgeBg: "bg-[#FFFDF5] border-[#E5E7EB] text-[#1F2933]",
        text: "text-[#D99A00]",
      };
    }
    return {
      bg: "bg-white border-[#E5E7EB]",
      badgeBg: "bg-emerald-50 border-emerald-200 text-emerald-800",
      text: "text-emerald-600",
    };
  };

  const style = getPriorityStyle();

  return (
    <div className={`p-6 rounded-2xl border ${style.bg} shadow-xs space-y-6`}>
      {/* Top Priority Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E5E7EB]">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-[#FFFDF5] border border-[#E5E7EB]">
            <Wrench className={`w-6 h-6 ${style.text}`} />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#667085]">
              Prescriptive Decision Directive
            </span>
            <h3 className="text-lg font-bold text-[#1F2933] font-mono">
              Action Plan: {recommendation.machine_id}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs uppercase text-[#667085]">Urgency Level:</span>
          <StatusBadge status={recommendation.priority} size="lg" />
        </div>
      </div>

      {/* Recommended Action Prominently */}
      <div className="p-5 rounded-xl bg-[#FFFDF5] border border-[#F4B400]/40 space-y-2">
        <span className="text-[10px] font-mono uppercase tracking-wider text-[#D99A00] font-bold block">
          Recommended Action Directive
        </span>
        <p className="text-base sm:text-lg font-bold text-[#1F2933] leading-snug">
          {recommendation.recommended_action}
        </p>
      </div>

      {/* Maintenance Window & Est Hours */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#E5E7EB] flex items-center gap-3">
          <Calendar className="w-5 h-5 text-[#D99A00] shrink-0" />
          <div>
            <span className="text-[10px] font-mono uppercase text-[#667085] block">
              Recommended Window
            </span>
            <span className="text-sm font-bold text-[#1F2933]">
              {recommendation.recommended_window}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#E5E7EB] flex items-center gap-3">
          <Clock className="w-5 h-5 text-[#D99A00] shrink-0" />
          <div>
            <span className="text-[10px] font-mono uppercase text-[#667085] block">
              Estimated Servicing Time
            </span>
            <span className="text-sm font-bold font-mono text-[#D99A00]">
              {recommendation.estimated_repair_hours.toFixed(1)} Hours
            </span>
          </div>
        </div>
      </div>

      {/* Explainable Reason */}
      <div className="p-4 rounded-xl bg-[#FFFDF5] border border-[#E5E7EB] space-y-1.5">
        <div className="flex items-center gap-2 text-xs text-[#667085]">
          <FileText className="w-4 h-4 text-[#667085]" />
          <span className="font-semibold uppercase">Engine Rationale &amp; Justification:</span>
        </div>
        <p className="text-xs text-[#1F2933] leading-relaxed pl-6">
          {recommendation.reason}
        </p>
      </div>
    </div>
  );
};
