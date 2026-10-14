import React from "react";
import { Info } from "lucide-react";

export const MachineLegend: React.FC = () => {
  return (
    <div className="p-3.5 rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-xs space-y-2">
      <div className="flex items-center gap-2 text-xs font-bold uppercase text-[#1F2933]">
        <span>3D Telemetry Health Legend</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500" />
          <span className="text-emerald-700 font-semibold">HEALTHY</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#F4B400]" />
          <span className="text-amber-700 font-semibold">AT RISK</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-rose-500 animate-pulse" />
          <span className="text-rose-600 font-semibold">CRITICAL</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-slate-400" />
          <span className="text-[#667085] font-semibold">NO DATA</span>
        </div>
      </div>

      <div className="flex items-start gap-1.5 pt-1.5 border-t border-[#E5E7EB] text-[11px] text-[#667085]">
        <Info className="w-3.5 h-3.5 text-[#D99A00] shrink-0 mt-0.5" />
        <p>Machine status reflects real-time predictive health from the inference pipeline.</p>
      </div>
    </div>
  );
};
