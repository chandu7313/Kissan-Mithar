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
      upload_preset: env.CLOUDINARY_UPLOAD_PRESET,
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
      uploadPreset: env.CLOUDINARY_UPLOAD_PRESET,
      folder,
    };
  }
}
