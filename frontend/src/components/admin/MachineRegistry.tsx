import React, { useState, useEffect } from "react";
import { adminApi } from "../../api/adminApi";
import { MachineItem } from "../../types/machine";
import { LoadingState } from "../common/LoadingState";
import { ErrorState } from "../common/ErrorState";
import {
  Activity,
  RefreshCw,
  Edit2,
  Check,
  X,
  CheckCircle2,
  Sliders,
  Layers,
} from "lucide-react";

export const MachineRegistry: React.FC = () => {
  const [machines, setMachines] = useState<MachineItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [editingMachineId, setEditingMachineId] = useState<string | null>(null);
  const [selectedCriticality, setSelectedCriticality] = useState<string>("MEDIUM");
  const [selectedLine, setSelectedLine] = useState<string>("Line-A");
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  const fetchMachines = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await adminApi.getMachineRegistry();
      setMachines(data);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Unable to fetch machine registry from backend.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMachines();
  }, []);

  const handleStartEdit = (machine: MachineItem) => {
    setEditingMachineId(machine.machine_id);
    setSelectedCriticality(machine.criticality);
    setSelectedLine(machine.production_line);
    setSaveSuccess(null);
  };

  const handleCancelEdit = () => {
    setEditingMachineId(null);
  };

  const handleSaveEdit = async (machineId: string) => {
    try {
      const updated = await adminApi.updateMachineRegistry(machineId, {
        criticality: selectedCriticality,
        production_line: selectedLine,
      });
      setMachines((prev) =>
        prev.map((m) => (m.machine_id === machineId ? updated : m))
      );
      setEditingMachineId(null);
      setSaveSuccess(`Updated registry for machine ${machineId}`);
      setTimeout(() => setSaveSuccess(null), 4000);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to update machine registry.");
    }
  };

  if (isLoading) {
    return <LoadingState message="Loading Factory Machinery Registry..." />;
  }

  if (error && machines.length === 0) {
    return (
      <ErrorState
        title="Machine Registry Unavailable"
        message={error}
        onRetry={fetchMachines}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E7EB]">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-6 h-6 text-[#D99A00]" />
            <h1 className="text-xl font-bold text-[#1F2933] font-mono tracking-tight">
              MACHINE REGISTRY &amp; ASSET GOVERNANCE
            </h1>
          </div>
          <p className="text-xs text-[#667085] mt-1">
            Registered textile machinery, process categories, line assignments, and operational criticality levels.
          </p>
        </div>

        <button
          onClick={fetchMachines}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#FFFFFF] hover:bg-[#FFF3C4] border border-[#E5E7EB] hover:border-[#F4B400] text-[#1F2933] text-xs font-semibold transition-all shadow-xs cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#D99A00]" />
          <span>Refresh Registry</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{saveSuccess}</span>
        </div>
      )}

      {/* Registry Table */}
      <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#1F2933] font-mono">
            Registered Assets ({machines.length} Machines)
          </h3>
          <span className="text-xs text-[#667085]">PostgreSQL Synchronized Registry</span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-[#E5E7EB]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FFFDF5] text-[#667085] uppercase tracking-wider font-mono text-[10px] border-b border-[#E5E7EB]">
              <tr>
                <th className="px-4 py-3">Machine ID</th>
                <th className="px-4 py-3">Process</th>
                <th className="px-4 py-3">Production Line</th>
                <th className="px-4 py-3">Criticality</th>
                <th className="px-4 py-3">Technician</th>
                <th className="px-4 py-3">Spare Part</th>
                <th className="px-4 py-3">Window</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {machines.map((m) => {
                const isEditing = editingMachineId === m.machine_id;
                return (
                  <tr key={m.machine_id} className="hover:bg-[#FFFDF5] transition-colors">
                    <td className="px-4 py-3.5 font-bold font-mono text-[#1F2933]">
                      {m.machine_id}
                    </td>
                    <td className="px-4 py-3.5 text-[#1F2933] font-medium">{m.process}</td>
                    <td className="px-4 py-3.5 font-mono">
                      {isEditing ? (
                        <select
                          value={selectedLine}
                          onChange={(e) => setSelectedLine(e.target.value)}
                          className="px-2 py-1 bg-[#FFFFFF] border border-[#F4B400] rounded text-xs text-[#1F2933] font-mono outline-none"
                        >
                          <option value="Line-A">Line-A</option>
                          <option value="Line-B">Line-B</option>
                          <option value="Line-C">Line-C</option>
                        </select>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-[#F8F9FA] border border-[#E5E7EB] text-[#1F2933]">
                          {m.production_line}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 font-mono">
                      {isEditing ? (
                        <select
                          value={selectedCriticality}
                          onChange={(e) => setSelectedCriticality(e.target.value)}
                          className="px-2 py-1 bg-[#FFFFFF] border border-[#F4B400] rounded text-xs text-[#1F2933] font-mono outline-none"
                        >
                          <option value="CRITICAL">CRITICAL</option>
                          <option value="HIGH">HIGH</option>
                          <option value="MEDIUM">MEDIUM</option>
                          <option value="LOW">LOW</option>
                        </select>
                      ) : (
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                            m.criticality === "CRITICAL"
                              ? "bg-rose-50 text-[#EF4444] border border-rose-200"
                              : m.criticality === "HIGH"
                              ? "bg-amber-50 text-[#F59E0B] border border-amber-200"
                              : "bg-[#FFF3C4] text-[#1F2933] border border-[#F4B400]/40"
                          }`}
                        >
                          {m.criticality}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-[11px] font-mono text-[#667085]">
                      {m.technician_available || "N/A"}
                    </td>
                    <td className="px-4 py-3.5 text-[11px] font-mono text-[#667085]">
                      {m.spare_part_available || "N/A"}
                    </td>
                    <td className="px-4 py-3.5 text-[11px] font-mono text-[#667085]">
                      {m.maintenance_window || "N/A"}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleSaveEdit(m.machine_id)}
                            className="p-1.5 rounded-lg bg-[#22C55E] hover:bg-emerald-600 text-[#FFFFFF] cursor-pointer"
                            title="Save changes"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="p-1.5 rounded-lg bg-[#E5E7EB] hover:bg-[#667085] text-[#1F2933] hover:text-[#FFFFFF] cursor-pointer"
                            title="Cancel"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleStartEdit(m)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FFFDF5] hover:bg-[#FFF3C4] border border-[#E5E7EB] hover:border-[#F4B400] text-xs font-semibold text-[#1F2933] transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3 h-3 text-[#D99A00]" />
                          <span>Configure</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
