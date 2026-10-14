import React, { useState, useEffect } from "react";
import { adminApi } from "../../api/adminApi";
import { SystemConfigurationResponse } from "../../types/admin";
import { LoadingState } from "../common/LoadingState";
import { ErrorState } from "../common/ErrorState";
import {
  Settings,
  RefreshCw,
  CheckCircle2,
  Lock,
  Sliders,
  Database,
  Globe,
  Clock,
  ShieldAlert,
} from "lucide-react";

export const SystemConfiguration: React.FC = () => {
  const [config, setConfig] = useState<SystemConfigurationResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConfig = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await adminApi.getSystemConfig();
      setConfig(res);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Unable to fetch system configuration.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  if (isLoading) {
    return <LoadingState message="Fetching system runtime configurations and operational thresholds..." />;
  }

  if (error || !config) {
    return (
      <ErrorState
        title="Configuration Unavailable"
        message={error || "Could not retrieve system configuration."}
        onRetry={fetchConfig}
      />
    );
  }

  const { thresholds, dataset_files } = config;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E7EB]">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="w-6 h-6 text-[#D99A00]" />
            <h1 className="text-xl font-bold text-[#1F2933] font-mono tracking-tight">
              SYSTEM CONFIGURATION &amp; THRESHOLDS
            </h1>
          </div>
          <p className="text-xs text-[#667085] mt-1">
            Operational decision thresholds, RUL critical limits, and data ingestion parameters.
          </p>
        </div>

        <button
          onClick={fetchConfig}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#FFFFFF] hover:bg-[#FFF3C4] border border-[#E5E7EB] hover:border-[#F4B400] text-[#1F2933] text-xs font-semibold transition-all shadow-xs cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#D99A00]" />
          <span>Refresh Config</span>
        </button>
      </div>

      {/* Security Disclaimer Banner */}
      <div className="p-4 rounded-xl bg-[#FFFDF5] border border-[#F4B400]/40 flex items-start gap-3">
        <Lock className="w-5 h-5 text-[#D99A00] shrink-0 mt-0.5" />
        <div className="space-y-0.5 text-xs">
          <div className="font-bold text-[#1F2933]">Access Governance Guard</div>
          <div className="text-[#667085]">
            Administrative parameters are read from environment and settings. Sensitive secrets (JWT secrets, password hashes, and database passwords) are strictly masked and protected.
          </div>
        </div>
      </div>

      {/* Risk Thresholds Settings */}
      <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-[#E5E7EB] pb-3">
          <Sliders className="w-5 h-5 text-[#D99A00]" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#1F2933] font-mono">
            Health &amp; Risk Classification Thresholds
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-[#FFFDF5] border border-[#E5E7EB] space-y-2">
            <div className="text-[10px] font-mono uppercase text-[#667085]">Critical Risk Cutoff</div>
            <div className="text-xl font-bold text-[#EF4444] font-mono">
              &ge; {Math.round(thresholds.critical_risk_threshold * 100)}%
            </div>
            <p className="text-[11px] text-[#667085]">Machines above 70% risk marked CRITICAL</p>
          </div>

          <div className="p-4 rounded-xl bg-[#FFFDF5] border border-[#E5E7EB] space-y-2">
            <div className="text-[10px] font-mono uppercase text-[#667085]">Critical RUL Limit</div>
            <div className="text-xl font-bold text-[#EF4444] font-mono">
              &le; {thresholds.critical_rul_threshold} Cycles
            </div>
            <p className="text-[11px] text-[#667085]">Remaining Useful Life triggering urgent overhaul</p>
          </div>

          <div className="p-4 rounded-xl bg-[#FFFDF5] border border-[#E5E7EB] space-y-2">
            <div className="text-[10px] font-mono uppercase text-[#667085]">At-Risk Range</div>
            <div className="text-xl font-bold text-[#F59E0B] font-mono">
              {Math.round(thresholds.at_risk_risk_min * 100)}% &ndash; {Math.round(thresholds.critical_risk_threshold * 100)}%
            </div>
            <p className="text-[11px] text-[#667085]">30% &le; Failure Risk &lt; 70%</p>
          </div>

          <div className="p-4 rounded-xl bg-[#FFFDF5] border border-[#E5E7EB] space-y-2">
            <div className="text-[10px] font-mono uppercase text-[#667085]">Healthy Operation Cap</div>
            <div className="text-xl font-bold text-[#22C55E] font-mono">
              &lt; {Math.round(thresholds.healthy_risk_max * 100)}%
            </div>
            <p className="text-[11px] text-[#667085]">Normal operating envelope</p>
          </div>

          <div className="p-4 rounded-xl bg-[#FFFDF5] border border-[#E5E7EB] space-y-2">
            <div className="text-[10px] font-mono uppercase text-[#667085]">Healthy RUL Floor</div>
            <div className="text-xl font-bold text-[#22C55E] font-mono">
              &gt; {thresholds.healthy_rul_min} Cycles
            </div>
            <p className="text-[11px] text-[#667085]">Sufficient useful operational life</p>
          </div>

          <div className="p-4 rounded-xl bg-[#FFFDF5] border border-[#E5E7EB] space-y-2">
            <div className="text-[10px] font-mono uppercase text-[#667085]">JWT Session Lifetime</div>
            <div className="text-xl font-bold text-[#1F2933] font-mono">
              {config.access_token_expire_minutes} Minutes
            </div>
            <p className="text-[11px] text-[#667085]">Automatic bearer token expiration</p>
          </div>
        </div>
      </div>

      {/* Dataset & Storage Bindings */}
      <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-[#E5E7EB] pb-3">
          <Database className="w-5 h-5 text-[#D99A00]" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#1F2933] font-mono">
            Dataset Source Files &amp; Operational Mappings
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-[#FFFDF5] border border-[#E5E7EB] space-y-1">
            <div className="text-xs font-bold text-[#1F2933]">Sensor Telemetry CSV</div>
            <div className="text-xs font-mono text-[#D99A00]">{dataset_files.sensor_data_csv}</div>
            <div className="text-[10px] text-[#667085]">3,120 cycles across 12 assets</div>
          </div>

          <div className="p-4 rounded-xl bg-[#FFFDF5] border border-[#E5E7EB] space-y-1">
            <div className="text-xs font-bold text-[#1F2933]">Machine Topology CSV</div>
            <div className="text-xs font-mono text-[#D99A00]">{dataset_files.dependencies_csv}</div>
            <div className="text-[10px] text-[#667085]">Upstream &amp; downstream dependencies</div>
          </div>

          <div className="p-4 rounded-xl bg-[#FFFDF5] border border-[#E5E7EB] space-y-1">
            <div className="text-xs font-bold text-[#1F2933]">Factory Context CSV</div>
            <div className="text-xs font-mono text-[#D99A00]">{dataset_files.factory_context_csv}</div>
            <div className="text-[10px] text-[#667085]">Criticality, technicians, spare parts</div>
          </div>
        </div>
      </div>
    </div>
  );
};
