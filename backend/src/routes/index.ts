import { Router } from 'express';
import authRoutes from './auth.routes.js';
import farmerRoutes from './farmer.routes.js';
import uploadRoutes from './upload.routes.js';
import orchardRoutes from './orchard.routes.js';
import consultationRoutes from './consultation.routes.js';
import notificationRoutes from './notification.routes.js';
import deviceRoutes from './device.routes.js';
import weatherRoutes from './weather.routes.js';
import mandiRoutes from './mandi.routes.js';
import advisoryRoutes from './advisory.routes.js';
import analyticsRoutes from './analytics.routes.js';
import expertRoutes from './expert.routes.js';

const router = Router();

// Health Check — lightweight, always returns 200
router.get('/health', async (_req, res) => {
  let dbStatus = 'disconnected';
  try {
    const { prisma } = await import('../config/db.js');
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = 'connected';
  } catch {
    dbStatus = 'error';
  }

  const memUsage = process.memoryUsage();
  res.status(200).json({
    status: 'healthy',
    service: 'kissan-mithar-backend',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    database: dbStatus,
    uptime: `${Math.floor(process.uptime())}s`,
    memory: {
      rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
      heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
    },
    timestamp: new Date().toISOString(),
  });
});

// Readiness Probe — returns 503 if database is unavailable (for load balancers)
router.get('/readiness', async (_req, res) => {
  try {
    const { prisma } = await import('../config/db.js');
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ ready: true });
  } catch {
    res.status(503).json({ ready: false, reason: 'database_unavailable' });
  }
});

router.use('/auth', authRoutes);
router.use('/farmers', farmerRoutes);
router.use('/uploads', uploadRoutes);
router.use('/orchard-requests', orchardRoutes);
router.use('/consultations', consultationRoutes);
router.use('/notifications', notificationRoutes);
router.use('/devices', deviceRoutes);
router.use('/weather', weatherRoutes);
router.use('/mandi-prices', mandiRoutes);
router.use('/advisories', advisoryRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/experts', expertRoutes);

export default router;
