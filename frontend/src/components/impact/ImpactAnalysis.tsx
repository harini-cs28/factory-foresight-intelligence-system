import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { impactApi } from "../../api/impactApi";
import { ImpactResponse } from "../../types/impact";
import { Navigation } from "../layout/Navigation";
import { ImpactSummary } from "./ImpactSummary";
import { CascadeGraph } from "./CascadeGraph";
import { AffectedMachines } from "./AffectedMachines";
import { LoadingState } from "../common/LoadingState";
import { ErrorState } from "../common/ErrorState";
import { EmptyState } from "../common/EmptyState";
import { Share2, ArrowRight, Wrench, Cpu } from "lucide-react";

export const ImpactAnalysis: React.FC = () => {
  const { machineId = "M01" } = useParams<{ machineId: string }>();

  const [impact, setImpact] = useState<ImpactResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchImpactAnalysis = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await impactApi.getMachineImpact(machineId);
      setImpact(data);
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ||
          `Unable to compute cascade dependency impact for machine '${machineId}'.`
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchImpactAnalysis();
  }, [machineId]);

  if (isLoading) {
    return <LoadingState message={`Traversing dependency tree for machine ${machineId}...`} />;
  }

  if (error || !impact) {
    return (
      <ErrorState
        title="Cascade Impact Analysis Unavailable"
        message={error || `Could not compute cascade impact for machine '${machineId}'.`}
        onRetry={fetchImpactAnalysis}
      />
    );
  }

  const { origin_machine } = impact;

  return (
    <div className="space-y-6">
      {/* Sub Navigation Bar */}
      <Navigation machineId={machineId} />

      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold font-mono text-[#1F2933] tracking-wider">
              {origin_machine.machine_id}
            </span>
            <span className="px-3 py-1 rounded-full bg-[#FFF3C4] border border-[#F4B400]/40 text-xs font-semibold text-[#1F2933]">
              {origin_machine.process}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs text-[#667085] mt-2">
            <span>Production Line: <strong className="text-[#1F2933]">{origin_machine.production_line}</strong></span>
            <span>Criticality: <strong className="text-amber-700">{origin_machine.criticality}</strong></span>
            <span>Production Impact: <strong className="text-rose-600 font-semibold">{origin_machine.production_impact || "HIGH"}</strong></span>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          <Link
            to={`/intelligence/${machineId}`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FFFFFF] hover:bg-[#FFF3C4] border border-[#E5E7EB] hover:border-[#F4B400] text-[#1F2933] text-xs font-semibold transition-all shadow-xs"
          >
            <Cpu className="w-4 h-4 text-[#D99A00]" />
            <span>Diagnostics</span>
          </Link>
          <Link
            to={`/maintenance/${machineId}`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#F4B400] hover:bg-[#D99A00] text-[#1F2933] text-xs font-bold transition-all shadow-xs"
          >
            <Wrench className="w-4 h-4" />
            <span>Decision Engine</span>
          </Link>
        </div>
      </div>

      {/* KPI Impact Summary */}
      <ImpactSummary impact={impact} />

      {/* Visual Cascade Topology */}
      <CascadeGraph impact={impact} />

      {/* Detailed Affected Machine Registry */}
      <AffectedMachines affectedMachines={impact.cascade.affected_machines} />
    </div>
  );
};
