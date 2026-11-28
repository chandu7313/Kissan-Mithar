import crypto from 'crypto';
import http from 'http';
import jwt from 'jsonwebtoken';
import { createApp } from '../src/app.js';
import { env } from '../src/config/env.js';

async function runMediaTests() {
  console.log('🧪 Starting Independent Media Service Test Suite...\n');

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
    // 1. Health endpoint
    const healthRes = await fetch(`${baseUrl}/health`);
    const healthJson: any = await healthRes.json();
    assert(healthRes.status === 200, 'GET /health returns 200 OK');
    assert(healthJson.service === 'kissan-mithar-media-service', 'Identifies kissan-mithar-media-service');
    assert(Boolean(healthRes.headers.get('x-request-id')), 'Echoes x-request-id tracing header');

    // 2. Unauthenticated upload/sign blocked
    const unauthRes = await fetch(`${baseUrl}/api/uploads/sign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ folder: 'test' }),
    });
    assert(unauthRes.status === 401, 'POST /api/uploads/sign without auth returns 401');

    // 3. Authenticated upload/sign with JWT succeeds
    const token = jwt.sign({ userId: 'farmer-1', role: 'FARMER' }, env.JWT_SECRET, { expiresIn: '1h' });
    const signRes = await fetch(`${baseUrl}/api/uploads/sign`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ folder: 'orchard_photos' }),
    });
    const signJson: any = await signRes.json();
    assert(signRes.status === 200, 'POST /api/uploads/sign with valid JWT returns 200');
    assert(Boolean(signJson.data?.signature && signJson.data?.timestamp), 'Returns Cloudinary signature payload');

    // 4. Audio upload URL passthrough
    const audioRes = await fetch(`${baseUrl}/api/uploads/audio`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ audioData: 'https://cdn.example.com/voice.m4a', filename: 'voice.m4a' }),
    });
    const audioJson: any = await audioRes.json();
    assert(audioRes.status === 200 && audioJson.data?.url === 'https://cdn.example.com/voice.m4a', 'Audio upload preserves HTTPS URL');

    // 5. Internal endpoint rejects unsigned calls
    const unsignedInternal = await fetch(`${baseUrl}/internal/audio`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ audioData: 'https://cdn.example.com/v.m4a' }),
    });
    assert(unsignedInternal.status === 403, 'POST /internal/audio rejects unsigned internal calls with 403');

    // 6. Internal endpoint accepts HMAC-signed call
    const ts = String(Date.now());
    const sigPayload = `agronomy-service:${ts}:POST:/internal/audio`;
    const sig = crypto.createHmac('sha256', env.INTERNAL_SERVICE_SECRET).update(sigPayload).digest('hex');
    const signedInternal = await fetch(`${baseUrl}/internal/audio`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-service-name': 'agronomy-service',
        'x-service-timestamp': ts,
        'x-service-signature': sig,
      },
      body: JSON.stringify({ audioData: 'https://cdn.example.com/internal.m4a' }),
    });
    assert(signedInternal.status === 200, 'POST /internal/audio accepts valid HMAC service signature');
  } finally {
    server.close();
  }

  console.log(`\n📊 MEDIA SERVICE TESTS: ${passed} PASSED, ${failed} FAILED`);
  if (failed > 0) process.exit(1);
}

runMediaTests();
