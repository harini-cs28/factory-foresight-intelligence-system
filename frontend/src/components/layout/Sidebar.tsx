import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getWorkspaceConfigForRole } from "./navigationConfig";
import { Factory, Shield, Cpu, Activity, Wrench } from "lucide-react";

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const config = getWorkspaceConfigForRole(user?.role);

  const getWorkspaceIcon = () => {
    switch (user?.role) {
      case "ADMIN":
        return Shield;
      case "MAINTENANCE_ENGINEER":
        return Wrench;
      case "PRODUCTION_MANAGER":
        return Activity;
      case "PLANT_MANAGER":
      default:
        return Factory;
    }
  };

  const WorkspaceIcon = getWorkspaceIcon();

  return (
    <aside className="w-64 bg-[#FFFFFF] border-r border-[#E5E7EB] flex flex-col shrink-0 min-h-screen">
      {/* Brand & Workspace Header */}
      <div className="p-5 border-b border-[#E5E7EB]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#F4B400] flex items-center justify-center text-[#1F2933] font-bold shadow-sm shadow-[#F4B400]/20 shrink-0">
            <WorkspaceIcon className="w-5 h-5 text-[#1F2933]" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-[#1F2933] font-mono tracking-wider flex items-center gap-1.5">
              <span>FFIS</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#FFF3C4] text-[#D99A00] font-bold border border-[#F4B400]/30">
                {config.workspaceCode}
              </span>
            </h2>
            <p className="text-[10px] font-bold text-[#1F2933] uppercase tracking-wider font-mono mt-0.5 truncate">
              {config.workspaceTitle}
            </p>
          </div>
        </div>
      </div>

      {/* Role-Specific Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#667085] font-mono">
          {config.workspaceTitle}
        </div>

        {config.navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-[#FFF3C4] text-[#1F2933] border-l-[3px] border-l-[#F4B400] rounded-l-none font-bold shadow-xs"
                    : "text-[#667085] hover:bg-[#FFFDF5] hover:text-[#1F2933] border-l-[3px] border-l-transparent"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? "text-[#D99A00]" : "text-[#667085]"
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto text-[10px] px-1.5 py-0.2 rounded-full bg-[#F4B400] text-[#1F2933] font-mono">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Industrial Workspace Status Footer */}
      <div className="p-4 border-t border-[#E5E7EB] bg-[#FFFDF5]">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
            <span className="text-[11px] font-bold text-[#1F2933] font-mono">WORKSPACE ACTIVE</span>
          </div>
          <span className="text-[11px] font-mono text-[#667085]">v1.0.0</span>
        </div>
      </div>
    </aside>
  );
};
