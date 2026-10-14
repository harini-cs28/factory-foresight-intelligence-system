import React, { useState, useEffect } from "react";
import { machineApi } from "../../api/machineApi";
import { impactApi } from "../../api/impactApi";
import { MachineItem } from "../../types/machine";
import { ImpactResponse } from "../../types/impact";
import { LoadingState } from "../common/LoadingState";
import { ErrorState } from "../common/ErrorState";
import {
  TrendingDown,
  RefreshCw,
  DollarSign,
  AlertTriangle,
  ArrowRight,
  Clock,
  Layers,
} from "lucide-react";

export const DowntimeImpact: React.FC = () => {
  const [machines, setMachines] = useState<MachineItem[]>([]);
  const [selectedMachineId, setSelectedMachineId] = useState<string>("WEAV-02");
  const [impact, setImpact] = useState<ImpactResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMachines = async () => {
    try {
      const data = await machineApi.getMachines();
      setMachines(data);
    } catch (e) {
      setError("Failed to fetch equipment list.");
    }
  };

  const fetchImpact = async (mId: string) => {
    try {
      const res = await impactApi.getMachineImpact(mId);
      setImpact(res);
    } catch (e: any) {
      setError("Failed to calculate downtime impact.");
    }
  };

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await fetchMachines();
      await fetchImpact(selectedMachineId);
      setIsLoading(false);
    };
    init();
  }, []);

  const handleSelectMachine = (mId: string) => {
    setSelectedMachineId(mId);
    fetchImpact(mId);
  };

  if (isLoading) {
    return <LoadingState message="Modeling Production Downtime Costs & Cascade Exposure..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E7EB]">
        <div>
          <div className="flex items-center gap-2">
            <TrendingDown className="w-6 h-6 text-[#D99A00]" />
            <h1 className="text-xl font-bold text-[#1F2933] font-mono tracking-tight">
              OPERATIONAL DOWNTIME IMPACT
            </h1>
          </div>
          <p className="text-xs text-[#667085] mt-1">
            Production line interruption costs, hourly financial losses, and equipment failure cascade propagation.
          </p>
        </div>

        <button
          onClick={() => fetchImpact(selectedMachineId)}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#FFFFFF] hover:bg-[#FFF3C4] border border-[#E5E7EB] hover:border-[#F4B400] text-[#1F2933] text-xs font-semibold transition-all shadow-xs cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#D99A00]" />
          <span>Recalculate Loss</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Machine Selector */}
        <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-xs space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#1F2933] font-mono border-b border-[#E5E7EB] pb-2">
            Production Equipment
          </h3>

          <div className="space-y-1.5 max-h-[580px] overflow-y-auto pr-1">
            {machines.map((m) => {
              const isSelected = m.machine_id === selectedMachineId;
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
                  <span className="text-[10px] font-mono text-[#667085]">
                    {m.production_line}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Detailed Impact Results */}
        <div className="lg:col-span-3 space-y-6">
          {impact && (
            <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5E7EB] pb-3">
                <div>
                  <span className="text-xs font-mono font-bold text-[#D99A00]">
                    DOWNTIME COST PROJECTION
                  </span>
                  <h2 className="text-xl font-bold text-[#1F2933] font-mono">
                    {impact.origin_machine.machine_id} Outage Impact
                  </h2>
                </div>
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full border font-mono ${
                    impact.production_impact.impact_severity === "CRITICAL"
                      ? "bg-rose-50 text-[#EF4444] border-rose-200"
                      : "bg-[#FFF3C4] text-[#1F2933] border-[#F4B400]/40"
                  }`}
                >
                  Severity: {impact.production_impact.impact_severity}
                </span>
              </div>

              {/* Loss Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-[#FFFDF5] border border-[#E5E7EB] space-y-1">
                  <div className="text-[10px] font-mono uppercase text-[#667085]">
                    Estimated Downtime Cost
                  </div>
                  <div className="text-2xl font-bold font-mono text-[#EF4444]">
                    &#8377;{(impact.production_impact.estimated_potential_downtime_cost || 0).toLocaleString()}
                  </div>
                  <p className="text-[10px] text-[#667085]">Across full production line</p>
                </div>

                <div className="p-4 rounded-xl bg-[#FFFDF5] border border-[#E5E7EB] space-y-1">
                  <div className="text-[10px] font-mono uppercase text-[#667085]">
                    Affected Downstream Stations
                  </div>
                  <div className="text-2xl font-bold font-mono text-[#1F2933]">
                    {impact.cascade.affected_machine_count}
                  </div>
                  <p className="text-[10px] text-[#667085]">Stations forced to idle</p>
                </div>

                <div className="p-4 rounded-xl bg-[#FFFDF5] border border-[#E5E7EB] space-y-1">
                  <div className="text-[10px] font-mono uppercase text-[#667085]">
                    Max Propagation Level
                  </div>
                  <div className="text-2xl font-bold font-mono text-[#1F2933]">
                    Level {impact.cascade.maximum_cascade_level || 1}
                  </div>
                  <p className="text-[10px] text-[#667085]">Network cascade reach</p>
                </div>
              </div>

              {/* Station Cost Breakdown */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#1F2933] font-mono">
                  Affected Downstream Stations Breakdown
                </h3>

                {!impact.cascade.affected_machines || impact.cascade.affected_machines.length === 0 ? (
                  <div className="p-4 rounded-xl bg-[#FFFDF5] border border-[#E5E7EB] text-center text-xs text-[#667085]">
                    Terminal equipment. Outage does not immediately stop other machines.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {impact.cascade.affected_machines.map((aff, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-[#FFFDF5] border border-[#E5E7EB] flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-bold font-mono text-[#1F2933]">
                            {aff.machine_id} {aff.process ? `– ${aff.process}` : ""}
                          </div>
                          <div className="text-[10px] text-[#667085]">
                            Propagation Depth: Level {aff.cascade_level} &bull; Line: {aff.production_line}
                          </div>
                        </div>

                        <div className="text-right font-mono">
                          <div className="font-bold text-[#1F2933]">
                            {aff.estimated_downtime_cost_per_hour_inr
                              ? `₹${aff.estimated_downtime_cost_per_hour_inr.toLocaleString()}/hr`
                              : "Standard Rate"}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
