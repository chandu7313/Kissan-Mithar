import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
import { createServiceAuthHeaders } from './serviceAuth.js';

export interface ServiceRequestOptions {
  method?: 'GET' | 'HEAD' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS';
  path: string;
  body?: unknown;
  headers?: Record<string, string>;
  requestId?: string;
  idempotencyKey?: string;
  timeoutMs?: number;
  retries?: number;
}

export class ServiceHttpError extends Error {
  statusCode: number;
  responseBody?: any;

  constructor(message: string, statusCode: number, responseBody?: any) {
    super(message);
    this.statusCode = statusCode;
    this.responseBody = responseBody;
  }
}

const isTransientStatus = (status: number) => status === 502 || status === 503 || status === 504;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Reusable HTTP client for Gateway -> Microservice and Service -> Service calls.
 * Adds HMAC service auth, x-request-id tracing, bounded timeouts, and safe retries.
 */
export class ServiceHttpClient {
  constructor(
    private readonly targetServiceName: string,
    private readonly baseUrlResolver: () => string,
    private readonly callerName = 'api-gateway'
  ) {}

  isConfigured(): boolean {
    return Boolean(this.baseUrlResolver()?.trim());
  }

  async request<T = any>(options: ServiceRequestOptions): Promise<{ status: number; data: T; headers: Headers }> {
    const baseUrl = this.baseUrlResolver()?.replace(/\/+$/, '');
    if (!baseUrl) {
      throw new ServiceHttpError(`Service URL for ${this.targetServiceName} is not configured`, 503);
    }

    const method = (options.method || 'GET').toUpperCase() as NonNullable<ServiceRequestOptions['method']>;
    const normalizedPath = options.path.startsWith('/') ? options.path : `/${options.path}`;
    const url = `${baseUrl}${normalizedPath}`;
    const timeoutMs = options.timeoutMs ?? env.SERVICE_TIMEOUT_MS;

    // Only retry safe/idempotent methods or requests carrying an Idempotency-Key
    const canRetry =
      method === 'GET' || method === 'HEAD' || method === 'OPTIONS' || Boolean(options.idempotencyKey);
    const maxAttempts = canRetry ? (options.retries ?? 2) + 1 : 1;

    let lastError: any;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const authHeaders = createServiceAuthHeaders(this.callerName, method, normalizedPath.split('?')[0]);
        const headers: Record<string, string> = {
          Accept: 'application/json',
        };
        if (options.headers) {
          for (const [k, v] of Object.entries(options.headers)) {
            if (v !== undefined) {
              headers[k.toLowerCase()] = v;
            }
          }
        }
        Object.assign(headers, authHeaders);

        if (options.requestId) {
          headers['x-request-id'] = options.requestId;
        }
        if (options.idempotencyKey) {
          headers['idempotency-key'] = options.idempotencyKey;
        }

        let bodyPayload: string | undefined;
        if (options.body !== undefined && method !== 'GET' && method !== 'HEAD' && method !== 'OPTIONS') {
          headers['content-type'] = 'application/json';
          bodyPayload = typeof options.body === 'string' ? options.body : JSON.stringify(options.body);
        }

        const response = await fetch(url, {
          method,
          headers,
          body: bodyPayload,
          signal: controller.signal,
        });
        clearTimeout(timer);

        const contentType = response.headers.get('content-type') || '';
        const parsedData = contentType.includes('application/json')
          ? await response.json().catch(() => null)
          : await response.text().catch(() => null);

        if (isTransientStatus(response.status) && attempt < maxAttempts) {
          await sleep(attempt * 150);
          continue;
        }

        return {
          status: response.status,
          data: parsedData as T,
          headers: response.headers,
        };
      } catch (err: any) {
        clearTimeout(timer);
        lastError = err;

        logger.warn(
          {
            targetService: this.targetServiceName,
            method,
            url,
            attempt,
            requestId: options.requestId,
            err: err?.message,
          },
          'Downstream service request failed'
        );

        if (attempt < maxAttempts) {
          await sleep(attempt * 150);
          continue;
        }
      }
    }

    const isTimeout = lastError?.name === 'AbortError';
    throw new ServiceHttpError(
      isTimeout
        ? `Upstream service '${this.targetServiceName}' timed out after ${timeoutMs}ms`
        : `Upstream service '${this.targetServiceName}' unavailable`,
      isTimeout ? 504 : 502
    );
  }
}
