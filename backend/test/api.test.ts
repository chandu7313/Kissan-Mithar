import { createApp } from '../src/app.js';
import { Server } from 'http';
import axios from 'axios';

let server: Server;
let baseUrl: string;

async function runTests() {
  console.log('🧪 Starting Kisan Mithar API Verification Test Suite...\n');
  const app = createApp();

  await new Promise<void>((resolve) => {
    server = app.listen(0, () => {
      const addr = server.address();
      const port = typeof addr === 'object' && addr ? addr.port : 4000;
      baseUrl = `http://localhost:${port}/api`;
      console.log(`📡 Test server running on ${baseUrl}\n`);
      resolve();
    });
  });

  let passed = 0;
  let failed = 0;

  const assert = (condition: boolean, testName: string) => {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName}`);
      failed++;
    }
  };

  try {
    // 1. Health Check
    const healthRes = await axios.get(`${baseUrl}/health`);
    assert(healthRes.status === 200 && healthRes.data.status === 'healthy', 'GET /api/health returns healthy');

    // 2. Auth - Verify and get JWT (Farmer)
    const farmerAuthRes = await axios.post(`${baseUrl}/auth/verify`, {
      phoneNumber: '+919876543210',
      name: 'Ramesh Patel',
      role: 'FARMER',
    });
    assert(farmerAuthRes.status === 200 && !!farmerAuthRes.data.data.token, 'POST /api/auth/verify returns JWT token for Farmer');
    const farmerToken = farmerAuthRes.data.data.token;

    // 3. Auth - Verify and get JWT (Expert)
    const expertAuthRes = await axios.post(`${baseUrl}/auth/verify`, {
      phoneNumber: '+919811122233',
      name: 'Dr. Sunil Rao',
      role: 'EXPERT',
    });
    assert(expertAuthRes.status === 200 && expertAuthRes.data.data.user.role === 'EXPERT', 'POST /api/auth/verify returns Expert JWT');
    const expertToken = expertAuthRes.data.data.token;

    const farmerHeaders = { Authorization: `Bearer ${farmerToken}` };
    const expertHeaders = { Authorization: `Bearer ${expertToken}` };

    // 4. Cloudinary Upload Signing
    const signRes = await axios.post(`${baseUrl}/uploads/sign`, { folder: 'orchard_surveys' }, { headers: farmerHeaders });
    assert(
      signRes.status === 200 && !!signRes.data.data.signature && !!signRes.data.data.timestamp,
      'POST /api/uploads/sign returns secure signature & timestamp'
    );

    // 5. Farmer Profile GET & PATCH
    const profileGetRes = await axios.get(`${baseUrl}/farmers/me`, { headers: farmerHeaders });
    assert(profileGetRes.status === 200 && !!profileGetRes.data.data.name, 'GET /api/farmers/me returns profile');

    const profilePatchRes = await axios.patch(
      `${baseUrl}/farmers/me`,
      { name: 'Ramesh Patel Updated', languageCode: 'te', landAcres: 3.0 },
      { headers: farmerHeaders }
    );
    assert(profilePatchRes.status === 200 && profilePatchRes.data.data.languageCode === 'te', 'PATCH /api/farmers/me updates profile fields');

    // 6. Device FCM Token Registration
    const deviceRes = await axios.post(
      `${baseUrl}/devices`,
      { fcmToken: 'fcm_token_device_abc_123_xyz', platform: 'android' },
      { headers: farmerHeaders }
    );
    assert(deviceRes.status === 200 && deviceRes.data.data.fcmToken === 'fcm_token_device_abc_123_xyz', 'POST /api/devices registers FCM token');

    // 7. Orchard Survey Request Creation
    const orchardSurveyRes = await axios.post(
      `${baseUrl}/orchard-requests`,
      {
        photos: {
          front: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
          left: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
        },
        gps: {
          latitude: 18.5204,
          longitude: 73.8567,
          village: 'Khed',
          district: 'Pune',
          state: 'Maharashtra',
        },
        landDetails: {
          size: '3.0 Acres',
          soilType: 'Red Soil',
          waterSources: ['Borewell', 'Canal'],
          electricity: true,
          drip: true,
          existingCrops: ['Mango'],
        },
        notes: 'High density guava intercrop planning',
      },
      { headers: farmerHeaders }
    );
    assert(orchardSurveyRes.status === 201 && orchardSurveyRes.data.data.status === 'SUBMITTED', 'POST /api/orchard-requests creates survey with SUBMITTED status');
    const createdReqId = orchardSurveyRes.data.data.id;

    // 8. Orchard Requests Listing & Detail
    const listReqsRes = await axios.get(`${baseUrl}/orchard-requests`, { headers: farmerHeaders });
    assert(listReqsRes.status === 200 && Array.isArray(listReqsRes.data.data), 'GET /api/orchard-requests lists requests');

    const getReqRes = await axios.get(`${baseUrl}/orchard-requests/${createdReqId}`, { headers: farmerHeaders });
    assert(getReqRes.status === 200 && getReqRes.data.data.id === createdReqId, 'GET /api/orchard-requests/:id returns single survey detail');

    // 9. RBAC Test - Farmer cannot advance status (Forbidden 403)
    let rbacBlocked = false;
    try {
      await axios.patch(
        `${baseUrl}/orchard-requests/${createdReqId}/status`,
        { status: 'UNDER_REVIEW' },
        { headers: farmerHeaders }
      );
    } catch (err: any) {
      if (err.response?.status === 403) {
        rbacBlocked = true;
      }
    }
    assert(rbacBlocked, 'PATCH /api/orchard-requests/:id/status blocks Farmer role with 403 Forbidden (RBAC)');

    // 10. Expert advances status to UNDER_REVIEW
    const expertStatusRes = await axios.patch(
      `${baseUrl}/orchard-requests/${createdReqId}/status`,
      { status: 'UNDER_REVIEW' },
      { headers: expertHeaders }
    );
    assert(expertStatusRes.status === 200 && expertStatusRes.data.data.status === 'UNDER_REVIEW', 'Expert advances status to UNDER_REVIEW');

    // 11. Expert creates Report (Advances status to PLAN_READY)
    const reportRes = await axios.post(
      `${baseUrl}/orchard-requests/${createdReqId}/report`,
      {
        summary: 'Expert high-density guava and mango plan.',
        recommendedVarieties: [
          { crop: 'Guava', variety: 'Taiwan Pink', yieldPerAcre: '8 Tons', plantingSeason: 'Monsoon' },
        ],
        plantationLayout: { rowSpacingMeters: 4.0, plantSpacingMeters: 3.0, totalPlantsEstimate: 800 },
        waterRequirement: '25L per day via drip system',
        soilTreatment: 'Apply 15kg FYM per pit',
        pestControl: 'Organic neem spray',
        estimatedBudget: 75000,
        pdfUrl: 'https://api.kissanmithar.in/reports/plan.pdf',
      },
      { headers: expertHeaders }
    );
    assert(reportRes.status === 201 && !!reportRes.data.data.summary, 'POST /api/orchard-requests/:id/report creates report and updates status to PLAN_READY');

    // 12. Consultations Booking & Listing
    const consultRes = await axios.post(
      `${baseUrl}/consultations`,
      {
        mode: 'VOICE',
        category: 'Soil & Leaf Health',
        scheduledAt: new Date(Date.now() + 86400000).toISOString(),
        language: 'Telugu',
        notes: 'Yellowing of lower leaves',
      },
      { headers: farmerHeaders }
    );
    assert(consultRes.status === 201 && consultRes.data.data.mode === 'VOICE', 'POST /api/consultations books consultation');

    const listConsultRes = await axios.get(`${baseUrl}/consultations`, { headers: farmerHeaders });
    assert(listConsultRes.status === 200 && Array.isArray(listConsultRes.data.data), 'GET /api/consultations retrieves consultation history');

    // 13. Notifications Listing and Read
    const notifsRes = await axios.get(`${baseUrl}/notifications`, { headers: farmerHeaders });
    assert(notifsRes.status === 200 && Array.isArray(notifsRes.data.data), 'GET /api/notifications returns notification list');

    const markReadRes = await axios.patch(`${baseUrl}/notifications/read-all`, {}, { headers: farmerHeaders });
    assert(markReadRes.status === 200 && markReadRes.data.success === true, 'PATCH /api/notifications/read-all marks all notifications read');

    // 14. Weather Proxy & Agriculture Alerts Engine
    const weatherRes = await axios.get(`${baseUrl}/weather?lat=18.5204&lng=73.8567`);
    assert(
      weatherRes.status === 200 &&
        weatherRes.data.data.current.tempC !== undefined &&
        Array.isArray(weatherRes.data.data.agricultureAlerts) &&
        weatherRes.data.data.agricultureAlerts.length > 0,
      'GET /api/weather proxies forecast and generates Agriculture Alerts (e.g. Delay Spraying)'
    );

    // Weather caching check
    const weatherResCached = await axios.get(`${baseUrl}/weather?lat=18.5204&lng=73.8567`);
    assert(
      weatherResCached.status === 200 && weatherResCached.data.data.current.tempC === weatherRes.data.data.current.tempC,
      'GET /api/weather utilizes in-memory location cache'
    );

  } catch (error: any) {
    console.error('Test Suite Error:', error.response?.data || error.message);
    failed++;
  } finally {
    server.close();
    console.log(`\n========================================`);
    console.log(`📊 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log(`========================================\n`);
    if (failed > 0) {
      process.exit(1);
    }
  }
}

runTests();
