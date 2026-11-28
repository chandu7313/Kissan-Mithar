import { LLMMessage, AgentTool } from '../types.js';

export interface LLMResponse {
  content: string;
  toolCalls?: Array<{
    name: string;
    arguments: Record<string, any>;
  }>;
  tokensUsed?: number;
}

export interface LLMProvider {
  name: string;
  isAvailable(): boolean;
  generateResponse(
    messages: LLMMessage[],
    tools?: AgentTool[],
    systemPrompt?: string
  ): Promise<LLMResponse>;
}
