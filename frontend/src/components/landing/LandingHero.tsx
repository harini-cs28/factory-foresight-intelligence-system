import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ChevronRight,
  Activity,
  Cpu,
  ShieldCheck,
  Zap,
  TrendingDown,
  Layers,
  Wrench,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

export const LandingHero: React.FC = () => {
  return (
    <section id="home" className="relative bg-[#FFFFFF] overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
      {/* Subtle industrial grid background */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#1F2933_1px,transparent_1px)] [background-size:20px_20px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Hero Typography & CTAs */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFFDF5] border border-[#F4B400]/40 text-[#1F2933] text-xs font-mono font-semibold shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#F4B400] animate-pulse" />
              <span>AI-Powered Smart Manufacturing Intelligence Platform</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#1F2933] tracking-tight leading-[1.1]">
              Predict. Prevent. <br />
              <span className="text-[#F4B400] underline decoration-[#FFF3C4] decoration-4">
                Optimize.
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-[#667085] leading-relaxed max-w-2xl font-normal">
              Intelligent manufacturing operations powered by machine health prediction, failure risk analysis, and actionable maintenance intelligence.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl text-base font-bold text-[#1F2933] bg-[#F4B400] hover:bg-[#e0a400] shadow-lg shadow-[#F4B400]/25 transition-all transform hover:-translate-y-0.5"
              >
                <span>Get Started</span>
                <ArrowRight className="w-5 h-5" />
              </Link>

              <a
                href="#capabilities"
                className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl text-base font-semibold text-[#1F2933] bg-[#FFFDF5] hover:bg-[#FFF3C4] border border-[#E5E8E6] transition-all"
              >
                <span>Explore FFIS</span>
                <ChevronRight className="w-4 h-4 text-[#667085]" />
              </a>
            </div>

            {/* Key trust badges */}
            <div className="pt-6 border-t border-[#E5E8E6] grid grid-cols-3 gap-4 max-w-lg">
              <div>
                <p className="text-2xl font-bold font-mono text-[#1F2933]">98.88%</p>
                <p className="text-xs text-[#667085] font-medium">Model Accuracy</p>
              </div>
              <div>
                <p className="text-2xl font-bold font-mono text-[#1F2933]">&lt; 15 min</p>
                <p className="text-xs text-[#667085] font-medium">Early Warning Time</p>
              </div>
              <div>
                <p className="text-2xl font-bold font-mono text-[#1F2933]">100%</p>
                <p className="text-xs text-[#667085] font-medium">Deterministic Rules</p>
              </div>
            </div>
          </div>

          {/* Right Column: Clean Industrial Diagram & Live Status Preview */}
          <div className="lg:col-span-5 relative">
            {/* Soft decorative background shape */}
            <div className="absolute -inset-4 bg-[#FFFDF5] rounded-3xl -rotate-1 border border-[#E5E8E6] -z-10" />

            {/* Industrial Factory Connectivity Graphic */}
            <div className="bg-[#FFFFFF] rounded-2xl p-6 border border-[#E5E8E6] shadow-xl shadow-slate-200/50 space-y-4">
              {/* Graphic Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[#E5E8E6]">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-[#FFF3C4] text-[#1F2933]">
                    <Activity className="w-4 h-4 text-[#F4B400]" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold font-mono text-[#1F2933] uppercase">
                      Textile Production Floor (Line A)
                    </h3>
                    <p className="text-[10px] text-[#667085] font-mono">
                      Telemetry &amp; Cascade Mesh
                    </p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Sync
                </span>
              </div>

              {/* Machine Nodes in Sequence (Carding -> Spinning -> Weaving -> Dyeing) */}
              <div className="space-y-3">
                {/* Node 1: Carding */}
                <div className="p-3.5 rounded-xl bg-[#FFFDF5] border border-[#E5E8E6] flex items-center justify-between hover:border-[#F4B400]/60 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#FFFFFF] border border-[#E5E8E6] flex items-center justify-center text-xs font-bold font-mono text-[#1F2933]">
                      M01
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#1F2933]">Carding Machine 01</p>
                      <p className="text-[10px] text-[#667085] font-mono">Vib: 2.1 mm/s • Temp: 42°C</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      HEALTHY
                    </span>
                    <p className="text-[10px] font-mono text-[#667085] mt-0.5">RUL: 84 hrs</p>
                  </div>
                </div>

                {/* Connection Line */}
                <div className="flex justify-center -my-1">
                  <div className="w-0.5 h-4 bg-[#F4B400]/60" />
                </div>

                {/* Node 2: Ring Spinning (At Risk highlighted) */}
                <div className="p-3.5 rounded-xl bg-[#FFF3C4]/30 border-2 border-[#F4B400] flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#F4B400] text-[#1F2933] flex items-center justify-center text-xs font-bold font-mono shadow-xs">
                      M03
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#1F2933] flex items-center gap-1.5">
                        <span>Ring Spinning Frame 03</span>
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      </p>
                      <p className="text-[10px] text-amber-900 font-mono">
                        Vib: 8.2 mm/s • Temp: 78°C (High)
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                      AT RISK (76%)
                    </span>
                    <p className="text-[10px] font-mono text-amber-900 font-semibold mt-0.5">
                      RUL: 12 hrs
                    </p>
                  </div>
                </div>

                {/* Connection Line */}
                <div className="flex justify-center -my-1">
                  <div className="w-0.5 h-4 bg-[#F4B400]/60" />
                </div>

                {/* Node 3: Loom */}
                <div className="p-3.5 rounded-xl bg-[#FFFDF5] border border-[#E5E8E6] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#FFFFFF] border border-[#E5E8E6] flex items-center justify-center text-xs font-bold font-mono text-[#1F2933]">
                      M05
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#1F2933]">Air-Jet Loom 02</p>
                      <p className="text-[10px] text-[#667085] font-mono">Cascade Impact: 2 Downstream</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      HEALTHY
                    </span>
                    <p className="text-[10px] font-mono text-[#667085] mt-0.5">RUL: 62 hrs</p>
                  </div>
                </div>
              </div>

              {/* Bottom Insight Box */}
              <div className="p-3 rounded-lg bg-[#FFF3C4]/60 border border-[#F4B400]/40 flex items-start gap-2.5">
                <Wrench className="w-4 h-4 text-[#1F2933] shrink-0 mt-0.5" />
                <div className="text-xs text-[#1F2933]">
                  <span className="font-bold">Prescriptive Action:</span> Inspect bearing &amp; lubricate spindle shaft before shift 2 to prevent $2,400 cascade downtime.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
