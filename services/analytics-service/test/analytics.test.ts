import http from 'http';
import jwt from 'jsonwebtoken';
import { createApp } from '../src/app.js';
import { env } from '../src/config/env.js';

async function runAnalyticsServiceTests() {
  console.log('🧪 Starting Independent Analytics Service Test Suite...\n');

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
      headers: { 'x-request-id': 'req-analytics-001' },
    });
    const healthJson: any = await health.json();
    assert(health.status === 200, 'GET /health returns 200 OK');
    assert(
      healthJson.service === 'kissan-mithar-analytics-service',
      'Confirms analytics-service identity'
    );
    assert(health.headers.get('x-request-id') === 'req-analytics-001', 'Echoes x-request-id header');

    // 2. Service metrics endpoint
    const metrics = await fetch(`${baseUrl}/metrics`);
    const metricsJson: any = await metrics.json();
    assert(
      metrics.status === 200 && typeof metricsJson.requestsTotal === 'number',
      'GET /metrics returns runtime telemetry counters'
    );

    // 3. RBAC enforcement on /api/analytics/*
    const unauthSummary = await fetch(`${baseUrl}/api/analytics/summary`);
    assert(unauthSummary.status === 401, 'GET /api/analytics/summary requires auth (401)');

    const farmerToken = jwt.sign({ userId: 'farmer-1', role: 'FARMER' }, env.JWT_SECRET, {
      expiresIn: '1h',
    });
    const farmerForbidden = await fetch(`${baseUrl}/api/analytics/summary`, {
      headers: { Authorization: `Bearer ${farmerToken}` },
    });
    assert(
      farmerForbidden.status === 403,
      'GET /api/analytics/summary forbids FARMER role (403)'
    );

    const farmerExecForbidden = await fetch(`${baseUrl}/api/analytics/executive-summary`, {
      headers: { Authorization: `Bearer ${farmerToken}` },
    });
    assert(
      farmerExecForbidden.status === 403,
      'GET /api/analytics/executive-summary forbids FARMER role (403)'
    );

    // 4. 404 consistency
    const notFound = await fetch(`${baseUrl}/api/analytics/unknown`);
    assert(notFound.status === 404, 'Unknown analytics route returns 404');

    console.log(`\n📊 Analytics Service Test Summary: ${passed} PASSED, ${failed} FAILED`);
    if (failed > 0) process.exitCode = 1;
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
}

runAnalyticsServiceTests().catch((err) => {
  console.error('Fatal Analytics Service test error:', err);
  process.exit(1);
});
