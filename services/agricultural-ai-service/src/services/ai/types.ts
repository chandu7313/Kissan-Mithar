export interface LLMMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  name?: string;
  toolCallId?: string;
  toolCalls?: Array<{
    id: string;
    function: { name: string; arguments: string };
  }>;
}

export interface AgentToolParam {
  type: string;
  description?: string;
  enum?: string[];
}

export interface AgentTool<TInput = any, TOutput = any> {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, AgentToolParam>;
    required?: string[];
  };
  execute: (args: TInput, context: FarmerContext) => Promise<TOutput>;
}

export interface FarmerContext {
  farmerId: string;
  name: string;
  phoneNumber: string;
  languageCode: string; // 'te', 'hi', 'en'
  village?: string;
  district?: string;
  state?: string;
  landAcres?: number;
  primaryCrop?: string;
  soilType?: string;
  activeCrops?: any[];
  memoryFacts?: Record<string, any>;
  hasConsent?: boolean;
}

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

export interface ChatRequestDto {
  farmerId?: string;
  sessionId?: string;
  message: string;
  languageCode?: string;
  audioUrl?: string;
  imageUrl?: string;
  channel?: 'APP' | 'WEB';
}

export interface ChatResponseDto {
  sessionId: string;
  messageId: string;
  reply: string;
  languageCode: string;
  detectedIntent: string;
  uiCards: UICard[];
  toolCallsExecuted: string[];
  audioUrl?: string;
}
