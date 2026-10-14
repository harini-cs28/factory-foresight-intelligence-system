import React from "react";
import { CheckCircle2, ShieldAlert, CalendarClock, TrendingUp, Network, Sparkles } from "lucide-react";

export const LandingWhyFFIS: React.FC = () => {
  const benefits = [
    {
      icon: ShieldAlert,
      title: "Reduced Unplanned Downtime",
      description:
        "Proactively identifies abnormal vibration and thermal signatures before machinery stalls, preventing sudden line shutdowns.",
    },
    {
      icon: CalendarClock,
      title: "Better Maintenance Planning",
      description:
        "Aligns required machine servicing with planned shift changeovers and scheduled maintenance windows without interrupting peak production.",
    },
    {
      icon: Sparkles,
      title: "Early Risk Identification",
      description:
        "Multi-sensor feature attribution pinpoints early mechanical wear, high electrical loads, or low lubricant levels weeks in advance.",
    },
    {
      icon: Network,
      title: "Production Impact Visibility",
      description:
        "Instant graph traversal maps out which downstream spinning frames, looms, or finishing units will be impacted by upstream machine failure.",
    },
    {
      icon: TrendingUp,
      title: "Data-Driven Maintenance Decisions",
      description:
        "Eliminates guesswork by combining ML failure probabilities, continuous RUL forecasts, and inventory readiness into clear actions.",
    },
  ];

  return (
    <section id="why-ffis" className="py-20 bg-[#FFFDF5] border-t border-[#E5E8E6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left: Summary text */}
          <div className="lg:col-span-5 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFF3C4] border border-[#F4B400]/40 text-[#1F2933] text-xs font-mono font-bold">
              <span>BUSINESS &amp; OPERATIONAL IMPACT</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1F2933] tracking-tight">
              Why Factory Leaders Choose FFIS
            </h2>
            <p className="text-base text-[#667085] leading-relaxed">
              Modern textile operations cannot afford unexpected machinery halts. FFIS transforms raw telemetry into executive confidence and plant floor reliability.
            </p>

            <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#E5E8E6] shadow-xs space-y-2">
              <div className="flex items-center gap-2 text-sm font-bold text-[#1F2933]">
                <CheckCircle2 className="w-4 h-4 text-[#F4B400]" />
                <span>Zero Hardcoded Guesswork</span>
              </div>
              <p className="text-xs text-[#667085] leading-normal">
                Every prediction, RUL estimate, and maintenance recommendation is backed by real mathematical models and deterministic constraints.
              </p>
            </div>
          </div>

          {/* Right: 5 Benefits Cards */}
          <div className="lg:col-span-7 space-y-3.5">
            {benefits.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="bg-[#FFFFFF] rounded-xl p-4 sm:p-5 border border-[#E5E8E6] hover:border-[#F4B400] transition-all flex items-start gap-4 shadow-xs"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#FFF3C4] flex items-center justify-center text-[#1F2933] shrink-0 mt-0.5">
                    <Icon className="w-5 h-5 text-[#1F2933]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#1F2933] mb-1">
                      {item.title}
                    </h3>
                    <p className="text-xs text-[#667085] leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
