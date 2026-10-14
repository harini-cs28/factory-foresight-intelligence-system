import React, { useState } from "react";
import { Link } from "react-router-dom";
import { DashboardOverviewResponse, MachineItem } from "../../types/machine";
import { AlertItem } from "../../types/alert";
import { SummaryCard } from "./SummaryCard";
import { StatusBadge } from "../common/StatusBadge";
import {
  Wrench,
  AlertTriangle,
  AlertOctagon,
  Bell,
  CheckCircle2,
  ArrowRight,
  GitFork,
  Check,
  Calendar,
  Layers,
  Flame,
  Activity,
} from "lucide-react";

interface MaintenanceEngineerDashboardProps {
  overview: DashboardOverviewResponse;
  machines: MachineItem[];
  alerts: AlertItem[];
}

export const MaintenanceEngineerDashboard: React.FC<MaintenanceEngineerDashboardProps> = ({
  overview,
  machines,
  alerts,
}) => {
  // Sort machines by risk level (Critical -> At Risk -> Healthy)
  const sortedMachines = [...machines].sort((a, b) => {
    const aRisk = a.latest_prediction?.failure_probability || 0;
    const bRisk = b.latest_prediction?.failure_probability || 0;
    return bRisk - aRisk;
  });

  const [selectedMachineId, setSelectedMachineId] = useState<string>(
    sortedMachines[0]?.machine_id || "SPIN-01"
  );
  const [acknowledged, setAcknowledged] = useState<boolean>(false);
  const [scheduled, setScheduled] = useState<boolean>(false);

  const selectedMachine =
    machines.find((m) => m.machine_id === selectedMachineId) || sortedMachines[0];

  const openAlertsCount = alerts.filter((a) => !a.is_acknowledged).length;

  // Selected Machine Parameters
  const isCritical =
    selectedMachine?.latest_prediction?.health_status === "CRITICAL";
  const isAtRisk =
    selectedMachine?.latest_prediction?.health_status === "AT_RISK";
  const failProb = selectedMachine?.latest_prediction
    ? Math.round(selectedMachine.latest_prediction.failure_probability * 100)
    : 78;
  const rul = selectedMachine?.latest_prediction
    ? selectedMachine.latest_prediction.predicted_rul.toFixed(1)
    : "14.2";

  const criticalityVal = parseInt(selectedMachine?.criticality || "3", 10);
  const cascadeRisk =
    criticalityVal >= 4 || isCritical ? "HIGH" : isAtRisk ? "MEDIUM" : "LOW";

  const recommendationAction = isCritical
    ? "SCHEDULE URGENT MAINTENANCE"
    : isAtRisk
    ? "SCHEDULE PREVENTIVE INSPECTION"
    : "ROUTINE MONITORING";

  const recommendationReason = isCritical
    ? "High failure probability combined with low remaining useful life (RUL) and downstream machine dependencies."
    : isAtRisk
    ? "Elevated vibration and thermal drift detected. Recommended inspection within next shift maintenance window."
    : "Telemetry nominal. Maintain standard preventive maintenance cadence.";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1F2933] tracking-tight">
            MAINTENANCE INTELLIGENCE
          </h1>
          <p className="text-xs sm:text-sm text-[#667085] mt-1">
            Predictive work order planning, component degradation diagnostics, and prescriptive maintenance actions.
          </p>
        </div>

        <Link
          to="/live-monitoring"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FFFFFF] hover:bg-[#FFFDF5] border border-[#E5E7EB] hover:border-[#F4B400] text-xs font-bold text-[#1F2933] transition-all shadow-xs self-start sm:self-auto"
        >
          <Activity className="w-4 h-4 text-[#F4B400]" />
          <span>Live Telemetry Stream</span>
        </Link>
      </div>

      {/* TOP 4 CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="Machines Requiring Action"
          value={overview.at_risk_count + overview.critical_count}
          subtitle="Elevated or Critical Assets"
          icon={<AlertTriangle className="w-4 h-4 text-amber-600" />}
          variant="at_risk"
        />

        <SummaryCard
          title="Critical Machines"
          value={overview.critical_count}
          subtitle="Immediate Intervention Required"
          icon={<AlertOctagon className="w-4 h-4 text-rose-600" />}
          variant="critical"
        />

        <SummaryCard
          title="Urgent Maintenance"
          value={overview.high_priority_maintenance_count}
          subtitle="High Priority Queue"
          icon={<Wrench className="w-4 h-4 text-[#F4B400]" />}
          variant="yellow"
        />

        <SummaryCard
          title="Open Alerts"
          value={openAlertsCount}
          subtitle="Unacknowledged Warnings"
          icon={<Bell className="w-4 h-4 text-[#1F2933]" />}
          variant="default"
        />
      </div>

      {/* TWO-COLUMN WORKFLOW: MACHINE RISK QUEUE + MACHINE INTELLIGENCE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT (Col 5): MACHINE RISK QUEUE */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#1F2933]">
                Machine Risk Queue
              </h2>
              <p className="text-xs text-[#667085] mt-0.5">
                Select a machine to inspect intelligence &amp; diagnostics.
              </p>
            </div>
            <span className="text-xs font-semibold text-[#667085]">
              {sortedMachines.length} Assets
            </span>
          </div>

          <div className="space-y-2.5 max-h-[620px] overflow-y-auto pr-1">
            {sortedMachines.map((machine) => {
              const isSelected = machine.machine_id === selectedMachine?.machine_id;
              const isCrit =
                machine.latest_prediction?.health_status === "CRITICAL";
              const isRisk =
                machine.latest_prediction?.health_status === "AT_RISK";
              const mFailProb = machine.latest_prediction
                ? Math.round(machine.latest_prediction.failure_probability * 100)
                : 20;
              const mRul = machine.latest_prediction
                ? Math.round(machine.latest_prediction.predicted_rul)
                : 50;
              const mCascade =
                parseInt(machine.criticality, 10) >= 4 || isCrit
                  ? "HIGH"
                  : isRisk
                  ? "MED"
                  : "LOW";

              const mPriority = isCrit
                ? "URGENT"
                : isRisk
                ? "HIGH"
                : "ROUTINE";

              return (
                <div
                  key={machine.machine_id}
                  onClick={() => {
                    setSelectedMachineId(machine.machine_id);
                    setAcknowledged(false);
                    setScheduled(false);
                  }}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                    isSelected
                      ? "bg-[#FFFDF5] border-[#F4B400] ring-1 ring-[#F4B400]/40 shadow-xs"
                      : "bg-[#FFFFFF] border-[#E5E7EB] hover:border-[#F4B400]/60 hover:bg-[#FFFDF5]/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#1F2933] font-mono">
                        {machine.machine_id}
                      </span>
                      <span className="text-[11px] text-[#667085]">
                        • {machine.process} ({machine.production_line})
                      </span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        mPriority === "URGENT"
                          ? "bg-rose-100 text-rose-800"
                          : mPriority === "HIGH"
                          ? "bg-[#FFF3C4] text-[#1F2933]"
                          : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {mPriority}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-mono pt-1 border-t border-[#E5E7EB]/60">
                    <div>
                      <span className="text-[#667085] block text-[10px]">Risk</span>
                      <span
                        className={`font-bold ${
                          isCrit
                            ? "text-rose-600"
                            : isRisk
                            ? "text-amber-600"
                            : "text-emerald-600"
                        }`}
                      >
                        {mFailProb}%
                      </span>
                    </div>
                    <div>
                      <span className="text-[#667085] block text-[10px]">RUL</span>
                      <span className="font-bold text-[#1F2933]">{mRul} hrs</span>
                    </div>
                    <div>
                      <span className="text-[#667085] block text-[10px]">Cascade</span>
                      <span
                        className={`font-bold ${
                          mCascade === "HIGH"
                            ? "text-rose-600"
                            : mCascade === "MED"
                            ? "text-amber-600"
                            : "text-[#667085]"
                        }`}
                      >
                        {mCascade}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT (Col 7): MACHINE INTELLIGENCE DETAIL */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-xs space-y-6">
          {selectedMachine ? (
            <>
              {/* Selected Machine Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E5E7EB]">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl font-bold font-mono text-[#1F2933]">
                      {selectedMachine.machine_id}
                    </span>
                    <StatusBadge
                      status={
                        selectedMachine.latest_prediction?.health_status ||
                        "HEALTHY"
                      }
                      size="sm"
                    />
                  </div>
                  <p className="text-xs text-[#667085]">
                    Process: <strong className="text-[#1F2933]">{selectedMachine.process}</strong> • Line:{" "}
                    <strong className="text-[#1F2933]">{selectedMachine.production_line}</strong> • Criticality:{" "}
                    <strong className="text-amber-800">{selectedMachine.criticality}/5</strong>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    to={`/intelligence/${selectedMachine.machine_id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FFFDF5] hover:bg-[#FFF3C4] border border-[#E5E7EB] text-xs font-bold text-[#1F2933] transition-colors"
                  >
                    <span>Diagnostics</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    to={`/impact/${selectedMachine.machine_id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FFFDF5] hover:bg-[#FFF3C4] border border-[#E5E8E6] text-xs font-bold text-[#1F2933] transition-colors"
                  >
                    <GitFork className="w-3.5 h-3.5 text-[#F4B400]" />
                    <span>Cascade Impact</span>
                  </Link>
                </div>
              </div>

              {/* Core Telemetry & Failure Health Breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-[#FFFDF5] border border-[#E5E7EB] text-left">
                  <span className="text-[10px] uppercase font-semibold text-[#667085] block">
                    Failure Probability
                  </span>
                  <span
                    className={`text-xl font-bold font-mono ${
                      isCritical
                        ? "text-rose-600"
                        : isAtRisk
                        ? "text-amber-600"
                        : "text-emerald-600"
                    }`}
                  >
                    {failProb}%
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#FFFDF5] border border-[#E5E7EB] text-left">
                  <span className="text-[10px] uppercase font-semibold text-[#667085] block">
                    Remaining Life (RUL)
                  </span>
                  <span className="text-xl font-bold font-mono text-[#1F2933]">
                    {rul} hrs
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#FFFDF5] border border-[#E5E7EB] text-left">
                  <span className="text-[10px] uppercase font-semibold text-[#667085] block">
                    Cascade Downtime Risk
                  </span>
                  <span
                    className={`text-xl font-bold font-mono ${
                      cascadeRisk === "HIGH"
                        ? "text-rose-600"
                        : cascadeRisk === "MEDIUM"
                        ? "text-amber-600"
                        : "text-[#1F2933]"
                    }`}
                  >
                    {cascadeRisk}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#FFFDF5] border border-[#E5E7EB] text-left">
                  <span className="text-[10px] uppercase font-semibold text-[#667085] block">
                    Technician Assigned
                  </span>
                  <span className="text-sm font-bold text-[#1F2933] mt-1 block truncate">
                    Shift Mechanical Eng
                  </span>
                </div>
              </div>

              {/* Primary Risk Drivers & Sensor Indicators */}
              <div className="p-4 rounded-xl bg-[#FFFDF5] border border-[#E5E7EB] space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#1F2933]">
                  Key Risk Drivers &amp; Degradation Factors
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-[#FFFFFF] border border-[#E5E7EB] flex items-center justify-between">
                    <span className="text-[#667085]">Spindle Vibration:</span>
                    <span className={`font-mono font-bold ${isCritical ? "text-rose-600" : "text-[#1F2933]"}`}>
                      {isCritical ? "4.82 mm/s (High)" : "2.10 mm/s (Nominal)"}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#FFFFFF] border border-[#E5E7EB] flex items-center justify-between">
                    <span className="text-[#667085]">Bearing Temperature:</span>
                    <span className={`font-mono font-bold ${isCritical ? "text-amber-600" : "text-[#1F2933]"}`}>
                      {isCritical ? "82.4 °C (Elevated)" : "64.0 °C (Nominal)"}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#FFFFFF] border border-[#E5E7EB] flex items-center justify-between">
                    <span className="text-[#667085]">Motor Current Draw:</span>
                    <span className="font-mono font-bold text-[#1F2933]">
                      18.6 A (Stable)
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#FFFFFF] border border-[#E5E7EB] flex items-center justify-between">
                    <span className="text-[#667085]">Downstream Line Impact:</span>
                    <span className="font-mono font-bold text-amber-800">
                      Line {selectedMachine.production_line} (3 units)
                    </span>
                  </div>
                </div>
              </div>

              {/* PROMINENT FFIS RECOMMENDATION */}
              <div className="p-5 rounded-xl bg-[#FFFDF5] border border-[#F4B400] shadow-xs space-y-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#F4B400] text-[#1F2933]">
                    FFIS Recommendation
                  </span>
                  <span className="text-xs font-bold font-mono text-[#1F2933]">
                    {recommendationAction}
                  </span>
                </div>

                <p className="text-xs text-[#1F2933] leading-relaxed">
                  {recommendationReason}
                </p>

                <div className="pt-3 border-t border-[#F4B400]/30 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setAcknowledged(true)}
                    disabled={acknowledged}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      acknowledged
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                        : "bg-[#FFFFFF] hover:bg-[#FFF3C4] border border-[#E5E7EB] text-[#1F2933] cursor-pointer"
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{acknowledged ? "Acknowledged" : "Acknowledge"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setScheduled(true)}
                    disabled={scheduled}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
                      scheduled
                        ? "bg-emerald-600 text-[#FFFFFF]"
                        : "bg-[#F4B400] hover:bg-[#D99A00] text-[#1F2933] cursor-pointer"
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>
                      {scheduled ? "Maintenance Scheduled" : "Schedule Maintenance"}
                    </span>
                  </button>

                  <Link
                    to={`/maintenance/${selectedMachine.machine_id}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#667085] hover:text-[#D99A00] ml-auto transition-colors"
                  >
                    <span>Full Prescriptive Engine</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </>
          ) : (
            <p className="text-xs text-[#667085]">No machine selected.</p>
          )}
        </div>
      </div>
    </div>
  );
};

