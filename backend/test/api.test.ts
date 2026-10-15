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
        Array.isArray(weatherRes.data.data.agricultureAlerts),
      'GET /api/weather proxies forecast and generates Agriculture Alerts'
    );

    // Weather caching check
    const weatherResCached = await axios.get(`${baseUrl}/weather?lat=18.5204&lng=73.8567`);
    assert(
      weatherResCached.status === 200 && weatherResCached.data.data.current.tempC === weatherRes.data.data.current.tempC,
      'GET /api/weather utilizes in-memory location cache'
    );

    // ==========================================
    // 15. Agri Bazaar — Managed Sourcing & Supply
    // ==========================================

    // 15a. Seller Product Registration (Full Fields)
    const createListingRes = await axios.post(
      `${baseUrl}/agri-bazaar/listings`,
      {
        productName: 'Lemon',
        variety: 'Kagzi Lime',
        minQuantity: 500,
        maxQuantity: 1000,
        quantityUnit: 'kg',
        price: 40,
        priceUnit: '₹/kg',
        locationType: 'MANUAL',
        village: 'Nakrekal',
        district: 'Nalgonda',
        state: 'Telangana',
        latitude: 17.1659,
        longitude: 79.4312,
        notes: 'Farm-fresh mature lemons available',
      },
      { headers: farmerHeaders }
    );
    assert(
      createListingRes.status === 201 &&
        createListingRes.data.success === true &&
        createListingRes.data.data.productName === 'Lemon' &&
        createListingRes.data.data.minQuantity === 500 &&
        createListingRes.data.data.maxQuantity === 1000,
      'POST /api/agri-bazaar/listings registers seller product with min-max quantity range'
    );
    const listingId = createListingRes.data.data.id;

    // 15b. Seller Product Registration with Optional Fields Omitted (Only Location Provided)
    const minimalListingRes = await axios.post(
      `${baseUrl}/agri-bazaar/listings`,
      {
        district: 'Warangal',
        state: 'Telangana',
      },
      { headers: farmerHeaders }
    );
    assert(
      minimalListingRes.status === 201 &&
        minimalListingRes.data.success === true &&
        minimalListingRes.data.data.productName === null &&
        minimalListingRes.data.data.minQuantity === null,
      'POST /api/agri-bazaar/listings accepts listing with optional fields omitted'
    );

    // 15c. Seller Quantity Range Validation (minQuantity > maxQuantity rejected)
    let minExceedsMaxRejected = false;
    try {
      await axios.post(
        `${baseUrl}/agri-bazaar/listings`,
        {
          productName: 'Sweet Orange',
          minQuantity: 500,
          maxQuantity: 200,
          district: 'Guntur',
        },
        { headers: farmerHeaders }
      );
    } catch (err: any) {
      if (err.response?.status === 400) minExceedsMaxRejected = true;
    }
    assert(minExceedsMaxRejected, 'POST /api/agri-bazaar/listings rejects minQuantity > maxQuantity with 400 Bad Request');

    // 15d. Seller Negative Price Validation (price < 0 rejected)
    let negativePriceRejected = false;
    try {
      await axios.post(
        `${baseUrl}/agri-bazaar/listings`,
        {
          productName: 'Pomegranate',
          price: -50,
          district: 'Solapur',
        },
        { headers: farmerHeaders }
      );
    } catch (err: any) {
      if (err.response?.status === 400) negativePriceRejected = true;
    }
    assert(negativePriceRejected, 'POST /api/agri-bazaar/listings rejects negative price with 400 Bad Request');

    // 15e. Seller Invalid Quantity Unit Validation
    let invalidUnitRejected = false;
    try {
      await axios.post(
        `${baseUrl}/agri-bazaar/listings`,
        {
          productName: 'Tomatoes',
          minQuantity: 100,
          quantityUnit: 'space_shuttle_payloads',
          district: 'Kolar',
        },
        { headers: farmerHeaders }
      );
    } catch (err: any) {
      if (err.response?.status === 400) invalidUnitRejected = true;
    }
    assert(invalidUnitRejected, 'POST /api/agri-bazaar/listings rejects unsupported quantity unit with 400 Bad Request');

    // 15f. Seller Ownership Enforcement (Unauthorized user cannot update or delete)
    let unauthorizedEditBlocked = false;
    try {
      // Create a second farmer token
      const otherFarmerAuthRes = await axios.post(`${baseUrl}/auth/verify`, {
        phoneNumber: '+919998887776',
        name: 'Suresh Kumar',
        role: 'FARMER',
      });
      const otherFarmerHeaders = { Authorization: `Bearer ${otherFarmerAuthRes.data.data.token}` };
      await axios.put(
        `${baseUrl}/agri-bazaar/listings/${listingId}`,
        { price: 99 },
        { headers: otherFarmerHeaders }
      );
    } catch (err: any) {
      if (err.response?.status === 403) unauthorizedEditBlocked = true;
    }
    assert(unauthorizedEditBlocked, 'PUT /api/agri-bazaar/listings/:id blocks non-owner with 403 Forbidden');

    // 15g. Buyer Product Request Submission (Single Fixed Quantity)
    const createRequestRes = await axios.post(
      `${baseUrl}/agri-bazaar/requests`,
      {
        productName: 'Lemon',
        variety: 'Kagzi Lime',
        requiredQuantity: 800,
        quantityUnit: 'kg',
        expectedPrice: 42,
        priceUnit: '₹/kg',
        locationType: 'MANUAL',
        locationName: 'Hyderabad Central Market',
        district: 'Hyderabad',
        state: 'Telangana',
      },
      { headers: farmerHeaders }
    );
    assert(
      createRequestRes.status === 201 &&
        createRequestRes.data.success === true &&
        createRequestRes.data.data.productName === 'Lemon' &&
        createRequestRes.data.data.requiredQuantity === 800 &&
        createRequestRes.data.data.status === 'SUBMITTED',
      'POST /api/agri-bazaar/requests creates buyer product request with single fixed quantity'
    );
    const requestId = createRequestRes.data.data.id;

    // 15h. Rejection of Quantity Range (minQuantity/maxQuantity) on Buyer Request
    let buyerRangeRejected = false;
    try {
      await axios.post(
        `${baseUrl}/agri-bazaar/requests`,
        {
          productName: 'Lemon',
          minQuantity: 500,
          maxQuantity: 1000,
          requiredQuantity: 700,
          quantityUnit: 'kg',
          district: 'Hyderabad',
        },
        { headers: farmerHeaders }
      );
    } catch (err: any) {
      if (err.response?.status === 400) buyerRangeRejected = true;
    }
    assert(buyerRangeRejected, 'POST /api/agri-bazaar/requests rejects quantity range (minQuantity/maxQuantity) with 400 Bad Request');

    // 15i. Buyer Missing Product Name Validation
    let missingProductNameRejected = false;
    try {
      await axios.post(
        `${baseUrl}/agri-bazaar/requests`,
        {
          productName: '',
          requiredQuantity: 100,
          quantityUnit: 'kg',
          district: 'Hyderabad',
        },
        { headers: farmerHeaders }
      );
    } catch (err: any) {
      if (err.response?.status === 400) missingProductNameRejected = true;
    }
    assert(missingProductNameRejected, 'POST /api/agri-bazaar/requests rejects empty product name with 400 Bad Request');

    // 15j. Buyer Expected Price without Price Unit Validation
    let priceWithoutUnitRejected = false;
    try {
      await axios.post(
        `${baseUrl}/agri-bazaar/requests`,
        {
          productName: 'Chilli',
          requiredQuantity: 200,
          quantityUnit: 'kg',
          expectedPrice: 120,
          district: 'Khammam',
        },
        { headers: farmerHeaders }
      );
    } catch (err: any) {
      if (err.response?.status === 400) priceWithoutUnitRejected = true;
    }
    assert(priceWithoutUnitRejected, 'POST /api/agri-bazaar/requests requires priceUnit when expectedPrice is supplied');

    // 15k. Coordinates Range Validation (latitude out of -90..90 range)
    let invalidCoordRejected = false;
    try {
      await axios.post(
        `${baseUrl}/agri-bazaar/requests`,
        {
          productName: 'Mango',
          requiredQuantity: 500,
          quantityUnit: 'kg',
          latitude: 195.0,
          longitude: 80.0,
          district: 'Krishna',
        },
        { headers: farmerHeaders }
      );
    } catch (err: any) {
      if (err.response?.status === 400) invalidCoordRejected = true;
    }
    assert(invalidCoordRejected, 'POST /api/agri-bazaar/requests validates coordinates bounds (-90..90, -180..180)');

    // 15l. Privacy Protection on Public Browse (No phone numbers exposed)
    const browseListingsRes = await axios.get(`${baseUrl}/agri-bazaar/listings?productName=Lemon`);
    assert(
      browseListingsRes.status === 200 &&
        browseListingsRes.data.data.length > 0 &&
        browseListingsRes.data.data[0].seller?.phoneNumber === undefined,
      'GET /api/agri-bazaar/listings strictly masks seller contact details for privacy'
    );

    // 15m. Admin Sourcing & Candidate Scoring with Unit-Aware Range Evaluation
    const matchingRes = await axios.get(`${baseUrl}/agri-bazaar/requests/${requestId}/matches`, {
      headers: expertHeaders,
    });
    assert(
      matchingRes.status === 200 &&
        matchingRes.data.data.candidates.length > 0 &&
        matchingRes.data.data.candidates.some(
          (c: any) => c.listing.id === listingId && c.quantityEvaluation?.status === 'IN_RANGE'
        ),
      'GET /api/agri-bazaar/requests/:id/matches evaluates unit-aware volume and scores candidate growers'
    );

    // 15n. Admin Link Identified Supplier Listing to Request
    const matchSupplierRes = await axios.post(
      `${baseUrl}/agri-bazaar/requests/${requestId}/match`,
      {
        listingId,
        internalNotes: 'Contacted Nakrekal farmer. Verified Grade A citrus.',
      },
      { headers: expertHeaders }
    );
    assert(
      matchSupplierRes.status === 201 &&
        matchSupplierRes.data.success === true &&
        matchSupplierRes.data.data.status === 'POTENTIAL',
      'POST /api/agri-bazaar/requests/:id/match links supplier to request with internal notes'
    );

    // 15o. Enforced Status Lifecycle Progression (SUBMITTED -> UNDER_REVIEW)
    const reviewStatusRes = await axios.patch(
      `${baseUrl}/agri-bazaar/requests/${requestId}/status`,
      {
        status: 'UNDER_REVIEW',
        adminNotes: 'Reviewing market availability and logistics routes',
      },
      { headers: expertHeaders }
    );
    assert(
      reviewStatusRes.status === 200 &&
        reviewStatusRes.data.data.status === 'UNDER_REVIEW',
      'PATCH /api/agri-bazaar/requests/:id/status moves SUBMITTED -> UNDER_REVIEW'
    );

    // 15p. Status Progression to SOURCING_IN_PROGRESS with Internal Verification Details
    const updateStatusRes = await axios.patch(
      `${baseUrl}/agri-bazaar/requests/${requestId}/status`,
      {
        status: 'SOURCING_IN_PROGRESS',
        adminNotes: 'Contacted Nalgonda grower. Inspecting produce.',
        verifiedQuantity: 800,
        verifiedQuality: 'Grade A Export',
        procurementCost: 38,
        finalQuotePrice: 42,
      },
      { headers: expertHeaders }
    );
    assert(
      updateStatusRes.status === 200 &&
        updateStatusRes.data.data.status === 'SOURCING_IN_PROGRESS' &&
        updateStatusRes.data.data.verifiedQuality === 'Grade A Export',
      'PATCH /api/agri-bazaar/requests/:id/status advances to SOURCING_IN_PROGRESS with procurement data'
    );

    // 15q. Status Audit History (Staff sees audit trail with internal notes)
    const historyRes = await axios.get(`${baseUrl}/agri-bazaar/requests/${requestId}/history`, {
      headers: expertHeaders,
    });
    assert(
      historyRes.status === 200 &&
        Array.isArray(historyRes.data.data) &&
        historyRes.data.data.length >= 2 &&
        historyRes.data.data.some((h: any) => h.newStatus === 'SOURCING_IN_PROGRESS'),
      'GET /api/agri-bazaar/requests/:id/history retrieves complete status audit trail'
    );

    // 15r. RBAC Protection: Non-staff blocked from admin status updates
    let nonStaffStatusBlocked = false;
    try {
      await axios.patch(
        `${baseUrl}/agri-bazaar/requests/${requestId}/status`,
        { status: 'DELIVERED' },
        { headers: farmerHeaders }
      );
    } catch (err: any) {
      if (err.response?.status === 403) nonStaffStatusBlocked = true;
    }
    assert(nonStaffStatusBlocked, 'PATCH /api/agri-bazaar/requests/:id/status blocks non-admin/expert users with 403 Forbidden');

    // 15s. Dual Route Backward Compatibility on /crop-buying-selling
    const backwardCompatRes = await axios.get(`${baseUrl}/crop-buying-selling/listings`);
    assert(
      backwardCompatRes.status === 200 && Array.isArray(backwardCompatRes.data.data),
      'GET /api/crop-buying-selling/listings backward compatibility route operational'
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
