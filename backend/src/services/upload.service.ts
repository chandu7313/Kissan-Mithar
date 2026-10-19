import { cloudinary } from '../config/cloudinary.js';
import { env } from '../config/env.js';
import { CloudinarySignPayload } from '../types/index.js';

export class UploadService {
  /**
   * Generates a signed payload for secure direct Cloudinary upload from mobile client
   */
  static generateSignature(folder = 'kissan_mithar_uploads'): CloudinarySignPayload {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const paramsToSign = {
      folder,
      timestamp,
    };

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      env.CLOUDINARY_API_SECRET
    );

    return {
      timestamp,
      signature,
      apiKey: env.CLOUDINARY_API_KEY,
      cloudName: env.CLOUDINARY_CLOUD_NAME,
      folder,
    };
  }

  /**
   * Saves an audio recording (data URL or base64) directly to server storage
   */
  static async saveAudio(
    audioData: string,
    filenameHint?: string
  ): Promise<{ url: string; filename: string; size: number }> {
    if (audioData.startsWith('http://') || audioData.startsWith('https://')) {
      return { url: audioData, filename: filenameHint || 'audio.m4a', size: 0 };
    }

    const fs = await import('fs');
    const path = await import('path');

    let buffer: Buffer;
    let ext = 'webm';

    if (audioData.startsWith('data:')) {
      const match = audioData.match(/^data:audio\/([a-zA-Z0-9]+);base64,(.+)$/);
      if (match) {
        ext = match[1] === 'mp4' ? 'm4a' : match[1];
        buffer = Buffer.from(match[2], 'base64');
      } else {
        const commaIdx = audioData.indexOf(',');
        buffer = Buffer.from(audioData.substring(commaIdx + 1), 'base64');
      }
    } else {
      buffer = Buffer.from(audioData, 'base64');
    }

    // If Cloudinary is configured with real credentials, upload directly for persistent cloud storage
    if (env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_KEY !== 'mock_cloudinary_key') {
      try {
        const uploadRes = await cloudinary.uploader.upload(audioData, {
          resource_type: 'auto',
          folder: 'kissan_mithar_voice',
        });
        return {
          url: uploadRes.secure_url,
          filename: filenameHint || uploadRes.public_id,
          size: uploadRes.bytes || buffer.length,
        };
      } catch {
        // Fall back to filesystem storage below
      }
    }

    // In AWS Lambda, process.cwd() is /var/task (read-only); use /tmp
    const isLambda = Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.LAMBDA_TASK_ROOT);
    const baseDir = isLambda ? '/tmp' : process.cwd();
    const uploadDir = path.join(baseDir, 'uploads', 'voice');
    await fs.promises.mkdir(uploadDir, { recursive: true });

    const safeFilename = `voice_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
    const filePath = path.join(uploadDir, safeFilename);
    await fs.promises.writeFile(filePath, buffer);

    const host = `localhost:${env.PORT}`;
    const publicUrl = `http://${host}/uploads/voice/${safeFilename}`;

    return {
      url: publicUrl,
      filename: safeFilename,
      size: buffer.length,
    };
  }
}

