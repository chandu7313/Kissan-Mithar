import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '4000', 10),
  API_PREFIX: process.env.API_PREFIX || '/api',
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/kissan_mithar?schema=public',
  
  JWT_SECRET: process.env.JWT_SECRET || 'kissan_mithar_jwt_super_secret_key_2026_dev',
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

  MOCK_FIREBASE_AUTH: process.env.MOCK_FIREBASE_AUTH === 'true' || !process.env.FIREBASE_PRIVATE_KEY,
  MOCK_WEATHER_FALLBACK: process.env.MOCK_WEATHER_FALLBACK !== 'false',
};
