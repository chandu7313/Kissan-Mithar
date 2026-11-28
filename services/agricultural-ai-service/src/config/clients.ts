import crypto from 'crypto';
import { env } from './env.js';
import { logger } from './logger.js';

const signHeaders = (method: string, pathOnly: string): Record<string, string> => {
  const ts = String(Date.now());
  const payload = `agricultural-ai-service:${ts}:${method.toUpperCase()}:${pathOnly}`;
  const sig = crypto
    .createHmac('sha256', env.INTERNAL_SERVICE_SECRET)
    .update(payload)
    .digest('hex');

  return {
    'x-service-name': 'agricultural-ai-service',
    'x-service-timestamp': ts,
    'x-service-signature': sig,
  };
};

async function callInternal(
  baseUrl: string,
  method: 'GET' | 'POST',
  routePathWithQuery: string,
  body?: unknown,
  timeoutMs = 4000
): Promise<any> {
  if (!baseUrl) return null;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const pathOnly = routePathWithQuery.split('?')[0];

  try {
    const res = await fetch(`${baseUrl.replace(/\/+$/, '')}${routePathWithQuery}`, {
      method,
      headers: {
        accept: 'application/json',
        ...(body !== undefined ? { 'content-type': 'application/json' } : {}),
        ...signHeaders(method, pathOnly),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    return await res.json().catch(() => null);
  } catch (err: any) {
    clearTimeout(timer);
    logger.warn({ err: err?.message, routePathWithQuery }, 'AI Service peer call failed');
    return null;
  }
}

export const MediaClient = {
  async saveAudio(audioData: string): Promise<{ url: string } | null> {
    const res = await callInternal(env.MEDIA_SERVICE_URL, 'POST', '/internal/audio', { audioData }, 10000);
    return res?.data?.url ? { url: res.data.url } : null;
  },
};

export const NotificationClient = {
  async sendNotification(params: {
    farmerId: string;
    title: string;
    body: string;
    type?: string;
    deepLink?: string;
    data?: Record<string, string>;
  }): Promise<void> {
    await callInternal(env.NOTIFICATION_SERVICE_URL, 'POST', '/internal/notifications/send', params);
  },
};

export const RealtimeClient = {
  async emit(event: string, data: any, room?: string): Promise<void> {
    await callInternal(env.GATEWAY_URL, 'POST', '/internal/realtime/emit', { event, data, room }, 2500);
  },
};

export const MarketplaceClient = {
  async searchProducts(query: string, category?: string): Promise<any[] | null> {
    if (!env.MARKETPLACE_SERVICE_URL) return null;
    const qs = new URLSearchParams({ query, limit: '4' });
    if (category) qs.set('category', category);
    const res = await callInternal(
      env.MARKETPLACE_SERVICE_URL,
      'GET',
      `${env.API_PREFIX}/commerce/products?${qs.toString()}`,
      undefined,
      4000
    );
    return Array.isArray(res?.data) ? res.data : null;
  },

  async getMandiPrices(commodity: string, state?: string): Promise<any[] | null> {
    if (!env.MARKETPLACE_SERVICE_URL) return null;
    const qs = new URLSearchParams({ commodity, limit: '3' });
    if (state) qs.set('state', state);
    const res = await callInternal(
      env.MARKETPLACE_SERVICE_URL,
      'GET',
      `${env.API_PREFIX}/mandi-prices?${qs.toString()}`,
      undefined,
      4000
    );
    return Array.isArray(res?.data) ? res.data : null;
  },
};

export const FieldClient = {
  async checkMachinery(machineryType: string, village?: string): Promise<any | null> {
    if (!env.FIELD_SERVICE_URL) return null;
    const qs = new URLSearchParams({ machineryType });
    if (village) qs.set('village', village);
    const res = await callInternal(
      env.FIELD_SERVICE_URL,
      'GET',
      `/internal/machinery/availability?${qs.toString()}`,
      undefined,
      3000
    );
    return res?.data || null;
  },
};
