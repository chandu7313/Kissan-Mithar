import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { MediaRequest } from '../middleware/auth.js';
import { MediaService } from '../services/media.service.js';

const signUploadSchema = z.object({
  folder: z.string().min(1).optional(),
});

const audioUploadSchema = z.object({
  audioData: z.string().min(1, 'audioData is required'),
  filename: z.string().optional(),
});

export class MediaController {
  static sign(req: MediaRequest, res: Response, next: NextFunction): void {
    try {
      const parsed = signUploadSchema.parse(req.body || {});
      const signedData = MediaService.generateSignature(parsed.folder || 'kissan_mithar_uploads');
      res.status(200).json({ success: true, data: signedData });
    } catch (error) {
      next(error);
    }
  }

  static async uploadAudio(req: MediaRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = audioUploadSchema.safeParse(req.body || {});
      if (!parsed.success) {
        res.status(400).json({
          success: false,
          error: { message: 'audioData is required', statusCode: 400 },
        });
        return;
      }

      const result = await MediaService.saveAudio(parsed.data.audioData, parsed.data.filename);
      const host = req.get('host');
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
