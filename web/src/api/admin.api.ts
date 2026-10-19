import { apiClient } from './client.js';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  mobileNumber: string | null;
  photoUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SystemHealthData {
  status: 'operational' | 'degraded';
  timestamp: string;
  database: {
    status: string;
    latencyMs: number;
    provider: string;
  };
  process: {
    uptime: string;
    uptimeSeconds: number;
    nodeVersion: string;
    platform: string;
    architecture: string;
    environment: string;
  };
  memory: {
    rssMb: number;
    heapTotalMb: number;
    heapUsedMb: number;
    externalMb: number;
  };
  integrations: {
    firebaseAdmin: string;
    smsProvider: string;
    cloudinary: string;
    weatherApi: string;
  };
  security: {
    recent24hAuditEvents: number;
  };
}

export interface AuditLogItem {
  id: string;
  userId: string;
  userType: string;
  userName: string | null;
  userEmail: string | null;
  action: string;
  ipAddress: string | null;
  userAgent: string | null;
  metadata: any;
  timestamp: string;
}

export class AdminApi {
  static async listUsers(): Promise<AdminUser[]> {
    const response = await apiClient.get('/admin/users');
    return response.data?.data || [];
  }

  static async createUser(data: {
    name: string;
    email: string;
    password: string;
    mobileNumber?: string;
  }): Promise<AdminUser> {
    const response = await apiClient.post('/admin/users', data);
    return response.data?.data;
  }

  static async updateUser(id: string, data: Partial<AdminUser> & { password?: string }): Promise<AdminUser> {
    const response = await apiClient.patch(`/admin/users/${id}`, data);
    return response.data?.data;
  }

  static async deleteUser(id: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete(`/admin/users/${id}`);
    return response.data;
  }

  static async getSystemHealth(): Promise<SystemHealthData> {
    const response = await apiClient.get('/admin/system-health');
    return response.data?.data;
  }

  static async getAuditLogs(limit = 100): Promise<AuditLogItem[]> {
    const response = await apiClient.get(`/auth/audit-logs?limit=${limit}`);
    return response.data?.data || [];
  }
}
