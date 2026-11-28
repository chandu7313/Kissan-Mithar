import crypto from 'crypto';
import http from 'http';
import jwt from 'jsonwebtoken';
import { createApp } from '../src/app.js';
import { env } from '../src/config/env.js';

async function runFieldServiceTests() {
  console.log('🧪 Starting Independent Field Service Test Suite...\n');

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
    const health = await fetch(`${baseUrl}/health`);
    const healthJson: any = await health.json();
    assert(health.status === 200, 'GET /health returns 200 OK');
    assert(healthJson.service === 'kissan-mithar-field-service', 'Confirms field-service identity');
    assert(Boolean(health.headers.get('x-request-id')), 'Echoes x-request-id header');

    // 2. Labour catalog (public)
    const cat = await fetch(`${baseUrl}/api/labour-requests/catalog`);
    const catJson: any = await cat.json();
    assert(cat.status === 200 && Array.isArray(catJson.data), 'GET /api/labour-requests/catalog returns wage guidelines');

    // 3. Labour Zod enum rejection
    const badLabour = await fetch(`${baseUrl}/api/labour-requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskType: 'INVALID_TASK_ENUM' }),
    });
    assert(badLabour.status === 400, 'POST /api/labour-requests rejects invalid taskType enum (400)');

    // 4. Auth guards for consultations & experts & admin collaborations
    const unauthConsult = await fetch(`${baseUrl}/api/consultations`);
    assert(unauthConsult.status === 401, 'GET /api/consultations without auth returns 401');

    const farmerToken = jwt.sign({ userId: 'f1', role: 'FARMER' }, env.JWT_SECRET, { expiresIn: '1h' });
    const farmerExperts = await fetch(`${baseUrl}/api/experts`, {
      headers: { Authorization: `Bearer ${farmerToken}` },
    });
    assert(farmerExperts.status === 403, 'GET /api/experts forbids FARMER role (403)');

    // 5. Collaboration validation
    const badCollab = await fetch(`${baseUrl}/api/collaborations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ companyName: '' }),
    });
    assert(badCollab.status === 400, 'POST /api/collaborations rejects empty payload (400)');

    // 6. Internal machinery endpoint enforces HMAC auth
    const unsignedMach = await fetch(`${baseUrl}/internal/machinery/availability?machineryType=Tractor`);
    assert(unsignedMach.status === 403, 'GET /internal/machinery/availability rejects unsigned request (403)');

    const ts = String(Date.now());
    const sig = crypto
      .createHmac('sha256', env.INTERNAL_SERVICE_SECRET)
      .update(`ai-service:${ts}:GET:/internal/machinery/availability`)
      .digest('hex');

    const signedMach = await fetch(`${baseUrl}/internal/machinery/availability?machineryType=Tractor`, {
      headers: {
        'x-service-name': 'ai-service',
        'x-service-timestamp': ts,
        'x-service-signature': sig,
      },
    });
    const machJson: any = await signedMach.json();
    assert(signedMach.status === 200 && machJson.data?.machineryType === 'Tractor', 'Signed internal machinery lookup returns 200');
  } finally {
    server.close();
  }

  console.log(`\n📊 FIELD SERVICE TESTS: ${passed} PASSED, ${failed} FAILED`);
  if (failed > 0) process.exit(1);
}

runFieldServiceTests();
