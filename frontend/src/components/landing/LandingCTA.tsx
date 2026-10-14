import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck } from "lucide-react";

export const LandingCTA: React.FC = () => {
  return (
    <section className="py-20 bg-[#FFFDF5] border-t border-[#E5E8E6] relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#1F2933_1px,transparent_1px)] [background-size:24px_24px]" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFF3C4] border border-[#F4B400]/40 text-[#1F2933] text-xs font-mono font-bold">
          <ShieldCheck className="w-4 h-4 text-[#F4B400]" />
          <span>PRODUCTION-READY INTELLIGENCE</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-extrabold text-[#1F2933] tracking-tight">
          Start Monitoring Your Factory
        </h2>

        <p className="text-base sm:text-lg text-[#667085] max-w-2xl mx-auto leading-relaxed">
          Deploy machine health predictions, RUL estimations, cascade risk analysis, and automated maintenance decisions across your manufacturing plant.
        </p>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl text-base font-bold text-[#1F2933] bg-[#F4B400] hover:bg-[#e0a400] shadow-lg shadow-[#F4B400]/30 transition-all transform hover:-translate-y-0.5"
          >
            <span>Enter FFIS</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        <p className="text-xs text-[#667085] font-mono pt-4">
          Synthetic textile manufacturing dataset used for prototype development and system validation.
        </p>
      </div>
    </section>
  );
};
