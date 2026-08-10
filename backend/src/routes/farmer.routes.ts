import { Router } from 'express';
import { z } from 'zod';
import { FarmerController } from '../controllers/farmer.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { validateRequest } from '../middleware/validate.js';

const router = Router();

const updateFarmerSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    photoUrl: z.string().url().nullable().optional(),
    village: z.string().optional(),
    district: z.string().optional(),
    state: z.string().optional(),
    landAcres: z.number().nonnegative().optional(),
    primaryCrop: z.string().optional(),
    languageCode: z.string().min(2).max(5).optional(),
  }),
});

// Farmer self-profile
router.get('/me', requireAuth, FarmerController.getMe);
router.patch('/me', requireAuth, validateRequest(updateFarmerSchema), FarmerController.updateMe);

// Admin/Expert: list all farmers
router.get('/', requireAuth, requireRole('EXPERT', 'ADMIN'), FarmerController.listAll);

export default router;
