import { Router } from 'express';
import { z } from 'zod';
import { AdvisoryController } from '../controllers/advisory.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { validateRequest } from '../middleware/validate.js';

const router = Router();

const createAdvisorySchema = z.object({
  body: z.object({
    crop: z.string().min(1),
    title: z.string().min(3),
    description: z.string().min(10),
    alertLevel: z.enum(['NORMAL', 'WARNING', 'CRITICAL']).optional(),
    season: z.enum(['KHARIF', 'RABI', 'ZAID', 'ALL_SEASON']).optional(),
  }),
});

// Public: Anyone can view advisories
router.get('/', AdvisoryController.list);

// Expert/Admin: Create advisory
router.post(
  '/',
  requireAuth,
  requireRole('EXPERT', 'ADMIN'),
  validateRequest(createAdvisorySchema),
  AdvisoryController.create
);

export default router;
