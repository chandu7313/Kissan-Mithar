import { Router } from 'express';
import { z } from 'zod';
import { AdminController } from '../controllers/admin.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { validateRequest } from '../middleware/validate.js';

const router = Router();

const createAdminSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Valid email address required'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    mobileNumber: z.string().optional(),
    photoUrl: z.string().url().optional(),
  }),
});

const updateAdminSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    email: z.string().email().optional(),
    password: z.string().min(8).optional(),
    mobileNumber: z.string().optional(),
    photoUrl: z.string().url().optional(),
  }),
});

// All admin routes strictly require valid authentication and ADMIN role
router.use(requireAuth);
router.use(requireRole('ADMIN'));

// Administrative user management
router.get('/users', AdminController.listUsers);
router.post('/users', validateRequest(createAdminSchema), AdminController.createUser);
router.patch('/users/:id', validateRequest(updateAdminSchema), AdminController.updateUser);
router.delete('/users/:id', AdminController.deleteUser);

// Infrastructure and telemetry health
router.get('/system-health', AdminController.getSystemHealth);

export default router;
