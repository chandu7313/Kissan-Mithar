import { NotificationType } from '@prisma/client';
import { prisma } from '../config/db.js';
import { getFirebaseMessaging } from '../config/firebase.js';
import { logger } from '../config/logger.js';
import { IdentityClient } from '../clients/identityClient.js';

export interface SendNotificationParams {
  farmerId: string;
  title: string;
  body: string;
  type?: NotificationType;
  deepLink?: string;
  data?: Record<string, string>;
  idempotencyKey?: string;
}

export interface AdminBroadcastParams {
  targetType: 'ALL' | 'DISTRICT' | 'CROP';
  targetValue?: string;
  title: string;
  body: string;
  type?: NotificationType;
  deepLink?: string;
  adminId?: string;
  adminEmail?: string;
  ip?: string;
}

// Short-lived in-memory idempotency cache to prevent duplicate notification creation on retries
const idempotencyCache = new Map<string, { value: any; expiresAt: number }>();

export class NotificationService {
  static async sendNotification(params: SendNotificationParams) {
    const {
      farmerId,
      title,
      body,
      type = 'INFO',
      deepLink,
      data = {},
      idempotencyKey,
    } = params;

    if (idempotencyKey) {
      const hit = idempotencyCache.get(idempotencyKey);
      if (hit && hit.expiresAt > Date.now()) {
        return hit.value;
      }
    }

    const savedNotification = await prisma.notification.create({
      data: {
        farmerId,
        title,
        body,
        type,
        deepLink,
      },
    });

    let devices: Array<{ fcmToken: string }> = [];
    if (IdentityClient.isEnabled()) {
      try {
        devices = await IdentityClient.getFarmerDevices(farmerId);
      } catch (err: any) {
        logger.warn({ err: err?.message, farmerId }, 'IdentityClient device lookup fallback to DB');
        devices = await prisma.device.findMany({
          where: { farmerId },
          select: { fcmToken: true },
        });
      }
    } else {
      devices = await prisma.device.findMany({
        where: { farmerId },
        select: { fcmToken: true },
      });
    }

    const messaging = getFirebaseMessaging();
    if (messaging && devices.length > 0) {
      const tokens = devices.map((d) => d.fcmToken).filter(Boolean);
      if (tokens.length > 0) {
        try {
          const response = await messaging.sendEachForMulticast({
            tokens,
            notification: { title, body },
            data: {
              ...data,
              type,
              deepLink: deepLink || '',
              notificationId: savedNotification.id,
            },
          });
          logger.info(
            { successCount: response.successCount, failureCount: response.failureCount, farmerId },
            'FCM multicast delivered'
          );
        } catch (fcmError: any) {
          logger.warn({ err: fcmError?.message, farmerId }, 'FCM delivery failed');
        }
      }
    }

    if (idempotencyKey) {
      idempotencyCache.set(idempotencyKey, {
        value: savedNotification,
        expiresAt: Date.now() + 10 * 60 * 1000,
      });
    }

    return savedNotification;
  }

