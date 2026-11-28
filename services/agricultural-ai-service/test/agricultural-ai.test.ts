import http from 'http';
import { createApp } from '../src/app.js';

async function runAiServiceTests() {
  console.log('🧪 Starting Independent Agricultural AI Service Test Suite...\n');

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
    // 1. Health & tracing
    const health = await fetch(`${baseUrl}/health`);
    const healthJson: any = await health.json();
    assert(health.status === 200, 'GET /health returns 200 OK');
    assert(
      healthJson.service === 'kissan-mithar-agricultural-ai-service',
      'Confirms agricultural-ai-service identity'
    );
    assert(Boolean(health.headers.get('x-request-id')), 'Echoes x-request-id header');

    // 2. Conversational AI empty-message rejection
    const badChat = await fetch(`${baseUrl}/api/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: '' }),
    });
    assert(badChat.status === 400, 'POST /api/ai/chat rejects empty message (400)');

    // 3. Conversational AI end-to-end multilingual turn (Telugish disease)
    const chatRes = await fetch(`${baseUrl}/api/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Na paddy crop ki leaves yellow ga avutunnayi', languageCode: 'te' }),
    });
    const chatJson: any = await chatRes.json();
    assert(
      chatRes.status === 200 && Boolean(chatJson.data?.reply) && chatJson.data?.detectedIntent === 'DISEASE_DIAGNOSIS',
      'POST /api/ai/chat orchestrates DISEASE_DIAGNOSIS turn cleanly'
    );

    // 4. Fertilizer & Disease public catalogs
    const fertCat = await fetch(`${baseUrl}/api/fertilizer-requests/catalog`);
    const diseaseCat = await fetch(`${baseUrl}/api/disease-help/catalog`);
    assert(fertCat.status === 200 && diseaseCat.status === 200, 'Fertilizer & Disease alias catalogs respond 200');

    // 5. Orchard routes enforce authentication
    const unauthOrchard = await fetch(`${baseUrl}/api/orchard-requests`);
    assert(unauthOrchard.status === 401, 'GET /api/orchard-requests enforces auth (401)');

    // 6. Weather endpoint responds with forecast & ag alerts (fallback/live)
    const weather = await fetch(`${baseUrl}/api/weather?lat=17.385&lng=78.486`);
    const weatherJson: any = await weather.json();
    assert(weather.status === 200 && Boolean(weatherJson.data?.current), 'GET /api/weather returns forecast & ag alerts');
  } finally {
    server.close();
  }

  console.log(`\n📊 AGRICULTURAL AI SERVICE TESTS: ${passed} PASSED, ${failed} FAILED`);
  if (failed > 0) process.exit(1);
}

runAiServiceTests();
