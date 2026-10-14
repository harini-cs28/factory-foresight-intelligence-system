import React from "react";
import { Link } from "react-router-dom";
import { Factory, ArrowRight } from "lucide-react";

export const LandingNavbar: React.FC = () => {
  return (
    <header className="w-full bg-[#FFFFFF] border-b border-[#E5E7EB] h-[72px] shrink-0 z-50">
      <div className="w-full h-full px-6 sm:px-10 lg:px-16 flex items-center justify-between">
        {/* Brand Identity */}
        <Link to="/" className="flex items-center gap-3.5 group">
          <div className="w-9 h-9 rounded-xl bg-[#F4B400] flex items-center justify-center text-[#1F2933] shadow-sm transition-transform group-hover:scale-105">
            <Factory className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold text-[#1F2933] font-mono tracking-wider">
                FFIS
              </span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#FFF3C4] text-[#1F2933] border border-[#F4B400]/50">
                ENTERPRISE
              </span>
            </div>
            <p className="text-xs text-[#667085] font-medium leading-none">
              Factory Foresight Intelligence
            </p>
          </div>
        </Link>

        {/* Action Buttons: Only Login & Get Started */}
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-xs font-semibold text-[#1F2933] bg-[#FFFFFF] hover:bg-[#FFFDF5] border border-[#E5E7EB] hover:border-[#D99A00]/50 transition-all shadow-xs"
          >
            Login
          </Link>

          <Link
            to="/login"
            className="inline-flex items-center justify-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-[#1F2933] bg-[#F4B400] hover:bg-[#D99A00] shadow-md shadow-[#F4B400]/20 transition-all transform hover:-translate-y-0.5"
          >
            <span>Get Started</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </header>
  );
};
