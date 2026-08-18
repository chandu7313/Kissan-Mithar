import { Router } from 'express';
import { z } from 'zod';
import { OrchardController } from '../controllers/orchard.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { validateRequest } from '../middleware/validate.js';
import { cacheMiddleware } from '../middleware/cache.js';

const router = Router();

const createRequestSchema = z.object({
  body: z.object({
    photos: z.object({
      front: z.string().optional(),
      left: z.string().optional(),
      right: z.string().optional(),
      center: z.string().optional(),
      gallery: z.array(z.string()).optional(),
    }),
    gps: z.object({
      latitude: z.number(),
      longitude: z.number(),
      accuracy: z.number().optional(),
      village: z.string().optional(),
      district: z.string().optional(),
      state: z.string().optional(),
    }),
    landDetails: z.object({
      size: z.string(),
      soilType: z.string().optional(),
      soilTypes: z.array(z.string()).optional(),
      waterSources: z.array(z.string()),
      electricity: z.boolean(),
      drip: z.boolean(),
      existingCrops: z.array(z.string()),
    }),
    surveyMapUrl: z.string().optional(),
    surveyMapType: z.string().optional(),
    preferences: z.object({
      budget: z.number().optional(),
      expectedGoal: z.string().optional(),
      preferredOrchards: z.array(z.string()).optional(),
      needExpertSuggestion: z.boolean().optional(),
      notes: z.string().optional(),
    }).optional(),
    notes: z.string().optional(),
    voiceNoteUrl: z.string().optional(),
  }),
});

const updateStatusSchema = z.object({
  body: z.object({
    status: z.enum(['SUBMITTED', 'UNDER_REVIEW', 'EXPERT_ASSIGNED', 'PLAN_READY', 'COMPLETED']),
  }),
});

const updateDetailsSchema = z.object({
  body: z.object({
    farmerName: z.string().optional(),
    phoneNumber: z.string().optional(),
    village: z.string().optional(),
    district: z.string().optional(),
    state: z.string().optional(),
    landSize: z.string().optional(),
    soilType: z.string().optional(),
    waterSources: z.array(z.string()).optional(),
    existingCrops: z.array(z.string()).optional(),
  }),
});

const createReportSchema = z.object({
  body: z.object({
    summary: z.string().min(5),
    recommendedVarieties: z.array(
      z.object({
        crop: z.string(),
        variety: z.string(),
        yieldPerAcre: z.string(),
        plantingSeason: z.string(),
      })
    ),
    plantationLayout: z.object({
      rowSpacingMeters: z.number().positive(),
      plantSpacingMeters: z.number().positive(),
      totalPlantsEstimate: z.number().int().positive(),
    }),
    waterRequirement: z.string(),
    soilTreatment: z.string(),
    pestControl: z.string(),
    estimatedBudget: z.number().nonnegative(),
    pdfUrl: z.string().url().optional(),
  }),
});

router.post('/', requireAuth, validateRequest(createRequestSchema), OrchardController.create);
router.get('/', requireAuth, cacheMiddleware(30), OrchardController.list);
router.get('/my-requests', requireAuth, OrchardController.list);
router.get('/:id', requireAuth, OrchardController.getById);

// Role-restricted routes: Only Experts & Admins can change status or issue reports
router.patch(
  '/:id/status',
  requireAuth,
  requireRole('EXPERT', 'ADMIN'),
  validateRequest(updateStatusSchema),
  OrchardController.updateStatus
);

router.patch(
  '/:id/details',
  requireAuth,
  requireRole('EXPERT', 'ADMIN'),
  validateRequest(updateDetailsSchema),
  OrchardController.updateDetails
);

router.post(
  '/:id/report',
  requireAuth,
  requireRole('EXPERT', 'ADMIN'),
  validateRequest(createReportSchema),
  OrchardController.createReport
);

export default router;
