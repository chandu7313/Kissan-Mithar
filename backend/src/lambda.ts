/**
 * AWS Lambda Handler — API Gateway HTTP API → Express
 *
 * Wraps the existing Express application using @codegenie/serverless-express.
 * All initialization runs outside the handler function so that database
 * connections, Firebase SDK, and the Express app are reused across warm
 * Lambda invocations (same container).
 *
 * Entry point for SAM: dist/lambda.handler
 */
import serverlessExpress from '@codegenie/serverless-express';
import { createApp } from './app.js';
import { initFirebase } from './config/firebase.js';
import { logger } from './config/logger.js';

// ─── Cold-start Initialization ─────────────────────────────────
// Runs once per Lambda container. Reused for all subsequent warm invocations.

try {
  initFirebase();
} catch (error) {
  logger.warn({ err: error }, 'Firebase initialization warning during Lambda cold start');
}

const app = createApp();
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
  // Prevent Lambda from waiting for empty event loop (keeps DB connections alive)
  context.callbackWaitsForEmptyEventLoop = false;
  return serverlessExpressInstance(event, context, callback);
};
