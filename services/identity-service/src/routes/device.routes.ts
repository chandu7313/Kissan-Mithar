import { Router } from 'express';
import { z } from 'zod';
import { DeviceController } from '../controllers/device.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validate.js';

const router = Router();

const registerDeviceSchema = z.object({
  body: z.object({
    fcmToken: z.string().min(10),
    platform: z.string().optional(),
  }),
});

router.post('/', requireAuth, validateRequest(registerDeviceSchema), DeviceController.register);

export default router;
