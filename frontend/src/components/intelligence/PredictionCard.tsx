import React from "react";
import { PredictionData } from "../../types/prediction";
import { Cpu, CheckCircle2, AlertOctagon, Check } from "lucide-react";

interface PredictionCardProps {
  prediction: PredictionData;
}

export const PredictionCard: React.FC<PredictionCardProps> = ({ prediction }) => {
  const isFailure = prediction.failure_prediction;

  return (
    <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Cpu className="w-5 h-5 text-[#D99A00]" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#1F2933] font-mono">
            Machine Diagnostics
          </h3>
        </div>
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#FFF3C4] border border-[#F4B400]/40 text-[#1F2933]">
          Predictive Intelligence
        </span>
      </div>

      <div className="p-4 rounded-xl bg-[#FFFDF5] border border-[#E5E7EB] space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-[#667085]">Failure Imminent:</span>
          {isFailure ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-lg">
              <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
              TRUE (Failure Likely)
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-lg">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              FALSE (Normal Operation)
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-[#667085]">Computed Failure Probability:</span>
          <span className="text-sm font-bold font-mono text-[#1F2933]">
            {(prediction.failure_probability * 100).toFixed(2)}%
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-[#667085]">Telemetry Status:</span>
          <span className="text-xs font-bold text-[#1F2933] uppercase">
            {prediction.health_status}
          </span>
        </div>
      </div>
    </div>
  );
};
