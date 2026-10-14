import React from "react";
import { RiskFactor } from "../../types/explainability";
import { TrendingUp, TrendingDown, Minus, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface RiskFactorCardProps {
  factor: RiskFactor;
  rank: number;
}

export const RiskFactorCard: React.FC<RiskFactorCardProps> = ({ factor, rank }) => {
  const increasesRisk = factor.impact === "INCREASES_RISK";
  const decreasesRisk = factor.impact === "DECREASES_RISK";

  const getStyle = () => {
    if (increasesRisk) {
      return {
        cardBorder: "border-rose-200 hover:border-rose-400",
        cardBg: "bg-white",
        badgeBg: "bg-rose-50 text-rose-800 border-rose-200",
        badgeText: "Increases Risk",
        barColor: "bg-rose-500",
        icon: ArrowUpRight,
        iconColor: "text-rose-600",
      };
    }
    if (decreasesRisk) {
      return {
        cardBorder: "border-emerald-200 hover:border-emerald-400",
        cardBg: "bg-white",
        badgeBg: "bg-emerald-50 text-emerald-800 border-emerald-200",
        badgeText: "Decreases Risk",
        barColor: "bg-emerald-500",
        icon: ArrowDownRight,
        iconColor: "text-emerald-600",
      };
    }
    return {
      cardBorder: "border-[#E5E7EB]",
      cardBg: "bg-white",
      badgeBg: "bg-[#F8F9FA] text-[#667085] border-[#E5E7EB]",
      badgeText: "Neutral",
      barColor: "bg-slate-400",
      icon: Minus,
      iconColor: "text-[#667085]",
    };
  };

  const style = getStyle();
  const IconComponent = style.icon;

  // Visual bar width normalized roughly up to 0.40 SHAP magnitude
  const barWidthPercent = Math.min(100, Math.max(8, (Math.abs(factor.shap_value) / 0.35) * 100));

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border p-4 transition-all duration-300 shadow-xs ${style.cardBorder} ${style.cardBg}`}
    >
      <div className="flex items-start justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-2.5">
          <span className="w-5 h-5 rounded-md bg-[#FFF3C4] border border-[#F4B400]/40 text-[#1F2933] text-[10px] font-bold font-mono flex items-center justify-center">
            #{rank}
          </span>
          <div>
            <h5 className="text-sm font-bold text-[#1F2933]">{factor.label}</h5>
            <span className="text-[10px] text-[#667085] font-mono">{factor.feature}</span>
          </div>
        </div>

        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold border ${style.badgeBg}`}
        >
          <IconComponent size={12} />
          <span>{style.badgeText}</span>
        </span>
      </div>

      <div className="flex items-baseline justify-between my-2">
        <div>
          <span className="text-xs text-[#667085] block">Current Telemetry</span>
          <span className="text-xl font-bold font-mono text-[#1F2933]">
            {factor.value.toFixed(1)}{" "}
            <span className="text-xs text-[#667085] font-normal">{factor.unit}</span>
          </span>
        </div>

        <div className="text-right">
          <span className="text-xs text-[#667085] block">Risk Attribution</span>
          <span
            className={`text-sm font-bold font-mono ${
              increasesRisk ? "text-rose-600" : decreasesRisk ? "text-emerald-700" : "text-[#667085]"
            }`}
          >
            {factor.shap_value > 0 ? `+${factor.shap_value.toFixed(4)}` : factor.shap_value.toFixed(4)}
          </span>
        </div>
      </div>

      {/* SHAP Impact Bar */}
      <div className="mt-3">
        <div className="w-full bg-[#F8F9FA] rounded-full h-1.5 overflow-hidden border border-[#E5E7EB]">
          <div
            className={`h-full rounded-full transition-all duration-500 ${style.barColor}`}
            style={{ width: `${barWidthPercent}%` }}
          />
        </div>
        <div className="flex justify-between items-center text-[10px] text-[#667085] mt-1.5">
          <span>Nominal Range: {factor.nominal_range}</span>
          <span>Attribution Score: {(factor.contribution_score * 100).toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
};
