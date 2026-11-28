import crypto from 'crypto';
import { env } from '../config/env.js';

function signInternalHeaders(method: string, pathOnly: string): Record<string, string> {
  const ts = String(Date.now());
  const payload = `notification-service:${ts}:${method.toUpperCase()}:${pathOnly}`;
  const sig = crypto
    .createHmac('sha256', env.INTERNAL_SERVICE_SECRET)
    .update(payload)
    .digest('hex');

  return {
    'x-service-name': 'notification-service',
    'x-service-timestamp': ts,
    'x-service-signature': sig,
  };
}

export class IdentityClient {
  static isEnabled(): boolean {
    return Boolean(env.IDENTITY_SERVICE_URL);
  }

  static async getFarmerDevices(farmerId: string): Promise<Array<{ fcmToken: string }>> {
    const base = env.IDENTITY_SERVICE_URL.replace(/\/$/, '');
    const pathOnly = '/internal/devices';
    const res = await fetch(`${base}${pathOnly}?farmerId=${encodeURIComponent(farmerId)}`, {
      method: 'GET',
      headers: signInternalHeaders('GET', pathOnly),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) throw new Error(`Identity service /internal/devices responded ${res.status}`);
    const body: any = await res.json();
    return Array.isArray(body?.data) ? body.data : [];
  }

  static async getDeviceStats(): Promise<{
    total: number;
    android: number;
    ios: number;
    active30d: number;
  }> {
    const base = env.IDENTITY_SERVICE_URL.replace(/\/$/, '');
    const pathOnly = '/internal/devices/stats';
    const res = await fetch(`${base}${pathOnly}`, {
      method: 'GET',
      headers: signInternalHeaders('GET', pathOnly),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) throw new Error(`Identity service ${pathOnly} responded ${res.status}`);
    const body: any = await res.json();
    return body?.data || { total: 0, android: 0, ios: 0, active30d: 0 };
  }

  static async getBroadcastTargets(
    targetType: string,
    targetValue?: string
  ): Promise<Array<{ id: string; devices: Array<{ fcmToken: string }> }>> {
    const base = env.IDENTITY_SERVICE_URL.replace(/\/$/, '');
    const pathOnly = '/internal/devices/broadcast-targets';
    const qs = new URLSearchParams({ targetType });
    if (targetValue) qs.set('targetValue', targetValue);
    const res = await fetch(`${base}${pathOnly}?${qs.toString()}`, {
      method: 'GET',
      headers: signInternalHeaders('GET', pathOnly),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(`Identity service ${pathOnly} responded ${res.status}`);
    const body: any = await res.json();
    return Array.isArray(body?.data) ? body.data : [];
  }

  static async createAuditLog(entry: {
    userId: string;
    userType: string;
    userName?: string;
    userEmail?: string;
    action: string;
    ipAddress?: string | null;
    metadata?: Record<string, any>;
  }): Promise<void> {
    const base = env.IDENTITY_SERVICE_URL.replace(/\/$/, '');
    const pathOnly = '/internal/audit-logs';
    const res = await fetch(`${base}${pathOnly}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...signInternalHeaders('POST', pathOnly),
      },
      body: JSON.stringify(entry),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) throw new Error(`Identity service ${pathOnly} responded ${res.status}`);
  }
}
