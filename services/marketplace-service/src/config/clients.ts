import crypto from 'crypto';
import { env } from './env.js';
import { logger } from './logger.js';

const signHeaders = (method: string, pathOnly: string): Record<string, string> => {
  const ts = String(Date.now());
  const payload = `marketplace-service:${ts}:${method.toUpperCase()}:${pathOnly}`;
  const sig = crypto
    .createHmac('sha256', env.INTERNAL_SERVICE_SECRET)
    .update(payload)
    .digest('hex');

  return {
    'x-service-name': 'marketplace-service',
    'x-service-timestamp': ts,
    'x-service-signature': sig,
  };
};

async function postInternal(
  baseUrl: string,
  routePath: string,
  body: unknown,
  timeoutMs = 3500
): Promise<any> {
  if (!baseUrl) return null;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${baseUrl.replace(/\/+$/, '')}${routePath}`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        accept: 'application/json',
        ...signHeaders('POST', routePath.split('?')[0]),
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    return await res.json().catch(() => null);
  } catch (err: any) {
    clearTimeout(timer);
    logger.warn({ err: err?.message, routePath }, 'Marketplace downstream internal call failed');
    return null;
  }
}

export const NotificationClient = {
  async sendNotification(params: {
    farmerId: string;
    title: string;
    body: string;
    type?: string;
    deepLink?: string;
    data?: Record<string, string>;
  }): Promise<void> {
    await postInternal(env.NOTIFICATION_SERVICE_URL, '/internal/notifications/send', params);
  },
};

export const RealtimeClient = {
  async emit(event: string, data: any, room?: string): Promise<void> {
    await postInternal(env.GATEWAY_URL, '/internal/realtime/emit', { event, data, room }, 2500);
  },
};
