import { apiClient } from './client.js';

export interface NotificationStats {
  devices: {
    total: number;
    android: number;
    ios: number;
    active30d: number;
  };
  notifications: {
    total: number;
    unread: number;
    read: number;
  };
  recentHistory: Array<{
    id: string;
    title: string;
    body: string;
    type: string;
    isRead: boolean;
    createdAt: string;
    farmer: {
      id: string;
      name: string;
      phoneNumber: string;
      village: string | null;
      district: string | null;
    };
  }>;
}

export interface BroadcastPayload {
  targetType: 'ALL' | 'DISTRICT' | 'CROP';
  targetValue?: string;
  title: string;
  body: string;
  type?: 'ALERT' | 'SUCCESS' | 'CONSULTATION' | 'MARKET' | 'INFO';
  deepLink?: string;
}

export class NotificationApi {
  static async getStats(): Promise<NotificationStats> {
    const response = await apiClient.get('/notifications/admin-stats');
    return response.data?.data;
  }

  static async sendBroadcast(payload: BroadcastPayload): Promise<{
    targetCount: number;
    deviceTokensCount: number;
    fcmSuccess: number;
    fcmFailure: number;
    message: string;
  }> {
    const response = await apiClient.post('/notifications/admin-broadcast', payload);
    return response.data?.data;
  }
}
