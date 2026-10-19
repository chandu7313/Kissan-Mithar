import { handler } from '../src/handlers/bazaar-labour.handler.js';

async function runBazaarLabourTests() {
  console.log('🧪 Starting AgriBazaar & Labour Microservice Lambda Event Tests...\n');

  const mockContext = {
    callbackWaitsForEmptyEventLoop: true,
    functionName: 'kissan-mithar-bazaar-labour-test',
    awsRequestId: 'test-req-bl-12345',
    invokedFunctionArn: 'arn:aws:lambda:ap-south-1:123456789012:function:kissan-mithar-bazaar-labour-test',
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
      healthBody.service === 'kissan-mithar-bazaar-labour',
      'Body confirms kissan-mithar-bazaar-labour service identity',
      healthBody
    );

    // 2. Labour Catalog (Primary route)
    console.log('\n2. Testing GET /api/labour-requests/catalog (Primary Route)...');
    const labourCatalogEvent = {
      version: '2.0',
      routeKey: 'GET /api/labour-requests/catalog',
      rawPath: '/api/labour-requests/catalog',
      rawQueryString: '',
      headers: { accept: 'application/json', host: 'api.kissanmithar.in' },
      requestContext: {
        http: {
          method: 'GET',
          path: '/api/labour-requests/catalog',
          protocol: 'HTTP/1.1',
          sourceIp: '127.0.0.1',
          userAgent: 'test-agent',
        },
      },
      isBase64Encoded: false,
    };

    const labourCatalogRes: any = await (handler as any)(labourCatalogEvent, mockContext);
    assert(
      labourCatalogRes.statusCode === 200,
      'GET /api/labour-requests/catalog returns 200 OK',
      labourCatalogRes
    );

    // 3. Labour Catalog (Alias route: /api/labour-help/catalog)
    console.log('\n3. Testing GET /api/labour-help/catalog (Alias Route Compatibility)...');
    const labourAliasEvent = {
      version: '2.0',
      routeKey: 'GET /api/labour-help/catalog',
      rawPath: '/api/labour-help/catalog',
      rawQueryString: '',
      headers: { accept: 'application/json', host: 'api.kissanmithar.in' },
      requestContext: {
        http: {
          method: 'GET',
          path: '/api/labour-help/catalog',
          protocol: 'HTTP/1.1',
          sourceIp: '127.0.0.1',
          userAgent: 'test-agent',
        },
      },
      isBase64Encoded: false,
    };

    const labourAliasRes: any = await (handler as any)(labourAliasEvent, mockContext);
    assert(
      labourAliasRes.statusCode === 200,
      'Alias route /api/labour-help/catalog returns 200 OK',
      labourAliasRes
    );

    // 4. AgriBazaar Listings (Primary route: /api/agri-bazaar/listings)
    console.log('\n4. Testing GET /api/agri-bazaar/listings (Primary Route)...');
    const bazaarEvent = {
      version: '2.0',
      routeKey: 'GET /api/agri-bazaar/listings',
      rawPath: '/api/agri-bazaar/listings',
      rawQueryString: '',
      headers: { accept: 'application/json', host: 'api.kissanmithar.in' },
      requestContext: {
        http: {
          method: 'GET',
          path: '/api/agri-bazaar/listings',
          protocol: 'HTTP/1.1',
          sourceIp: '127.0.0.1',
          userAgent: 'test-agent',
        },
      },
      isBase64Encoded: false,
    };

    const bazaarRes: any = await (handler as any)(bazaarEvent, mockContext);
    assert(
      bazaarRes.statusCode === 200 || bazaarRes.statusCode === 503,
      'GET /api/agri-bazaar/listings responds with 200 (or 503 in offline sandbox)',
      bazaarRes
    );

    // 5. AgriBazaar Listings (Alias route: /api/crop-buying-selling/listings)
    console.log('\n5. Testing GET /api/crop-buying-selling/listings (Alias Route Compatibility)...');
    const cropAliasEvent = {
      version: '2.0',
      routeKey: 'GET /api/crop-buying-selling/listings',
      rawPath: '/api/crop-buying-selling/listings',
      rawQueryString: '',
      headers: { accept: 'application/json', host: 'api.kissanmithar.in' },
      requestContext: {
        http: {
          method: 'GET',
          path: '/api/crop-buying-selling/listings',
          protocol: 'HTTP/1.1',
          sourceIp: '127.0.0.1',
          userAgent: 'test-agent',
        },
      },
      isBase64Encoded: false,
    };

    const cropAliasRes: any = await (handler as any)(cropAliasEvent, mockContext);
    assert(
      cropAliasRes.statusCode === 200 || cropAliasRes.statusCode === 503,
      'Alias route /api/crop-buying-selling/listings responds with 200/503',
      cropAliasRes
    );

    // 6. Validation Error Handling (Zod schema rejection)
    console.log('\n6. Testing POST /api/labour-requests with invalid payload (Zod rejection)...');
    const invalidLabourEvent = {
      version: '2.0',
      routeKey: 'POST /api/labour-requests',
      rawPath: '/api/labour-requests',
      rawQueryString: '',
      headers: {
        'content-type': 'application/json',
        accept: 'application/json',
        host: 'api.kissanmithar.in',
      },
      body: JSON.stringify({
        taskType: 'INVALID_TASK_ENUM_XYZ',
      }),
      requestContext: {
        http: {
          method: 'POST',
          path: '/api/labour-requests',
          protocol: 'HTTP/1.1',
          sourceIp: '127.0.0.1',
          userAgent: 'test-agent',
        },
      },
      isBase64Encoded: false,
    };

    const invalidLabourRes: any = await (handler as any)(invalidLabourEvent, mockContext);
    assert(
      invalidLabourRes.statusCode === 400,
      'POST /api/labour-requests with invalid enum rejected with 400 Bad Request',
      invalidLabourRes
    );

    // 7. Isolation Verification (Foreign route not mounted on this service)
    console.log('\n7. Testing Isolation: GET /api/weather returns 404 on this microservice...');
    const foreignEvent = {
      version: '2.0',
      routeKey: 'GET /api/weather',
      rawPath: '/api/weather',
      rawQueryString: '',
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

    const foreignRes: any = await (handler as any)(foreignEvent, mockContext);
    assert(
      foreignRes.statusCode === 404,
      'Foreign route /api/weather is isolated (returns 404 on bazaar-labour service)',
      foreignRes
    );

    // 8. CORS Preflight Check
    console.log('\n8. Testing OPTIONS /api/agri-bazaar/listings (CORS Preflight)...');
    const corsEvent = {
      version: '2.0',
      routeKey: 'OPTIONS /api/agri-bazaar/listings',
      rawPath: '/api/agri-bazaar/listings',
      rawQueryString: '',
      headers: {
        origin: 'https://kissan-mithar.vercel.app',
        'access-control-request-method': 'GET',
        host: 'api.kissanmithar.in',
      },
      requestContext: {
        http: {
          method: 'OPTIONS',
          path: '/api/agri-bazaar/listings',
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
      'OPTIONS /api/agri-bazaar/listings returns 200/204 CORS OK',
      corsRes
    );

    console.log('\n======================================================');
    console.log(`📊 BAZAAR & LABOUR TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('======================================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Unhandled test failure:', err);
    process.exit(1);
  }
}

runBazaarLabourTests();
