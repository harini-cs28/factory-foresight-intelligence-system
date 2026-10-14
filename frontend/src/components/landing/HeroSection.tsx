import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { HeroSlideshow } from "./HeroSlideshow";

export const HeroSection: React.FC = () => {
  return (
    <HeroSlideshow>
      <div className="max-w-2xl space-y-4 sm:space-y-6">
        {/* AI Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FFFFFF]/90 backdrop-blur-xs border border-[#F4B400] shadow-xs">
          <span className="w-2 h-2 rounded-full bg-[#F4B400] animate-pulse" />
          <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-[#1F2933]">
            AI-POWERED SMART MANUFACTURING INTELLIGENCE
          </span>
        </div>

        {/* Dominant Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-[#1F2933] tracking-tight leading-[1.02] text-left">
          Predict. Prevent. <br />
          <span className="text-[#F4B400]">Optimize.</span>
        </h1>

        {/* Short Description */}
        <p className="text-sm sm:text-base text-[#1F2933]/90 sm:text-[#667085] leading-relaxed max-w-lg font-normal text-left">
          AI-powered manufacturing intelligence for predicting machine failures, understanding production impact, and making smarter maintenance decisions.
        </p>

        {/* Direct CTA Buttons */}
        <div className="flex flex-row items-center gap-3.5 pt-2">
          <Link
            to="/login"
            className="inline-flex items-center justify-center gap-2 px-7 sm:px-8 py-3.5 rounded-xl text-xs sm:text-sm font-bold text-[#1F2933] bg-[#F4B400] hover:bg-[#D99A00] shadow-md shadow-[#F4B400]/25 transition-all transform hover:-translate-y-0.5"
          >
            <span>GET STARTED</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            to="/login"
            className="inline-flex items-center justify-center px-7 sm:px-8 py-3.5 rounded-xl text-xs sm:text-sm font-semibold text-[#1F2933] bg-[#FFFFFF] hover:bg-[#FFFDF5] border border-[#E5E7EB] hover:border-[#D99A00]/50 transition-all shadow-xs"
          >
            <span>LOGIN</span>
          </Link>
        </div>
      </div>
    </HeroSlideshow>
  );
};
