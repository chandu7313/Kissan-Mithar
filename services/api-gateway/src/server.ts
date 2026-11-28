import http from 'http';
import { createApp } from './app.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { initSocketIO } from './config/socket.js';
import { warmupDatabase } from './config/db.js';

const startGateway = async () => {
  try {
    await warmupDatabase();

    const app = createApp();
    const httpServer = http.createServer(app);
    initSocketIO(httpServer);

    httpServer.listen(env.PORT, () => {
      logger.info(
        {
          env: env.NODE_ENV,
          port: env.PORT,
          apiPrefix: env.API_PREFIX,
          architecture: 'microservices',
        },
        '🌐 KISSAN MITHAR API GATEWAY RUNNING'
      );
      console.log('====================================================');
      console.log('🌐 KISSAN MITHAR API GATEWAY RUNNING (Microservices)');
      console.log(`🚀 Environment: ${env.NODE_ENV}`);
      console.log(`📡 Gateway URL: http://localhost:${env.PORT}${env.API_PREFIX}`);
      console.log(`🏥 Health: http://localhost:${env.PORT}${env.API_PREFIX}/health`);
      console.log(`🔌 Socket.IO: ws://localhost:${env.PORT}`);
      console.log('====================================================');
    });

    const shutdown = () => {
      logger.info('Gracefully shutting down API Gateway...');
      httpServer.close(() => {
        logger.info('Closed all connections. Exiting.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    logger.fatal({ err: error }, 'Fatal API Gateway startup error');
    process.exit(1);
  }
};

startGateway();
