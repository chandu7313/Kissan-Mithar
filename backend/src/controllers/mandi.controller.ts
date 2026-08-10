import { Request, Response, NextFunction } from 'express';
import { MandiPriceService } from '../services/mandi.service.js';

export class MandiController {
  static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { commodity, state, market, limit } = req.query;

      const prices = await MandiPriceService.getPrices({
        commodity: commodity as string,
        state: state as string,
        market: market as string,
        limit: limit ? parseInt(limit as string, 10) : 50,
      });

      res.status(200).json({
        success: true,
        count: prices.length,
        data: prices,
      });
    } catch (error) {
      next(error);
    }
  }

  static async commodities(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const commodities = await MandiPriceService.getCommodities();
      res.status(200).json({
        success: true,
        data: commodities,
      });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const price = await MandiPriceService.upsertPrice(req.body);
      res.status(201).json({
        success: true,
        data: price,
      });
    } catch (error) {
      next(error);
    }
  }
}
