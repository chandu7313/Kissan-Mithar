import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { cacheMiddleware } from '../middleware/cache.js';

const router = Router();

// Legacy orchard summary — Experts and Admins only
router.get('/summary', requireAuth, requireRole('EXPERT', 'ADMIN'), cacheMiddleware(60), AnalyticsController.summary);

// Enterprise multi-service Executive Summary
router.get('/executive-summary', requireAuth, requireRole('EXPERT', 'ADMIN'), cacheMiddleware(30), AnalyticsController.executiveSummary);

export default router;
