import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

/**
 * Warm up the database connection with retry logic.
 * Supabase free-tier databases can hibernate, and PgBouncer pools
 * may reject the first few connection attempts on cold start.
 */
export const warmupDatabase = async (retries = 5, delayMs = 2000): Promise<void> => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await prisma.$connect();
      await prisma.$queryRaw`SELECT 1`;
      console.log(`[Database] ✅ Connected successfully (attempt ${attempt})`);
      return;
    } catch (error: any) {
      console.warn(
        `[Database] ⚠️ Connection attempt ${attempt}/${retries} failed: ${error.message}`
      );
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      } else {
        console.error('[Database] ❌ All connection attempts failed. Server will start but DB queries may fail.');
      }
    }
  }
};
