import React from "react";
import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  message?: string;
  description?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = "Loading factory telemetry data...",
  description = "Communicating with FFIS backend intelligence services",
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 bg-white border border-[#E5E7EB] rounded-2xl my-6 shadow-xs">
      <div className="relative flex items-center justify-center w-16 h-16 mb-4">
        <div className="absolute inset-0 rounded-full border-2 border-[#F4B400]/40 animate-ping" />
        <Loader2 className="w-8 h-8 text-[#D99A00] animate-spin" />
      </div>
      <h3 className="text-base font-semibold text-[#1F2933] tracking-wide font-mono">{message}</h3>
      {description && (
        <p className="text-xs text-[#667085] mt-1 text-center max-w-sm">{description}</p>
      )}
    </div>
  );
};
