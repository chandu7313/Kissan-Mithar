import { Router } from 'express';
import { z } from 'zod';
import { ConsultationController } from '../controllers/consultation.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { validateRequest } from '../middleware/validate.js';
import { cacheMiddleware } from '../middleware/cache.js';

const router = Router();

const bookConsultationSchema = z.object({
  body: z.object({
    mode: z.enum(['VOICE', 'VIDEO', 'CHAT']),
    category: z.string().min(2),
    scheduledAt: z.string(),
    language: z.string().optional(),
    notes: z.string().optional(),
    mediaUrls: z.array(z.string().url()).optional(),
    voiceNoteUrl: z.string().url().optional(),
  }),
});

const updateConsultationSchema = z.object({
  body: z.object({
    status: z.enum(['SCHEDULED', 'COMPLETED', 'CANCELLED']).optional(),
    prescription: z.object({
      diagnosis: z.string(),
      medicines: z.array(z.string()),
      followUpNotes: z.string().optional(),
    }).optional(),
    followUpDate: z.string().optional(),
    notes: z.string().optional(),
  }),
});

router.post('/', requireAuth, validateRequest(bookConsultationSchema), ConsultationController.book);
router.get('/', requireAuth, cacheMiddleware(30), ConsultationController.list);
router.get('/:id', requireAuth, ConsultationController.getById);

// Expert/Admin can update consultation status and add prescriptions
router.patch(
  '/:id',
  requireAuth,
  requireRole('EXPERT', 'ADMIN'),
  validateRequest(updateConsultationSchema),
  ConsultationController.update
);

export default router;
