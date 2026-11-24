import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { OrchestratorService } from '../services/ai/orchestrator.service.js';
import { prisma } from '../config/db.js';

const chatSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty'),
  sessionId: z.string().optional(),
  languageCode: z.string().optional(),
  audioUrl: z.string().optional(),
  imageUrl: z.string().optional(),
});

export class AIController {
  /**
   * Conversational turn with the agricultural multi-agent assistant
   */
  static async chat(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = chatSchema.parse(req.body);
      const farmerId = (req as any).user?.id || (req as any).user?.uid || 'guest';

      const response = await OrchestratorService.processMessage({
        farmerId,
        sessionId: parsed.sessionId,
        message: parsed.message,
        languageCode: parsed.languageCode,
        audioUrl: parsed.audioUrl,
        imageUrl: parsed.imageUrl,
        channel: 'APP',
      });

      res.status(200).json({
        success: true,
        data: response,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Retrieves conversation sessions for the authenticated farmer
   */
  static async getSessions(req: Request, res: Response, next: NextFunction) {
    try {
      const farmerId = (req as any).user?.id || (req as any).user?.uid;
      if (!farmerId) {
        return res.status(200).json({ success: true, data: [] });
      }

      const sessions = await prisma.conversationSession.findMany({
        where: { farmerId },
        orderBy: { updatedAt: 'desc' },
        include: {
          messages: {
            take: 1,
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      res.status(200).json({
        success: true,
        data: sessions,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Retrieves chat history for a specific conversation session
   */
  static async getSessionMessages(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const messages = await prisma.chatMessage.findMany({
        where: { sessionId: id },
        orderBy: { createdAt: 'asc' },
      });

      res.status(200).json({
        success: true,
        data: messages,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Creates a new conversation session
   */
  static async createSession(req: Request, res: Response, next: NextFunction) {
    try {
      const farmerId = (req as any).user?.id || (req as any).user?.uid || 'guest';
      const { title, languageCode } = req.body;

      const session = await prisma.conversationSession.create({
        data: {
          farmerId,
          title: title || 'New Consultation',
          languageCode: languageCode || 'en',
        },
      });

      res.status(201).json({
        success: true,
        data: session,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Deletes a conversation session
   */
  static async deleteSession(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      await prisma.conversationSession.delete({
        where: { id },
      });

      res.status(200).json({
        success: true,
        message: 'Session deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}
