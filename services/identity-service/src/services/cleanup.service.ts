import { prisma } from '../config/db.js';
import { logger } from '../config/logger.js';

/**
 * Periodic cleanup tasks for production hygiene
 */
export class CleanupService {
  private static intervalId: NodeJS.Timeout | null = null;

  /**
   * Starts periodic cleanup (every 6 hours)
   */
  static start(intervalMs = 6 * 60 * 60 * 1000) {
    // Run once immediately on startup
    this.runAll().catch((err) => logger.error({ err }, 'Initial cleanup failed'));

    this.intervalId = setInterval(() => {
      this.runAll().catch((err) => logger.error({ err }, 'Periodic cleanup failed'));
    }, intervalMs);

    logger.info({ intervalHours: intervalMs / 3600000 }, 'Cleanup service started');
  }

  static stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  static async runAll() {
    await this.cleanExpiredOtps();
    await this.cleanOldAuditLogs();
  }

  /**
   * Delete expired and used OTPs older than 1 hour
   */
  static async cleanExpiredOtps() {
    try {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const result = await (prisma as any).emailOtp.deleteMany({
        where: {
          OR: [
            { expiresAt: { lt: new Date() } },
            { isUsed: true, createdAt: { lt: oneHourAgo } },
          ],
        },
      });
      if (result.count > 0) {
        logger.info({ deletedCount: result.count }, 'Cleaned expired OTPs');
      }
    } catch (err) {
      logger.warn({ err }, 'Failed to clean expired OTPs');
    }
  }

  /**
   * Delete audit logs older than 90 days
   */
  static async cleanOldAuditLogs() {
    try {
      const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
      const result = await (prisma as any).authAuditLog.deleteMany({
        where: {
          timestamp: { lt: ninetyDaysAgo },
        },
      });
      if (result.count > 0) {
        logger.info({ deletedCount: result.count }, 'Cleaned old audit logs');
      }
    } catch (err) {
      logger.warn({ err }, 'Failed to clean old audit logs');
    }
  }
}
