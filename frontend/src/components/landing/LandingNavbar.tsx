import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Factory } from "lucide-react";
import apiClient from "../../api/axios";

export const LandingNavbar: React.FC = () => {
  const [backendStatus, setBackendStatus] = useState<"checking" | "connected" | "disconnected">("checking");
  const [latency, setLatency] = useState<number | null>(null);

  useEffect(() => {
    let isMounted = true;

    const checkBackend = async () => {
      const startTime = performance.now();
      try {
        const response = await apiClient.get("/api/health", { timeout: 4000 });
        if (!isMounted) return;
        if (response.status === 200 && response.data?.status === "ok") {
          setLatency(Math.round(performance.now() - startTime));
          setBackendStatus("connected");
        } else {
          setBackendStatus("disconnected");
        }
      } catch {
        if (!isMounted) return;
        setBackendStatus("disconnected");
      }
    };

    checkBackend();
    const interval = setInterval(checkBackend, 10000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <header className="w-full bg-[#FFFFFF] border-b border-[#E5E7EB] h-[72px] shrink-0 z-50">
      <div className="w-full h-full px-4 sm:px-8 lg:px-16 flex items-center justify-between">
        {/* Brand Identity */}
        <Link to="/" className="flex items-center gap-3 sm:gap-3.5 group">
          <div className="w-9 h-9 rounded-xl bg-[#F4B400] flex items-center justify-center text-[#1F2933] shadow-sm transition-transform group-hover:scale-105 shrink-0">
            <Factory className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg sm:text-xl font-extrabold text-[#1F2933] font-mono tracking-wider">
                FFIS
              </span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#FFF3C4] text-[#1F2933] border border-[#F4B400]/50">
                ENTERPRISE
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-[#667085] font-medium leading-none">
              Factory Foresight Intelligence
            </p>
          </div>
        </Link>

        {/* Right Section: Backend Status Pill & Login Button */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Live Backend Connection Indicator */}
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-mono font-medium border transition-all ${
              backendStatus === "connected"
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : backendStatus === "checking"
                ? "bg-amber-50 text-amber-800 border-amber-200"
                : "bg-rose-50 text-rose-800 border-rose-200"
            }`}
            title={
              backendStatus === "connected"
                ? `Backend API connected (${latency}ms)`
                : backendStatus === "checking"
                ? "Checking backend connection..."
                : "Backend API offline or unreachable"
            }
          >
            <span
              className={`w-2 h-2 rounded-full ${
                backendStatus === "connected"
                  ? "bg-emerald-500 animate-pulse"
                  : backendStatus === "checking"
                  ? "bg-amber-500 animate-ping"
                  : "bg-rose-500"
              }`}
            />
            <span className="inline font-semibold">
              {backendStatus === "connected"
                ? "Backend Connected"
                : backendStatus === "checking"
                ? "Connecting..."
                : "Backend Offline"}
            </span>
            {backendStatus === "connected" && latency !== null && (
              <span className="text-[10px] opacity-70 hidden sm:inline">
                ({latency}ms)
              </span>
            )}
          </div>

          <Link
            to="/login"
            className="inline-flex items-center justify-center px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-[#1F2933] bg-[#FFFFFF] hover:bg-[#FFFDF5] border border-[#E5E7EB] hover:border-[#D99A00]/50 transition-all shadow-xs"
          >
            Login
          </Link>
        </div>
      </div>
    </header>
  );
};
