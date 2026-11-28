import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export interface NotificationUser {
  userId: string;
  role: string;
  staffRole?: string;
  farmerId?: string;
  email?: string;
}

export interface NotificationRequest extends Request {
  requestId?: string;
  user?: NotificationUser;
  callerService?: string;
}

const verifyHmacSignature = (req: Request): string | null => {
  const serviceName = req.headers['x-service-name'];
  const timestamp = req.headers['x-service-timestamp'];
  const signature = req.headers['x-service-signature'];

  if (
    typeof serviceName !== 'string' ||
    typeof timestamp !== 'string' ||
    typeof signature !== 'string'
  ) {
    return null;
  }

  const tsNum = Number(timestamp);
  if (!Number.isFinite(tsNum) || Math.abs(Date.now() - tsNum) > 5 * 60 * 1000) {
    return null;
  }

  const pathOnly = req.originalUrl.split('?')[0];
  const payload = `${serviceName}:${timestamp}:${req.method.toUpperCase()}:${pathOnly}`;
  const expected = crypto
    .createHmac('sha256', env.INTERNAL_SERVICE_SECRET)
    .update(payload)
    .digest('hex');

  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return null;
  }

  return serviceName;
};

export const requestIdMiddleware = (
  req: NotificationRequest,
  res: Response,
  next: NextFunction
): void => {
  const incoming = req.headers['x-request-id'];
  const requestId =
    typeof incoming === 'string' && incoming.trim() ? incoming.trim() : crypto.randomUUID();
  req.requestId = requestId;
  res.setHeader('x-request-id', requestId);
  next();
};

export const requireAuth = (
  req: NotificationRequest,
  res: Response,
  next: NextFunction
): void => {
  const caller = verifyHmacSignature(req);
  const forwardedUserId = req.headers['x-user-id'];
  const forwardedRole = req.headers['x-user-role'];

  if (caller && typeof forwardedUserId === 'string' && forwardedUserId) {
    req.callerService = caller;
    req.user = {
      userId: forwardedUserId,
      role: typeof forwardedRole === 'string' ? forwardedRole : 'FARMER',
      staffRole:
        typeof req.headers['x-user-staff-role'] === 'string'
          ? req.headers['x-user-staff-role']
          : undefined,
      farmerId:
        typeof req.headers['x-farmer-id'] === 'string'
          ? req.headers['x-farmer-id']
          : undefined,
      email:
        typeof req.headers['x-user-email'] === 'string'
          ? req.headers['x-user-email']
          : undefined,
    };
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error: {
        message: 'Authentication required. Please provide a valid Bearer token.',
        statusCode: 401,
        requestId: req.requestId,
        timestamp: new Date().toISOString(),
      },
    });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({
      success: false,
      error: {
        message: 'Invalid or expired authentication token',
        statusCode: 401,
        requestId: req.requestId,
        timestamp: new Date().toISOString(),
      },
    });
  }
};

export const requireRole = (...allowedRoles: string[]) => {
  return (req: NotificationRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: {
          message: 'Forbidden: insufficient permissions',
          statusCode: 403,
          requestId: req.requestId,
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }
    next();
  };
};

export const requireInternalService = (
  req: NotificationRequest,
  res: Response,
  next: NextFunction
): void => {
  const caller = verifyHmacSignature(req);
  if (!caller) {
    res.status(403).json({
      success: false,
      error: {
        message: 'Forbidden: Valid internal service signature required',
        statusCode: 403,
        requestId: req.requestId,
        timestamp: new Date().toISOString(),
      },
    });
    return;
  }
  req.callerService = caller;
  next();
};
