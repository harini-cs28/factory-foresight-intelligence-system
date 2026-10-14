import React, { useEffect, useState } from "react";
import { explainabilityApi } from "../../api/explainabilityApi";
import { ExplainabilityResponse } from "../../types/explainability";
import { ExplanationSummary } from "./ExplanationSummary";
import { RiskFactorCard } from "./RiskFactorCard";
import { FeatureContributionList } from "./FeatureContributionList";
import { Brain, HelpCircle, Activity, RefreshCw } from "lucide-react";

interface ExplainabilityPanelProps {
  machineId: string;
}

export const ExplainabilityPanel: React.FC<ExplainabilityPanelProps> = ({ machineId }) => {
  const [data, setData] = useState<ExplainabilityResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExplainability = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await explainabilityApi.getExplainability(machineId);
      setData(res);
    } catch (err: any) {
      console.error("Explainability fetch error:", err);
      setError("Unable to compute model-derived explainability at this time.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExplainability();
  }, [machineId]);

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-8 text-center shadow-xs">
        <Activity size={32} className="mx-auto text-[#D99A00] animate-spin mb-2.5" />
        <p className="text-sm font-semibold text-[#1F2933]">
          Calculating feature attributions...
        </p>
        <p className="text-xs text-[#667085] mt-1">
          Evaluating risk attribution across diagnostics ensemble
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-sm text-rose-800 font-medium">{error || "No explainability data"}</span>
          <button
            onClick={fetchExplainability}
            className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5E7EB] pb-3">
        <div>
          <div className="flex items-center gap-2">
            <Brain size={20} className="text-[#D99A00]" />
            <h3 className="text-lg font-extrabold text-[#1F2933] tracking-tight uppercase">
              WHY IS THIS MACHINE AT RISK?
            </h3>
          </div>
          <p className="text-xs text-[#667085] mt-0.5">
            Model-derived risk attribution explaining the primary factors driving failure prediction
          </p>
        </div>

        <button
          onClick={fetchExplainability}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FFFFFF] hover:bg-[#FFF3C4] border border-[#E5E7EB] hover:border-[#F4B400] text-xs font-semibold text-[#1F2933] transition-all cursor-pointer self-start sm:self-auto shadow-xs"
        >
          <RefreshCw size={13} className="text-[#D99A00]" />
          <span>Recalculate Diagnostics</span>
        </button>
      </div>

      {/* Natural Language Decision Summary */}
      <ExplanationSummary
        summary={data.explanation_summary}
        method={data.method}
        baseValue={data.base_value}
        failureProbability={data.failure_probability}
      />

      {/* Top Contributing Risk Factors Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#667085]">
            Top Model-Derived Risk Factors
          </h4>
          <span className="text-[11px] text-[#667085]">
            Ranked by mathematical risk influence
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {data.top_factors.map((factor, idx) => (
            <RiskFactorCard key={factor.feature} factor={factor} rank={idx + 1} />
          ))}
        </div>
      </div>

      {/* Full Diverging Feature Contribution Waterfall List */}
      <FeatureContributionList factors={data.all_factors} />
    </div>
  );
};
