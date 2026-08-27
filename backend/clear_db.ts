import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

function hashPassword(password: string): string {
  const salt = 'kissan_mithar_jwt_super_secret_key_2026_dev';
  return crypto.createHash('sha256').update(password + salt).digest('hex');
}

async function main() {
  console.log('🧹 Clearing all dummy data from database...');
  
  await prisma.offlineDraft.deleteMany().catch(() => {});
  await prisma.cropAdvisory.deleteMany().catch(() => {});
  await prisma.mandiPrice.deleteMany().catch(() => {});
  await prisma.emailOtp.deleteMany().catch(() => {});
  await prisma.authAuditLog.deleteMany().catch(() => {});
  await prisma.device.deleteMany().catch(() => {});
  await prisma.notification.deleteMany().catch(() => {});
  await prisma.consultation.deleteMany().catch(() => {});
  await prisma.orchardReport.deleteMany().catch(() => {});
  await prisma.orchardRequest.deleteMany().catch(() => {});
  await prisma.farmer.deleteMany().catch(() => {});
  await prisma.expert.deleteMany().catch(() => {});
  await prisma.admin.deleteMany().catch(() => {});

  console.log('✅ Database data cleared completely.');

  console.log('🛡️ Re-creating Admin User...');
  const defaultPasswordHash = hashPassword('Kisan@123');
  await prisma.admin.create({
    data: {
      id: 'ADMIN-001',
      firebaseUid: 'mock_firebase_admin_main',
      name: 'Kisan Mithar Ops Admin',
      email: 'admin@gmail.com',
      passwordHash: defaultPasswordHash,
    },
  });
  console.log('✅ Admin User recreated. You can login with admin@gmail.com / Kisan@123');
}

main().catch(console.error).finally(() => prisma.$disconnect());