  static async getFarmerNotifications(farmerId: string, limit = 20) {
    return await prisma.notification.findMany({
      where: { farmerId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  static async markAsRead(notificationId: string, farmerId: string) {
    return await prisma.notification.updateMany({
      where: { id: notificationId, farmerId },
      data: { isRead: true },
    });
  }

  static async markAllAsRead(farmerId: string) {
    return await prisma.notification.updateMany({
      where: { farmerId, isRead: false },
      data: { isRead: true },
    });
  }

  static async getAdminNotificationStats() {
    let deviceSummary: { total: number; android: number; ios: number; active30d: number };
    const [notificationReadStats, recentHistory] = await Promise.all([
      prisma.notification.groupBy({ by: ['isRead'], _count: { _all: true } }),
      prisma.notification.findMany({
        take: 50,
        orderBy: { createdAt: 'desc' },
        include: {
          farmer: {
            select: { id: true, name: true, phoneNumber: true, village: true, district: true },
          },
        },
      }),
    ]);

    if (IdentityClient.isEnabled()) {
      try {
        deviceSummary = await IdentityClient.getDeviceStats();
      } catch (err: any) {
        logger.warn({ err: err?.message }, 'IdentityClient stats lookup fallback to DB');
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const [devicePlatformStats, active30d] = await Promise.all([
          prisma.device.groupBy({ by: ['platform'], _count: { _all: true } }),
          prisma.device.count({ where: { lastActive: { gte: thirtyDaysAgo } } }),
        ]);
        let total = 0;
        let android = 0;
        let ios = 0;
        for (const d of devicePlatformStats) {
          const count = d._count._all;
          total += count;
          const plat = (d.platform || '').toLowerCase();
          if (plat === 'android') android += count;
          else if (plat === 'ios') ios += count;
        }
        deviceSummary = { total, android, ios, active30d };
      }
    } else {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const [devicePlatformStats, active30d] = await Promise.all([
        prisma.device.groupBy({ by: ['platform'], _count: { _all: true } }),
        prisma.device.count({ where: { lastActive: { gte: thirtyDaysAgo } } }),
      ]);
      let total = 0;
      let android = 0;
      let ios = 0;
      for (const d of devicePlatformStats) {
        const count = d._count._all;
        total += count;
        const plat = (d.platform || '').toLowerCase();
        if (plat === 'android') android += count;
        else if (plat === 'ios') ios += count;
      }
      deviceSummary = { total, android, ios, active30d };
    }

    let totalNotifications = 0;
    let unreadNotifications = 0;
    for (const n of notificationReadStats) {
      const count = n._count._all;
      totalNotifications += count;
      if (!n.isRead) unreadNotifications += count;
    }

    return {
      devices: deviceSummary,
      notifications: {
        total: totalNotifications,
        unread: unreadNotifications,
        read: Math.max(0, totalNotifications - unreadNotifications),
      },
      recentHistory,
    };
  }

  static async sendAdminBroadcast(params: AdminBroadcastParams) {
    const {
      targetType,
      targetValue,
      title,
      body,
      type = 'INFO',
      deepLink,
      adminId,
      adminEmail,
      ip,
    } = params;

    let targetFarmers: Array<{ id: string; devices: Array<{ fcmToken: string }> }> = [];
    if (IdentityClient.isEnabled()) {
      try {
        targetFarmers = await IdentityClient.getBroadcastTargets(targetType, targetValue);
      } catch (err: any) {
        logger.warn({ err: err?.message }, 'IdentityClient broadcast targets fallback to DB');
        const where: any = {};
        if (targetType === 'DISTRICT' && targetValue) {
          where.district = { contains: targetValue.trim(), mode: 'insensitive' };
        } else if (targetType === 'CROP' && targetValue) {
          where.primaryCrop = { contains: targetValue.trim(), mode: 'insensitive' };
        }
        targetFarmers = await prisma.farmer.findMany({
          where,
          select: {
            id: true,
            devices: { select: { fcmToken: true } },
          },
        });
      }
    } else {
      const where: any = {};
      if (targetType === 'DISTRICT' && targetValue) {
        where.district = { contains: targetValue.trim(), mode: 'insensitive' };
      } else if (targetType === 'CROP' && targetValue) {
        where.primaryCrop = { contains: targetValue.trim(), mode: 'insensitive' };
      }

      targetFarmers = await prisma.farmer.findMany({
        where,
        select: {
          id: true,
          devices: { select: { fcmToken: true } },
        },
      });
    }

    if (targetFarmers.length === 0) {
      return {
        targetCount: 0,
        successCount: 0,
        message: 'No farmers matched the selected target criteria.',
      };
    }

    const notificationsToCreate = targetFarmers.map((f) => ({
      farmerId: f.id,
      title,
      body,
      type,
      deepLink: deepLink || null,
    }));

    const batchSize = 100;
    for (let i = 0; i < notificationsToCreate.length; i += batchSize) {
      await prisma.notification.createMany({
        data: notificationsToCreate.slice(i, i + batchSize),
      });
    }

    const tokens: string[] = [];
    for (const f of targetFarmers) {
      for (const d of f.devices) {
        if (d.fcmToken) tokens.push(d.fcmToken);
      }
    }

    let fcmSuccess = 0;
    let fcmFailure = 0;
    const messaging = getFirebaseMessaging();

    if (messaging && tokens.length > 0) {
      for (let i = 0; i < tokens.length; i += 500) {
        const tokenChunk = tokens.slice(i, i + 500);
        try {
          const res = await messaging.sendEachForMulticast({
            tokens: tokenChunk,
            notification: { title, body },
            data: { type, deepLink: deepLink || '', broadcast: 'true' },
          });
          fcmSuccess += res.successCount;
          fcmFailure += res.failureCount;
        } catch (err: any) {
          logger.warn({ err: err?.message }, 'Broadcast FCM chunk error');
        }
      }
    }

    try {
      const auditPayload = {
        userId: adminId || 'admin',
        userType: 'ADMIN',
        userName: 'Admin Staff',
        userEmail: adminEmail || 'admin@kissanmithar.in',
        action: 'LOGIN',
        ipAddress: ip || null,
        metadata: {
          actionType: 'ADMIN_BROADCAST_SENT',
          title,
          targetType,
          targetValue: targetValue || null,
          targetCount: targetFarmers.length,
          fcmTokensCount: tokens.length,
          fcmSuccess,
          fcmFailure,
        },
      };

      if (IdentityClient.isEnabled()) {
        await IdentityClient.createAuditLog(auditPayload);
      } else {
        await prisma.authAuditLog.create({
          data: {
            ...auditPayload,
            userType: 'ADMIN',
            action: 'LOGIN',
          },
        });
      }
    } catch {
      // Non-blocking audit record
    }

    return {
      targetCount: targetFarmers.length,
      deviceTokensCount: tokens.length,
      fcmSuccess,
      fcmFailure,
      message: `Broadcast queued successfully to ${targetFarmers.length} farmers (${tokens.length} devices).`,
    };
  }
}
