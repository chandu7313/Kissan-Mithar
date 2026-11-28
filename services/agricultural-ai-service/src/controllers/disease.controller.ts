import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import { DiseaseService } from '../services/disease.service.js';
import { AppError } from '../middleware/errorHandler.js';
import { prisma } from '../config/db.js';

export class DiseaseController {
  /**
   * Submit new crop disease help request
   */
  static async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      let farmerId = req.user?.farmerId || req.user?.userId || req.body.farmerId;

      if (!farmerId) {
        if (req.body.phoneNumber) {
          const farmer = await prisma.farmer.findUnique({
            where: { phoneNumber: req.body.phoneNumber },
          });
          if (farmer) farmerId = farmer.id;
        }
      }

      if (!farmerId) {
        const firstFarmer = await prisma.farmer.findFirst({ select: { id: true } });
        if (firstFarmer) {
          farmerId = firstFarmer.id;
        } else {
          throw new AppError('Farmer ID or valid farmer authentication required to submit request', 400);
        }
      }

      const request = await DiseaseService.createRequest({
        ...req.body,
        farmerId,
      });

      res.status(201).json({
        success: true,
        message: 'Disease inquiry submitted successfully',
        data: request,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * List disease requests with filtering and pagination
   */
  static async list(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const role = req.user?.role;
      let farmerId = role === 'FARMER' ? req.user?.farmerId : undefined;
      let expertId = role === 'EXPERT' ? req.user?.expertId : undefined;

      if (req.query.viewAsExpert === 'true' || role === 'ADMIN') {
        farmerId = undefined;
        expertId = undefined;
      }

      if (req.query.farmerId && (role === 'EXPERT' || role === 'ADMIN')) {
        farmerId = req.query.farmerId as string;
      }
      if (req.query.expertId && (role === 'EXPERT' || role === 'ADMIN')) {
        expertId = req.query.expertId as string;
      }

      const status = req.query.status as any;
      const cropType = req.query.cropType as string;
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

      const result = await DiseaseService.getRequests({
        farmerId,
        expertId,
        status,
        cropType,
        page,
        limit,
      });

      res.status(200).json({
        success: true,
        data: result.items,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get authenticated farmer's inquiries
   */
  static async getMyRequests(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const farmerId = req.user?.farmerId || req.user?.userId;
      if (!farmerId) {
        throw new AppError('Farmer authentication required', 401);
      }

      const status = req.query.status as any;
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

      const result = await DiseaseService.getRequests({
        farmerId,
        status,
        page,
        limit,
      });

      res.status(200).json({
        success: true,
        data: result.items,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get single request detail by ID
   */
  static async getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const request = await DiseaseService.getRequestById(id);

      res.status(200).json({
        success: true,
        data: request,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update request review status (Expert / Admin)
   */
  static async updateStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const expertId = req.user?.expertId;

      const updated = await DiseaseService.updateStatus(id, status, expertId);

      res.status(200).json({
        success: true,
        message: `Status updated to ${status}`,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Assign an Expert to the request
   */
  static async assignExpert(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { expertId } = req.body;

      if (!expertId) {
        throw new AppError('expertId is required', 400);
      }

      const updated = await DiseaseService.assignExpert(id, expertId);

      res.status(200).json({
        success: true,
        message: 'Expert assigned to disease inquiry successfully',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Expert formulates disease diagnosis and prescription treatment plan
   */
  static async createTreatment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const expertId = req.user?.expertId;

      const treatment = await DiseaseService.createOrUpdateTreatment(id, req.body, expertId);

      res.status(201).json({
        success: true,
        message: 'Disease diagnosis & treatment plan dispatched to farmer',
        data: treatment,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get Plant Pathology Catalog
   */
  static async getCatalog(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const crop = req.query.crop as string | undefined;
      const catalog = DiseaseService.getDiseaseCatalog(crop);

      res.status(200).json({
        success: true,
        count: catalog.length,
        data: catalog,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete inquiry
   */
  static async delete(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.userId || req.user?.farmerId;
      const role = req.user?.role || 'FARMER';

      if (!userId) {
        throw new AppError('Authentication required to delete inquiry', 401);
      }

      const result = await DiseaseService.deleteRequest(id, userId, role);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }
}
