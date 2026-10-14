import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { machineApi } from "../../api/machineApi";
import { MachineItem, SensorHistoryItem } from "../../types/machine";
import { Navigation } from "../layout/Navigation";
import { HealthIndicator } from "./HealthIndicator";
import { PredictionCard } from "./PredictionCard";
import { RULCard } from "./RULCard";
import { ExplainabilityPanel } from "../explainability/ExplainabilityPanel";
import { LoadingState } from "../common/LoadingState";
import { ErrorState } from "../common/ErrorState";
import { EmptyState } from "../common/EmptyState";
import {
  Cpu,
  Activity,
  ArrowRight,
  Gauge,
  Thermometer,
  Zap,
  RotateCw,
  Clock,
  Shield,
  Layers,
} from "lucide-react";

export const MachineIntelligence: React.FC = () => {
  const { machineId = "M01" } = useParams<{ machineId: string }>();

  const [machine, setMachine] = useState<MachineItem | null>(null);
  const [sensorHistory, setSensorHistory] = useState<SensorHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMachineIntelligence = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [machineData, historyData] = await Promise.all([
        machineApi.getMachineById(machineId),
        machineApi.getSensorHistory(machineId, 15),
      ]);
      setMachine(machineData);
      setSensorHistory(historyData);
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ||
          `Unable to retrieve intelligence telemetry for machine '${machineId}'.`
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMachineIntelligence();
  }, [machineId]);

  if (isLoading) {
    return <LoadingState message={`Computing AI diagnostics for machine ${machineId}...`} />;
  }

  if (error || !machine) {
    return (
      <ErrorState
        title="Machine Diagnostics Unavailable"
        message={error || `Could not find machine record for '${machineId}'.`}
        onRetry={fetchMachineIntelligence}
      />
    );
  }

  const prediction = machine.latest_prediction;

  return (
    <div className="space-y-6">
      {/* Sub Navigation Bar for Machine */}
      <Navigation machineId={machineId} />

      {/* Machine Asset Header Banner */}
      <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold font-mono text-[#1F2933] tracking-wider">
              {machine.machine_id}
            </span>
            <span className="px-3 py-1 rounded-full bg-[#FFF3C4] border border-[#F4B400]/40 text-xs font-semibold text-[#1F2933]">
              {machine.process}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs text-[#667085] mt-2">
            <span>Production Line: <strong className="text-[#1F2933]">{machine.production_line}</strong></span>
            <span>Criticality Level: <strong className="text-amber-700">{machine.criticality}</strong></span>
            <span>Technician Available: <strong className="text-[#1F2933]">{machine.technician_available || "Yes"}</strong></span>
            <span>Spare Part Status: <strong className="text-[#1F2933]">{machine.spare_part_available || "In Stock"}</strong></span>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          <Link
            to={`/impact/${machine.machine_id}`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FFFFFF] hover:bg-[#FFF3C4] border border-[#E5E7EB] hover:border-[#F4B400] text-[#1F2933] text-xs font-semibold transition-all shadow-xs"
          >
            <span>Cascade Impact</span>
            <ArrowRight className="w-4 h-4 text-[#D99A00]" />
          </Link>
          <Link
            to={`/maintenance/${machine.machine_id}`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#F4B400] hover:bg-[#D99A00] text-[#1F2933] text-xs font-bold transition-all shadow-xs"
          >
            <span>Maintenance Engine</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Core Diagnostic Components */}
      {prediction ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <HealthIndicator
            status={prediction.health_status}
            failureProbability={prediction.failure_probability}
          />
          <PredictionCard prediction={prediction} />
          <RULCard predictedRul={prediction.predicted_rul} />
        </div>
      ) : (
        <EmptyState
          title="No Prediction Record Found"
          message="There is no calculated prediction in PostgreSQL for this machine."
        />
      )}

      {/* SHAP Feature Attribution & Explainable AI Diagnostics */}
      <ExplainabilityPanel machineId={machine.machine_id} />

      {/* Real-time Sensor Telemetry History Table */}
      <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#D99A00]" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#1F2933] font-mono">
              Chronological Telemetry Stream (Last {sensorHistory.length} Cycles)
            </h3>
          </div>
          <span className="text-xs text-[#667085]">
            Source: Sensor Telemetry
          </span>
        </div>

        {sensorHistory.length === 0 ? (
          <p className="text-xs text-[#667085]">No sensor records found for this unit.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-[#E5E7EB]">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E5E7EB] text-[#667085] uppercase tracking-wider bg-[#FFFDF5] font-semibold">
                  <th className="p-3">Cycle</th>
                  <th className="p-3">Temp (°C)</th>
                  <th className="p-3">Vibration (mm/s)</th>
                  <th className="p-3">Current (A)</th>
                  <th className="p-3">RPM</th>
                  <th className="p-3">Pressure (bar)</th>
                  <th className="p-3">Load (%)</th>
                  <th className="p-3">Op Hours</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {sensorHistory.map((item) => (
                  <tr key={item.cycle} className="hover:bg-[#FFFDF5] transition-colors text-[#1F2933]">
                    <td className="p-3 font-bold text-[#D99A00]">#{item.cycle}</td>
                    <td className="p-3 font-mono">{item.temperature_c.toFixed(1)}</td>
                    <td className="p-3 font-mono">{item.vibration_mm_s.toFixed(2)}</td>
                    <td className="p-3 font-mono">{item.motor_current_a.toFixed(1)}</td>
                    <td className="p-3 font-mono">{item.rpm.toFixed(0)}</td>
                    <td className="p-3 font-mono">{item.pressure_bar.toFixed(2)}</td>
                    <td className="p-3 font-mono">{item.load_percentage.toFixed(1)}%</td>
                    <td className="p-3 text-[#667085] font-mono">{item.operating_hours} hrs</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
