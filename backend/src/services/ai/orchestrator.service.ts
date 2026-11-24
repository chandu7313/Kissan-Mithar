import { prisma } from '../../config/db.js';
import { ChatRequestDto, ChatResponseDto, LLMMessage, UICard } from './types.js';
import { ContextService } from './context.service.js';
import { IntentService } from './intent.service.js';
import { GeminiProvider } from './providers/gemini.provider.js';
import { MockAgronomicProvider } from './providers/mock.provider.js';
import { LLMProvider } from './providers/provider.interface.js';
import { agentTools } from './tools/registry.js';
import { RAGService } from './rag.service.js';
import { logger } from '../../config/logger.js';

export class OrchestratorService {
  private static geminiProvider = new GeminiProvider();
  private static fallbackProvider = new MockAgronomicProvider();

  /**
   * Main conversational entrypoint
   */
  static async processMessage(dto: ChatRequestDto): Promise<ChatResponseDto> {
    const startTime = Date.now();
    const { farmerId, message, audioUrl, imageUrl } = dto;

    // 1. Language & Intent Detection
    const detected = IntentService.classifyIntent(message);
    const languageCode = dto.languageCode || detected.languageCode;

    // 2. Hydrate Farmer Context
    const context = await ContextService.getFarmerContext(farmerId);
    context.languageCode = languageCode;

    // 3. Resolve or Create Conversation Session
    let session = dto.sessionId
      ? await prisma.conversationSession.findUnique({ where: { id: dto.sessionId } })
      : null;

    if (!session && farmerId && farmerId !== 'guest') {
      try {
        session = await prisma.conversationSession.create({
          data: {
            farmerId,
            languageCode,
            title: message.slice(0, 35) + '...',
          },
        });
      } catch {
        // In case farmerId is not in DB yet (e.g. dev mock), use a virtual session
        session = {
          id: 'session_' + Date.now(),
          farmerId: farmerId || 'guest',
          languageCode,
          title: message.slice(0, 35),
          isActive: true,
          metadata: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }
    }

    const sessionId = session?.id || 'session_' + Date.now();

    // 4. Save User Message to Database
    try {
      if (session && session.id && !session.id.startsWith('session_')) {
        await prisma.chatMessage.create({
          data: {
            sessionId: session.id,
            sender: 'USER',
            contentType: imageUrl ? 'IMAGE' : audioUrl ? 'VOICE' : 'TEXT',
            text: message,
            audioUrl,
            imageUrl,
          },
        });
      }
    } catch (err) {
      logger.warn({ err }, '[Orchestrator] Failed to persist user message');
    }

    // 5. Grounding via Agricultural RAG
    let ragContextText = '';
    try {
      const ragHits = await RAGService.queryKnowledge(message, context.primaryCrop);
      if (ragHits && ragHits.length > 0) {
        ragContextText = '\n\nVerified Agricultural Knowledge Base:\n' +
          ragHits.map((h) => `[Source: ${h.sourceName}]\n${h.content}`).join('\n\n');
      }
    } catch {
      // Ignore RAG retrieval failure
    }

    // Build System Prompt & History
    const systemPrompt = `You are "Kissan Mithar AI", an empathetic, highly knowledgeable agricultural expert and conversational commerce assistant for Indian farmers.
Farmer Profile:
- Name: ${context.name}
- Location: ${context.village || 'Telangana'}, ${context.district || 'India'}
- Land Size: ${context.landAcres || 0} acres
- Primary Crop: ${context.primaryCrop || 'General Agriculture'}
- Soil Type: ${context.soilType || 'Not specified'}

Guidelines:
1. Speak warmly, respectfully, and simply in the farmer's language (${languageCode === 'te' ? 'Telugu' : languageCode === 'hi' ? 'Hindi' : 'English'}).
2. For crop diseases, diagnose causes clearly and recommend safe, verified remedies. Never invent chemical dosages.
3. Suggest relevant products, machinery, or services when the farmer needs them.
4. Keep answers concise first (2-4 bullet points), then offer follow-up help.${ragContextText}`;

    const messages: LLMMessage[] = [
      { role: 'user', content: message },
    ];

    // 6. Select LLM Provider (Gemini if available, fallback otherwise)
    const provider: LLMProvider = this.geminiProvider.isAvailable()
      ? this.geminiProvider
      : this.fallbackProvider;

    let reply = '';
    const collectedCards: UICard[] = [];
    const toolsExecuted: string[] = [];

    try {
      const llmResult = await provider.generateResponse(messages, agentTools, systemPrompt);
      reply = llmResult.content;

      // 7. Execute any Tool Calls returned by LLM
      if (llmResult.toolCalls && llmResult.toolCalls.length > 0) {
        for (const tc of llmResult.toolCalls) {
          const matchedTool = agentTools.find((t) => t.name === tc.name);
          if (matchedTool) {
            toolsExecuted.push(tc.name);
            const toolOutput = await matchedTool.execute(tc.arguments, context);
            if (toolOutput.uiCards) {
              collectedCards.push(...toolOutput.uiCards);
            }
          }
        }
      }
    } catch (error) {
      logger.warn({ error }, '[Orchestrator] Primary provider failed, invoking fallback');
      const fallbackResult = await this.fallbackProvider.generateResponse(messages, agentTools, systemPrompt);
      reply = fallbackResult.content;
      if (fallbackResult.toolCalls) {
        for (const tc of fallbackResult.toolCalls) {
          const matchedTool = agentTools.find((t) => t.name === tc.name);
          if (matchedTool) {
            toolsExecuted.push(tc.name);
            const toolOutput = await matchedTool.execute(tc.arguments, context);
            if (toolOutput.uiCards) {
              collectedCards.push(...toolOutput.uiCards);
            }
          }
        }
      }
    }

    // 8. Auto-inject cards if intent strongly dictates it and none were collected yet
    if (collectedCards.length === 0) {
      if (detected.intent === 'MANDI_PRICE') {
        const tool = agentTools.find((t) => t.name === 'get_mandi_prices');
        if (tool) {
          const res = await tool.execute({ commodity: detected.extractedEntities.crop }, context);
          if (res.uiCards) collectedCards.push(...res.uiCards);
        }
      } else if (detected.intent === 'WEATHER_INQUIRY') {
        const tool = agentTools.find((t) => t.name === 'get_weather_forecast');
        if (tool) {
          const res = await tool.execute({}, context);
          if (res.uiCards) collectedCards.push(...res.uiCards);
        }
      } else if (detected.intent === 'COMMERCE_SEARCH' || detected.intent === 'DISEASE_DIAGNOSIS' || detected.intent === 'FERTILIZER_GUIDE') {
        const tool = agentTools.find((t) => t.name === 'search_products');
        if (tool) {
          const query = detected.extractedEntities.crop || (detected.intent === 'FERTILIZER_GUIDE' ? 'DAP' : 'Blitox');
          const res = await tool.execute({ query }, context);
          if (res.uiCards) collectedCards.push(...res.uiCards);
        }
      }
    }

    // 9. Persist Assistant Reply
    let assistantMessageId = 'msg_' + Date.now();
    try {
      if (session && session.id && !session.id.startsWith('session_')) {
        const saved = await prisma.chatMessage.create({
          data: {
            sessionId: session.id,
            sender: 'ASSISTANT',
            contentType: collectedCards.length > 0 ? 'PRODUCT_CARD' : 'TEXT',
            text: reply,
            uiCards: collectedCards.length > 0 ? (collectedCards as any) : undefined,
            toolCalls: toolsExecuted.length > 0 ? (toolsExecuted as any) : undefined,
          },
        });
        assistantMessageId = saved.id;
      }
    } catch (err) {
      logger.warn({ err }, '[Orchestrator] Failed to persist assistant reply');
    }

    logger.info({
      sessionId,
      intent: detected.intent,
      languageCode,
      toolsCount: toolsExecuted.length,
      cardsCount: collectedCards.length,
      latencyMs: Date.now() - startTime,
    }, '🌾 [Orchestrator] Turn Completed');

    return {
      sessionId,
      messageId: assistantMessageId,
      reply,
      languageCode,
      detectedIntent: detected.intent,
      uiCards: collectedCards,
      toolCallsExecuted: toolsExecuted,
    };
  }
}
