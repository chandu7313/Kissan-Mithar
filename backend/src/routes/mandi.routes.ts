import { Router } from 'express';
import { z } from 'zod';
import { MandiController } from '../controllers/mandi.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { validateRequest } from '../middleware/validate.js';

const router = Router();

const createPriceSchema = z.object({
  body: z.object({
    commodity: z.string().min(1),
    variety: z.string().optional(),
    market: z.string().min(1),
    district: z.string().min(1),
    state: z.string().min(1),
    minPrice: z.number().nonnegative(),
    maxPrice: z.number().nonnegative(),
    modalPrice: z.number().nonnegative(),
    trend: z.enum(['UP', 'DOWN', 'STABLE']).optional(),
  }),
});

// Public: Farmers & Experts can view market prices
router.get('/', MandiController.list);
router.get('/commodities', MandiController.commodities);

// Admin only: Add new price record
router.post(
  '/',
  requireAuth,
  requireRole('ADMIN'),
  validateRequest(createPriceSchema),
  MandiController.create
);

export default router;
