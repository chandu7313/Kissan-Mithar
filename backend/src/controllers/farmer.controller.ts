import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import { FarmerService } from '../services/farmer.service.js';
import { AppError } from '../middleware/errorHandler.js';

export class FarmerController {
  static async getMe(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const farmerId = req.user?.farmerId || req.user?.userId;
      if (!farmerId) {
        throw new AppError('Farmer profile not found for this user', 404);
      }

      const profile = await FarmerService.getProfile(farmerId);
      res.status(200).json({
        success: true,
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateMe(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const farmerId = req.user?.farmerId || req.user?.userId;
      if (!farmerId) {
        throw new AppError('Farmer profile not found for this user', 404);
      }

      const updated = await FarmerService.updateProfile(farmerId, req.body);
      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }
}
