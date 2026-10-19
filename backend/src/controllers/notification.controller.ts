import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import { NotificationService } from '../services/notification.service.js';
import { AppError } from '../middleware/errorHandler.js';

export class NotificationController {
  static async list(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const farmerId = req.user?.farmerId || req.user?.userId;
      if (!farmerId) {
        throw new AppError('Farmer ID required to fetch notifications', 400);
      }

      const limit = parseInt(req.query.limit as string, 10) || 20;
      const notifications = await NotificationService.getFarmerNotifications(farmerId, limit);

      res.status(200).json({
        success: true,
        data: notifications,
      });
    } catch (error) {
      next(error);
    }
  }

  static async markAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const farmerId = req.user?.farmerId || req.user?.userId;
      if (!farmerId) {
        throw new AppError('Farmer ID required', 400);
      }

      const result = await NotificationService.markAsRead(id, farmerId);

      res.status(200).json({
        success: true,
        message: 'Notification marked as read',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async markAllAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const farmerId = req.user?.farmerId || req.user?.userId;
      if (!farmerId) {
        throw new AppError('Farmer ID required', 400);
      }

      const result = await NotificationService.markAllAsRead(farmerId);

      res.status(200).json({
        success: true,
        message: 'All notifications marked as read',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAdminStats(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await NotificationService.getAdminNotificationStats();
      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  static async sendBroadcast(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await NotificationService.sendAdminBroadcast({
        ...req.body,
        adminId: req.user?.userId,
        adminEmail: req.user?.email,
        ip: req.ip,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
