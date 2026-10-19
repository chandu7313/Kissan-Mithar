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

  static async listAll(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        page,
        limit,
        search,
        district,
        state,
        primaryCrop,
        sortBy,
        sortOrder,
      } = req.query as any;

      const result = await FarmerService.listAll({
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? parseInt(limit, 10) : 20,
        search,
        district,
        state,
        primaryCrop,
        sortBy,
        sortOrder,
      });

      res.status(200).json({
        success: true,
        count: result.farmers.length,
        data: result.farmers,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const dossier = await FarmerService.getFarmerDossier(id);

      res.status(200).json({
        success: true,
        data: dossier,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateByAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const updated = await FarmerService.updateFarmerByAdmin(
        id,
        req.body,
        req.user?.userId,
        req.user?.email,
        req.ip
      );

      res.status(200).json({
        success: true,
        message: 'Farmer profile updated by administrator',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }
}
