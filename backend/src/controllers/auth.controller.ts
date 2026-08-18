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

  static async sendEmailOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, purpose, role } = req.body;
      const result = await AuthService.sendEmailOtp({ email, purpose, role });
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async verifyEmailOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, otp, role } = req.body;
      const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
      const userAgent = req.headers['user-agent'] || 'Unknown Client';

      const result = await AuthService.verifyEmailOtpAndLogin({
        email,
        otp,
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

  static async loginWithPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password, role } = req.body;
      const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
      const userAgent = req.headers['user-agent'] || 'Unknown Client';

      const result = await AuthService.loginWithPassword({
        email,
        password,
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

  static async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, otp, newPassword } = req.body;
      const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
      const userAgent = req.headers['user-agent'] || 'Unknown Client';

      const result = await AuthService.resetPasswordWithOtp({
        email,
        otp,
        newPassword,
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
  static async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authUser = (req as any).user;
      if (!authUser) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }
      const { photoUrl } = req.body;
      const result = await AuthService.updateProfile({
        userId: authUser.userId,
        role: authUser.role,
        photoUrl,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async sendPhoneOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { phoneNumber } = req.body;
      const result = await AuthService.sendPhoneOtp({ phoneNumber });
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async verifyPhoneOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { phoneNumber, otp, name, languageCode } = req.body;
      const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
      const userAgent = req.headers['user-agent'] || 'Unknown Client';

      const result = await AuthService.verifyPhoneOtp({
        phoneNumber,
        otp,
        name,
        languageCode,
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
}
