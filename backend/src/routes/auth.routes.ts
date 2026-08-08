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

const sendEmailOtpSchema = z.object({
  body: z.object({
    email: z.string().email(),
    purpose: z.enum(['LOGIN', 'RESET_PASSWORD']).optional(),
    role: z.enum(['FARMER', 'EXPERT', 'ADMIN']).optional(),
  }),
});

const verifyEmailOtpSchema = z.object({
  body: z.object({
    email: z.string().email(),
    otp: z.string().min(4).max(10),
    role: z.enum(['FARMER', 'EXPERT', 'ADMIN']).optional(),
  }),
});

const loginPasswordSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1),
    role: z.enum(['FARMER', 'EXPERT', 'ADMIN']).optional(),
  }),
});

const resetPasswordSchema = z.object({
  body: z.object({
    email: z.string().email(),
    otp: z.string().min(4).max(10),
    newPassword: z.string().min(6),
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
router.post('/send-email-otp', authLimiter, validateRequest(sendEmailOtpSchema), AuthController.sendEmailOtp);
router.post('/verify-email-otp', authLimiter, validateRequest(verifyEmailOtpSchema), AuthController.verifyEmailOtp);
router.post('/login-password', authLimiter, validateRequest(loginPasswordSchema), AuthController.loginWithPassword);
router.post('/reset-password', authLimiter, validateRequest(resetPasswordSchema), AuthController.resetPassword);
router.post('/logout', validateRequest(logoutSchema), AuthController.logout);
router.get('/audit-logs', AuthController.getAuditLogs);

export default router;
