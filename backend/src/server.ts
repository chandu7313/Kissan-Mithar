import { createApp } from './app.js';
import { env } from './config/env.js';
import { initFirebase } from './config/firebase.js';

const startServer = async () => {
  try {
    // Initialize Firebase Admin (or dev mock)
    initFirebase();

    const app = createApp();

    const server = app.listen(env.PORT, () => {
      console.log('====================================================');
      console.log(`🌾 KISSAN MITHAR BACKEND RUNNING`);
      console.log(`🚀 Environment: ${env.NODE_ENV}`);
      console.log(`📡 URL: http://localhost:${env.PORT}${env.API_PREFIX}`);
      console.log(`🏥 Health: http://localhost:${env.PORT}${env.API_PREFIX}/health`);
      console.log('====================================================');
    });

    // Graceful Shutdown
    const shutdown = () => {
      console.log('\n[Server] Gracefully shutting down...');
      server.close(() => {
        console.log('[Server] Closed all connections. Exiting.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    console.error('Fatal startup error:', error);
    process.exit(1);
  }
};

startServer();
