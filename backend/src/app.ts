import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import { globalLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';
import routes from './routes/index.js';

export const createApp = (): Express => {
  const app = express();

  // 1. Security & HTTP Middleware
  app.use(helmet());
  app.use(
    cors({
      origin: '*',
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // 2. Body Parsers
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // 3. Logger & Rate Limiter
  if (env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
  }
  app.use(globalLimiter);

  // 4. Mount API Routes
  app.use(env.API_PREFIX, routes);

  // Fallback 404 handler
  app.use('*', (req, res) => {
    res.status(404).json({
      success: false,
      error: {
        message: `Endpoint ${req.method} ${req.originalUrl} not found`,
        statusCode: 404,
      },
    });
  });

  // 5. Centralized Error Handler
  app.use(errorHandler);

  return app;
};
