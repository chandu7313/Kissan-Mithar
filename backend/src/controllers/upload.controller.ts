import { Request, Response, NextFunction } from 'express';
import { UploadService } from '../services/upload.service.js';

export class UploadController {
  static sign(req: Request, res: Response, next: NextFunction): void {
    try {
      const folder = req.body?.folder || 'kissan_mithar_uploads';
      const signedData = UploadService.generateSignature(folder);

      res.status(200).json({
        success: true,
        data: signedData,
      });
    } catch (error) {
      next(error);
    }
  }
}
