import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Activity,
  Cpu,
  Play,
  RotateCw,
  TrendingUp,
  AlertOctagon,
  ArrowRight,
  Shield,
  Layers,
  Box,
  Eye,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { sensorApi } from "../../api/sensorApi";
import { machineApi } from "../../api/machineApi";
import { SensorReading, LivePredictionResponse } from "../../types/sensor";
import { MachineItem } from "../../types/machine";
import { SensorCards } from "./SensorCards";
import { SensorTrend } from "./SensorTrend";
import { LiveHealthIndicator } from "./LiveHealthIndicator";
import { LastUpdated } from "./LastUpdated";
import { LiveAlert } from "./LiveAlert";

export const LiveMachineMonitor: React.FC = () => {
  const { machineId: paramMachineId } = useParams<{ machineId?: string }>();
  const navigate = useNavigate();

  const [machines, setMachines] = useState<MachineItem[]>([]);
  const [selectedMachineId, setSelectedMachineId] = useState<string>(
    paramMachineId || "SPIN-01"
  );
  const [latestReadings, setLatestReadings] = useState<Record<string, SensorReading>>({});
  const [livePredictions, setLivePredictions] = useState<Record<string, LivePredictionResponse>>({});
  const [machineHistory, setMachineHistory] = useState<SensorReading[]>([]);
  const [lastUpdatedTime, setLastUpdatedTime] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isStepping, setIsStepping] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLine, setSelectedLine] = useState<string>("ALL");

  const pollTimerRef = useRef<number | null>(null);

  // Sync param changes
  useEffect(() => {
    if (paramMachineId && paramMachineId !== selectedMachineId) {
      setSelectedMachineId(paramMachineId);
    }
  }, [paramMachineId]);

  // Initial load of machines
  useEffect(() => {
    const fetchMachines = async () => {
      try {
        const data = await machineApi.getMachines();
        setMachines(data);
        if (data.length > 0 && !paramMachineId) {
          setSelectedMachineId(data[0].machine_id);
        }
      } catch (err: any) {
        console.error("Error fetching machines:", err);
      }
    };
    fetchMachines();
  }, []);

  // Poll sensor telemetry
  const fetchTelemetry = async () => {
    try {
      setError(null);
      const res = await sensorApi.getLatestSensors();
      const readingsMap: Record<string, SensorReading> = {};
      res.machines.forEach((r) => {
        readingsMap[r.machine_id] = r;
      });
      setLatestReadings(readingsMap);
      setLastUpdatedTime(new Date().toISOString());

      // Fetch prediction for currently selected machine
      if (selectedMachineId && readingsMap[selectedMachineId]) {
        try {
          const pred = await sensorApi.getLivePrediction(selectedMachineId);
          setLivePredictions((prev) => ({ ...prev, [selectedMachineId]: pred }));
        } catch (predErr) {
          console.warn("Prediction fetch error for", selectedMachineId, predErr);
        }

        // Fetch history for selected machine
        try {
          const histRes = await sensorApi.getMachineSensorHistory(selectedMachineId, 25);
          setMachineHistory(histRes.readings);
        } catch (histErr) {
          console.warn("History fetch error:", histErr);
        }
      }
    } catch (err: any) {
      console.error("Error polling sensors:", err);
      setError("Unable to retrieve live simulated machine telemetry.");
    } finally {
      setIsLoading(false);
    }
  };

  // Set up polling interval (5 seconds) with proper React cleanup
  useEffect(() => {
    fetchTelemetry();

    pollTimerRef.current = window.setInterval(() => {
      fetchTelemetry();
    }, 5000);

    return () => {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
    };
  }, [selectedMachineId]);

  // Manual step trigger
  const handleManualStep = async () => {
    setIsStepping(true);
    try {
      await sensorApi.triggerSimulationStep();
      await fetchTelemetry();
    } catch (err) {
      console.error("Step error:", err);
    } finally {
      setIsStepping(false);
    }
  };

  const currentReading = latestReadings[selectedMachineId];
  const currentPrediction = livePredictions[selectedMachineId];
  const currentMachine = machines.find((m) => m.machine_id === selectedMachineId);

  // Critical machines for alert banner
  const criticalMachinesList = Object.entries(livePredictions)
    .filter(([_, p]) => p.health_status === "CRITICAL")
    .map(([id, p]) => ({
      machine_id: id,
      failure_probability: p.failure_probability,
      predicted_rul: p.predicted_rul,
      process: latestReadings[id]?.process,
      production_line: latestReadings[id]?.production_line,
    }));

  const filteredMachines =
    selectedLine === "ALL"
      ? machines
      : machines.filter((m) => m.production_line === selectedLine);

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-[#E5E7EB] pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#FFF3C4] border border-[#F4B400]/40 text-[#D99A00]">
              <Activity size={20} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[#1F2933]">
                Live Sensor Telemetry & Machine Monitoring
              </h1>
              <p className="text-xs text-[#667085] mt-0.5">
                Dataset-driven IoT sensor simulation connected to ML inference pipeline
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <LastUpdated timestamp={lastUpdatedTime} pollingIntervalSeconds={5} isPolling={true} />

          <button
            onClick={handleManualStep}
            disabled={isStepping}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FFFFFF] hover:bg-[#FFF3C4] border border-[#E5E7EB] hover:border-[#F4B400] text-xs font-semibold text-[#1F2933] transition-all cursor-pointer disabled:opacity-50 shadow-xs"
            title="Advance the simulation by one sequential cycle"
          >
            <RefreshCw size={13} className={isStepping ? "animate-spin text-[#D99A00]" : "text-[#D99A00]"} />
            <span>{isStepping ? "Advancing..." : "Step Cycle"}</span>
          </button>

          <button
            onClick={() => navigate("/digital-twin")}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#F4B400] hover:bg-[#D99A00] text-xs font-bold text-[#1F2933] shadow-xs transition-all cursor-pointer"
          >
            <Eye size={14} />
            <span>3D Digital Twin</span>
          </button>
        </div>
      </div>

      {/* Critical Alert Banner */}
      <LiveAlert criticalMachines={criticalMachinesList} />

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={fetchTelemetry}
            className="px-3 py-1 bg-rose-600 hover:bg-rose-700 rounded-lg text-xs font-semibold text-white"
          >
            Retry
          </button>
        </div>
      )}

      {/* Machine Selector Bar & Filter */}
      <div className="p-4 rounded-2xl border border-[#E5E7EB] bg-[#FFFFFF] shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#667085]">
            Select Factory Asset
          </span>
          <div className="flex items-center gap-1.5">
            {["ALL", "Line-A", "Line-B", "Line-C"].map((line) => (
              <button
                key={line}
                onClick={() => setSelectedLine(line)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  selectedLine === line
                    ? "bg-[#FFF3C4] text-[#1F2933] border border-[#F4B400]/40"
                    : "text-[#667085] hover:text-[#1F2933] border border-transparent"
                }`}
              >
                {line}
              </button>
            ))}
          </div>
        </div>

        {/* Machine Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {filteredMachines.map((m) => {
            const isSelected = m.machine_id === selectedMachineId;
            const pred = livePredictions[m.machine_id];
            const status = pred?.health_status || m.latest_prediction?.health_status || "UNKNOWN";

            const statusDot =
              status === "CRITICAL"
                ? "bg-rose-500"
                : status === "AT_RISK"
                ? "bg-[#F4B400]"
                : status === "HEALTHY"
                ? "bg-emerald-500"
                : "bg-slate-400";

            return (
              <button
                key={m.machine_id}
                onClick={() => setSelectedMachineId(m.machine_id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#FFF3C4] border-2 border-[#F4B400] text-[#1F2933] shadow-xs"
                    : "bg-[#FFFFFF] border border-[#E5E7EB] text-[#667085] hover:border-[#F4B400] hover:text-[#1F2933]"
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${statusDot}`} />
                <span className="font-mono font-bold">{m.machine_id}</span>
                <span className="text-[10px] text-[#667085] font-normal">
                  {m.process.slice(0, 4)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Machine Telemetry Overview Card */}
      {currentReading ? (
        <div className="space-y-6">
          <div className="rounded-2xl border border-[#E5E7EB] bg-[#FFFFFF] p-6 shadow-xs">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-3xl font-extrabold text-[#1F2933] font-mono tracking-tight">
                    {selectedMachineId}
                  </h2>
                  <LiveHealthIndicator
                    status={
                      currentPrediction?.health_status ||
                      currentMachine?.latest_prediction?.health_status ||
                      "HEALTHY"
                    }
                    size="lg"
                  />
                  <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#FFF3C4] text-[#1F2933] border border-[#F4B400]/40">
                    Cycle #{currentReading.cycle}
                  </span>
                </div>
                <p className="text-sm text-[#667085] mt-1.5 flex items-center gap-3">
                  <span>Process: <strong className="text-[#1F2933]">{currentReading.process || currentMachine?.process}</strong></span>
                  <span>•</span>
                  <span>Line: <strong className="text-[#1F2933]">{currentReading.production_line || currentMachine?.production_line}</strong></span>
                  <span>•</span>
                  <span>Criticality: <strong className="text-amber-700">{currentMachine?.criticality || "HIGH"}</strong></span>
                </p>
              </div>

              {/* Live ML Prediction stats */}
              <div className="flex flex-wrap items-center gap-4 bg-[#FFFDF5] border border-[#E5E7EB] p-3.5 rounded-2xl">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#667085] block">
                    Failure Probability
                  </span>
                  <span
                    className={`text-xl font-bold font-mono ${
                      (currentPrediction?.failure_probability || 0) >= 0.7
                        ? "text-rose-600"
                        : (currentPrediction?.failure_probability || 0) >= 0.3
                        ? "text-amber-700"
                        : "text-emerald-700"
                    }`}
                  >
                    {currentPrediction
                      ? `${(currentPrediction.failure_probability * 100).toFixed(1)}%`
                      : "Computing..."}
                  </span>
                </div>
                <div className="w-px h-8 bg-[#E5E7EB]" />
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#667085] block">
                    Predicted RUL
                  </span>
                  <span className="text-xl font-bold font-mono text-[#D99A00]">
                    {currentPrediction ? `${currentPrediction.predicted_rul.toFixed(0)} cycles` : "..."}
                  </span>
                </div>
                <div className="w-px h-8 bg-[#E5E7EB]" />
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#667085] block">
                    Predictive Model
                  </span>
                  <span className="text-xs font-mono text-[#1F2933]">
                    {currentPrediction?.model_version || "Active ML Engine"}
                  </span>
                </div>
              </div>
            </div>

            {/* Direct Navigation Links */}
            <div className="mt-5 pt-4 border-t border-[#E5E7EB] flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-[#667085]">
                Connected Pipelines: Predictive Intelligence, Cascade Impact, Decision Engine
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate(`/intelligence/${selectedMachineId}`)}
                  className="px-3 py-1.5 rounded-xl bg-[#FFFFFF] hover:bg-[#FFF3C4] text-xs font-semibold text-[#1F2933] border border-[#E5E7EB] hover:border-[#F4B400] transition-all cursor-pointer shadow-xs"
                >
                  Intelligence
                </button>
                <button
                  onClick={() => navigate(`/impact/${selectedMachineId}`)}
                  className="px-3 py-1.5 rounded-xl bg-[#FFFFFF] hover:bg-[#FFF3C4] text-xs font-semibold text-[#1F2933] border border-[#E5E7EB] hover:border-[#F4B400] transition-all cursor-pointer shadow-xs"
                >
                  Impact
                </button>
                <button
                  onClick={() => navigate(`/maintenance/${selectedMachineId}`)}
                  className="px-3 py-1.5 rounded-xl bg-[#F4B400] hover:bg-[#D99A00] text-xs font-bold text-[#1F2933] transition-all cursor-pointer shadow-xs"
                >
                  Maintenance
                </button>
              </div>
            </div>
          </div>

          {/* 6 Sensor Telemetry Cards */}
          <div>
            <h3 className="text-sm font-bold text-[#1F2933] uppercase tracking-wider mb-3">
              Live Sensor Telemetry
            </h3>
            <SensorCards reading={currentReading} />
          </div>

          {/* Real-time Trend Graph */}
          <SensorTrend history={machineHistory} machineId={selectedMachineId} />
        </div>
      ) : isLoading ? (
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-12 text-center shadow-xs">
          <Activity size={36} className="mx-auto text-[#D99A00] animate-pulse mb-3" />
          <p className="text-base font-semibold text-[#1F2933]">Loading simulated sensor telemetry...</p>
          <p className="text-xs text-[#667085] mt-1">Connecting to factory IoT simulation stream...</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-12 text-center shadow-xs">
          <AlertOctagon size={36} className="mx-auto text-[#667085] mb-3" />
          <p className="text-base font-semibold text-[#1F2933]">No factory machine data available.</p>
        </div>
      )}
    </div>
  );
};
