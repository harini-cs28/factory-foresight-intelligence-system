import React, { useState, useEffect } from "react";
import { adminApi } from "../../api/adminApi";
import { AuditLogItem } from "../../types/admin";
import { LoadingState } from "../common/LoadingState";
import { ErrorState } from "../common/ErrorState";
import {
  FileText,
  RefreshCw,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Info,
  Shield,
} from "lucide-react";

export const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");

  const fetchLogs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await adminApi.getAuditLogs(100);
      setLogs(data);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Unable to fetch administrative audit logs.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  if (isLoading) {
    return <LoadingState message="Querying PostgreSQL Enterprise Audit Trail..." />;
  }

  if (error && logs.length === 0) {
    return (
      <ErrorState
        title="Audit Logs Unavailable"
        message={error}
        onRetry={fetchLogs}
      />
    );
  }

  const filteredLogs = logs.filter((log) => {
    if (categoryFilter === "ALL") return true;
    return log.category === categoryFilter;
  });

  const categories = Array.from(new Set(logs.map((l) => l.category)));

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
            Chronological record of user registrations, alert acknowledgements, model predictions, and maintenance actions.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#FFFFFF] hover:bg-[#FFF3C4] border border-[#E5E7EB] hover:border-[#F4B400] text-[#1F2933] text-xs font-semibold transition-all shadow-xs cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#D99A00]" />
          <span>Refresh Logs</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-xs font-bold text-[#667085] uppercase tracking-wider font-mono mr-1">
          Category:
        </span>
        <button
          onClick={() => setCategoryFilter("ALL")}
          className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
            categoryFilter === "ALL"
              ? "bg-[#FFF3C4] text-[#1F2933] border border-[#F4B400]"
              : "bg-[#FFFFFF] text-[#667085] border border-[#E5E7EB] hover:bg-[#FFFDF5]"
          }`}
        >
          ALL ({logs.length})
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
              categoryFilter === cat
                ? "bg-[#FFF3C4] text-[#1F2933] border border-[#F4B400]"
                : "bg-[#FFFFFF] text-[#667085] border border-[#E5E7EB] hover:bg-[#FFFDF5]"
            }`}
          >
            {cat} ({logs.filter((l) => l.category === cat).length})
          </button>
        ))}
      </div>

      {/* Audit Log Table */}
      <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#1F2933] font-mono">
            Recorded Events ({filteredLogs.length} Records)
          </h3>
          <span className="text-xs text-[#667085]">Immutable Audit Trail</span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-[#E5E7EB]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FFFDF5] text-[#667085] uppercase tracking-wider font-mono text-[10px] border-b border-[#E5E7EB]">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Actor</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Event Details</th>
                <th className="px-4 py-3">Severity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[#FFFDF5] transition-colors">
                  <td className="px-4 py-3.5 font-mono text-[#667085] text-[11px] whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="px-4 py-3.5 font-mono text-[11px] font-bold text-[#1F2933]">
                    {log.category}
                  </td>
                  <td className="px-4 py-3.5 text-[#667085] font-mono text-[11px]">
                    {log.actor}
                  </td>
                  <td className="px-4 py-3.5 font-semibold text-[#1F2933]">
                    {log.action}
                  </td>
                  <td className="px-4 py-3.5 text-[#667085] text-[11px] max-w-xs truncate">
                    {log.details}
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                        log.severity === "CRITICAL"
                          ? "bg-rose-50 text-[#EF4444] border border-rose-200"
                          : log.severity === "WARNING"
                          ? "bg-amber-50 text-[#F59E0B] border border-amber-200"
                          : "bg-emerald-50 text-[#22C55E] border border-emerald-200"
                      }`}
                    >
                      {log.severity}
                    </span>
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
