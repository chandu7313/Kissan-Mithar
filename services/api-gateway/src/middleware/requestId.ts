import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';

declare global {
  namespace Express {
    interface Request {
      requestId?: string;
    }
  }
}

/**
 * Attaches a unique correlation ID (x-request-id) to every inbound request
 * and echoes it back in response headers for distributed log tracing.
 */
export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const incoming = req.headers['x-request-id'];
  const requestId =
    typeof incoming === 'string' && incoming.trim().length > 0 && incoming.length <= 128
      ? incoming.trim()
      : crypto.randomUUID();

  req.requestId = requestId;
  res.setHeader('x-request-id', requestId);
  next();
};
