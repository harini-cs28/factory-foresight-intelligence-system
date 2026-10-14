import React from "react";
import { NavLink } from "react-router-dom";
import { Cpu, Share2, Wrench } from "lucide-react";

interface MachineNavProps {
  machineId: string;
}

export const Navigation: React.FC<MachineNavProps> = ({ machineId }) => {
  const tabs = [
    {
      label: "Machine Intelligence",
      path: `/intelligence/${machineId}`,
      icon: Cpu,
    },
    {
      label: "Cascade Impact Analysis",
      path: `/impact/${machineId}`,
      icon: Share2,
    },
    {
      label: "Maintenance Decision",
      path: `/maintenance/${machineId}`,
      icon: Wrench,
    },
  ];

  return (
    <div className="flex items-center gap-2 border-b border-[#E5E7EB] pb-3 mb-6 overflow-x-auto">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <NavLink
            key={tab.path}
            to={tab.path}
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shrink-0 ${
                isActive
                  ? "bg-[#FFF3C4] text-[#1F2933] border border-[#F4B400]/50 shadow-xs"
                  : "bg-[#FFFFFF] text-[#667085] hover:text-[#1F2933] hover:bg-[#FFFDF5] border border-[#E5E7EB]"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={`w-4 h-4 ${isActive ? "text-[#D99A00]" : "text-[#667085]"}`} />
                <span>{tab.label}</span>
              </>
            )}
          </NavLink>
        );
      })}
    </div>
  );
};
