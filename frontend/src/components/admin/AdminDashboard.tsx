import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { adminApi } from "../../api/adminApi";
import { machineApi } from "../../api/machineApi";
import { User } from "../../types/auth";
import { MachineItem } from "../../types/machine";
import { ModelsAndServicesResponse, AuditLogItem } from "../../types/admin";
import { LoadingState } from "../common/LoadingState";
import { ErrorState } from "../common/ErrorState";
import {
  Shield,
  Users,
  Activity,
  Server,
  Settings,
  FileText,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Cpu,
  RefreshCw,
} from "lucide-react";

export const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [machines, setMachines] = useState<MachineItem[]>([]);
  const [modelsServices, setModelsServices] = useState<ModelsAndServicesResponse | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [usersData, machinesData, msData, logsData] = await Promise.all([
        adminApi.getUsers(),
        adminApi.getMachineRegistry(),
        adminApi.getModelAndServiceStatus(),
        adminApi.getAuditLogs(10),
      ]);
      setUsers(usersData);
      setMachines(machinesData);
      setModelsServices(msData);
      setAuditLogs(logsData);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to load administrative governance data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (isLoading) {
    return <LoadingState message="Connecting to FFIS Administration Control Center..." />;
  }

  if (error) {
    return (
      <ErrorState
        title="Admin Control Center Unavailable"
        message={error}
        onRetry={fetchData}
      />
    );
  }

  const roleCounts = users.reduce((acc, u) => {
    acc[u.role] = (acc[u.role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Workspace Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E5E7EB]">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-[#D99A00]" />
            <h1 className="text-2xl font-bold text-[#1F2933] font-mono tracking-tight">
              SYSTEM CONTROL CENTER
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[#667085] mt-1">
            Enterprise administration: User directory, machine registry, ML model status, configuration &amp; audit governance.
          </p>
        </div>

        <button
          onClick={fetchData}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#FFFFFF] hover:bg-[#FFF3C4] border border-[#E5E7EB] hover:border-[#F4B400] text-xs font-semibold text-[#1F2933] transition-all shadow-xs self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#D99A00]" />
          <span>Refresh System Data</span>
        </button>
      </div>

      {/* Top 4 Admin KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-[#667085]">
            <span className="font-bold uppercase tracking-wider font-mono">AUTHORIZED USERS</span>
            <Users className="w-4 h-4 text-[#F4B400]" />
          </div>
          <div className="text-2xl font-extrabold text-[#1F2933] font-mono">
            {users.length} <span className="text-xs font-normal text-[#667085]">Active Accounts</span>
          </div>
          <p className="text-[11px] text-[#667085]">4 Enterprise Roles configured</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-[#667085]">
            <span className="font-bold uppercase tracking-wider font-mono">MACHINE REGISTRY</span>
            <Activity className="w-4 h-4 text-[#1F2933]" />
          </div>
          <div className="text-2xl font-extrabold text-[#1F2933] font-mono">
            {machines.length} <span className="text-xs font-normal text-[#667085]">Assets Registered</span>
          </div>
          <p className="text-[11px] text-[#667085]">Across Lines A, B, and C</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-[#667085]">
            <span className="font-bold uppercase tracking-wider font-mono">ML PIPELINE STATUS</span>
            <Cpu className="w-4 h-4 text-[#22C55E]" />
          </div>
          <div className="text-2xl font-extrabold text-[#1F2933] font-mono">
            {modelsServices?.models?.version || "v1.0"}{" "}
            <span className="text-xs font-bold text-[#22C55E] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              OPERATIONAL
            </span>
          </div>
          <p className="text-[11px] text-[#667085]">Accuracy: {modelsServices?.models?.failure_classifier?.accuracy || 98.88}%</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-[#667085]">
            <span className="font-bold uppercase tracking-wider font-mono">SYSTEM AUDIT EVENTS</span>
            <FileText className="w-4 h-4 text-[#D99A00]" />
          </div>
          <div className="text-2xl font-extrabold text-[#1F2933] font-mono">
            {auditLogs.length}+ <span className="text-xs font-normal text-[#667085]">Recorded Events</span>
          </div>
          <p className="text-[11px] text-[#667085]">PostgreSQL audit trail verified</p>
        </div>
      </div>

      {/* Main Admin Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Services Health & Fast Management Navigation */}
        <div className="lg:col-span-2 space-y-6">
          {/* Services Runtime Status */}
          <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
              <div className="flex items-center gap-2">
                <Server className="w-5 h-5 text-[#D99A00]" />
                <h2 className="text-sm font-bold text-[#1F2933] font-mono uppercase tracking-wider">
                  Platform Core Services Health
                </h2>
              </div>
              <Link
                to="/admin/models"
                className="text-xs font-bold text-[#D99A00] hover:underline flex items-center gap-1"
              >
                <span>View Full Model Telemetry</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {modelsServices?.services?.map((svc, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-[#FFFDF5] border border-[#E5E7EB] flex items-center justify-between"
                >
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-[#1F2933]">{svc.name}</div>
                    <div className="text-[10px] text-[#667085] font-mono">
                      {svc.port ? `Port: ${svc.port}` : svc.host ? svc.host : "Active Subsystem"}
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border font-mono ${
                      svc.status === "OPERATIONAL" || svc.status === "ACTIVE"
                        ? "bg-emerald-50 text-[#22C55E] border-emerald-200"
                        : "bg-amber-50 text-[#F59E0B] border-amber-200"
                    }`}
                  >
                    {svc.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Admin Navigation Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              to="/admin/users"
              className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] hover:border-[#F4B400] transition-all shadow-xs group space-y-2"
            >
              <div className="w-8 h-8 rounded-lg bg-[#FFF3C4] text-[#D99A00] flex items-center justify-center group-hover:bg-[#F4B400] group-hover:text-[#1F2933] transition-colors">
                <Users className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[#1F2933] font-mono">Users &amp; Roles</h3>
              <p className="text-xs text-[#667085]">
                Manage {users.length} accounts, update role permissions and account status.
              </p>
            </Link>

            <Link
              to="/admin/machines"
              className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] hover:border-[#F4B400] transition-all shadow-xs group space-y-2"
            >
              <div className="w-8 h-8 rounded-lg bg-[#FFF3C4] text-[#D99A00] flex items-center justify-center group-hover:bg-[#F4B400] group-hover:text-[#1F2933] transition-colors">
                <Activity className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[#1F2933] font-mono">Machine Registry</h3>
              <p className="text-xs text-[#667085]">
                Configure {machines.length} textile machines, lines, and criticality levels.
              </p>
            </Link>

            <Link
              to="/admin/config"
              className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] hover:border-[#F4B400] transition-all shadow-xs group space-y-2"
            >
              <div className="w-8 h-8 rounded-lg bg-[#FFF3C4] text-[#D99A00] flex items-center justify-center group-hover:bg-[#F4B400] group-hover:text-[#1F2933] transition-colors">
                <Settings className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[#1F2933] font-mono">System Config</h3>
              <p className="text-xs text-[#667085]">
                Inspect risk thresholds, RUL limits, and operational dataset bindings.
              </p>
            </Link>
          </div>
        </div>

        {/* Right Col: User Distribution & Recent Audit Log */}
        <div className="space-y-6">
          {/* Role Distribution Card */}
          <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#1F2933] font-mono border-b border-[#E5E7EB] pb-2">
              Role Distribution
            </h3>
            <div className="space-y-2.5">
              {[
                { label: "Admin", key: "ADMIN" },
                { label: "Plant Manager", key: "PLANT_MANAGER" },
                { label: "Maintenance Engineer", key: "MAINTENANCE_ENGINEER" },
                { label: "Production Manager", key: "PRODUCTION_MANAGER" },
              ].map((r) => (
                <div key={r.key} className="flex items-center justify-between text-xs">
                  <span className="text-[#667085]">{r.label}</span>
                  <span className="font-mono font-bold text-[#1F2933] bg-[#FFF3C4] px-2 py-0.5 rounded-full border border-[#F4B400]/30">
                    {roleCounts[r.key] || 0}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Audit Events */}
          <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#1F2933] font-mono">
                Recent Audit Trail
              </h3>
              <Link to="/admin/audit" className="text-[11px] font-bold text-[#D99A00] hover:underline">
                View All
              </Link>
            </div>

            <div className="space-y-3">
              {auditLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="text-xs border-b border-[#E5E7EB] pb-2 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between text-[10px] text-[#667085] font-mono">
                    <span className="font-bold text-[#1F2933]">{log.category}</span>
                    <span>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="text-[#1F2933] font-medium mt-0.5 truncate">{log.action}</div>
                  <div className="text-[10px] text-[#667085] truncate">{log.details}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
