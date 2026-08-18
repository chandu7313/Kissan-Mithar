import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/index.js';

const cache = new Map<string, { value: any, expiry: number }>();

export const cacheMiddleware = (durationSeconds: number) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.method !== 'GET') {
      return next();
    }

    const authReq = req as AuthenticatedRequest;
    const userPrefix = authReq.user ? `${authReq.user.role}-${authReq.user.userId || authReq.user.expertId || authReq.user.farmerId}-` : '';
    const key = userPrefix + (req.originalUrl || req.url);
    
    const cachedData = cache.get(key);

    if (cachedData && cachedData.expiry > Date.now()) {
      return res.json(cachedData.value);
    }

    const originalJson = res.json.bind(res);
    res.json = (body: any) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        cache.set(key, {
          value: body,
          expiry: Date.now() + durationSeconds * 1000,
        });
      }
      return originalJson(body);
    };

    next();
  };
};
