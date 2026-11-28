import axios from 'axios';
import { LLMProvider, LLMResponse } from './provider.interface.js';
import { LLMMessage, AgentTool } from '../types.js';
import { env } from '../../../config/env.js';
import { logger } from '../../../config/logger.js';

export class GeminiProvider implements LLMProvider {
  name = 'Google Gemini';

  isAvailable(): boolean {
    return Boolean(env.GEMINI_API_KEY && env.GEMINI_API_KEY.length > 5);
  }

  async generateResponse(
    messages: LLMMessage[],
    tools?: AgentTool[],
    systemPrompt?: string
  ): Promise<LLMResponse> {
    if (!this.isAvailable()) {
      throw new Error('Gemini API key is not configured');
    }

    const model = env.GEMINI_MODEL || 'gemini-1.5-pro';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${env.GEMINI_API_KEY}`;

    // Format contents for Gemini API
    const contents: any[] = [];

    for (const msg of messages) {
      const role = msg.role === 'assistant' ? 'model' : 'user';
      contents.push({
        role,
        parts: [{ text: msg.content }],
      });
    }

    // Format tool declarations if provided
    let functionDeclarations: any[] | undefined = undefined;
    if (tools && tools.length > 0) {
      functionDeclarations = tools.map((t) => ({
        name: t.name,
        description: t.description,
        parameters: {
          type: 'OBJECT',
          properties: t.parameters.properties,
          required: t.parameters.required || [],
        },
      }));
    }

    const body: any = {
      contents,
      generationConfig: {
        temperature: 0.2, // Low temperature for high agronomic precision
        maxOutputTokens: 1024,
      },
    };

    if (systemPrompt) {
      body.systemInstruction = {
        parts: [{ text: systemPrompt }],
      };
    }

    if (functionDeclarations && functionDeclarations.length > 0) {
      body.tools = [{ functionDeclarations }];
    }

    try {
      const response = await axios.post(url, body, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000,
      });

      const candidate = response.data?.candidates?.[0];
      const parts = candidate?.content?.parts || [];

      let content = '';
      const toolCalls: Array<{ name: string; arguments: any }> = [];

      for (const part of parts) {
        if (part.text) {
          content += part.text;
        }
        if (part.functionCall) {
          toolCalls.push({
            name: part.functionCall.name,
            arguments: part.functionCall.args || {},
          });
        }
      }

      return {
        content: content.trim(),
        toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
        tokensUsed: response.data?.usageMetadata?.totalTokenCount || 0,
      };
    } catch (error: any) {
      logger.error({ err: error?.response?.data || error?.message }, '[GeminiProvider] API Call Failed');
      throw error;
    }
  }
}
