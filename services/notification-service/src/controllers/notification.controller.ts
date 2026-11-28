import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { NotificationRequest } from '../middleware/auth.js';
import { NotificationService } from '../services/notification.service.js';

const sendInternalSchema = z.object({
  farmerId: z.string().min(1),
  title: z.string().min(1),
  body: z.string().min(1),
  type: z.enum(['ALERT', 'SUCCESS', 'CONSULTATION', 'MARKET', 'INFO']).optional(),
  deepLink: z.string().optional(),
  data: z.record(z.string()).optional(),
});

const broadcastSchema = z.object({
  targetType: z.enum(['ALL', 'DISTRICT', 'CROP']),
  targetValue: z.string().optional(),
  title: z.string().min(2, 'Title required'),
  body: z.string().min(5, 'Message body required'),
  type: z.enum(['ALERT', 'SUCCESS', 'CONSULTATION', 'MARKET', 'INFO']).optional(),
  deepLink: z.string().optional(),
});

export class NotificationController {
  static async list(req: NotificationRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const farmerId = req.user?.farmerId || req.user?.userId;
      if (!farmerId) {
        res.status(400).json({
          success: false,
          error: { message: 'Farmer ID required to fetch notifications', statusCode: 400 },
        });
        return;
      }
      const limit = parseInt(req.query.limit as string, 10) || 20;
      const notifications = await NotificationService.getFarmerNotifications(farmerId, limit);
      res.status(200).json({ success: true, data: notifications });
    } catch (error) {
      next(error);
    }
  }

  static async markAsRead(req: NotificationRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const farmerId = req.user?.farmerId || req.user?.userId;
      if (!farmerId) {
        res.status(400).json({
          success: false,
          error: { message: 'Farmer ID required', statusCode: 400 },
        });
        return;
      }
      const result = await NotificationService.markAsRead(req.params.id, farmerId);
      res.status(200).json({ success: true, message: 'Notification marked as read', data: result });
    } catch (error) {
      next(error);
    }
  }

  static async markAllAsRead(
    req: NotificationRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const farmerId = req.user?.farmerId || req.user?.userId;
      if (!farmerId) {
        res.status(400).json({
          success: false,
          error: { message: 'Farmer ID required', statusCode: 400 },
        });
        return;
      }
      const result = await NotificationService.markAllAsRead(farmerId);
      res.status(200).json({ success: true, message: 'All notifications marked as read', data: result });
    } catch (error) {
      next(error);
    }
  }

  static async getAdminStats(
    _req: NotificationRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const stats = await NotificationService.getAdminNotificationStats();
      res.status(200).json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  }

  static async sendBroadcast(
    req: NotificationRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const parsed = broadcastSchema.parse(req.body);
      const result = await NotificationService.sendAdminBroadcast({
        ...parsed,
        adminId: req.user?.userId,
        adminEmail: req.user?.email,
        ip: req.ip,
      });
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async sendInternal(
    req: NotificationRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const parsed = sendInternalSchema.parse(req.body);
      const idempotencyKey =
        typeof req.headers['idempotency-key'] === 'string'
          ? req.headers['idempotency-key']
          : undefined;

      const created = await NotificationService.sendNotification({
        ...parsed,
        idempotencyKey,
      });
      res.status(201).json({ success: true, data: created });
    } catch (error) {
      next(error);
    }
  }
}
