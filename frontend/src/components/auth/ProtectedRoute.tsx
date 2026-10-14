import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { LoadingState } from "../common/LoadingState";
import { UserRole } from "../../types/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-6">
        <LoadingState message="Verifying session credentials..." />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const landingPath = user.role === "ADMIN"
      ? "/admin"
      : user.role === "MAINTENANCE_ENGINEER"
      ? "/maintenance-engineer"
      : user.role === "PRODUCTION_MANAGER"
      ? "/production-manager"
      : "/plant-manager";
    return <Navigate to={landingPath} replace />;
  }

  return <>{children}</>;

};
