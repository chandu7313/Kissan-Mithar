import { apiClient } from './client.js';

export interface UICardAction {
  label: string;
  actionType: 'CART_ADD' | 'QUICK_BUY' | 'VIEW_REPORT' | 'CALL_EXPERT' | 'NAVIGATE';
  payload: Record<string, any>;
}

export interface UICard {
  type: 'PRODUCT_CARD' | 'DIAGNOSIS_CARD' | 'BOOKING_CARD' | 'MANDI_CARD' | 'WEATHER_CARD';
  title?: string;
  data: Record<string, any>;
  actions?: UICardAction[];
}

export interface ChatMessageItem {
  id: string;
  sender: 'USER' | 'ASSISTANT' | 'SYSTEM';
  text: string;
  audioUrl?: string;
  imageUrl?: string;
  uiCards?: UICard[];
  createdAt: string;
}

export interface ChatResponse {
  sessionId: string;
  messageId: string;
  reply: string;
  languageCode: string;
  detectedIntent: string;
  uiCards: UICard[];
  toolCallsExecuted: string[];
}

export class AIApi {
  /**
   * Sends a message to the Kissan Mithar Agricultural AI Assistant
   */
  static async sendMessage(payload: {
    message: string;
    sessionId?: string;
    languageCode?: string;
    audioUrl?: string;
    imageUrl?: string;
  }): Promise<ChatResponse> {
    const res = await apiClient.post('/ai/chat', payload);
    return res.data?.data;
  }

  /**
   * Retrieves active chat sessions for the farmer
   */
  static async getSessions(): Promise<any[]> {
    const res = await apiClient.get('/ai/sessions');
    return res.data?.data || [];
  }

  /**
   * Retrieves messages for a specific session
   */
  static async getSessionMessages(sessionId: string): Promise<ChatMessageItem[]> {
    const res = await apiClient.get(`/ai/sessions/${sessionId}/messages`);
    return res.data?.data || [];
  }
}
