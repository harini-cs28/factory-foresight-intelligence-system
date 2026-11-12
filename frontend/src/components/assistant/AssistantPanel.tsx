import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import {
  X,
  Minus,
  RotateCcw,
  Sparkles,
  Bot,
  Box,
  ChevronDown,
  Layers,
  Wrench,
  Activity,
  Maximize2,
} from "lucide-react";
import { AssistantAvatar } from "./AssistantAvatar";
import { ChatMessages } from "./ChatMessages";
import { ChatInput } from "./ChatInput";
import { assistantApi } from "../../api/assistantApi";
import { machineApi } from "../../api/machineApi";
import {
  ChatMessage,
  AssistantLanguage,
  QuickQuestionItem,
  AssistantSourceData,
} from "../../types/assistant";
import { MachineItem } from "../../types/machine";

interface AssistantPanelProps {
  isOpen: boolean;
  onClose: () => void;
  isMinimized: boolean;
  onToggleMinimize: () => void;
}

const DEFAULT_QUICK_QUESTIONS: Record<AssistantLanguage, QuickQuestionItem[]> = {
  en: [
    { id: "q1_risk", label: "Why at risk?", question: "Why is this machine at risk?", language: "en" },
    { id: "q2_prediction", label: "Failure Prediction", question: "Explain the failure prediction.", language: "en" },
    { id: "q3_rul", label: "Remaining Life (RUL)", question: "What is the machine's remaining useful life?", language: "en" },
    { id: "q4_sensors", label: "Sensor Risk Factors", question: "Which sensor readings contribute to the risk?", language: "en" },
    { id: "q5_action", label: "Recommended Action", question: "What maintenance action should I take?", language: "en" },
    { id: "q6_cascade", label: "Downstream Impact", question: "Which downstream machines may be affected?", language: "en" },
    { id: "q7_priority", label: "Maintenance Priority", question: "Why should this machine be prioritized?", language: "en" },
    { id: "q8_tamil", label: "Status in Tamil", question: "Explain the current machine status in Tamil.", language: "en" },
  ],
  ta: [
    { id: "q1_risk", label: "ஏன் ஆபத்தில்?", question: "இந்த இயந்திரம் ஏன் ஆபத்தில் உள்ளது?", language: "ta" },
    { id: "q2_prediction", label: "தோல்வி கணிப்பு", question: "தோல்வி கணிப்பை விளக்குங்கள்.", language: "ta" },
    { id: "q3_rul", label: "மீதமுள்ள ஆயுள் (RUL)", question: "இயந்திரத்தின் மீதமுள்ள பயனுள்ள ஆயுள் (RUL) என்ன?", language: "ta" },
    { id: "q4_sensors", label: "சென்சார் காரணிகள்", question: "எந்த சென்சார் அளவீடுகள் இந்த ஆபத்துக்கு காரணமாகின்றன?", language: "ta" },
    { id: "q5_action", label: "பரிந்துரை செயல்", question: "நான் என்ன பராமரிப்பு நடவடிக்கை எடுக்க வேண்டும்?", language: "ta" },
    { id: "q6_cascade", label: "கீழ்நிலை தாக்கம்", question: "எந்த கீழ்நிலை இயந்திரங்கள் பாதிக்கப்படலாம்?", language: "ta" },
    { id: "q7_priority", label: "முன்னுரிமை காரணம்", question: "இந்த இயந்திரத்திற்கு ஏன் முன்னுரிமை அளிக்க வேண்டும்?", language: "ta" },
    { id: "q8_tamil", label: "தமிழில் நிலை", question: "தற்போதைய இயந்திர நிலையை தமிழில் விளக்குங்கள்.", language: "ta" },
  ],
  tanglish: [
    { id: "q1_risk", label: "Yen risk-la irukku?", question: "Intha machine yen risk-la irukku?", language: "tanglish" },
    { id: "q2_prediction", label: "Failure Prediction", question: "Failure prediction-ai explain pannunga.", language: "tanglish" },
    { id: "q3_rul", label: "RUL Evalavu?", question: "Machine-oda Remaining Useful Life (RUL) evalavu?", language: "tanglish" },
    { id: "q4_sensors", label: "Sensor Readings", question: "Endha sensor readings intha risk-ku karanam?", language: "tanglish" },
    { id: "q5_action", label: "Maintenance Action", question: "Naan enna maintenance action edukka vendum?", language: "tanglish" },
    { id: "q6_cascade", label: "Downstream Impact", question: "Endha downstream machines affect aagum?", language: "tanglish" },
    { id: "q7_priority", label: "Priority Karanam", question: "Intha machine-ku yen priority thara vendum?", language: "tanglish" },
    { id: "q8_tamil", label: "Status in Tamil", question: "Ippo irukkura machine status-ai Tamil-la sollunga.", language: "tanglish" },
  ],
};

