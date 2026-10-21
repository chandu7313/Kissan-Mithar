import { createApp } from '../src/app.js';
import { Server } from 'http';
import axios from 'axios';
import { prisma } from '../src/config/db.js';

let server: Server;
let baseUrl: string;

async function runCollaborationTests() {
  console.log('🧪 Starting Enterprise Collaboration Requests Lifecycle Test Suite...\n');
  const app = createApp();

  await new Promise<void>((resolve) => {
    server = app.listen(0, () => {
      const addr = server.address();
      const port = typeof addr === 'object' && addr ? addr.port : 4055;
      baseUrl = `http://localhost:${port}/api`;
      console.log(`📡 Test server running on ${baseUrl}\n`);
      resolve();
    });
  });

  let passed = 0;
  let failed = 0;

  const assert = (condition: boolean, testName: string, details?: any) => {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName}`, details || '');
      failed++;
    }
  };

  let superAdminToken = '';
  let auditorToken = '';
  let createdRequestId = '';
  let createdReferenceId = '';

  try {
    // 1. Authenticate as Super Admin & Business Analyst
    console.log('1. Authenticating test administrative roles...');
    const superAdminLogin = await axios.post(`${baseUrl}/auth/login-password`, {
      email: 'founder@kissanmithar.in',
      password: 'Kisan@123',
    });
    superAdminToken = superAdminLogin.data.data.token;
    assert(!!superAdminToken, 'Super Admin authenticated with JWT');

    const auditorLogin = await axios.post(`${baseUrl}/auth/login-password`, {
      email: 'analyst@kissanmithar.in',
      password: 'Kisan@123',
    });
    auditorToken = auditorLogin.data.data.token;
    assert(!!auditorToken, 'Business Analyst / Auditor authenticated with JWT');

    // 2. Public Submission: Submit collaboration request
    console.log('\n2. Testing Public Proposal Submission...');
    const publicPayload = {
      companyName: 'Bharat Agri Innovations Pvt Ltd',
      contactPerson: 'Suresh Kumar',
      officialEmail: 'partnerships@bharatagri.example.com',
      phoneNumber: '+91 98765 12345',
      organizationType: 'Agri-input Companies',
      collaborationCategory: 'Input Supply & Distribution',
      country: 'India',
      state: 'Telangana',
      cityDistrict: 'Gadwal',
      website: 'https://www.bharatagri.example.com',
      proposalDescription: 'Supplying verified bio-fertilizers and organic pest control directly to registered Kissan Mithar farmers with 15% cooperative discount.',
      expectedOutcomes: 'Targeting 2,500 cotton and paddy farmers across Gadwal and Mahbubnagar districts.',
      consentAgreed: true,
    };

    const submitRes = await axios.post(`${baseUrl}/collaborations`, publicPayload);
    assert(submitRes.status === 201, 'POST /api/collaborations returns 201 Created');
    assert(submitRes.data.success === true, 'Response indicates success');
    assert(typeof submitRes.data.data.referenceId === 'string', 'Reference ID is returned');
    assert(submitRes.data.data.referenceId.startsWith('KM-COL-'), 'Reference ID follows KM-COL- convention');
    assert(submitRes.data.data.reviewStatus === 'NEW', 'Initial review status is NEW');

    createdRequestId = submitRes.data.data.id;
    createdReferenceId = submitRes.data.data.referenceId;

    // 3. Admin Queue: Super Admin can list and locate proposal
    console.log('\n3. Testing Admin Collaboration Queue & KPI Calculations...');
    const listRes = await axios.get(`${baseUrl}/admin/collaborations?search=Bharat+Agri`, {
      headers: { Authorization: `Bearer ${superAdminToken}` },
    });
    assert(listRes.status === 200, 'GET /api/admin/collaborations returns 200');
    assert(Array.isArray(listRes.data.data), 'Returns data array');
    const found = listRes.data.data.find((r: any) => r.id === createdRequestId);
    assert(found && found.referenceId === createdReferenceId, 'Submitted proposal found in administrative queue');

    // Stats endpoint
    const statsRes = await axios.get(`${baseUrl}/admin/collaborations/stats`, {
      headers: { Authorization: `Bearer ${superAdminToken}` },
    });
    assert(statsRes.status === 200, 'GET /api/admin/collaborations/stats returns 200');
    assert(statsRes.data.data.kpis.totalRequests >= 1, 'Total requests KPI calculated from database');
    assert(statsRes.data.data.kpis.newRequests >= 1, 'New requests KPI calculated from database');

    // 4. Access Control & Authorization Boundaries
    console.log('\n4. Testing Access Control & Security Boundaries...');
    // Unauthenticated access blocked
    let unauthBlocked = false;
    try {
      await axios.get(`${baseUrl}/admin/collaborations`);
    } catch (e: any) {
      unauthBlocked = e.response?.status === 401;
    }
    assert(unauthBlocked, 'Unauthenticated request correctly returns 401 Unauthorized');

    // Business Analyst (Auditor) can read
    const auditorReadRes = await axios.get(`${baseUrl}/admin/collaborations/${createdRequestId}`, {
      headers: { Authorization: `Bearer ${auditorToken}` },
    });
    assert(auditorReadRes.status === 200, 'Business Analyst can view collaboration request details (read-only permitted)');

    // Business Analyst CANNOT mutate / approve / reject
    let auditorMutationBlocked = false;
    try {
      await axios.patch(
        `${baseUrl}/admin/collaborations/${createdRequestId}/review-status`,
        { targetStatus: 'UNDER_REVIEW' },
        { headers: { Authorization: `Bearer ${auditorToken}` } }
      );
    } catch (e: any) {
      auditorMutationBlocked = e.response?.status === 403;
    }
    assert(auditorMutationBlocked, 'Business Analyst mutation attempt rejected with 403 Forbidden');

    // 5. Verification Precondition Enforcement
    console.log('\n5. Testing Verification Preconditions for Acceptance...');
    // Transition NEW -> UNDER_REVIEW first so acceptance is legally candidate
    const startReviewRes = await axios.patch(
      `${baseUrl}/admin/collaborations/${createdRequestId}/review-status`,
      { targetStatus: 'UNDER_REVIEW' },
      { headers: { Authorization: `Bearer ${superAdminToken}` } }
    );
    assert(startReviewRes.data.data.reviewStatus === 'UNDER_REVIEW', 'Status transitioned to UNDER_REVIEW');

    // Attempting to accept a proposal while still NOT_VERIFIED must fail
    let unverifiedAcceptBlocked = false;
    try {
      await axios.patch(
        `${baseUrl}/admin/collaborations/${createdRequestId}/review-status`,
        {
          targetStatus: 'ACCEPTED',
          decisionNotes: 'Attempting premature acceptance without verification',
        },
        { headers: { Authorization: `Bearer ${superAdminToken}` } }
      );
    } catch (e: any) {
      unverifiedAcceptBlocked = e.response?.status === 400 && e.response?.data?.error?.message?.includes('Cannot accept');
    }
    assert(unverifiedAcceptBlocked, 'Acceptance blocked: Organization must be VERIFIED before acceptance');

    // 6. Organization Verification Workflow
    console.log('\n6. Testing Verification Workflow...');
    const verifyInProgressRes = await axios.patch(
      `${baseUrl}/admin/collaborations/${createdRequestId}/verify`,
      {
        verificationStatus: 'IN_PROGRESS',
        verificationNotes: 'Contacted company registrar and reviewed MCA credentials.',
      },
      { headers: { Authorization: `Bearer ${superAdminToken}` } }
    );
    assert(verifyInProgressRes.status === 200, 'Verification status updated to IN_PROGRESS');
    assert(verifyInProgressRes.data.data.verificationStatus === 'IN_PROGRESS', 'Verification status reflected in DB');

    const verifySuccessRes = await axios.patch(
      `${baseUrl}/admin/collaborations/${createdRequestId}/verify`,
      {
        verificationStatus: 'VERIFIED',
        verificationNotes: 'GSTIN and seed trade license verified. Physical warehouse confirmed.',
      },
      { headers: { Authorization: `Bearer ${superAdminToken}` } }
    );
    assert(verifySuccessRes.data.data.verificationStatus === 'VERIFIED', 'Verification marked VERIFIED');

    // 7. State Transitions: Start Review, Request Info, Rejection check
    console.log('\n7. Testing Review Decisions & Mandatory Fields...');

    // Rejection without reason must fail
    let rejectionWithoutReasonBlocked = false;
    try {
      await axios.patch(
        `${baseUrl}/admin/collaborations/${createdRequestId}/review-status`,
        { targetStatus: 'REJECTED', rejectionReason: '' },
        { headers: { Authorization: `Bearer ${superAdminToken}` } }
      );
    } catch (e: any) {
      rejectionWithoutReasonBlocked = e.response?.status === 400;
    }
    assert(rejectionWithoutReasonBlocked, 'Rejection without reason rejected by backend');

    // Concurrency control: passing stale concurrency version must conflict (409)
    let concurrencyConflictDetected = false;
    try {
      await axios.patch(
        `${baseUrl}/admin/collaborations/${createdRequestId}/review-status`,
        {
          targetStatus: 'NEEDS_INFORMATION',
          informationRequested: 'Please provide lab test certificates.',
          expectedConcurrencyVersion: 1, // Stale version! Current is >= 3
        },
        { headers: { Authorization: `Bearer ${superAdminToken}` } }
      );
    } catch (e: any) {
      concurrencyConflictDetected = e.response?.status === 409;
    }
    assert(concurrencyConflictDetected, 'Optimistic concurrency control: Stale version rejected with 409 Conflict');

    // Request information transition
    const needsInfoRes = await axios.patch(
      `${baseUrl}/admin/collaborations/${createdRequestId}/review-status`,
      {
        targetStatus: 'NEEDS_INFORMATION',
        informationRequested: 'Please provide organic certification batch numbers and batch expiry.',
      },
      { headers: { Authorization: `Bearer ${superAdminToken}` } }
    );
    assert(needsInfoRes.data.data.reviewStatus === 'NEEDS_INFORMATION', 'Status transitioned to NEEDS_INFORMATION');

    // Transition back to UNDER_REVIEW
    await axios.patch(
      `${baseUrl}/admin/collaborations/${createdRequestId}/review-status`,
      { targetStatus: 'UNDER_REVIEW', decisionNotes: 'Received requested certificates' },
      { headers: { Authorization: `Bearer ${superAdminToken}` } }
    );

    // Accept Collaboration (now that organization is VERIFIED)
    const acceptRes = await axios.patch(
      `${baseUrl}/admin/collaborations/${createdRequestId}/review-status`,
      {
        targetStatus: 'ACCEPTED',
        decisionNotes: 'Approved for pilot distribution in Gadwal FPO cluster.',
      },
      { headers: { Authorization: `Bearer ${superAdminToken}` } }
    );
    assert(acceptRes.data.data.reviewStatus === 'ACCEPTED', 'Collaboration accepted after complete verification');

    // 8. Internal Reviewer Notes & Audit Trail
    console.log('\n8. Testing Internal Staff Notes & Audit Trail Completeness...');
    const addNoteRes = await axios.post(
      `${baseUrl}/admin/collaborations/${createdRequestId}/notes`,
      { note: 'Met with Suresh Kumar on video call. Scheduled pilot orientation.' },
      { headers: { Authorization: `Bearer ${superAdminToken}` } }
    );
    assert(addNoteRes.status === 201, 'Internal note added to proposal');

    // Fetch full request detail and inspect audit trail
    const detailRes = await axios.get(`${baseUrl}/admin/collaborations/${createdRequestId}`, {
      headers: { Authorization: `Bearer ${superAdminToken}` },
    });
    const detail = detailRes.data.data;
    assert(detail.notes.length >= 1, 'Internal note retrieved in admin detail view');
    assert(detail.history.length >= 4, 'Full audit trail history tracked in database');

    const actions = detail.history.map((h: any) => h.action);
    assert(actions.includes('SUBMITTED'), 'Audit trail includes SUBMITTED event');
    assert(actions.includes('VERIFICATION_STATUS_CHANGED'), 'Audit trail includes VERIFICATION_STATUS_CHANGED event');
    assert(actions.includes('ACCEPTED'), 'Audit trail includes ACCEPTED decision event');
    assert(actions.includes('NOTE_ADDED'), 'Audit trail includes NOTE_ADDED event');

    console.log(`\n🎉 Test Suite Completed: ${passed} Passed, ${failed} Failed.`);
  } catch (err: any) {
    console.error('Unhandled test failure:', err.response?.data || err.message);
    failed++;
  } finally {
    // Clean up created test record
    if (createdRequestId) {
      try {
        await prisma.collaborationRequest.delete({ where: { id: createdRequestId } });
      } catch {}
    }
    server.close();
  }

  if (failed > 0) {
    process.exit(1);
  }
}

runCollaborationTests();
