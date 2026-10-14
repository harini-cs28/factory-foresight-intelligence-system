import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { machineApi } from "../../api/machineApi";
import { explainabilityApi } from "../../api/explainabilityApi";
import { MachineItem, SensorHistoryItem } from "../../types/machine";
import { ExplainabilityResponse } from "../../types/explainability";
import { LoadingState } from "../common/LoadingState";
import { ErrorState } from "../common/ErrorState";
import {
  Activity,
  RefreshCw,
  Gauge,
  Thermometer,
  Zap,
  RotateCw,
  ShieldAlert,
  ArrowRight,
} from "lucide-react";

export const MachineDiagnostics: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialMachineId = searchParams.get("machineId") || "SPIN-01";

  const [machines, setMachines] = useState<MachineItem[]>([]);
  const [selectedMachineId, setSelectedMachineId] = useState<string>(initialMachineId);
  const [history, setHistory] = useState<SensorHistoryItem[]>([]);
  const [explainability, setExplainability] = useState<ExplainabilityResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDiagnostics = async (mId: string) => {
    try {
      const [hist, exp] = await Promise.all([
        machineApi.getSensorHistory(mId, 30),
        explainabilityApi.getExplainability(mId).catch(() => null),
      ]);
      setHistory(hist);
      setExplainability(exp);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to load telemetry diagnostics.");
    }
  };

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      try {
        const mList = await machineApi.getMachines();
        setMachines(mList);
        await fetchDiagnostics(selectedMachineId);
      } catch (e) {
        setError("Failed to initialize diagnostics.");
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  const handleSelectMachine = (mId: string) => {
    setSelectedMachineId(mId);
    fetchDiagnostics(mId);
  };

  if (isLoading) {
    return <LoadingState message="Connecting to High-Frequency Telemetry Sensors & Diagnostics..." />;
  }

  const selectedMachine = machines.find((m) => m.machine_id === selectedMachineId);
  const latest = history[history.length - 1];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E7EB]">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-6 h-6 text-[#D99A00]" />
            <h1 className="text-xl font-bold text-[#1F2933] font-mono tracking-tight">
              MACHINE DIAGNOSTICS &amp; SENSOR TELEMETRY
            </h1>
          </div>
          <p className="text-xs text-[#667085] mt-1">
            Real-time multi-sensor telemetry, physical operational thresholds, and root-cause feature attribution.
          </p>
        </div>

        <button
          onClick={() => fetchDiagnostics(selectedMachineId)}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#FFFFFF] hover:bg-[#FFF3C4] border border-[#E5E7EB] hover:border-[#F4B400] text-[#1F2933] text-xs font-semibold transition-all shadow-xs cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#D99A00]" />
          <span>Refresh Sensors</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Machine Selector Sidebar */}
        <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-xs space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#1F2933] font-mono border-b border-[#E5E7EB] pb-2">
            Asset Telemetry Feeds
          </h3>

          <div className="space-y-1.5 max-h-[580px] overflow-y-auto pr-1">
            {machines.map((m) => {
              const isSelected = m.machine_id === selectedMachineId;
              const isCrit = m.latest_prediction?.health_status === "CRITICAL";
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
                  {isCrit && (
                    <span className="w-2 h-2 rounded-full bg-[#EF4444]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Diagnostics Dashboard */}
        <div className="lg:col-span-3 space-y-6">
          {latest && (
            <>
              {/* Primary Sensor Gauges */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="p-3.5 rounded-xl bg-[#FFFFFF] border border-[#E5E7EB] space-y-1">
                  <div className="flex items-center justify-between text-[#667085]">
                    <span className="text-[10px] font-mono uppercase">Vibration</span>
                    <Activity className="w-3.5 h-3.5 text-[#D99A00]" />
                  </div>
                  <div className="text-lg font-bold font-mono text-[#1F2933]">
                    {latest.vibration_mm_s.toFixed(2)}{" "}
                    <span className="text-[10px] font-normal text-[#667085]">mm/s</span>
                  </div>
                  <div className="text-[9px] text-[#667085]">Limit: &lt; 4.5 mm/s</div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#FFFFFF] border border-[#E5E7EB] space-y-1">
                  <div className="flex items-center justify-between text-[#667085]">
                    <span className="text-[10px] font-mono uppercase">Temperature</span>
                    <Thermometer className="w-3.5 h-3.5 text-[#EF4444]" />
                  </div>
                  <div className="text-lg font-bold font-mono text-[#1F2933]">
                    {latest.temperature_c.toFixed(1)}{" "}
                    <span className="text-[10px] font-normal text-[#667085]">&deg;C</span>
                  </div>
                  <div className="text-[9px] text-[#667085]">Limit: &lt; 85 &deg;C</div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#FFFFFF] border border-[#E5E7EB] space-y-1">
                  <div className="flex items-center justify-between text-[#667085]">
                    <span className="text-[10px] font-mono uppercase">Current</span>
                    <Zap className="w-3.5 h-3.5 text-[#F59E0B]" />
                  </div>
                  <div className="text-lg font-bold font-mono text-[#1F2933]">
                    {latest.motor_current_a.toFixed(1)}{" "}
                    <span className="text-[10px] font-normal text-[#667085]">A</span>
                  </div>
                  <div className="text-[9px] text-[#667085]">Limit: &lt; 25 A</div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#FFFFFF] border border-[#E5E7EB] space-y-1">
                  <div className="flex items-center justify-between text-[#667085]">
                    <span className="text-[10px] font-mono uppercase">Rotational Speed</span>
                    <RotateCw className="w-3.5 h-3.5 text-[#1F2933]" />
                  </div>
                  <div className="text-lg font-bold font-mono text-[#1F2933]">
                    {latest.rpm.toFixed(0)}{" "}
                    <span className="text-[10px] font-normal text-[#667085]">RPM</span>
                  </div>
                  <div className="text-[9px] text-[#667085]">Optimal: 1200-1800</div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#FFFFFF] border border-[#E5E7EB] space-y-1">
                  <div className="flex items-center justify-between text-[#667085]">
                    <span className="text-[10px] font-mono uppercase">Pressure</span>
                    <Gauge className="w-3.5 h-3.5 text-[#22C55E]" />
                  </div>
                  <div className="text-lg font-bold font-mono text-[#1F2933]">
                    {latest.pressure_bar.toFixed(2)}{" "}
                    <span className="text-[10px] font-normal text-[#667085]">bar</span>
                  </div>
                  <div className="text-[9px] text-[#667085]">Normal: 4-6 bar</div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#FFFFFF] border border-[#E5E7EB] space-y-1">
                  <div className="flex items-center justify-between text-[#667085]">
                    <span className="text-[10px] font-mono uppercase">Mechanical Load</span>
                    <Activity className="w-3.5 h-3.5 text-[#667085]" />
                  </div>
                  <div className="text-lg font-bold font-mono text-[#1F2933]">
                    {latest.load_percentage.toFixed(0)}%
                  </div>
                  <div className="text-[9px] text-[#667085]">Rated Cap: 100%</div>
                </div>
              </div>

              {/* Historical Telemetry Cycle Table */}
              <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#1F2933] font-mono">
                    Recent Sensor Cycles &ndash; {selectedMachineId}
                  </h3>
                  <span className="text-xs text-[#667085] font-mono">Last 30 Sampling Cycles</span>
                </div>

                <div className="overflow-x-auto rounded-xl border border-[#E5E7EB] max-h-80 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FFFDF5] text-[#667085] uppercase tracking-wider font-mono text-[10px] sticky top-0 border-b border-[#E5E7EB]">
                      <tr>
                        <th className="px-3.5 py-2.5">Cycle</th>
                        <th className="px-3.5 py-2.5">Vibration (mm/s)</th>
                        <th className="px-3.5 py-2.5">Temp (&deg;C)</th>
                        <th className="px-3.5 py-2.5">Current (A)</th>
                        <th className="px-3.5 py-2.5">RPM</th>
                        <th className="px-3.5 py-2.5">Pressure</th>
                        <th className="px-3.5 py-2.5">Load (%)</th>
                        <th className="px-3.5 py-2.5">Hours</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E7EB] font-mono">
                      {[...history].reverse().map((h) => (
                        <tr key={h.cycle} className="hover:bg-[#FFFDF5]">
                          <td className="px-3.5 py-2 font-bold text-[#1F2933]">#{h.cycle}</td>
                          <td
                            className={`px-3.5 py-2 ${
                              h.vibration_mm_s > 4.5 ? "text-[#EF4444] font-bold" : "text-[#1F2933]"
                            }`}
                          >
                            {h.vibration_mm_s.toFixed(2)}
                          </td>
                          <td
                            className={`px-3.5 py-2 ${
                              h.temperature_c > 85 ? "text-[#EF4444] font-bold" : "text-[#1F2933]"
                            }`}
                          >
                            {h.temperature_c.toFixed(1)}
                          </td>
                          <td className="px-3.5 py-2">{h.motor_current_a.toFixed(1)}</td>
                          <td className="px-3.5 py-2">{h.rpm.toFixed(0)}</td>
                          <td className="px-3.5 py-2">{h.pressure_bar.toFixed(2)}</td>
                          <td className="px-3.5 py-2">{h.load_percentage.toFixed(0)}%</td>
                          <td className="px-3.5 py-2 text-[#667085]">{h.operating_hours}h</td>
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
