import React, { useState, useEffect } from "react";
import { adminApi } from "../../api/adminApi";
import { User, UserRole } from "../../types/auth";
import { LoadingState } from "../common/LoadingState";
import { ErrorState } from "../common/ErrorState";
import {
  Users,
  Shield,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Edit2,
  Check,
  X,
  AlertCircle,
} from "lucide-react";

export const UsersRoles: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole>("MAINTENANCE_ENGINEER");
  const [selectedStatus, setSelectedStatus] = useState<boolean>(true);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await adminApi.getUsers();
      setUsers(data);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Unable to fetch registered users from backend.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleStartEdit = (user: User) => {
    setEditingUserId(user.id);
    setSelectedRole(user.role);
    setSelectedStatus(user.is_active);
    setSaveSuccess(null);
  };

  const handleCancelEdit = () => {
    setEditingUserId(null);
  };

  const handleSaveEdit = async (userId: number) => {
    try {
      const updated = await adminApi.updateUserRoleOrStatus(userId, {
        role: selectedRole,
        is_active: selectedStatus,
      });
      setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));
      setEditingUserId(null);
      setSaveSuccess(`Updated permissions for ${updated.email}`);
      setTimeout(() => setSaveSuccess(null), 4000);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to update user authorization.");
    }
  };

  if (isLoading) {
    return <LoadingState message="Loading PostgreSQL User and Role Registry..." />;
  }

  if (error && users.length === 0) {
    return (
      <ErrorState
        title="User Registry Unavailable"
        message={error}
        onRetry={fetchUsers}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E7EB]">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-[#D99A00]" />
            <h1 className="text-xl font-bold text-[#1F2933] font-mono tracking-tight">
              USERS &amp; ROLES MANAGEMENT
            </h1>
          </div>
          <p className="text-xs text-[#667085] mt-1">
            Enterprise user accounts, role authorizations, and account status governance.
          </p>
        </div>

        <button
          onClick={fetchUsers}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#FFFFFF] hover:bg-[#FFF3C4] border border-[#E5E7EB] hover:border-[#F4B400] text-[#1F2933] text-xs font-semibold transition-all shadow-xs cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#D99A00]" />
          <span>Refresh Directory</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{saveSuccess}</span>
        </div>
      )}

      {/* Table */}
      <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#1F2933] font-mono">
            Authorized Personnel Directory ({users.length} Users)
          </h3>
          <span className="text-xs text-[#667085]">PostgreSQL Authenticated Accounts</span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-[#E5E7EB]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FFFDF5] text-[#667085] uppercase tracking-wider font-mono text-[10px] border-b border-[#E5E7EB]">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">User Name</th>
                <th className="px-4 py-3">Email Address</th>
                <th className="px-4 py-3">Assigned Role</th>
                <th className="px-4 py-3">Account Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {users.map((u) => {
                const isEditing = editingUserId === u.id;
                return (
                  <tr key={u.id} className="hover:bg-[#FFFDF5] transition-colors">
                    <td className="px-4 py-3.5 font-mono text-[#667085]">#{u.id}</td>
                    <td className="px-4 py-3.5 font-bold text-[#1F2933]">{u.name}</td>
                    <td className="px-4 py-3.5 font-mono text-[#667085]">{u.email}</td>
                    <td className="px-4 py-3.5">
                      {isEditing ? (
                        <select
                          value={selectedRole}
                          onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                          className="px-2 py-1 bg-[#FFFFFF] border border-[#F4B400] rounded text-xs text-[#1F2933] font-mono outline-none"
                        >
                          <option value="ADMIN">ADMIN</option>
                          <option value="PLANT_MANAGER">PLANT_MANAGER</option>
                          <option value="MAINTENANCE_ENGINEER">MAINTENANCE_ENGINEER</option>
                          <option value="PRODUCTION_MANAGER">PRODUCTION_MANAGER</option>
                        </select>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono bg-[#FFF3C4] text-[#1F2933] border border-[#F4B400]/40">
                          {u.role.replace("_", " ")}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      {isEditing ? (
                        <select
                          value={selectedStatus ? "active" : "inactive"}
                          onChange={(e) => setSelectedStatus(e.target.value === "active")}
                          className="px-2 py-1 bg-[#FFFFFF] border border-[#F4B400] rounded text-xs text-[#1F2933] font-mono outline-none"
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          {u.is_active ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E]" />
                              <span className="text-[#22C55E] font-medium font-mono text-[11px]">
                                Active
                              </span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3.5 h-3.5 text-[#EF4444]" />
                              <span className="text-[#EF4444] font-medium font-mono text-[11px]">
                                Deactivated
                              </span>
                            </>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleSaveEdit(u.id)}
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
                          onClick={() => handleStartEdit(u)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FFFDF5] hover:bg-[#FFF3C4] border border-[#E5E7EB] hover:border-[#F4B400] text-xs font-semibold text-[#1F2933] transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3 h-3 text-[#D99A00]" />
                          <span>Edit</span>
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
