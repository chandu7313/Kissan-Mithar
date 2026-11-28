import { Request, Response, NextFunction } from 'express';
import { CollaborationService } from '../services/collaboration.service.js';
import { AuthenticatedRequest } from '../types/index.js';
import { AppError } from '../middleware/errorHandler.js';

export class CollaborationController {
  /**
   * Public: Submit a collaboration request
   * POST /api/collaborations
   */
  static async submit(req: Request, res: Response, next: NextFunction) {
    try {
      const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress;
      const result = await CollaborationService.submitProposal(req.body, clientIp);
      res.status(201).json({
        success: true,
        message: 'Collaboration proposal received successfully. Our team will review your proposal.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin: Get authoritative KPI statistics & timeline
   * GET /api/admin/collaborations/stats
   */
  static async getStats(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const stats = await CollaborationService.getStats();
      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin: Search, filter, and paginate requests
   * GET /api/admin/collaborations
   */
  static async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const filter = {
        search: req.query.search as string,
        reviewStatus: req.query.reviewStatus as any,
        verificationStatus: req.query.verificationStatus as any,
        organizationType: req.query.organizationType as string,
        collaborationCategory: req.query.collaborationCategory as string,
        assignedReviewerId: req.query.assignedReviewerId as string,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 10,
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as 'asc' | 'desc',
      };

      const result = await CollaborationService.listRequests(filter);
      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin: Get request detail by ID with audit history and notes
   * GET /api/admin/collaborations/:id
   */
  static async getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const actorId = req.user?.userId;
      const actorName = req.user?.name || req.user?.email || 'Admin Staff';
      const actorRole = req.user?.staffRole || req.user?.role || 'STAFF';

      const request = await CollaborationService.getRequestById(id, actorId, actorName, actorRole);
      res.status(200).json({
        success: true,
        data: request,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin: Assign reviewer to a request
   * PATCH /api/admin/collaborations/:id/assign
   */
  static async assignReviewer(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      // Read-only check
      if (req.user?.staffRole === 'BUSINESS_ANALYST') {
        throw new AppError('Forbidden: Business Analyst role has read-only access', 403);
      }

      const { id } = req.params;
      const { reviewerId, reviewerName } = req.body;

      if (!reviewerId || !reviewerName) {
        throw new AppError('reviewerId and reviewerName are required', 400);
      }

      const actorId = req.user?.userId || 'admin';
      const actorName = req.user?.name || req.user?.email || 'Admin';
      const actorRole = req.user?.staffRole || req.user?.role || 'STAFF';

      const updated = await CollaborationService.assignReviewer(
        id,
        reviewerId,
        reviewerName,
        actorId,
        actorName,
        actorRole
      );

      res.status(200).json({
        success: true,
        message: `Reviewer ${reviewerName} assigned successfully`,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin: Update organization verification status
   * PATCH /api/admin/collaborations/:id/verify
   */
  static async updateVerification(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (req.user?.staffRole === 'BUSINESS_ANALYST') {
        throw new AppError('Forbidden: Business Analyst role has read-only access', 403);
      }

      const { id } = req.params;
      const { verificationStatus, verificationNotes } = req.body;

      if (!verificationStatus) {
        throw new AppError('verificationStatus is required', 400);
      }

      const actorId = req.user?.userId || 'admin';
      const actorName = req.user?.name || req.user?.email || 'Admin';
      const actorRole = req.user?.staffRole || req.user?.role || 'STAFF';

      const updated = await CollaborationService.updateVerificationStatus(id, {
        verificationStatus,
        verificationNotes,
        actorId,
        actorName,
        actorRole,
      });

      res.status(200).json({
        success: true,
        message: `Verification status updated to ${verificationStatus}`,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin: Transition review status (UNDER_REVIEW, NEEDS_INFO, ACCEPTED, REJECTED, CLOSED)
   * PATCH /api/admin/collaborations/:id/review-status
   */
  static async updateReviewStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (req.user?.staffRole === 'BUSINESS_ANALYST') {
        throw new AppError('Forbidden: Business Analyst role has read-only access', 403);
      }

      const { id } = req.params;
      const {
        targetStatus,
        decisionNotes,
        rejectionReason,
        informationRequested,
        expectedConcurrencyVersion,
      } = req.body;

      if (!targetStatus) {
        throw new AppError('targetStatus is required', 400);
      }

      const actorId = req.user?.userId || 'admin';
      const actorName = req.user?.name || req.user?.email || 'Admin';
      const actorRole = req.user?.staffRole || req.user?.role || 'STAFF';

      const updated = await CollaborationService.updateReviewStatus(id, {
        targetStatus,
        decisionNotes,
        rejectionReason,
        informationRequested,
        expectedConcurrencyVersion,
        actorId,
        actorName,
        actorRole,
      });

      res.status(200).json({
        success: true,
        message: `Collaboration request status successfully updated to ${targetStatus}`,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin: Add internal note
   * POST /api/admin/collaborations/:id/notes
   */
  static async addNote(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (req.user?.staffRole === 'BUSINESS_ANALYST') {
        throw new AppError('Forbidden: Business Analyst role has read-only access', 403);
      }

      const { id } = req.params;
      const { note } = req.body;

      if (!note?.trim()) {
        throw new AppError('Note content is required', 400);
      }

      const authorId = req.user?.userId || 'admin';
      const authorName = req.user?.name || req.user?.email || 'Admin Staff';
      const authorRole = req.user?.staffRole || req.user?.role || 'STAFF';

      const createdNote = await CollaborationService.addInternalNote(
        id,
        note,
        authorId,
        authorName,
        authorRole
      );

      res.status(201).json({
        success: true,
        message: 'Internal review note added successfully',
        data: createdNote,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin: Export requests data
   * GET /api/admin/collaborations/export
   */
  static async export(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const filter = {
        search: req.query.search as string,
        reviewStatus: req.query.reviewStatus as any,
        verificationStatus: req.query.verificationStatus as any,
        organizationType: req.query.organizationType as string,
        collaborationCategory: req.query.collaborationCategory as string,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
      };

      const data = await CollaborationService.exportRequests(filter);
      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }
}
