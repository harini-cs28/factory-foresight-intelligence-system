import React from "react";
import { Clock, AlertTriangle, CheckCircle, Hourglass } from "lucide-react";

interface RULCardProps {
  predictedRul: number;
}

export const RULCard: React.FC<RULCardProps> = ({ predictedRul }) => {
  const rulHours = Math.max(0, predictedRul);

  const getRulCategory = () => {
    if (rulHours <= 15) {
      return {
        label: "CRITICAL WEAR WINDOW",
        color: "text-rose-600",
        border: "border-rose-200",
        bg: "bg-white",
        icon: <Hourglass className="w-5 h-5 text-rose-600 animate-spin" />,
        desc: "Expected failure in under 15 operational cycles. Servicing mandatory immediately.",
      };
    }
    if (rulHours <= 40) {
      return {
        label: "ATTENTION REQUIRED",
        color: "text-amber-700",
        border: "border-[#F4B400]/40",
        bg: "bg-white",
        icon: <AlertTriangle className="w-5 h-5 text-[#D99A00]" />,
        desc: "Moderate wear degradation. Schedule maintenance during next planned window.",
      };
    }
    return {
      label: "OPTIMAL ENDURANCE",
      color: "text-emerald-700",
      border: "border-emerald-200",
      bg: "bg-white",
      icon: <CheckCircle className="w-5 h-5 text-emerald-600" />,
      desc: "Ample operational lifespan remaining without intervention required.",
    };
  };

  const category = getRulCategory();

  return (
    <div className={`p-6 rounded-2xl border ${category.border} ${category.bg} shadow-xs space-y-4`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-[#D99A00]" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#1F2933] font-mono">
            Remaining Useful Life (RUL)
          </h3>
        </div>
        {category.icon}
      </div>

      <div className="p-4 rounded-xl bg-[#FFFDF5] border border-[#E5E7EB] flex items-baseline justify-between">
        <div>
          <span className="text-[10px] font-mono uppercase text-[#667085] block mb-1">
            Predicted Cycles Remaining
          </span>
          <span className={`text-3xl font-extrabold font-mono ${category.color}`}>
            {rulHours.toFixed(1)}
          </span>
          <span className="text-xs text-[#667085] font-mono ml-2">Cycles</span>
        </div>

        <div className="text-right">
          <span className="text-xs font-mono font-bold uppercase text-[#1F2933]">
            {category.label}
          </span>
        </div>
      </div>

      <p className="text-xs text-[#667085] leading-relaxed">{category.desc}</p>
    </div>
  );
};
