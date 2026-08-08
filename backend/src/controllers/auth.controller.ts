import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service.js';

export class AuthController {
  static async verify(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { idToken, phoneNumber, name, email, role } = req.body;
      const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
      const userAgent = req.headers['user-agent'] || 'Unknown Client';

      const result = await AuthService.verifyAndAuthenticate({
        idToken,
        phoneNumber,
        name,
        email,
        role,
        ipAddress,
        userAgent,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId, role, userName, userEmail } = req.body;
      const authUser = (req as any).user;
      const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
      const userAgent = req.headers['user-agent'] || 'Unknown Client';

      const result = await AuthService.recordLogout({
        userId: userId || authUser?.userId || 'UNKNOWN_USER',
        role: role || authUser?.role || 'EXPERT',
        userName: userName || authUser?.name || 'Agronomist',
        userEmail: userEmail || authUser?.email,
        ipAddress,
        userAgent,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAuditLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req.query.userId as string) || undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

      const logs = await AuthService.getAuthAuditLogs(userId, limit);

      res.status(200).json({
        success: true,
        data: logs,
      });
    } catch (error) {
      next(error);
    }
  }
}
