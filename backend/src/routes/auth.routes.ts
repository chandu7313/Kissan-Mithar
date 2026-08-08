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
    email: z.string().email().optional(),
    role: z.enum(['FARMER', 'EXPERT', 'ADMIN']).optional(),
  }),
});

const logoutSchema = z.object({
  body: z.object({
    userId: z.string().optional(),
    role: z.enum(['FARMER', 'EXPERT', 'ADMIN']).optional(),
    userName: z.string().optional(),
    userEmail: z.string().optional(),
  }),
});

router.post('/verify', authLimiter, validateRequest(verifyAuthSchema), AuthController.verify);
router.post('/login', authLimiter, validateRequest(verifyAuthSchema), AuthController.verify);
router.post('/logout', validateRequest(logoutSchema), AuthController.logout);
router.get('/audit-logs', AuthController.getAuditLogs);

export default router;
