import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const isProduction = process.env.NODE_ENV === 'production';

function requireEnv(key: string, devDefault: string): string {
  const value = process.env[key];
  if (value) return value;
  if (isProduction) {
    throw new Error(`FATAL: Missing required environment variable "${key}" in production.`);
  }
  return devDefault;
}

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '4010', 10),
  API_PREFIX: process.env.API_PREFIX || '/api',
  CORS_ORIGINS: process.env.CORS_ORIGINS || '*',
  JWT_SECRET: requireEnv('JWT_SECRET', 'kissan_mithar_jwt_super_secret_key_2026_dev'),
  INTERNAL_SERVICE_SECRET: requireEnv(
    'INTERNAL_SERVICE_SECRET',
    'kissan_mithar_internal_service_secret_dev_2026'
  ),
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || 'kissan-mithar',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || 'mock_cloudinary_key',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || 'mock_cloudinary_secret',
  CLOUDINARY_UPLOAD_PRESET: process.env.CLOUDINARY_UPLOAD_PRESET || 'kissan_mithar_uploads',
  PUBLIC_BASE_URL: process.env.PUBLIC_BASE_URL || '',
};
