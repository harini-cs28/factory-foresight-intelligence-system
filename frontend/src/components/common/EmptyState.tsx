import React from "react";
import { Database, PlusCircle } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  message?: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = "No Telemetry Data Available",
  message = "No records or predictions were found for this industrial asset in PostgreSQL.",
  actionText,
  onAction,
  icon,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 bg-white border border-[#E5E7EB] rounded-2xl my-6 text-center shadow-xs">
      <div className="w-14 h-14 rounded-2xl bg-[#FFFDF5] border border-[#E5E7EB] flex items-center justify-center mb-3 text-[#D99A00]">
        {icon || <Database className="w-7 h-7" />}
      </div>
      <h3 className="text-base font-semibold text-[#1F2933] tracking-wide font-mono">{title}</h3>
      <p className="text-xs text-[#667085] mt-1.5 max-w-sm leading-relaxed">{message}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#F4B400] hover:bg-[#D99A00] text-[#1F2933] text-xs font-bold tracking-wide transition-all shadow-xs"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{actionText}</span>
        </button>
      )}
    </div>
  );
};
