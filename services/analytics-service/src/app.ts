import express, { Express, Router, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env.js';
import { prisma } from './config/db.js';
import { AnalyticsRequest, requestIdMiddleware } from './middleware/auth.js';
import { errorHandler } from './middleware/errorHandler.js';
import analyticsRoutes from './routes/analytics.routes.js';

export const createApp = (): Express => {
  const app = express();

  let totalRequests = 0;
  let totalErrors = 0;
  let totalDurationMs = 0;

  if (env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
  }

  app.use(requestIdMiddleware);
  app.use((_req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    totalRequests += 1;
    res.on('finish', () => {
      totalDurationMs += Date.now() - start;
      if (res.statusCode >= 500) totalErrors += 1;
    });
    next();
  });

  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

  const allowedOrigins =
    env.CORS_ORIGINS === '*' ? '*' : env.CORS_ORIGINS.split(',').map((o) => o.trim());
  app.use(
    cors({
      origin: allowedOrigins === '*' ? '*' : allowedOrigins,
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'x-request-id',
        'x-service-name',
        'x-service-timestamp',
        'x-service-signature',
      ],
      credentials: true,
    })
  );

  app.use(express.json({ limit: '5mb' }));

  const healthHandler = (_req: Request, res: Response) => {
    res.status(200).json({
      status: 'healthy',
      service: 'kissan-mithar-analytics-service',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    });
  };

  app.get('/health', healthHandler);
  app.get(`${env.API_PREFIX}/health`, healthHandler);

  app.get('/readiness', async (_req: Request, res: Response) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      res.status(200).json({ ready: true, service: 'kissan-mithar-analytics-service' });
    } catch {
      res.status(503).json({
        ready: false,
        service: 'kissan-mithar-analytics-service',
        reason: 'database_unavailable',
      });
    }
  });

  app.get('/metrics', (_req: Request, res: Response) => {
    const mem = process.memoryUsage();
    res.status(200).json({
      service: 'kissan-mithar-analytics-service',
      uptimeSeconds: Math.round(process.uptime()),
      requestsTotal: totalRequests,
      errors5xxTotal: totalErrors,
      avgLatencyMs: totalRequests > 0 ? Number((totalDurationMs / totalRequests).toFixed(2)) : 0,
      memoryRssMb: Math.round(mem.rss / 1024 / 1024),
      timestamp: new Date().toISOString(),
    });
  });

  const api = Router();
  api.use('/analytics', analyticsRoutes);
  app.use(env.API_PREFIX, api);

  app.use('*', (req: AnalyticsRequest, res: Response) => {
    res.status(404).json({
      success: false,
      error: {
        message: `Endpoint ${req.method} ${req.originalUrl} not found on analytics-service`,
        statusCode: 404,
        requestId: req.requestId,
        timestamp: new Date().toISOString(),
      },
    });
  });

  app.use(errorHandler);
  return app;
};
