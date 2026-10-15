import { createApp } from '../src/app.js';
import { Server } from 'http';
import axios from 'axios';
import { prisma } from '../src/config/db.js';

let server: Server;
let baseUrl: string;

async function runDiseaseTests() {
  console.log('🧪 Starting Disease Help Service Test Suite...\n');
  const app = createApp();

  await new Promise<void>((resolve) => {
    server = app.listen(4006, () => {
      baseUrl = `http://127.0.0.1:4006/api`;
      console.log(`📡 Disease Test Server running on ${baseUrl}\n`);
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
    // 1. Authenticate Farmer and Expert
    const farmerAuthRes = await axios.post(`${baseUrl}/auth/verify`, {
      phoneNumber: '+919988776655',
      name: 'Nageshwar Rao',
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

    // 2. Fetch Plant Pathology Catalog
    const catalogRes = await axios.get(`${baseUrl}/disease-requests/catalog?crop=Chilli`);
    assert(
      catalogRes.status === 200 &&
        Array.isArray(catalogRes.data.data) &&
        catalogRes.data.data.length > 0 &&
        catalogRes.data.data[0].crop === 'Chilli',
      '3. GET /api/disease-requests/catalog retrieves crop disease knowledge (Chilli diseases & remedies)'
    );

    // 3. Submit Crop Disease Help Request from Farmer
    const submitRes = await axios.post(
      `${baseUrl}/disease-requests`,
      {
        cropType: 'Chilli',
        cropAge: '60 Days (Flowering Stage)',
        affectedPart: 'Leaves & Fruit Twigs',
        symptomDescription: 'Leaves curling downwards with boat shape, and dark sunken circular spots appearing on green chillies.',
        voiceNoteUrl: 'https://res.cloudinary.com/demo/video/upload/disease_voice_sample.m4a',
        voiceText: 'My chilli crop leaves are curling downwards and fruits have black spots. What medicine should I spray?',
        photos: [
          'https://res.cloudinary.com/demo/image/upload/chilli_anthracnose_leaf.jpg',
          'https://res.cloudinary.com/demo/image/upload/chilli_fruit_rot.jpg',
        ],
        gps: {
          latitude: 16.2272,
          longitude: 77.8012,
          accuracy: 4.0,
          address: 'Gadwal, Telangana',
          village: 'Maldakal',
          district: 'Jogulamba Gadwal',
          state: 'Telangana',
        },
        spreadRate: 'Spreading rapidly across 1 acre in 3 days',
        previousPesticides: 'Sprayed Mancozeb 2.5g/L one week ago',
        notes: 'Urgent advice needed to protect fruit yield',
      },
      { headers: farmerHeaders }
    );

    assert(
      submitRes.status === 201 &&
        submitRes.data.success === true &&
        submitRes.data.data.status === 'SUBMITTED',
      '4. POST /api/disease-requests successfully creates disease inquiry with photos, GPS & voice details'
    );
    const requestId = submitRes.data.data.id;

    // 4. Verify in PostgreSQL database
    const dbRecord = await prisma.diseaseRequest.findUnique({
      where: { id: requestId },
      include: { farmer: true },
    });
    assert(
      dbRecord !== null &&
        dbRecord.cropType === 'Chilli' &&
        dbRecord.farmerId === farmerId,
      '5. PostgreSQL Database persistence verified: DiseaseRequest record exists and is linked to Farmer'
    );

    // 5. Farmer views their inquiries
    const myRequestsRes = await axios.get(`${baseUrl}/disease-requests/my-requests`, {
      headers: farmerHeaders,
    });
    assert(
      myRequestsRes.status === 200 &&
        Array.isArray(myRequestsRes.data.data) &&
        myRequestsRes.data.data.some((r: any) => r.id === requestId),
      '6. GET /api/disease-requests/my-requests returns the submitted inquiry'
    );

    // 6. Get inquiry by ID
    const getByIdRes = await axios.get(`${baseUrl}/disease-requests/${requestId}`, {
      headers: farmerHeaders,
    });
    assert(
      getByIdRes.status === 200 &&
        getByIdRes.data.data.id === requestId &&
        getByIdRes.data.data.farmer.name === farmerName,
      '7. GET /api/disease-requests/:id returns complete inquiry details with farmer info'
    );

    // 7. RBAC Check: Farmer attempting to change status must fail with 403
    let rbacBlocked = false;
    try {
      await axios.patch(
        `${baseUrl}/disease-requests/${requestId}/status`,
        { status: 'UNDER_REVIEW' },
        { headers: farmerHeaders }
      );
    } catch (err: any) {
      if (err.response?.status === 403) {
        rbacBlocked = true;
      }
    }
    assert(rbacBlocked, '8. RBAC enforced: Farmer role forbidden (403) from updating expert review status');

    // 8. Expert advances status to UNDER_REVIEW
    const expertReviewRes = await axios.patch(
      `${baseUrl}/disease-requests/${requestId}/status`,
      { status: 'UNDER_REVIEW' },
      { headers: expertHeaders }
    );
    assert(
      expertReviewRes.status === 200 &&
        expertReviewRes.data.data.status === 'UNDER_REVIEW',
      '9. PATCH /api/disease-requests/:id/status updates status to UNDER_REVIEW'
    );

    // 9. Expert formulates and submits Disease Diagnosis & Treatment Plan
    const treatmentRes = await axios.post(
      `${baseUrl}/disease-requests/${requestId}/treatment`,
      {
        diseaseName: 'Anthracnose (Colletotrichum capsici) & Yellow Mite Infestation',
        causalOrganism: 'Fungus + Pest Complex',
        severity: 'HIGH',
        diagnosisSummary: 'Severe fungal fruit rot (Anthracnose) compounded by yellow mite feeding causing downward leaf cupping.',
        immediateAction: 'Clip and dispose infected fruits and twigs; avoid evening irrigation to reduce relative humidity.',
        chemicalTreatment: [
          {
            chemicalName: 'Azoxystrobin 18.2% + Difenoconazole 11.4% SC',
            commercialBrand: 'Amistar Top',
            dosage: '1.0 ml / Liter water',
            applicationMethod: 'Foliar spray with knapsack sprayer covering foliage and fruits',
            waitingPeriodDays: 5,
          },
          {
            chemicalName: 'Spiromesifen 22.9% SC',
            commercialBrand: 'Oberon',
            dosage: '1.0 ml / Liter water',
            applicationMethod: 'Foliar spray targeted to underside of leaves for mite control',
            waitingPeriodDays: 7,
          },
        ],
        organicTreatment: 'Spray 5% Neem Seed Kernel Extract (NSKE) or Sour Buttermilk 500ml + Asafoetida 10g per 15L tank.',
        preventativeMeasures: 'Ensure 60cm row spacing for good air circulation; use raised bed mulch.',
        followUpDays: 5,
        estimatedCost: 1850,
        pdfUrl: 'https://api.kissanmithar.in/reports/disease-chilli-treatment-01.pdf',
      },
      { headers: expertHeaders }
    );

    assert(
      treatmentRes.status === 201 &&
        treatmentRes.data.success === true &&
        !!treatmentRes.data.data.id &&
        treatmentRes.data.data.chemicalTreatment.length === 2,
      '10. POST /api/disease-requests/:id/treatment formulates diagnosis and prescription, saving to disease_treatment_plans'
    );

    // 10. Verify status was advanced to DIAGNOSED and treatment is linked
    const updatedRequestRes = await axios.get(`${baseUrl}/disease-requests/${requestId}`, {
      headers: farmerHeaders,
    });
    assert(
      updatedRequestRes.status === 200 &&
        updatedRequestRes.data.data.status === 'DIAGNOSED' &&
        updatedRequestRes.data.data.treatment !== null &&
        updatedRequestRes.data.data.treatment.diseaseName.includes('Anthracnose'),
      '11. GET /api/disease-requests/:id confirms status=DIAGNOSED and includes populated DiseaseTreatmentPlan'
    );

    // Clean up test records
    await prisma.diseaseTreatmentPlan.deleteMany({ where: { diseaseRequestId: requestId } });
    await prisma.diseaseRequest.delete({ where: { id: requestId } });
    console.log('🧹 Cleaned up test disease request from database.');

  } catch (error: any) {
    console.error('❌ Test Suite Error:', error.response?.data || error.message);
    failed++;
  } finally {
    server.close();
    console.log(`\n========================================`);
    console.log(`📊 DISEASE TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log(`========================================\n`);
    if (failed > 0) {
      process.exit(1);
    }
  }
}

runDiseaseTests();
