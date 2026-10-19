/**
 * Core Identity, Profiles & Platform Microservice Lambda Handler
 *
 * Independently deployable serverless handler for:
 *  - /api/auth (JWT, Mobile OTP, Email OTP, Password Login, Audit Logs)
 *  - /api/farmers (Farmer Profile Management & Directory)
 *  - /api/experts (Expert Directory & Admin Provisioning)
 *  - /api/devices (FCM Push Device Token Registration)
 *  - /api/notifications (Farmer In-App Notification Center)
 *  - /api/uploads (Cloudinary Signed Payload Generation & Voice Audio)
 *
 * Preserves the exact API contract and database compatibility.
 */
import serverlessExpress from '@codegenie/serverless-express';
import express, { Express, Router } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from '../config/env.js';
import { initFirebase } from '../config/firebase.js';
import { logger } from '../config/logger.js';
import { errorHandler } from '../middleware/errorHandler.js';
import authRoutes from '../routes/auth.routes.js';
import farmerRoutes from '../routes/farmer.routes.js';
import expertRoutes from '../routes/expert.routes.js';
import deviceRoutes from '../routes/device.routes.js';
import notificationRoutes from '../routes/notification.routes.js';
import uploadRoutes from '../routes/upload.routes.js';
import adminRoutes from '../routes/admin.routes.js';

// ─── Cold-start Initialization ─────────────────────────────────
try {
  initFirebase();
} catch (error) {
  logger.warn({ err: error }, 'Firebase initialization warning during cold start');
}

export const createCoreIdentityApp = (): Express => {
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
      service: 'kissan-mithar-core-identity',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    });
  };

  app.get('/health', healthHandler);
  app.get(`${env.API_PREFIX}/health`, healthHandler);

  // 4. Domain Sub-Router
  const domainRouter = Router();

  domainRouter.use('/auth', authRoutes);
  domainRouter.use('/farmers', farmerRoutes);
  domainRouter.use('/experts', expertRoutes);
  domainRouter.use('/devices', deviceRoutes);
  domainRouter.use('/notifications', notificationRoutes);
  domainRouter.use('/uploads', uploadRoutes);
  domainRouter.use('/admin', adminRoutes);

  // Mount at configured API prefix (e.g., /api) and also at root fallback
  app.use(env.API_PREFIX, domainRouter);
  app.use(domainRouter);

  // 5. 404 Fallback for unhandled routes on this microservice
  app.use('*', (req, res) => {
    res.status(404).json({
      success: false,
      error: {
        message: `Endpoint ${req.method} ${req.originalUrl} not found on core-identity service`,
        statusCode: 404,
      },
    });
  });

  // 6. Centralized Error Handler
  app.use(errorHandler);

  return app;
};

// ─── Cold-start Instance Creation ──────────────────────────────
const app = createCoreIdentityApp();
const serverlessExpressInstance = serverlessExpress({
  app,
  binarySettings: {
    contentTypes: [
      'image/*',
      'audio/*',
      'video/*',
      'application/pdf',
      'application/octet-stream',
    ],
  },
});

// ─── Lambda Handler ────────────────────────────────────────────
export const handler = (event: any, context: any, callback: any) => {
  context.callbackWaitsForEmptyEventLoop = false;
  return serverlessExpressInstance(event, context, callback);
};
