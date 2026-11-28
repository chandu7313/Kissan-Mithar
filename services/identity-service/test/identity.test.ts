import crypto from 'crypto';
import http from 'http';
import jwt from 'jsonwebtoken';
import { createApp } from '../src/app.js';
import { env } from '../src/config/env.js';

async function runIdentityServiceTests() {
  console.log('🧪 Starting Independent Identity Service Test Suite...\n');

  const app = createApp();
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', () => resolve()));
  const baseUrl = `http://127.0.0.1:${(server.address() as any).port}`;

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
    // 1. Health & request tracing
    const health = await fetch(`${baseUrl}/health`, {
      headers: { 'x-request-id': 'req-identity-001' },
    });
    const healthJson: any = await health.json();
    assert(health.status === 200, 'GET /health returns 200 OK');
    assert(
      healthJson.service === 'kissan-mithar-identity-service',
      'Confirms identity-service identity'
    );
    assert(health.headers.get('x-request-id') === 'req-identity-001', 'Echoes x-request-id header');

    // 2. Public auth route validation
    const badOtp = await fetch(`${baseUrl}/api/auth/send-phone-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber: '123' }),
    });
    assert(badOtp.status === 400, 'POST /api/auth/send-phone-otp rejects short phone (400)');

    const badPassLogin = await fetch(`${baseUrl}/api/auth/login-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'not-an-email', password: '' }),
    });
    assert(badPassLogin.status === 400, 'POST /api/auth/login-password rejects invalid payload (400)');

    // 3. Protected routes enforce auth & RBAC
    const unauthAudit = await fetch(`${baseUrl}/api/auth/audit-logs`);
    assert(unauthAudit.status === 401, 'GET /api/auth/audit-logs without auth returns 401');

    const unauthFarmers = await fetch(`${baseUrl}/api/farmers/me`);
    assert(unauthFarmers.status === 401, 'GET /api/farmers/me without auth returns 401');

    const farmerToken = jwt.sign({ userId: 'farmer-1', role: 'FARMER' }, env.JWT_SECRET, {
      expiresIn: '1h',
    });
    const farmerListForbidden = await fetch(`${baseUrl}/api/farmers`, {
      headers: { Authorization: `Bearer ${farmerToken}` },
    });
    assert(farmerListForbidden.status === 403, 'GET /api/farmers forbids FARMER role (403)');

    // 4. Device endpoint validation
    const badDevice = await fetch(`${baseUrl}/api/devices`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${farmerToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fcmToken: 'short' }),
    });
    assert(badDevice.status === 400, 'POST /api/devices rejects short fcmToken (400)');

    // 5. Internal endpoints enforce HMAC service signature
    const unsignedDevices = await fetch(`${baseUrl}/internal/devices?farmerId=f1`);
    assert(unsignedDevices.status === 403, 'GET /internal/devices rejects unsigned request (403)');

    const ts = String(Date.now());
    const sig = crypto
      .createHmac('sha256', env.INTERNAL_SERVICE_SECRET)
      .update(`notification-service:${ts}:GET:/internal/devices`)
      .digest('hex');

    const missingParam = await fetch(`${baseUrl}/internal/devices`, {
      headers: {
        'x-service-name': 'notification-service',
        'x-service-timestamp': ts,
        'x-service-signature': sig,
      },
    });
    assert(
      missingParam.status === 400,
      'GET /internal/devices accepts HMAC signature and validates farmerId (400)'
    );

    const tsAudit = String(Date.now());
    const sigAudit = crypto
      .createHmac('sha256', env.INTERNAL_SERVICE_SECRET)
      .update(`notification-service:${tsAudit}:POST:/internal/audit-logs`)
      .digest('hex');

    const badAudit = await fetch(`${baseUrl}/internal/audit-logs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-service-name': 'notification-service',
        'x-service-timestamp': tsAudit,
        'x-service-signature': sigAudit,
      },
      body: JSON.stringify({ action: 'TEST' }),
    });
    assert(
      badAudit.status === 400,
      'POST /internal/audit-logs accepts HMAC signature and validates fields (400)'
    );

    // 6. 404 consistency
    const notFound = await fetch(`${baseUrl}/api/non-existent`);
    assert(notFound.status === 404, 'Unknown route returns 404');

    console.log(`\n📊 Identity Service Test Summary: ${passed} PASSED, ${failed} FAILED`);
    if (failed > 0) process.exitCode = 1;
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
}

runIdentityServiceTests().catch((err) => {
  console.error('Fatal Identity Service test error:', err);
  process.exit(1);
});
