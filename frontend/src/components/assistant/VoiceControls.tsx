import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Volume2, VolumeX, AlertCircle, Sparkles } from "lucide-react";
import { AssistantLanguage } from "../../types/assistant";

interface VoiceControlsProps {
  language: AssistantLanguage;
  onTranscript: (text: string) => void;
  isListening: boolean;
  setIsListening: (val: boolean) => void;
  isSpeaking: boolean;
  onStopSpeaking: () => void;
  disabled?: boolean;
}

// Window type extension for WebkitSpeechRecognition
interface IWindow extends Window {
  webkitSpeechRecognition?: any;
  SpeechRecognition?: any;
}

export const VoiceControls: React.FC<VoiceControlsProps> = ({
  language,
  onTranscript,
  isListening,
  setIsListening,
  isSpeaking,
  onStopSpeaking,
  disabled = false,
}) => {
  const [speechSupported, setSpeechSupported] = useState<boolean>(true);
  const [tamilVoiceAvailable, setTamilVoiceAvailable] = useState<boolean>(true);
  const [notice, setNotice] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  // Check browser speech recognition & synthesis capabilities
  useEffect(() => {
    const win = window as unknown as IWindow;
    const hasRecognition = !!(win.SpeechRecognition || win.webkitSpeechRecognition);
    const hasSynthesis = typeof window !== "undefined" && "speechSynthesis" in window;

    if (!hasRecognition) {
      setSpeechSupported(false);
    }

    if (hasSynthesis) {
      const checkVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        const hasTamil = voices.some(
          (v) => v.lang.startsWith("ta") || v.name.toLowerCase().includes("tamil")
        );
        setTamilVoiceAvailable(hasTamil);
      };

      checkVoices();
      window.speechSynthesis.onvoiceschanged = checkVoices;
    }
  }, []);

  // Cleanup speech on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const startListening = () => {
    const win = window as unknown as IWindow;
    const SpeechRecognitionClass = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      setNotice("Speech recognition is not supported in this browser. Please use text chat.");
      return;
    }

    try {
      const recognition = new SpeechRecognitionClass();
      recognitionRef.current = recognition;

      // Locale configuration
      recognition.lang = language === "ta" ? "ta-IN" : "en-IN";
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      recognition.continuous = false;

      recognition.onstart = () => {
        setIsListening(true);
        setNotice(null);
      };

      recognition.onresult = (event: any) => {
        let currentTranscript = "";
        for (let i = 0; i < event.results.length; ++i) {
          currentTranscript += event.results[i][0].transcript;
        }
        if (currentTranscript) {
          onTranscript(currentTranscript);
        }
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        if (event.error === "not-allowed") {
          setNotice("Microphone permission denied. Enable microphone in browser settings.");
        } else if (event.error !== "no-speech") {
          setNotice(`Voice input status: ${event.error}. You can continue with text chat.`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      setIsListening(false);
      setNotice("Could not start voice recognition. Please use text chat.");
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    setIsListening(false);
  };

  const toggleMic = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      {/* Notice Banner if unsupported or error */}
      {notice && (
        <div className="flex items-center justify-between text-xs bg-[#FFFDF5] border border-[#F4B400]/40 text-[#1F2933] px-2.5 py-1.5 rounded-lg shadow-sm animate-fade-in">
          <div className="flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-[#F59E0B] flex-shrink-0" />
            <span>{notice}</span>
          </div>
          <button
            onClick={() => setNotice(null)}
            className="text-[#667085] hover:text-[#1F2933] ml-2 text-xs font-semibold"
          >
            ×
          </button>
        </div>
      )}

      {/* Voice Warning if Tamil selected but no Tamil voice engine installed on client OS */}
      {language === "ta" && !tamilVoiceAvailable && (
        <div className="flex items-center gap-1.5 text-[11px] text-[#667085] bg-[#FFF3C4]/60 px-2 py-1 rounded">
          <Sparkles className="w-3 h-3 text-[#D99A00]" />
          <span>Tamil speech output depends on OS voices. Text responses are fully available.</span>
        </div>
      )}

      {/* Controls Bar */}
      <div className="flex items-center gap-2">
        {/* Mic Toggle Button */}
        <button
          type="button"
          onClick={toggleMic}
          disabled={disabled || !speechSupported}
          className={`relative p-2 rounded-xl transition-all duration-200 flex items-center justify-center ${
            isListening
              ? "bg-[#EF4444] text-white shadow-md animate-pulse ring-2 ring-[#EF4444]/40"
              : "bg-[#FFFDF5] text-[#1F2933] border border-[#E5E7EB] hover:bg-[#FFF3C4] hover:border-[#F4B400]"
          } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
          title={
            !speechSupported
              ? "Speech recognition not supported in this browser"
              : isListening
              ? `Listening (${language === "ta" ? "தமிழ் - ta-IN" : "English - en-IN"}). Click to stop.`
              : `Voice input in ${language === "ta" ? "Tamil (ta-IN)" : "English (en-IN)"}`
          }
        >
          {isListening ? (
            <Mic className="w-4 h-4 text-white" />
          ) : (
            <Mic className="w-4 h-4 text-[#1F2933]" />
          )}
        </button>

        {/* Active Speaking Indicator & Stop Button */}
        {isSpeaking && (
          <button
            type="button"
            onClick={onStopSpeaking}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#FFF3C4] border border-[#D99A00] text-[#1F2933] text-xs font-medium hover:bg-[#F4B400] transition-colors shadow-sm animate-pulse"
            title="Stop audio readout"
          >
            <Volume2 className="w-3.5 h-3.5 text-[#D99A00] animate-bounce" />
            <span>Speaking... Click to Stop</span>
            <VolumeX className="w-3.5 h-3.5 text-[#667085] ml-1" />
          </button>
        )}
      </div>
    </div>
  );
};
