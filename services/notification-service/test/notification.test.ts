import crypto from 'crypto';
import http from 'http';
import jwt from 'jsonwebtoken';
import { createApp } from '../src/app.js';
import { env } from '../src/config/env.js';

async function runNotificationTests() {
  console.log('🧪 Starting Independent Notification Service Test Suite...\n');

  const app = createApp();
  const server = http.createServer(app);

  await new Promise<void>((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve());
  });

  const addr = server.address() as any;
  const baseUrl = `http://127.0.0.1:${addr.port}`;

  let passed = 0;
  let failed = 0;

  const assert = (cond: boolean, name: string, detail?: any) => {
    if (cond) {
      console.log(`✅ PASS: ${name}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${name}`, detail || '');
      failed++;
    }
  };

  try {
    // 1. Health check
    const healthRes = await fetch(`${baseUrl}/health`);
    const healthJson: any = await healthRes.json();
    assert(healthRes.status === 200, 'GET /health returns 200 OK');
    assert(
      healthJson.service === 'kissan-mithar-notification-service',
      'Identifies kissan-mithar-notification-service'
    );
    assert(Boolean(healthRes.headers.get('x-request-id')), 'Echoes x-request-id header');

    // 2. Auth protection on farmer inbox
    const unauthRes = await fetch(`${baseUrl}/api/notifications`);
    assert(unauthRes.status === 401, 'GET /api/notifications without auth returns 401');

    // 3. RBAC enforcement on admin-stats for non-admin token
    const farmerToken = jwt.sign({ userId: 'farmer-1', role: 'FARMER' }, env.JWT_SECRET, {
      expiresIn: '1h',
    });
    const rbacRes = await fetch(`${baseUrl}/api/notifications/admin-stats`, {
      headers: { Authorization: `Bearer ${farmerToken}` },
    });
    assert(rbacRes.status === 403, 'GET /api/notifications/admin-stats rejects FARMER with 403');

    // 4. Broadcast schema validation for ADMIN token
    const adminToken = jwt.sign({ userId: 'admin-1', role: 'ADMIN' }, env.JWT_SECRET, {
      expiresIn: '1h',
    });
    const invalidBroadcast = await fetch(`${baseUrl}/api/notifications/admin-broadcast`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ targetType: 'ALL', title: 'A', body: 'hi' }),
    });
    assert(
      invalidBroadcast.status === 400,
      'POST /api/notifications/admin-broadcast rejects malformed payload with 400'
    );

    // 5. Internal endpoint rejects unsigned calls
    const unsignedInternal = await fetch(`${baseUrl}/internal/notifications/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ farmerId: 'f1', title: 'Test', body: 'Hello' }),
    });
    assert(
      unsignedInternal.status === 403,
      'POST /internal/notifications/send rejects unsigned internal calls with 403'
    );

    // 6. Internal endpoint validates payload after passing HMAC signature verification
    const ts = String(Date.now());
    const sigPayload = `field-service:${ts}:POST:/internal/notifications/send`;
    const sig = crypto
      .createHmac('sha256', env.INTERNAL_SERVICE_SECRET)
      .update(sigPayload)
      .digest('hex');

    const signedBadPayload = await fetch(`${baseUrl}/internal/notifications/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-service-name': 'field-service',
        'x-service-timestamp': ts,
        'x-service-signature': sig,
      },
      body: JSON.stringify({ farmerId: '' }),
    });
    assert(
      signedBadPayload.status === 400,
      'POST /internal/notifications/send accepts valid HMAC signature and validates DTO (400)'
    );
  } finally {
    server.close();
  }

  console.log(`\n📊 NOTIFICATION SERVICE TESTS: ${passed} PASSED, ${failed} FAILED`);
  if (failed > 0) process.exit(1);
}

runNotificationTests();
