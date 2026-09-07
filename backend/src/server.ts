import http from 'http';
import { createApp } from './app.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { initFirebase } from './config/firebase.js';
import { initSocketIO } from './config/socket.js';
import { warmupDatabase } from './config/db.js';
import { CleanupService } from './services/cleanup.service.js';

const startServer = async () => {
  try {
    // Initialize Firebase Admin (or dev mock)
    initFirebase();

    // Pre-warm the database connection (handles Supabase cold starts)
    await warmupDatabase();

    const app = createApp();

    // Create HTTP server and attach Socket.IO for real-time events
    const httpServer = http.createServer(app);
    initSocketIO(httpServer);

    // Start periodic cleanup (expired OTPs, old audit logs)
    CleanupService.start();

    httpServer.listen(env.PORT, () => {
      logger.info({
        env: env.NODE_ENV,
        port: env.PORT,
        apiPrefix: env.API_PREFIX,
        mockFirebase: env.MOCK_FIREBASE_AUTH,
      }, '🌾 KISSAN MITHAR BACKEND RUNNING');
      console.log('====================================================');
      console.log(`🌾 KISSAN MITHAR BACKEND RUNNING`);
      console.log(`🚀 Environment: ${env.NODE_ENV}`);
      console.log(`📡 URL: http://localhost:${env.PORT}${env.API_PREFIX}`);
      console.log(`🏥 Health: http://localhost:${env.PORT}${env.API_PREFIX}/health`);
      console.log(`🔌 Socket.IO: ws://localhost:${env.PORT}`);
      console.log('====================================================');
    });

    // Graceful Shutdown
    const shutdown = () => {
      logger.info('Gracefully shutting down...');
      CleanupService.stop();
      httpServer.close(() => {
        logger.info('Closed all connections. Exiting.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    logger.fatal({ err: error }, 'Fatal startup error');
    process.exit(1);
  }
};

startServer();
