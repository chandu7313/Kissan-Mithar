/**
 * AWS Lambda Scheduled Event Handler — EventBridge → CleanupService
 *
 * Triggered on a schedule (e.g., rate(6 hours)) to purge:
 *  - Expired / used OTPs older than 1 hour
 *  - Audit logs older than 90 days
 *
 * Entry point for SAM: dist/cleanup-handler.handler
 */
import { CleanupService } from './services/cleanup.service.js';
import { logger } from './config/logger.js';

export const handler = async (event: any, context: any) => {
  context.callbackWaitsForEmptyEventLoop = false;

  const startTime = Date.now();
  logger.info({ event, time: new Date().toISOString() }, 'Scheduled cleanup job invoked');

  try {
    await CleanupService.runAll();
    const durationMs = Date.now() - startTime;
    logger.info({ durationMs }, 'Scheduled cleanup completed successfully');

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: 'Cleanup tasks completed successfully',
        durationMs,
        timestamp: new Date().toISOString(),
      }),
    };
  } catch (error: any) {
    logger.error({ err: error }, 'Scheduled cleanup failed');
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error?.message || 'Unknown cleanup error',
        timestamp: new Date().toISOString(),
      }),
    };
  }
};
