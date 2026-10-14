import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { machineApi } from "../../api/machineApi";
import { impactApi } from "../../api/impactApi";
import { MachineItem } from "../../types/machine";
import { ImpactResponse } from "../../types/impact";
import { LoadingState } from "../common/LoadingState";
import { ErrorState } from "../common/ErrorState";
import {
  GitFork,
  RefreshCw,
  AlertTriangle,
  ArrowRight,
  Shield,
  Layers,
  Wrench,
} from "lucide-react";

export const CascadeAnalysis: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialMachineId = searchParams.get("machineId") || "SPIN-01";

  const [machines, setMachines] = useState<MachineItem[]>([]);
  const [selectedMachineId, setSelectedMachineId] = useState<string>(initialMachineId);
  const [impactData, setImpactData] = useState<ImpactResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (mId: string) => {
    try {
      const [mList, impact] = await Promise.all([
        machineApi.getMachines(),
        impactApi.getMachineImpact(mId),
      ]);
      setMachines(mList);
      setImpactData(impact);
    } catch (e: any) {

      setError("Failed to load cascade dependency analysis.");
    }
  };

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await fetchData(selectedMachineId);
      setIsLoading(false);
    };
    init();
  }, []);

  const handleSelectMachine = (mId: string) => {
    setSelectedMachineId(mId);
    fetchData(mId);
  };

  if (isLoading) {
    return <LoadingState message="Analyzing Upstream & Downstream Machine Interdependencies..." />;
  }

  const selectedMachine = machines.find((m) => m.machine_id === selectedMachineId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E7EB]">
        <div>
          <div className="flex items-center gap-2">
            <GitFork className="w-6 h-6 text-[#D99A00]" />
            <h1 className="text-xl font-bold text-[#1F2933] font-mono tracking-tight">
              CASCADE DEPENDENCY &amp; LOCKOUT ANALYSIS
            </h1>
          </div>
          <p className="text-xs text-[#667085] mt-1">
            Investigate physical dependencies and downstream equipment consequences before performing maintenance.
          </p>
        </div>

        <button
          onClick={() => fetchData(selectedMachineId)}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#FFFFFF] hover:bg-[#FFF3C4] border border-[#E5E7EB] hover:border-[#F4B400] text-[#1F2933] text-xs font-semibold transition-all shadow-xs cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#D99A00]" />
          <span>Refresh Tree</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Machine List */}
        <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-xs space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#1F2933] font-mono border-b border-[#E5E7EB] pb-2">
            Equipment Under Inspection
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

        {/* Detailed Dependency Tree */}
        <div className="lg:col-span-3 space-y-6">
          {impactData && (
            <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5E7EB] pb-3">
                <div>
                  <span className="text-xs font-mono font-bold text-[#D99A00]">
                    TOPOLOGICAL DEPENDENCY MAP
                  </span>
                  <h2 className="text-xl font-bold text-[#1F2933] font-mono">
                    {impactData.origin_machine?.machine_id} Downstream Consequences
                  </h2>
                </div>
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full border font-mono ${
                    impactData.production_impact?.impact_severity === "CRITICAL"
                      ? "bg-rose-50 text-[#EF4444] border-rose-200"
                      : "bg-[#FFF3C4] text-[#1F2933] border-[#F4B400]/40"
                  }`}
                >
                  Severity: {impactData.production_impact?.impact_severity || "LOW"}
                </span>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-[#FFFDF5] border border-[#E5E7EB] space-y-1">
                  <div className="text-[10px] font-mono uppercase text-[#667085]">
                    Machines Directly or Indirectly Dependent
                  </div>
                  <div className="text-2xl font-bold font-mono text-[#1F2933]">
                    {impactData.cascade?.affected_machine_count || 0}
                  </div>
                  <p className="text-[10px] text-[#667085]">Require safety isolation</p>
                </div>

                <div className="p-4 rounded-xl bg-[#FFFDF5] border border-[#E5E7EB] space-y-1">
                  <div className="text-[10px] font-mono uppercase text-[#667085]">
                    Estimated Hourly Downtime Loss
                  </div>
                  <div className="text-2xl font-bold font-mono text-[#EF4444]">
                    &#8377;{(impactData.production_impact?.estimated_potential_downtime_cost || 0).toLocaleString()}
                  </div>
                  <p className="text-[10px] text-[#667085]">During maintenance stoppage</p>
                </div>

                <div className="p-4 rounded-xl bg-[#FFFDF5] border border-[#E5E7EB] space-y-1">
                  <div className="text-[10px] font-mono uppercase text-[#667085]">
                    Maintenance Window
                  </div>
                  <div className="text-xl font-bold font-mono text-[#1F2933]">
                    {selectedMachine?.maintenance_window || "NEXT_SHIFT"}
                  </div>
                  <p className="text-[10px] text-[#667085]">Optimal scheduled window</p>
                </div>
              </div>

              {/* Dependent Machines List */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#1F2933] font-mono">
                  Downstream Machine List &amp; Buffer Delays
                </h3>

                {(!impactData.cascade?.affected_machines || impactData.cascade.affected_machines.length === 0) ? (
                  <div className="p-4 rounded-xl bg-[#FFFDF5] border border-[#E5E7EB] text-center text-xs text-[#667085]">
                    Terminal equipment. No downstream production assets affected.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {impactData.cascade.affected_machines.map((aff, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-[#FFFDF5] border border-[#E5E7EB] flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-lg bg-[#FFF3C4] text-[#D99A00] font-mono font-bold flex items-center justify-center text-[10px]">
                            L{aff.cascade_level || aff.dependency_level || 1}
                          </span>
                          <div>
                            <div className="font-bold font-mono text-[#1F2933]">
                              {aff.machine_id} {aff.process ? `– ${aff.process}` : ""}
                            </div>
                            <div className="text-[10px] text-[#667085]">
                              Criticality: {aff.criticality || "MEDIUM"} | Line: {aff.production_line}
                            </div>
                          </div>
                        </div>

                        <div className="text-right font-mono text-xs">
                          <span className="font-bold text-[#1F2933]">
                            &#8377;{(aff.estimated_downtime_cost_per_hour_inr || 0).toLocaleString()}/hr
                          </span>
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
