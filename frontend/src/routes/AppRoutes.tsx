import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LandingPage } from "../components/landing/LandingPage";
import { LoginForm } from "../components/auth/LoginForm";
import { ProtectedRoute } from "../components/auth/ProtectedRoute";
import { AppLayout } from "../components/layout/AppLayout";

// Admin Workspace Components
import { AdminDashboard } from "../components/admin/AdminDashboard";
import { UsersRoles } from "../components/admin/UsersRoles";
import { MachineRegistry } from "../components/admin/MachineRegistry";
import { ModelServiceStatus } from "../components/admin/ModelServiceStatus";
import { SystemConfiguration } from "../components/admin/SystemConfiguration";
import { AuditLogs } from "../components/admin/AuditLogs";

// Plant Manager Workspace Components
import { PlantManagerDashboard } from "../components/plant-manager/PlantManagerDashboard";
import { MachineFleet } from "../components/plant-manager/MachineFleet";
import { RiskPredictions } from "../components/plant-manager/RiskPredictions";
import { CascadeImpact } from "../components/plant-manager/CascadeImpact";
import { MaintenancePriorities } from "../components/plant-manager/MaintenancePriorities";

// Maintenance Engineer Workspace Components
import { MaintenanceEngineerDashboard } from "../components/maintenance-engineer/MaintenanceEngineerDashboard";
import { MachineDiagnostics } from "../components/maintenance-engineer/MachineDiagnostics";
import { FailureRULAnalysis } from "../components/maintenance-engineer/FailureRULAnalysis";
import { MaintenanceWorkOrders } from "../components/maintenance-engineer/MaintenanceWorkOrders";
import { CascadeAnalysis } from "../components/maintenance-engineer/CascadeAnalysis";
import { MaintenanceHistory } from "../components/maintenance-engineer/MaintenanceHistory";

// Production Manager Workspace Components
import { ProductionManagerDashboard } from "../components/production-manager/ProductionManagerDashboard";
import { ProductionLines } from "../components/production-manager/ProductionLines";
import { ScheduleBottlenecks } from "../components/production-manager/ScheduleBottlenecks";
import { DowntimeImpact } from "../components/production-manager/DowntimeImpact";
import { AtRiskProduction } from "../components/production-manager/AtRiskProduction";

// Shared Cross-Functional Pages
import { AlertCenter } from "../components/alerts/AlertCenter";
import { DigitalTwinView } from "../components/digital-twin/DigitalTwinView";

