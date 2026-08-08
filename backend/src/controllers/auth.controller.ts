import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service.js';

export class AuthController {
  static async verify(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { idToken, phoneNumber, name, role } = req.body;
      const result = await AuthService.verifyAndAuthenticate({
        idToken,
        phoneNumber,
        name,
        role,
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
