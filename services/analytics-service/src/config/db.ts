import { PrismaClient } from '@prisma/client';
import { env } from './env.js';

declare global {
  // eslint-disable-next-line no-var
  var analyticsPrisma: PrismaClient | undefined;
}

function getDatabaseUrl(): string {
  let url = env.DATABASE_URL;
  if (url.includes('.pooler.supabase.com:5432')) {
    url = url.replace('.pooler.supabase.com:5432', '.pooler.supabase.com:6543');
  }
  if (url.includes(':6543') && !url.includes('pgbouncer=true')) {
    url = `${url}${url.includes('?') ? '&' : '?'}pgbouncer=true`;
  }
  if (!url.includes('pool_timeout=')) {
    url = `${url}${url.includes('?') ? '&' : '?'}pool_timeout=30`;
  }
  if (!url.includes('connect_timeout=')) {
    url = `${url}${url.includes('?') ? '&' : '?'}connect_timeout=15`;
  }
  return url;
}

export const prisma =
  global.analyticsPrisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
    datasources: { db: { url: getDatabaseUrl() } },
  });

global.analyticsPrisma = prisma;
