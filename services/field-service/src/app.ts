import express, { Express, Router, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env.js';
import { prisma } from './config/db.js';
import { FieldRequest, requestIdMiddleware, requireInternalService } from './middleware/auth.js';
import { errorHandler } from './middleware/errorHandler.js';
import expertRoutes from './routes/expert.routes.js';
import consultationRoutes from './routes/consultation.routes.js';
import labourRoutes from './routes/labour.routes.js';
import collaborationRoutes from './routes/collaboration.routes.js';
import adminCollaborationRoutes from './routes/adminCollaboration.routes.js';

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
      service: 'kissan-mithar-field-service',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    });
  };

  app.get('/health', healthHandler);
  app.get(`${env.API_PREFIX}/health`, healthHandler);
  app.get('/readiness', async (_req: Request, res: Response) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      res.status(200).json({ ready: true, service: 'kissan-mithar-field-service' });
    } catch {
      res.status(503).json({ ready: false, service: 'kissan-mithar-field-service', reason: 'database_unavailable' });
    }
  });

  const api = Router();
  api.use('/experts', expertRoutes);
  api.use('/consultations', consultationRoutes);
  api.use('/labour-requests', labourRoutes);
  api.use('/labour-help', labourRoutes);
  api.use('/collaborations', collaborationRoutes);
  api.use('/partnerships', collaborationRoutes);
  api.use('/admin/collaborations', adminCollaborationRoutes);
  app.use(env.API_PREFIX, api);

  // Internal machinery availability inquiry endpoint for Agricultural AI Service
  app.get('/internal/machinery/availability', requireInternalService, (req: Request, res: Response) => {
    const machineryType = String(req.query.machineryType || 'Tractor');
    const village = String(req.query.village || 'Gadwal');
    res.status(200).json({
      success: true,
      data: {
        machineryType,
        hourlyRate: machineryType === 'Drone Sprayer' ? 450 : 800,
        rateUnit: machineryType === 'Drone Sprayer' ? 'per acre' : 'per hour',
        operatorLocation: `${village} Mandal (within 6 km)`,
        status: 'AVAILABLE',
      },
    });
  });

  app.use('*', (req: FieldRequest, res: Response) => {
    res.status(404).json({
      success: false,
      error: {
        message: `Endpoint ${req.method} ${req.originalUrl} not found on field-service`,
        statusCode: 404,
        requestId: req.requestId,
        timestamp: new Date().toISOString(),
      },
    });
  });

  app.use(errorHandler);
  return app;
};
