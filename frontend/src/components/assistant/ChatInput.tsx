import React, { useState, useRef, useEffect } from "react";
import { Send, Trash2 } from "lucide-react";
import { VoiceControls } from "./VoiceControls";
import { AssistantLanguage } from "../../types/assistant";

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  language: AssistantLanguage;
  isListening: boolean;
  setIsListening: (val: boolean) => void;
  isSpeaking: boolean;
  onStopSpeaking: () => void;
  onClearConversation: () => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading,
  language,
  isListening,
  setIsListening,
  isSpeaking,
  onStopSpeaking,
  onClearConversation,
}) => {
  const [inputText, setInputText] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const placeholderText =
    language === "ta"
      ? "இயந்திர இடர் அல்லது நிலை பற்றிக் கேளுங்கள்..."
      : language === "tanglish"
      ? "Machine risk pathi kelunga..."
      : "Ask about machine risk, sensors, RUL, or actions...";

  // Append or update recognized voice transcript into the chat input
  const handleVoiceTranscript = (transcript: string) => {
    setInputText(transcript);
  };

  const handleSend = () => {
    const trimmed = inputText.trim();
    if (!trimmed || isLoading) return;
    onSendMessage(trimmed);
    setInputText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-3 bg-[#FFFDF5] border-t border-[#E5E7EB] space-y-2">
      <div className="flex items-center justify-between text-[11px] text-[#667085]">
        <div className="flex items-center gap-2">
          <VoiceControls
            language={language}
            onTranscript={handleVoiceTranscript}
            isListening={isListening}
            setIsListening={setIsListening}
            isSpeaking={isSpeaking}
            onStopSpeaking={onStopSpeaking}
            disabled={isLoading}
          />
        </div>

        <button
          type="button"
          onClick={onClearConversation}
          className="flex items-center gap-1 text-[#667085] hover:text-[#EF4444] transition-colors p-1 rounded"
          title="Clear conversation history"
        >
          <Trash2 className="w-3 h-3" />
          <span>Clear</span>
        </button>
      </div>

      {/* Input Field + Send Button */}
      <div className="relative flex items-end gap-1.5 bg-white border border-[#E5E7EB] rounded-2xl p-1.5 focus-within:border-[#F4B400] focus-within:ring-2 focus-within:ring-[#FFF3C4] transition-all shadow-sm">
        <textarea
          ref={inputRef}
          value={inputText}
          onChange={(e) => setInputText(e.target.value.slice(0, 1000))}
          onKeyDown={handleKeyDown}
          placeholder={placeholderText}
          disabled={isLoading}
          rows={1}
          className="flex-1 max-h-24 resize-none border-0 bg-transparent px-2.5 py-1 text-xs text-[#1F2933] placeholder-[#667085] focus:outline-none focus:ring-0 leading-relaxed"
        />

        <button
          type="button"
          onClick={handleSend}
          disabled={!inputText.trim() || isLoading}
          className={`p-2 rounded-xl transition-all duration-200 flex items-center justify-center ${
            inputText.trim() && !isLoading
              ? "bg-[#F4B400] text-[#1F2933] hover:bg-[#D99A00] shadow-sm hover:scale-105"
              : "bg-[#E5E7EB] text-[#667085] cursor-not-allowed"
          }`}
          title="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center justify-between text-[10px] text-[#667085] px-1">
        <span>Enter to send • Shift+Enter for newline</span>
        <span>{inputText.length}/1000</span>
      </div>
    </div>
  );
};
