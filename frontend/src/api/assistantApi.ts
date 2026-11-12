import apiClient from "./axios";
import {
  AssistantChatRequest,
  AssistantChatResponse,
  QuickQuestionItem,
  AssistantSourceData,
  AssistantLanguage,
} from "../types/assistant";

export const assistantApi = {
  sendMessage: async (request: AssistantChatRequest): Promise<AssistantChatResponse> => {
    const response = await apiClient.post<AssistantChatResponse>("/api/assistant/chat", request);
    return response.data;
  },

  getQuickQuestions: async (language: AssistantLanguage = "en"): Promise<QuickQuestionItem[]> => {
    const response = await apiClient.get<QuickQuestionItem[]>("/api/assistant/quick-questions", {
      params: { language },
    });
    return response.data;
  },

  getMachineContext: async (machineId: string): Promise<AssistantSourceData> => {
    const response = await apiClient.get<AssistantSourceData>(`/api/assistant/context/${machineId}`);
    return response.data;
  },
};
