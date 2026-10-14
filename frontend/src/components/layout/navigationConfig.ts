import { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Users,
  Cpu,
  Settings,
  FileText,
  Activity,
  Factory,
  Share2,
  Wrench,
  Eye,
  Bell,
  GitFork,
  Clock,
  ListTodo,
  Layers,
  History,
  TrendingDown,
  Server,
  ClipboardList,
  AlertTriangle,
} from "lucide-react";
import { UserRole } from "../../types/auth";

export interface NavItemConfig {
  label: string;
  path: string;
  icon: LucideIcon;
  badge?: string;
  exact?: boolean;
}

export interface WorkspaceConfig {
  role: UserRole;
  workspaceTitle: string;
  workspaceCode: string;
  landingPath: string;
  navItems: NavItemConfig[];
}

// 1. ADMIN CONFIGURATION
export const ADMIN_WORKSPACE_CONFIG: WorkspaceConfig = {
  role: "ADMIN",
  workspaceTitle: "SYSTEM CONTROL CENTER",
  workspaceCode: "SYS-CTRL",
  landingPath: "/admin",
  navItems: [
    { label: "System Overview", path: "/admin", icon: LayoutDashboard, exact: true },
    { label: "Users & Roles", path: "/admin/users", icon: Users },
    { label: "Machine Registry", path: "/admin/machines", icon: Activity },
    { label: "Model & Service Status", path: "/admin/models", icon: Server },
    { label: "System Configuration", path: "/admin/config", icon: Settings },
    { label: "Audit Logs", path: "/admin/audit", icon: FileText },
  ],
};

// 2. PLANT MANAGER CONFIGURATION
export const PLANT_MANAGER_WORKSPACE_CONFIG: WorkspaceConfig = {
  role: "PLANT_MANAGER",
  workspaceTitle: "FACTORY COMMAND CENTER",
  workspaceCode: "CMD-CTR",
  landingPath: "/plant-manager",
  navItems: [
    { label: "Factory Overview", path: "/plant-manager", icon: LayoutDashboard, exact: true },
    { label: "Machine Fleet", path: "/plant-manager/machines", icon: Activity },
    { label: "Risk & Predictions", path: "/plant-manager/risk", icon: Cpu },
    { label: "Cascade Impact", path: "/plant-manager/cascade", icon: Share2 },
    { label: "Maintenance Priorities", path: "/plant-manager/maintenance-priorities", icon: Wrench },
    { label: "Alerts", path: "/plant-manager/alerts", icon: Bell },
    { label: "Digital Twin", path: "/plant-manager/digital-twin", icon: Eye },
  ],
};

// 3. MAINTENANCE ENGINEER CONFIGURATION
export const MAINTENANCE_ENGINEER_WORKSPACE_CONFIG: WorkspaceConfig = {
  role: "MAINTENANCE_ENGINEER",
  workspaceTitle: "MAINTENANCE INTELLIGENCE",
  workspaceCode: "MAINT-IQ",
  landingPath: "/maintenance-engineer",
  navItems: [
    { label: "My Work Queue", path: "/maintenance-engineer", icon: ListTodo, exact: true },
    { label: "Machine Diagnostics", path: "/maintenance-engineer/diagnostics", icon: Activity },
    { label: "Failure & RUL Analysis", path: "/maintenance-engineer/failure-rul", icon: Cpu },
    { label: "Maintenance Work Orders", path: "/maintenance-engineer/work-orders", icon: ClipboardList },
    { label: "Cascade Analysis", path: "/maintenance-engineer/cascade", icon: GitFork },
    { label: "Maintenance History", path: "/maintenance-engineer/history", icon: History },
    { label: "Alerts", path: "/maintenance-engineer/alerts", icon: Bell },
  ],
};

// 4. PRODUCTION MANAGER CONFIGURATION
export const PRODUCTION_MANAGER_WORKSPACE_CONFIG: WorkspaceConfig = {
  role: "PRODUCTION_MANAGER",
  workspaceTitle: "PRODUCTION RISK CENTER",
  workspaceCode: "PROD-RSK",
  landingPath: "/production-manager",
  navItems: [
    { label: "Production Overview", path: "/production-manager", icon: LayoutDashboard, exact: true },
    { label: "Production Lines", path: "/production-manager/lines", icon: Layers },
    { label: "Schedule & Bottlenecks", path: "/production-manager/schedule-bottlenecks", icon: Clock },
    { label: "Downtime Impact", path: "/production-manager/downtime-impact", icon: TrendingDown },
    { label: "At-Risk Production", path: "/production-manager/at-risk", icon: AlertTriangle },
    { label: "Alerts", path: "/production-manager/alerts", icon: Bell },
    { label: "Digital Twin", path: "/production-manager/digital-twin", icon: Eye },
  ],
};

export const getWorkspaceConfigForRole = (role?: UserRole): WorkspaceConfig => {
  switch (role) {
    case "ADMIN":
      return ADMIN_WORKSPACE_CONFIG;
    case "MAINTENANCE_ENGINEER":
      return MAINTENANCE_ENGINEER_WORKSPACE_CONFIG;
    case "PRODUCTION_MANAGER":
      return PRODUCTION_MANAGER_WORKSPACE_CONFIG;
    case "PLANT_MANAGER":
    default:
      return PLANT_MANAGER_WORKSPACE_CONFIG;
  }
};
