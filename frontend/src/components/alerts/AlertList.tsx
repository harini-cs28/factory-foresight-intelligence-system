import React from "react";
import { AlertItem } from "../../types/alert";
import { AlertCard } from "./AlertCard";
import { BellOff } from "lucide-react";

interface AlertListProps {
  alerts: AlertItem[];
  onAcknowledge: (alertId: number) => Promise<void>;
  canAcknowledge?: boolean;
}

export const AlertList: React.FC<AlertListProps> = ({
  alerts,
  onAcknowledge,
  canAcknowledge = true,
}) => {
  if (!alerts || alerts.length === 0) {
    return (
      <div className="rounded-2xl border border-[#E5E7EB] bg-[#FFFFFF] p-12 text-center shadow-xs">
        <BellOff size={36} className="mx-auto text-[#667085] mb-3" />
        <h4 className="text-base font-bold text-[#1F2933]">No Operational Alerts</h4>
        <p className="text-xs text-[#667085] mt-1">
          All machines are operating within designated risk and dependency safety thresholds.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {alerts.map((alert) => (
        <AlertCard
          key={alert.id}
          alert={alert}
          onAcknowledge={onAcknowledge}
          canAcknowledge={canAcknowledge}
        />
      ))}
    </div>
  );
};
