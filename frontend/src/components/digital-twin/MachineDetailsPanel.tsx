import React from "react";
import { Link } from "react-router-dom";
import { MachineItem } from "../../types/machine";
import { ImpactResponse } from "../../types/impact";
import { StatusBadge } from "../common/StatusBadge";
import {
  X,
  Cpu,
  Share2,
  Wrench,
  Activity,
  Clock,
  AlertTriangle,
  ArrowRight,
  Layers,
  ShieldAlert,
} from "lucide-react";

interface MachineDetailsPanelProps {
  machine: MachineItem;
  impact: ImpactResponse | null;
  isLoadingImpact: boolean;
  onClose: () => void;
}

export const MachineDetailsPanel: React.FC<MachineDetailsPanelProps> = ({
  machine,
  impact,
  isLoadingImpact,
  onClose,
}) => {
  const prediction = machine.latest_prediction;
  const status = prediction?.health_status || "UNKNOWN";

  return (
    <div className="w-full lg:w-96 p-5 rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-lg flex flex-col justify-between space-y-4 text-xs animate-in slide-in-from-right duration-200">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold font-mono text-[#1F2933] tracking-wider">
              {machine.machine_id}
            </span>
            <StatusBadge status={status} size="sm" />
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-[#F8F9FA] hover:bg-[#FFF3C4] text-[#667085] hover:text-[#1F2933] transition-colors"
            title="Deselect Machine"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Machine Identity & Context */}
        <div className="p-3.5 rounded-xl bg-[#FFFDF5] border border-[#E5E7EB] space-y-2 mb-4">
          <div className="flex justify-between">
            <span className="text-[#667085]">Process Type:</span>
            <span className="font-bold text-[#1F2933]">{machine.process}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#667085]">Production Line:</span>
            <span className="font-bold text-[#1F2933]">{machine.production_line}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[#667085]">Asset Criticality:</span>
            <span
              className={`px-2 py-0.5 rounded-md font-bold uppercase text-[11px] ${
                machine.criticality === "HIGH"
                  ? "bg-rose-50 text-rose-800 border border-rose-200"
                  : machine.criticality === "MEDIUM"
                  ? "bg-[#FFF3C4] text-[#1F2933] border border-[#F4B400]/40"
                  : "bg-[#F8F9FA] text-[#1F2933] border border-[#E5E7EB]"
              }`}
            >
              {machine.criticality}
            </span>
          </div>
        </div>

        {/* ML Telemetry Predictions */}
        <div className="space-y-3 mb-4">
          <span className="text-[11px] uppercase tracking-wider text-[#667085] font-bold block">
            AI Prognostics &amp; Health State
          </span>

          {prediction ? (
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-xl bg-[#FFFFFF] border border-[#E5E7EB]">
                <div className="flex items-center gap-1.5 text-[#667085] text-[10px] mb-1">
                  <Activity className="w-3.5 h-3.5 text-rose-600" />
                  <span>FAILURE PROB</span>
                </div>
                <p className="text-base font-bold font-mono text-[#1F2933]">
                  {(prediction.failure_probability * 100).toFixed(1)}%
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#FFFFFF] border border-[#E5E7EB]">
                <div className="flex items-center gap-1.5 text-[#667085] text-[10px] mb-1">
                  <Clock className="w-3.5 h-3.5 text-[#D99A00]" />
                  <span>PREDICTED RUL</span>
                </div>
                <p className="text-base font-bold font-mono text-[#1F2933]">
                  {prediction.predicted_rul.toFixed(1)}{" "}
                  <span className="text-[10px] text-[#667085] font-normal">cycles</span>
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-[#FFFDF5] border border-[#E5E7EB] text-[#667085] text-center">
              Prediction unavailable for this machine record.
            </div>
          )}
        </div>

        {/* Cascade Impact Brief */}
        <div className="space-y-2 mb-4">
          <span className="text-[11px] uppercase tracking-wider text-[#667085] font-bold block">
            Dependency Cascade Impact
          </span>

          {isLoadingImpact ? (
            <div className="p-3 rounded-xl bg-[#FFFDF5] border border-[#E5E7EB] text-[#667085] text-center">
              Traversing dependency graph...
            </div>
          ) : impact ? (
            <div className="p-3.5 rounded-xl bg-[#FFFDF5] border border-[#E5E7EB] space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[#667085]">Blocked Downstream Units:</span>
                <span className="font-bold text-[#1F2933] text-sm">
                  {impact.cascade.affected_machine_count} Machines
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#667085]">Max Cascade Depth:</span>
                <span className="font-bold text-[#D99A00]">
                  Level {impact.cascade.maximum_cascade_level}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#667085]">Impact Severity:</span>
                <StatusBadge status={impact.production_impact.impact_severity} size="sm" />
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-[#FFFDF5] border border-[#E5E7EB] text-[#667085] text-center">
              No dependency graph data available.
            </div>
          )}
        </div>
      </div>

      {/* Navigation Action Buttons */}
      <div className="space-y-2 pt-3 border-t border-[#E5E7EB]">
        <Link
          to={`/live-monitoring/${machine.machine_id}`}
          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#FFFDF5] hover:bg-[#FFF3C4] border border-[#E5E7EB] hover:border-[#F4B400] text-[#1F2933] font-bold tracking-wide transition-all shadow-xs group"
        >
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#D99A00]" />
            <span>View Live Telemetry</span>
          </div>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link
          to={`/intelligence/${machine.machine_id}`}
          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#FFFDF5] hover:bg-[#FFF3C4] border border-[#E5E7EB] hover:border-[#F4B400] text-[#1F2933] font-bold tracking-wide transition-all shadow-xs group"
        >
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-[#D99A00]" />
            <span>View Intelligence</span>
          </div>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link
          to={`/impact/${machine.machine_id}`}
          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#FFFDF5] hover:bg-[#FFF3C4] border border-[#E5E7EB] hover:border-[#F4B400] text-[#1F2933] font-bold tracking-wide transition-all shadow-xs group"
        >
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-[#D99A00]" />
            <span>View Impact</span>
          </div>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link
          to={`/maintenance/${machine.machine_id}`}
          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#F4B400] hover:bg-[#D99A00] text-[#1F2933] font-bold tracking-wide transition-all shadow-xs group"
        >
          <div className="flex items-center gap-2">
            <Wrench className="w-4 h-4" />
            <span>View Maintenance</span>
          </div>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
};
