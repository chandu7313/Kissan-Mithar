import { Router } from 'express';
import { listExperts, createExpert } from '../controllers/expert.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { cacheMiddleware } from '../middleware/cache.js';

const router = Router();

// Authenticated route
router.use(requireAuth);

router.get('/', requireRole('ADMIN', 'EXPERT'), cacheMiddleware(60), listExperts);
router.post('/', requireRole('ADMIN'), createExpert);

export default router;
