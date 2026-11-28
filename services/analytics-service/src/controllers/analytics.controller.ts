import { Request, Response, NextFunction } from 'express';
import { AnalyticsService } from '../services/analytics.service.js';

export class AnalyticsController {
  static async summary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const summary = await AnalyticsService.getDashboardSummary();

      res.status(200).json({
        success: true,
        data: summary,
      });
    } catch (error) {
      next(error);
    }
  }

  static async executiveSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const timeRange = (req.query.timeRange as '7d' | '30d' | '90d' | 'all') || '30d';
      const summary = await AnalyticsService.getExecutiveSummary(timeRange);

      res.status(200).json({
        success: true,
        data: summary,
      });
    } catch (error) {
      next(error);
    }
  }
}
