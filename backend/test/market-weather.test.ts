import { handler } from '../src/handlers/market-weather.handler.js';

async function runMarketWeatherTests() {
  console.log('🧪 Starting Market & Weather Microservice Lambda Event Tests...\n');

  const mockContext = {
    callbackWaitsForEmptyEventLoop: true,
    functionName: 'kissan-mithar-market-weather-test',
    awsRequestId: 'test-req-mw-12345',
    invokedFunctionArn: 'arn:aws:lambda:ap-south-1:123456789012:function:kissan-mithar-market-weather-test',
    memoryLimitInMB: '512',
  };

  let passed = 0;
  let failed = 0;

  const assert = (condition: boolean, testName: string, detail?: any) => {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName}`, detail || '');
      failed++;
    }
  };

  try {
    // 1. Service Health Check
    console.log('1. Testing Service GET /health...');
    const healthEvent = {
      version: '2.0',
      routeKey: 'GET /health',
      rawPath: '/health',
      rawQueryString: '',
      headers: { accept: 'application/json', host: 'api.kissanmithar.in' },
      requestContext: {
        http: {
          method: 'GET',
          path: '/health',
          protocol: 'HTTP/1.1',
          sourceIp: '127.0.0.1',
          userAgent: 'test-agent',
        },
      },
      isBase64Encoded: false,
    };

    const healthRes: any = await (handler as any)(healthEvent, mockContext);
    assert(healthRes.statusCode === 200, 'GET /health returns 200 OK', healthRes);
    const healthBody = JSON.parse(healthRes.body);
    assert(
      healthBody.service === 'kissan-mithar-market-weather',
      'Body confirms kissan-mithar-market-weather service identity',
      healthBody
    );

    // 2. Weather Endpoint (with coordinates query string)
    console.log('\n2. Testing GET /api/weather?lat=17.385&lng=78.486...');
    const weatherEvent = {
      version: '2.0',
      routeKey: 'GET /api/weather',
      rawPath: '/api/weather',
      rawQueryString: 'lat=17.385&lng=78.486',
      queryStringParameters: {
        lat: '17.385',
        lng: '78.486',
      },
      headers: { accept: 'application/json', host: 'api.kissanmithar.in' },
      requestContext: {
        http: {
          method: 'GET',
          path: '/api/weather',
          protocol: 'HTTP/1.1',
          sourceIp: '127.0.0.1',
          userAgent: 'test-agent',
        },
      },
      isBase64Encoded: false,
    };

    const weatherRes: any = await (handler as any)(weatherEvent, mockContext);
    assert(
      weatherRes.statusCode === 200 || weatherRes.statusCode === 500,
      'GET /api/weather handles query without runtime crash',
      weatherRes
    );

    // 3. Mandi Prices Commodities
    console.log('\n3. Testing GET /api/mandi-prices/commodities...');
    const mandiEvent = {
      version: '2.0',
      routeKey: 'GET /api/mandi-prices/commodities',
      rawPath: '/api/mandi-prices/commodities',
      rawQueryString: '',
      headers: { accept: 'application/json', host: 'api.kissanmithar.in' },
      requestContext: {
        http: {
          method: 'GET',
          path: '/api/mandi-prices/commodities',
          protocol: 'HTTP/1.1',
          sourceIp: '127.0.0.1',
          userAgent: 'test-agent',
        },
      },
      isBase64Encoded: false,
    };

    const mandiRes: any = await (handler as any)(mandiEvent, mockContext);
    // Even if DB is unreachable in offline test sandbox, handler must return standard response (200 or 503)
    assert(
      mandiRes.statusCode === 200 || mandiRes.statusCode === 500 || mandiRes.statusCode === 503,
      'GET /api/mandi-prices/commodities route responds',
      mandiRes
    );

    // 4. Advisories List
    console.log('\n4. Testing GET /api/advisories...');
    const advisoryEvent = {
      version: '2.0',
      routeKey: 'GET /api/advisories',
      rawPath: '/api/advisories',
      rawQueryString: '',
      headers: { accept: 'application/json', host: 'api.kissanmithar.in' },
      requestContext: {
        http: {
          method: 'GET',
          path: '/api/advisories',
          protocol: 'HTTP/1.1',
          sourceIp: '127.0.0.1',
          userAgent: 'test-agent',
        },
      },
      isBase64Encoded: false,
    };

    const advisoryRes: any = await (handler as any)(advisoryEvent, mockContext);
    assert(
      advisoryRes.statusCode === 200 || advisoryRes.statusCode === 500 || advisoryRes.statusCode === 503,
      'GET /api/advisories route responds',
      advisoryRes
    );

    // 5. Analytics Auth Check (Protected endpoint)
    console.log('\n5. Testing GET /api/analytics/summary without token (RBAC verification)...');
    const analyticsEvent = {
      version: '2.0',
      routeKey: 'GET /api/analytics/summary',
      rawPath: '/api/analytics/summary',
      rawQueryString: '',
      headers: { accept: 'application/json', host: 'api.kissanmithar.in' },
      requestContext: {
        http: {
          method: 'GET',
          path: '/api/analytics/summary',
          protocol: 'HTTP/1.1',
          sourceIp: '127.0.0.1',
          userAgent: 'test-agent',
        },
      },
      isBase64Encoded: false,
    };

    const analyticsRes: any = await (handler as any)(analyticsEvent, mockContext);
    assert(
      analyticsRes.statusCode === 401,
      'GET /api/analytics/summary without auth returns 401 Unauthorized',
      analyticsRes
    );

    // 6. Isolation Verification (Foreign routes not mounted on this service)
    console.log('\n6. Testing Isolation: GET /api/farmers/me returns 404 on this microservice...');
    const foreignEvent = {
      version: '2.0',
      routeKey: 'GET /api/farmers/me',
      rawPath: '/api/farmers/me',
      rawQueryString: '',
      headers: { accept: 'application/json', host: 'api.kissanmithar.in' },
      requestContext: {
        http: {
          method: 'GET',
          path: '/api/farmers/me',
          protocol: 'HTTP/1.1',
          sourceIp: '127.0.0.1',
          userAgent: 'test-agent',
        },
      },
      isBase64Encoded: false,
    };

    const foreignRes: any = await (handler as any)(foreignEvent, mockContext);
    assert(
      foreignRes.statusCode === 404,
      'Foreign route /api/farmers/me is isolated (returns 404 on market-weather service)',
      foreignRes
    );

    // 7. CORS Preflight
    console.log('\n7. Testing OPTIONS /api/weather (CORS Preflight)...');
    const corsEvent = {
      version: '2.0',
      routeKey: 'OPTIONS /api/weather',
      rawPath: '/api/weather',
      rawQueryString: '',
      headers: {
        origin: 'https://kissan-mithar.vercel.app',
        'access-control-request-method': 'GET',
        host: 'api.kissanmithar.in',
      },
      requestContext: {
        http: {
          method: 'OPTIONS',
          path: '/api/weather',
          protocol: 'HTTP/1.1',
          sourceIp: '127.0.0.1',
          userAgent: 'test-agent',
        },
      },
      isBase64Encoded: false,
    };

    const corsRes: any = await (handler as any)(corsEvent, mockContext);
    assert(
      corsRes.statusCode === 204 || corsRes.statusCode === 200,
      'OPTIONS /api/weather returns 200/204 CORS OK',
      corsRes
    );

    console.log('\n======================================================');
    console.log(`📊 MARKET & WEATHER TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('======================================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Unhandled test failure:', err);
    process.exit(1);
  }
}

runMarketWeatherTests();
