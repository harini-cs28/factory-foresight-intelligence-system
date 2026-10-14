import React from "react";
import { LandingNavbar } from "./LandingNavbar";
import { HeroSection } from "./HeroSection";
import { LandingFooter } from "./LandingFooter";

export const LandingPage: React.FC = () => {
  return (
    <div className="h-screen max-h-screen w-screen overflow-hidden flex flex-col justify-between bg-[#FFFFFF] text-[#1F2933] font-sans selection:bg-[#FFF3C4] selection:text-[#1F2933] m-0 p-0">
      {/* 1. Flat White Top Navbar (72px) */}
      <LandingNavbar />

      {/* 2. Full-Width Edge-to-Edge Factory Hero (Dynamic Remaining Height) */}
      <main className="flex-1 min-h-0 w-full overflow-hidden flex flex-col m-0 p-0 border-0 rounded-none shadow-none">
        <HeroSection />
      </main>

      {/* 3. Minimal Bottom Footer (42px) */}
      <LandingFooter />
    </div>
  );
};
