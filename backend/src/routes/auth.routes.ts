import { Router } from 'express';
import { z } from 'zod';
import { AuthController } from '../controllers/auth.controller.js';
import { validateRequest } from '../middleware/validate.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = Router();

const verifyAuthSchema = z.object({
  body: z.object({
    idToken: z.string().optional(),
    phoneNumber: z.string().optional(),
    name: z.string().optional(),
    role: z.enum(['FARMER', 'EXPERT', 'ADMIN']).optional(),
  }),
});

router.post('/verify', authLimiter, validateRequest(verifyAuthSchema), AuthController.verify);

export default router;
