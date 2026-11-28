import pino from 'pino';
import { env } from './env.js';

export const logger = pino({
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  base: { service: 'kissan-mithar-marketplace-service' },
  redact: {
    paths: ['req.headers.authorization', 'req.headers.x-service-signature'],
    censor: '***REDACTED***',
  },
});
