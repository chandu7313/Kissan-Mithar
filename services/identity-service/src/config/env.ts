import dotenv from 'dotenv';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

function requireEnv(name: string, devFallback?: string): string {
  const value = process.env[name];
  if (value) return value;
  if (!isProduction && devFallback !== undefined) return devFallback;
  throw new Error(`CRITICAL: Missing required environment variable ${name}`);
}

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '4015', 10),
  API_PREFIX: process.env.API_PREFIX || '/api',
  CORS_ORIGINS: process.env.CORS_ORIGINS || '*',
  DATABASE_URL: requireEnv(
    'DATABASE_URL',
    'postgresql://postgres:postgres@localhost:5432/kissan_mithar?schema=public'
  ),
  JWT_SECRET: requireEnv('JWT_SECRET', 'kissan_mithar_jwt_super_secret_key_2026_dev'),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '30d',
  INTERNAL_SERVICE_SECRET: requireEnv(
    'INTERNAL_SERVICE_SECRET',
    'kissan_mithar_internal_service_secret_dev_2026'
  ),
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID || 'kissan-mithar-app',
  FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL || '',
  FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    : '',
  MOCK_FIREBASE_AUTH: isProduction
    ? false
    : process.env.MOCK_FIREBASE_AUTH === 'true' || !process.env.FIREBASE_PRIVATE_KEY,
  SMS_PROVIDER: process.env.SMS_PROVIDER || 'mock',
  SMS_API_KEY: process.env.SMS_API_KEY || '',
};
