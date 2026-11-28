import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const isProduction = process.env.NODE_ENV === 'production';

function requireEnv(key: string, devDefault: string): string {
  const value = process.env[key];
  if (value) return value;
  if (isProduction) {
    throw new Error(`FATAL: Missing required environment variable "${key}" in production mode.`);
  }
  return devDefault;
}

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '4000', 10),
  API_PREFIX: process.env.API_PREFIX || '/api',
  DATABASE_URL: requireEnv(
    'DATABASE_URL',
    'postgresql://postgres:postgres@localhost:5432/kissan_mithar?schema=public'
  ),

  JWT_SECRET: requireEnv('JWT_SECRET', 'kissan_mithar_jwt_super_secret_key_2026_dev'),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '30d',

  CORS_ORIGINS: process.env.CORS_ORIGINS || '*',

  // Service-to-Service Auth & Downstream Microservice URLs
  INTERNAL_SERVICE_SECRET: requireEnv(
    'INTERNAL_SERVICE_SECRET',
    'kissan_mithar_internal_service_secret_dev_2026'
  ),
  SERVICE_TIMEOUT_MS: parseInt(process.env.SERVICE_TIMEOUT_MS || '8000', 10),
  MEDIA_SERVICE_URL: process.env.MEDIA_SERVICE_URL || 'http://localhost:4010',
  NOTIFICATION_SERVICE_URL: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:4011',
  FIELD_SERVICE_URL: process.env.FIELD_SERVICE_URL || 'http://localhost:4012',
  MARKETPLACE_SERVICE_URL: process.env.MARKETPLACE_SERVICE_URL || 'http://localhost:4013',
  AI_SERVICE_URL: process.env.AI_SERVICE_URL || 'http://localhost:4014',
  IDENTITY_SERVICE_URL: process.env.IDENTITY_SERVICE_URL || 'http://localhost:4015',
  ANALYTICS_SERVICE_URL: process.env.ANALYTICS_SERVICE_URL || 'http://localhost:4016',
  ML_SERVICE_URL: process.env.ML_SERVICE_URL || 'http://localhost:8000',
};

if (isProduction && env.JWT_SECRET.length < 32) {
  throw new Error('FATAL: JWT_SECRET is too weak for production. Use a strong random 32+ character string.');
}
