import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import { ConsultationService } from '../services/consultation.service.js';
import { AppError } from '../middleware/errorHandler.js';

export class ConsultationController {
  static async book(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const farmerId = req.user?.farmerId || req.user?.userId;
      if (!farmerId) {
        throw new AppError('Farmer ID required to book consultation', 400);
      }

      const consultation = await ConsultationService.bookConsultation({
        ...req.body,
        farmerId,
      });

      res.status(201).json({
        success: true,
        message: 'Consultation booked successfully',
        data: consultation,
      });
    } catch (error) {
      next(error);
    }
  }

  static async list(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const role = req.user?.role;
      const farmerId = role === 'FARMER' ? req.user?.farmerId : undefined;
      const expertId = role === 'EXPERT' ? req.user?.expertId : undefined;

      const history = await ConsultationService.getHistory({
        farmerId,
        expertId,
      });

      res.status(200).json({
        success: true,
        data: history,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const consultation = await ConsultationService.getById(id);

      res.status(200).json({
        success: true,
        data: consultation,
      });
    } catch (error) {
      next(error);
    }
  }
}
