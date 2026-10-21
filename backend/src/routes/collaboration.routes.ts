import { Router } from 'express';
import { CollaborationController } from '../controllers/collaboration.controller.js';

const router = Router();

// Public: Submit collaboration proposal
router.post('/', CollaborationController.submit);

export default router;
