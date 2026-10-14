import React from "react";
import { ImpactResponse } from "../../types/impact";
import { StatusBadge } from "../common/StatusBadge";
import {
  Share2,
  Clock,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";

interface ImpactSummaryProps {
  impact: ImpactResponse;
}

export const ImpactSummary: React.FC<ImpactSummaryProps> = ({ impact }) => {
  const { cascade, production_impact } = impact;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Affected Machine Count */}
      <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#667085]">
            Downstream Impact
          </span>
          <div className="w-8 h-8 rounded-xl bg-[#FFF3C4] border border-[#F4B400]/40 flex items-center justify-center text-[#1F2933]">
            <Share2 className="w-4 h-4 text-[#1F2933]" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-bold font-mono text-[#1F2933]">
            {cascade.affected_machine_count}
          </span>
          <span className="text-xs text-[#667085]">Units Blocked</span>
        </div>
        <p className="text-xs text-[#667085] mt-2">
          Max Cascade Depth: <strong className="text-[#1F2933]">Level {cascade.maximum_cascade_level}</strong>
        </p>
      </div>

      {/* Impact Severity */}
      <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#667085]">
            Impact Severity Level
          </span>
          <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-1">
          <StatusBadge status={production_impact.impact_severity} size="md" />
        </div>
        <p className="text-xs text-[#667085] mt-2">
          Affects {production_impact.affected_production_lines.length} Production Line(s)
        </p>
      </div>

      {/* Estimated Total Repair Time */}
      <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#667085]">
            Estimated Repair Hours
          </span>
          <div className="w-8 h-8 rounded-xl bg-[#FFFDF5] border border-[#E5E7EB] flex items-center justify-center text-[#1F2933]">
            <Clock className="w-4 h-4 text-[#1F2933]" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-bold font-mono text-amber-800">
            {production_impact.estimated_total_repair_hours.toFixed(1)}
          </span>
          <span className="text-xs text-[#667085]">Hours Total</span>
        </div>
        <p className="text-xs text-[#667085] mt-2">
          Includes cascade isolation &amp; recalibration
        </p>
      </div>

      {/* Estimated Potential Downtime Cost */}
      <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#667085]">
            Potential Downtime Loss
          </span>
          <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-1">
          <span className="text-xl sm:text-2xl font-bold font-mono text-rose-600">
            {formatCurrency(production_impact.estimated_potential_downtime_cost)}
          </span>
        </div>
        <p className="text-xs text-[#667085] mt-2">
          Aggregated operational revenue risk
        </p>
      </div>
    </div>
  );
};

