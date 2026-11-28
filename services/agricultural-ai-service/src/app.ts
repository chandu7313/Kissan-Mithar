import express, { Express, Router, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env.js';
import { prisma } from './config/db.js';
import { AiRequest, requestIdMiddleware } from './middleware/auth.js';
import { errorHandler } from './middleware/errorHandler.js';
import aiRoutes from './routes/ai.routes.js';
import advisoryRoutes from './routes/advisory.routes.js';
import diseaseRoutes from './routes/disease.routes.js';
import fertilizerRoutes from './routes/fertilizer.routes.js';
import orchardRoutes from './routes/orchard.routes.js';
import weatherRoutes from './routes/weather.routes.js';

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
      service: 'kissan-mithar-agricultural-ai-service',
      version: '1.0.0',
      llmProvider: env.GEMINI_API_KEY ? 'gemini' : 'mock_fallback',
      mlServiceUrl: env.ML_SERVICE_URL,
      timestamp: new Date().toISOString(),
    });
  };

  app.get('/health', healthHandler);
  app.get(`${env.API_PREFIX}/health`, healthHandler);
  app.get('/readiness', async (_req: Request, res: Response) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      res.status(200).json({ ready: true, service: 'kissan-mithar-agricultural-ai-service' });
    } catch {
      res.status(503).json({
        ready: false,
        service: 'kissan-mithar-agricultural-ai-service',
        reason: 'database_unavailable',
      });
    }
  });

  const api = Router();
  api.use('/ai', aiRoutes);
  api.use('/advisories', advisoryRoutes);
  api.use('/disease-requests', diseaseRoutes);
  api.use('/disease-help', diseaseRoutes);
  api.use('/fertilizer-requests', fertilizerRoutes);
  api.use('/fertilizer-guide', fertilizerRoutes);
  api.use('/orchard-requests', orchardRoutes);
  api.use('/weather', weatherRoutes);
  app.use(env.API_PREFIX, api);

  app.use('*', (req: AiRequest, res: Response) => {
    res.status(404).json({
      success: false,
      error: {
        message: `Endpoint ${req.method} ${req.originalUrl} not found on agricultural-ai-service`,
        statusCode: 404,
        requestId: req.requestId,
        timestamp: new Date().toISOString(),
      },
    });
  });

  app.use(errorHandler);
  return app;
};
