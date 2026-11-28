import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AuthenticatedRequest, AuthUserPayload } from '../types/index.js';
import { AppError } from './errorHandler.js';

export interface MarketplaceRequest extends AuthenticatedRequest {
  requestId?: string;
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

const hydrateUserFromGateway = (req: Request): AuthUserPayload | null => {
  const userId = req.headers['x-user-id'];
  if (typeof userId !== 'string' || !userId) return null;

  return {
    userId,
    role: (typeof req.headers['x-user-role'] === 'string'
      ? req.headers['x-user-role']
      : 'FARMER') as any,
    staffRole:
      typeof req.headers['x-user-staff-role'] === 'string'
        ? req.headers['x-user-staff-role']
        : undefined,
    farmerId:
      typeof req.headers['x-farmer-id'] === 'string'
        ? req.headers['x-farmer-id']
        : undefined,
    expertId:
      typeof req.headers['x-expert-id'] === 'string'
        ? req.headers['x-expert-id']
        : undefined,
    email:
      typeof req.headers['x-user-email'] === 'string'
        ? req.headers['x-user-email']
        : undefined,
  };
};

export const requestIdMiddleware = (
  req: MarketplaceRequest,
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
  req: MarketplaceRequest,
  _res: Response,
  next: NextFunction
): void => {
  const caller = verifyHmacSignature(req);
  if (caller) {
    const gatewayUser = hydrateUserFromGateway(req);
    if (gatewayUser) {
      req.callerService = caller;
      req.user = gatewayUser;
      return next();
    }
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(
      new AppError('Authentication required. Please provide a valid Bearer token.', 401)
    );
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as AuthUserPayload;
    req.user = decoded;
    next();
  } catch (error: any) {
    return next(new AppError('Invalid or expired authentication token', 401, error.message));
  }
};

export const optionalAuth = (
  req: MarketplaceRequest,
  _res: Response,
  next: NextFunction
): void => {
  const caller = verifyHmacSignature(req);
  if (caller) {
    const gatewayUser = hydrateUserFromGateway(req);
    if (gatewayUser) {
      req.callerService = caller;
      req.user = gatewayUser;
      return next();
    }
  }

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as AuthUserPayload;
      req.user = decoded;
    } catch {
      // Ignore error for optional auth
    }
  }
  next();
};
