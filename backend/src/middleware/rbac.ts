import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, UserRole } from '../types/index.js';
import { AppError } from './errorHandler.js';

export const requireRole = (...allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError('Unauthorized: Authentication required', 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError(
          `Forbidden: Role '${req.user.role}' is not authorized to access this resource. Allowed roles: [${allowedRoles.join(', ')}]`,
          403
        )
      );
    }

    next();
  };
};

export const requireStaffRole = (...allowedStaffRoles: string[]) => {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError('Unauthorized: Authentication required', 401));
    }

    // Super Admin and root Admin always have system-wide access
    if (req.user.staffRole === 'SUPER_ADMIN' || req.user.role === 'ADMIN') {
      return next();
    }

    if (req.user.staffRole && allowedStaffRoles.includes(req.user.staffRole)) {
      return next();
    }

    return next(
      new AppError(
        `Forbidden: Staff role '${req.user.staffRole || req.user.role}' is not authorized to access this resource. Allowed roles: [${allowedStaffRoles.join(', ')}]`,
        403
      )
    );
  };
};
