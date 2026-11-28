import { Router } from 'express';
import { AIController } from '../controllers/ai.controller.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

// Chat endpoint (supports both authenticated farmers and guest visitors)
router.post('/chat', optionalAuth, AIController.chat);

// Session endpoints
router.get('/sessions', optionalAuth, AIController.getSessions);
router.post('/sessions', optionalAuth, AIController.createSession);
router.get('/sessions/:id/messages', optionalAuth, AIController.getSessionMessages);
router.delete('/sessions/:id', optionalAuth, AIController.deleteSession);

export default router;
