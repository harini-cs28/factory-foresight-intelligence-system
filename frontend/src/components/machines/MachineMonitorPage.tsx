import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { machineApi } from "../../api/machineApi";
import { MachineItem, DashboardOverviewResponse } from "../../types/machine";
import {
  Activity,
  AlertTriangle,
  AlertOctagon,
  Clock,
  Search,
  Filter,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  Cpu,
  Layers,
  Shield,
  ArrowUpDown,
} from "lucide-react";

export const MachineMonitorPage: React.FC = () => {
  const navigate = useNavigate();
  const [machines, setMachines] = useState<MachineItem[]>([]);
  const [overview, setOverview] = useState<DashboardOverviewResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filter and Sort states
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [lineFilter, setLineFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"risk" | "rul" | "id">("risk");

  const fetchMachineData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [machinesData, overviewData] = await Promise.all([
        machineApi.getMachines(),
        machineApi.getDashboardOverview(),
      ]);
      setMachines(machinesData);
      setOverview(overviewData);
    } catch (err: any) {
      setError(
        err?.response?.data?.detail || "Unable to load machine data."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMachineData();
  }, []);

  // Critical machines list from overview
  const criticalMachinesList = overview?.critical_machines || [];

  // Summary counts calculated from real data
  const totalMachines = overview?.total_machines || machines.length;
  const criticalCount = overview
    ? overview.critical_count
    : machines.filter(
        (m) =>
          m.latest_prediction?.health_status === "CRITICAL" ||
          criticalMachinesList.includes(m.machine_id)
      ).length;
  const atRiskCount = overview
    ? overview.at_risk_count
    : machines.filter((m) => m.latest_prediction?.health_status === "AT_RISK").length;
  const healthyCount = overview
    ? overview.healthy_count
    : machines.filter(
        (m) =>
          m.latest_prediction?.health_status === "HEALTHY" ||
          !m.latest_prediction?.health_status
      ).length;

  // Extract distinct production lines for filter
  const productionLines = Array.from(
    new Set(machines.map((m) => m.production_line).filter(Boolean))
  ).sort();

  // Filter machines
  const filteredMachines = machines.filter((m) => {
    const searchLower = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !searchTerm ||
      m.machine_id.toLowerCase().includes(searchLower) ||
      m.process.toLowerCase().includes(searchLower) ||
      m.production_line.toLowerCase().includes(searchLower);

    const isCrit =
      m.latest_prediction?.health_status === "CRITICAL" ||
      criticalMachinesList.includes(m.machine_id);
    const isAtRisk = m.latest_prediction?.health_status === "AT_RISK";
    const status = isCrit ? "CRITICAL" : isAtRisk ? "AT_RISK" : "HEALTHY";

    const matchesStatus =
      statusFilter === "ALL" || status.toUpperCase() === statusFilter.toUpperCase();

    const matchesLine = lineFilter === "ALL" || m.production_line === lineFilter;

    return matchesSearch && matchesStatus && matchesLine;
  });

  // Sort machines
  const sortedMachines = [...filteredMachines].sort((a, b) => {
    const aCrit =
      a.latest_prediction?.health_status === "CRITICAL" ||
      criticalMachinesList.includes(a.machine_id);
    const bCrit =
      b.latest_prediction?.health_status === "CRITICAL" ||
      criticalMachinesList.includes(b.machine_id);

    const aAtRisk = a.latest_prediction?.health_status === "AT_RISK";
    const bAtRisk = b.latest_prediction?.health_status === "AT_RISK";

    const aStatusRank = aCrit ? 3 : aAtRisk ? 2 : 1;
    const bStatusRank = bCrit ? 3 : bAtRisk ? 2 : 1;

    const aFailProb = a.latest_prediction ? a.latest_prediction.failure_probability : 0;
    const bFailProb = b.latest_prediction ? b.latest_prediction.failure_probability : 0;

    const aRul = a.latest_prediction ? a.latest_prediction.predicted_rul : 999;
    const bRul = b.latest_prediction ? b.latest_prediction.predicted_rul : 999;

    if (sortBy === "risk") {
      // 1. Critical > At Risk > Healthy
      if (bStatusRank !== aStatusRank) return bStatusRank - aStatusRank;
      // 2. Higher failure probability first
      if (bFailProb !== aFailProb) return bFailProb - aFailProb;
      // 3. Lower RUL first
      return aRul - bRul;
    }

    if (sortBy === "rul") {
      return aRul - bRul;
    }

    if (sortBy === "id") {
      return a.machine_id.localeCompare(b.machine_id);
    }

    return 0;
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="pb-4 border-b border-[#E5E7EB] space-y-2">
          <div className="h-8 w-64 bg-gray-200 rounded-lg animate-pulse" />
          <div className="h-4 w-96 bg-gray-100 rounded-lg animate-pulse" />
        </div>

        {/* Summary Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-5 rounded-[14px] bg-[#FFFFFF] border border-[#E5E7EB] h-28 animate-pulse space-y-3">
              <div className="h-4 w-24 bg-gray-200 rounded" />
              <div className="h-8 w-16 bg-gray-300 rounded" />
            </div>
          ))}
        </div>

        {/* Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="p-5 rounded-[14px] bg-[#FFFFFF] border border-[#E5E7EB] h-52 animate-pulse space-y-4">
              <div className="flex justify-between">
                <div className="h-6 w-20 bg-gray-200 rounded" />
                <div className="h-6 w-20 bg-gray-200 rounded-full" />
              </div>
              <div className="h-4 w-32 bg-gray-100 rounded" />
              <div className="grid grid-cols-2 gap-3 pt-3">
                <div className="h-10 bg-gray-100 rounded" />
                <div className="h-10 bg-gray-100 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-white p-12 text-center shadow-xs">
        <AlertOctagon size={36} className="mx-auto text-rose-500 mb-3" />
        <h3 className="text-base font-bold text-[#1F2933]">Unable to load machine data.</h3>
        <p className="text-xs text-[#667085] mt-1 mb-5">{error}</p>
        <button
          onClick={fetchMachineData}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#F4B400] hover:bg-[#D99A00] text-xs font-bold text-[#1F2933] shadow-xs transition-all cursor-pointer"
        >
          <RefreshCw size={14} />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  if (machines.length === 0) {
    return (
      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-12 text-center shadow-xs">
        <Cpu size={36} className="mx-auto text-[#667085] mb-3" />
        <h3 className="text-base font-bold text-[#1F2933]">No machine data available.</h3>
        <p className="text-xs text-[#667085] mt-1">
          No active machine assets are currently recorded in the system.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 2 & 6. PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E7EB]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1F2933] tracking-tight">
            MACHINE MONITOR
          </h1>
          <p className="text-xs sm:text-sm text-[#667085] mt-1">
            Monitor machine health, failure risk, and remaining useful life.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchMachineData}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#FFFFFF] hover:bg-[#FFF3C4] border border-[#E5E7EB] hover:border-[#F4B400] text-[#1F2933] text-xs font-semibold transition-all shadow-xs cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#D99A00]" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* 7-8. MACHINE SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* TOTAL MACHINES */}
        <div className="p-5 rounded-[14px] bg-[#FFFFFF] border border-[#E5E7EB] shadow-[0_2px_8px_rgba(31,41,51,0.05)] flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#667085]">
              TOTAL MACHINES
            </span>
            <div className="w-10 h-10 rounded-xl bg-[#FFFDF5] border border-[#E5E7EB] flex items-center justify-center shrink-0">
              <Cpu className="w-5 h-5 text-[#1F2933]" />
            </div>
          </div>
          <div className="space-y-0.5">
            <div className="text-3xl font-bold tracking-tight text-[#1F2933]">
              {totalMachines}
            </div>
            <p className="text-xs text-[#667085] font-medium">Active textile assets</p>
          </div>
        </div>

        {/* HEALTHY */}
        <div className="p-5 rounded-[14px] bg-[#FFFFFF] border border-[#E5E7EB] shadow-[0_2px_8px_rgba(31,41,51,0.05)] flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#667085]">
              HEALTHY
            </span>
            <div className="w-10 h-10 rounded-xl bg-[#DCFCE7] border border-[#22C55E]/30 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 text-[#22C55E]" />
            </div>
          </div>
          <div className="space-y-0.5">
            <div className="text-3xl font-bold tracking-tight text-[#22C55E]">
              {healthyCount}
            </div>
            <p className="text-xs text-[#667085] font-medium">Nominal operational state</p>
          </div>
        </div>

        {/* AT RISK */}
        <div className="p-5 rounded-[14px] bg-[#FFFFFF] border border-[#E5E7EB] shadow-[0_2px_8px_rgba(31,41,51,0.05)] flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#667085]">
              AT RISK
            </span>
            <div className="w-10 h-10 rounded-xl bg-[#FEF3C7] border border-[#F59E0B]/30 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-[#F59E0B]" />
            </div>
          </div>
          <div className="space-y-0.5">
            <div className="text-3xl font-bold tracking-tight text-[#F59E0B]">
              {atRiskCount}
            </div>
            <p className="text-xs text-[#667085] font-medium">Elevated risk state</p>
          </div>
        </div>

        {/* CRITICAL */}
        <div className="p-5 rounded-[14px] bg-[#FFFFFF] border border-[#E5E7EB] shadow-[0_2px_8px_rgba(31,41,51,0.05)] flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#667085]">
              CRITICAL
            </span>
            <div className="w-10 h-10 rounded-xl bg-[#FEE2E2] border border-[#EF4444]/30 flex items-center justify-center shrink-0">
              <AlertOctagon className="w-5 h-5 text-[#EF4444]" />
            </div>
          </div>
          <div className="space-y-0.5">
            <div className="text-3xl font-bold tracking-tight text-[#EF4444]">
              {criticalCount}
            </div>
            <p className="text-xs text-[#667085] font-medium">Immediate attention required</p>
          </div>
        </div>
      </div>

      {/* 9-11. SEARCH AND FILTER TOOLBAR */}
      <div className="p-4 rounded-[14px] bg-[#FFFFFF] border border-[#E5E7EB] shadow-[0_2px_8px_rgba(31,41,51,0.05)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#667085]">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search machine, process or line..."
            className="w-full pl-10 pr-4 py-2 bg-[#FFFFFF] border border-[#E5E7EB] focus:border-[#F4B400] focus:ring-2 focus:ring-[#F4B400]/20 rounded-[10px] text-xs text-[#1F2933] placeholder-[#667085] transition-all outline-none"
          />
        </div>

        {/* Filters and Sort */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Health Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-[#667085]" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-[10px] px-3 py-1.5 text-xs text-[#1F2933] focus:border-[#F4B400] outline-none cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="CRITICAL">Critical Only</option>
              <option value="AT_RISK">At Risk Only</option>
              <option value="HEALTHY">Healthy Only</option>
            </select>
          </div>

          {/* Production Line Filter */}
          <div className="flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-[#667085]" />
            <select
              value={lineFilter}
              onChange={(e) => setLineFilter(e.target.value)}
              className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-[10px] px-3 py-1.5 text-xs text-[#1F2933] focus:border-[#F4B400] outline-none cursor-pointer"
            >
              <option value="ALL">All Lines</option>
              {productionLines.map((line) => (
                <option key={line} value={line}>
                  {line}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By Control */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#667085]" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-[10px] px-3 py-1.5 text-xs text-[#1F2933] focus:border-[#F4B400] outline-none cursor-pointer"
            >
              <option value="risk">Sort: Priority Risk</option>
              <option value="rul">Sort: Lowest RUL</option>
              <option value="id">Sort: Machine ID</option>
            </select>
          </div>
        </div>
      </div>

      {/* 12-20. MACHINE LIST / GRID */}
      {sortedMachines.length === 0 ? (
        <div className="p-12 rounded-[14px] bg-[#FFFFFF] border border-[#E5E7EB] text-center shadow-xs">
          <Search className="w-8 h-8 text-[#667085] mx-auto mb-2" />
          <h4 className="text-base font-bold text-[#1F2933]">No machines found</h4>
          <p className="text-xs text-[#667085] mt-1 max-w-sm mx-auto">
            Try a different machine ID, process, or production line filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {sortedMachines.map((machine) => {
            const pred = machine.latest_prediction;
            const isCrit =
              pred?.health_status === "CRITICAL" ||
              overview?.critical_machines?.includes(machine.machine_id);
            const isAtRisk = pred?.health_status === "AT_RISK";
            const healthStatus = isCrit ? "CRITICAL" : isAtRisk ? "AT_RISK" : "HEALTHY";

            const failProbNum = pred ? pred.failure_probability * 100 : 0;
            const failProbFormatted = pred ? `${Math.round(failProbNum)}%` : "—";
            const rulFormatted = pred ? `${Math.round(pred.predicted_rul)} cycles` : "—";
            const isRulCriticallyLow = pred && pred.predicted_rul <= 5;

            const statusBadge =
              healthStatus === "CRITICAL"
                ? { bg: "bg-[#FEE2E2]", text: "text-[#EF4444]", label: "CRITICAL" }
                : healthStatus === "AT_RISK"
                ? { bg: "bg-[#FEF3C7]", text: "text-[#F59E0B]", label: "AT RISK" }
                : { bg: "bg-[#DCFCE7]", text: "text-[#22C55E]", label: "HEALTHY" };

            const riskValueColor =
              healthStatus === "CRITICAL"
                ? "text-[#EF4444]"
                : healthStatus === "AT_RISK"
                ? "text-[#F59E0B]"
                : "text-[#1F2933]";

            const rulValueColor =
              isRulCriticallyLow
                ? "text-[#EF4444]"
                : "text-[#1F2933]";

            const criticalityStyle =
              machine.criticality?.toUpperCase() === "CRITICAL"
                ? "bg-[#FEE2E2] text-[#EF4444]"
                : machine.criticality?.toUpperCase() === "HIGH"
                ? "bg-[#FEF3C7] text-[#F59E0B]"
                : "bg-[#F8F9FA] text-[#667085]";

            return (
              <div
                key={machine.machine_id}
                className="p-5 rounded-[14px] bg-[#FFFFFF] border border-[#E5E7EB] hover:border-[#F4B400] shadow-[0_2px_8px_rgba(31,41,51,0.05)] transition-all flex flex-col justify-between space-y-4 group hover:shadow-md"
              >
                <div>
                  {/* TOP: Machine ID, Line, Status */}
                  <div className="flex items-start justify-between gap-2 pb-3 border-b border-[#E5E7EB]">
                    <div>
                      <h3 className="text-lg font-bold text-[#1F2933] tracking-tight">
                        {machine.machine_id}
                      </h3>
                      <p className="text-xs text-[#667085] mt-0.5">
                        {machine.process} • {machine.production_line}
                      </p>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${statusBadge.bg} ${statusBadge.text}`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {statusBadge.label}
                    </span>
                  </div>

                  {/* FAILURE RISK & RUL */}
                  <div className="grid grid-cols-2 gap-3 py-3 text-xs">
                    <div className="p-3 rounded-xl bg-[#FFFDF5] border border-[#E5E7EB]">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-[#667085] block mb-0.5">
                        FAILURE RISK
                      </span>
                      <span className={`text-2xl font-bold tracking-tight ${riskValueColor}`}>
                        {failProbFormatted}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-[#FFFDF5] border border-[#E5E7EB]">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-[#667085] block mb-0.5">
                        RUL
                      </span>
                      <span className={`text-2xl font-bold tracking-tight ${rulValueColor}`}>
                        {rulFormatted}
                      </span>
                    </div>
                  </div>

                  {/* CRITICALITY */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#667085]">
                      CRITICALITY
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${criticalityStyle}`}
                    >
                      {machine.criticality || "MEDIUM"}
                    </span>
                  </div>
                </div>

                {/* BOTTOM: View Intelligence Link */}
                <div className="pt-3 border-t border-[#E5E7EB] flex items-center justify-end">
                  <Link
                    to={`/intelligence/${machine.machine_id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#D99A00] hover:text-[#F4B400] transition-colors"
                  >
                    <span>View Intelligence</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#F4B400] group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
