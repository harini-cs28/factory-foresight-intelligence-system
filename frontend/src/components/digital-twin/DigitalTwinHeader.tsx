import React from "react";
import { Factory, Activity, RotateCcw, Layers, Filter } from "lucide-react";
import { MachineItem } from "../../types/machine";

interface DigitalTwinHeaderProps {
  machines: MachineItem[];
  selectedLine: string;
  onSelectLine: (line: string) => void;
  onResetCamera: () => void;
}

export const DigitalTwinHeader: React.FC<DigitalTwinHeaderProps> = ({
  machines,
  selectedLine,
  onSelectLine,
  onResetCamera,
}) => {
  const lines = Array.from(new Set(machines.map((m) => m.production_line))).sort();

  const healthyCount = machines.filter(
    (m) => m.latest_prediction?.health_status === "HEALTHY"
  ).length;
  const atRiskCount = machines.filter(
    (m) => m.latest_prediction?.health_status === "AT_RISK"
  ).length;
  const criticalCount = machines.filter(
    (m) => m.latest_prediction?.health_status === "CRITICAL"
  ).length;

  return (
    <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      {/* Title & Backend status */}
      <div>
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#FFF3C4] border border-[#F4B400]/40 text-[#D99A00]">
            <Factory className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-[#1F2933] font-mono tracking-wider flex items-center gap-2">
              <span>TEXTILE PLANT DIGITAL TWIN (3D)</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FFF3C4] border border-[#F4B400]/40 text-[#1F2933] font-semibold">
                Spatial Model
              </span>
            </h1>
            <p className="text-xs text-[#667085]">
              3D spatial layout &amp; health surveillance across spinning, carding, weaving, and finishing lines.
            </p>
          </div>
        </div>
      </div>

      {/* Metrics & Filter Controls */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Status Counters */}
        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className="px-2.5 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800">
            {healthyCount} Healthy
          </span>
          <span className="px-2.5 py-1 rounded-xl bg-[#FFF3C4] border border-[#F4B400]/40 text-[#1F2933]">
            {atRiskCount} At Risk
          </span>
          <span className="px-2.5 py-1 rounded-xl bg-rose-50 border border-rose-200 text-rose-800">
            {criticalCount} Critical
          </span>
        </div>

        {/* Line Filter */}
        <div className="flex items-center gap-1.5 bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl px-2.5 py-1 text-xs text-[#1F2933]">
          <Filter className="w-3.5 h-3.5 text-[#667085]" />
          <select
            value={selectedLine}
            onChange={(e) => onSelectLine(e.target.value)}
            aria-label="Filter by Production Line"
            className="bg-transparent text-[#1F2933] focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Lines ({machines.length} Units)</option>
            {lines.map((line) => (
              <option key={line} value={line}>
                {line} ({machines.filter((m) => m.production_line === line).length} Units)
              </option>
            ))}
          </select>
        </div>

        {/* Camera Reset */}
        <button
          onClick={onResetCamera}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FFFFFF] hover:bg-[#FFF3C4] border border-[#E5E7EB] hover:border-[#F4B400] text-[#1F2933] text-xs font-semibold transition-all shadow-xs"
          title="Reset 3D camera to default isometric overview"
        >
          <RotateCcw className="w-3.5 h-3.5 text-[#D99A00]" />
          <span>Reset Camera</span>
        </button>
      </div>
    </div>
  );
};
