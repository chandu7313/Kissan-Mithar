import { Router } from 'express';
import { MediaController } from '../controllers/media.controller.js';
import { requireAuth, requireInternalService } from '../middleware/auth.js';

export const publicMediaRouter = Router();
publicMediaRouter.post('/sign', requireAuth, MediaController.sign);
publicMediaRouter.post('/audio', MediaController.uploadAudio);

export const internalMediaRouter = Router();
internalMediaRouter.post('/audio', requireInternalService, MediaController.uploadAudio);
