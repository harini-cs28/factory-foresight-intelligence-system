import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { machineApi } from "../../api/machineApi";
import { MachineItem, SensorHistoryItem } from "../../types/machine";
import { LoadingState } from "../common/LoadingState";
import { ErrorState } from "../common/ErrorState";
import {
  Cpu,
  RefreshCw,
  TrendingDown,
  AlertTriangle,
  Clock,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

export const FailureRULAnalysis: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialMachineId = searchParams.get("machineId") || "SPIN-01";

  const [machines, setMachines] = useState<MachineItem[]>([]);
  const [selectedMachineId, setSelectedMachineId] = useState<string>(initialMachineId);
  const [history, setHistory] = useState<SensorHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (mId: string) => {
    try {
      const [mList, hist] = await Promise.all([
        machineApi.getMachines(),
        machineApi.getSensorHistory(mId, 40),
      ]);
      setMachines(mList);
      setHistory(hist);
    } catch (e: any) {
      setError("Failed to load Failure & RUL data.");
    }
  };

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await fetchData(selectedMachineId);
      setIsLoading(false);
    };
    init();
  }, []);

  const handleSelectMachine = (mId: string) => {
    setSelectedMachineId(mId);
    fetchData(mId);
  };

  if (isLoading) {
    return <LoadingState message="Computing Failure Probability Curves & RUL Regression..." />;
  }

  const selectedMachine = machines.find((m) => m.machine_id === selectedMachineId);
  const pred = selectedMachine?.latest_prediction;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E7EB]">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-6 h-6 text-[#D99A00]" />
            <h1 className="text-xl font-bold text-[#1F2933] font-mono tracking-tight">
              FAILURE PROBABILITY &amp; RUL ANALYSIS
            </h1>
          </div>
          <p className="text-xs text-[#667085] mt-1">
            Machine remaining useful life degradation curves, failure probability forecasting, and wear trends.
          </p>
        </div>

        <button
          onClick={() => fetchData(selectedMachineId)}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#FFFFFF] hover:bg-[#FFF3C4] border border-[#E5E7EB] hover:border-[#F4B400] text-[#1F2933] text-xs font-semibold transition-all shadow-xs cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#D99A00]" />
          <span>Refresh Analysis</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Machine Selector */}
        <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-xs space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#1F2933] font-mono border-b border-[#E5E7EB] pb-2">
            Assets Monitored
          </h3>

          <div className="space-y-1.5 max-h-[580px] overflow-y-auto pr-1">
            {machines.map((m) => {
              const isSelected = m.machine_id === selectedMachineId;
              const rul = m.latest_prediction
                ? m.latest_prediction.predicted_rul.toFixed(1)
                : "N/A";
              return (
                <button
                  key={m.machine_id}
                  onClick={() => handleSelectMachine(m.machine_id)}
                  className={`w-full p-2.5 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? "bg-[#FFF3C4] border-[#F4B400] shadow-xs"
                      : "bg-[#FFFDF5] border-[#E5E7EB] hover:bg-[#FFFFFF]"
                  }`}
                >
                  <div>
                    <div className="font-bold font-mono text-xs text-[#1F2933]">
                      {m.machine_id}
                    </div>
                    <div className="text-[10px] text-[#667085]">{m.process}</div>
                  </div>
                  <span className="font-mono text-xs font-bold text-[#1F2933]">
                    {rul} Cyc
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Failure & RUL Breakdown */}
        <div className="lg:col-span-3 space-y-6">
          {selectedMachine && pred && (
            <>
              {/* Gauges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-xs space-y-1">
                  <div className="text-xs font-bold text-[#667085] uppercase font-mono">
                    Failure Probability (20 Cyc)
                  </div>
                  <div className="text-3xl font-extrabold font-mono text-[#1F2933]">
                    {Math.round(pred.failure_probability * 100)}%
                  </div>
                  <div
                    className={`text-[11px] font-bold font-mono ${
                      pred.failure_prediction ? "text-[#EF4444]" : "text-[#22C55E]"
                    }`}
                  >
                    {pred.failure_prediction
                      ? "FLAGGED: Failure predicted within 20 cycles"
                      : "SAFE: No imminent failure predicted"}
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-xs space-y-1">
                  <div className="text-xs font-bold text-[#667085] uppercase font-mono">
                    Remaining Useful Life (RUL)
                  </div>
                  <div className="text-3xl font-extrabold font-mono text-[#1F2933]">
                    {pred.predicted_rul.toFixed(1)}{" "}
                    <span className="text-sm font-normal text-[#667085]">Cycles</span>
                  </div>
                  <div className="text-[11px] font-bold font-mono text-[#D99A00]">
                    Threshold: 15 Cyc Critical / 35 Cyc At-Risk
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-xs space-y-1">
                  <div className="text-xs font-bold text-[#667085] uppercase font-mono">
                    Model Version &amp; Status
                  </div>
                  <div className="text-xl font-extrabold font-mono text-[#1F2933]">
                    {pred.model_version || "v1.0"}
                  </div>
                  <div className="text-[11px] text-[#22C55E] font-bold font-mono">
                    Status: {pred.health_status}
                  </div>
                </div>
              </div>

              {/* RUL History Table */}
              <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#1F2933] font-mono">
                    Historical RUL Degradation Tracking &ndash; {selectedMachineId}
                  </h3>
                  <span className="text-xs text-[#667085] font-mono">Cycle-by-cycle degradation</span>
                </div>

                <div className="overflow-x-auto rounded-xl border border-[#E5E7EB] max-h-80 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FFFDF5] text-[#667085] uppercase tracking-wider font-mono text-[10px] sticky top-0 border-b border-[#E5E7EB]">
                      <tr>
                        <th className="px-4 py-2.5">Cycle</th>
                        <th className="px-4 py-2.5">Operating Hours</th>
                        <th className="px-4 py-2.5">Ground-Truth RUL</th>
                        <th className="px-4 py-2.5">Vibration</th>
                        <th className="px-4 py-2.5">Failure State</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E7EB] font-mono">
                      {[...history].reverse().map((h) => (
                        <tr key={h.cycle} className="hover:bg-[#FFFDF5]">
                          <td className="px-4 py-2 font-bold text-[#1F2933]">#{h.cycle}</td>
                          <td className="px-4 py-2">{h.operating_hours} hrs</td>
                          <td className="px-4 py-2 font-bold text-[#1F2933]">
                            {h.rul_cycles} Cycles
                          </td>
                          <td className="px-4 py-2">{h.vibration_mm_s.toFixed(2)} mm/s</td>
                          <td className="px-4 py-2">
                            {h.failure_within_20_cycles === 1 ? (
                              <span className="text-[10px] font-bold text-[#EF4444] bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                                FAILURE WITHIN 20 CYC
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-[#22C55E] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                NORMAL
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
