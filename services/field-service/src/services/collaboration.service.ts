import { prisma } from '../config/db.js';
import { AppError } from '../middleware/errorHandler.js';
import { CollaborationReviewStatus, CollaborationVerificationStatus } from '@prisma/client';

export interface SubmitCollaborationDto {
  companyName: string;
  contactPerson: string;
  officialEmail: string;
  phoneNumber: string;
  organizationType: string;
  collaborationCategory: string;
  country?: string;
  state: string;
  cityDistrict?: string;
  website?: string;
  proposalDescription: string;
  expectedOutcomes?: string;
  documentUrl?: string;
  documentName?: string;
  documentSizeBytes?: number;
  consentAgreed?: boolean;
}

export interface ListCollaborationsFilter {
  search?: string;
  reviewStatus?: CollaborationReviewStatus;
  verificationStatus?: CollaborationVerificationStatus;
  organizationType?: string;
  collaborationCategory?: string;
  assignedReviewerId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface VerificationUpdateDto {
  verificationStatus: CollaborationVerificationStatus;
  verificationNotes?: string;
  actorId: string;
  actorName: string;
  actorRole: string;
}

export interface ReviewStatusUpdateDto {
  targetStatus: CollaborationReviewStatus;
  decisionNotes?: string;
  rejectionReason?: string;
  informationRequested?: string;
  expectedConcurrencyVersion?: number;
  actorId: string;
  actorName: string;
  actorRole: string;
}

export class CollaborationService {
  /**
   * Generates a human-friendly unique reference code: KM-COL-YYYYMM-XXXX
   */
  private static generateReferenceId(): string {
    const datePrefix = new Date().toISOString().slice(0, 7).replace('-', '');
    const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
    return `KM-COL-${datePrefix}-${randomSuffix}`;
  }

  /**
   * Public submission of a collaboration proposal
   */
  static async submitProposal(dto: SubmitCollaborationDto, ip?: string) {
    if (!dto.companyName?.trim()) throw new AppError('Company or organization name is required', 400);
    if (!dto.contactPerson?.trim()) throw new AppError('Contact person name is required', 400);
    if (!dto.officialEmail?.trim()) throw new AppError('Official email address is required', 400);
    if (!dto.phoneNumber?.trim()) throw new AppError('Phone number is required', 400);
    if (!dto.organizationType?.trim()) throw new AppError('Organization type is required', 400);
    if (!dto.collaborationCategory?.trim()) throw new AppError('Collaboration category is required', 400);
    if (!dto.state?.trim()) throw new AppError('State / region is required', 400);
    if (!dto.proposalDescription?.trim()) throw new AppError('Proposal description is required', 400);

    const referenceId = this.generateReferenceId();

    const created = await prisma.collaborationRequest.create({
      data: {
        referenceId,
        companyName: dto.companyName.trim(),
        contactPerson: dto.contactPerson.trim(),
        officialEmail: dto.officialEmail.trim().toLowerCase(),
        phoneNumber: dto.phoneNumber.trim(),
        organizationType: dto.organizationType.trim(),
        collaborationCategory: dto.collaborationCategory.trim(),
        country: dto.country?.trim() || 'India',
        state: dto.state.trim(),
        cityDistrict: dto.cityDistrict?.trim() || null,
        website: dto.website?.trim() || null,
        proposalDescription: dto.proposalDescription.trim(),
        expectedOutcomes: dto.expectedOutcomes?.trim() || null,
        documentUrl: dto.documentUrl?.trim() || null,
        documentName: dto.documentName?.trim() || null,
        documentSizeBytes: dto.documentSizeBytes || null,
        consentAgreed: dto.consentAgreed ?? true,
        verificationStatus: 'NOT_VERIFIED',
        reviewStatus: 'NEW',
        history: {
          create: {
            action: 'SUBMITTED',
            newState: {
              reviewStatus: 'NEW',
              verificationStatus: 'NOT_VERIFIED',
            },
            reason: 'Proposal submitted via Kissan Mithar public portal',
            actorName: dto.contactPerson.trim(),
            actorRole: 'EXTERNAL_APPLICANT',
          },
        },
      },
    });

    return {
      id: created.id,
      referenceId: created.referenceId,
      companyName: created.companyName,
      reviewStatus: created.reviewStatus,
      submittedAt: created.submittedAt,
    };
  }

