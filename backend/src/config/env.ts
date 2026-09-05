import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const isProduction = process.env.NODE_ENV === 'production';

/**
 * Validates that a required env var is present in production.
 * Falls back to default in development.
 */
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
  DATABASE_URL: requireEnv('DATABASE_URL', 'postgresql://postgres:postgres@localhost:5432/kissan_mithar?schema=public'),

  JWT_SECRET: requireEnv('JWT_SECRET', 'kissan_mithar_jwt_super_secret_key_2026_dev'),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '30d',

  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID || 'kissan-mithar-app',
  FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL || '',
  FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : '',

  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || 'kissan-mithar',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || 'mock_cloudinary_key',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || 'mock_cloudinary_secret',
  CLOUDINARY_UPLOAD_PRESET: process.env.CLOUDINARY_UPLOAD_PRESET || 'kissan_mithar_uploads',

  WEATHER_API_KEY: process.env.WEATHER_API_KEY || '',
  WEATHER_API_URL: process.env.WEATHER_API_URL || 'https://api.openweathermap.org/data/2.5',

  // SMS Provider config
  SMS_PROVIDER: process.env.SMS_PROVIDER || 'FAST2SMS',
  SMS_API_KEY: process.env.SMS_API_KEY || '',

  // Production: mock modes are always OFF
  MOCK_FIREBASE_AUTH: isProduction ? false : (process.env.MOCK_FIREBASE_AUTH === 'true' || !process.env.FIREBASE_PRIVATE_KEY),
  MOCK_WEATHER_FALLBACK: isProduction ? false : (process.env.MOCK_WEATHER_FALLBACK !== 'false'),

  // CORS: comma-separated allowed origins
  CORS_ORIGINS: process.env.CORS_ORIGINS || '*',
};

// Startup validations for production
if (isProduction) {
  if (env.JWT_SECRET.length < 32 || env.JWT_SECRET.includes('dev')) {
    throw new Error('FATAL: JWT_SECRET is too weak for production. Use a strong random 64+ character string.');
  }
  if (env.MOCK_FIREBASE_AUTH) {
    throw new Error('FATAL: MOCK_FIREBASE_AUTH cannot be enabled in production.');
  }
  if (!env.SMS_API_KEY) {
    console.warn('[ENV] WARNING: SMS_API_KEY is not set. OTP SMS delivery will fail.');
  }
}
