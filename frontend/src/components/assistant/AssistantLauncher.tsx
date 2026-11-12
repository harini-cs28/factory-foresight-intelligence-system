import React, { useState } from "react";
import { AssistantAvatar } from "./AssistantAvatar";
import { AssistantPanel } from "./AssistantPanel";
import { MessageSquare, Sparkles } from "lucide-react";

export const AssistantLauncher: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);

  const handleOpen = () => {
    setIsOpen(true);
    setIsMinimized(false);
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsMinimized(false);
  };

  const handleToggleMinimize = () => {
    setIsMinimized((prev) => !prev);
  };

  return (
    <>
      {/* Floating Circular Launcher Button (visible when panel is not open or when open but not minimized) */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
          {/* Friendly Tooltip / Greeting Pill */}
          <div className="hidden md:flex items-center gap-2 bg-[#FFFFFF] border border-[#E5E7EB] px-3.5 py-1.5 rounded-2xl shadow-lg shadow-[#F4B400]/10 text-xs text-[#1F2933] font-medium pointer-events-none select-none animate-bounce [animation-duration:3s]">
            <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
            <span>Need maintenance insights?</span>
            <span className="text-[#D99A00] font-bold">Ask AI Robot</span>
          </div>

          {/* Floating Circular Robot Button */}
          <button
            type="button"
            onClick={handleOpen}
            className="group relative w-16 h-16 rounded-full bg-white border-2 border-[#F4B400] shadow-xl hover:shadow-2xl hover:shadow-[#F4B400]/30 transition-all duration-300 hover:scale-110 flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-[#FFF3C4]"
            aria-label="Open FFIS Maintenance AI Robot Assistant"
            title="Open FFIS Maintenance AI Robot Assistant (Tamil & English)"
          >
            {/* Outer Subtle Pulse Ring */}
            <span className="absolute inset-0 rounded-full bg-[#F4B400]/20 animate-ping [animation-duration:3s] pointer-events-none" />

            {/* Mascot Image */}
            <div className="w-14 h-14 rounded-full overflow-hidden flex items-center justify-center p-0.5">
              <img
                src="/assets/robot_assistant.png"
                alt="FFIS AI Maintenance Assistant Robot"
                className="w-full h-full object-cover rounded-full"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = "none";
                }}
              />
            </div>

            {/* Glowing Status Dot */}
            <span
              className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-[#22C55E] border-2 border-white shadow-sm"
              title="Assistant Online"
            />

            {/* Badge overlay on hover */}
            <span className="absolute -top-1 -right-1 bg-[#F4B400] text-[#1F2933] p-1 rounded-full shadow-xs border border-white opacity-0 group-hover:opacity-100 transition-opacity">
              <Sparkles className="w-3 h-3" />
            </span>
          </button>
        </div>
      )}

      {/* Embedded Floating Assistant Panel */}
      <AssistantPanel
        isOpen={isOpen}
        onClose={handleClose}
        isMinimized={isMinimized}
        onToggleMinimize={handleToggleMinimize}
      />
    </>
  );
};
