import React from "react";
import {
  Radio,
  Database,
  Cpu,
  AlertTriangle,
  GitFork,
  BrainCircuit,
  Wrench,
  ArrowRight,
} from "lucide-react";

export const LandingHowItWorks: React.FC = () => {
  const steps = [
    {
      id: "01",
      name: "SENSORS",
      title: "Sensor Ingestion",
      desc: "Vibration, temperature, current, load & oil telemetry streamed at edge.",
      icon: Radio,
    },
    {
      id: "02",
      name: "DATA",
      title: "Data Pipeline",
      desc: "Feature engineering, scaling, and operational baseline validation.",
      icon: Database,
    },
    {
      id: "03",
      name: "AI PREDICTION",
      title: "ML & RUL Inference",
      desc: "Random Forest failure classification & gradient-boosted RUL forecasting.",
      icon: Cpu,
    },
    {
      id: "04",
      name: "RISK ANALYSIS",
      title: "SHAP Attribution",
      desc: "Model explainability reveals top sensor contributors to machine risk.",
      icon: AlertTriangle,
    },
    {
      id: "05",
      name: "IMPACT ANALYSIS",
      title: "Cascade Graph (BFS)",
      desc: "Multi-line dependency propagation evaluates downstream downtime risk.",
      icon: GitFork,
    },
    {
      id: "06",
      name: "DECISION SUPPORT",
      title: "Prescriptive Rules",
      desc: "Cross-references shift windows, technician rosters, and spare parts.",
      icon: BrainCircuit,
    },
    {
      id: "07",
      name: "MAINTENANCE ACTION",
      title: "Intelligent Execution",
      desc: "Targeted work orders and alerts delivered to maintenance engineers.",
      icon: Wrench,
    },
  ];

  return (
    <section id="how-it-works" className="py-20 bg-[#FFFFFF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFF3C4] border border-[#F4B400]/40 text-[#1F2933] text-xs font-mono font-bold mb-3">
            <span>OPERATIONAL PIPELINE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1F2933] tracking-tight">
            How FFIS Works
          </h2>
          <p className="mt-3 text-base sm:text-lg text-[#667085]">
            A continuous, transparent data pipeline converting physical telemetry into high-confidence maintenance actions.
          </p>
        </div>

        {/* Steps Flow Display */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isLast = idx === steps.length - 1;

            return (
              <div key={step.id} className="relative flex flex-col items-center">
                {/* Step Card */}
                <div className="w-full bg-[#FFFDF5] rounded-xl p-4 border border-[#E5E8E6] hover:border-[#F4B400] transition-all text-center flex flex-col items-center justify-between h-full group hover:shadow-md">
                  <div className="w-full flex items-center justify-between mb-3 text-[11px] font-mono text-[#667085]">
                    <span className="font-bold text-[#F4B400]">{step.id}</span>
                    <span className="px-1.5 py-0.5 rounded bg-[#FFF3C4] text-[#1F2933] text-[9px] font-bold">
                      {step.name}
                    </span>
                  </div>

                  <div className="w-10 h-10 rounded-lg bg-[#FFFFFF] border border-[#E5E8E6] flex items-center justify-center text-[#1F2933] my-2 group-hover:bg-[#F4B400] transition-colors shadow-xs">
                    <Icon className="w-5 h-5 text-[#1F2933]" />
                  </div>

                  <div className="my-2">
                    <h4 className="text-xs font-bold text-[#1F2933] mb-1">
                      {step.title}
                    </h4>
                    <p className="text-[11px] text-[#667085] leading-normal">
                      {step.desc}
                    </p>
                  </div>
                </div>

                {/* Arrow to Next Step (Desktop) */}
                {!isLast && (
                  <div className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-[#F4B400]">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
