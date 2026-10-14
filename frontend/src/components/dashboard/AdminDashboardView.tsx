import React from "react";
import { Link } from "react-router-dom";
import { DashboardOverviewResponse, MachineItem } from "../../types/machine";
import { SummaryCard } from "./SummaryCard";
import {
  Shield,
  Users,
  Cpu,
  Settings,
  FileText,
  Activity,
  ArrowRight,
  CheckCircle2,
  Lock,
  Server,
} from "lucide-react";

interface AdminDashboardViewProps {
  overview: DashboardOverviewResponse;
  machines: MachineItem[];
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  overview,
  machines,
}) => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1F2933] tracking-tight">
            SYSTEM CONTROL CENTER
          </h1>
          <p className="text-xs sm:text-sm text-[#667085] mt-1">
            Enterprise platform administration, user role assignments, machine configuration, and audit governance.
          </p>
        </div>

        <Link
          to="/admin"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#F4B400] hover:bg-[#D99A00] text-xs font-bold text-[#1F2933] transition-all shadow-xs self-start sm:self-auto"
        >
          <Shield className="w-4 h-4" />
          <span>Users &amp; Roles Management</span>
        </Link>
      </div>

      {/* TOP 4 ADMIN METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="Total Registered Users"
          value="4 Enterprise Roles"
          subtitle="Manager, Eng, Prod, Admin"
          icon={<Users className="w-4 h-4 text-[#F4B400]" />}
          variant="yellow"
        />

        <SummaryCard
          title="Monitored Machinery"
          value={overview.total_machines || machines.length}
          subtitle="Registered Sensor Nodes"
          icon={<Activity className="w-4 h-4 text-[#1F2933]" />}
          variant="default"
        />

        <SummaryCard
          title="AI Inference Pipeline"
          value="Active"
          subtitle="Failure &amp; RUL Estimator"
          icon={<Cpu className="w-4 h-4 text-emerald-600" />}
          variant="healthy"
        />

        <SummaryCard
          title="Access Governance"
          value="Enforced"
          subtitle="Role-Based Access Control"
          icon={<Lock className="w-4 h-4 text-emerald-600" />}
          variant="healthy"
        />
      </div>

      {/* PLATFORM ADMINISTRATION MODULES */}
      <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
          <div>
            <h2 className="text-lg font-bold text-[#1F2933]">
              Platform Administration Modules
            </h2>
            <p className="text-xs text-[#667085] mt-0.5">
              Access system configuration, security protocols, and operational audit logs.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            to="/admin"
            className="p-5 rounded-xl bg-[#FFFDF5] border border-[#E5E7EB] hover:border-[#F4B400] transition-all shadow-xs flex flex-col justify-between space-y-3 group"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-[#FFF3C4] border border-[#F4B400]/40 flex items-center justify-center text-[#1F2933]">
                <Users className="w-5 h-5 text-[#1F2933]" />
              </div>
              <ArrowRight className="w-4 h-4 text-[#667085] group-hover:text-[#D99A00] group-hover:translate-x-1 transition-transform" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1F2933]">Users &amp; Roles</h3>
              <p className="text-xs text-[#667085] mt-1 leading-relaxed">
                Manage user credentials, role assignments, and department permissions.
              </p>
            </div>
          </Link>

          <Link
            to="/factory"
            className="p-5 rounded-xl bg-[#FFFDF5] border border-[#E5E7EB] hover:border-[#F4B400] transition-all shadow-xs flex flex-col justify-between space-y-3 group"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-[#FFF3C4] border border-[#F4B400]/40 flex items-center justify-center text-[#1F2933]">
                <Activity className="w-5 h-5 text-[#1F2933]" />
              </div>
              <ArrowRight className="w-4 h-4 text-[#667085] group-hover:text-[#D99A00] group-hover:translate-x-1 transition-transform" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1F2933]">Machine Registry</h3>
              <p className="text-xs text-[#667085] mt-1 leading-relaxed">
                Configure machinery sensor mappings, nominal thresholds, and criticalities.
              </p>
            </div>
          </Link>

          <Link
            to="/admin"
            className="p-5 rounded-xl bg-[#FFFDF5] border border-[#E5E7EB] hover:border-[#F4B400] transition-all shadow-xs flex flex-col justify-between space-y-3 group"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-[#FFF3C4] border border-[#F4B400]/40 flex items-center justify-center text-[#1F2933]">
                <Cpu className="w-5 h-5 text-[#1F2933]" />
              </div>
              <ArrowRight className="w-4 h-4 text-[#667085] group-hover:text-[#D99A00] group-hover:translate-x-1 transition-transform" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1F2933]">AI Model Status</h3>
              <p className="text-xs text-[#667085] mt-1 leading-relaxed">
                Inspect active inference engines, model artifacts, and evaluation parameters.
              </p>
            </div>
          </Link>

          <Link
            to="/admin"
            className="p-5 rounded-xl bg-[#FFFDF5] border border-[#E5E7EB] hover:border-[#F4B400] transition-all shadow-xs flex flex-col justify-between space-y-3 group"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-[#FFF3C4] border border-[#F4B400]/40 flex items-center justify-center text-[#1F2933]">
                <Settings className="w-5 h-5 text-[#1F2933]" />
              </div>
              <ArrowRight className="w-4 h-4 text-[#667085] group-hover:text-[#D99A00] group-hover:translate-x-1 transition-transform" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1F2933]">System Configuration</h3>
              <p className="text-xs text-[#667085] mt-1 leading-relaxed">
                Adjust alert trigger thresholds, polling frequencies, and notification rules.
              </p>
            </div>
          </Link>

          <Link
            to="/admin"
            className="p-5 rounded-xl bg-[#FFFDF5] border border-[#E5E7EB] hover:border-[#F4B400] transition-all shadow-xs flex flex-col justify-between space-y-3 group"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-[#FFF3C4] border border-[#F4B400]/40 flex items-center justify-center text-[#1F2933]">
                <FileText className="w-5 h-5 text-[#1F2933]" />
              </div>
              <ArrowRight className="w-4 h-4 text-[#667085] group-hover:text-[#D99A00] group-hover:translate-x-1 transition-transform" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1F2933]">Audit Logs</h3>
              <p className="text-xs text-[#667085] mt-1 leading-relaxed">
                Review authenticated user actions, maintenance schedules, and role activity.
              </p>
            </div>
          </Link>

          <Link
            to="/live-monitoring"
            className="p-5 rounded-xl bg-[#FFFDF5] border border-[#E5E7EB] hover:border-[#F4B400] transition-all shadow-xs flex flex-col justify-between space-y-3 group"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-[#FFF3C4] border border-[#F4B400]/40 flex items-center justify-center text-[#1F2933]">
                <Server className="w-5 h-5 text-[#1F2933]" />
              </div>
              <ArrowRight className="w-4 h-4 text-[#667085] group-hover:text-[#D99A00] group-hover:translate-x-1 transition-transform" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1F2933]">Telemetry Simulation</h3>
              <p className="text-xs text-[#667085] mt-1 leading-relaxed">
                Live sensor streaming playback controls and testing harness.
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

