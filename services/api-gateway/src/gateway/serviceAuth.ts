import crypto from 'crypto';
import { env } from '../config/env.js';

export interface SignedServiceHeaders {
  'x-service-name': string;
  'x-service-timestamp': string;
  'x-service-signature': string;
}

/**
 * Generates HMAC-SHA256 signed headers for authenticated service-to-service calls.
 */
export const createServiceAuthHeaders = (
  serviceName: string,
  method: string,
  path: string
): SignedServiceHeaders => {
  const timestamp = String(Date.now());
  const payload = `${serviceName}:${timestamp}:${method.toUpperCase()}:${path}`;
  const signature = crypto
    .createHmac('sha256', env.INTERNAL_SERVICE_SECRET)
    .update(payload)
    .digest('hex');

  return {
    'x-service-name': serviceName,
    'x-service-timestamp': timestamp,
    'x-service-signature': signature,
  };
};
