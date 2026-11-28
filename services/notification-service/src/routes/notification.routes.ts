import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller.js';
import { requireAuth, requireRole, requireInternalService } from '../middleware/auth.js';

export const publicNotificationRouter = Router();
publicNotificationRouter.get('/', requireAuth, NotificationController.list);
publicNotificationRouter.patch('/:id/read', requireAuth, NotificationController.markAsRead);
publicNotificationRouter.patch('/read-all', requireAuth, NotificationController.markAllAsRead);
publicNotificationRouter.get(
  '/admin-stats',
  requireAuth,
  requireRole('ADMIN'),
  NotificationController.getAdminStats
);
publicNotificationRouter.post(
  '/admin-broadcast',
  requireAuth,
  requireRole('ADMIN'),
  NotificationController.sendBroadcast
);

export const internalNotificationRouter = Router();
internalNotificationRouter.post('/send', requireInternalService, NotificationController.sendInternal);
