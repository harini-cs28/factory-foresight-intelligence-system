import React, { useRef, useEffect } from "react";
import {
  Volume2,
  AlertTriangle,
  CheckCircle2,
  Activity,
  Layers,
  Wrench,
  Clock,
  Sparkles,
  Info,
} from "lucide-react";
import { ChatMessage, AssistantSourceData } from "../../types/assistant";
import { AssistantAvatar } from "./AssistantAvatar";

interface ChatMessagesProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onSpeak: (text: string, lang: string) => void;
  isSpeaking: boolean;
}

export const ChatMessages: React.FC<ChatMessagesProps> = ({
  messages,
  isLoading,
  onSpeak,
  isSpeaking,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Simple, robust inline markdown renderer for formatting text, bold, lists, and code
  const renderFormattedText = (raw: string) => {
    const lines = raw.split("\n");
    return lines.map((line, idx) => {
      // Handle blockquotes / notices
      if (line.startsWith("> ") || line.startsWith("*Notice:") || line.startsWith("*குறிப்பு:")) {
        return (
          <div
            key={idx}
            className="my-2 p-2 bg-[#FFFDF5] border-l-4 border-[#F4B400] text-xs text-[#667085] rounded-r italic"
          >
            {line.replace(/^>\s*/, "")}
          </div>
        );
      }

      // Format bold and backtick code
      const parts = line.split(/(\*\*.*?\*\*|`.*?`)/g);
      const renderedParts = parts.map((part, pIdx) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={pIdx} className="font-semibold text-[#1F2933]">
              {part.slice(2, -2)}
            </strong>
          );
        }
        if (part.startsWith("`") && part.endsWith("`")) {
          return (
            <code
              key={pIdx}
              className="bg-[#FFF3C4]/60 text-[#1F2933] px-1 py-0.5 rounded text-[11px] font-mono border border-[#F4B400]/30"
            >
              {part.slice(1, -1)}
            </code>
          );
        }
        return part;
      });

      // Bullets
      if (line.startsWith("• ") || line.startsWith("- ")) {
        return (
          <div key={idx} className="flex items-start gap-1.5 my-1 text-xs">
            <span className="text-[#F4B400] text-base leading-none">•</span>
            <div className="flex-1">{renderedParts}</div>
          </div>
        );
      }

      // Empty line spacing
      if (!line.trim()) {
        return <div key={idx} className="h-1.5" />;
      }

      return (
        <p key={idx} className="my-1 text-xs leading-relaxed">
          {renderedParts}
        </p>
      );
    });
  };

  const renderSourceDataCard = (data: AssistantSourceData) => {
    const health = data.health_status || "UNKNOWN";
    const healthColor =
      health === "HEALTHY"
        ? "text-[#22C55E] bg-[#22C55E]/10 border-[#22C55E]/30"
        : health === "AT_RISK"
        ? "text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/30"
        : "text-[#EF4444] bg-[#EF4444]/10 border-[#EF4444]/30";

    return (
      <div className="mt-2.5 pt-2 border-t border-[#E5E7EB] bg-[#FFFDF5]/70 -mx-3 -mb-3 p-3 rounded-b-xl text-[11px] space-y-2">
        <div className="flex items-center justify-between font-semibold text-[#1F2933]">
          <span className="flex items-center gap-1 text-[#D99A00]">
            <Activity className="w-3.5 h-3.5" />
            Live Machine Context: {data.machine_id}
          </span>
          <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${healthColor}`}>
            {health}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          {data.failure_probability !== undefined && (
            <div className="p-1.5 bg-white border border-[#E5E7EB] rounded-lg">
              <span className="text-[#667085] block text-[10px]">Failure Risk</span>
              <span className="font-semibold text-[#1F2933]">
                {(data.failure_probability * 100).toFixed(1)}%
              </span>
            </div>
          )}
          {data.predicted_rul !== undefined && (
            <div className="p-1.5 bg-white border border-[#E5E7EB] rounded-lg">
              <span className="text-[#667085] block text-[10px]">Estimated RUL</span>
              <span className="font-semibold text-[#1F2933]">
                {data.predicted_rul.toFixed(1)} cycles
              </span>
            </div>
          )}
        </div>

        {data.recommended_action && (
          <div className="p-1.5 bg-white border border-[#E5E7EB] rounded-lg flex items-start gap-1.5">
            <Wrench className="w-3.5 h-3.5 text-[#F4B400] flex-shrink-0 mt-0.5" />
            <div>
              <span className="text-[#667085] block text-[10px]">
                Recommended Action ({data.priority || "MEDIUM"})
              </span>
              <span className="font-medium text-[#1F2933]">{data.recommended_action}</span>
            </div>
          </div>
        )}

        {data.affected_machine_count > 0 && (
          <div className="p-1.5 bg-white border border-[#E5E7EB] rounded-lg flex items-center justify-between">
            <span className="text-[#667085] flex items-center gap-1">
              <Layers className="w-3 h-3 text-[#D99A00]" />
              Downstream Impact
            </span>
            <span className="font-semibold text-[#1F2933]">
              {data.affected_machine_count} machine(s) affected
            </span>
          </div>
        )}

        {data.data_sources && data.data_sources.length > 0 && (
          <div className="flex items-center gap-1 text-[10px] text-[#667085] pt-1">
            <Info className="w-3 h-3 text-[#F4B400]" />
            <span className="truncate">Grounded in: {data.data_sources.slice(0, 3).join(", ")}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#FFFFFF]">
      {/* Friendly Welcome Greeting if messages are empty */}
      {messages.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full text-center p-6 text-[#1F2933] space-y-3 animate-fade-in">
          <AssistantAvatar size="xl" use3D={false} />
          <div className="max-w-xs space-y-1">
            <h3 className="font-bold text-sm text-[#1F2933]">
              வணக்கம்! I am your FFIS Maintenance Assistant
            </h3>
            <p className="text-xs text-[#667085]">
              Ask me about machine risk, sensor explainability, RUL estimations, or cascade impact in
              English, தமிழ், or Tanglish.
            </p>
          </div>
          <div className="inline-flex items-center gap-1 text-[11px] text-[#D99A00] font-medium bg-[#FFF3C4] px-2.5 py-1 rounded-full border border-[#F4B400]/40">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Select a quick question below to begin</span>
          </div>
        </div>
      )}

      {/* Message Stream */}
      {messages.map((msg) => {
        const isUser = msg.sender === "user";
        return (
          <div
            key={msg.id}
            className={`flex items-start gap-2.5 animate-fade-in ${
              isUser ? "flex-row-reverse" : "flex-row"
            }`}
          >
            {/* Avatar */}
            {!isUser && <AssistantAvatar size="sm" isSpeaking={isSpeaking} />}

            {/* Bubble */}
            <div
              className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 shadow-sm transition-all text-[#1F2933] ${
                isUser
                  ? "bg-[#FFF3C4] border border-[#F4B400]/50 rounded-tr-none text-right"
                  : "bg-[#FFFFFF] border border-[#E5E7EB] rounded-tl-none hover:border-[#F4B400]/60"
              }`}
            >
              {/* Message Header (Sender + Speak Button) */}
              <div className="flex items-center justify-between gap-3 mb-1 text-[10px] text-[#667085]">
                <span className="font-medium">
                  {isUser ? "You (Maintenance Engineer)" : "FFIS Assistant"}
                </span>
                <div className="flex items-center gap-1">
                  <span>{msg.timestamp}</span>
                  {!isUser && (
                    <button
                      type="button"
                      onClick={() => onSpeak(msg.text, msg.language)}
                      className="p-1 rounded hover:bg-[#FFF3C4] text-[#D99A00] transition-colors"
                      title="Read aloud"
                    >
                      <Volume2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Message Body */}
              <div className="text-left">{renderFormattedText(msg.text)}</div>

              {/* Source Data Card if available */}
              {!isUser && msg.sourceData && renderSourceDataCard(msg.sourceData)}
            </div>
          </div>
        );
      })}

      {/* Thinking Indicator */}
      {isLoading && (
        <div className="flex items-start gap-2.5 animate-pulse">
          <AssistantAvatar size="sm" isThinking={true} />
          <div className="bg-[#FFFDF5] border border-[#F4B400]/40 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm flex items-center gap-2">
            <span className="text-xs text-[#667085] font-medium">Analyzing telemetry & models</span>
            <span className="flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F4B400] animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#D99A00] animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] animate-bounce [animation-delay:0.4s]" />
            </span>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
};
