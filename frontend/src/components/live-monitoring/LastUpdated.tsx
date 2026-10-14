import React from "react";
import { Activity } from "lucide-react";

interface LastUpdatedProps {
  timestamp: string | null;
  pollingIntervalSeconds?: number;
  isPolling?: boolean;
}

export const LastUpdated: React.FC<LastUpdatedProps> = ({
  timestamp,
  pollingIntervalSeconds = 5,
  isPolling = true,
}) => {
  const formatTime = (ts: string | null) => {
    if (!ts) return "Awaiting signal...";
    try {
      const date = new Date(ts);
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
    } catch {
      return ts;
    }
  };

  return (
    <div className="flex items-center gap-2.5 text-xs text-[#667085] bg-[#FFFFFF] border border-[#E5E7EB] px-3 py-1.5 rounded-xl shadow-xs">
      <div className="flex items-center gap-1.5">
        <span className="relative flex h-2 w-2">
          {isPolling && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          )}
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
        <Activity size={13} className="text-emerald-600" />
      </div>
      <span>
        Last updated: <strong className="text-[#1F2933] font-mono">{formatTime(timestamp)}</strong>
      </span>
      <span className="text-[#E5E7EB]">|</span>
      <span className="text-[#667085]">
        Poll: <span className="text-[#D99A00] font-mono font-bold">{pollingIntervalSeconds}s</span>
      </span>
    </div>
  );
};