// Helper component for redirecting authenticated users to their assigned workspace
const AuthenticatedRoleRedirect: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const landing =
    user.role === "ADMIN"
      ? "/admin"
      : user.role === "MAINTENANCE_ENGINEER"
      ? "/maintenance-engineer"
      : user.role === "PRODUCTION_MANAGER"
      ? "/production-manager"
      : "/plant-manager";

  return <Navigate to={landing} replace />;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Landing & Authentication */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginForm />} />

      {/* Legacy Route Redirects */}
      <Route path="/dashboard" element={<AuthenticatedRoleRedirect />} />

      {/* Shared Authenticated Layout */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        {/* 1. ADMIN WORKSPACE — SYSTEM CONTROL CENTER */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <UsersRoles />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/machines"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <MachineRegistry />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/models"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <ModelServiceStatus />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/config"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <SystemConfiguration />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/audit"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AuditLogs />
            </ProtectedRoute>
          }
        />

        {/* 2. PLANT MANAGER WORKSPACE — FACTORY COMMAND CENTER */}
        <Route
          path="/plant-manager"
          element={
            <ProtectedRoute allowedRoles={["PLANT_MANAGER"]}>
              <PlantManagerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/plant-manager/machines"
          element={
            <ProtectedRoute allowedRoles={["PLANT_MANAGER"]}>
              <MachineFleet />
            </ProtectedRoute>
          }
        />
        <Route
          path="/plant-manager/risk"
          element={
            <ProtectedRoute allowedRoles={["PLANT_MANAGER"]}>
              <RiskPredictions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/plant-manager/cascade"
          element={
            <ProtectedRoute allowedRoles={["PLANT_MANAGER"]}>
              <CascadeImpact />
            </ProtectedRoute>
          }
        />
        <Route
          path="/plant-manager/maintenance-priorities"
          element={
            <ProtectedRoute allowedRoles={["PLANT_MANAGER"]}>
              <MaintenancePriorities />
            </ProtectedRoute>
          }
        />
        <Route
          path="/plant-manager/alerts"
          element={
            <ProtectedRoute allowedRoles={["PLANT_MANAGER"]}>
              <AlertCenter />
            </ProtectedRoute>
          }
        />
        <Route
          path="/plant-manager/digital-twin"
          element={
            <ProtectedRoute allowedRoles={["PLANT_MANAGER"]}>
              <DigitalTwinView />
            </ProtectedRoute>
          }
        />

        {/* 3. MAINTENANCE ENGINEER WORKSPACE — MAINTENANCE INTELLIGENCE */}
        <Route
          path="/maintenance-engineer"
          element={
            <ProtectedRoute allowedRoles={["MAINTENANCE_ENGINEER"]}>
              <MaintenanceEngineerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/maintenance-engineer/diagnostics"
          element={
            <ProtectedRoute allowedRoles={["MAINTENANCE_ENGINEER"]}>
              <MachineDiagnostics />
            </ProtectedRoute>
          }
        />
        <Route
          path="/maintenance-engineer/failure-rul"
          element={
            <ProtectedRoute allowedRoles={["MAINTENANCE_ENGINEER"]}>
              <FailureRULAnalysis />
            </ProtectedRoute>
          }
        />
        <Route
          path="/maintenance-engineer/work-orders"
          element={
            <ProtectedRoute allowedRoles={["MAINTENANCE_ENGINEER"]}>
              <MaintenanceWorkOrders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/maintenance-engineer/cascade"
          element={
            <ProtectedRoute allowedRoles={["MAINTENANCE_ENGINEER"]}>
              <CascadeAnalysis />
            </ProtectedRoute>
          }
        />
        <Route
          path="/maintenance-engineer/history"
          element={
            <ProtectedRoute allowedRoles={["MAINTENANCE_ENGINEER"]}>
              <MaintenanceHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/maintenance-engineer/alerts"
          element={
            <ProtectedRoute allowedRoles={["MAINTENANCE_ENGINEER"]}>
              <AlertCenter />
            </ProtectedRoute>
          }
        />

        {/* 4. PRODUCTION MANAGER WORKSPACE — PRODUCTION RISK CENTER */}
        <Route
          path="/production-manager"
          element={
            <ProtectedRoute allowedRoles={["PRODUCTION_MANAGER"]}>
              <ProductionManagerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/production-manager/lines"
          element={
            <ProtectedRoute allowedRoles={["PRODUCTION_MANAGER"]}>
              <ProductionLines />
            </ProtectedRoute>
          }
        />
        <Route
          path="/production-manager/schedule-bottlenecks"
          element={
            <ProtectedRoute allowedRoles={["PRODUCTION_MANAGER"]}>
              <ScheduleBottlenecks />
            </ProtectedRoute>
          }
        />
        <Route
          path="/production-manager/downtime-impact"
          element={
            <ProtectedRoute allowedRoles={["PRODUCTION_MANAGER"]}>
              <DowntimeImpact />
            </ProtectedRoute>
          }
        />
        <Route
          path="/production-manager/at-risk"
          element={
            <ProtectedRoute allowedRoles={["PRODUCTION_MANAGER"]}>
              <AtRiskProduction />
            </ProtectedRoute>
          }
        />
        <Route
          path="/production-manager/alerts"
          element={
            <ProtectedRoute allowedRoles={["PRODUCTION_MANAGER"]}>
              <AlertCenter />
            </ProtectedRoute>
          }
        />
        <Route
          path="/production-manager/digital-twin"
          element={
            <ProtectedRoute allowedRoles={["PRODUCTION_MANAGER"]}>
              <DigitalTwinView />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<AuthenticatedRoleRedirect />} />
    </Routes>
  );
};
