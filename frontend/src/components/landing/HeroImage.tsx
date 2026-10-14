import React from "react";
import { Activity, CheckCircle2, AlertTriangle, AlertOctagon } from "lucide-react";
import factoryPhoto from "../../assets/images/hero-factory.jpg";

export const HeroImage: React.FC = () => {
  return (
    <div className="relative w-full">
      {/* Industrial framing container */}
      <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-[#E5E7EB] shadow-2xl bg-[#FFFDF5] p-2 sm:p-2.5 transition-all duration-300">
        <img
          src={factoryPhoto}
          alt="Smart Textile Manufacturing Plant Floor"
          className="w-full h-[380px] sm:h-[460px] lg:h-[520px] object-cover rounded-xl sm:rounded-2xl brightness-[0.98] contrast-[1.02]"
        />

        {/* Sleek Floating Live Monitoring Card Overlay */}
        <div className="absolute bottom-6 left-6 right-6 sm:right-auto sm:min-w-[280px] bg-[#FFFFFF]/95 backdrop-blur-md rounded-xl p-4 border border-[#E5E7EB] shadow-xl">
          <div className="flex items-center justify-between gap-3 mb-2.5 pb-2 border-b border-[#E5E7EB]">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#F4B400]" />
              <span className="text-xs font-bold font-mono text-[#1F2933] tracking-wide uppercase">
                LIVE FACTORY MONITORING
              </span>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-mono">
            <div className="flex items-center justify-center gap-1.5 py-1 px-1.5 rounded-lg bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
              <span>Healthy</span>
            </div>
            <div className="flex items-center justify-center gap-1.5 py-1 px-1.5 rounded-lg bg-amber-50 text-amber-900 font-semibold border border-amber-200">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span>At Risk</span>
            </div>
            <div className="flex items-center justify-center gap-1.5 py-1 px-1.5 rounded-lg bg-rose-50 text-rose-900 font-semibold border border-rose-200">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
              <span>Critical</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
