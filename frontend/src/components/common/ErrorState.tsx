import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Telemetry & Connection Error",
  message = "Unable to retrieve real-time intelligence data from the FFIS backend server.",
  onRetry,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-rose-950/20 border border-rose-900/40 rounded-xl my-6 text-center max-w-lg mx-auto">
      <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mb-3">
        <AlertCircle className="w-6 h-6 text-rose-400" />
      </div>
      <h3 className="text-base font-semibold text-rose-200 tracking-wide">{title}</h3>
      <p className="text-xs text-rose-300/80 mt-1.5 leading-relaxed">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-900/40 hover:bg-rose-900/60 border border-rose-700/50 text-rose-200 text-xs font-medium transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Connection</span>
        </button>
      )}
    </div>
  );
};
