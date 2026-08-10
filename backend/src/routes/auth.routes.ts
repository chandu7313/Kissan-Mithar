import { Router } from 'express';
import { z } from 'zod';
import { AuthController } from '../controllers/auth.controller.js';
import { validateRequest } from '../middleware/validate.js';
import { authLimiter } from '../middleware/rateLimiter.js';

import { requireAuth } from '../middleware/auth.js';

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

const updateProfileSchema = z.object({
  body: z.object({
    photoUrl: z.string().url().optional(),
  }),
});

const sendPhoneOtpSchema = z.object({
  body: z.object({
    phoneNumber: z.string().min(10),
  }),
});

const verifyPhoneOtpSchema = z.object({
  body: z.object({
    phoneNumber: z.string().min(10),
    otp: z.string().min(4).max(10),
    name: z.string().optional(),
  }),
});

router.patch('/profile', requireAuth, validateRequest(updateProfileSchema), AuthController.updateProfile);
router.post('/verify', authLimiter, validateRequest(verifyAuthSchema), AuthController.verify);
router.post('/login', authLimiter, validateRequest(verifyAuthSchema), AuthController.verify);
router.post('/send-email-otp', authLimiter, validateRequest(sendEmailOtpSchema), AuthController.sendEmailOtp);
router.post('/verify-email-otp', authLimiter, validateRequest(verifyEmailOtpSchema), AuthController.verifyEmailOtp);
router.post('/login-password', authLimiter, validateRequest(loginPasswordSchema), AuthController.loginWithPassword);
router.post('/reset-password', authLimiter, validateRequest(resetPasswordSchema), AuthController.resetPassword);
router.post('/logout', validateRequest(logoutSchema), AuthController.logout);
router.get('/audit-logs', AuthController.getAuditLogs);

// Phone OTP routes for Farmer mobile app
router.post('/send-phone-otp', authLimiter, validateRequest(sendPhoneOtpSchema), AuthController.sendPhoneOtp);
router.post('/verify-phone-otp', authLimiter, validateRequest(verifyPhoneOtpSchema), AuthController.verifyPhoneOtp);

export default router;
