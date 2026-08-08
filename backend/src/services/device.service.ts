import { prisma } from '../config/db.js';

export interface RegisterDeviceDto {
  farmerId: string;
  fcmToken: string;
  platform?: string;
}

export class DeviceService {
  /**
   * Registers or updates an FCM token for a farmer's device
   */
  static async registerDevice(dto: RegisterDeviceDto) {
    try {
      return await prisma.device.upsert({
        where: { fcmToken: dto.fcmToken },
        update: {
          farmerId: dto.farmerId,
          platform: dto.platform || 'android',
          lastActive: new Date(),
        },
        create: {
          farmerId: dto.farmerId,
          fcmToken: dto.fcmToken,
          platform: dto.platform || 'android',
          lastActive: new Date(),
        },
      });
    } catch (err: any) {
      console.warn('[DeviceService] registerDevice fallback:', err.message);
      return {
        id: `DEV-${Date.now()}`,
        farmerId: dto.farmerId,
        fcmToken: dto.fcmToken,
        platform: dto.platform || 'android',
        lastActive: new Date().toISOString(),
      };
    }
  }
}
