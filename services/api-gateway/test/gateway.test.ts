import crypto from 'crypto';
import http from 'http';
import jwt from 'jsonwebtoken';
import { createApp as createGatewayApp } from '../src/app.js';
import { env } from '../src/config/env.js';

// @ts-ignore
import { createApp as createMediaApp } from '../../media-service/src/app.js';
// @ts-ignore
import { createApp as createNotificationApp } from '../../notification-service/src/app.js';
// @ts-ignore
import { env as notifEnv } from '../../notification-service/src/config/env.js';
// @ts-ignore
import { IdentityClient } from '../../notification-service/src/clients/identityClient.js';
// @ts-ignore
import { createApp as createFieldApp } from '../../field-service/src/app.js';
// @ts-ignore
import { createApp as createMarketplaceApp } from '../../marketplace-service/src/app.js';
// @ts-ignore
import { createApp as createAiApp } from '../../agricultural-ai-service/src/app.js';
// @ts-ignore
import { env as aiEnv } from '../../agricultural-ai-service/src/config/env.js';
// @ts-ignore
import { createApp as createIdentityApp } from '../../identity-service/src/app.js';
// @ts-ignore
import { createApp as createAnalyticsApp } from '../../analytics-service/src/app.js';

async function startEphemeral(app: any): Promise<{ server: http.Server; url: string }> {
  const server = http.createServer(app);
  await new Promise<void>((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve());
  });
  const addr = server.address() as any;
  return { server, url: `http://127.0.0.1:${addr.port}` };
}

