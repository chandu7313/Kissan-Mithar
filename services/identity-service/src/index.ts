import http from 'http';
import { createApp } from './app.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { CleanupService } from './services/cleanup.service.js';

const app = createApp();
const server = http.createServer(app);

server.listen(env.PORT, () => {
  logger.info({ port: env.PORT, env: env.NODE_ENV }, 'Identity & Farmer Service listening');
  console.log(`🪪 [Identity Service] running on http://localhost:${env.PORT}`);
  CleanupService.start();
});

const shutdown = () => {
  CleanupService.stop();
  server.close(() => process.exit(0));
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
