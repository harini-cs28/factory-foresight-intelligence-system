import React from "react";
import { Bot } from "lucide-react";
import { Robot3DCanvas } from "./Robot3DCanvas";

interface AssistantAvatarProps {
  size?: "sm" | "md" | "lg" | "xl";
  isListening?: boolean;
  isSpeaking?: boolean;
  isThinking?: boolean;
  use3D?: boolean;
  className?: string;
  onClick?: () => void;
}

export const AssistantAvatar: React.FC<AssistantAvatarProps> = ({
  size = "md",
  isListening = false,
  isSpeaking = false,
  isThinking = false,
  use3D = false,
  className = "",
  onClick,
}) => {
  const sizeMap = {
    sm: { px: 36, imgSize: "w-9 h-9" },
    md: { px: 48, imgSize: "w-12 h-12" },
    lg: { px: 64, imgSize: "w-16 h-16" },
    xl: { px: 110, imgSize: "w-28 h-28" },
  };

  const { px, imgSize } = sizeMap[size];

  return (
    <div
      onClick={onClick}
      className={`relative inline-flex items-center justify-center rounded-full select-none ${className}`}
      style={{ width: px, height: px }}
    >
      {/* Outer Pulse Rings for Active State */}
      {isListening && (
        <span className="absolute inset-0 rounded-full bg-[#F4B400] opacity-40 animate-ping" />
      )}
      {isSpeaking && (
        <span className="absolute -inset-1 rounded-full border-2 border-[#D99A00] animate-pulse" />
      )}
      {isThinking && (
        <span className="absolute -inset-1 rounded-full border-2 border-dashed border-[#F4B400] animate-spin" />
      )}

      {/* Avatar Container with Warm Border and Shadow */}
      <div
        className={`relative ${imgSize} rounded-full overflow-hidden flex items-center justify-center bg-white border-2 transition-transform duration-200 shadow-md ${
          isListening
            ? "border-[#F59E0B] ring-2 ring-[#FFF3C4]"
            : isSpeaking
            ? "border-[#D99A00] ring-2 ring-[#F4B400]/40"
            : "border-[#F4B400] hover:scale-105"
        }`}
      >
        {use3D ? (
          <Robot3DCanvas
            size={px}
            isListening={isListening}
            isSpeaking={isSpeaking}
            isThinking={isThinking}
          />
        ) : (
          <>
            <Bot className="w-2/3 h-2/3 text-[#D99A00] absolute" />
            <img
              src="/assets/robot_assistant.png"
              alt="FFIS AI Maintenance Assistant Robot"
              className="w-full h-full object-cover rounded-full relative z-10"
              onError={(e) => {
                (e.currentTarget as HTMLElement).style.display = "none";
              }}
            />
          </>
        )}
      </div>

      {/* Dynamic Status Indicator Dot (bottom right) */}
      <span
        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white shadow-sm ${
          isListening
            ? "bg-[#3B82F6] animate-pulse"
            : isSpeaking
            ? "bg-[#22C55E] animate-bounce"
            : isThinking
            ? "bg-[#F59E0B]"
            : "bg-[#22C55E]"
        }`}
        title={
          isListening
            ? "Listening..."
            : isSpeaking
            ? "Speaking..."
            : isThinking
            ? "Thinking..."
            : "Ready / Online"
        }
      />
    </div>
  );
};