async function runGatewayTests() {
  console.log('🧪 Starting Pure Microservices API Gateway <-> 7 Services Test Suite...\n');

  const media = await startEphemeral(createMediaApp());
  const identity = await startEphemeral(createIdentityApp());
  notifEnv.IDENTITY_SERVICE_URL = identity.url;
  const notification = await startEphemeral(createNotificationApp());
  const field = await startEphemeral(createFieldApp());
  const marketplace = await startEphemeral(createMarketplaceApp());
  const analytics = await startEphemeral(createAnalyticsApp());

  aiEnv.MEDIA_SERVICE_URL = media.url;
  aiEnv.NOTIFICATION_SERVICE_URL = notification.url;
  aiEnv.FIELD_SERVICE_URL = field.url;
  aiEnv.MARKETPLACE_SERVICE_URL = marketplace.url;
  const ai = await startEphemeral(createAiApp());

  env.MEDIA_SERVICE_URL = media.url;
  env.NOTIFICATION_SERVICE_URL = notification.url;
  env.FIELD_SERVICE_URL = field.url;
  env.MARKETPLACE_SERVICE_URL = marketplace.url;
  env.AI_SERVICE_URL = ai.url;
  env.IDENTITY_SERVICE_URL = identity.url;
  env.ANALYTICS_SERVICE_URL = analytics.url;

  const gateway = await startEphemeral(createGatewayApp());

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
    const farmerToken = jwt.sign(
      { userId: 'farmer-101', farmerId: 'farmer-101', role: 'FARMER' },
      env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    const adminToken = jwt.sign(
      { userId: 'admin-101', role: 'ADMIN', email: 'admin@kissanmithar.in', staffRole: 'SUPER_ADMIN' },
      env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // 1. Gateway health & tracing
    const healthRes = await fetch(`${gateway.url}/health`);
    const healthJson: any = await healthRes.json();
    assert(
      healthRes.status === 200 && healthJson.architecture === 'microservices',
      'Gateway GET /health returns 200 OK in pure microservices mode'
    );
    assert(Boolean(healthRes.headers.get('x-request-id')), 'Gateway attaches x-request-id header');

    // 2. Media Service via Gateway
    const signRes = await fetch(`${gateway.url}/api/uploads/sign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${farmerToken}` },
      body: JSON.stringify({ folder: 'pure_ms_test' }),
    });
    const signJson: any = await signRes.json();
    assert(
      signRes.status === 200 &&
        signRes.headers.get('x-served-by') === 'media-service' &&
        signJson.data?.folder === 'pure_ms_test',
      'Gateway routes /api/uploads/sign -> media-service'
    );

    // 3. Notification Service via Gateway
    const unauthNotif = await fetch(`${gateway.url}/api/notifications`);
    assert(unauthNotif.status === 401, 'Gateway blocks unauthenticated GET /api/notifications (401)');

    const adminBadBroadcast = await fetch(`${gateway.url}/api/notifications/admin-broadcast`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ targetType: 'ALL', title: 'A', body: 'hi' }),
    });
    assert(
      adminBadBroadcast.status === 400 &&
        adminBadBroadcast.headers.get('x-served-by') === 'notification-service',
      'Gateway routes /api/notifications/admin-broadcast -> notification-service'
    );

    // 4. Field Service via Gateway
    const labourCatalog = await fetch(`${gateway.url}/api/labour-requests/catalog`);
    assert(
      labourCatalog.status === 200 && labourCatalog.headers.get('x-served-by') === 'field-service',
      'Gateway routes /api/labour-requests/catalog -> field-service'
    );

    const badCollab = await fetch(`${gateway.url}/api/collaborations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ companyName: '' }),
    });
    assert(
      badCollab.status === 400 && badCollab.headers.get('x-served-by') === 'field-service',
      'Gateway routes /api/collaborations -> field-service'
    );

    // 5. Marketplace Service via Gateway
    const productsRes = await fetch(`${gateway.url}/api/commerce/products?query=DAP`);
    const productsJson: any = await productsRes.json();
    assert(
      productsRes.status === 200 &&
        productsRes.headers.get('x-served-by') === 'marketplace-service' &&
        productsJson.data?.length > 0,
      'Gateway routes /api/commerce/products -> marketplace-service'
    );

    // 6. Agricultural AI Service via Gateway + cross-service Marketplace API
    const aiChatRes = await fetch(`${gateway.url}/api/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Naaku 10 bags DAP kavali', languageCode: 'te' }),
    });
    const aiChatJson: any = await aiChatRes.json();
    assert(
      aiChatRes.status === 200 &&
        aiChatRes.headers.get('x-served-by') === 'agricultural-ai-service' &&
        Array.isArray(aiChatJson.data?.uiCards) &&
        aiChatJson.data.uiCards.length > 0,
      'Gateway routes /api/ai/chat -> agricultural-ai-service'
    );

    // 7. Internal Realtime Relay Endpoint on Gateway
    const ts = String(Date.now());
    const sig = crypto
      .createHmac('sha256', env.INTERNAL_SERVICE_SECRET)
      .update(`field-service:${ts}:POST:/internal/realtime/emit`)
      .digest('hex');
    const relayRes = await fetch(`${gateway.url}/internal/realtime/emit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-service-name': 'field-service',
        'x-service-timestamp': ts,
        'x-service-signature': sig,
      },
      body: JSON.stringify({ event: 'new-labour-request', data: { requestId: 'r-1' } }),
    });
    assert(relayRes.status === 200, 'Gateway /internal/realtime/emit accepts HMAC-signed events');

    // 8. Identity & Analytics Services via Gateway + Notification->Identity client
    const badOtpRes = await fetch(`${gateway.url}/api/auth/send-phone-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber: '12' }),
    });
    assert(
      badOtpRes.status === 400 && badOtpRes.headers.get('x-served-by') === 'identity-service',
      'Gateway routes /api/auth/send-phone-otp -> identity-service'
    );

    const farmerAnalyticsForbidden = await fetch(`${gateway.url}/api/analytics/summary`, {
      headers: { Authorization: `Bearer ${farmerToken}` },
    });
    assert(
      farmerAnalyticsForbidden.status === 403 &&
        farmerAnalyticsForbidden.headers.get('x-served-by') === 'analytics-service',
      'Gateway routes /api/analytics/summary -> analytics-service and enforces RBAC'
    );

    let notifIdentityReached = false;
    try {
      await IdentityClient.getFarmerDevices('');
    } catch (e: any) {
      notifIdentityReached = String(e?.message || '').includes('400');
    }
    assert(
      notifIdentityReached,
      'Notification Service IdentityClient reaches Identity /internal/devices via HMAC'
    );

    // 9. Admin /api/admin/system-health probes all 7 Node microservices
    const sysHealthRes = await fetch(`${gateway.url}/api/admin/system-health`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const sysHealthJson: any = await sysHealthRes.json();
    assert(
      sysHealthRes.status === 200 &&
        sysHealthJson.data?.architecture === 'microservices' &&
        sysHealthJson.data?.microservices?.mediaService === 'healthy' &&
        sysHealthJson.data?.microservices?.notificationService === 'healthy' &&
        sysHealthJson.data?.microservices?.fieldService === 'healthy' &&
        sysHealthJson.data?.microservices?.marketplaceService === 'healthy' &&
        sysHealthJson.data?.microservices?.aiService === 'healthy' &&
        sysHealthJson.data?.microservices?.identityService === 'healthy' &&
        sysHealthJson.data?.microservices?.analyticsService === 'healthy',
      'Gateway /api/admin/system-health reports healthy status for all 7 microservices'
    );

    // 10. Strict Microservices Mode (no monolith fallback): returns 502 if upstream offline
    await new Promise<void>((resolve) => media.server.close(() => resolve()));
    const offlineSignRes = await fetch(`${gateway.url}/api/uploads/sign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${farmerToken}` },
      body: JSON.stringify({ folder: 'strict_ms_test' }),
    });
    assert(
      offlineSignRes.status === 502 && offlineSignRes.headers.get('x-served-by') === null,
      'Gateway strictly returns 502 Bad Gateway when downstream microservice is offline'
    );
  } finally {
    gateway.server.close();
    media.server.close();
    notification.server.close();
    field.server.close();
    marketplace.server.close();
    analytics.server.close();
    identity.server.close();
    ai.server.close();
    notifEnv.IDENTITY_SERVICE_URL = '';
  }

  console.log(`\n📊 PURE MICROSERVICES GATEWAY TESTS: ${passed} PASSED, ${failed} FAILED`);
  if (failed > 0) process.exit(1);
}

runGatewayTests();
