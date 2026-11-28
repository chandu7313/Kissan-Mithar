import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { env } from './config/env.js';
import { prisma } from './config/db.js';
import { logger } from './config/logger.js';
import { NotificationRequest, requestIdMiddleware } from './middleware/auth.js';
import {
  publicNotificationRouter,
  internalNotificationRouter,
} from './routes/notification.routes.js';

export const createApp = (): Express => {
  const app = express();

  if (env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
  }

  app.use(requestIdMiddleware);
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

  const allowedOrigins =
    env.CORS_ORIGINS === '*' ? '*' : env.CORS_ORIGINS.split(',').map((o) => o.trim());

  app.use(
    cors({
      origin: allowedOrigins === '*' ? '*' : allowedOrigins,
      methods: ['GET', 'POST', 'PATCH', 'OPTIONS'],
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'x-request-id',
        'Idempotency-Key',
        'x-service-name',
        'x-service-timestamp',
        'x-service-signature',
      ],
      credentials: true,
    })
  );

  app.use(express.json({ limit: '5mb' }));
  app.use(express.urlencoded({ extended: true, limit: '5mb' }));

  const healthHandler = (_req: Request, res: Response) => {
    res.status(200).json({
      status: 'healthy',
      service: 'kissan-mithar-notification-service',
      version: '1.0.0',
      fcmMode: env.MOCK_FIREBASE_AUTH ? 'mock' : 'active',
      timestamp: new Date().toISOString(),
    });
  };

  app.get('/health', healthHandler);
  app.get(`${env.API_PREFIX}/health`, healthHandler);

  app.get('/readiness', async (_req: Request, res: Response) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      res.status(200).json({ ready: true, service: 'kissan-mithar-notification-service' });
    } catch {
      res.status(503).json({
        ready: false,
        service: 'kissan-mithar-notification-service',
        reason: 'database_unavailable',
      });
    }
  });

  app.use(`${env.API_PREFIX}/notifications`, publicNotificationRouter);
  app.use('/internal/notifications', internalNotificationRouter);

  app.use('*', (req: NotificationRequest, res) => {
    res.status(404).json({
      success: false,
      error: {
        message: `Endpoint ${req.method} ${req.originalUrl} not found on notification-service`,
        statusCode: 404,
        requestId: req.requestId,
        timestamp: new Date().toISOString(),
      },
    });
  });

  app.use((err: any, req: NotificationRequest, res: Response, _next: NextFunction) => {
    let statusCode = err?.statusCode || 500;
    let message = err?.message || 'Internal Server Error';
    let details: any;

    if (err instanceof ZodError) {
      statusCode = 400;
      message = 'Validation Error';
      details = err.errors.map((e) => ({ field: e.path.join('.'), message: e.message }));
    } else if (
      err instanceof Prisma.PrismaClientInitializationError ||
      (typeof err?.code === 'string' && err.code.startsWith('P1'))
    ) {
      statusCode = 503;
      message = 'Database temporarily unavailable. Retrying...';
    }

    if (statusCode >= 500) {
      logger.error({ err, requestId: req.requestId }, 'Notification Service error');
    }

    res.status(statusCode).json({
      success: false,
      error: {
        message,
        statusCode,
        details: env.NODE_ENV === 'production' && statusCode >= 500 ? undefined : details,
        requestId: req.requestId,
        timestamp: new Date().toISOString(),
      },
    });
  });

  return app;
};
