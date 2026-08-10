import { apiClient } from './client.js';
import { UserSession, UserRole } from '../types/index.js';

export interface AuthAuditRecord {
  id: string;
  userId: string;
  userType: UserRole;
  userName?: string;
  userEmail?: string;
  action: 'LOGIN' | 'LOGOUT' | 'TOKEN_REFRESH' | 'PASSWORD_RESET';
  ipAddress?: string;
  userAgent?: string;
  metadata?: any;
  timestamp: string;
}

export class AuthApi {
  /**
   * Logs in using Email + Password
   */
  static async loginWithPassword(params: {
    email: string;
    password: string;
    role?: UserRole;
  }): Promise<{ token: string; user: any }> {
    const response = await apiClient.post('/auth/login-password', {
      email: params.email,
      password: params.password,
      role: params.role,
    });
    return response.data.data;
  }

  /**
   * Sends 6-digit OTP code to the provided email
   */
  static async sendEmailOtp(params: {
    email: string;
    purpose?: 'LOGIN' | 'RESET_PASSWORD';
    role?: UserRole;
  }): Promise<{ success: boolean; message: string; devOtp?: string }> {
    const response = await apiClient.post('/auth/send-email-otp', {
      email: params.email,
      purpose: params.purpose || 'LOGIN',
      role: params.role,
    });
    return response.data.data;
  }

  /**
   * Verifies 6-digit Email OTP and signs in
   */
  static async loginWithEmailOtp(params: {
    email: string;
    otp: string;
    role?: UserRole;
  }): Promise<{ token: string; user: any }> {
    const response = await apiClient.post('/auth/verify-email-otp', {
      email: params.email,
      otp: params.otp,
      role: params.role,
    });
    return response.data.data;
  }

  /**
   * Resets password using 6-digit Email OTP
   */
  static async resetPassword(params: {
    email: string;
    otp: string;
    newPassword: string;
  }): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post('/auth/reset-password', params);
    return response.data.data;
  }

  /**
   * Logs out from backend and records LOGOUT event in database
   */
  static async logout(session: UserSession): Promise<void> {
    try {
      await apiClient.post('/auth/logout', {
        userId: session.userId,
        role: session.role,
        userName: session.name,
        userEmail: session.email || (session.role === 'ADMIN' ? 'admin@gmail.com' : 'sunil.rao@gmail.com'),
      });
    } catch (err) {
      console.warn('[AuthApi] Logout record failed:', err);
    }
  }

  /**
   * Retrieves recent login/logout audit history
   */
  static async getAuditLogs(userId?: string): Promise<AuthAuditRecord[]> {
    const response = await apiClient.get('/auth/audit-logs', {
      params: { userId, limit: 15 },
    });
    return response.data?.data || [];
  }

  /**
   * Gets Cloudinary signature and uploads the file directly
   */
  static async uploadProfilePicture(file: File): Promise<string> {
    // 1. Get signature from our backend
    const signRes = await apiClient.post('/uploads/sign', { folder: 'kissan_mithar_profiles' });
    const { signature, timestamp, apiKey, cloudName, folder } = signRes.data.data;

    // 2. Upload directly to Cloudinary
    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', apiKey);
    formData.append('timestamp', timestamp.toString());
    formData.append('signature', signature);
    formData.append('folder', folder);

    const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!uploadRes.ok) {
      throw new Error('Failed to upload image to Cloudinary');
    }

    const data = await uploadRes.json();
    return data.secure_url;
  }

  /**
   * Updates the user's profile with the new photoUrl
   */
  static async updateProfile(photoUrl: string): Promise<any> {
    const response = await apiClient.patch('/auth/profile', { photoUrl });
    return response.data.data;
  }
}
