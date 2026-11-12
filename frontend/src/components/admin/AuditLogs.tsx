import React, { useState, useEffect } from "react";
import { adminApi, AuditLogFilters } from "../../api/adminApi";
import { AuditLogItem } from "../../types/admin";
import { LoadingState } from "../common/LoadingState";
import { ErrorState } from "../common/ErrorState";
import {
  FileText,
  RefreshCw,
  Filter,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Shield,
  Search,
} from "lucide-react";

export const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(15);
  const [totalPages, setTotalPages] = useState<number>(1);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [actionTypeFilter, setActionTypeFilter] = useState<string>("ALL");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [resultFilter, setResultFilter] = useState<string>("ALL");
  const [userQuery, setUserQuery] = useState<string>("");

  const fetchLogs = async (currentPage = page) => {
    setIsLoading(true);
    setError(null);
    try {
      const filters: AuditLogFilters = {
        page: currentPage,
        pageSize: pageSize,
        actionType: actionTypeFilter !== "ALL" ? actionTypeFilter : undefined,
        roleFilter: roleFilter !== "ALL" ? roleFilter : undefined,
        resultStatus: resultFilter !== "ALL" ? resultFilter : undefined,
        userFilter: userQuery.trim() || undefined,
      };

      const data = await adminApi.getAuditLogs(filters);
      setLogs(data.items || []);
      setTotal(data.total || 0);
      setPage(data.page || currentPage);
      setTotalPages(data.total_pages || 1);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Unable to fetch administrative audit logs.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(1);
  }, [actionTypeFilter, roleFilter, resultFilter, pageSize]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLogs(1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      fetchLogs(newPage);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E7EB]">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-6 h-6 text-[#D99A00]" />
            <h1 className="text-xl font-bold text-[#1F2933] font-mono tracking-tight">
              ADMINISTRATIVE AUDIT LOGS &amp; GOVERNANCE
            </h1>
          </div>
          <p className="text-xs text-[#667085] mt-1">
            Persisted chronological audit records of user role updates, machine registry changes, and system operations.
          </p>
        </div>

        <button
          onClick={() => fetchLogs(page)}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#FFFFFF] hover:bg-[#FFF3C4] border border-[#E5E7EB] hover:border-[#F4B400] text-[#1F2933] text-xs font-semibold transition-all shadow-xs cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#D99A00] ${isLoading ? "animate-spin" : ""}`} />
          <span>Refresh Logs</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-xs space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Action Filter */}
          <div className="flex items-center gap-2 text-xs">
            <span className="font-bold text-[#667085] uppercase tracking-wider font-mono">Action:</span>
            <select
              value={actionTypeFilter}
              onChange={(e) => setActionTypeFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-[#E5E7EB] text-xs bg-[#FFFDF5] text-[#1F2933] font-mono"
            >
              <option value="ALL">All Actions</option>
              <option value="USER_UPDATE">User Update</option>
              <option value="MACHINE_UPDATE">Machine Update</option>
              <option value="ALERT_ACKNOWLEDGEMENT">Alert Acknowledgement</option>
              <option value="CONFIG_UPDATE">Config Update</option>
            </select>
          </div>

          {/* Role Filter */}
          <div className="flex items-center gap-2 text-xs">
            <span className="font-bold text-[#667085] uppercase tracking-wider font-mono">Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-[#E5E7EB] text-xs bg-[#FFFDF5] text-[#1F2933] font-mono"
            >
              <option value="ALL">All Roles</option>
              <option value="ADMIN">Admin</option>
              <option value="PLANT_MANAGER">Plant Manager</option>
              <option value="MAINTENANCE_ENGINEER">Maintenance Engineer</option>
              <option value="PRODUCTION_MANAGER">Production Manager</option>
            </select>
          </div>

          {/* Result Filter */}
          <div className="flex items-center gap-2 text-xs">
            <span className="font-bold text-[#667085] uppercase tracking-wider font-mono">Result:</span>
            <select
              value={resultFilter}
              onChange={(e) => setResultFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-[#E5E7EB] text-xs bg-[#FFFDF5] text-[#1F2933] font-mono"
            >
              <option value="ALL">All Results</option>
              <option value="SUCCESS">Success</option>
              <option value="FAILURE">Failure</option>
            </select>
          </div>

          {/* Search by User/Actor */}
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 ml-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search user or resource ID..."
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-lg border border-[#E5E7EB] text-xs bg-[#FFFDF5] text-[#1F2933] placeholder:text-[#667085] font-mono w-56"
              />
              <Search className="w-3.5 h-3.5 text-[#667085] absolute left-2.5 top-2.5" />
            </div>
            <button
              type="submit"
              className="px-3 py-1.5 rounded-lg bg-[#FFF3C4] border border-[#F4B400] text-[#1F2933] text-xs font-bold font-mono hover:bg-[#F4B400] transition-colors"
            >
              Filter
            </button>
          </form>
        </div>
      </div>

      {/* Main Table / State View */}
      {isLoading ? (
        <LoadingState message="Querying PostgreSQL Enterprise Audit Trail..." />
      ) : error ? (
        <ErrorState
          title="Audit Logs Unavailable"
          message={error}
          onRetry={() => fetchLogs(page)}
        />
      ) : logs.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-xs space-y-3">
          <FileText className="w-10 h-10 text-[#667085] mx-auto opacity-40" />
          <h3 className="text-sm font-bold text-[#1F2933] font-mono">No Audit Records Found</h3>
          <p className="text-xs text-[#667085] max-w-sm mx-auto">
            No administrative operations or governance events match the current filter criteria.
          </p>
        </div>
      ) : (
        <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#1F2933] font-mono">
              Recorded Events ({total} Total Records)
            </h3>
            <span className="text-xs text-[#667085] font-mono">
              Page {page} of {totalPages}
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-[#E5E7EB]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FFFDF5] text-[#667085] uppercase tracking-wider font-mono text-[10px] border-b border-[#E5E7EB]">
                <tr>
                  <th className="px-4 py-3">Audit ID</th>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">Actor / User</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Resource</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#FFFDF5] transition-colors">
                    <td className="px-4 py-3.5 font-mono text-[#D99A00] font-bold text-[11px] whitespace-nowrap">
                      {log.id}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-[#667085] text-[11px] whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-[11px] text-[#1F2933]">
                      {log.user_email || log.actor || "System"}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#FFF3C4] text-[#1F2933] border border-[#F4B400]/40">
                        {log.user_role || "SYSTEM"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-[#1F2933]">
                      {log.action || log.action_type}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-[11px] text-[#667085]">
                      {log.resource_type ? `${log.resource_type}${log.resource_id ? `:${log.resource_id}` : ''}` : 'N/A'}
                    </td>
                    <td className="px-4 py-3.5 text-[#667085] text-[11px] max-w-sm truncate" title={log.description || log.details}>
                      {log.description || log.details}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                          (log.result_status || "SUCCESS") === "SUCCESS"
                            ? "bg-emerald-50 text-[#22C55E] border border-emerald-200"
                            : "bg-rose-50 text-[#EF4444] border border-rose-200"
                        }`}
                      >
                        {log.result_status || "SUCCESS"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between pt-2">
            <div className="text-xs text-[#667085] font-mono">
              Showing {(page - 1) * pageSize + 1} - {Math.min(page * pageSize, total)} of {total} records
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1}
                className="p-1.5 rounded-lg border border-[#E5E7EB] hover:bg-[#FFF3C4] disabled:opacity-40 disabled:hover:bg-transparent transition-all cursor-pointer disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4 text-[#1F2933]" />
              </button>
              <span className="text-xs font-mono font-bold text-[#1F2933] px-2">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages}
                className="p-1.5 rounded-lg border border-[#E5E7EB] hover:bg-[#FFF3C4] disabled:opacity-40 disabled:hover:bg-transparent transition-all cursor-pointer disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4 text-[#1F2933]" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
