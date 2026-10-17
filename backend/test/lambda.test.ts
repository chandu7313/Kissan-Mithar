import { handler } from '../src/lambda.js';

async function runLambdaTests() {
  console.log('🧪 Starting AWS Lambda Handler Event Tests...\n');

  const mockContext = {
    callbackWaitsForEmptyEventLoop: true,
    functionName: 'kissan-mithar-api-test',
    awsRequestId: 'test-req-12345',
    invokedFunctionArn: 'arn:aws:lambda:ap-south-1:123456789012:function:kissan-mithar-api-test',
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
    // 1. Root /health probe
    console.log('1. Testing Root GET /health via API Gateway HTTP API v2 payload...');
    const rootHealthEvent = {
      version: '2.0',
      routeKey: 'GET /health',
      rawPath: '/health',
      rawQueryString: '',
      headers: {
        accept: 'application/json',
        host: 'api.kissanmithar.in',
      },
      requestContext: {
        http: {
          method: 'GET',
          path: '/health',
          protocol: 'HTTP/1.1',
          sourceIp: '127.0.0.1',
          userAgent: 'AWS-Route53-HealthCheck',
        },
      },
      isBase64Encoded: false,
    };

    const rootRes: any = await (handler as any)(rootHealthEvent, mockContext);
    assert(rootRes.statusCode === 200, 'GET /health returns 200 OK', rootRes);
    const rootBody = JSON.parse(rootRes.body);
    assert(rootBody.status === 'healthy', 'GET /health body has status: healthy', rootBody);

    // 2. API /api/health probe
    console.log('\n2. Testing GET /api/health endpoint...');
    const apiHealthEvent = {
      version: '2.0',
      routeKey: 'GET /api/health',
      rawPath: '/api/health',
      rawQueryString: '',
      headers: {
        accept: 'application/json',
        host: 'api.kissanmithar.in',
      },
      requestContext: {
        http: {
          method: 'GET',
          path: '/api/health',
          protocol: 'HTTP/1.1',
          sourceIp: '127.0.0.1',
          userAgent: 'Vercel-Frontend',
        },
      },
      isBase64Encoded: false,
    };

    const apiRes: any = await (handler as any)(apiHealthEvent, mockContext);
    assert(apiRes.statusCode === 200, 'GET /api/health returns 200 OK', apiRes);
    const apiBody = JSON.parse(apiRes.body);
    assert(apiBody.status === 'healthy', 'GET /api/health body has status: healthy', apiBody);

    // 3. Test 404 handler
    console.log('\n3. Testing 404 on nonexistent route...');
    const notFoundEvent = {
      version: '2.0',
      routeKey: 'GET /api/nonexistent-route-xyz',
      rawPath: '/api/nonexistent-route-xyz',
      rawQueryString: '',
      headers: {
        accept: 'application/json',
        host: 'api.kissanmithar.in',
      },
      requestContext: {
        http: {
          method: 'GET',
          path: '/api/nonexistent-route-xyz',
          protocol: 'HTTP/1.1',
          sourceIp: '127.0.0.1',
          userAgent: 'test-agent',
        },
      },
      isBase64Encoded: false,
    };

    const notFoundRes: any = await (handler as any)(notFoundEvent, mockContext);
    assert(notFoundRes.statusCode === 404, 'Nonexistent route returns 404 Not Found', notFoundRes);

    // 4. Test Catalog endpoints (Public cached endpoints)
    console.log('\n4. Testing GET /api/fertilizer-requests/catalog...');
    const catalogEvent = {
      version: '2.0',
      routeKey: 'GET /api/fertilizer-requests/catalog',
      rawPath: '/api/fertilizer-requests/catalog',
      rawQueryString: '',
      headers: {
        accept: 'application/json',
        host: 'api.kissanmithar.in',
      },
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
    const catalogRes: any = await (handler as any)(catalogEvent, mockContext);
    assert(catalogRes.statusCode === 200, 'GET /api/fertilizer-requests/catalog returns 200 OK', catalogRes);

    // 5. Test Auth Protection (Unauthenticated request to protected route)
    console.log('\n5. Testing GET /api/farmers/me without Authorization header...');
    const unauthorizedEvent = {
      version: '2.0',
      routeKey: 'GET /api/farmers/me',
      rawPath: '/api/farmers/me',
      rawQueryString: '',
      headers: {
        accept: 'application/json',
        host: 'api.kissanmithar.in',
      },
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
    const unauthRes: any = await (handler as any)(unauthorizedEvent, mockContext);
    assert(unauthRes.statusCode === 401, 'GET /api/farmers/me without token returns 401 Unauthorized', unauthRes);

    // 6. Test EventBridge Cleanup Handler
    console.log('\n6. Testing EventBridge Scheduled Cleanup Handler...');
    const { handler: cleanupHandler } = await import('../src/cleanup-handler.js');
    const cleanupEvent = {
      'detail-type': 'Scheduled Event',
      source: 'aws.events',
      time: new Date().toISOString(),
    };
    const cleanupRes: any = await (cleanupHandler as any)(cleanupEvent, mockContext);
    assert(cleanupRes.statusCode === 200, 'Cleanup handler returns 200 OK', cleanupRes);
    const cleanupBody = JSON.parse(cleanupRes.body);
    assert(cleanupBody.success === true, 'Cleanup handler reports success: true', cleanupBody);

    console.log('\n========================================');
    console.log(`📊 LAMBDA TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('========================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Unhandled test failure:', err);
    process.exit(1);
  }
}

runLambdaTests();
