import React, { useState, useEffect } from "react";
import { authApi } from "../../api/authApi";
import { User } from "../../types/auth";
import { LoadingState } from "../common/LoadingState";
import { ErrorState } from "../common/ErrorState";
import { Shield, Users, CheckCircle2, XCircle, RefreshCw, Key } from "lucide-react";

export const AdminPanel: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await authApi.getAllUsers();
      setUsers(data);
    } catch (err: any) {
      setError(
        err?.response?.data?.detail || "Unable to fetch registered users from backend."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (isLoading) {
    return <LoadingState message="Loading system user registry from PostgreSQL..." />;
  }

  if (error) {
    return (
      <ErrorState
        title="Admin User Management Failure"
        message={error}
        onRetry={fetchUsers}
      />
    );
  }

  const getRoleStyle = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-[#FFF3C4] border-[#F4B400]/40 text-[#1F2933]";
      case "MAINTENANCE_ENGINEER":
        return "bg-[#FFFDF5] border-[#E5E7EB] text-[#1F2933]";
      case "PRODUCTION_MANAGER":
        return "bg-[#FFF3C4] border-[#F4B400]/40 text-[#1F2933]";
      case "PLANT_MANAGER":
        return "bg-emerald-50 border-emerald-200 text-emerald-800";
      default:
        return "bg-[#F8F9FA] border-[#E5E7EB] text-[#667085]";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E7EB]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-5 h-5 text-[#D99A00]" />
            <h1 className="text-xl font-bold text-[#1F2933] font-mono tracking-wide">
              SYSTEM ADMINISTRATION &amp; ACCESS CONTROL
            </h1>
          </div>
          <p className="text-xs text-[#667085]">
            User credentials and role authorizations for textile plant operations.
          </p>
        </div>

        <button
          onClick={fetchUsers}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#FFFFFF] hover:bg-[#FFF3C4] border border-[#E5E7EB] hover:border-[#F4B400] text-[#1F2933] text-xs font-semibold transition-all shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#D99A00]" />
          <span>Refresh Users</span>
        </button>
      </div>

      {/* Users Registry Table */}
      <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#D99A00]" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#1F2933] font-mono">
              Authorized Personnel ({users.length} Users)
            </h3>
          </div>
          <span className="text-xs text-[#667085]">
            User Directory
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-[#E5E7EB]">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E5E7EB] text-[#667085] uppercase tracking-wider bg-[#FFFDF5] font-semibold">
                <th className="p-3">User ID</th>
                <th className="p-3">Full Name</th>
                <th className="p-3">Email Address</th>
                <th className="p-3">Role Authorization</th>
                <th className="p-3">Account Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-[#FFFDF5] transition-colors text-[#1F2933]">
                  <td className="p-3 font-bold font-mono text-[#D99A00]">#{u.id}</td>
                  <td className="p-3 font-semibold text-[#1F2933]">{u.name}</td>
                  <td className="p-3 text-[#667085] font-mono">{u.email}</td>
                  <td className="p-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-lg border text-[10px] font-bold uppercase tracking-wide ${getRoleStyle(
                        u.role
                      )}`}
                    >
                      {u.role.replace("_", " ")}
                    </span>
                  </td>
                  <td className="p-3">
                    {u.is_active ? (
                      <span className="inline-flex items-center gap-1.5 text-emerald-700 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        ACTIVE
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-rose-600 font-semibold">
                        <XCircle className="w-3.5 h-3.5 text-rose-600" />
                        DEACTIVATED
                      </span>
                    )}
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
