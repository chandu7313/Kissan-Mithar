import pino from 'pino';
import { env } from './env.js';

export const logger = pino({
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  transport:
    env.NODE_ENV !== 'production'
      ? { target: 'pino-pretty', options: { colorize: true, translateTime: 'SYS:HH:MM:ss' } }
      : undefined,
  base: { service: 'kissan-mithar-api' },
  redact: {
    paths: ['req.headers.authorization', 'password', 'passwordHash', 'otp', 'devOtp', 'FIREBASE_PRIVATE_KEY'],
    censor: '***REDACTED***',
  },
});
