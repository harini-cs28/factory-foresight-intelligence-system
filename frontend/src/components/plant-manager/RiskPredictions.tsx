import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { machineApi } from "../../api/machineApi";
import { explainabilityApi } from "../../api/explainabilityApi";
import { MachineItem, SensorHistoryItem } from "../../types/machine";
import { ExplainabilityResponse } from "../../types/explainability";
import { LoadingState } from "../common/LoadingState";
import { ErrorState } from "../common/ErrorState";
import {
  Cpu,
  RefreshCw,
  AlertTriangle,
  Activity,
  ArrowRight,
  TrendingDown,
  ShieldAlert,
} from "lucide-react";

export const RiskPredictions: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialMachineId = searchParams.get("machineId") || "SPIN-01";

  const [machines, setMachines] = useState<MachineItem[]>([]);
  const [selectedMachineId, setSelectedMachineId] = useState<string>(initialMachineId);
  const [sensorHistory, setSensorHistory] = useState<SensorHistoryItem[]>([]);
  const [explainability, setExplainability] = useState<ExplainabilityResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMachines = async () => {
    try {
      const data = await machineApi.getMachines();
      setMachines(data);
      if (!data.some((m) => m.machine_id === selectedMachineId) && data.length > 0) {
        setSelectedMachineId(data[0].machine_id);
      }
    } catch (err: any) {
      setError("Failed to load machine risk data.");
    }
  };

  const fetchMachineDetails = async (mId: string) => {
    try {
      const [history, exp] = await Promise.all([
        machineApi.getSensorHistory(mId, 15),
        explainabilityApi.getExplainability(mId).catch(() => null),
      ]);
      setSensorHistory(history);
      setExplainability(exp);
    } catch (err) {
      // Non-fatal
    }
  };

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await fetchMachines();
      await fetchMachineDetails(selectedMachineId);
      setIsLoading(false);
    };
    init();
  }, []);

  const handleSelectMachine = (mId: string) => {
    setSelectedMachineId(mId);
    fetchMachineDetails(mId);
  };

  if (isLoading) {
    return <LoadingState message="Aggregating Failure Probability & RUL Machine Predictions..." />;
  }

  const selectedMachine = machines.find((m) => m.machine_id === selectedMachineId) || machines[0];
  const sortedByRisk = [...machines].sort((a, b) => {
    const aRisk = a.latest_prediction?.failure_probability || 0;
    const bRisk = b.latest_prediction?.failure_probability || 0;
    return bRisk - aRisk;
  });

  const latestTelemetry = sensorHistory[sensorHistory.length - 1];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E7EB]">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-6 h-6 text-[#D99A00]" />
            <h1 className="text-xl font-bold text-[#1F2933] font-mono tracking-tight">
              MACHINE RISK &amp; ML PREDICTIONS
            </h1>
          </div>
          <p className="text-xs text-[#667085] mt-1">
            Predictive machine failure probability, Remaining Useful Life (RUL), and AI risk drivers.
          </p>
        </div>

        <button
          onClick={() => {
            fetchMachines();
            fetchMachineDetails(selectedMachineId);
          }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#FFFFFF] hover:bg-[#FFF3C4] border border-[#E5E7EB] hover:border-[#F4B400] text-[#1F2933] text-xs font-semibold transition-all shadow-xs cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#D99A00]" />
          <span>Refresh Inference</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Machine Risk Ranking */}
        <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-xs space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#1F2933] font-mono border-b border-[#E5E7EB] pb-2">
            Factory Risk Ranking ({machines.length} Assets)
          </h3>

          <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
            {sortedByRisk.map((m) => {
              const isSelected = m.machine_id === selectedMachineId;
              const prob = m.latest_prediction
                ? Math.round(m.latest_prediction.failure_probability * 100)
                : 0;
              const status = m.latest_prediction?.health_status || "HEALTHY";

              return (
                <button
                  key={m.machine_id}
                  onClick={() => handleSelectMachine(m.machine_id)}
                  className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? "bg-[#FFF3C4] border-[#F4B400] shadow-xs"
                      : "bg-[#FFFDF5] border-[#E5E7EB] hover:bg-[#FFFFFF]"
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold font-mono text-xs text-[#1F2933]">
                        {m.machine_id}
                      </span>
                      <span className="text-[10px] text-[#667085] font-mono">
                        {m.production_line}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#667085] truncate">{m.process}</div>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border font-mono ${
                        status === "CRITICAL"
                          ? "bg-rose-50 text-[#EF4444] border-rose-200"
                          : status === "AT_RISK"
                          ? "bg-amber-50 text-[#F59E0B] border-amber-200"
                          : "bg-emerald-50 text-[#22C55E] border-emerald-200"
                      }`}
                    >
                      {prob}% Risk
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right 2 Columns: Detailed Selected Machine Prediction & SHAP Explainability */}
        <div className="lg:col-span-2 space-y-6">
          {selectedMachine && (
            <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-xs space-y-6">
              {/* Selected Machine Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5E7EB] pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#FFF3C4] text-[#D99A00] border border-[#F4B400]/40">
                      {selectedMachine.production_line}
                    </span>
                    <h2 className="text-xl font-bold text-[#1F2933] font-mono">
                      {selectedMachine.machine_id} &ndash; {selectedMachine.process}
                    </h2>
                  </div>
                  <p className="text-xs text-[#667085] mt-1">
                    Criticality: <span className="font-bold text-[#1F2933]">{selectedMachine.criticality}</span> | Maintenance Window: <span className="font-bold text-[#1F2933]">{selectedMachine.maintenance_window || "N/A"}</span>
                  </p>
                </div>

                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full border font-mono self-start sm:self-auto ${
                    selectedMachine.latest_prediction?.health_status === "CRITICAL"
                      ? "bg-rose-50 text-[#EF4444] border-rose-200"
                      : selectedMachine.latest_prediction?.health_status === "AT_RISK"
                      ? "bg-amber-50 text-[#F59E0B] border-amber-200"
                      : "bg-emerald-50 text-[#22C55E] border-emerald-200"
                  }`}
                >
                  {selectedMachine.latest_prediction?.health_status || "HEALTHY"}
                </span>
              </div>

              {/* Core Prediction Gauges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-[#FFFDF5] border border-[#E5E7EB] space-y-1">
                  <div className="text-[10px] font-mono uppercase text-[#667085]">
                    Failure Probability (20 Cyc)
                  </div>
                  <div className="text-2xl font-bold font-mono text-[#1F2933]">
                    {selectedMachine.latest_prediction
                      ? Math.round(selectedMachine.latest_prediction.failure_probability * 100)
                      : 0}
                    %
                  </div>
                  <p className="text-[10px] text-[#667085]">GradientBoosting Model v1.0</p>
                </div>

                <div className="p-4 rounded-xl bg-[#FFFDF5] border border-[#E5E7EB] space-y-1">
                  <div className="text-[10px] font-mono uppercase text-[#667085]">
                    Predicted RUL (Remaining Life)
                  </div>
                  <div className="text-2xl font-bold font-mono text-[#1F2933]">
                    {selectedMachine.latest_prediction
                      ? selectedMachine.latest_prediction.predicted_rul.toFixed(1)
                      : "N/A"}{" "}
                    <span className="text-xs font-normal text-[#667085]">Cycles</span>
                  </div>
                  <p className="text-[10px] text-[#667085]">RandomForest Regressor v1.0</p>
                </div>

                <div className="p-4 rounded-xl bg-[#FFFDF5] border border-[#E5E7EB] space-y-1">
                  <div className="text-[10px] font-mono uppercase text-[#667085]">
                    Model Confidence
                  </div>
                  <div className="text-2xl font-bold font-mono text-[#22C55E]">
                    98.8%
                  </div>
                  <p className="text-[10px] text-[#667085]">Validated on Textile Dataset</p>
                </div>
              </div>

              {/* Live Sensor Telemetry Snapshot */}
              {latestTelemetry && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#1F2933] font-mono">
                    Latest Telemetry (Cycle #{latestTelemetry.cycle})
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 rounded-xl bg-[#FFFDF5] border border-[#E5E7EB]">
                      <div className="text-[10px] text-[#667085] font-mono uppercase">Vibration</div>
                      <div className="text-sm font-bold text-[#1F2933] font-mono">
                        {latestTelemetry.vibration_mm_s.toFixed(2)} mm/s
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-[#FFFDF5] border border-[#E5E7EB]">
                      <div className="text-[10px] text-[#667085] font-mono uppercase">Temperature</div>
                      <div className="text-sm font-bold text-[#1F2933] font-mono">
                        {latestTelemetry.temperature_c.toFixed(1)} &deg;C
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-[#FFFDF5] border border-[#E5E7EB]">
                      <div className="text-[10px] text-[#667085] font-mono uppercase">Motor Current</div>
                      <div className="text-sm font-bold text-[#1F2933] font-mono">
                        {latestTelemetry.motor_current_a.toFixed(1)} A
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-[#FFFDF5] border border-[#E5E7EB]">
                      <div className="text-[10px] text-[#667085] font-mono uppercase">Load</div>
                      <div className="text-sm font-bold text-[#1F2933] font-mono">
                        {latestTelemetry.load_percentage.toFixed(0)}%
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SHAP AI Risk Explanations */}
              {explainability && (
                <div className="space-y-3 pt-2 border-t border-[#E5E7EB]">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#1F2933] font-mono">
                    AI Decision Explainability &amp; Risk Drivers (SHAP)
                  </h3>
                  <div className="space-y-2">
                    {explainability.top_factors?.map((factor, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-[#FFFDF5] border border-[#E5E7EB] flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-bold font-mono text-[#1F2933]">
                            {factor.label || factor.feature}
                          </span>
                          <span className="text-[#667085] ml-2">Value: {factor.value}</span>
                        </div>
                        <span className="text-[11px] font-bold text-[#D99A00] font-mono">
                          +{Math.round(factor.contribution_score * 100)}% impact
                        </span>
                      </div>
                    ))}
                  </div>

                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