const DEFAULT_MACHINES: MachineItem[] = [
  { id: 1, machine_id: "SPIN-01", process: "Spinning", production_line: "Line-A", criticality: "HIGH" },
  { id: 2, machine_id: "SPIN-02", process: "Spinning", production_line: "Line-A", criticality: "MEDIUM" },
  { id: 3, machine_id: "CARD-01", process: "Carding", production_line: "Line-A", criticality: "HIGH" },
  { id: 4, machine_id: "DRAW-01", process: "Drawing", production_line: "Line-A", criticality: "MEDIUM" },
  { id: 5, machine_id: "WEAV-01", process: "Weaving", production_line: "Line-B", criticality: "HIGH" },
  { id: 6, machine_id: "WEAV-02", process: "Weaving", production_line: "Line-B", criticality: "CRITICAL" },
  { id: 7, machine_id: "DYE-01", process: "Dyeing", production_line: "Line-C", criticality: "HIGH" },
  { id: 8, machine_id: "PACK-01", process: "Packing", production_line: "Line-C", criticality: "MEDIUM" },
];

export const AssistantPanel: React.FC<AssistantPanelProps> = ({
  isOpen,
  onClose,
  isMinimized,
  onToggleMinimize,
}) => {
  const [searchParams] = useSearchParams();
  const urlMachineId = searchParams.get("machineId");

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [language, setLanguage] = useState<AssistantLanguage>("en");
  const [selectedMachineId, setSelectedMachineId] = useState<string>(urlMachineId || "SPIN-01");
  const [availableMachines, setAvailableMachines] = useState<MachineItem[]>(DEFAULT_MACHINES);
  const [quickQuestions, setQuickQuestions] = useState<QuickQuestionItem[]>(DEFAULT_QUICK_QUESTIONS.en);
  const [use3D, setUse3D] = useState<boolean>(false);

  // States
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isMachineMenuOpen, setIsMachineMenuOpen] = useState<boolean>(false);
  const [machineData, setMachineData] = useState<AssistantSourceData | null>(null);

  // Speech synthesis reference
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Load available machine records from authorized API
  useEffect(() => {
    let isMounted = true;
    machineApi
      .getMachines()
      .then((mList) => {
        if (!isMounted) return;
        setAvailableMachines(mList);
        // If no machine is selected yet and none in URL, choose the highest risk machine or first machine
        if (!urlMachineId && mList.length > 0) {
          const sorted = [...mList].sort((a, b) => {
            const aRisk = a.latest_prediction?.failure_probability || 0;
            const bRisk = b.latest_prediction?.failure_probability || 0;
            return bRisk - aRisk;
          });
          setSelectedMachineId(sorted[0].machine_id);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  // Update selected machine whenever the URL parameter changes (e.g. user navigated to a specific machine)
  useEffect(() => {
    if (urlMachineId && urlMachineId !== selectedMachineId) {
      setSelectedMachineId(urlMachineId);
    }
  }, [urlMachineId]);

  // Load quick questions when language changes
  useEffect(() => {
    let isMounted = true;
    if (DEFAULT_QUICK_QUESTIONS[language]) {
      setQuickQuestions(DEFAULT_QUICK_QUESTIONS[language]);
    }
    assistantApi
      .getQuickQuestions(language)
      .then((res) => {
        if (isMounted && res && res.length > 0) setQuickQuestions(res);
      })
      .catch(() => {
        // Fallback default quick questions if offline or not logged in
      });
    return () => {
      isMounted = false;
    };
  }, [language]);

  // Fetch contextual telemetry when selected machine changes
  useEffect(() => {
    if (!selectedMachineId) return;
    let isMounted = true;
    assistantApi
      .getMachineContext(selectedMachineId)
      .then((ctx) => {
        if (isMounted) setMachineData(ctx);
      })
      .catch(() => {
        if (isMounted) setMachineData(null);
      });
    return () => {
      isMounted = false;
    };
  }, [selectedMachineId]);

  // Clean up speech synthesis on close or unmount
  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  const stopSpeaking = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    currentUtteranceRef.current = null;
  };

  const handleSpeak = (text: string, langCode: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    stopSpeaking();

    // Clean markdown symbols for cleaner speech
    const cleanSpeech = text
      .replace(/[*_#`>•-]/g, "")
      .replace(/https?:\/\/\S+/g, "")
      .replace(/\n+/g, " ")
      .trim();

    if (!cleanSpeech) return;

    const utterance = new SpeechSynthesisUtterance(cleanSpeech);
    currentUtteranceRef.current = utterance;

    const voices = window.speechSynthesis.getVoices();
    if (langCode === "ta") {
      const taVoice = voices.find(
        (v) => v.lang.startsWith("ta") || v.name.toLowerCase().includes("tamil")
      );
      if (taVoice) {
        utterance.voice = taVoice;
      }
      utterance.lang = "ta-IN";
    } else {
      const enVoice = voices.find(
        (v) => v.lang.startsWith("en-IN") || v.lang.startsWith("en")
      );
      if (enVoice) {
        utterance.voice = enVoice;
      }
      utterance.lang = "en-IN";
    }

    utterance.rate = 1.0;
    utterance.pitch = 1.05;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleSendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: "user",
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      language,
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res = await assistantApi.sendMessage({
        message: trimmed,
        language,
        machine_id: selectedMachineId,
      });

      const assistantMsg: ChatMessage = {
        id: `asst_${Date.now()}`,
        sender: "assistant",
        text: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        language: res.language || language,
        sourceData: res.source_data,
        relatedMachineIds: res.related_machine_ids,
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // If user is currently in speech interaction, auto-speak response
      if (isListening || isSpeaking) {
        handleSpeak(res.reply, res.language || language);
      }
    } catch (err: any) {
      const is401 = err?.response?.status === 401;
      let fallbackText = "";
      if (is401) {
        fallbackText =
          language === "ta"
            ? "🔒 **அங்கீகாரம் தேவை**: நேரடி தொழிற்சாலை சென்சார் அளவீடுகள் மற்றும் ML முன்கணிப்பு விவரங்களை அணுக, தயவுசெய்து பராமரிப்பு பொறியாளராக உள்நுழையவும் (`engineer@gmail.com` / `12345`)."
            : language === "tanglish"
            ? "🔒 **Authentication Required**: Live telemetry and failure predictions paaka Maintenance Engineer-a login pannunga (`engineer@gmail.com` / `12345`)."
            : "🔒 **Authentication Required**: Please sign in as a Maintenance Engineer (`engineer@gmail.com` / `12345`) to access live telemetry, failure predictions, and work orders.";
      } else {
        fallbackText =
          language === "ta"
            ? "மன்னிக்கவும், தகவல் தொடர்பு பிழை ஏற்பட்டது. சர்வர் இணைப்பை சரிபார்த்து மீண்டும் முயற்சிக்கவும்."
            : language === "tanglish"
            ? "Sorry, communication error aagirukku. Please server connection-ai check pannitu try pannunga."
            : "I encountered an error connecting to the FFIS assistant service. Please verify your connection and try again.";
      }

      const errorMsg: ChatMessage = {
        id: `err_${Date.now()}`,
        sender: "assistant",
        text: fallbackText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        language,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearConversation = () => {
    stopSpeaking();
    setMessages([]);
  };

  if (!isOpen) return null;

  // Minimized Floating Widget Bar
  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50 animate-fade-in">
        <div className="flex items-center gap-3 bg-[#FFFFFF] border-2 border-[#F4B400] rounded-full p-2 pr-4 shadow-xl hover:shadow-2xl transition-all">
          <AssistantAvatar
            size="sm"
            use3D={false}
            isListening={isListening}
            isSpeaking={isSpeaking}
            isThinking={isLoading}
            onClick={onToggleMinimize}
          />
          <div className="flex flex-col cursor-pointer" onClick={onToggleMinimize}>
            <span className="text-xs font-bold text-[#1F2933]">FFIS Assistant</span>
            <span className="text-[10px] text-[#667085] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
              {selectedMachineId} • Click to open
            </span>
          </div>
          <div className="flex items-center gap-1 border-l border-[#E5E7EB] pl-2">
            <button
              onClick={onToggleMinimize}
              className="p-1 rounded-full text-[#667085] hover:text-[#1F2933] hover:bg-[#FFF3C4]"
              title="Maximize Assistant Panel"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-[#667085] hover:text-[#EF4444] hover:bg-red-50"
              title="Close Assistant"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed bottom-6 right-6 z-50 w-[420px] max-w-[calc(100vw-2rem)] h-[650px] max-h-[calc(100vh-5rem)] flex flex-col bg-[#FFFFFF] rounded-3xl shadow-2xl border border-[#E5E7EB] overflow-hidden animate-fade-in transition-all"
      style={{
        boxShadow: "0 20px 40px -15px rgba(244, 180, 0, 0.25), 0 0 0 1px rgba(229, 231, 235, 1)",
      }}
    >
      {/* 1. Header with Industrial Theme */}
      <div className="bg-gradient-to-r from-[#FFFDF5] to-[#FFF3C4]/50 border-b border-[#E5E7EB] px-4 py-3 flex items-center justify-between select-none">
        <div className="flex items-center gap-2.5 min-w-0">
          <AssistantAvatar
            size="md"
            use3D={use3D}
            isListening={isListening}
            isSpeaking={isSpeaking}
            isThinking={isLoading}
          />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-xs sm:text-sm text-[#1F2933] truncate">
                FFIS Maintenance Assistant
              </h3>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-[#667085] mt-0.5">
              <span className="w-2 h-2 rounded-full bg-[#22C55E] inline-block animate-pulse" />
              <span className="font-medium">Online & Grounded</span>
              <span>•</span>
              <span className="text-[#D99A00] font-semibold">{selectedMachineId}</span>
            </div>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-1 shrink-0">
          {/* 3D / Mascot Toggle */}
          <button
            type="button"
            onClick={() => setUse3D((prev) => !prev)}
            className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition-colors border ${
              use3D
                ? "bg-[#F4B400] text-[#1F2933] border-[#D99A00] font-bold"
                : "bg-white text-[#667085] border-[#E5E7EB] hover:bg-[#FFF3C4]"
            }`}
            title={use3D ? "Switch to mascot photo" : "Switch to 3D Three.js interactive character"}
          >
            <Box className="w-3.5 h-3.5" />
            <span className="text-[10px] hidden sm:inline">{use3D ? "3D" : "2D"}</span>
          </button>

          {/* Minimize */}
          <button
            type="button"
            onClick={onToggleMinimize}
            className="p-1.5 rounded-lg text-[#667085] hover:text-[#1F2933] hover:bg-[#FFF3C4] transition-colors"
            title="Minimize"
          >
            <Minus className="w-4 h-4" />
          </button>

          {/* Close */}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#667085] hover:text-[#EF4444] hover:bg-red-50 transition-colors"
            title="Close Assistant"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Operational Control Strip: Machine Context & Language Switcher */}
      <div className="px-3 py-2 bg-[#FFFDF5] border-b border-[#E5E7EB] flex items-center justify-between text-xs gap-2">
        {/* Machine Context Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsMachineMenuOpen((prev) => !prev)}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-[#E5E7EB] rounded-lg text-[#1F2933] font-medium hover:border-[#F4B400] transition-colors shadow-xs"
            title="Select target machine context"
          >
            <Wrench className="w-3 h-3 text-[#D99A00]" />
            <span className="font-mono text-xs">{selectedMachineId}</span>
            <ChevronDown className="w-3 h-3 text-[#667085]" />
          </button>

          {/* Machine Selection Popover */}
          {isMachineMenuOpen && (
            <div className="absolute left-0 mt-1 w-48 bg-white border border-[#E5E7EB] rounded-xl shadow-lg z-20 py-1 max-h-48 overflow-y-auto">
              <div className="px-2.5 py-1 text-[10px] font-bold text-[#667085] uppercase tracking-wider bg-[#FFFDF5] border-b border-[#E5E7EB]">
                Authorized Equipment
              </div>
              {availableMachines.length > 0 ? (
                availableMachines.map((m) => (
                  <button
                    key={m.machine_id}
                    type="button"
                    onClick={() => {
                      setSelectedMachineId(m.machine_id);
                      setIsMachineMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-[#FFF3C4] transition-colors ${
                      m.machine_id === selectedMachineId
                        ? "bg-[#FFF3C4]/60 font-bold text-[#1F2933]"
                        : "text-[#1F2933]"
                    }`}
                  >
                    <span>{m.machine_id}</span>
                    <span className="text-[10px] text-[#667085] truncate max-w-[80px]">
                      {m.process}
                    </span>
                  </button>
                ))
              ) : (
                <div className="px-3 py-2 text-xs text-[#667085]">Loading equipment...</div>
              )}
            </div>
          )}
        </div>

        {/* Language Selector: English, தமிழ், Tanglish */}
        <div className="flex items-center bg-white border border-[#E5E7EB] rounded-lg p-0.5 shadow-xs">
          <button
            type="button"
            onClick={() => setLanguage("en")}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
              language === "en"
                ? "bg-[#F4B400] text-[#1F2933] font-bold shadow-xs"
                : "text-[#667085] hover:text-[#1F2933]"
            }`}
          >
            English
          </button>
          <button
            type="button"
            onClick={() => setLanguage("ta")}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
              language === "ta"
                ? "bg-[#F4B400] text-[#1F2933] font-bold shadow-xs"
                : "text-[#667085] hover:text-[#1F2933]"
            }`}
          >
            தமிழ்
          </button>
          <button
            type="button"
            onClick={() => setLanguage("tanglish")}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
              language === "tanglish"
                ? "bg-[#F4B400] text-[#1F2933] font-bold shadow-xs"
                : "text-[#667085] hover:text-[#1F2933]"
            }`}
          >
            Tanglish
          </button>
        </div>
      </div>

      {/* 3. Suggested Questions Horizontal Scroll Ribbon */}
      <div className="px-3 py-1.5 bg-[#FFFDF5]/80 border-b border-[#E5E7EB] flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <Sparkles className="w-3 h-3 text-[#D99A00] shrink-0" />
        {quickQuestions.map((q) => (
          <button
            key={q.id}
            type="button"
            onClick={() => handleSendMessage(q.question)}
            disabled={isLoading}
            className="shrink-0 px-2.5 py-1 rounded-full bg-white border border-[#E5E7EB] hover:border-[#F4B400] hover:bg-[#FFF3C4] text-[11px] text-[#1F2933] transition-all duration-150 shadow-xs hover:scale-102"
          >
            {q.label}
          </button>
        ))}
      </div>

      {/* 4. Chat Messages Scroll Area */}
      <ChatMessages
        messages={messages}
        isLoading={isLoading}
        onSpeak={handleSpeak}
        isSpeaking={isSpeaking}
      />

      {/* 5. Chat Input and Voice Controls */}
      <ChatInput
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        language={language}
        isListening={isListening}
        setIsListening={setIsListening}
        isSpeaking={isSpeaking}
        onStopSpeaking={stopSpeaking}
        onClearConversation={handleClearConversation}
      />
    </div>
  );
};
