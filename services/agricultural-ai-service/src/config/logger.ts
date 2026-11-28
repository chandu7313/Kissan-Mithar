import pino from 'pino';
import { env } from './env.js';

export const logger = pino({
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  base: { service: 'kissan-mithar-agricultural-ai-service' },
  redact: {
    paths: ['req.headers.authorization', 'req.headers.x-service-signature', 'GEMINI_API_KEY'],
    censor: '***REDACTED***',
  },
});
