import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, NotificationController.list);
router.patch('/:id/read', requireAuth, NotificationController.markAsRead);
router.patch('/read-all', requireAuth, NotificationController.markAllAsRead);

export default router;
