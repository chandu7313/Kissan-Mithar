import { createApp } from '../src/app.js';
import { Server } from 'http';
import axios from 'axios';
import { prisma } from '../src/config/db.js';

let server: Server;
let baseUrl: string;

async function runFertilizerTests() {
  console.log('🧪 Starting Fertilizer Guide Service Test Suite...\n');
  const app = createApp();

  // Pick a port
  await new Promise<void>((resolve) => {
    server = app.listen(4005, () => {
      baseUrl = `http://127.0.0.1:4005/api`;
      console.log(`📡 Fertilizer Test Server running on ${baseUrl}\n`);
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
    // 1. Get or create test farmer and test expert tokens
    const farmerAuthRes = await axios.post(`${baseUrl}/auth/verify`, {
      phoneNumber: '+919988776655',
      name: 'Babu Rao Farmer',
      role: 'FARMER',
    });
    assert(farmerAuthRes.status === 200 && !!farmerAuthRes.data.data.token, '1. Farmer JWT authentication succeeded');
    const farmerToken = farmerAuthRes.data.data.token;
    const farmerId = farmerAuthRes.data.data.user.farmerId || farmerAuthRes.data.data.user.userId;

    const farmerName = farmerAuthRes.data.data.user.name;

    const expertAuthRes = await axios.post(`${baseUrl}/auth/verify`, {
      phoneNumber: '+919811122233',
      name: 'Dr. Sunil Rao',
      role: 'EXPERT',
    });
    assert(expertAuthRes.status === 200 && !!expertAuthRes.data.data.token, '2. Expert JWT authentication succeeded');
    const expertToken = expertAuthRes.data.data.token;
    const expertId = expertAuthRes.data.data.user.expertId || expertAuthRes.data.data.user.userId;

    const farmerHeaders = { Authorization: `Bearer ${farmerToken}` };
    const expertHeaders = { Authorization: `Bearer ${expertToken}` };

    // 2. Fetch Agronomic Fertilizer Guide Catalog
    const catalogRes = await axios.get(`${baseUrl}/fertilizer-requests/catalog?crop=Cotton`);
    assert(
      catalogRes.status === 200 &&
        Array.isArray(catalogRes.data.data) &&
        catalogRes.data.data.length > 0 &&
        catalogRes.data.data[0].crop === 'Cotton',
      '3. GET /api/fertilizer-requests/catalog retrieves crop agronomy knowledge (Cotton NPK & Deficiencies)'
    );

    // 3. Submit Fertilizer Guide Request from Farmer
    const submitRes = await axios.post(
      `${baseUrl}/fertilizer-requests`,
      {
        cropType: 'Cotton',
        cropAge: '45 Days (Squaring Stage)',
        landAcres: 2.5,
        soilType: 'Black Cotton Soil',
        problemCategory: 'Yellowing Leaves',
        issueDescription: 'Lower leaves turning reddish-yellow between veins and squaring drop noticed.',
        voiceNoteUrl: 'https://res.cloudinary.com/demo/video/upload/voice_sample.m4a',
        voiceText: 'I am growing cotton in 2.5 acres. Lower leaves are turning yellow and red. What fertilizer schedule should I follow?',
        photos: [
          'https://res.cloudinary.com/demo/image/upload/cotton_leaf_1.jpg',
          'https://res.cloudinary.com/demo/image/upload/cotton_field_2.jpg',
        ],
        gps: {
          latitude: 16.2272,
          longitude: 77.8012,
          accuracy: 5.0,
          address: 'Gadwal, Telangana',
          village: 'Maldakal',
          district: 'Jogulamba Gadwal',
          state: 'Telangana',
        },
        previousFertilizers: 'DAP 50kg at sowing time 40 days ago',
        irrigationType: 'Drip Irrigation',
        notes: 'Need recommendation for both foliar and fertigation',
      },
      { headers: farmerHeaders }
    );

    assert(
      submitRes.status === 201 &&
        submitRes.data.success === true &&
        submitRes.data.data.status === 'SUBMITTED',
      '4. POST /api/fertilizer-requests successfully stores farmer request with photos, GPS & voice details'
    );
    const requestId = submitRes.data.data.id;

    // 4. Verify in DB via Prisma direct query
    const dbRecord = await prisma.fertilizerRequest.findUnique({
      where: { id: requestId },
      include: { farmer: true },
    });
    assert(
      dbRecord !== null &&
        dbRecord.cropType === 'Cotton' &&
        dbRecord.farmerId === farmerId,
      '5. PostgreSQL Database persistence verified: FertilizerRequest record exists and is linked to Farmer'
    );

    // 5. Farmer views their requests
    const myRequestsRes = await axios.get(`${baseUrl}/fertilizer-requests/my-requests`, {
      headers: farmerHeaders,
    });
    assert(
      myRequestsRes.status === 200 &&
        Array.isArray(myRequestsRes.data.data) &&
        myRequestsRes.data.data.some((r: any) => r.id === requestId),
      '6. GET /api/fertilizer-requests/my-requests returns the submitted request'
    );

    // 6. Get request by ID
    const getByIdRes = await axios.get(`${baseUrl}/fertilizer-requests/${requestId}`, {
      headers: farmerHeaders,
    });
    assert(
      getByIdRes.status === 200 &&
        getByIdRes.data.data.id === requestId &&
        getByIdRes.data.data.farmer.name === farmerName,
      '7. GET /api/fertilizer-requests/:id returns complete details with farmer info'
    );

    // 7. RBAC Check: Farmer attempting to change status must fail with 403
    let rbacBlocked = false;
    try {
      await axios.patch(
        `${baseUrl}/fertilizer-requests/${requestId}/status`,
        { status: 'UNDER_REVIEW' },
        { headers: farmerHeaders }
      );
    } catch (err: any) {
      if (err.response?.status === 403) {
        rbacBlocked = true;
      }
    }
    assert(rbacBlocked, '8. RBAC enforced: Farmer role forbidden (403) from updating expert status');

    // 8. Expert advances status to UNDER_REVIEW
    const expertReviewRes = await axios.patch(
      `${baseUrl}/fertilizer-requests/${requestId}/status`,
      { status: 'UNDER_REVIEW' },
      { headers: expertHeaders }
    );
    assert(
      expertReviewRes.status === 200 &&
        expertReviewRes.data.data.status === 'UNDER_REVIEW',
      '9. PATCH /api/fertilizer-requests/:id/status updates status to UNDER_REVIEW'
    );

    // 9. Expert formulates and submits Fertilizer Recommendation Plan
    const planRes = await axios.post(
      `${baseUrl}/fertilizer-requests/${requestId}/plan`,
      {
        diagnosis: 'Magnesium (Mg) deficiency chlorosis accompanied by moderate Nitrogen depletion and flowering stress.',
        summary: 'Targeted fertigation schedule with 19:19:19, followed by Magnesium Sulphate foliar spray and Boron micronutrient boost.',
        schedule: [
          {
            stage: 'Immediate Correction (Day 1-3)',
            timing: 'Immediate',
            fertilizers: [
              {
                name: 'Magnesium Sulphate (MgSO4)',
                dosage: '10g / Liter water',
                method: 'Foliar spray during early morning or evening',
              },
              {
                name: 'Urea (Low Biuret)',
                dosage: '10g / Liter water',
                method: 'Foliar spray along with MgSO4',
              },
            ],
            notes: 'Spray thoroughly on both upper and lower surface of leaves.',
          },
          {
            stage: 'Squaring / Early Boll Stage (Day 7-10)',
            timing: 'Day 7',
            fertilizers: [
              {
                name: '13:0:45 (Potassium Nitrate)',
                dosage: '3 kg / acre',
                method: 'Fertigation via drip system',
              },
              {
                name: 'Chelated Zinc (Zn-EDTA 12%)',
                dosage: '1.5g / Liter water',
                method: 'Foliar spray',
              },
            ],
            notes: 'Ensures strong boll formation and prevents premature bud shedding.',
          },
          {
            stage: 'Boll Development (Day 20)',
            timing: 'Day 20',
            fertilizers: [
              {
                name: '0:0:50 (Potassium Sulphate)',
                dosage: '4 kg / acre',
                method: 'Drip fertigation',
              },
              {
                name: 'Boron 20% (Solubor)',
                dosage: '1g / Liter water',
                method: 'Foliar spray',
              },
            ],
            notes: 'Improves boll retention, seed weight, and lint quality.',
          },
        ],
        organicAlternatives: 'Apply 150 kg Neem Cake per acre around root zone + Jeevamrutham 200 Liters via irrigation.',
        soilTreatment: 'Maintain optimum soil moisture; avoid water stress during squaring and flowering.',
        precautions: 'Do not mix copper fungicides with micronutrients or water-soluble fertilizers.',
        estimatedBudget: 3200,
        pdfUrl: 'https://api.kissanmithar.in/reports/fertilizer-plan-cotton-01.pdf',
      },
      { headers: expertHeaders }
    );

    assert(
      planRes.status === 201 &&
        planRes.data.success === true &&
        !!planRes.data.data.id &&
        planRes.data.data.schedule.length === 3,
      '10. POST /api/fertilizer-requests/:id/plan formulates structured prescription plan and saves to fertilizer_plans table'
    );

    // 10. Verify status was advanced to PLAN_READY and plan is linked in request
    const updatedRequestRes = await axios.get(`${baseUrl}/fertilizer-requests/${requestId}`, {
      headers: farmerHeaders,
    });
    assert(
      updatedRequestRes.status === 200 &&
        updatedRequestRes.data.data.status === 'PLAN_READY' &&
        updatedRequestRes.data.data.plan !== null &&
        updatedRequestRes.data.data.plan.diagnosis.includes('Magnesium'),
      '11. GET /api/fertilizer-requests/:id confirms status=PLAN_READY and includes populated FertilizerPlan'
    );

    // Clean up test request
    await prisma.fertilizerPlan.deleteMany({ where: { fertilizerRequestId: requestId } });
    await prisma.fertilizerRequest.delete({ where: { id: requestId } });
    console.log('🧹 Cleaned up test fertilizer request from database.');

  } catch (error: any) {
    console.error('❌ Test Suite Error:', error.response?.data || error.message);
    failed++;
  } finally {
    server.close();
    console.log(`\n========================================`);
    console.log(`📊 FERTILIZER TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log(`========================================\n`);
    if (failed > 0) {
      process.exit(1);
    }
  }
}

runFertilizerTests();
