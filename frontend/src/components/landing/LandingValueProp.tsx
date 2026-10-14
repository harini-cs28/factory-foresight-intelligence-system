import React from "react";
import { Activity, Clock, Share2, Wrench } from "lucide-react";

export const LandingValueProp: React.FC = () => {
  const capabilities = [
    {
      icon: Activity,
      title: "Predict Machine Failures",
      description:
        "Trained Random Forest and Gradient Boosting algorithms continuously monitor vibration, temperature, current, and noise to detect anomalies before catastrophic failure occurs.",
      metric: "98.88% Accuracy",
    },
    {
      icon: Clock,
      title: "Estimate Remaining Useful Life",
      description:
        "High-precision regression forecasting computes dynamic machine RUL in operating hours, empowering engineers to schedule repairs before unexpected breakdown.",
      metric: "Continuous RUL Hours",
    },
    {
      icon: Share2,
      title: "Analyze Cascade Impact",
      description:
        "Graph-based Breadth-First Search (BFS) evaluates interconnected production dependencies, quantifying potential downtime cost and downstream line disruptions.",
      metric: "Multi-Level Propagation",
    },
    {
      icon: Wrench,
      title: "Recommend Maintenance Actions",
      description:
        "Deterministic decision-support engine integrates machine risk, technician availability, spare parts readiness, and production schedules into prescriptive actions.",
      metric: "Actionable Guidance",
    },
  ];

  return (
    <section id="capabilities" className="py-20 bg-[#FFFDF5] border-y border-[#E5E8E6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFF3C4] border border-[#F4B400]/40 text-[#1F2933] text-xs font-mono font-bold mb-3">
            <span>CORE CAPABILITIES</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1F2933] tracking-tight">
            Engineered for Industrial Reliability
          </h2>
          <p className="mt-3 text-base sm:text-lg text-[#667085]">
            From raw sensor telemetry to prescriptive maintenance execution, FFIS delivers end-to-end intelligence across your manufacturing floor.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {capabilities.map((cap, idx) => {
            const Icon = cap.icon;
            return (
              <div
                key={idx}
                className="bg-[#FFFFFF] rounded-2xl p-6 border border-[#E5E8E6] hover:border-[#F4B400] hover:shadow-lg hover:shadow-[#F4B400]/10 transition-all duration-200 flex flex-col justify-between group"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-[#FFF3C4] flex items-center justify-center text-[#1F2933] mb-5 group-hover:bg-[#F4B400] transition-colors">
                    <Icon className="w-6 h-6 text-[#1F2933]" />
                  </div>
                  <h3 className="text-lg font-bold text-[#1F2933] mb-2">
                    {cap.title}
                  </h3>
                  <p className="text-sm text-[#667085] leading-relaxed">
                    {cap.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#E5E8E6] flex items-center justify-between">
                  <span className="text-xs font-mono font-semibold text-[#1F2933]">
                    {cap.metric}
                  </span>
                  <span className="text-xs font-mono text-[#F4B400] font-bold">
                    0{idx + 1}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
