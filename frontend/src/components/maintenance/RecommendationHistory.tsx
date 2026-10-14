import React, { useState, useEffect } from "react";
import { maintenanceApi } from "../../api/maintenanceApi";
import { RecommendationHistoryItem } from "../../types/maintenance";
import { StatusBadge } from "../common/StatusBadge";
import { History, Calendar, FileText } from "lucide-react";

interface RecommendationHistoryProps {
  machineId: string;
}

export const RecommendationHistory: React.FC<RecommendationHistoryProps> = ({ machineId }) => {
  const [history, setHistory] = useState<RecommendationHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);
      try {
        const data = await maintenanceApi.getRecommendationHistory(machineId);
        setHistory(data);
      } catch {
        setHistory([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [machineId]);

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-[#D99A00]" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#1F2933] font-mono">
            Historical Recommendation Audit Log
          </h3>
        </div>
        <span className="text-xs text-[#667085]">
          Audit Trail
        </span>
      </div>

      {isLoading ? (
        <p className="text-xs text-[#667085]">Loading audit history...</p>
      ) : history.length === 0 ? (
        <div className="p-6 rounded-xl bg-[#FFFDF5] border border-[#E5E7EB] text-center">
          <p className="text-xs text-[#667085]">
            No previous maintenance recommendations recorded for machine {machineId}.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-xl bg-[#FFFDF5] border border-[#E5E7EB] space-y-2"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <StatusBadge status={item.priority} size="sm" />
                  <span className="text-xs font-bold text-[#1F2933]">
                    {item.recommended_action}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-[#667085]">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{formatDate(item.created_at)}</span>
                </div>
              </div>

              <p className="text-xs text-[#667085] pl-2 border-l-2 border-[#F4B400]">
                {item.reason}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
