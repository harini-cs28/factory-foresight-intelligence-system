import React from "react";
import { AlertOctagon, ArrowRight, ShieldAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface CriticalMachineAlert {
  machine_id: string;
  failure_probability: number;
  predicted_rul: number;
  process?: string;
  production_line?: string;
}

interface LiveAlertProps {
  criticalMachines: CriticalMachineAlert[];
}

export const LiveAlert: React.FC<LiveAlertProps> = ({ criticalMachines }) => {
  const navigate = useNavigate();

  if (!criticalMachines || criticalMachines.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3 mb-6">
      {criticalMachines.map((m) => (
        <div
          key={m.machine_id}
          className="relative overflow-hidden rounded-2xl border border-rose-200 bg-rose-50/80 p-4 shadow-xs"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="p-2.5 rounded-xl bg-rose-100 border border-rose-200 text-rose-600 shrink-0">
                <AlertOctagon size={24} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-800 px-2 py-0.5 rounded-lg bg-rose-100 border border-rose-200">
                    CRITICAL ALERT
                  </span>
                  <span className="text-sm font-bold text-[#1F2933] font-mono">
                    {m.machine_id}
                  </span>
                  {m.production_line && (
                    <span className="text-xs text-[#667085]">({m.production_line})</span>
                  )}
                </div>
                <p className="text-xs text-rose-800 mt-1">
                  Critical machine condition detected. Immediate preventive maintenance required.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6 self-end sm:self-center">
              <div className="text-right">
                <span className="text-xs text-[#667085] block">Failure Risk</span>
                <span className="text-sm font-bold text-rose-600 font-mono">
                  {(m.failure_probability * 100).toFixed(1)}%
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-[#667085] block">Estimated RUL</span>
                <span className="text-sm font-bold text-rose-700 font-mono">
                  {m.predicted_rul.toFixed(0)} cycles
                </span>
              </div>
              <button
                onClick={() => navigate(`/intelligence/${m.machine_id}`)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
              >
                <span>Diagnose</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
