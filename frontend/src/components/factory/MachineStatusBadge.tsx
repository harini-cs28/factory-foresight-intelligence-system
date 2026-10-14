import React from "react";
import { StatusBadge } from "../common/StatusBadge";

interface MachineStatusBadgeProps {
  status?: string | null;
  size?: "sm" | "md" | "lg";
}

export const MachineStatusBadge: React.FC<MachineStatusBadgeProps> = ({
  status,
  size = "md",
}) => {
  return <StatusBadge status={status} size={size} />;
};
