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
  PORT: parseInt(process.env.PORT || '4011', 10),
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
  IDENTITY_SERVICE_URL: process.env.IDENTITY_SERVICE_URL || '',
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID || 'kissan-mithar-app',
  FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL || '',
  FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    : '',
  MOCK_FIREBASE_AUTH: isProduction
    ? false
    : process.env.MOCK_FIREBASE_AUTH === 'true' || !process.env.FIREBASE_PRIVATE_KEY,
};
