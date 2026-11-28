import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import { requestIdMiddleware } from './middleware/requestId.js';
import { globalLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';
import routes from './routes/index.js';
import internalRoutes from './routes/internal.routes.js';
import { createGatewayProxy } from './gateway/gatewayProxy.js';

export const createApp = (): Express => {
  const app = express();

  app.use(requestIdMiddleware);

  if (env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
  }

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );

  // Proxy static /uploads/* requests (e.g. voice notes) to Media Service
  const mediaStaticProxy = createGatewayProxy({
    serviceName: 'media-service',
    getTargetUrl: () => env.MEDIA_SERVICE_URL,
    timeoutMs: 15000,
  });
  app.use('/uploads', mediaStaticProxy);

  const allowedOrigins =
    env.CORS_ORIGINS === '*' ? '*' : env.CORS_ORIGINS.split(',').map((o) => o.trim());

  app.use(
    cors({
      origin:
        allowedOrigins === '*'
          ? '*'
          : (origin, callback) => {
              if (!origin || (allowedOrigins as string[]).includes(origin)) {
                callback(null, true);
              } else {
                callback(new Error(`CORS: Origin ${origin} not allowed`));
              }
            },
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'x-request-id', 'Idempotency-Key'],
      credentials: true,
    })
  );

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  if (env.NODE_ENV !== 'test') {
    app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
  }
  app.use(globalLimiter);

  app.get('/health', (_req, res) => {
    res.status(200).json({
      status: 'healthy',
      service: 'kissan-mithar-api-gateway',
      architecture: 'microservices',
      timestamp: new Date().toISOString(),
    });
  });

  app.use('/internal', internalRoutes);
  app.use(env.API_PREFIX, routes);

  app.use('*', (req, res) => {
    res.status(404).json({
      success: false,
      error: {
        message: `Endpoint ${req.method} ${req.originalUrl} not found on API Gateway`,
        statusCode: 404,
        requestId: req.requestId,
      },
    });
  });

  app.use(errorHandler);

  return app;
};
