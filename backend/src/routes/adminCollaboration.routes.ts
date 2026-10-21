import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireStaffRole } from '../middleware/rbac.js';
import { CollaborationController } from '../controllers/collaboration.controller.js';

const router = Router();

// Secure all admin collaboration endpoints
router.use(requireAuth);
router.use(requireStaffRole('SUPER_ADMIN', 'SYSTEM_ADMIN', 'OPERATIONS_MANAGER', 'BUSINESS_ANALYST'));

// 1. Authoritative KPI statistics
router.get('/stats', CollaborationController.getStats);

// 2. Export dataset
router.get('/export', CollaborationController.export);

// 3. Searchable, filterable, paginated request list
router.get('/', CollaborationController.list);

// 4. Detailed request view with audit timeline
router.get('/:id', CollaborationController.getById);

// 5. Reviewer assignment
router.patch('/:id/assign', CollaborationController.assignReviewer);

// 6. Organization verification update
router.patch('/:id/verify', CollaborationController.updateVerification);

// 7. Review status transition (UNDER_REVIEW, NEEDS_INFO, ACCEPTED, REJECTED, CLOSED)
router.patch('/:id/review-status', CollaborationController.updateReviewStatus);

// 8. Internal notes
router.post('/:id/notes', CollaborationController.addNote);

export default router;
