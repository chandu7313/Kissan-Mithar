import express, { Express, Router, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env.js';
import { prisma } from './config/db.js';
import { initFirebase } from './config/firebase.js';
import { IdentityRequest, requestIdMiddleware } from './middleware/auth.js';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/auth.routes.js';
import farmerRoutes from './routes/farmer.routes.js';
import deviceRoutes from './routes/device.routes.js';
import internalRoutes from './routes/internal.routes.js';

export const createApp = (): Express => {
  initFirebase();

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

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  const healthHandler = (_req: Request, res: Response) => {
    res.status(200).json({
      status: 'healthy',
      service: 'kissan-mithar-identity-service',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    });
  };

  app.get('/health', healthHandler);
  app.get(`${env.API_PREFIX}/health`, healthHandler);
  app.get('/readiness', async (_req: Request, res: Response) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      res.status(200).json({ ready: true, service: 'kissan-mithar-identity-service' });
    } catch {
      res.status(503).json({
        ready: false,
        service: 'kissan-mithar-identity-service',
        reason: 'database_unavailable',
      });
    }
  });

  app.use('/internal', internalRoutes);

  const api = Router();
  api.use('/auth', authRoutes);
  api.use('/farmers', farmerRoutes);
  api.use('/devices', deviceRoutes);
  app.use(env.API_PREFIX, api);

  app.use('*', (req: IdentityRequest, res: Response) => {
    res.status(404).json({
      success: false,
      error: {
        message: `Endpoint ${req.method} ${req.originalUrl} not found on identity-service`,
        statusCode: 404,
        requestId: req.requestId,
        timestamp: new Date().toISOString(),
      },
    });
  });

  app.use(errorHandler);
  return app;
};
