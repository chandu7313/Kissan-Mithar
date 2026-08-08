import { Router } from 'express';
import { z } from 'zod';
import { UploadController } from '../controllers/upload.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validate.js';

const router = Router();

const signUploadSchema = z.object({
  body: z.object({
    folder: z.string().optional(),
  }),
});

router.post('/sign', requireAuth, validateRequest(signUploadSchema), UploadController.sign);

export default router;
