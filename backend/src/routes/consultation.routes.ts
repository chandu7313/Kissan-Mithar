import { Router } from 'express';
import { z } from 'zod';
import { ConsultationController } from '../controllers/consultation.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validate.js';

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

router.post('/', requireAuth, validateRequest(bookConsultationSchema), ConsultationController.book);
router.get('/', requireAuth, ConsultationController.list);
router.get('/:id', requireAuth, ConsultationController.getById);

export default router;
