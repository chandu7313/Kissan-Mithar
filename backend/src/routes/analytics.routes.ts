import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { cacheMiddleware } from '../middleware/cache.js';

const router = Router();

// Dashboard analytics — Experts and Admins only
router.get('/summary', requireAuth, requireRole('EXPERT', 'ADMIN'), cacheMiddleware(60), AnalyticsController.summary);

export default router;
