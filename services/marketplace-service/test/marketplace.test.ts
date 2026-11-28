import http from 'http';
import jwt from 'jsonwebtoken';
import { createApp } from '../src/app.js';
import { env } from '../src/config/env.js';

async function runMarketplaceTests() {
  console.log('🧪 Starting Independent Marketplace Service Test Suite...\n');

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
    assert(healthJson.service === 'kissan-mithar-marketplace-service', 'Confirms marketplace-service identity');
    assert(Boolean(health.headers.get('x-request-id')), 'Echoes x-request-id header');

    // 2. Commerce products fallback works cleanly even when DB is offline
    const products = await fetch(`${baseUrl}/api/commerce/products?query=DAP`);
    const productsJson: any = await products.json();
    assert(products.status === 200 && Array.isArray(productsJson.data) && productsJson.data.length > 0, 'GET /api/commerce/products?query=DAP returns seed catalog');

    // 3. Checkout Zod validation
    const badCheckout = await fetch(`${baseUrl}/api/commerce/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentMethod: 'CASH_ON_DELIVERY' }),
    });
    assert(badCheckout.status === 400, 'POST /api/commerce/checkout rejects missing shippingAddress (400)');

    // 4. Mandi create enforces ADMIN RBAC
    const farmerToken = jwt.sign({ userId: 'f1', role: 'FARMER' }, env.JWT_SECRET, { expiresIn: '1h' });
    const mandiCreate = await fetch(`${baseUrl}/api/mandi-prices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${farmerToken}`,
      },
      body: JSON.stringify({
        commodity: 'Paddy',
        market: 'Gadwal',
        district: 'Gadwal',
        state: 'Telangana',
        minPrice: 2100,
        maxPrice: 2300,
        modalPrice: 2250,
      }),
    });
    assert(mandiCreate.status === 403, 'POST /api/mandi-prices forbids FARMER role (403)');

    // 5. AgriBazaar Zod validation rejects minQuantity > maxQuantity
    const badListing = await fetch(`${baseUrl}/api/agri-bazaar/listings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ minQuantity: 50, maxQuantity: 10, locationName: 'Gadwal' }),
    });
    assert(badListing.status === 400, 'POST /api/agri-bazaar/listings validates minQuantity <= maxQuantity (400)');
  } finally {
    server.close();
  }

  console.log(`\n📊 MARKETPLACE SERVICE TESTS: ${passed} PASSED, ${failed} FAILED`);
  if (failed > 0) process.exit(1);
}

runMarketplaceTests();
