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
  PORT: parseInt(process.env.PORT || '4014', 10),
  API_PREFIX: process.env.API_PREFIX || '/api',
  CORS_ORIGINS: process.env.CORS_ORIGINS || '*',
  DATABASE_URL: requireEnv(
    'DATABASE_URL',
    'postgresql://postgres:postgres@localhost:5432/kissan_mithar?schema=public'
  ),
  JWT_SECRET: requireEnv('JWT_SECRET', 'kissan_mithar_jwt_super_secret_key_2026_dev'),
  INTERNAL_SERVICE_SECRET: requireEnv(
    'INTERNAL_SERVICE_SECRET',
    'kissan_mithar_internal_service_secret_dev_2026'
  ),
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  GEMINI_MODEL: process.env.GEMINI_MODEL || 'gemini-1.5-pro',
  ML_SERVICE_URL: process.env.ML_SERVICE_URL || 'http://localhost:8000',
  MEDIA_SERVICE_URL: process.env.MEDIA_SERVICE_URL || '',
  NOTIFICATION_SERVICE_URL: process.env.NOTIFICATION_SERVICE_URL || '',
  FIELD_SERVICE_URL: process.env.FIELD_SERVICE_URL || '',
  MARKETPLACE_SERVICE_URL: process.env.MARKETPLACE_SERVICE_URL || '',
  GATEWAY_URL: process.env.GATEWAY_URL || '',
};
