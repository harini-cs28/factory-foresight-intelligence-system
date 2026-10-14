import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { LogOut, Server, Shield, Bell } from "lucide-react";

export const Topbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getRoleBadgeStyle = (role?: string) => {
    switch (role) {
      case "PLANT_MANAGER":
        return "bg-[#FFF3C4] text-[#1F2933] border-[#F4B400]";
      case "MAINTENANCE_ENGINEER":
        return "bg-[#FFFDF5] text-[#1F2933] border-[#E5E7EB]";
      case "PRODUCTION_MANAGER":
        return "bg-[#FFFDF5] text-[#1F2933] border-[#E5E7EB]";
      case "ADMIN":
        return "bg-[#FFF3C4] text-[#1F2933] border-[#F4B400]";
      default:
        return "bg-[#F8F9FA] text-[#1F2933] border-[#E5E7EB]";
    }
  };

  return (
    <header className="h-16 bg-[#FFFFFF] border-b border-[#E5E7EB] px-6 flex items-center justify-between shrink-0">
      {/* System Operational Status */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFFDF5] border border-[#E5E7EB] text-xs text-[#1F2933]">
          <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
          <span className="font-semibold text-[#1F2933]">Factory Operational</span>
        </div>
      </div>

      {/* User Info & Actions */}
      <div className="flex items-center gap-3">
        {user && (
          <div className="flex items-center gap-3 pr-2">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-[#1F2933] tracking-wide">{user.name}</p>
              <p className="text-[11px] text-[#667085]">{user.email}</p>
            </div>

            <div className="flex items-center gap-1.5">
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getRoleBadgeStyle(
                  user.role
                )}`}
              >
                {user.role.replace("_", " ")}
              </span>
            </div>
          </div>
        )}

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          title="Sign out of FFIS"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FFFDF5] hover:bg-rose-50 hover:text-rose-700 border border-[#E5E7EB] hover:border-rose-300 text-[#1F2933] text-xs font-medium transition-all"
        >
          <LogOut className="w-3.5 h-3.5 text-[#667085]" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};
