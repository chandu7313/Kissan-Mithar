import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import { OrchardService } from '../services/orchard.service.js';
import { AppError } from '../middleware/errorHandler.js';

export class OrchardController {
  static async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const farmerId = req.user?.farmerId || req.user?.userId;
      if (!farmerId) {
        throw new AppError('Farmer ID required to submit survey', 400);
      }

      const request = await OrchardService.createRequest({
        ...req.body,
        farmerId,
      });

      res.status(201).json({
        success: true,
        message: 'Orchard survey submitted successfully',
        data: request,
      });
    } catch (error) {
      next(error);
    }
  }

  static async list(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const role = req.user?.role;
      let farmerId = role === 'FARMER' ? req.user?.farmerId : undefined;
      let expertId = role === 'EXPERT' ? req.user?.expertId : undefined;
      const status = req.query.status as any;

      if (req.query.viewAsExpert === 'true') {
        farmerId = undefined;
        expertId = undefined;
      }

      const requests = await OrchardService.getRequests({
        farmerId,
        expertId,
        status,
      });

      res.status(200).json({
        success: true,
        data: requests,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const request = await OrchardService.getRequestById(id);

      res.status(200).json({
        success: true,
        data: request,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const expertId = req.user?.expertId;

      const updated = await OrchardService.updateStatus(id, status, expertId);

      res.status(200).json({
        success: true,
        message: `Status updated to ${status}`,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  static async createReport(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const report = await OrchardService.createReport(id, req.body);

      res.status(201).json({
        success: true,
        message: 'Orchard plantation report created and delivered to farmer',
        data: report,
      });
    } catch (error) {
      next(error);
    }
  }
}