  /**
   * Authoritative KPI statistics calculated from PostgreSQL
   */
  static async getStats() {
    const [
      total,
      newRequests,
      underReview,
      needsInfo,
      accepted,
      rejected,
      closed,
      verifiedCount,
      categoriesGroup,
      orgTypesGroup,
    ] = await Promise.all([
      prisma.collaborationRequest.count(),
      prisma.collaborationRequest.count({ where: { reviewStatus: 'NEW' } }),
      prisma.collaborationRequest.count({ where: { reviewStatus: 'UNDER_REVIEW' } }),
      prisma.collaborationRequest.count({ where: { reviewStatus: 'NEEDS_INFORMATION' } }),
      prisma.collaborationRequest.count({ where: { reviewStatus: 'ACCEPTED' } }),
      prisma.collaborationRequest.count({ where: { reviewStatus: 'REJECTED' } }),
      prisma.collaborationRequest.count({ where: { reviewStatus: 'CLOSED' } }),
      prisma.collaborationRequest.count({ where: { verificationStatus: 'VERIFIED' } }),
      prisma.collaborationRequest.groupBy({
        by: ['collaborationCategory'],
        _count: { id: true },
      }),
      prisma.collaborationRequest.groupBy({
        by: ['organizationType'],
        _count: { id: true },
      }),
    ]);

    // Monthly submission timeline for past 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const timelineRecords = await prisma.collaborationRequest.findMany({
      where: { submittedAt: { gte: sixMonthsAgo } },
      select: { submittedAt: true, reviewStatus: true },
    });

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyMap: Record<string, { month: string; total: number; accepted: number; pending: number }> = {};

