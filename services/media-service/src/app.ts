import path from 'path';
import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { ZodError } from 'zod';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { MediaRequest, requestIdMiddleware } from './middleware/auth.js';
import { publicMediaRouter, internalMediaRouter } from './routes/media.routes.js';

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
      methods: ['GET', 'POST', 'OPTIONS'],
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

  app.use(express.json({ limit: '15mb' }));
  app.use(express.urlencoded({ extended: true, limit: '15mb' }));

  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  const healthHandler = (_req: Request, res: Response) => {
    res.status(200).json({
      status: 'healthy',
      service: 'kissan-mithar-media-service',
      version: '1.0.0',
      cloudinaryConfigured:
        Boolean(env.CLOUDINARY_CLOUD_NAME) && env.CLOUDINARY_API_KEY !== 'mock_cloudinary_key',
      timestamp: new Date().toISOString(),
    });
  };

  app.get('/health', healthHandler);
  app.get(`${env.API_PREFIX}/health`, healthHandler);
  app.get('/readiness', (_req, res) => {
    res.status(200).json({ ready: true, service: 'kissan-mithar-media-service' });
  });

  app.use(`${env.API_PREFIX}/uploads`, publicMediaRouter);
  app.use('/internal', internalMediaRouter);

  app.use('*', (req: MediaRequest, res) => {
    res.status(404).json({
      success: false,
      error: {
        message: `Endpoint ${req.method} ${req.originalUrl} not found on media-service`,
        statusCode: 404,
        requestId: req.requestId,
        timestamp: new Date().toISOString(),
      },
    });
  });

  app.use((err: any, req: MediaRequest, res: Response, _next: NextFunction) => {
    const statusCode = err instanceof ZodError ? 400 : err?.statusCode || 500;
    const message = err instanceof ZodError ? 'Validation Error' : err?.message || 'Internal Server Error';
    if (statusCode >= 500) {
      logger.error({ err, requestId: req.requestId }, 'Media Service error');
    }
    res.status(statusCode).json({
      success: false,
      error: {
        message,
        statusCode,
        requestId: req.requestId,
        timestamp: new Date().toISOString(),
      },
    });
  });

  return app;
};
