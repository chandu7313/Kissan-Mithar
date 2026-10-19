import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import { AdminService } from '../services/admin.service.js';

export class AdminController {
  static async listUsers(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const admins = await AdminService.listAdmins();
      res.status(200).json({
        success: true,
        count: admins.length,
        data: admins,
      });
    } catch (error) {
      next(error);
    }
  }

  static async createUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const admin = await AdminService.createAdmin(
        req.body,
        req.user?.userId,
        req.user?.email,
        req.ip
      );
      res.status(201).json({
        success: true,
        message: 'Administrator created successfully',
        data: admin,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const updated = await AdminService.updateAdmin(
        id,
        req.body,
        req.user?.userId,
        req.user?.email,
        req.ip
      );
      res.status(200).json({
        success: true,
        message: 'Administrator updated successfully',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const result = await AdminService.deleteAdmin(
        id,
        req.user?.userId,
        req.user?.email,
        req.ip
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getSystemHealth(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const health = await AdminService.getSystemHealth();
      res.status(200).json({
        success: true,
        data: health,
      });
    } catch (error) {
      next(error);
    }
  }
}
