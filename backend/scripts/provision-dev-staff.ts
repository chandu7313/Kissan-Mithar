import bcrypt from 'bcryptjs';
import { prisma } from '../src/config/db.js';
import { logger } from '../src/config/logger.js';

/**
 * DEVELOPMENT-ONLY STAFF PROVISIONING SCRIPT
 * Creates real, active accounts and authoritative staff roles in Supabase PostgreSQL.
 *
 * Mandatory Safeguards:
 * 1. Strictly refuses to run in production (NODE_ENV === 'production').
 * 2. Idempotent and safe to rerun without creating duplicate accounts.
 * 3. Never hardcodes plaintext passwords in the database (uses bcrypt with 10 rounds).
 */
export async function provisionDevStaff() {
  const envMode = process.env.NODE_ENV || 'development';
  if (envMode === 'production') {
    console.error('⛔ FATAL: Cannot run dev staff provisioning in production environment!');
    process.exit(1);
  }

  console.log(`\n======================================================`);
  console.log(`🌱 [KISAN MITHAR] Starting Development Staff Provisioning`);
  console.log(`🔒 Target Environment: ${envMode}`);
  console.log(`======================================================\n`);

  const rawPassword = process.env.DEV_STAFF_DEFAULT_PASSWORD || 'Kisan@123';
  const passwordHash = await bcrypt.hash(rawPassword, 10);

  const adminRoles = [
    {
      id: 'STAFF-FOUNDER-001',
      name: 'Srikanth Reddy (Founder & CEO)',
      email: 'founder@kissanmithar.in',
      mobileNumber: '+919848011001',
      staffRole: 'SUPER_ADMIN',
    },
    {
      id: 'STAFF-SYSADMIN-002',
      name: 'Rajesh Varma (System Architect)',
      email: 'sysadmin@kissanmithar.in',
      mobileNumber: '+919848011002',
      staffRole: 'SYSTEM_ADMIN',
    },
    {
      id: 'STAFF-OPSMGR-003',
      name: 'Praveen Kumar (Head of Farm Ops)',
      email: 'operations@kissanmithar.in',
      mobileNumber: '+919848011003',
      staffRole: 'OPERATIONS_MANAGER',
    },
    {
      id: 'STAFF-PROCMGR-005',
      name: 'Venkat Rao (Agri-Procurement Lead)',
      email: 'procurement@kissanmithar.in',
      mobileNumber: '+919848011005',
      staffRole: 'PROCUREMENT_MANAGER',
    },
    {
      id: 'STAFF-FARMSUPP-006',
      name: 'Kavitha Sharma (Farmer Care Lead)',
      email: 'support@kissanmithar.in',
      mobileNumber: '+919848011006',
      staffRole: 'FARMER_SUPPORT',
    },
    {
      id: 'STAFF-FIELDCOORD-007',
      name: 'Suresh Babu (Field Machinery & Labour Coordinator)',
      email: 'fieldops@kissanmithar.in',
      mobileNumber: '+919848011007',
      staffRole: 'FIELD_COORDINATOR',
    },
    {
      id: 'STAFF-FINCOMPL-008',
      name: 'Anil Kulkarni (Finance & Compliance Officer)',
      email: 'finance@kissanmithar.in',
      mobileNumber: '+919848011008',
      staffRole: 'FINANCE_COMPLIANCE',
    },
    {
      id: 'STAFF-MKTGMGR-009',
      name: 'Deepa Naidu (Outreach & Campaign Manager)',
      email: 'marketing@kissanmithar.in',
      mobileNumber: '+919848011009',
      staffRole: 'MARKETING_MANAGER',
    },
    {
      id: 'STAFF-BIANALYST-010',
      name: 'Arun Mehra (Agronomy Data & Audit Analyst)',
      email: 'analyst@kissanmithar.in',
      mobileNumber: '+919848011010',
      staffRole: 'BUSINESS_ANALYST',
    },
  ];

  // 1. Provision Admin Staff Records
  for (const staff of adminRoles) {
    const existing = await prisma.admin.findUnique({ where: { email: staff.email } });
    if (existing) {
      await prisma.admin.update({
        where: { id: existing.id },
        data: {
          name: staff.name,
          mobileNumber: staff.mobileNumber,
          staffRole: staff.staffRole,
          isActive: true,
          passwordHash,
        },
      });
      console.log(`  ✓ Updated Admin Account: [${staff.staffRole}] -> ${staff.email}`);
    } else {
      await prisma.admin.create({
        data: {
          id: staff.id,
          name: staff.name,
          email: staff.email,
          mobileNumber: staff.mobileNumber,
          staffRole: staff.staffRole,
          isActive: true,
          passwordHash,
        },
      });
      console.log(`  + Created Admin Account: [${staff.staffRole}] -> ${staff.email}`);
    }
  }

  // 2. Also ensure original admin@gmail.com is set to SUPER_ADMIN so existing dev logins stay functional
  const originalAdmin = await prisma.admin.findUnique({ where: { email: 'admin@gmail.com' } });
  if (originalAdmin) {
    await prisma.admin.update({
      where: { id: originalAdmin.id },
      data: {
        staffRole: 'SUPER_ADMIN',
        isActive: true,
        passwordHash,
      },
    });
    console.log(`  ✓ Synced legacy root admin: admin@gmail.com -> SUPER_ADMIN`);
  }

  // 3. Provision Expert (AGRONOMY_EXPERT)
  const expertEmail = 'sunil.rao@gmail.com';
  const existingExpert = await prisma.expert.findUnique({ where: { email: expertEmail } });
  if (existingExpert) {
    await prisma.expert.update({
      where: { id: existingExpert.id },
      data: {
        staffRole: 'AGRONOMY_EXPERT',
        isActive: true,
        passwordHash,
      },
    });
    console.log(`  ✓ Updated Agronomy Expert: [AGRONOMY_EXPERT] -> ${expertEmail}`);
  } else {
    await prisma.expert.create({
      data: {
        id: 'STAFF-EXPERT-004',
        name: 'Dr. Sunil Rao',
        phoneNumber: '+919811122233',
        email: expertEmail,
        specialization: 'Horticulture & Ultra High-Density Architecture',
        experienceYears: 14,
        rating: 4.9,
        isAvailable: true,
        staffRole: 'AGRONOMY_EXPERT',
        isActive: true,
        passwordHash,
      },
    });
    console.log(`  + Created Agronomy Expert: [AGRONOMY_EXPERT] -> ${expertEmail}`);
  }

  console.log(`\n✅ Successfully verified and provisioned all 10 authoritative staff accounts in PostgreSQL.\n`);
}

// Direct CLI invocation
provisionDevStaff()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Provisioning failed:', err);
    process.exit(1);
  });
