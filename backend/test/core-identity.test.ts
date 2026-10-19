import { handler } from '../src/handlers/core-identity.handler.js';

async function runCoreIdentityTests() {
  console.log('🧪 Starting Core Identity Microservice Lambda Event Tests...\n');

  const mockContext = {
    callbackWaitsForEmptyEventLoop: true,
    functionName: 'kissan-mithar-core-identity-test',
    awsRequestId: 'test-req-ci-12345',
    invokedFunctionArn: 'arn:aws:lambda:ap-south-1:123456789012:function:kissan-mithar-core-identity-test',
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
      healthBody.service === 'kissan-mithar-core-identity',
      'Body confirms kissan-mithar-core-identity service identity',
      healthBody
    );

    // 2. Auth Endpoint Validation (POST /api/auth/verify with invalid role enum)
    console.log('\n2. Testing POST /api/auth/verify with invalid role enum (Zod rejection)...');
    const invalidAuthEvent = {
      version: '2.0',
      routeKey: 'POST /api/auth/verify',
      rawPath: '/api/auth/verify',
      rawQueryString: '',
      headers: {
        'content-type': 'application/json',
        accept: 'application/json',
        host: 'api.kissanmithar.in',
      },
      body: JSON.stringify({
        role: 'INVALID_ROLE_XYZ',
      }),
      requestContext: {
        http: {
          method: 'POST',
          path: '/api/auth/verify',
          protocol: 'HTTP/1.1',
          sourceIp: '127.0.0.1',
          userAgent: 'test-agent',
        },
      },
      isBase64Encoded: false,
    };

    const invalidAuthRes: any = await (handler as any)(invalidAuthEvent, mockContext);
    assert(
      invalidAuthRes.statusCode === 400,
      'POST /api/auth/verify with invalid role returns 400 Bad Request',
      invalidAuthRes
    );

    // 3. Email OTP Format Validation (POST /api/auth/send-email-otp with invalid email)
    console.log('\n3. Testing POST /api/auth/send-email-otp with invalid email format...');
    const invalidEmailEvent = {
      version: '2.0',
      routeKey: 'POST /api/auth/send-email-otp',
      rawPath: '/api/auth/send-email-otp',
      rawQueryString: '',
      headers: {
        'content-type': 'application/json',
        accept: 'application/json',
        host: 'api.kissanmithar.in',
      },
      body: JSON.stringify({ email: 'not-an-email' }),
      requestContext: {
        http: {
          method: 'POST',
          path: '/api/auth/send-email-otp',
          protocol: 'HTTP/1.1',
          sourceIp: '127.0.0.1',
          userAgent: 'test-agent',
        },
      },
      isBase64Encoded: false,
    };

    const invalidEmailRes: any = await (handler as any)(invalidEmailEvent, mockContext);
    assert(
      invalidEmailRes.statusCode === 400,
      'POST /api/auth/send-email-otp with malformed email returns 400 Bad Request',
      invalidEmailRes
    );

    // 4. Farmer Profile Auth Protection
    console.log('\n4. Testing GET /api/farmers/me without token (Auth guard)...');
    const farmerMeEvent = {
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

    const farmerMeRes: any = await (handler as any)(farmerMeEvent, mockContext);
    assert(
      farmerMeRes.statusCode === 401,
      'GET /api/farmers/me without token returns 401 Unauthorized',
      farmerMeRes
    );

    // 5. Expert Directory Auth Protection
    console.log('\n5. Testing GET /api/experts without token (Auth guard)...');
    const expertsEvent = {
      version: '2.0',
      routeKey: 'GET /api/experts',
      rawPath: '/api/experts',
      rawQueryString: '',
      headers: { accept: 'application/json', host: 'api.kissanmithar.in' },
      requestContext: {
        http: {
          method: 'GET',
          path: '/api/experts',
          protocol: 'HTTP/1.1',
          sourceIp: '127.0.0.1',
          userAgent: 'test-agent',
        },
      },
      isBase64Encoded: false,
    };

    const expertsRes: any = await (handler as any)(expertsEvent, mockContext);
    assert(
      expertsRes.statusCode === 401,
      'GET /api/experts without token returns 401 Unauthorized',
      expertsRes
    );

    // 6. Notifications Auth Protection
    console.log('\n6. Testing GET /api/notifications without token (Auth guard)...');
    const notifEvent = {
      version: '2.0',
      routeKey: 'GET /api/notifications',
      rawPath: '/api/notifications',
      rawQueryString: '',
      headers: { accept: 'application/json', host: 'api.kissanmithar.in' },
      requestContext: {
        http: {
          method: 'GET',
          path: '/api/notifications',
          protocol: 'HTTP/1.1',
          sourceIp: '127.0.0.1',
          userAgent: 'test-agent',
        },
      },
      isBase64Encoded: false,
    };

    const notifRes: any = await (handler as any)(notifEvent, mockContext);
    assert(
      notifRes.statusCode === 401,
      'GET /api/notifications without token returns 401 Unauthorized',
      notifRes
    );

    // 7. Signed Upload Auth Protection
    console.log('\n7. Testing POST /api/uploads/sign without token (Auth guard)...');
    const uploadEvent = {
      version: '2.0',
      routeKey: 'POST /api/uploads/sign',
      rawPath: '/api/uploads/sign',
      rawQueryString: '',
      headers: { accept: 'application/json', host: 'api.kissanmithar.in' },
      requestContext: {
        http: {
          method: 'POST',
          path: '/api/uploads/sign',
          protocol: 'HTTP/1.1',
          sourceIp: '127.0.0.1',
          userAgent: 'test-agent',
        },
      },
      isBase64Encoded: false,
    };

    const uploadRes: any = await (handler as any)(uploadEvent, mockContext);
    assert(
      uploadRes.statusCode === 401,
      'POST /api/uploads/sign without token returns 401 Unauthorized',
      uploadRes
    );

    // 8. Isolation Verification 1 (Foreign route: /api/weather)
    console.log('\n8. Testing Isolation: GET /api/weather returns 404 on core-identity...');
    const foreignWeatherEvent = {
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

    const foreignWeatherRes: any = await (handler as any)(foreignWeatherEvent, mockContext);
    assert(
      foreignWeatherRes.statusCode === 404,
      'Foreign route /api/weather is isolated (returns 404 on core-identity service)',
      foreignWeatherRes
    );

    // 9. Isolation Verification 2 (Foreign route: /api/fertilizer-requests/catalog)
    console.log('\n9. Testing Isolation: GET /api/fertilizer-requests/catalog returns 404 on core-identity...');
    const foreignCatalogEvent = {
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

    const foreignCatalogRes: any = await (handler as any)(foreignCatalogEvent, mockContext);
    assert(
      foreignCatalogRes.statusCode === 404,
      'Foreign route /api/fertilizer-requests/catalog is isolated (returns 404 on core-identity service)',
      foreignCatalogRes
    );

    // 10. CORS Preflight Check
    console.log('\n10. Testing OPTIONS /api/auth/verify (CORS Preflight)...');
    const corsEvent = {
      version: '2.0',
      routeKey: 'OPTIONS /api/auth/verify',
      rawPath: '/api/auth/verify',
      rawQueryString: '',
      headers: {
        origin: 'https://kissan-mithar.vercel.app',
        'access-control-request-method': 'POST',
        host: 'api.kissanmithar.in',
      },
      requestContext: {
        http: {
          method: 'OPTIONS',
          path: '/api/auth/verify',
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
      'OPTIONS /api/auth/verify returns 200/204 CORS OK',
      corsRes
    );

    console.log('\n======================================================');
    console.log(`📊 CORE IDENTITY TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('======================================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Unhandled test failure:', err);
    process.exit(1);
  }
}

runCoreIdentityTests();
