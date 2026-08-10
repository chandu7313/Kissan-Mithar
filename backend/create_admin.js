const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
require('dotenv').config();

const prisma = new PrismaClient();

function hashPassword(password) {
  return crypto.createHash('sha256').update(password + (process.env.JWT_SECRET || 'kissan_salt')).digest('hex');
}

async function createAdmin() {
  const email = 'admin@gmail.com';
  const password = 'Kisan@123';
  const name = 'Kisan Mithar Admin';

  try {
    const existing = await prisma.admin.findUnique({ where: { email } });
    if (existing) {
      console.log(`Admin ${email} already exists!`);
      return;
    }

    const admin = await prisma.admin.create({
      data: {
        email,
        name,
        passwordHash: hashPassword(password),
        mobileNumber: '+919999900000',
      },
    });

    console.log(`\n✅ Successfully created Admin account!`);
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Password: ${password}`);
    console.log(`\nYou can now log in securely using these credentials.\n`);
  } catch (err) {
    console.error('Error creating admin:', err);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
