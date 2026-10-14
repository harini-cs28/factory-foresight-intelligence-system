import React, { useState } from "react";
import { RiskFactor } from "../../types/explainability";
import { Layers, Sliders, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface FeatureContributionListProps {
  factors: RiskFactor[];
}

export const FeatureContributionList: React.FC<FeatureContributionListProps> = ({
  factors,
}) => {
  const [showAll, setShowAll] = useState<boolean>(false);

  const displayedFactors = showAll ? factors : factors.slice(0, 5);

  const maxAbsShap = Math.max(...factors.map((f) => Math.abs(f.shap_value)), 0.001);

  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-xs">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Sliders size={18} className="text-[#D99A00]" />
          <h4 className="text-sm font-bold text-[#1F2933]">
            Feature Attribution Waterfall Breakdown
          </h4>
        </div>

        {factors.length > 5 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-xs font-semibold text-[#D99A00] hover:text-[#1F2933] transition-colors cursor-pointer"
          >
            {showAll ? "Show Top 5 Only" : `View All ${factors.length} Features`}
          </button>
        )}
      </div>

      <div className="space-y-3">
        {displayedFactors.map((factor) => {
          const isPos = factor.shap_value > 0;
          const absPercent = Math.min(100, (Math.abs(factor.shap_value) / maxAbsShap) * 100);

          return (
            <div
              key={factor.feature}
              className="p-3 rounded-xl bg-[#FFFDF5] border border-[#E5E7EB] transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[#1F2933]">{factor.label}</span>
                  <span className="text-[10px] text-[#667085] font-mono">
                    ({factor.value.toFixed(1)} {factor.unit})
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`font-mono font-bold flex items-center gap-1 ${
                      isPos ? "text-rose-600" : "text-emerald-700"
                    }`}
                  >
                    {isPos ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                    {isPos ? `+${factor.shap_value.toFixed(4)}` : factor.shap_value.toFixed(4)}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                      isPos
                        ? "bg-rose-50 text-rose-800 border-rose-200"
                        : "bg-emerald-50 text-emerald-800 border-emerald-200"
                    }`}
                  >
                    {isPos ? "Increases Risk" : "Reduces Risk"}
                  </span>
                </div>
              </div>

              {/* Centered zero-line diverging bar */}
              <div className="relative w-full h-2 bg-[#F8F9FA] rounded-full overflow-hidden flex border border-[#E5E7EB]">
                <div className="w-1/2 h-full flex justify-end">
                  {!isPos && (
                    <div
                      className="h-full bg-emerald-500 rounded-l-full transition-all duration-500"
                      style={{ width: `${absPercent}%` }}
                    />
                  )}
                </div>
                <div className="w-px h-full bg-[#E5E7EB] z-10" />
                <div className="w-1/2 h-full flex justify-start">
                  {isPos && (
                    <div
                      className="h-full bg-rose-500 rounded-r-full transition-all duration-500"
                      style={{ width: `${absPercent}%` }}
                    />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-[#E5E7EB] flex items-center justify-between text-[11px] text-[#667085] font-mono">
        <span className="text-emerald-700 font-semibold">← Pulls toward Healthy</span>
        <span>Center: Baseline</span>
        <span className="text-rose-600 font-semibold">Pushes toward Failure →</span>
      </div>
    </div>
  );
};
