import React, { useState, useEffect } from "react";
import { alertApi } from "../../api/alertApi";
import { AlertItem, AlertSummaryResponse } from "../../types/alert";
import { AlertList } from "./AlertList";
import { useAuth } from "../../context/AuthContext";
import {
  Bell,
  AlertOctagon,
  AlertTriangle,
  Info,
  CheckCircle2,
  RefreshCw,
  SlidersHorizontal,
  Activity,
  ShieldAlert,
} from "lucide-react";

type FilterTab = "ALL_ACTIVE" | "CRITICAL" | "HIGH" | "MEDIUM" | "ACKNOWLEDGED" | "ALL";

export const AlertCenter: React.FC = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState<AlertSummaryResponse | null>(null);
  const [activeTab, setActiveTab] = useState<FilterTab>("ALL_ACTIVE");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAlerts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await alertApi.getAlerts({ limit: 150 });
      setSummary(data);
    } catch (err: any) {
      console.error("Error fetching alerts:", err);
      setError("Unable to retrieve operational alerts.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEvaluate = async () => {
    setIsEvaluating(true);
    try {
      const data = await alertApi.evaluateAlerts();
      setSummary(data);
    } catch (err) {
      console.error("Error evaluating alerts:", err);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleAcknowledge = async (alertId: number) => {
    try {
      await alertApi.acknowledgeAlert(alertId);
      await fetchAlerts();
    } catch (err) {
      console.error("Error acknowledging alert:", err);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const allAlerts = summary?.alerts || [];

  const filteredAlerts = allAlerts.filter((a) => {
    if (activeTab === "ALL_ACTIVE") return !a.is_acknowledged;
    if (activeTab === "CRITICAL") return a.severity === "CRITICAL" && !a.is_acknowledged;
    if (activeTab === "HIGH") return a.severity === "HIGH" && !a.is_acknowledged;
    if (activeTab === "MEDIUM") return a.severity === "MEDIUM" && !a.is_acknowledged;
    if (activeTab === "ACKNOWLEDGED") return a.is_acknowledged;
    return true;
  });

  const canAcknowledge =
    user?.role === "ADMIN" ||
    user?.role === "MAINTENANCE_ENGINEER" ||
    user?.role === "PRODUCTION_MANAGER" ||
    user?.role === "PLANT_MANAGER";

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-[#E5E7EB] pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-600">
              <ShieldAlert size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[#1F2933]">
                Intelligent Operations Alert Center
              </h1>
              <p className="text-xs text-[#667085] mt-0.5">
                Multi-dimensional anomaly detection combining failure probability, RUL, criticality, and cascade impact
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleEvaluate}
            disabled={isEvaluating}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#FFFFFF] hover:bg-[#FFF3C4] border border-[#E5E7EB] hover:border-[#F4B400] text-xs font-semibold text-[#1F2933] transition-all cursor-pointer disabled:opacity-50 shadow-xs"
          >
            <Activity size={14} className={isEvaluating ? "animate-spin text-[#D99A00]" : "text-[#D99A00]"} />
            <span>{isEvaluating ? "Evaluating Stream..." : "Evaluate Sensor Risks"}</span>
          </button>

          <button
            onClick={fetchAlerts}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#F4B400] hover:bg-[#D99A00] text-xs font-bold text-[#1F2933] shadow-xs transition-all cursor-pointer"
          >
            <RefreshCw size={14} />
            <span>Refresh Feed</span>
          </button>
        </div>
      </div>

      {/* Metric Counters Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-rose-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-800">
              Critical Alerts
            </span>
            <AlertOctagon size={18} className="text-rose-600" />
          </div>
          <span className="text-3xl font-extrabold font-mono text-rose-600">
            {summary?.critical_count ?? 0}
          </span>
          <p className="text-[11px] text-[#667085] mt-1">Requiring immediate intervention</p>
        </div>

        <div className="rounded-2xl border border-[#F4B400]/40 bg-[#FFFDF5] p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
              High Priority
            </span>
            <AlertTriangle size={18} className="text-[#D99A00]" />
          </div>
          <span className="text-3xl font-extrabold font-mono text-amber-700">
            {summary?.high_count ?? 0}
          </span>
          <p className="text-[11px] text-[#667085] mt-1">Elevated risk & low RUL alerts</p>
        </div>

        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#667085]">
              Medium / Warning
            </span>
            <Info size={18} className="text-[#D99A00]" />
          </div>
          <span className="text-3xl font-extrabold font-mono text-[#1F2933]">
            {summary?.medium_count ?? 0}
          </span>
          <p className="text-[11px] text-[#667085] mt-1">Moderate degradation warnings</p>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              Acknowledged
            </span>
            <CheckCircle2 size={18} className="text-emerald-600" />
          </div>
          <span className="text-3xl font-extrabold font-mono text-emerald-700">
            {(summary?.total_alerts ?? 0) - (summary?.unacknowledged_count ?? 0)}
          </span>
          <p className="text-[11px] text-[#667085] mt-1">Reviewed by operations staff</p>
        </div>
      </div>

      {/* Filter Tabs Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5E7EB] pb-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setActiveTab("ALL_ACTIVE")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "ALL_ACTIVE"
                ? "bg-[#FFF3C4] text-[#1F2933] border border-[#F4B400]/40 shadow-xs"
                : "text-[#667085] hover:text-[#1F2933] hover:bg-[#FFFFFF]"
            }`}
          >
            All Active ({summary?.unacknowledged_count ?? 0})
          </button>

          <button
            onClick={() => setActiveTab("CRITICAL")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "CRITICAL"
                ? "bg-rose-50 text-rose-800 border border-rose-200 shadow-xs"
                : "text-[#667085] hover:text-[#1F2933] hover:bg-[#FFFFFF]"
            }`}
          >
            Critical ({summary?.critical_count ?? 0})
          </button>

          <button
            onClick={() => setActiveTab("HIGH")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "HIGH"
                ? "bg-[#FFF3C4] text-[#1F2933] border border-[#F4B400]/40 shadow-xs"
                : "text-[#667085] hover:text-[#1F2933] hover:bg-[#FFFFFF]"
            }`}
          >
            High ({summary?.high_count ?? 0})
          </button>

          <button
            onClick={() => setActiveTab("MEDIUM")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "MEDIUM"
                ? "bg-[#FFFDF5] text-[#1F2933] border border-[#E5E7EB] shadow-xs"
                : "text-[#667085] hover:text-[#1F2933] hover:bg-[#FFFFFF]"
            }`}
          >
            Medium ({summary?.medium_count ?? 0})
          </button>

          <button
            onClick={() => setActiveTab("ACKNOWLEDGED")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "ACKNOWLEDGED"
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-xs"
                : "text-[#667085] hover:text-[#1F2933] hover:bg-[#FFFFFF]"
            }`}
          >
            Acknowledged
          </button>

          <button
            onClick={() => setActiveTab("ALL")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "ALL"
                ? "bg-[#1F2933] text-white shadow-xs"
                : "text-[#667085] hover:text-[#1F2933] hover:bg-[#FFFFFF]"
            }`}
          >
            All History ({summary?.total_alerts ?? 0})
          </button>
        </div>

        <span className="text-xs text-[#667085]">
          Showing {filteredAlerts.length} alert{filteredAlerts.length === 1 ? "" : "s"}
        </span>
      </div>

      {/* Alert Feed List */}
      <AlertList
        alerts={filteredAlerts}
        onAcknowledge={handleAcknowledge}
        canAcknowledge={canAcknowledge}
      />
    </div>
  );
};
