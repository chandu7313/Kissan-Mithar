import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import { LabourService } from '../services/labour.service.js';
import { AppError } from '../middleware/errorHandler.js';
import { prisma } from '../config/db.js';

export class LabourController {
  /**
   * Submit a new labour request
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

      const request = await LabourService.createRequest({
        ...req.body,
        farmerId,
      });

      res.status(201).json({
        success: true,
        message: 'Labour request submitted successfully',
        data: request,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * List labour requests with filters & pagination
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
      const taskType = req.query.taskType as any;
      const urgency = req.query.urgency as string;
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

      const result = await LabourService.getRequests({
        farmerId,
        expertId,
        status,
        taskType,
        urgency,
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

      const result = await LabourService.getRequests({
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
      const request = await LabourService.getRequestById(id);

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

      const updated = await LabourService.updateStatus(id, status, expertId);

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
   * Assign an Expert/Coordinator to the request
   */
  static async assignExpert(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { expertId } = req.body;

      if (!expertId) {
        throw new AppError('expertId is required in request body', 400);
      }

      const updated = await LabourService.assignExpert(id, expertId);

      res.status(200).json({
        success: true,
        message: 'Expert/Coordinator assigned successfully',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Add labourer allocations to a request
   */
  static async addAllocations(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const expertId = req.user?.expertId;
      const { allocations } = req.body;

      if (!allocations || !Array.isArray(allocations) || allocations.length === 0) {
        throw new AppError('At least one labourer allocation is required', 400);
      }

      const result = await LabourService.addAllocations(id, allocations, expertId);

      res.status(201).json({
        success: true,
        message: `${result.length} labourer(s) allocated successfully`,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update a specific labourer allocation
   */
  static async updateAllocation(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { allocationId } = req.params;

      const updated = await LabourService.updateAllocation(allocationId, req.body);

      res.status(200).json({
        success: true,
        message: 'Allocation updated successfully',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a specific labourer allocation
   */
  static async deleteAllocation(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { allocationId } = req.params;

      const result = await LabourService.deleteAllocation(allocationId);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get Labour Task Catalog / Wage Guidelines
   */
  static async getCatalog(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const task = req.query.task as string | undefined;
      const catalog = LabourService.getLabourCatalog(task);

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

      const result = await LabourService.deleteRequest(id, userId, role);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }
}
