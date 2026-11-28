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
  PORT: parseInt(process.env.PORT || '4016', 10),
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
};
