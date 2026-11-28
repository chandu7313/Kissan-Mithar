import { Router } from 'express';
import { z } from 'zod';
import { FertilizerController } from '../controllers/fertilizer.controller.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { validateRequest } from '../middleware/validate.js';
import { cacheMiddleware } from '../middleware/cache.js';

const router = Router();

const createRequestSchema = z.object({
  body: z.object({
    cropType: z.string().optional(),
    cropAge: z.string().optional(),
    landAcres: z.number().optional(),
    soilType: z.string().optional(),
    problemCategory: z.string().optional(),
    issueDescription: z.string().optional(),
    voiceNoteUrl: z.string().optional(),
    voiceText: z.string().optional(),
    photos: z.union([
      z.array(z.string()),
      z.record(z.any()),
    ]),
    gps: z.object({
      latitude: z.number(),
      longitude: z.number(),
      accuracy: z.number().optional(),
      address: z.string().optional(),
      village: z.string().optional(),
      district: z.string().optional(),
      state: z.string().optional(),
    }),
    previousFertilizers: z.string().optional(),
    irrigationType: z.string().optional(),
    notes: z.string().optional(),
    farmerId: z.string().optional(),
    phoneNumber: z.string().optional(),
  }),
});

const updateStatusSchema = z.object({
  body: z.object({
    status: z.enum(['SUBMITTED', 'UNDER_REVIEW', 'EXPERT_ASSIGNED', 'PLAN_READY', 'COMPLETED', 'CANCELLED']),
  }),
});

const assignExpertSchema = z.object({
  body: z.object({
    expertId: z.string().uuid(),
  }),
});

const createPlanSchema = z.object({
  body: z.object({
    diagnosis: z.string().min(5),
    summary: z.string().min(10),
    schedule: z.array(
      z.object({
        stage: z.string(),
        timing: z.string(),
        fertilizers: z.array(
          z.object({
            name: z.string(),
            dosage: z.string(),
            method: z.string(),
          })
        ),
        notes: z.string().optional(),
      })
    ),
    organicAlternatives: z.string().optional(),
    soilTreatment: z.string().optional(),
    precautions: z.string().optional(),
    estimatedBudget: z.number().nonnegative().optional(),
    pdfUrl: z.string().url().optional(),
  }),
});

// 1. Agronomic Fertilizer Catalog (standard schedules, deficiencies, bio-fertilizers)
router.get('/catalog', cacheMiddleware(300), FertilizerController.getCatalog);

// 2. Submit new fertilizer guide request (supports authenticated farmer or fallback with phone/farmerId)
router.post('/', optionalAuth, validateRequest(createRequestSchema), FertilizerController.create);

// 3. List requests & farmer-specific list
router.get('/', requireAuth, FertilizerController.list);
router.get('/my-requests', requireAuth, FertilizerController.getMyRequests);

// 4. Single request detail
router.get('/:id', requireAuth, FertilizerController.getById);

// 5. Expert / Admin Actions
router.patch(
  '/:id/status',
  requireAuth,
  requireRole('EXPERT', 'ADMIN'),
  validateRequest(updateStatusSchema),
  FertilizerController.updateStatus
);

router.post(
  '/:id/assign',
  requireAuth,
  requireRole('EXPERT', 'ADMIN'),
  validateRequest(assignExpertSchema),
  FertilizerController.assignExpert
);

router.post(
  '/:id/plan',
  requireAuth,
  requireRole('EXPERT', 'ADMIN'),
  validateRequest(createPlanSchema),
  FertilizerController.createPlan
);

// 6. Farmer / Admin deletion
router.delete('/:id', requireAuth, FertilizerController.delete);

export default router;
