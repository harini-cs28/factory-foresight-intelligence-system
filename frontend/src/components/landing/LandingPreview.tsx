import React from "react";
import {
  LayoutDashboard,
  Activity,
  Cpu,
  Share2,
  Wrench,
  Bell,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Layers,
  ArrowUpRight,
} from "lucide-react";
import { Link } from "react-router-dom";

export const LandingPreview: React.FC = () => {
  return (
    <section id="platform" className="py-20 bg-[#FFFFFF] border-t border-[#E5E8E6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFF3C4] border border-[#F4B400]/40 text-[#1F2933] text-xs font-mono font-bold mb-3">
            <span>PLATFORM PREVIEW</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1F2933] tracking-tight">
            An Industrial Cockpit Built for Precision
          </h2>
          <p className="mt-3 text-base sm:text-lg text-[#667085]">
            Experience a cohesive interface providing real-time telemetry, model explainability, cascade graph traversal, and proactive alerts.
          </p>
        </div>

        {/* Dashboard Mockup Window */}
        <div className="rounded-2xl border-2 border-[#E5E8E6] bg-[#FFFDF5] shadow-2xl overflow-hidden">
          {/* Window Chrome / Titlebar */}
          <div className="bg-[#FFFFFF] border-b border-[#E5E8E6] px-5 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-400" />
                <span className="w-3 h-3 rounded-full bg-amber-400" />
                <span className="w-3 h-3 rounded-full bg-emerald-400" />
              </div>
              <span className="text-xs font-mono text-[#667085] font-semibold pl-2">
                app.ffis.internal / dashboard / plant-overview
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold bg-[#FFF3C4] text-[#1F2933] border border-[#F4B400]/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Telemetry Active
              </span>
            </div>
          </div>

          {/* Inner Dashboard Replica */}
          <div className="p-6 lg:p-8 space-y-6">
            {/* Top Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#FFFFFF] p-4 rounded-xl border border-[#E5E8E6] shadow-xs">
                <div className="flex items-center justify-between text-xs text-[#667085] font-mono mb-1">
                  <span>Total Machinery</span>
                  <Activity className="w-4 h-4 text-[#F4B400]" />
                </div>
                <p className="text-2xl font-bold font-mono text-[#1F2933]">24 Units</p>
                <p className="text-[11px] text-emerald-600 font-medium mt-1">4 Production Lines</p>
              </div>

              <div className="bg-[#FFFFFF] p-4 rounded-xl border border-[#E5E8E6] shadow-xs">
                <div className="flex items-center justify-between text-xs text-[#667085] font-mono mb-1">
                  <span>Nominal Health</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                </div>
                <p className="text-2xl font-bold font-mono text-emerald-700">19 Units</p>
                <p className="text-[11px] text-[#667085] mt-1">79.2% Healthy Status</p>
              </div>

              <div className="bg-[#FFFFFF] p-4 rounded-xl border-2 border-[#F4B400] bg-[#FFF3C4]/15 shadow-xs">
                <div className="flex items-center justify-between text-xs text-amber-900 font-mono mb-1">
                  <span>At Risk Attention</span>
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                </div>
                <p className="text-2xl font-bold font-mono text-amber-900">4 Units</p>
                <p className="text-[11px] text-amber-800 font-semibold mt-1">RUL &lt; 25 Hours</p>
              </div>

              <div className="bg-[#FFFFFF] p-4 rounded-xl border border-rose-200 bg-rose-50/40 shadow-xs">
                <div className="flex items-center justify-between text-xs text-rose-900 font-mono mb-1">
                  <span>Critical Alert</span>
                  <AlertOctagon className="w-4 h-4 text-rose-600" />
                </div>
                <p className="text-2xl font-bold font-mono text-rose-800">1 Unit</p>
                <p className="text-[11px] text-rose-700 font-semibold mt-1">Action Dispatched</p>
              </div>
            </div>

            {/* Split Grid: Live Telemetry & Cascade Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left: Machine Focus Card */}
              <div className="lg:col-span-7 bg-[#FFFFFF] rounded-xl p-5 border border-[#E5E8E6] shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#E5E8E6]">
                  <div>
                    <h3 className="text-sm font-bold font-mono text-[#1F2933]">
                      SPIN-01 • Ring Spinning Frame #01
                    </h3>
                    <p className="text-xs text-[#667085]">Line A • Criticality Level 4</p>
                  </div>
                  <span className="px-2.5 py-0.5 rounded text-xs font-bold font-mono bg-amber-100 text-amber-900 border border-amber-300">
                    AT RISK (82%)
                  </span>
                </div>

                {/* Sensor Indicators */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg bg-[#FFFDF5] border border-[#E5E8E6]">
                    <span className="text-[10px] font-mono text-[#667085] uppercase">Vibration</span>
                    <p className="text-base font-bold font-mono text-amber-700">8.2 mm/s</p>
                    <span className="text-[9px] text-amber-800 font-semibold">Elevated (SHAP +0.31)</span>
                  </div>

                  <div className="p-3 rounded-lg bg-[#FFFDF5] border border-[#E5E8E6]">
                    <span className="text-[10px] font-mono text-[#667085] uppercase">Temperature</span>
                    <p className="text-base font-bold font-mono text-amber-700">91.4 °C</p>
                    <span className="text-[9px] text-amber-800 font-semibold">High (SHAP +0.24)</span>
                  </div>

                  <div className="p-3 rounded-lg bg-[#FFFDF5] border border-[#E5E8E6]">
                    <span className="text-[10px] font-mono text-[#667085] uppercase">Est. RUL</span>
                    <p className="text-base font-bold font-mono text-[#1F2933]">12.4 Hours</p>
                    <span className="text-[9px] text-emerald-600 font-semibold">Window Open</span>
                  </div>
                </div>

                {/* Explainability Bar */}
                <div className="p-3.5 rounded-lg bg-[#FFF3C4]/40 border border-[#F4B400]/40">
                  <p className="text-xs font-bold text-[#1F2933] mb-1">
                    SHAP Explainability Attribution
                  </p>
                  <p className="text-xs text-[#1F2933]/90 leading-relaxed">
                    High vibration (8.2 mm/s) and elevated operating temperature (91.4°C) are the primary contributors to the predicted failure risk.
                  </p>
                </div>
              </div>

              {/* Right: Cascade Impact & Decision Engine */}
              <div className="lg:col-span-5 bg-[#FFFFFF] rounded-xl p-5 border border-[#E5E8E6] shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#E5E8E6]">
                  <h3 className="text-sm font-bold font-mono text-[#1F2933]">
                    Cascade Impact &amp; Prescriptive Decision
                  </h3>
                  <Share2 className="w-4 h-4 text-[#F4B400]" />
                </div>

                <div className="space-y-2.5">
                  <div className="p-3 rounded-lg bg-[#FFFDF5] border border-[#E5E8E6] flex items-center justify-between text-xs">
                    <span className="text-[#667085]">Downstream Machinery Impacted</span>
                    <span className="font-bold font-mono text-[#1F2933]">3 Machines (Looms 1-3)</span>
                  </div>

                  <div className="p-3 rounded-lg bg-[#FFFDF5] border border-[#E5E8E6] flex items-center justify-between text-xs">
                    <span className="text-[#667085]">Potential Downtime Risk</span>
                    <span className="font-bold font-mono text-rose-700">$3,600 / hr</span>
                  </div>

                  <div className="p-3.5 rounded-lg bg-[#FFF3C4]/60 border border-[#F4B400]/40 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#1F2933]">Recommended Work Order</span>
                      <span className="text-[10px] font-mono font-bold bg-[#F4B400] text-[#1F2933] px-2 py-0.5 rounded">
                        HIGH PRIORITY
                      </span>
                    </div>
                    <p className="text-xs text-[#1F2933] font-medium pt-1">
                      Replace main spindle bearings &amp; refill lubricant oil reservoir during upcoming Shift 2 changeover (14:00 - 15:00).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Explore live interactive CTA */}
        <div className="mt-8 text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm font-bold text-[#1F2933] hover:text-[#F4B400] transition-colors"
          >
            <span>Experience the live interactive application</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};
