import React, { useState, useEffect } from "react";
import { maintenanceApi } from "../../api/maintenanceApi";
import { WorkOrderItem } from "../../types/maintenance";
import { LoadingState } from "../common/LoadingState";
import { ErrorState } from "../common/ErrorState";
import {
  History,
  RefreshCw,
  CheckCircle2,
  Calendar,
  Filter,
  Wrench,
} from "lucide-react";

export const MaintenanceHistory: React.FC = () => {
  const [history, setHistory] = useState<WorkOrderItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMachine, setSelectedMachine] = useState<string>("ALL");

  const fetchHistory = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await maintenanceApi.getMaintenanceHistory();
      setHistory(data);
    } catch (err: any) {
      setError("Failed to fetch maintenance history records from backend.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  if (isLoading) {
    return <LoadingState message="Loading PostgreSQL Maintenance Records & History..." />;
  }

  if (error && history.length === 0) {
    return (
      <ErrorState
        title="History Records Unavailable"
        message={error}
        onRetry={fetchHistory}
      />
    );
  }

  const machines = Array.from(new Set(history.map((h) => h.machine_id)));
  const filteredHistory = history.filter((h) => {
    if (selectedMachine === "ALL") return true;
    return h.machine_id === selectedMachine;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E7EB]">
        <div>
          <div className="flex items-center gap-2">
            <History className="w-6 h-6 text-[#D99A00]" />
            <h1 className="text-xl font-bold text-[#1F2933] font-mono tracking-tight">
              MAINTENANCE HISTORY &amp; AUDIT LOGS
            </h1>
          </div>
          <p className="text-xs text-[#667085] mt-1">
            Historical maintenance interventions, repairs performed, completion timestamps, and equipment service logs.
          </p>
        </div>

        <button
          onClick={fetchHistory}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#FFFFFF] hover:bg-[#FFF3C4] border border-[#E5E7EB] hover:border-[#F4B400] text-[#1F2933] text-xs font-semibold transition-all shadow-xs cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#D99A00]" />
          <span>Refresh Records</span>
        </button>
      </div>

      {/* Filter by Machine */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-xs font-bold text-[#667085] uppercase tracking-wider font-mono mr-1">
          Machine:
        </span>
        <button
          onClick={() => setSelectedMachine("ALL")}
          className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
            selectedMachine === "ALL"
              ? "bg-[#FFF3C4] text-[#1F2933] border border-[#F4B400]"
              : "bg-[#FFFFFF] text-[#667085] border border-[#E5E7EB] hover:bg-[#FFFDF5]"
          }`}
        >
          ALL ({history.length})
        </button>
        {machines.map((mId) => (
          <button
            key={mId}
            onClick={() => setSelectedMachine(mId)}
            className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
              selectedMachine === mId
                ? "bg-[#FFF3C4] text-[#1F2933] border border-[#F4B400]"
                : "bg-[#FFFFFF] text-[#667085] border border-[#E5E7EB] hover:bg-[#FFFDF5]"
            }`}
          >
            {mId} ({history.filter((h) => h.machine_id === mId).length})
          </button>
        ))}
      </div>

      {/* History Table */}
      <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#1F2933] font-mono">
            Historical Service Interventions ({filteredHistory.length} Records)
          </h3>
          <span className="text-xs text-[#667085]">PostgreSQL Synchronized</span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-[#E5E7EB]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FFFDF5] text-[#667085] uppercase tracking-wider font-mono text-[10px] border-b border-[#E5E7EB]">
              <tr>
                <th className="px-4 py-3">Record ID</th>
                <th className="px-4 py-3">Equipment</th>
                <th className="px-4 py-3">Maintenance Type</th>
                <th className="px-4 py-3">Description &amp; Action</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Completed Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {filteredHistory.map((h) => (
                <tr key={h.id} className="hover:bg-[#FFFDF5] transition-colors">
                  <td className="px-4 py-3.5 font-bold font-mono text-[#1F2933]">
                    #{h.id}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="font-bold font-mono text-[#1F2933]">{h.machine_id}</span>
                    <span className="text-[10px] text-[#667085] block font-mono">
                      {h.process} &bull; {h.production_line}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 font-mono text-[#1F2933] font-semibold">
                    {h.maintenance_type}
                  </td>
                  <td className="px-4 py-3.5 text-[#667085] max-w-sm truncate">
                    {h.description}
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono ${
                        h.status === "COMPLETED"
                          ? "bg-emerald-50 text-[#22C55E] border border-emerald-200"
                          : h.status === "IN_PROGRESS"
                          ? "bg-amber-50 text-[#F59E0B] border border-amber-200"
                          : "bg-[#FFF3C4] text-[#1F2933] border border-[#F4B400]/40"
                      }`}
                    >
                      {h.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 font-mono text-[#667085] text-[11px]">
                    {h.completed_at
                      ? new Date(h.completed_at).toLocaleString()
                      : "Pending Completion"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
