const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
require('dotenv').config();

const prisma = new PrismaClient();

function hashPassword(password) {
  return crypto.createHash('sha256').update(password + (process.env.JWT_SECRET || 'kissan_salt')).digest('hex');
}

async function updatePassword() {
  const email = 'ranjith@gmail.com';
  const password = 'Kisan@123';

  try {
    const existing = await prisma.admin.findUnique({ where: { email } });
    if (!existing) {
      console.log(`Admin ${email} not found!`);
      return;
    }

    await prisma.admin.update({
      where: { email },
      data: {
        passwordHash: hashPassword(password),
      },
    });

    console.log(`\n✅ Successfully updated password for ${email}!`);
    console.log(`🔑 New Password: ${password}`);
    console.log(`\nYou can now log in securely using these credentials.\n`);
  } catch (err) {
    console.error('Error updating password:', err);
  } finally {
    await prisma.$disconnect();
  }
}

updatePassword();