    for (let i = 0; i < 6; i++) {
      const d = new Date(sixMonthsAgo);
      d.setMonth(d.getMonth() + i);
      const key = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().slice(2)}`;
      monthlyMap[key] = { month: key, total: 0, accepted: 0, pending: 0 };
    }

    timelineRecords.forEach((r) => {
      const d = new Date(r.submittedAt);
      const key = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().slice(2)}`;
      if (monthlyMap[key]) {
        monthlyMap[key].total += 1;
        if (r.reviewStatus === 'ACCEPTED') {
          monthlyMap[key].accepted += 1;
        } else if (r.reviewStatus === 'NEW' || r.reviewStatus === 'UNDER_REVIEW') {
          monthlyMap[key].pending += 1;
        }
      }
    });

    return {
      kpis: {
        totalRequests: total,
        newRequests,
        underReview,
        needsInformation: needsInfo,
        accepted,
        rejected,
        closed,
        verifiedCount,
        pendingReviewCount: newRequests + underReview,
      },
      categoryDistribution: categoriesGroup.map((c) => ({
        category: c.collaborationCategory,
        count: c._count.id,
      })),
      organizationTypes: orgTypesGroup.map((o) => ({
        type: o.organizationType,
        count: o._count.id,
      })),
      timeline: Object.values(monthlyMap),
    };
  }

  /**
   * Search, filter, and paginate requests with server-side query limits
   */
  static async listRequests(filter: ListCollaborationsFilter) {
    const page = Math.max(1, Number(filter.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(filter.limit) || 10));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filter.search?.trim()) {
      const query = filter.search.trim();
      where.OR = [
        { companyName: { contains: query, mode: 'insensitive' } },
        { contactPerson: { contains: query, mode: 'insensitive' } },
        { officialEmail: { contains: query, mode: 'insensitive' } },
        { referenceId: { contains: query, mode: 'insensitive' } },
        { cityDistrict: { contains: query, mode: 'insensitive' } },
        { state: { contains: query, mode: 'insensitive' } },
      ];
    }

    if (filter.reviewStatus) {
      where.reviewStatus = filter.reviewStatus;
    }

    if (filter.verificationStatus) {
      where.verificationStatus = filter.verificationStatus;
    }

    if (filter.organizationType) {
      where.organizationType = filter.organizationType;
    }

    if (filter.collaborationCategory) {
      where.collaborationCategory = filter.collaborationCategory;
    }

    if (filter.assignedReviewerId) {
      where.assignedReviewerId = filter.assignedReviewerId;
    }

    if (filter.startDate || filter.endDate) {
      where.submittedAt = {};
      if (filter.startDate) where.submittedAt.gte = new Date(filter.startDate);
      if (filter.endDate) where.submittedAt.lte = new Date(filter.endDate);
    }

    const sortField = filter.sortBy || 'submittedAt';
    const sortDirection = filter.sortOrder || 'desc';

    const [total, requests] = await Promise.all([
      prisma.collaborationRequest.count({ where }),
      prisma.collaborationRequest.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortField]: sortDirection },
        select: {
          id: true,
          referenceId: true,
          companyName: true,
          contactPerson: true,
          officialEmail: true,
          phoneNumber: true,
          organizationType: true,
          collaborationCategory: true,
          country: true,
          state: true,
          cityDistrict: true,
          website: true,
          verificationStatus: true,
          reviewStatus: true,
          assignedReviewerId: true,
          assignedReviewerName: true,
          concurrencyVersion: true,
          submittedAt: true,
          updatedAt: true,
        },
      }),
    ]);

    return {
      data: requests,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get request detail by ID, including audit trail and internal notes
   */
  static async getRequestById(id: string, actorId?: string, actorName?: string, actorRole?: string) {
    const request = await prisma.collaborationRequest.findUnique({
      where: { id },
      include: {
        history: {
          orderBy: { createdAt: 'desc' },
        },
        notes: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!request) {
      throw new AppError('Collaboration request not found', 404);
    }

    // Record VIEWED event if viewing by authorized staff for audit compliance
    if (actorId && actorName) {
      await prisma.collaborationAuditLog.create({
        data: {
          requestId: id,
          action: 'VIEWED',
          actorId,
          actorName,
          actorRole,
          reason: 'Viewed collaboration request detail',
        },
      });
    }

    return request;
  }

  /**
   * Assign or reassign reviewer
   */
  static async assignReviewer(
    requestId: string,
    reviewerId: string,
    reviewerName: string,
    actorId: string,
    actorName: string,
    actorRole: string
  ) {
    const existing = await prisma.collaborationRequest.findUnique({ where: { id: requestId } });
    if (!existing) throw new AppError('Collaboration request not found', 404);

    const prevReviewer = existing.assignedReviewerName || 'None';

    const updated = await prisma.collaborationRequest.update({
      where: { id: requestId },
      data: {
        assignedReviewerId: reviewerId,
        assignedReviewerName: reviewerName,
        concurrencyVersion: { increment: 1 },
        history: {
          create: {
            action: 'REVIEWER_ASSIGNED',
            previousState: { assignedReviewer: prevReviewer },
            newState: { assignedReviewer: reviewerName },
            reason: `Reviewer assigned by ${actorName}`,
            actorId,
            actorName,
            actorRole,
          },
        },
      },
    });

    return updated;
  }

  /**
   * Perform verification update
   */
  static async updateVerificationStatus(requestId: string, dto: VerificationUpdateDto) {
    const existing = await prisma.collaborationRequest.findUnique({ where: { id: requestId } });
    if (!existing) throw new AppError('Collaboration request not found', 404);

    const validVerificationStatuses: CollaborationVerificationStatus[] = [
      'NOT_VERIFIED',
      'IN_PROGRESS',
      'VERIFIED',
      'VERIFICATION_FAILED',
    ];

    if (!validVerificationStatuses.includes(dto.verificationStatus)) {
      throw new AppError(`Invalid verification status: ${dto.verificationStatus}`, 400);
    }

    const prevVerification = existing.verificationStatus;

    const updated = await prisma.collaborationRequest.update({
      where: { id: requestId },
      data: {
        verificationStatus: dto.verificationStatus,
        verificationNotes: dto.verificationNotes ?? existing.verificationNotes,
        verifiedByAdminId: dto.actorId,
        verifiedAt: new Date(),
        concurrencyVersion: { increment: 1 },
        history: {
          create: {
            action: 'VERIFICATION_STATUS_CHANGED',
            previousState: { verificationStatus: prevVerification },
            newState: { verificationStatus: dto.verificationStatus },
            reason: dto.verificationNotes || `Verification updated to ${dto.verificationStatus}`,
            actorId: dto.actorId,
            actorName: dto.actorName,
            actorRole: dto.actorRole,
          },
        },
      },
    });

    return updated;
  }

  /**
   * Update review status with strict state machine validation and concurrency protection
   */
  static async updateReviewStatus(requestId: string, dto: ReviewStatusUpdateDto) {
    const existing = await prisma.collaborationRequest.findUnique({ where: { id: requestId } });
    if (!existing) throw new AppError('Collaboration request not found', 404);

    // Optimistic Concurrency Control: verify version matches if supplied
    if (
      dto.expectedConcurrencyVersion !== undefined &&
      existing.concurrencyVersion !== dto.expectedConcurrencyVersion
    ) {
      throw new AppError(
        'Concurrent update conflict: This request was modified by another reviewer. Please refresh and review latest status.',
        409
      );
    }

    const current = existing.reviewStatus;
    const target = dto.targetStatus;

    // Strict State Machine Transitions
    const allowedTransitions: Record<CollaborationReviewStatus, CollaborationReviewStatus[]> = {
      NEW: ['UNDER_REVIEW', 'CLOSED'],
      UNDER_REVIEW: ['NEEDS_INFORMATION', 'ACCEPTED', 'REJECTED', 'CLOSED'],
      NEEDS_INFORMATION: ['UNDER_REVIEW', 'ACCEPTED', 'REJECTED', 'CLOSED'],
      ACCEPTED: ['CLOSED', 'UNDER_REVIEW'],
      REJECTED: ['CLOSED', 'UNDER_REVIEW'],
      CLOSED: ['UNDER_REVIEW'],
    };

    if (!allowedTransitions[current]?.includes(target)) {
      throw new AppError(
        `Illegal status transition: Cannot change collaboration review status from '${current}' to '${target}'.`,
        400
      );
    }

    // Mandatory preconditions:
    // 1. Acceptance requires VERIFIED organization (unless Super Admin bypass note is provided)
    if (target === 'ACCEPTED') {
      if (existing.verificationStatus !== 'VERIFIED') {
        throw new AppError(
          `Cannot accept collaboration request: Organization is currently '${existing.verificationStatus}'. Verification must be completed and marked 'VERIFIED' before acceptance.`,
          400
        );
      }
      if (!dto.decisionNotes?.trim()) {
        throw new AppError('A decision note explaining the collaboration rationale is mandatory for acceptance.', 400);
      }
    }

    // 2. Rejection requires a mandatory reason
    if (target === 'REJECTED' && !dto.rejectionReason?.trim() && !dto.decisionNotes?.trim()) {
      throw new AppError('A rejection reason or reviewer explanation is mandatory when rejecting a proposal.', 400);
    }

    // 3. Needs Information requires explanation of what details are required
    if (target === 'NEEDS_INFORMATION' && !dto.informationRequested?.trim() && !dto.decisionNotes?.trim()) {
      throw new AppError('Please specify what additional information is required from the organization.', 400);
    }

    // 4. Closed requires confirmation note
    if (target === 'CLOSED' && !dto.decisionNotes?.trim()) {
      throw new AppError('A closure note is required explaining why this request is being closed.', 400);
    }

    const updated = await prisma.collaborationRequest.update({
      where: { id: requestId },
      data: {
        reviewStatus: target,
        decisionNotes: dto.decisionNotes?.trim() || existing.decisionNotes,
        rejectionReason: dto.rejectionReason?.trim() || (target === 'REJECTED' ? dto.decisionNotes?.trim() : existing.rejectionReason),
        informationRequested: dto.informationRequested?.trim() || existing.informationRequested,
        decidedByAdminId: dto.actorId,
        decidedAt: new Date(),
        concurrencyVersion: { increment: 1 },
        history: {
          create: {
            action: target === 'ACCEPTED' ? 'ACCEPTED' : target === 'REJECTED' ? 'REJECTED' : 'STATUS_CHANGED',
            previousState: { reviewStatus: current },
            newState: { reviewStatus: target },
            reason: dto.decisionNotes || dto.rejectionReason || dto.informationRequested || `Status transitioned to ${target}`,
            actorId: dto.actorId,
            actorName: dto.actorName,
            actorRole: dto.actorRole,
          },
        },
      },
    });

    return updated;
  }

  /**
   * Add internal staff note to collaboration proposal
   */
  static async addInternalNote(
    requestId: string,
    noteText: string,
    authorId: string,
    authorName: string,
    authorRole: string
  ) {
    if (!noteText?.trim()) throw new AppError('Note text cannot be empty', 400);

    const existing = await prisma.collaborationRequest.findUnique({ where: { id: requestId } });
    if (!existing) throw new AppError('Collaboration request not found', 404);

    const note = await prisma.collaborationInternalNote.create({
      data: {
        requestId,
        authorId,
        authorName,
        authorRole,
        note: noteText.trim(),
      },
    });

    await prisma.collaborationAuditLog.create({
      data: {
        requestId,
        action: 'NOTE_ADDED',
        reason: 'Internal review note added',
        actorId: authorId,
        actorName: authorName,
        actorRole: authorRole,
      },
    });

    return note;
  }

  /**
   * Export all collaboration requests matching criteria
   */
  static async exportRequests(filter: ListCollaborationsFilter) {
    const listResult = await this.listRequests({ ...filter, page: 1, limit: 1000 });
    return listResult.data;
  }
}
