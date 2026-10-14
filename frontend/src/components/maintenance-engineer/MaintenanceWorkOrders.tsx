import React, { useState, useEffect } from "react";
import { maintenanceApi } from "../../api/maintenanceApi";
import { WorkOrderItem } from "../../types/maintenance";
import { LoadingState } from "../common/LoadingState";
import { ErrorState } from "../common/ErrorState";
import {
  ClipboardList,
  RefreshCw,
  CheckCircle2,
  Clock,
  Play,
  Check,
  Filter,
} from "lucide-react";

export const MaintenanceWorkOrders: React.FC = () => {
  const [workOrders, setWorkOrders] = useState<WorkOrderItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchWorkOrders = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await maintenanceApi.getWorkOrders();
      setWorkOrders(data);
    } catch (err: any) {
      setError("Failed to fetch maintenance work orders from backend.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkOrders();
  }, []);

  const handleUpdateStatus = async (recordId: number, status: string) => {
    try {
      const updated = await maintenanceApi.updateWorkOrderStatus(recordId, status);
      setWorkOrders((prev) => prev.map((o) => (o.id === recordId ? updated : o)));
      setActionSuccess(`Work Order #${recordId} marked as ${status}.`);
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (e: any) {
      setError(e?.response?.data?.detail || "Failed to update work order status.");
    }
  };

  if (isLoading) {
    return <LoadingState message="Loading Maintenance Work Orders Registry..." />;
  }

  if (error && workOrders.length === 0) {
    return (
      <ErrorState
        title="Work Orders Unavailable"
        message={error}
        onRetry={fetchWorkOrders}
      />
    );
  }

  const filteredOrders = workOrders.filter((wo) => {
    if (statusFilter === "ALL") return true;
    return wo.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E7EB]">
        <div>
          <div className="flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-[#D99A00]" />
            <h1 className="text-xl font-bold text-[#1F2933] font-mono tracking-tight">
              MAINTENANCE WORK ORDERS
            </h1>
          </div>
          <p className="text-xs text-[#667085] mt-1">
            Authorized technician work order execution, lifecycle state tracking, and task completion.
          </p>
        </div>

        <button
          onClick={fetchWorkOrders}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#FFFFFF] hover:bg-[#FFF3C4] border border-[#E5E7EB] hover:border-[#F4B400] text-[#1F2933] text-xs font-semibold transition-all shadow-xs cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#D99A00]" />
          <span>Refresh Orders</span>
        </button>
      </div>

      {actionSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold text-[#667085] uppercase tracking-wider font-mono mr-1">
          Status:
        </span>
        {["ALL", "SCHEDULED", "IN_PROGRESS", "COMPLETED"].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
              statusFilter === s
                ? "bg-[#FFF3C4] text-[#1F2933] border border-[#F4B400]"
                : "bg-[#FFFFFF] text-[#667085] border border-[#E5E7EB] hover:bg-[#FFFDF5]"
            }`}
          >
            {s.replace("_", " ")} ({workOrders.filter((w) => (s === "ALL" ? true : w.status === s)).length})
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#1F2933] font-mono">
            Work Orders Registry ({filteredOrders.length} Records)
          </h3>
          <span className="text-xs text-[#667085]">PostgreSQL Synchronized</span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-[#E5E7EB]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FFFDF5] text-[#667085] uppercase tracking-wider font-mono text-[10px] border-b border-[#E5E7EB]">
              <tr>
                <th className="px-4 py-3">WO ID</th>
                <th className="px-4 py-3">Asset</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3 text-right">Technician Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {filteredOrders.map((wo) => (
                <tr key={wo.id} className="hover:bg-[#FFFDF5] transition-colors">
                  <td className="px-4 py-3.5 font-bold font-mono text-[#1F2933]">
                    #{wo.id}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="font-bold font-mono text-[#1F2933]">{wo.machine_id}</div>
                    <div className="text-[10px] text-[#667085]">{wo.process} &bull; {wo.production_line}</div>
                  </td>
                  <td className="px-4 py-3.5 font-mono text-[#1F2933] font-semibold">
                    {wo.maintenance_type}
                  </td>
                  <td className="px-4 py-3.5 text-[#667085] max-w-sm truncate">
                    {wo.description}
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono ${
                        wo.status === "COMPLETED"
                          ? "bg-emerald-50 text-[#22C55E] border border-emerald-200"
                          : wo.status === "IN_PROGRESS"
                          ? "bg-amber-50 text-[#F59E0B] border border-amber-200"
                          : "bg-[#FFF3C4] text-[#1F2933] border border-[#F4B400]/40"
                      }`}
                    >
                      {wo.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 font-mono text-[#667085] text-[11px]">
                    {new Date(wo.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {wo.status === "SCHEDULED" && (
                        <button
                          onClick={() => handleUpdateStatus(wo.id, "IN_PROGRESS")}
                          className="px-2.5 py-1 rounded-lg bg-[#FFF3C4] hover:bg-[#F4B400] text-[#1F2933] font-bold text-[11px] font-mono transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Play className="w-3 h-3" />
                          <span>Start</span>
                        </button>
                      )}
                      {wo.status === "IN_PROGRESS" && (
                        <button
                          onClick={() => handleUpdateStatus(wo.id, "COMPLETED")}
                          className="px-2.5 py-1 rounded-lg bg-[#22C55E] hover:bg-emerald-600 text-[#FFFFFF] font-bold text-[11px] font-mono transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Check className="w-3 h-3" />
                          <span>Complete</span>
                        </button>
                      )}
                      {wo.status === "COMPLETED" && (
                        <span className="text-[11px] font-mono text-[#22C55E] font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Closed</span>
                        </span>
                      )}
                    </div>
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
