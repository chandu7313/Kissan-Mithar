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

  static async uploadAudio(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { audioData, filename } = req.body;
      if (!audioData) {
        res.status(400).json({
          success: false,
          error: { message: 'audioData is required' },
        });
        return;
      }

      const result = await UploadService.saveAudio(audioData, filename);

      const host = req.get('host') || 'localhost:4000';
      const protocol = req.protocol || 'http';
      const fullUrl = result.url.startsWith('http')
        ? result.url
        : `${protocol}://${host}${result.url}`;

      res.status(200).json({
        success: true,
        data: {
          url: fullUrl,
          filename: result.filename,
          size: result.size,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

