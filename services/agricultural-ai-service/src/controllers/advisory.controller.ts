import { Request, Response, NextFunction } from 'express';
import { CropAdvisoryService } from '../services/advisory.service.js';
import { MLService } from '../services/ml.service.js';
import { AuthenticatedRequest } from '../types/index.js';

export class AdvisoryController {
  static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { crop, alertLevel, season, limit } = req.query;

      const advisories = await CropAdvisoryService.getAdvisories({
        crop: crop as string,
        alertLevel: alertLevel as string,
        season: season as string,
        limit: limit ? parseInt(limit as string, 10) : 20,
      });

      res.status(200).json({
        success: true,
        count: advisories.length,
        data: advisories,
      });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const expertId = req.user?.expertId || req.user?.userId;
      const advisory = await CropAdvisoryService.createAdvisory({
        ...req.body,
        expertId,
      });

      res.status(201).json({
        success: true,
        data: advisory,
      });
    } catch (error) {
      next(error);
    }
  }

  static async recommendCrop(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { N, P, K, ph, temperature, humidity, rainfall, soil_type, location, season } = req.body;
      const result = await MLService.recommendCrop({
        N: Number(N),
        P: Number(P),
        K: Number(K),
        ph: Number(ph),
        temperature: Number(temperature),
        humidity: Number(humidity),
        rainfall: Number(rainfall),
        soil_type,
        location,
        season,
        farmerId: req.user?.farmerId,
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
