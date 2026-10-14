import React from "react";
import { Factory } from "lucide-react";

export const LandingFooter: React.FC = () => {
  return (
    <footer className="w-full bg-[#FFFFFF] border-t border-[#E5E7EB] h-[42px] shrink-0 flex items-center justify-between px-6 sm:px-10 lg:px-16 z-50">
      {/* Brand */}
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded bg-[#F4B400] flex items-center justify-center text-[#1F2933]">
          <Factory className="w-2.5 h-2.5" />
        </div>
        <span className="text-xs font-bold font-mono text-[#1F2933] tracking-wide">
          FFIS
        </span>
        <span className="text-[11px] text-[#667085] font-medium">
          • Factory Foresight Intelligence
        </span>
      </div>

      {/* Minimal Copyright */}
      <p className="text-[11px] text-[#667085] font-mono">
        © {new Date().getFullYear()} FFIS. All rights reserved.
      </p>
    </footer>
  );
};
