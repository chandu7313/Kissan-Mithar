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
}
