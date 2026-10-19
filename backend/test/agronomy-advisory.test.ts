import { handler } from '../src/handlers/agronomy-advisory.handler.js';

async function runAgronomyAdvisoryTests() {
  console.log('🧪 Starting Agronomy Advisory Microservice Lambda Event Tests...\n');

  const mockContext = {
    callbackWaitsForEmptyEventLoop: true,
    functionName: 'kissan-mithar-agronomy-advisory-test',
    awsRequestId: 'test-req-aa-12345',
    invokedFunctionArn: 'arn:aws:lambda:ap-south-1:123456789012:function:kissan-mithar-agronomy-advisory-test',
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
      healthBody.service === 'kissan-mithar-agronomy-advisory',
      'Body confirms kissan-mithar-agronomy-advisory service identity',
      healthBody
    );

    // 2. Fertilizer Catalog (Primary route: /api/fertilizer-requests/catalog)
    console.log('\n2. Testing GET /api/fertilizer-requests/catalog (Primary Route)...');
    const fertCatalogEvent = {
      version: '2.0',
      routeKey: 'GET /api/fertilizer-requests/catalog',
      rawPath: '/api/fertilizer-requests/catalog',
      rawQueryString: '',
      headers: { accept: 'application/json', host: 'api.kissanmithar.in' },
      requestContext: {
        http: {
          method: 'GET',
          path: '/api/fertilizer-requests/catalog',
          protocol: 'HTTP/1.1',
          sourceIp: '127.0.0.1',
          userAgent: 'test-agent',
        },
      },
      isBase64Encoded: false,
    };

    const fertCatalogRes: any = await (handler as any)(fertCatalogEvent, mockContext);
    assert(
      fertCatalogRes.statusCode === 200,
      'GET /api/fertilizer-requests/catalog returns 200 OK',
      fertCatalogRes
    );

    // 3. Fertilizer Catalog (Alias route: /api/fertilizer-guide/catalog)
    console.log('\n3. Testing GET /api/fertilizer-guide/catalog (Alias Route Compatibility)...');
    const fertAliasEvent = {
      version: '2.0',
      routeKey: 'GET /api/fertilizer-guide/catalog',
      rawPath: '/api/fertilizer-guide/catalog',
      rawQueryString: '',
      headers: { accept: 'application/json', host: 'api.kissanmithar.in' },
      requestContext: {
        http: {
          method: 'GET',
          path: '/api/fertilizer-guide/catalog',
          protocol: 'HTTP/1.1',
          sourceIp: '127.0.0.1',
          userAgent: 'test-agent',
        },
      },
      isBase64Encoded: false,
    };

    const fertAliasRes: any = await (handler as any)(fertAliasEvent, mockContext);
    assert(
      fertAliasRes.statusCode === 200,
      'Alias route /api/fertilizer-guide/catalog returns 200 OK',
      fertAliasRes
    );

    // 4. Disease Catalog (Primary route: /api/disease-requests/catalog)
    console.log('\n4. Testing GET /api/disease-requests/catalog (Primary Route)...');
    const diseaseCatalogEvent = {
      version: '2.0',
      routeKey: 'GET /api/disease-requests/catalog',
      rawPath: '/api/disease-requests/catalog',
      rawQueryString: '',
      headers: { accept: 'application/json', host: 'api.kissanmithar.in' },
      requestContext: {
        http: {
          method: 'GET',
          path: '/api/disease-requests/catalog',
          protocol: 'HTTP/1.1',
          sourceIp: '127.0.0.1',
          userAgent: 'test-agent',
        },
      },
      isBase64Encoded: false,
    };

    const diseaseCatalogRes: any = await (handler as any)(diseaseCatalogEvent, mockContext);
    assert(
      diseaseCatalogRes.statusCode === 200,
      'GET /api/disease-requests/catalog returns 200 OK',
      diseaseCatalogRes
    );

    // 5. Disease Catalog (Alias route: /api/disease-help/catalog)
    console.log('\n5. Testing GET /api/disease-help/catalog (Alias Route Compatibility)...');
    const diseaseAliasEvent = {
      version: '2.0',
      routeKey: 'GET /api/disease-help/catalog',
      rawPath: '/api/disease-help/catalog',
      rawQueryString: '',
      headers: { accept: 'application/json', host: 'api.kissanmithar.in' },
      requestContext: {
        http: {
          method: 'GET',
          path: '/api/disease-help/catalog',
          protocol: 'HTTP/1.1',
          sourceIp: '127.0.0.1',
          userAgent: 'test-agent',
        },
      },
      isBase64Encoded: false,
    };

    const diseaseAliasRes: any = await (handler as any)(diseaseAliasEvent, mockContext);
    assert(
      diseaseAliasRes.statusCode === 200,
      'Alias route /api/disease-help/catalog returns 200 OK',
      diseaseAliasRes
    );

    // 6. Consultations Auth Check (Protected endpoint)
    console.log('\n6. Testing GET /api/consultations without token (Auth guard)...');
    const consultationsEvent = {
      version: '2.0',
      routeKey: 'GET /api/consultations',
      rawPath: '/api/consultations',
      rawQueryString: '',
      headers: { accept: 'application/json', host: 'api.kissanmithar.in' },
      requestContext: {
        http: {
          method: 'GET',
          path: '/api/consultations',
          protocol: 'HTTP/1.1',
          sourceIp: '127.0.0.1',
          userAgent: 'test-agent',
        },
      },
      isBase64Encoded: false,
    };

    const consultationsRes: any = await (handler as any)(consultationsEvent, mockContext);
    assert(
      consultationsRes.statusCode === 401,
      'GET /api/consultations without token returns 401 Unauthorized',
      consultationsRes
    );

    // 7. Orchard Requests Auth Check (Protected endpoint)
    console.log('\n7. Testing GET /api/orchard-requests without token (Auth guard)...');
    const orchardEvent = {
      version: '2.0',
      routeKey: 'GET /api/orchard-requests',
      rawPath: '/api/orchard-requests',
      rawQueryString: '',
      headers: { accept: 'application/json', host: 'api.kissanmithar.in' },
      requestContext: {
        http: {
          method: 'GET',
          path: '/api/orchard-requests',
          protocol: 'HTTP/1.1',
          sourceIp: '127.0.0.1',
          userAgent: 'test-agent',
        },
      },
      isBase64Encoded: false,
    };

    const orchardRes: any = await (handler as any)(orchardEvent, mockContext);
    assert(
      orchardRes.statusCode === 401,
      'GET /api/orchard-requests without token returns 401 Unauthorized',
      orchardRes
    );

    // 8. Isolation Verification (Foreign route not mounted on this service)
    console.log('\n8. Testing Isolation: GET /api/agri-bazaar/listings returns 404 on this microservice...');
    const foreignEvent = {
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

    const foreignRes: any = await (handler as any)(foreignEvent, mockContext);
    assert(
      foreignRes.statusCode === 404,
      'Foreign route /api/agri-bazaar/listings is isolated (returns 404 on agronomy-advisory service)',
      foreignRes
    );

    // 9. CORS Preflight Check
    console.log('\n9. Testing OPTIONS /api/fertilizer-requests/catalog (CORS Preflight)...');
    const corsEvent = {
      version: '2.0',
      routeKey: 'OPTIONS /api/fertilizer-requests/catalog',
      rawPath: '/api/fertilizer-requests/catalog',
      rawQueryString: '',
      headers: {
        origin: 'https://kissan-mithar.vercel.app',
        'access-control-request-method': 'GET',
        host: 'api.kissanmithar.in',
      },
      requestContext: {
        http: {
          method: 'OPTIONS',
          path: '/api/fertilizer-requests/catalog',
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
      'OPTIONS /api/fertilizer-requests/catalog returns 200/204 CORS OK',
      corsRes
    );

    console.log('\n======================================================');
    console.log(`📊 AGRONOMY & ADVISORY TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('======================================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Unhandled test failure:', err);
    process.exit(1);
  }
}

runAgronomyAdvisoryTests();
