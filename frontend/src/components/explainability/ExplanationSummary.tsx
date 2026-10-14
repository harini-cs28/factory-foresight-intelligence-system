import React from "react";
import { Sparkles, Brain, Info } from "lucide-react";

interface ExplanationSummaryProps {
  summary: string;
  method?: string;
  baseValue?: number;
  failureProbability: number;
}

export const ExplanationSummary: React.FC<ExplanationSummaryProps> = ({
  summary,
  method = "SHAP (TreeExplainer)",
  baseValue,
  failureProbability,
}) => {
  const isHighRisk = failureProbability >= 0.7;
  const isModerateRisk = failureProbability >= 0.3 && failureProbability < 0.7;

  const getBorderColor = () => {
    if (isHighRisk) return "border-rose-200 bg-white";
    if (isModerateRisk) return "border-[#F4B400]/40 bg-[#FFFDF5]";
    return "border-emerald-200 bg-white";
  };

  return (
    <div className={`rounded-2xl border p-5 shadow-xs ${getBorderColor()}`}>
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-[#FFF3C4] border border-[#F4B400]/40 text-[#D99A00]">
            <Brain size={18} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#1F2933] flex items-center gap-1.5">
              <span>Decision-Support AI Explanation</span>
              <span className="text-[10px] uppercase tracking-wider font-mono px-2 py-0.5 rounded bg-[#FFF3C4] text-[#1F2933] border border-[#F4B400]/40">
                AI Diagnostics
              </span>
            </h4>
            <p className="text-[11px] text-[#667085]">
              Model-derived feature attribution for failure risk diagnostics
            </p>
          </div>
        </div>

        {baseValue !== undefined && (
          <div className="text-right hidden sm:block">
            <span className="text-[10px] text-[#667085] uppercase font-mono block">Baseline Prior</span>
            <span className="text-xs font-mono font-bold text-[#1F2933]">
              {(baseValue * 100).toFixed(1)}%
            </span>
          </div>
        )}
      </div>

      <p className="text-sm font-medium text-[#1F2933] leading-relaxed bg-[#FFFDF5] border border-[#E5E7EB] p-3.5 rounded-xl">
        "{summary}"
      </p>

      <div className="mt-3 flex items-center gap-2 text-[11px] text-[#667085]">
        <Info size={12} className="shrink-0 text-[#667085]" />
        <span>
          Attributions reflect mathematical contributions toward predicted risk and assist maintenance personnel in root-cause diagnosis.
        </span>
      </div>
    </div>
  );
};
