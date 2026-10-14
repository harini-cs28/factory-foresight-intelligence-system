import React, { useState, useEffect } from "react";
import { adminApi } from "../../api/adminApi";
import { ModelsAndServicesResponse } from "../../types/admin";
import { LoadingState } from "../common/LoadingState";
import { ErrorState } from "../common/ErrorState";
import {
  Server,
  Cpu,
  CheckCircle2,
  RefreshCw,
  BarChart3,
  Layers,
  Database,
  Activity,
  Zap,
} from "lucide-react";

export const ModelServiceStatus: React.FC = () => {
  const [data, setData] = useState<ModelsAndServicesResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await adminApi.getModelAndServiceStatus();
      setData(res);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to load model and service telemetry.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  if (isLoading) {
    return <LoadingState message="Inspecting ML Model artifacts and Backend Service status..." />;
  }

  if (error || !data) {
    return (
      <ErrorState
        title="Model & Service Status Unavailable"
        message={error || "Could not retrieve status."}
        onRetry={fetchStatus}
      />
    );
  }

  const { models, services } = data;
  const classifier = models.failure_classifier;
  const regressor = models.rul_regressor;
  const importances = models.feature_importances || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E7EB]">
        <div>
          <div className="flex items-center gap-2">
            <Server className="w-6 h-6 text-[#D99A00]" />
            <h1 className="text-xl font-bold text-[#1F2933] font-mono tracking-tight">
              MODEL &amp; SERVICE STATUS
            </h1>
          </div>
          <p className="text-xs text-[#667085] mt-1">
            Machine Learning model performance benchmarks, serialized weights, and backend runtime health.
          </p>
        </div>

        <button
          onClick={fetchStatus}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#FFFFFF] hover:bg-[#FFF3C4] border border-[#E5E7EB] hover:border-[#F4B400] text-[#1F2933] text-xs font-semibold transition-all shadow-xs cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#D99A00]" />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      {/* Services Health Cards */}
      <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-xs space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#1F2933] font-mono border-b border-[#E5E7EB] pb-2">
          Runtime System Services
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {services.map((svc, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-[#FFFDF5] border border-[#E5E7EB] flex flex-col justify-between space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="text-xs font-bold text-[#1F2933]">{svc.name}</div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border font-mono ${
                    svc.status === "OPERATIONAL" || svc.status === "ACTIVE"
                      ? "bg-emerald-50 text-[#22C55E] border-emerald-200"
                      : "bg-amber-50 text-[#F59E0B] border-amber-200"
                  }`}
                >
                  {svc.status}
                </span>
              </div>
              <div className="text-[11px] font-mono text-[#667085]">
                {svc.version && `Version: ${svc.version} `}
                {svc.port && `| Port: ${svc.port}`}
                {svc.host && svc.host}
                {svc.monitored_nodes && `${svc.monitored_nodes} IoT Nodes`}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ML Failure Classifier Benchmarks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-[#D99A00]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#1F2933] font-mono">
                Failure Classifier ({models.version})
              </h3>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-[#22C55E] border border-emerald-200 font-mono">
              Serialized .joblib
            </span>
          </div>

          <p className="text-xs text-[#667085]">
            Algorithm: <span className="font-mono text-[#1F2933]">{classifier.algorithm}</span>
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-[#FFFDF5] border border-[#E5E7EB] text-center">
              <div className="text-[10px] uppercase tracking-wider text-[#667085] font-mono">Accuracy</div>
              <div className="text-lg font-bold text-[#1F2933] font-mono">{classifier.accuracy}%</div>
            </div>
            <div className="p-3 rounded-xl bg-[#FFFDF5] border border-[#E5E7EB] text-center">
              <div className="text-[10px] uppercase tracking-wider text-[#667085] font-mono">Precision</div>
              <div className="text-lg font-bold text-[#1F2933] font-mono">{classifier.precision}%</div>
            </div>
            <div className="p-3 rounded-xl bg-[#FFFDF5] border border-[#E5E7EB] text-center">
              <div className="text-[10px] uppercase tracking-wider text-[#667085] font-mono">Recall</div>
              <div className="text-lg font-bold text-[#1F2933] font-mono">{classifier.recall}%</div>
            </div>
            <div className="p-3 rounded-xl bg-[#FFFDF5] border border-[#E5E7EB] text-center">
              <div className="text-[10px] uppercase tracking-wider text-[#667085] font-mono">F1-Score</div>
              <div className="text-lg font-bold text-[#1F2933] font-mono">{classifier.f1_score}%</div>
            </div>
            <div className="p-3 rounded-xl bg-[#FFFDF5] border border-[#E5E7EB] text-center col-span-2 sm:col-span-2">
              <div className="text-[10px] uppercase tracking-wider text-[#667085] font-mono">ROC-AUC Score</div>
              <div className="text-lg font-bold text-[#1F2933] font-mono">{classifier.roc_auc}%</div>
            </div>
          </div>
        </div>

        {/* RUL Regressor Benchmarks */}
        <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#D99A00]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#1F2933] font-mono">
                Remaining Useful Life Regressor ({models.version})
              </h3>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-[#22C55E] border border-emerald-200 font-mono">
              Serialized .joblib
            </span>
          </div>

          <p className="text-xs text-[#667085]">
            Algorithm: <span className="font-mono text-[#1F2933]">{regressor.algorithm}</span>
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-[#FFFDF5] border border-[#E5E7EB] text-center">
              <div className="text-[10px] uppercase tracking-wider text-[#667085] font-mono">MAE Cycles</div>
              <div className="text-lg font-bold text-[#1F2933] font-mono">{regressor.mae_cycles}</div>
            </div>
            <div className="p-3 rounded-xl bg-[#FFFDF5] border border-[#E5E7EB] text-center">
              <div className="text-[10px] uppercase tracking-wider text-[#667085] font-mono">RMSE Cycles</div>
              <div className="text-lg font-bold text-[#1F2933] font-mono">{regressor.rmse_cycles}</div>
            </div>
            <div className="p-3 rounded-xl bg-[#FFFDF5] border border-[#E5E7EB] text-center">
              <div className="text-[10px] uppercase tracking-wider text-[#667085] font-mono">R² Goodness</div>
              <div className="text-lg font-bold text-[#1F2933] font-mono">{regressor.r2_score}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Importances Breakdown */}
      <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-xs space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#1F2933] font-mono border-b border-[#E5E7EB] pb-2">
          Model Feature Weights &amp; Importance Hierarchy
        </h3>

        <div className="space-y-3">
          {Object.entries(importances)
            .sort((a, b) => b[1] - a[1])
            .map(([feat, weight]) => {
              const pct = Math.round(weight * 100);
              return (
                <div key={feat} className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-[#1F2933] font-semibold">{feat}</span>
                    <span className="text-[#667085]">{(weight * 100).toFixed(2)}%</span>
                  </div>
                  <div className="w-full bg-[#F8F9FA] rounded-full h-2 overflow-hidden border border-[#E5E7EB]">
                    <div
                      className="bg-[#F4B400] h-2 rounded-full transition-all"
                      style={{ width: `${Math.max(pct, 2)}%` }}
                    />
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};
