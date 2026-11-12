import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { useAuth } from "../../context/AuthContext";
import { AssistantLauncher } from "../assistant/AssistantLauncher";

interface AppLayoutProps {
  children?: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();

  // Assistant appears only in the Maintenance Engineer workspace
  const isMaintenanceWorkspace =
    user?.role === "MAINTENANCE_ENGINEER" ||
    location.pathname.startsWith("/maintenance-engineer");

  return (
    <div className="flex h-screen bg-[#F8F9FA] text-[#1F2933] font-sans overflow-hidden">
      {/* Fixed Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#F8F9FA]">
          <div className="w-full max-w-7xl mx-auto">
            {children || <Outlet />}
          </div>
        </main>
      </div>

      {/* 3D AI Robot Maintenance Assistant Widget */}
      {isMaintenanceWorkspace && <AssistantLauncher />}
    </div>
  );
};
