import { Router } from 'express';
import { listExperts, createExpert } from '../controllers/expert.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { cacheMiddleware } from '../middleware/cache.js';

const router = Router();

// Only Admins can list and create experts
router.use(requireAuth);
router.use(requireRole('ADMIN'));

router.get('/', cacheMiddleware(60), listExperts);
router.post('/', createExpert);

export default router;
