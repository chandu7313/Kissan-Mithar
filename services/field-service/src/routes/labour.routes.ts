import { Router } from 'express';
import { z } from 'zod';
import { LabourController } from '../controllers/labour.controller.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { validateRequest } from '../middleware/validate.js';
import { cacheMiddleware } from '../middleware/cache.js';

const router = Router();

const createRequestSchema = z.object({
  body: z.object({
    taskType: z.enum([
      'PLOUGHING', 'SOWING', 'TRANSPLANTING', 'WEEDING', 'SPRAYING',
      'HARVESTING', 'IRRIGATION', 'PRUNING', 'LOADING_UNLOADING', 'FENCING', 'OTHER',
    ]).optional(),
    taskDescription: z.string().optional(),
    cropType: z.string().optional(),
    landAcres: z.number().optional(),
    labourersRequired: z.number().int().min(1).optional(),
    preferredStartDate: z.string().optional(),
    preferredEndDate: z.string().optional(),
    durationDays: z.number().int().min(1).optional(),
    dailyWage: z.number().nonnegative().optional(),
    totalBudget: z.number().nonnegative().optional(),
    mealsProvided: z.boolean().optional(),
    transportProvided: z.boolean().optional(),
    gps: z.object({
      latitude: z.number(),
      longitude: z.number(),
      accuracy: z.number().optional(),
      address: z.string().optional(),
      village: z.string().optional(),
      district: z.string().optional(),
      state: z.string().optional(),
    }).optional(),
    voiceNoteUrl: z.string().optional(),
    voiceText: z.string().optional(),
    photos: z.union([
      z.array(z.string()),
      z.record(z.any()),
    ]).optional(),
    specialRequirements: z.string().optional(),
    notes: z.string().optional(),
    urgency: z.enum(['LOW', 'NORMAL', 'URGENT', 'CRITICAL']).optional(),
    farmerId: z.string().optional(),
    phoneNumber: z.string().optional(),
  }),
});

const updateStatusSchema = z.object({
  body: z.object({
    status: z.enum([
      'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'LABOURERS_ASSIGNED',
      'IN_PROGRESS', 'COMPLETED', 'CANCELLED',
    ]),
  }),
});

const assignExpertSchema = z.object({
  body: z.object({
    expertId: z.string().uuid(),
  }),
});

const addAllocationsSchema = z.object({
  body: z.object({
    allocations: z.array(
      z.object({
        labourerName: z.string().min(1),
        labourerPhone: z.string().optional(),
        skillset: z.string().optional(),
        dailyWage: z.number().nonnegative().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        daysWorked: z.number().int().nonnegative().optional(),
        totalPaid: z.number().nonnegative().optional(),
        isConfirmed: z.boolean().optional(),
        notes: z.string().optional(),
      })
    ).min(1),
  }),
});

const updateAllocationSchema = z.object({
  body: z.object({
    labourerName: z.string().min(1).optional(),
    labourerPhone: z.string().optional(),
    skillset: z.string().optional(),
    dailyWage: z.number().nonnegative().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    daysWorked: z.number().int().nonnegative().optional(),
    totalPaid: z.number().nonnegative().optional(),
    isConfirmed: z.boolean().optional(),
    notes: z.string().optional(),
  }),
});

// 1. Labour Task Catalog (wage guidelines, task types, regional names)
router.get('/catalog', cacheMiddleware(300), LabourController.getCatalog);

// 2. Submit new labour request (supports authenticated farmer or fallback with phone/farmerId)
router.post('/', optionalAuth, validateRequest(createRequestSchema), LabourController.create);

// 3. List requests & farmer-specific list
router.get('/', requireAuth, LabourController.list);
router.get('/my-requests', requireAuth, LabourController.getMyRequests);

// 4. Single request detail
router.get('/:id', requireAuth, LabourController.getById);

// 5. Expert / Admin Actions
router.patch(
  '/:id/status',
  requireAuth,
  requireRole('EXPERT', 'ADMIN'),
  validateRequest(updateStatusSchema),
  LabourController.updateStatus
);

router.post(
  '/:id/assign',
  requireAuth,
  requireRole('EXPERT', 'ADMIN'),
  validateRequest(assignExpertSchema),
  LabourController.assignExpert
);

// 6. Labourer Allocation Management
router.post(
  '/:id/allocations',
  requireAuth,
  requireRole('EXPERT', 'ADMIN'),
  validateRequest(addAllocationsSchema),
  LabourController.addAllocations
);

router.patch(
  '/:id/allocations/:allocationId',
  requireAuth,
  requireRole('EXPERT', 'ADMIN'),
  validateRequest(updateAllocationSchema),
  LabourController.updateAllocation
);

router.delete(
  '/:id/allocations/:allocationId',
  requireAuth,
  requireRole('EXPERT', 'ADMIN'),
  LabourController.deleteAllocation
);

// 7. Farmer / Admin deletion
router.delete('/:id', requireAuth, LabourController.delete);

export default router;
