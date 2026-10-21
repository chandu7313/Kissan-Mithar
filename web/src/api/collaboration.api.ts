import { apiClient } from './client.js';

export interface CollaborationSubmitPayload {
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

export interface CollaborationItem {
  id: string;
  referenceId: string;
  companyName: string;
  contactPerson: string;
  officialEmail: string;
  phoneNumber: string;
  organizationType: string;
  collaborationCategory: string;
  country: string;
  state: string;
  cityDistrict?: string | null;
  website?: string | null;
  proposalDescription?: string;
  expectedOutcomes?: string | null;
  documentUrl?: string | null;
  documentName?: string | null;
  documentSizeBytes?: number | null;
  consentAgreed?: boolean;
  verificationStatus: 'NOT_VERIFIED' | 'IN_PROGRESS' | 'VERIFIED' | 'VERIFICATION_FAILED';
  verificationNotes?: string | null;
  verifiedByAdminId?: string | null;
  verifiedAt?: string | null;
  reviewStatus: 'NEW' | 'UNDER_REVIEW' | 'NEEDS_INFORMATION' | 'ACCEPTED' | 'REJECTED' | 'CLOSED';
  assignedReviewerId?: string | null;
  assignedReviewerName?: string | null;
  decisionNotes?: string | null;
  rejectionReason?: string | null;
  informationRequested?: string | null;
  decidedByAdminId?: string | null;
  decidedAt?: string | null;
  concurrencyVersion: number;
  submittedAt: string;
  updatedAt: string;
  history?: Array<{
    id: string;
    action: string;
    previousState?: any;
    newState?: any;
    reason?: string | null;
    actorName?: string | null;
    actorRole?: string | null;
    createdAt: string;
  }>;
  notes?: Array<{
    id: string;
    authorName: string;
    authorRole: string;
    note: string;
    createdAt: string;
  }>;
}

export interface CollaborationStats {
  kpis: {
    totalRequests: number;
    newRequests: number;
    underReview: number;
    needsInformation: number;
    accepted: number;
    rejected: number;
    closed: number;
    verifiedCount: number;
    pendingReviewCount: number;
  };
  categoryDistribution: Array<{ category: string; count: number }>;
  organizationTypes: Array<{ type: string; count: number }>;
  timeline: Array<{ month: string; total: number; accepted: number; pending: number }>;
}

export interface CollaborationListFilter {
  search?: string;
  reviewStatus?: string;
  verificationStatus?: string;
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

export class CollaborationApi {
  /**
   * Public: Submit a collaboration request
   */
  static async submit(payload: CollaborationSubmitPayload) {
    const res = await apiClient.post('/collaborations', payload);
    return res.data;
  }

  /**
   * Admin: Get stats
   */
  static async getStats(): Promise<CollaborationStats> {
    const res = await apiClient.get('/admin/collaborations/stats');
    return res.data.data;
  }

  /**
   * Admin: List requests
   */
  static async list(filter: CollaborationListFilter = {}) {
    const res = await apiClient.get('/admin/collaborations', { params: filter });
    return res.data;
  }

  /**
   * Admin: Get request detail
   */
  static async getById(id: string): Promise<CollaborationItem> {
    const res = await apiClient.get(`/admin/collaborations/${id}`);
    return res.data.data;
  }

  /**
   * Admin: Assign reviewer
   */
  static async assignReviewer(id: string, reviewerId: string, reviewerName: string) {
    const res = await apiClient.patch(`/admin/collaborations/${id}/assign`, {
      reviewerId,
      reviewerName,
    });
    return res.data;
  }

  /**
   * Admin: Update verification status
   */
  static async updateVerification(
    id: string,
    verificationStatus: 'NOT_VERIFIED' | 'IN_PROGRESS' | 'VERIFIED' | 'VERIFICATION_FAILED',
    verificationNotes?: string
  ) {
    const res = await apiClient.patch(`/admin/collaborations/${id}/verify`, {
      verificationStatus,
      verificationNotes,
    });
    return res.data;
  }

  /**
   * Admin: Update review status
   */
  static async updateReviewStatus(
    id: string,
    targetStatus: 'UNDER_REVIEW' | 'NEEDS_INFORMATION' | 'ACCEPTED' | 'REJECTED' | 'CLOSED',
    payload: {
      decisionNotes?: string;
      rejectionReason?: string;
      informationRequested?: string;
      expectedConcurrencyVersion?: number;
    }
  ) {
    const res = await apiClient.patch(`/admin/collaborations/${id}/review-status`, {
      targetStatus,
      ...payload,
    });
    return res.data;
  }

  /**
   * Admin: Add internal note
   */
  static async addNote(id: string, note: string) {
    const res = await apiClient.post(`/admin/collaborations/${id}/notes`, { note });
    return res.data;
  }

  /**
   * Admin: Export records
   */
  static async export(filter: CollaborationListFilter = {}) {
    const res = await apiClient.get('/admin/collaborations/export', { params: filter });
    return res.data.data;
  }
}
