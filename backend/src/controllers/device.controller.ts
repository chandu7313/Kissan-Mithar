import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import { DeviceService } from '../services/device.service.js';
import { AppError } from '../middleware/errorHandler.js';

export class DeviceController {
  static async register(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const farmerId = req.user?.farmerId || req.user?.userId;
      const { fcmToken, platform } = req.body;

      if (!farmerId) {
        throw new AppError('Farmer ID required to register device', 400);
      }
      if (!fcmToken) {
        throw new AppError('fcmToken is required', 400);
      }

      const device = await DeviceService.registerDevice({
        farmerId,
        fcmToken,
        platform,
      });

      res.status(200).json({
        success: true,
        message: 'Device FCM token registered successfully',
        data: device,
      });
    } catch (error) {
      next(error);
    }
  }
}
