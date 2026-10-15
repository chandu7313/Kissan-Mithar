import { Router } from 'express';
import { z } from 'zod';
import { DiseaseController } from '../controllers/disease.controller.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { validateRequest } from '../middleware/validate.js';
import { cacheMiddleware } from '../middleware/cache.js';

const router = Router();

const createRequestSchema = z.object({
  body: z.object({
    cropType: z.string().optional(),
    cropAge: z.string().optional(),
    affectedPart: z.string().optional(),
    symptomDescription: z.string().optional(),
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
    }).optional(),
    spreadRate: z.string().optional(),
    previousPesticides: z.string().optional(),
    notes: z.string().optional(),
    farmerId: z.string().optional(),
    phoneNumber: z.string().optional(),
  }),
});

const updateStatusSchema = z.object({
  body: z.object({
    status: z.enum(['SUBMITTED', 'UNDER_REVIEW', 'EXPERT_ASSIGNED', 'DIAGNOSED', 'COMPLETED', 'CANCELLED']),
  }),
});

const assignExpertSchema = z.object({
  body: z.object({
    expertId: z.string().uuid(),
  }),
});

const createTreatmentSchema = z.object({
  body: z.object({
    diseaseName: z.string().min(3),
    causalOrganism: z.string().optional(),
    severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
    diagnosisSummary: z.string().min(10),
    immediateAction: z.string().min(5),
    chemicalTreatment: z.array(
      z.object({
        chemicalName: z.string(),
        commercialBrand: z.string(),
        dosage: z.string(),
        applicationMethod: z.string(),
        waitingPeriodDays: z.number().optional(),
      })
    ),
    organicTreatment: z.string().optional(),
    preventativeMeasures: z.string().optional(),
    followUpDays: z.number().int().positive().optional(),
    estimatedCost: z.number().nonnegative().optional(),
    pdfUrl: z.string().url().optional(),
  }),
});

// 1. Plant Pathology Catalog (known diseases, symptoms, chemical & organic controls)
router.get('/catalog', cacheMiddleware(300), DiseaseController.getCatalog);

// 2. Submit new disease inquiry from farmer
router.post('/', optionalAuth, validateRequest(createRequestSchema), DiseaseController.create);

// 3. List inquiries
router.get('/', requireAuth, DiseaseController.list);
router.get('/my-requests', requireAuth, DiseaseController.getMyRequests);

// 4. Single inquiry detail with treatment plan
router.get('/:id', requireAuth, DiseaseController.getById);

// 5. Expert / Admin Actions
router.patch(
  '/:id/status',
  requireAuth,
  requireRole('EXPERT', 'ADMIN'),
  validateRequest(updateStatusSchema),
  DiseaseController.updateStatus
);

router.post(
  '/:id/assign',
  requireAuth,
  requireRole('EXPERT', 'ADMIN'),
  validateRequest(assignExpertSchema),
  DiseaseController.assignExpert
);

router.post(
  '/:id/treatment',
  requireAuth,
  requireRole('EXPERT', 'ADMIN'),
  validateRequest(createTreatmentSchema),
  DiseaseController.createTreatment
);

// 6. Delete
router.delete('/:id', requireAuth, DiseaseController.delete);

export default router;
