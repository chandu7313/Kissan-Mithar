import { Router } from 'express';
import adminRoutes from './admin.routes.js';
import { env } from '../config/env.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import { requireStaffRole } from '../middleware/rbac.js';
import { createGatewayProxy } from '../gateway/gatewayProxy.js';

const mediaProxy = createGatewayProxy({
  serviceName: 'media-service',
  getTargetUrl: () => env.MEDIA_SERVICE_URL,
  timeoutMs: 15000,
});

const notificationProxy = createGatewayProxy({
  serviceName: 'notification-service',
  getTargetUrl: () => env.NOTIFICATION_SERVICE_URL,
  timeoutMs: 8000,
});

const fieldProxy = createGatewayProxy({
  serviceName: 'field-service',
  getTargetUrl: () => env.FIELD_SERVICE_URL,
  timeoutMs: 10000,
});

const marketplaceProxy = createGatewayProxy({
  serviceName: 'marketplace-service',
  getTargetUrl: () => env.MARKETPLACE_SERVICE_URL,
  timeoutMs: 10000,
});

const aiProxy = createGatewayProxy({
  serviceName: 'agricultural-ai-service',
  getTargetUrl: () => env.AI_SERVICE_URL,
  timeoutMs: 25000,
});

const identityProxy = createGatewayProxy({
  serviceName: 'identity-service',
  getTargetUrl: () => env.IDENTITY_SERVICE_URL,
  timeoutMs: 10000,
});

const analyticsProxy = createGatewayProxy({
  serviceName: 'analytics-service',
  getTargetUrl: () => env.ANALYTICS_SERVICE_URL,
  timeoutMs: 10000,
});

const router = Router();

// Gateway Health Probe
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
    service: 'kissan-mithar-api-gateway',
    architecture: 'microservices',
    version: '2.0.0',
    environment: env.NODE_ENV,
    database: dbStatus,
    uptime: `${Math.floor(process.uptime())}s`,
    memory: {
      rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
      heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
    },
    timestamp: new Date().toISOString(),
  });
});

// Gateway Readiness Probe
router.get('/readiness', async (_req, res) => {
  try {
    const { prisma } = await import('../config/db.js');
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ ready: true, service: 'kissan-mithar-api-gateway' });
  } catch {
    res.status(503).json({ ready: false, reason: 'database_unavailable' });
  }
});

// 1. Identity & Farmer Service Routes (port 4015)
router.use('/auth', optionalAuth, identityProxy);
router.use('/farmers', optionalAuth, identityProxy);
router.use('/devices', requireAuth, identityProxy);

// 2. Media Service Routes (port 4010)
router.use('/uploads', optionalAuth, mediaProxy);

// 3. Notification Service Routes (port 4011)
router.use('/notifications', requireAuth, notificationProxy);

// 4. Field Services & Booking Service Routes (port 4012)
router.use('/experts', requireAuth, fieldProxy);
router.use('/consultations', requireAuth, fieldProxy);
router.use('/labour-requests', optionalAuth, fieldProxy);
router.use('/labour-help', optionalAuth, fieldProxy);
router.use('/collaborations', optionalAuth, fieldProxy);
router.use('/partnerships', optionalAuth, fieldProxy);
router.use(
  '/admin/collaborations',
  requireAuth,
  requireStaffRole('SUPER_ADMIN', 'SYSTEM_ADMIN', 'OPERATIONS_MANAGER', 'BUSINESS_ANALYST'),
  fieldProxy
);

// 5. Marketplace Service Routes (port 4013)
router.use('/mandi-prices', optionalAuth, marketplaceProxy);
router.use('/agri-bazaar', optionalAuth, marketplaceProxy);
router.use('/crop-buying-selling', optionalAuth, marketplaceProxy);
router.use('/commerce', optionalAuth, marketplaceProxy);

// 6. Agricultural AI Service Routes (port 4014)
router.use('/ai', optionalAuth, aiProxy);
router.use('/advisories', optionalAuth, aiProxy);
router.use('/orchard-requests', requireAuth, aiProxy);
router.use('/weather', optionalAuth, aiProxy);
router.use('/fertilizer-requests', optionalAuth, aiProxy);
router.use('/fertilizer-guide', optionalAuth, aiProxy);
router.use('/disease-requests', optionalAuth, aiProxy);
router.use('/disease-help', optionalAuth, aiProxy);

// 7. Analytics Service Routes (port 4016)
router.use('/analytics', requireAuth, analyticsProxy);

// 8. API Gateway Admin Orchestration Routes
router.use('/admin', adminRoutes);

export default router;
