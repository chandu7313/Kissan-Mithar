import { Router } from 'express';
import { z } from 'zod';
import { NotificationController } from '../controllers/notification.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { validateRequest } from '../middleware/validate.js';

const router = Router();

const broadcastSchema = z.object({
  body: z.object({
    targetType: z.enum(['ALL', 'DISTRICT', 'CROP']),
    targetValue: z.string().optional(),
    title: z.string().min(2, 'Title required'),
    body: z.string().min(5, 'Message body required'),
    type: z.enum(['ALERT', 'SUCCESS', 'CONSULTATION', 'MARKET', 'INFO']).optional(),
    deepLink: z.string().optional(),
  }),
});

// Farmer notification actions
router.get('/', requireAuth, NotificationController.list);
router.patch('/:id/read', requireAuth, NotificationController.markAsRead);
router.patch('/read-all', requireAuth, NotificationController.markAllAsRead);

// Admin notification actions
router.get('/admin-stats', requireAuth, requireRole('ADMIN'), NotificationController.getAdminStats);
router.post(
  '/admin-broadcast',
  requireAuth,
  requireRole('ADMIN'),
  validateRequest(broadcastSchema),
  NotificationController.sendBroadcast
);

export default router;
