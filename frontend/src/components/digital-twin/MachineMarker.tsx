import React from "react";
import { MachineItem } from "../../types/machine";
import { StatusBadge } from "../common/StatusBadge";

interface MachineMarkerProps {
  machine: MachineItem;
  screenPos: { x: number; y: number } | null;
  isSelected: boolean;
  isCascadeAffected: boolean;
  onClick: () => void;
}

export const MachineMarker: React.FC<MachineMarkerProps> = ({
  machine,
  screenPos,
  isSelected,
  isCascadeAffected,
  onClick,
}) => {
  if (!screenPos) return null;

  const status = machine.latest_prediction?.health_status || "UNKNOWN";

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`fixed z-20 pointer-events-auto transform -translate-x-1/2 -translate-y-full cursor-pointer transition-all duration-150 select-none ${
        isSelected ? "scale-110" : "hover:scale-105"
      }`}
      style={{ left: `${screenPos.x}px`, top: `${screenPos.y - 12}px` }}
    >
      <div
        className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1.5 shadow-md border ${
          isSelected
            ? "bg-[#FFF3C4] text-[#1F2933] border-[#F4B400] ring-2 ring-[#F4B400]"
            : isCascadeAffected
            ? "bg-rose-50 text-rose-800 border-rose-400 animate-bounce"
            : "bg-[#FFFFFF] text-[#1F2933] border-[#E5E7EB] hover:border-[#F4B400]"
        }`}
      >
        <span>{machine.machine_id}</span>
        <span
          className={`w-2 h-2 rounded-full ${
            status === "HEALTHY"
              ? "bg-emerald-400"
              : status === "AT_RISK"
              ? "bg-amber-400"
              : status === "CRITICAL"
              ? "bg-rose-400 animate-ping"
              : "bg-slate-400"
          }`}
        />
      </div>
    </div>
  );
};
