import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import { FertilizerService } from '../services/fertilizer.service.js';
import { AppError } from '../middleware/errorHandler.js';
import { prisma } from '../config/db.js';

export class FertilizerController {
  /**
   * Submit a new fertilizer guide request
   */
  static async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      let farmerId = req.user?.farmerId || req.user?.userId || req.body.farmerId;

      // If farmerId is not directly found, attempt lookup by phone or fallback to first farmer
      if (!farmerId) {
        if (req.body.phoneNumber) {
          const farmer = await prisma.farmer.findUnique({
            where: { phoneNumber: req.body.phoneNumber },
          });
          if (farmer) {
            farmerId = farmer.id;
          }
        }
      }

      // If still missing, check if any registered farmer exists or throw
      if (!farmerId) {
        const firstFarmer = await prisma.farmer.findFirst({
          select: { id: true },
        });
        if (firstFarmer) {
          farmerId = firstFarmer.id;
        } else {
          throw new AppError('Farmer ID or valid farmer authentication required to submit request', 400);
        }
      }

      const request = await FertilizerService.createRequest({
        ...req.body,
        farmerId,
      });

      res.status(201).json({
        success: true,
        message: 'Fertilizer request submitted successfully',
        data: request,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * List fertilizer requests with filters & pagination
   */
  static async list(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const role = req.user?.role;
      let farmerId = role === 'FARMER' ? req.user?.farmerId : undefined;
      let expertId = role === 'EXPERT' ? req.user?.expertId : undefined;

      // Allow expert/admin to override or view all
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

      const result = await FertilizerService.getRequests({
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
   * Get requests of the authenticated farmer
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

      const result = await FertilizerService.getRequests({
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
      const request = await FertilizerService.getRequestById(id);

      res.status(200).json({
        success: true,
        data: request,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update status of request (EXPERT or ADMIN)
   */
  static async updateStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const expertId = req.user?.expertId;

      const updated = await FertilizerService.updateStatus(id, status, expertId);

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
        throw new AppError('expertId is required in request body', 400);
      }

      const updated = await FertilizerService.assignExpert(id, expertId);

      res.status(200).json({
        success: true,
        message: 'Expert assigned successfully',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Expert creates/updates fertilizer recommendation plan
   */
  static async createPlan(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const expertId = req.user?.expertId;

      const plan = await FertilizerService.createOrUpdatePlan(id, req.body, expertId);

      res.status(201).json({
        success: true,
        message: 'Fertilizer recommendation plan formulated and sent to farmer',
        data: plan,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get Agronomic Fertilizer Catalog / Standard Doses
   */
  static async getCatalog(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const crop = req.query.crop as string | undefined;
      const catalog = FertilizerService.getFertilizerCatalog(crop);

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
   * Delete request
   */
  static async delete(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.userId || req.user?.farmerId;
      const role = req.user?.role || 'FARMER';

      if (!userId) {
        throw new AppError('Authentication required to delete request', 401);
      }

      const result = await FertilizerService.deleteRequest(id, userId, role);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }
}
