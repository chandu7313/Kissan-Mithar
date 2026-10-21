import { prisma } from '../config/db.js';
import { getFirebaseMessaging } from '../config/firebase.js';
import { NotificationType } from '@prisma/client';

export interface SendNotificationParams {
  farmerId: string;
  title: string;
  body: string;
  type?: NotificationType;
  deepLink?: string;
  data?: Record<string, string>;
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

export class NotificationService {
  /**
   * Dispatches push notification via FCM and stores it in the Notification table
   */
  static async sendNotification(params: SendNotificationParams) {
    const { farmerId, title, body, type = 'INFO', deepLink, data = {} } = params;

    // 1. Store in Database
    const savedNotification = await prisma.notification.create({
      data: {
        farmerId,
        title,
        body,
        type,
        deepLink,
      },
    });

    // 2. Fetch registered FCM tokens for farmer
    const devices = await prisma.device.findMany({
      where: { farmerId },
      select: { fcmToken: true },
    });

    // 3. Dispatch via FCM
    const messaging = getFirebaseMessaging();
    if (messaging && devices.length > 0) {
      const tokens = devices.map((d) => d.fcmToken).filter(Boolean);
      if (tokens.length > 0) {
        try {
          const response = await messaging.sendEachForMulticast({
            tokens,
            notification: {
              title,
              body,
            },
            data: {
              ...data,
              type,
              deepLink: deepLink || '',
              notificationId: savedNotification.id,
            },
          });
          console.log(`[NotificationService] FCM sent: ${response.successCount} success, ${response.failureCount} failure`);
        } catch (fcmError) {
          console.warn('[NotificationService] FCM delivery error:', fcmError);
        }
      }
    } else {
      console.log(`[NotificationService] Push notification recorded for Farmer ${farmerId}: "${title}"`);
    }

    return savedNotification;
  }

  /**
   * Retrieves notification list for a farmer
   */
  static async getFarmerNotifications(farmerId: string, limit = 20) {
    return await prisma.notification.findMany({
      where: { farmerId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Marks a single notification as read
   */
  static async markAsRead(notificationId: string, farmerId: string) {
    return await prisma.notification.updateMany({
      where: { id: notificationId, farmerId },
      data: { isRead: true },
    });
  }

  /**
   * Marks all notifications as read for a farmer
   */
  static async markAllAsRead(farmerId: string) {
    return await prisma.notification.updateMany({
      where: { farmerId, isRead: false },
      data: { isRead: true },
    });
  }

  /**
   * Get unread notification count for a farmer
   */
  static async getUnreadCount(farmerId: string) {
    return await prisma.notification.count({
      where: { farmerId, isRead: false },
    });
  }

  /**
   * Admin: Overview of mobile devices and notification delivery telemetry
   */
  static async getAdminNotificationStats() {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [
      devicePlatformStats,
      activeDevices30d,
      notificationReadStats,
      recentHistory,
    ] = await Promise.all([
      prisma.device.groupBy({
        by: ['platform'],
        _count: { _all: true },
      }),
      prisma.device.count({ where: { lastActive: { gte: thirtyDaysAgo } } }),
      prisma.notification.groupBy({
        by: ['isRead'],
        _count: { _all: true },
      }),
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

    let totalDevices = 0;
    let androidDevices = 0;
    let iosDevices = 0;
    for (const d of devicePlatformStats) {
      const count = d._count._all;
      totalDevices += count;
      const plat = (d.platform || '').toLowerCase();
      if (plat === 'android') androidDevices += count;
      else if (plat === 'ios') iosDevices += count;
    }

    let totalNotifications = 0;
    let unreadNotifications = 0;
    for (const n of notificationReadStats) {
      const count = n._count._all;
      totalNotifications += count;
      if (!n.isRead) unreadNotifications += count;
    }

    return {
      devices: {
        total: totalDevices,
        android: androidDevices,
        ios: iosDevices,
        active30d: activeDevices30d,
      },
      notifications: {
        total: totalNotifications,
        unread: unreadNotifications,
        read: Math.max(0, totalNotifications - unreadNotifications),
      },
      recentHistory,
    };
  }

  /**
   * Admin: Safe Broadcast Announcement to targeted farmers
   */
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

    const where: any = {};
    if (targetType === 'DISTRICT' && targetValue) {
      where.district = { contains: targetValue.trim(), mode: 'insensitive' };
    } else if (targetType === 'CROP' && targetValue) {
      where.primaryCrop = { contains: targetValue.trim(), mode: 'insensitive' };
    }

    const targetFarmers = await prisma.farmer.findMany({
      where,
      select: {
        id: true,
        devices: { select: { fcmToken: true } },
      },
    });

    if (targetFarmers.length === 0) {
      return {
        targetCount: 0,
        successCount: 0,
        message: 'No farmers matched the selected target criteria.',
      };
    }

    // Create database records in batches of 100
    const notificationsToCreate = targetFarmers.map((f) => ({
      farmerId: f.id,
      title,
      body,
      type,
      deepLink: deepLink || null,
    }));

    // Sequential batch insertion
    const batchSize = 100;
    for (let i = 0; i < notificationsToCreate.length; i += batchSize) {
      const batch = notificationsToCreate.slice(i, i + batchSize);
      await prisma.notification.createMany({ data: batch });
    }

    // Extract all FCM tokens
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
      // Chunk tokens into 500 (FCM multicast limit)
      for (let i = 0; i < tokens.length; i += 500) {
        const tokenChunk = tokens.slice(i, i + 500);
        try {
          const res = await messaging.sendEachForMulticast({
            tokens: tokenChunk,
            notification: { title, body },
            data: {
              type,
              deepLink: deepLink || '',
              broadcast: 'true',
            },
          });
          fcmSuccess += res.successCount;
          fcmFailure += res.failureCount;
        } catch (err) {
          console.warn('[NotificationService] Broadcast chunk error:', err);
        }
      }
    }

    // Audit broadcast in security log
    try {
      await prisma.authAuditLog.create({
        data: {
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
        },
      });
    } catch {
      // Non-blocking
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
