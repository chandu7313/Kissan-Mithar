/**
 * AgriBazaar & Labour Management Microservice Lambda Handler
 *
 * Independently deployable serverless handler for:
 *  - /api/agri-bazaar & /api/crop-buying-selling (Farmer Produce Listings & Buyer Requests)
 *  - /api/labour-requests & /api/labour-help (Labour Task Requests, Allocation & Catalogs)
 *
 * Preserves the exact API contract and database compatibility.
 */
import serverlessExpress from '@codegenie/serverless-express';
import express, { Express, Router } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from '../config/env.js';
import { errorHandler } from '../middleware/errorHandler.js';
import agriBazaarRoutes from '../routes/agriBazaar.routes.js';
import labourRoutes from '../routes/labour.routes.js';

export const createBazaarLabourApp = (): Express => {
  const app = express();

  if (env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
  }

  // 1. Security & CORS
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );

  const allowedOrigins =
    env.CORS_ORIGINS === '*'
      ? '*'
      : env.CORS_ORIGINS.split(',').map((o) => o.trim());

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
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    })
  );

  // 2. Body Parsers
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // 3. Health & Readiness Probes
  const healthHandler = (_req: express.Request, res: express.Response) => {
    res.status(200).json({
      status: 'healthy',
      service: 'kissan-mithar-bazaar-labour',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    });
  };

  app.get('/health', healthHandler);
  app.get(`${env.API_PREFIX}/health`, healthHandler);

  // 4. Domain Sub-Router with Dual Aliases for 100% Backwards Compatibility
  const domainRouter = Router();

  // AgriBazaar routes mounted with both primary and alias endpoints
  domainRouter.use('/agri-bazaar', agriBazaarRoutes);
  domainRouter.use('/crop-buying-selling', agriBazaarRoutes);

  // Labour management routes mounted with both primary and alias endpoints
  domainRouter.use('/labour-requests', labourRoutes);
  domainRouter.use('/labour-help', labourRoutes);

  // Mount at configured API prefix (e.g., /api) and also at root fallback
  app.use(env.API_PREFIX, domainRouter);
  app.use(domainRouter);

  // 5. 404 Fallback for unhandled routes on this microservice
  app.use('*', (req, res) => {
    res.status(404).json({
      success: false,
      error: {
        message: `Endpoint ${req.method} ${req.originalUrl} not found on bazaar-labour service`,
        statusCode: 404,
      },
    });
  });

  // 6. Centralized Error Handler
  app.use(errorHandler);

  return app;
};

// ─── Cold-start Initialization ─────────────────────────────────
const app = createBazaarLabourApp();
const serverlessExpressInstance = serverlessExpress({ app });

// ─── Lambda Handler ────────────────────────────────────────────
export const handler = (event: any, context: any, callback: any) => {
  context.callbackWaitsForEmptyEventLoop = false;
  return serverlessExpressInstance(event, context, callback);
};
