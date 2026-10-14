import React from "react";
import { MachineItem } from "../../types/machine";
import { StatusBadge } from "../common/StatusBadge";
import { Activity, Clock } from "lucide-react";

interface MachineTooltipProps {
  machine: MachineItem | null;
  position: { x: number; y: number } | null;
}

export const MachineTooltip: React.FC<MachineTooltipProps> = ({ machine, position }) => {
  if (!machine || !position) return null;

  const prediction = machine.latest_prediction;
  const status = prediction?.health_status || "NO DATA";
  const rul = prediction ? `${prediction.predicted_rul.toFixed(1)} cycles` : "N/A";
  const prob = prediction ? `${(prediction.failure_probability * 100).toFixed(1)}%` : "N/A";

  return (
    <div
      className="fixed z-50 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-3 px-3.5 py-2.5 rounded-xl bg-[#FFFFFF] border border-[#F4B400] shadow-xl min-w-[200px] text-xs transition-transform duration-75"
      style={{ left: `${position.x}px`, top: `${position.y}px` }}
    >
      <div className="flex items-center justify-between gap-2 border-b border-[#E5E7EB] pb-1.5 mb-1.5">
        <span className="font-bold text-[#1F2933] text-sm tracking-wide font-mono">{machine.machine_id}</span>
        <StatusBadge status={status} size="sm" />
      </div>

      <div className="space-y-1 text-[#1F2933]">
        <div className="flex justify-between">
          <span className="text-[#667085]">Process:</span>
          <span className="font-semibold text-[#1F2933]">{machine.process}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#667085]">Line:</span>
          <span className="text-[#1F2933] font-semibold">{machine.production_line}</span>
        </div>
        <div className="flex justify-between items-center pt-1 border-t border-[#E5E7EB]">
          <span className="text-[#667085] flex items-center gap-1">
            <Activity className="w-3 h-3 text-rose-600" />
            Risk:
          </span>
          <span className="font-bold text-rose-600 font-mono">{prob}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[#667085] flex items-center gap-1">
            <Clock className="w-3 h-3 text-[#D99A00]" />
            RUL:
          </span>
          <span className="font-bold text-[#1F2933] font-mono">{rul}</span>
        </div>
      </div>
      <div className="text-[10px] text-[#D99A00] font-semibold text-center mt-2 pt-1 border-t border-[#E5E7EB]">
        Click to inspect machine details
      </div>
    </div>
  );
};
