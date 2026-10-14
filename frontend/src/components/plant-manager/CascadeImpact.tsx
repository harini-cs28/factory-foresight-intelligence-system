import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { machineApi } from "../../api/machineApi";
import { impactApi } from "../../api/impactApi";
import { MachineItem } from "../../types/machine";
import { ImpactResponse } from "../../types/impact";
import { LoadingState } from "../common/LoadingState";
import { ErrorState } from "../common/ErrorState";
import {
  Share2,
  RefreshCw,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  Layers,
  DollarSign,
  Clock,
} from "lucide-react";

export const CascadeImpact: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialMachineId = searchParams.get("machineId") || "SPIN-01";

  const [machines, setMachines] = useState<MachineItem[]>([]);
  const [selectedMachineId, setSelectedMachineId] = useState<string>(initialMachineId);
  const [impactData, setImpactData] = useState<ImpactResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMachines = async () => {
    try {
      const data = await machineApi.getMachines();
      setMachines(data);
      if (!data.some((m) => m.machine_id === selectedMachineId) && data.length > 0) {
        setSelectedMachineId(data[0].machine_id);
      }
    } catch (err: any) {
      setError("Failed to load machine directory.");
    }
  };

  const fetchImpact = async (mId: string) => {
    try {
      const impact = await impactApi.getMachineImpact(mId);
      setImpactData(impact);
    } catch (err: any) {
      setError(err?.response?.data?.detail || `Failed to analyze cascade impact for ${mId}.`);
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
    return <LoadingState message="Executing BFS Cascade Failure Impact Modeling..." />;
  }

  const selectedMachine = machines.find((m) => m.machine_id === selectedMachineId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E7EB]">
        <div>
          <div className="flex items-center gap-2">
            <Share2 className="w-6 h-6 text-[#D99A00]" />
            <h1 className="text-xl font-bold text-[#1F2933] font-mono tracking-tight">
              CASCADE FAILURE IMPACT MODELING
            </h1>
          </div>
          <p className="text-xs text-[#667085] mt-1">
            Topological Breadth-First-Search (BFS) propagation analysis across textile production lines.
          </p>
        </div>

        <button
          onClick={() => {
            fetchMachines();
            fetchImpact(selectedMachineId);
          }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#FFFFFF] hover:bg-[#FFF3C4] border border-[#E5E7EB] hover:border-[#F4B400] text-[#1F2933] text-xs font-semibold transition-all shadow-xs cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#D99A00]" />
          <span>Recompute Cascade</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Machine Selector */}
        <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-xs space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#1F2933] font-mono border-b border-[#E5E7EB] pb-2">
            Select Root Failure Asset
          </h3>

          <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
            {machines.map((m) => {
              const isSelected = m.machine_id === selectedMachineId;
              const isCrit = m.latest_prediction?.health_status === "CRITICAL";
              return (
                <button
                  key={m.machine_id}
                  onClick={() => handleSelectMachine(m.machine_id)}
                  className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? "bg-[#FFF3C4] border-[#F4B400] shadow-xs"
                      : "bg-[#FFFDF5] border-[#E5E7EB] hover:bg-[#FFFFFF]"
                  }`}
                >
                  <div>
                    <div className="font-bold font-mono text-xs text-[#1F2933]">
                      {m.machine_id} &ndash; {m.process}
                    </div>
                    <div className="text-[10px] text-[#667085] font-mono">{m.production_line}</div>
                  </div>
                  {isCrit && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-50 text-[#EF4444] border border-rose-200 font-mono">
                      CRITICAL
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Cascade Results */}
        <div className="lg:col-span-2 space-y-6">
          {impactData && (
            <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-xs space-y-6">
              {/* Summary Cards */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5E7EB] pb-4">
                <div>
                  <span className="text-xs font-mono font-bold text-[#D99A00]">
                    ROOT CAUSE SIMULATION
                  </span>
                  <h2 className="text-xl font-bold text-[#1F2933] font-mono">
                    {impactData.origin_machine?.machine_id} Impact Propagation
                  </h2>
                </div>
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full border font-mono ${
                    impactData.production_impact?.impact_severity === "CRITICAL"
                      ? "bg-rose-50 text-[#EF4444] border-rose-200"
                      : impactData.production_impact?.impact_severity === "HIGH"
                      ? "bg-amber-50 text-[#F59E0B] border-amber-200"
                      : "bg-emerald-50 text-[#22C55E] border-emerald-200"
                  }`}
                >
                  Severity: {impactData.production_impact?.impact_severity || "LOW"}
                </span>
              </div>

              {/* Impact KPI Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-[#FFFDF5] border border-[#E5E7EB] space-y-1">
                  <div className="text-[10px] font-mono uppercase text-[#667085]">
                    Downstream Exposed Assets
                  </div>
                  <div className="text-2xl font-bold font-mono text-[#1F2933]">
                    {impactData.cascade?.affected_machine_count || 0} <span className="text-xs font-normal text-[#667085]">Machines</span>
                  </div>
                  <p className="text-[10px] text-[#667085]">Direct &amp; transitive dependencies</p>
                </div>

                <div className="p-4 rounded-xl bg-[#FFFDF5] border border-[#E5E7EB] space-y-1">
                  <div className="text-[10px] font-mono uppercase text-[#667085]">
                    Max Propagation Depth
                  </div>
                  <div className="text-2xl font-bold font-mono text-[#1F2933]">
                    Level {impactData.cascade?.maximum_cascade_level || 1}
                  </div>
                  <p className="text-[10px] text-[#667085]">BFS traversal distance</p>
                </div>

                <div className="p-4 rounded-xl bg-[#FFFDF5] border border-[#E5E7EB] space-y-1">
                  <div className="text-[10px] font-mono uppercase text-[#667085]">
                    Estimated Financial Downtime Cost
                  </div>
                  <div className="text-2xl font-bold font-mono text-[#EF4444]">
                    &#8377;{(impactData.production_impact?.estimated_potential_downtime_cost || 0).toLocaleString()}
                  </div>
                  <p className="text-[10px] text-[#667085]">Hourly production loss risk</p>
                </div>
              </div>

              {/* Propagation Path & Affected Equipment */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#1F2933] font-mono">
                  Downstream Dependency Cascade Tree
                </h3>

                {(!impactData.cascade?.affected_machines || impactData.cascade.affected_machines.length === 0) ? (
                  <div className="p-6 rounded-xl bg-[#FFFDF5] border border-[#E5E7EB] text-center text-xs text-[#667085]">
                    No downstream dependencies. Failure of {impactData.origin_machine?.machine_id} does not halt other machines directly.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {impactData.cascade.affected_machines.map((aff, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-[#FFFDF5] border border-[#E5E7EB] flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-lg bg-[#FFF3C4] text-[#D99A00] font-mono font-bold flex items-center justify-center text-[10px] shrink-0">
                            L{aff.cascade_level || aff.dependency_level || 1}
                          </span>
                          <div>
                            <div className="font-bold font-mono text-[#1F2933]">
                              {aff.machine_id} {aff.process ? `– ${aff.process}` : ""}
                            </div>
                            <div className="text-[10px] text-[#667085] font-mono">
                              Line: {aff.production_line} {aff.criticality ? `| Criticality: ${aff.criticality}` : ""}
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="font-mono font-bold text-[#1F2933]">
                            &#8377;{(aff.estimated_downtime_cost_per_hour_inr || 0).toLocaleString()}/hr
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
