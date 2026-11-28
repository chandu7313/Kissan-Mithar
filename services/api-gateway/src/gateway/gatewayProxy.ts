import { Request, Response } from 'express';
import { logger } from '../config/logger.js';
import { AuthenticatedRequest } from '../types/index.js';
import { ServiceHttpClient, ServiceHttpError } from './serviceClient.js';

export interface GatewayProxyOptions {
  serviceName: string;
  getTargetUrl: () => string;
  timeoutMs?: number;
}

/**
 * Pure API Gateway Reverse Proxy Middleware
 *
 * Forwards requests directly to the owning microservice with HMAC service-to-service
 * headers, verified user context headers, x-request-id, and Idempotency-Key.
 * Returns structured 503/502 JSON when a microservice is unconfigured or unavailable.
 */
export const createGatewayProxy = (options: GatewayProxyOptions) => {
  const client = new ServiceHttpClient(options.serviceName, options.getTargetUrl, 'api-gateway');

  return async (req: Request, res: Response): Promise<void> => {
    if (!client.isConfigured()) {
      res.status(503).json({
        success: false,
        error: {
          message: `Service '${options.serviceName}' is not configured on API Gateway`,
          statusCode: 503,
          requestId: req.requestId,
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    const authReq = req as AuthenticatedRequest;
    const forwardHeaders: Record<string, string> = {};

    if (typeof req.headers.authorization === 'string') {
      forwardHeaders.authorization = req.headers.authorization;
    }
    if (typeof req.headers['content-type'] === 'string') {
      forwardHeaders['content-type'] = req.headers['content-type'];
    }
    if (typeof req.headers.origin === 'string') {
      forwardHeaders.origin = req.headers.origin;
    }

    if (authReq.user) {
      if (authReq.user.userId) forwardHeaders['x-user-id'] = authReq.user.userId;
      if (authReq.user.role) forwardHeaders['x-user-role'] = authReq.user.role;
      if (authReq.user.staffRole) forwardHeaders['x-user-staff-role'] = authReq.user.staffRole;
      if (authReq.user.farmerId) forwardHeaders['x-farmer-id'] = authReq.user.farmerId;
      if (authReq.user.expertId) forwardHeaders['x-expert-id'] = authReq.user.expertId;
      if (authReq.user.email) forwardHeaders['x-user-email'] = authReq.user.email;
    }

    const idempotencyKey =
      typeof req.headers['idempotency-key'] === 'string' ? req.headers['idempotency-key'] : undefined;

    try {
      const upstream = await client.request({
        method: req.method as any,
        path: req.originalUrl,
        body: ['GET', 'HEAD', 'OPTIONS'].includes(req.method.toUpperCase()) ? undefined : req.body,
        headers: forwardHeaders,
        requestId: req.requestId,
        idempotencyKey,
        timeoutMs: options.timeoutMs,
      });

      const contentType = upstream.headers.get('content-type');
      if (contentType) {
        res.setHeader('Content-Type', contentType);
      }
      res.setHeader('x-served-by', options.serviceName);

      if (upstream.data === null || upstream.data === undefined) {
        res.status(upstream.status).end();
      } else if (typeof upstream.data === 'string') {
        res.status(upstream.status).send(upstream.data);
      } else {
        res.status(upstream.status).json(upstream.data);
      }
    } catch (error: any) {
      const statusCode = error instanceof ServiceHttpError ? error.statusCode : 502;
      logger.error(
        {
          service: options.serviceName,
          path: req.originalUrl,
          requestId: req.requestId,
          statusCode,
          err: error?.message,
        },
        'Downstream microservice call failed'
      );
      res.status(statusCode).json({
        success: false,
        error: {
          message: error?.message || `Upstream service '${options.serviceName}' unavailable`,
          statusCode,
          requestId: req.requestId,
          timestamp: new Date().toISOString(),
        },
      });
    }
  };
};
