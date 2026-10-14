import React, { useState, useEffect } from "react";
import { machineApi } from "../../api/machineApi";
import { impactApi } from "../../api/impactApi";
import { MachineItem } from "../../types/machine";
import { ImpactResponse } from "../../types/impact";
import { DigitalTwinHeader } from "./DigitalTwinHeader";
import { FactoryScene } from "./FactoryScene";
import { MachineLegend } from "./MachineLegend";
import { MachineDetailsPanel } from "./MachineDetailsPanel";
import { LoadingState } from "../common/LoadingState";
import { ErrorState } from "../common/ErrorState";
import { EmptyState } from "../common/EmptyState";
import { ArrowRight, Layers, Cpu, Share2, Wrench } from "lucide-react";

export const DigitalTwinView: React.FC = () => {
  const [machines, setMachines] = useState<MachineItem[]>([]);
  const [selectedMachine, setSelectedMachine] = useState<MachineItem | null>(null);
  const [selectedLine, setSelectedLine] = useState<string>("ALL");
  const [impactData, setImpactData] = useState<ImpactResponse | null>(null);
  const [isLoadingImpact, setIsLoadingImpact] = useState<boolean>(false);
  const [resetCameraTrigger, setResetCameraTrigger] = useState<number>(0);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMachines = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await machineApi.getMachines();
      setMachines(data);
      if (data.length > 0 && !selectedMachine) {
        setSelectedMachine(data[0]);
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ||
          "Unable to load factory machine telemetry and digital twin spatial state."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMachines();
  }, []);

  // Fetch Cascade impact when selectedMachine changes
  useEffect(() => {
    if (!selectedMachine) {
      setImpactData(null);
      return;
    }

    let isMounted = true;
    const fetchImpact = async () => {
      setIsLoadingImpact(true);
      try {
        const data = await impactApi.getMachineImpact(selectedMachine.machine_id);
        if (isMounted) setImpactData(data);
      } catch {
        if (isMounted) setImpactData(null);
      } finally {
        if (isMounted) setIsLoadingImpact(false);
      }
    };

    fetchImpact();

    return () => {
      isMounted = false;
    };
  }, [selectedMachine]);

  if (isLoading) {
    return <LoadingState message="Loading factory intelligence & 3D spatial layout..." />;
  }

  if (error) {
    return (
      <ErrorState
        title="Digital Twin Stream Failure"
        message={error}
        onRetry={fetchMachines}
      />
    );
  }

  if (machines.length === 0) {
    return (
      <EmptyState
        title="No Factory Machine Data Available"
        message="No active machines were returned by PostgreSQL for 3D digital twin rendering."
      />
    );
  }

  const activeCascadeIds = impactData
    ? impactData.cascade.affected_machines.map((m) => m.machine_id)
    : [];

  return (
    <div className="space-y-6">
      {/* Top Controls Header */}
      <DigitalTwinHeader
        machines={machines}
        selectedLine={selectedLine}
        onSelectLine={setSelectedLine}
        onResetCamera={() => setResetCameraTrigger((prev) => prev + 1)}
      />

      {/* Main 3D Canvas + Details Side Panel Area */}
      <div className="flex flex-col lg:flex-row items-start gap-6">
        {/* 3D Scene Viewport */}
        <div className="flex-1 w-full relative space-y-4">
          <FactoryScene
            machines={machines}
            selectedMachineId={selectedMachine?.machine_id || null}
            selectedLine={selectedLine}
            activeCascadeIds={activeCascadeIds}
            onSelectMachine={(m) => setSelectedMachine(m)}
            resetCameraTrigger={resetCameraTrigger}
          />

          {/* Bottom Legend Overlay */}
          <MachineLegend />
        </div>

        {/* Selected Machine Side Details Panel */}
        {selectedMachine && (
          <MachineDetailsPanel
            machine={selectedMachine}
            impact={impactData}
            isLoadingImpact={isLoadingImpact}
            onClose={() => setSelectedMachine(null)}
          />
        )}
      </div>

      {/* Conceptual Textile Production Process Sequence Flow */}
      <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-[#1F2933]">
          <Layers className="w-4 h-4 text-[#D99A00]" />
          <span>Integrated Textile Manufacturing Flow (Interactive Spatial Representation)</span>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs text-[#1F2933]">
          {[
            "Spinning",
            "Carding",
            "Drawing",
            "Ring Frame",
            "Weaving",
            "Dyeing",
            "Finishing",
            "Packing",
          ].map((step, idx, arr) => (
            <React.Fragment key={step}>
              <div className="px-3 py-1.5 rounded-xl bg-[#FFFDF5] border border-[#E5E7EB] text-[#1F2933] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#F4B400]" />
                <span className="font-semibold">{step}</span>
              </div>
              {idx < arr.length - 1 && (
                <ArrowRight className="w-3.5 h-3.5 text-[#667085] shrink-0" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};
