import http from 'http';
import { createApp } from './app.js';
import { env } from './config/env.js';
import { initFirebase } from './config/firebase.js';
import { logger } from './config/logger.js';

initFirebase();

const app = createApp();
const server = http.createServer(app);

server.listen(env.PORT, () => {
  logger.info({ port: env.PORT, env: env.NODE_ENV }, 'Notification Service listening');
  console.log(`🔔 [Notification Service] running on http://localhost:${env.PORT}`);
});

const shutdown = () => {
  server.close(() => process.exit(0));
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
