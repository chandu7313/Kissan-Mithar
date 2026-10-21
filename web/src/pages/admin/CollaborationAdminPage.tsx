import React, { useState, useEffect, useCallback } from 'react';
import {
  Handshake, Search, Filter, RefreshCw, Download, CheckCircle2,
  XCircle, Clock, AlertCircle, Eye, UserCheck, ShieldAlert,
  ArrowRight, Building2, User, Mail, Phone, Globe, MapPin,
  FileText, Calendar, MessageSquare, AlertTriangle, ChevronLeft,
  ChevronRight, ExternalLink, ShieldCheck, Check, Send, X,
  CheckCircle, HelpCircle, Lock, Loader2, Sparkles, BarChart2
} from 'lucide-react';
import {
  CollaborationApi,
  CollaborationItem,
  CollaborationStats,
  CollaborationListFilter,
} from '../../api/collaboration.api.js';
import { UserSession } from '../../types/index.js';

interface Props {
  session?: UserSession;
}

const REVIEW_STATUS_LABELS: Record<string, { label: string; bg: string; color: string; border: string }> = {
  NEW: { label: 'New Request', bg: '#fef3c7', color: '#92400e', border: '#fde68a' },
  UNDER_REVIEW: { label: 'Under Review', bg: '#e0f2fe', color: '#0369a1', border: '#bae6fd' },
  NEEDS_INFORMATION: { label: 'Needs Info', bg: '#f3e8ff', color: '#6b21a8', border: '#e9d5ff' },
  ACCEPTED: { label: 'Accepted', bg: '#dcfce7', color: '#15803d', border: '#bbf7d0' },
  REJECTED: { label: 'Rejected', bg: '#fee2e2', color: '#991b1b', border: '#fecaca' },
  CLOSED: { label: 'Closed', bg: '#f1f5f9', color: '#475569', border: '#cbd5e1' },
};

const VERIFICATION_STATUS_LABELS: Record<string, { label: string; bg: string; color: string; border: string }> = {
  NOT_VERIFIED: { label: 'Not Verified', bg: '#f1f5f9', color: '#475569', border: '#e2e8f0' },
  IN_PROGRESS: { label: 'Verifying', bg: '#e0f2fe', color: '#0284c7', border: '#bae6fd' },
  VERIFIED: { label: 'Verified', bg: '#dcfce7', color: '#16a34a', border: '#bbf7d0' },
  VERIFICATION_FAILED: { label: 'Failed', bg: '#fef2f2', color: '#dc2626', border: '#fecaca' },
};

export const CollaborationAdminPage: React.FC<Props> = ({ session }) => {
  const isReadOnly = session?.staffRole === 'BUSINESS_ANALYST';

  // Stats State
  const [stats, setStats] = useState<CollaborationStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Table State
  const [requests, setRequests] = useState<CollaborationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });

  // Filters State
  const [search, setSearch] = useState('');
  const [reviewStatus, setReviewStatus] = useState<string>('ALL');
  const [verificationStatus, setVerificationStatus] = useState<string>('ALL');
  const [organizationType, setOrganizationType] = useState<string>('ALL');
  const [collaborationCategory, setCollaborationCategory] = useState<string>('ALL');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Drawer / Modal State
  const [selectedRequest, setSelectedRequest] = useState<CollaborationItem | null>(null);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [drawerError, setDrawerError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Verification Form inside drawer
  const [targetVerificationStatus, setTargetVerificationStatus] = useState<'NOT_VERIFIED' | 'IN_PROGRESS' | 'VERIFIED' | 'VERIFICATION_FAILED'>('NOT_VERIFIED');
  const [verificationNotes, setVerificationNotes] = useState('');
  const [updatingVerification, setUpdatingVerification] = useState(false);

  // Internal Note inside drawer
  const [newNote, setNewNote] = useState('');
  const [submittingNote, setSubmittingNote] = useState(false);

  // Decision Dialogs
  const [confirmDialog, setConfirmDialog] = useState<{
    type: 'ACCEPT' | 'REJECT' | 'NEEDS_INFO' | 'CLOSE' | 'START_REVIEW';
    title: string;
    description: string;
    inputLabel?: string;
    inputValue: string;
    requireVerificationCheck?: boolean;
  } | null>(null);
  const [executingDecision, setExecutingDecision] = useState(false);

  // Fetch KPI statistics
  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const data = await CollaborationApi.getStats();
      setStats(data);
    } catch (err: any) {
      console.error('Failed to fetch collaboration stats:', err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // Fetch requests list
  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const filter: CollaborationListFilter = {
        page: pagination.page,
        limit: pagination.limit,
        sortOrder,
        sortBy: 'submittedAt',
      };

      if (search.trim()) filter.search = search.trim();
      if (reviewStatus !== 'ALL') filter.reviewStatus = reviewStatus;
      if (verificationStatus !== 'ALL') filter.verificationStatus = verificationStatus;
      if (organizationType !== 'ALL') filter.organizationType = organizationType;
      if (collaborationCategory !== 'ALL') filter.collaborationCategory = collaborationCategory;

      const res = await CollaborationApi.list(filter);
      setRequests(res.data);
      if (res.pagination) {
        setPagination({
          page: res.pagination.page,
          limit: res.pagination.limit,
          total: res.pagination.total,
          totalPages: res.pagination.totalPages,
        });
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || err.message || 'Failed to fetch collaboration requests');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, search, reviewStatus, verificationStatus, organizationType, collaborationCategory, sortOrder]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Open detail drawer and fetch full item with history & notes
  const handleOpenDetail = async (id: string) => {
    try {
      setDrawerLoading(true);
      setDrawerError(null);
      setActionSuccess(null);
      const fullItem = await CollaborationApi.getById(id);
      setSelectedRequest(fullItem);
      setTargetVerificationStatus(fullItem.verificationStatus);
      setVerificationNotes(fullItem.verificationNotes || '');
    } catch (err: any) {
      setDrawerError(err.response?.data?.error?.message || err.message || 'Failed to load request details');
    } finally {
      setDrawerLoading(false);
    }
  };

  // Close drawer
  const handleCloseDetail = () => {
    setSelectedRequest(null);
    setDrawerError(null);
    setActionSuccess(null);
    setConfirmDialog(null);
  };

  // Handle Verification Update
  const handleSaveVerification = async () => {
    if (!selectedRequest) return;
    try {
      setUpdatingVerification(true);
      setDrawerError(null);
      setActionSuccess(null);
      await CollaborationApi.updateVerification(selectedRequest.id, targetVerificationStatus, verificationNotes);
      setActionSuccess(`Verification status successfully updated to ${targetVerificationStatus}.`);
      // Refresh current item
      const refreshed = await CollaborationApi.getById(selectedRequest.id);
      setSelectedRequest(refreshed);
      fetchStats();
      fetchRequests();
    } catch (err: any) {
      setDrawerError(err.response?.data?.error?.message || err.message || 'Failed to update verification status');
    } finally {
      setUpdatingVerification(false);
    }
  };

  // Handle Internal Note Submission
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest || !newNote.trim()) return;
    try {
      setSubmittingNote(true);
      setDrawerError(null);
      await CollaborationApi.addNote(selectedRequest.id, newNote.trim());
      setNewNote('');
      const refreshed = await CollaborationApi.getById(selectedRequest.id);
      setSelectedRequest(refreshed);
    } catch (err: any) {
      setDrawerError(err.response?.data?.error?.message || err.message || 'Failed to add internal note');
    } finally {
      setSubmittingNote(false);
    }
  };

  // Trigger Decision Confirmation Dialog
  const triggerDecision = (
    type: 'START_REVIEW' | 'ACCEPT' | 'REJECT' | 'NEEDS_INFO' | 'CLOSE',
    title: string,
    description: string,
    inputLabel?: string,
    requireVerificationCheck = false
  ) => {
    setConfirmDialog({
      type,
      title,
      description,
      inputLabel,
      inputValue: '',
      requireVerificationCheck,
    });
  };

  // Execute Review Status Update
  const handleExecuteDecision = async () => {
    if (!selectedRequest || !confirmDialog) return;

    const { type, inputValue, requireVerificationCheck } = confirmDialog;

    // Client-side verification check
    if (requireVerificationCheck && selectedRequest.verificationStatus !== 'VERIFIED') {
      setDrawerError("Organization must be marked 'VERIFIED' before accepting collaboration proposal.");
      return;
    }

    if (type === 'REJECT' && !inputValue.trim()) {
      setDrawerError('A rejection reason or explanation is mandatory.');
      return;
    }

    if (type === 'NEEDS_INFO' && !inputValue.trim()) {
      setDrawerError('Please specify what additional information is required.');
      return;
    }

    if (type === 'ACCEPT' && !inputValue.trim()) {
      setDrawerError('A decision note explaining the collaboration rationale is mandatory for acceptance.');
      return;
    }

    try {
      setExecutingDecision(true);
      setDrawerError(null);
      setActionSuccess(null);

      let targetStatus: 'UNDER_REVIEW' | 'NEEDS_INFORMATION' | 'ACCEPTED' | 'REJECTED' | 'CLOSED' = 'UNDER_REVIEW';
      let payload: any = {
        expectedConcurrencyVersion: selectedRequest.concurrencyVersion,
      };

      if (type === 'START_REVIEW') {
        targetStatus = 'UNDER_REVIEW';
        payload.decisionNotes = 'Staff initiated administrative review';
      } else if (type === 'ACCEPT') {
        targetStatus = 'ACCEPTED';
        payload.decisionNotes = inputValue.trim();
      } else if (type === 'REJECT') {
        targetStatus = 'REJECTED';
        payload.rejectionReason = inputValue.trim();
        payload.decisionNotes = inputValue.trim();
      } else if (type === 'NEEDS_INFO') {
        targetStatus = 'NEEDS_INFORMATION';
        payload.informationRequested = inputValue.trim();
        payload.decisionNotes = inputValue.trim();
      } else if (type === 'CLOSE') {
        targetStatus = 'CLOSED';
        payload.decisionNotes = inputValue.trim() || 'Workflow closed by reviewer';
      }

      await CollaborationApi.updateReviewStatus(selectedRequest.id, targetStatus, payload);
      setActionSuccess(`Proposal review status successfully updated to ${targetStatus}.`);
      setConfirmDialog(null);

      const refreshed = await CollaborationApi.getById(selectedRequest.id);
      setSelectedRequest(refreshed);
      fetchStats();
      fetchRequests();
    } catch (err: any) {
      setDrawerError(err.response?.data?.error?.message || err.message || 'Failed to update review status');
    } finally {
      setExecutingDecision(false);
    }
  };

  // Export CSV
  const handleExport = async () => {
    try {
      const data = await CollaborationApi.export();
      if (!data || data.length === 0) {
        alert('No records available to export.');
        return;
      }

      const headers = [
        'Reference ID', 'Company Name', 'Contact Person', 'Email', 'Phone',
        'Org Type', 'Category', 'Country', 'State', 'City/District',
        'Verification Status', 'Review Status', 'Reviewer', 'Submitted At'
      ];

      const rows = data.map((r: any) => [
        `"${r.referenceId || ''}"`,
        `"${(r.companyName || '').replace(/"/g, '""')}"`,
        `"${(r.contactPerson || '').replace(/"/g, '""')}"`,
        `"${r.officialEmail || ''}"`,
        `"${r.phoneNumber || ''}"`,
        `"${(r.organizationType || '').replace(/"/g, '""')}"`,
        `"${(r.collaborationCategory || '').replace(/"/g, '""')}"`,
        `"${r.country || ''}"`,
        `"${r.state || ''}"`,
        `"${r.cityDistrict || ''}"`,
        `"${r.verificationStatus || ''}"`,
        `"${r.reviewStatus || ''}"`,
        `"${r.assignedReviewerName || ''}"`,
        `"${new Date(r.submittedAt).toISOString()}"`,
      ]);

      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e: string[]) => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `kissan_mithar_collaborations_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err: any) {
      alert('Failed to export dataset: ' + err.message);
    }
  };

  return (
    <div style={{ padding: '1.75rem', backgroundColor: '#f8fafc', minHeight: '100%', boxSizing: 'border-box' }}>
      {/* 1. Header Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: '#dcfce7',
                color: '#16a34a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Handshake size={20} />
            </div>
            <div>
              <h1
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1.5rem',
                  fontWeight: 800,
                  color: '#0f172a',
                  margin: 0,
                  letterSpacing: '-0.02em',
                }}
              >
                Collaboration Requests
              </h1>
              <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: '0.2rem 0 0 0' }}>
                Review, verify, and manage partnership proposals from external companies and organizations.
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {isReadOnly && (
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#475569',
                backgroundColor: '#e2e8f0',
                padding: '0.35rem 0.75rem',
                borderRadius: '6px',
              }}
            >
              Auditor View: Read-Only
            </span>
          )}

          <button
            type="button"
            onClick={handleExport}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.55rem 0.95rem',
              borderRadius: '8px',
              backgroundColor: '#ffffff',
              border: '1px solid #cbd5e1',
              color: '#334155',
              fontSize: '0.8125rem',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
            }}
          >
            <Download size={15} />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={() => {
              fetchStats();
              fetchRequests();
            }}
            disabled={loading || statsLoading}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.55rem 0.95rem',
              borderRadius: '8px',
              backgroundColor: '#15803d',
              border: 'none',
              color: '#ffffff',
              fontSize: '0.8125rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(21, 128, 61, 0.25)',
            }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* 2. Authoritative KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        {/* Card 1: Total */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            padding: '1.25rem',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#64748b' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Total Requests</span>
            <FileText size={16} color="#64748b" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', marginTop: '0.35rem' }}>
            {statsLoading ? '...' : stats?.kpis.totalRequests ?? 0}
          </div>
          <div style={{ fontSize: '0.6875rem', color: '#64748b', marginTop: '0.25rem' }}>
            All-time proposals received
          </div>
        </div>

        {/* Card 2: New Requests */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #fef08a',
            padding: '1.25rem',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#92400e' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>New Awaiting Review</span>
            <Clock size={16} color="#d97706" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#b45309', marginTop: '0.35rem' }}>
            {statsLoading ? '...' : stats?.kpis.newRequests ?? 0}
          </div>
          <div style={{ fontSize: '0.6875rem', color: '#b45309', marginTop: '0.25rem' }}>
            Needs initial assessment
          </div>
        </div>

        {/* Card 3: Under Review */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #bae6fd',
            padding: '1.25rem',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#0369a1' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Under Review</span>
            <Eye size={16} color="#0284c7" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0284c7', marginTop: '0.35rem' }}>
            {statsLoading ? '...' : stats?.kpis.underReview ?? 0}
          </div>
          <div style={{ fontSize: '0.6875rem', color: '#0369a1', marginTop: '0.25rem' }}>
            Active discussions & evaluation
          </div>
        </div>

        {/* Card 4: Accepted */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #bbf7d0',
            padding: '1.25rem',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#15803d' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Accepted</span>
            <CheckCircle2 size={16} color="#16a34a" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#16a34a', marginTop: '0.35rem' }}>
            {statsLoading ? '...' : stats?.kpis.accepted ?? 0}
          </div>
          <div style={{ fontSize: '0.6875rem', color: '#15803d', marginTop: '0.25rem' }}>
            Partnerships confirmed
          </div>
        </div>

        {/* Card 5: Rejected */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #fecaca',
            padding: '1.25rem',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#991b1b' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Rejected</span>
            <XCircle size={16} color="#dc2626" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#dc2626', marginTop: '0.35rem' }}>
            {statsLoading ? '...' : stats?.kpis.rejected ?? 0}
          </div>
          <div style={{ fontSize: '0.6875rem', color: '#991b1b', marginTop: '0.25rem' }}>
            Preserved in archive with reason
          </div>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          padding: '1rem',
          marginBottom: '1.25rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '0.75rem',
          boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
        }}
      >
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 220px' }}>
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPagination((p) => ({ ...p, page: 1 }));
            }}
            placeholder="Search by company, contact, email, ID..."
            style={{
              width: '100%',
              padding: '0.55rem 0.75rem 0.55rem 2.2rem',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '0.8125rem',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
        </div>

        {/* Review Status Filter */}
        <select
          value={reviewStatus}
          onChange={(e) => {
            setReviewStatus(e.target.value);
            setPagination((p) => ({ ...p, page: 1 }));
          }}
          style={{
            padding: '0.55rem 0.75rem',
            borderRadius: '8px',
            border: '1px solid #cbd5e1',
            fontSize: '0.8125rem',
            backgroundColor: '#ffffff',
            outline: 'none',
            color: '#334155',
          }}
        >
          <option value="ALL">All Review Statuses</option>
          <option value="NEW">New Request</option>
          <option value="UNDER_REVIEW">Under Review</option>
          <option value="NEEDS_INFORMATION">Needs Information</option>
          <option value="ACCEPTED">Accepted</option>
          <option value="REJECTED">Rejected</option>
          <option value="CLOSED">Closed</option>
        </select>

        {/* Verification Status Filter */}
        <select
          value={verificationStatus}
          onChange={(e) => {
            setVerificationStatus(e.target.value);
            setPagination((p) => ({ ...p, page: 1 }));
          }}
          style={{
            padding: '0.55rem 0.75rem',
            borderRadius: '8px',
            border: '1px solid #cbd5e1',
            fontSize: '0.8125rem',
            backgroundColor: '#ffffff',
            outline: 'none',
            color: '#334155',
          }}
        >
          <option value="ALL">All Verification Statuses</option>
          <option value="NOT_VERIFIED">Not Verified</option>
          <option value="IN_PROGRESS">Verifying (In Progress)</option>
          <option value="VERIFIED">Verified</option>
          <option value="VERIFICATION_FAILED">Verification Failed</option>
        </select>

        {/* Organization Type Filter */}
        <select
          value={organizationType}
          onChange={(e) => {
            setOrganizationType(e.target.value);
            setPagination((p) => ({ ...p, page: 1 }));
          }}
          style={{
            padding: '0.55rem 0.75rem',
            borderRadius: '8px',
            border: '1px solid #cbd5e1',
            fontSize: '0.8125rem',
            backgroundColor: '#ffffff',
            outline: 'none',
            color: '#334155',
          }}
        >
          <option value="ALL">All Organization Types</option>
          <option value="Agri-input Companies">Agri-input Companies</option>
          <option value="Buyers & Procurement">Buyers & Procurement</option>
          <option value="FPOs & Farmer Organizations">FPOs & Farmer Organizations</option>
          <option value="Agricultural Service Providers">Agricultural Service Providers</option>
          <option value="Technology Partners">Technology Partners</option>
          <option value="NGOs, Research & Institutions">NGOs, Research & Institutions</option>
          <option value="Distribution & Retail Partners">Distribution & Retail Partners</option>
          <option value="Other Strategic Collaborations">Other Strategic Collaborations</option>
        </select>

        {/* Reset Filter Button */}
        {(search || reviewStatus !== 'ALL' || verificationStatus !== 'ALL' || organizationType !== 'ALL') && (
          <button
            type="button"
            onClick={() => {
              setSearch('');
              setReviewStatus('ALL');
              setVerificationStatus('ALL');
              setOrganizationType('ALL');
              setCollaborationCategory('ALL');
              setPagination((p) => ({ ...p, page: 1 }));
            }}
            style={{
              padding: '0.55rem 0.85rem',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              backgroundColor: '#f1f5f9',
              color: '#475569',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* 4. Requests Table */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
          overflow: 'hidden',
        }}
      >
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
            <Loader2 size={24} className="animate-spin" color="#16a34a" style={{ margin: '0 auto 0.75rem auto' }} />
            <div style={{ fontSize: '0.875rem' }}>Loading collaboration requests...</div>
          </div>
        ) : error ? (
          <div style={{ padding: '2.5rem', textAlign: 'center', color: '#991b1b' }}>
            <AlertTriangle size={24} color="#dc2626" style={{ margin: '0 auto 0.75rem auto' }} />
            <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{error}</div>
            <button
              onClick={fetchRequests}
              style={{
                marginTop: '1rem',
                padding: '0.45rem 0.85rem',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: '#dc2626',
                color: '#ffffff',
                fontSize: '0.75rem',
                cursor: 'pointer',
              }}
            >
              Retry
            </button>
          </div>
        ) : requests.length === 0 ? (
          <div style={{ padding: '3.5rem 1.5rem', textAlign: 'center', color: '#64748b' }}>
            <Handshake size={36} color="#94a3b8" style={{ margin: '0 auto 0.75rem auto' }} />
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>No collaboration requests found</div>
            <div style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: '0.25rem' }}>
              {search || reviewStatus !== 'ALL'
                ? 'Try adjusting your search query or status filter.'
                : 'New public partnership proposals will appear here automatically.'}
            </div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8125rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 700, fontSize: '0.75rem' }}>
                  <th style={{ padding: '0.85rem 1rem' }}>REFERENCE ID</th>
                  <th style={{ padding: '0.85rem 1rem' }}>ORGANIZATION</th>
                  <th style={{ padding: '0.85rem 1rem' }}>CONTACT DETAILS</th>
                  <th style={{ padding: '0.85rem 1rem' }}>TYPE & CATEGORY</th>
                  <th style={{ padding: '0.85rem 1rem' }}>LOCATION</th>
                  <th style={{ padding: '0.85rem 1rem' }}>SUBMISSION DATE</th>
                  <th style={{ padding: '0.85rem 1rem' }}>VERIFICATION</th>
                  <th style={{ padding: '0.85rem 1rem' }}>REVIEW STATUS</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((item) => {
                  const revBadge = REVIEW_STATUS_LABELS[item.reviewStatus] || REVIEW_STATUS_LABELS.NEW;
                  const verBadge = VERIFICATION_STATUS_LABELS[item.verificationStatus] || VERIFICATION_STATUS_LABELS.NOT_VERIFIED;

                  return (
                    <tr
                      key={item.id}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        transition: 'background-color 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      {/* Reference ID */}
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#0f172a' }}>
                        <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', backgroundColor: '#f1f5f9', padding: '0.2rem 0.45rem', borderRadius: '4px' }}>
                          {item.referenceId}
                        </span>
                      </td>

                      {/* Organization Name */}
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{item.companyName}</div>
                        {item.website && (
                          <a
                            href={item.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              fontSize: '0.6875rem',
                              color: '#2563eb',
                              textDecoration: 'none',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.2rem',
                              marginTop: '0.15rem',
                            }}
                          >
                            <span>Visit website</span>
                            <ExternalLink size={10} />
                          </a>
                        )}
                      </td>

                      {/* Contact Person */}
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ fontWeight: 600, color: '#334155' }}>{item.contactPerson}</div>
                        <div style={{ fontSize: '0.6875rem', color: '#64748b', marginTop: '0.15rem' }}>
                          {item.officialEmail} • {item.phoneNumber}
                        </div>
                      </td>

                      {/* Type & Category */}
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{item.organizationType}</div>
                        <div style={{ fontSize: '0.6875rem', color: '#64748b', marginTop: '0.15rem' }}>
                          {item.collaborationCategory}
                        </div>
                      </td>

                      {/* Location */}
                      <td style={{ padding: '0.85rem 1rem', color: '#475569' }}>
                        {item.cityDistrict ? `${item.cityDistrict}, ` : ''}{item.state}
                      </td>

                      {/* Submission Date */}
                      <td style={{ padding: '0.85rem 1rem', color: '#64748b', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                        {new Date(item.submittedAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>

                      {/* Verification Status */}
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            padding: '0.25rem 0.55rem',
                            borderRadius: '9999px',
                            backgroundColor: verBadge.bg,
                            color: verBadge.color,
                            border: `1px solid ${verBadge.border}`,
                            fontSize: '0.6875rem',
                            fontWeight: 700,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {item.verificationStatus === 'VERIFIED' && <Check size={11} />}
                          {item.verificationStatus === 'VERIFICATION_FAILED' && <X size={11} />}
                          {verBadge.label}
                        </span>
                      </td>

                      {/* Review Status */}
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            padding: '0.25rem 0.55rem',
                            borderRadius: '9999px',
                            backgroundColor: revBadge.bg,
                            color: revBadge.color,
                            border: `1px solid ${revBadge.border}`,
                            fontSize: '0.6875rem',
                            fontWeight: 700,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {revBadge.label}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                        <button
                          type="button"
                          onClick={() => handleOpenDetail(item.id)}
                          style={{
                            padding: '0.35rem 0.75rem',
                            borderRadius: '6px',
                            border: '1px solid #cbd5e1',
                            backgroundColor: '#ffffff',
                            color: '#166534',
                            fontWeight: 700,
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            transition: 'all 0.15s ease',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#f0fdf4';
                            e.currentTarget.style.borderColor = '#86efac';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#ffffff';
                            e.currentTarget.style.borderColor = '#cbd5e1';
                          }}
                        >
                          <Eye size={13} />
                          <span>Review</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        <div
          style={{
            padding: '0.75rem 1.25rem',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.75rem',
            color: '#64748b',
          }}
        >
          <div>
            Showing <strong>{requests.length}</strong> of <strong>{pagination.total}</strong> proposals
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              disabled={pagination.page <= 1 || loading}
              onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.2rem',
                padding: '0.35rem 0.65rem',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                backgroundColor: pagination.page <= 1 ? '#f8fafc' : '#ffffff',
                color: pagination.page <= 1 ? '#94a3b8' : '#334155',
                cursor: pagination.page <= 1 ? 'not-allowed' : 'pointer',
              }}
            >
              <ChevronLeft size={14} />
              <span>Previous</span>
            </button>
            <span>
              Page <strong>{pagination.page}</strong> of <strong>{pagination.totalPages || 1}</strong>
            </span>
            <button
              disabled={pagination.page >= pagination.totalPages || loading}
              onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.2rem',
                padding: '0.35rem 0.65rem',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                backgroundColor: pagination.page >= pagination.totalPages ? '#f8fafc' : '#ffffff',
                color: pagination.page >= pagination.totalPages ? '#94a3b8' : '#334155',
                cursor: pagination.page >= pagination.totalPages ? 'not-allowed' : 'pointer',
              }}
            >
              <span>Next</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* 5. Detailed Review Drawer / Modal */}
      {selectedRequest && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 999,
            display: 'flex',
            justifyContent: 'flex-end',
          }}
          onClick={handleCloseDetail}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '680px',
              backgroundColor: '#ffffff',
              height: '100%',
              overflowY: 'auto',
              boxShadow: '-8px 0 30px rgba(0, 0, 0, 0.15)',
              display: 'flex',
              flexDirection: 'column',
              boxSizing: 'border-box',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div
              style={{
                padding: '1.25rem 1.75rem',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#f8fafc',
                position: 'sticky',
                top: 0,
                zIndex: 10,
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: '0.8125rem', fontWeight: 800, color: '#166534' }}>
                    {selectedRequest.referenceId}
                  </span>
                  <span
                    style={{
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      padding: '0.2rem 0.5rem',
                      borderRadius: '9999px',
                      backgroundColor: REVIEW_STATUS_LABELS[selectedRequest.reviewStatus]?.bg || '#f1f5f9',
                      color: REVIEW_STATUS_LABELS[selectedRequest.reviewStatus]?.color || '#475569',
                      border: `1px solid ${REVIEW_STATUS_LABELS[selectedRequest.reviewStatus]?.border || '#cbd5e1'}`,
                    }}
                  >
                    {REVIEW_STATUS_LABELS[selectedRequest.reviewStatus]?.label || selectedRequest.reviewStatus}
                  </span>
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '0.25rem 0 0 0' }}>
                  {selectedRequest.companyName}
                </h3>
              </div>

              <button
                type="button"
                onClick={handleCloseDetail}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#64748b',
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Drawer Body */}
            <div style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1 }}>
              {/* Alert Feedback inside Drawer */}
              {drawerError && (
                <div
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fecaca',
                    color: '#991b1b',
                    fontSize: '0.8125rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <AlertCircle size={16} color="#dc2626" style={{ flexShrink: 0 }} />
                  <span>{drawerError}</span>
                </div>
              )}

              {actionSuccess && (
                <div
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    backgroundColor: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    color: '#166534',
                    fontSize: '0.8125rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <CheckCircle2 size={16} color="#16a34a" style={{ flexShrink: 0 }} />
                  <span>{actionSuccess}</span>
                </div>
              )}

              {/* Section 1: Organization Details */}
              <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.85rem 0', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <Building2 size={16} color="#16a34a" />
                  <span>Organization Information</span>
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', fontSize: '0.8125rem' }}>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>Contact Person</span>
                    <strong style={{ color: '#0f172a' }}>{selectedRequest.contactPerson}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>Official Email</span>
                    <strong style={{ color: '#0f172a' }}>{selectedRequest.officialEmail}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>Phone Number</span>
                    <strong style={{ color: '#0f172a' }}>{selectedRequest.phoneNumber}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>Website</span>
                    {selectedRequest.website ? (
                      <a href={selectedRequest.website} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                        <span>{selectedRequest.website}</span>
                        <ExternalLink size={11} />
                      </a>
                    ) : (
                      <span style={{ color: '#94a3b8' }}>Not provided</span>
                    )}
                  </div>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>Organization Type</span>
                    <strong style={{ color: '#0f172a' }}>{selectedRequest.organizationType}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>Location</span>
                    <strong style={{ color: '#0f172a' }}>
                      {selectedRequest.cityDistrict ? `${selectedRequest.cityDistrict}, ` : ''}{selectedRequest.state}, {selectedRequest.country}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Section 2: Proposal Description */}
              <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <FileText size={16} color="#16a34a" />
                  <span>Proposal & Expected Outcomes</span>
                </h4>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.75rem' }}>
                  Collaboration Category: <strong style={{ color: '#166534' }}>{selectedRequest.collaborationCategory}</strong>
                </div>
                <div
                  style={{
                    backgroundColor: '#f8fafc',
                    padding: '0.85rem',
                    borderRadius: '8px',
                    fontSize: '0.8125rem',
                    color: '#1e293b',
                    lineHeight: 1.5,
                    border: '1px solid #e2e8f0',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {selectedRequest.proposalDescription}
                </div>

                {selectedRequest.documentName && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginTop: '0.85rem',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '6px',
                      backgroundColor: '#f0fdf4',
                      border: '1px solid #bbf7d0',
                      fontSize: '0.75rem',
                      color: '#166534',
                    }}
                  >
                    <FileText size={14} />
                    <span>Uploaded document: <strong>{selectedRequest.documentName}</strong></span>
                  </div>
                )}
              </div>

              {/* Section 3: Distinct Verification Process */}
              <div style={{ backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #cbd5e1', padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <ShieldCheck size={16} color="#0284c7" />
                    <span>Organization Verification Process</span>
                  </h4>
                  <span
                    style={{
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      padding: '0.2rem 0.5rem',
                      borderRadius: '9999px',
                      backgroundColor: VERIFICATION_STATUS_LABELS[selectedRequest.verificationStatus]?.bg || '#f1f5f9',
                      color: VERIFICATION_STATUS_LABELS[selectedRequest.verificationStatus]?.color || '#475569',
                      border: `1px solid ${VERIFICATION_STATUS_LABELS[selectedRequest.verificationStatus]?.border || '#cbd5e1'}`,
                    }}
                  >
                    {VERIFICATION_STATUS_LABELS[selectedRequest.verificationStatus]?.label}
                  </span>
                </div>

                <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0 0 0.85rem 0' }}>
                  Verification confirms legal authenticity, business track record, and registration credentials before any collaboration agreement.
                </p>

                {!isReadOnly ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.75rem' }}>
                      <select
                        value={targetVerificationStatus}
                        onChange={(e) => setTargetVerificationStatus(e.target.value as any)}
                        style={{
                          padding: '0.5rem 0.65rem',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.8125rem',
                          backgroundColor: '#ffffff',
                          outline: 'none',
                        }}
                      >
                        <option value="NOT_VERIFIED">Not Verified</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="VERIFIED">Verified</option>
                        <option value="VERIFICATION_FAILED">Verification Failed</option>
                      </select>

                      <input
                        type="text"
                        value={verificationNotes}
                        onChange={(e) => setVerificationNotes(e.target.value)}
                        placeholder="Verification findings or notes..."
                        style={{
                          padding: '0.5rem 0.75rem',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.8125rem',
                          outline: 'none',
                        }}
                      />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        onClick={handleSaveVerification}
                        disabled={updatingVerification}
                        style={{
                          padding: '0.45rem 0.95rem',
                          borderRadius: '6px',
                          backgroundColor: '#0284c7',
                          color: '#ffffff',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                        }}
                      >
                        {updatingVerification ? <Loader2 size={12} className="animate-spin" /> : <Check size={13} />}
                        <span>Save Verification</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    {selectedRequest.verificationNotes || 'No verification notes recorded.'}
                  </div>
                )}
              </div>

              {/* Section 4: Review Decision Controls */}
              <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.85rem 0', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <UserCheck size={16} color="#16a34a" />
                  <span>Administrative Review & Decision</span>
                </h4>

                {isReadOnly ? (
                  <div style={{ fontSize: '0.8125rem', color: '#64748b', fontStyle: 'italic' }}>
                    You are in read-only audit mode. Decision mutations are disabled.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem' }}>
                    {/* Action 1: Start Review (if NEW) */}
                    {selectedRequest.reviewStatus === 'NEW' && (
                      <button
                        type="button"
                        onClick={() =>
                          triggerDecision(
                            'START_REVIEW',
                            'Start Administrative Review',
                            `Transition ${selectedRequest.companyName} proposal from NEW to UNDER_REVIEW.`
                          )
                        }
                        style={{
                          padding: '0.55rem 0.95rem',
                          borderRadius: '6px',
                          border: '1px solid #0284c7',
                          backgroundColor: '#e0f2fe',
                          color: '#0369a1',
                          fontWeight: 700,
                          fontSize: '0.8125rem',
                          cursor: 'pointer',
                        }}
                      >
                        Start Review
                      </button>
                    )}

                    {/* Action 2: Request More Information */}
                    {(selectedRequest.reviewStatus === 'UNDER_REVIEW' || selectedRequest.reviewStatus === 'NEW') && (
                      <button
                        type="button"
                        onClick={() =>
                          triggerDecision(
                            'NEEDS_INFO',
                            'Request Additional Information',
                            `Specify what additional documentation or details are required from ${selectedRequest.companyName}.`,
                            'Information Requested *'
                          )
                        }
                        style={{
                          padding: '0.55rem 0.95rem',
                          borderRadius: '6px',
                          border: '1px solid #c084fc',
                          backgroundColor: '#faf5ff',
                          color: '#7e22ce',
                          fontWeight: 700,
                          fontSize: '0.8125rem',
                          cursor: 'pointer',
                        }}
                      >
                        Request More Info
                      </button>
                    )}

                    {/* Action 3: Accept Collaboration */}
                    {selectedRequest.reviewStatus !== 'ACCEPTED' && selectedRequest.reviewStatus !== 'CLOSED' && (
                      <button
                        type="button"
                        onClick={() =>
                          triggerDecision(
                            'ACCEPT',
                            'Accept Collaboration Proposal',
                            `Confirm acceptance of ${selectedRequest.companyName} for ${selectedRequest.collaborationCategory}. Note: Organization must be marked VERIFIED. Acceptance records decision to proceed with formal partnership discussion.`,
                            'Decision Note / Collaboration Next Steps *',
                            true
                          )
                        }
                        style={{
                          padding: '0.55rem 0.95rem',
                          borderRadius: '6px',
                          border: 'none',
                          backgroundColor: '#15803d',
                          color: '#ffffff',
                          fontWeight: 700,
                          fontSize: '0.8125rem',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          boxShadow: '0 2px 6px rgba(21, 128, 61, 0.25)',
                        }}
                      >
                        <CheckCircle2 size={14} />
                        <span>Accept Collaboration</span>
                      </button>
                    )}

                    {/* Action 4: Reject Collaboration */}
                    {selectedRequest.reviewStatus !== 'REJECTED' && selectedRequest.reviewStatus !== 'CLOSED' && (
                      <button
                        type="button"
                        onClick={() =>
                          triggerDecision(
                            'REJECT',
                            'Reject Collaboration Proposal',
                            `State the official rejection reason for ${selectedRequest.companyName}. The submission and complete review record will be preserved.`,
                            'Rejection Reason *'
                          )
                        }
                        style={{
                          padding: '0.55rem 0.95rem',
                          borderRadius: '6px',
                          border: '1px solid #fecaca',
                          backgroundColor: '#fef2f2',
                          color: '#991b1b',
                          fontWeight: 700,
                          fontSize: '0.8125rem',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                        }}
                      >
                        <XCircle size={14} />
                        <span>Reject Proposal</span>
                      </button>
                    )}

                    {/* Action 5: Close Request */}
                    {selectedRequest.reviewStatus !== 'CLOSED' && (
                      <button
                        type="button"
                        onClick={() =>
                          triggerDecision(
                            'CLOSE',
                            'Close Request Workflow',
                            `Close active tracking for ${selectedRequest.companyName}.`,
                            'Closure Reason / Final Summary *'
                          )
                        }
                        style={{
                          padding: '0.55rem 0.95rem',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          backgroundColor: '#f8fafc',
                          color: '#475569',
                          fontWeight: 700,
                          fontSize: '0.8125rem',
                          cursor: 'pointer',
                        }}
                      >
                        Close Workflow
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Section 5: Internal Reviewer Notes */}
              <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.85rem 0', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <MessageSquare size={16} color="#16a34a" />
                  <span>Internal Staff Notes ({selectedRequest.notes?.length || 0})</span>
                </h4>

                {!isReadOnly && (
                  <form onSubmit={handleAddNote} style={{ marginBottom: '1rem' }}>
                    <textarea
                      rows={2}
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Add an internal reviewer note (visible only to authorized staff)..."
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.75rem',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.8125rem',
                        boxSizing: 'border-box',
                        outline: 'none',
                        resize: 'vertical',
                      }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.45rem' }}>
                      <button
                        type="submit"
                        disabled={submittingNote || !newNote.trim()}
                        style={{
                          padding: '0.35rem 0.85rem',
                          borderRadius: '6px',
                          backgroundColor: '#15803d',
                          color: '#ffffff',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                        }}
                      >
                        {submittingNote ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                        <span>Post Note</span>
                      </button>
                    </div>
                  </form>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {selectedRequest.notes && selectedRequest.notes.length > 0 ? (
                    selectedRequest.notes.map((n) => (
                      <div
                        key={n.id}
                        style={{
                          padding: '0.75rem',
                          borderRadius: '6px',
                          backgroundColor: '#f8fafc',
                          border: '1px solid #f1f5f9',
                          fontSize: '0.8125rem',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                          <span style={{ fontWeight: 700, color: '#0f172a' }}>{n.authorName}</span>
                          <span style={{ fontSize: '0.6875rem', color: '#94a3b8' }}>
                            {new Date(n.createdAt).toLocaleString('en-IN')}
                          </span>
                        </div>
                        <div style={{ color: '#334155', lineHeight: 1.45 }}>{n.note}</div>
                      </div>
                    ))
                  ) : (
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic' }}>
                      No internal notes recorded yet.
                    </div>
                  )}
                </div>
              </div>

              {/* Section 6: Audit Trail Timeline */}
              <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.85rem 0', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <Clock size={16} color="#64748b" />
                  <span>Audit Trail Timeline</span>
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {selectedRequest.history && selectedRequest.history.length > 0 ? (
                    selectedRequest.history.map((h) => (
                      <div key={h.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                        <div
                          style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            backgroundColor: '#e2e8f0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            marginTop: '2px',
                          }}
                        >
                          <Check size={11} color="#475569" />
                        </div>
                        <div style={{ fontSize: '0.75rem' }}>
                          <div>
                            <strong style={{ color: '#0f172a' }}>{h.action}</strong>
                            {h.actorName && (
                              <span style={{ color: '#64748b' }}>
                                {' '}by {h.actorName} ({h.actorRole})
                              </span>
                            )}
                          </div>
                          {h.reason && (
                            <div style={{ color: '#475569', marginTop: '0.15rem' }}>{h.reason}</div>
                          )}
                          <div style={{ color: '#94a3b8', fontSize: '0.6875rem', marginTop: '0.15rem' }}>
                            {new Date(h.createdAt).toLocaleString('en-IN')}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic' }}>
                      No audit history found.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. Action Confirmation Modal */}
      {confirmDialog && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(3px)',
            zIndex: 1050,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
          onClick={() => !executingDecision && setConfirmDialog(null)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '520px',
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '1.75rem',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
              boxSizing: 'border-box',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.85rem' }}>
              {confirmDialog.type === 'ACCEPT' && <CheckCircle2 size={24} color="#16a34a" />}
              {confirmDialog.type === 'REJECT' && <AlertTriangle size={24} color="#dc2626" />}
              {confirmDialog.type === 'NEEDS_INFO' && <HelpCircle size={24} color="#7e22ce" />}
              {confirmDialog.type === 'CLOSE' && <Clock size={24} color="#475569" />}
              {confirmDialog.type === 'START_REVIEW' && <Eye size={24} color="#0284c7" />}
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                {confirmDialog.title}
              </h3>
            </div>

            <p style={{ fontSize: '0.8125rem', color: '#475569', lineHeight: 1.5, margin: '0 0 1.25rem 0' }}>
              {confirmDialog.description}
            </p>

            {confirmDialog.inputLabel && (
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  {confirmDialog.inputLabel}
                </label>
                <textarea
                  rows={3}
                  required
                  value={confirmDialog.inputValue}
                  onChange={(e) =>
                    setConfirmDialog((prev) => (prev ? { ...prev, inputValue: e.target.value } : null))
                  }
                  placeholder="Enter required notes/reasons..."
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.8125rem',
                    boxSizing: 'border-box',
                    outline: 'none',
                    resize: 'vertical',
                  }}
                />
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                disabled={executingDecision}
                onClick={() => setConfirmDialog(null)}
                style={{
                  padding: '0.55rem 1rem',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  color: '#475569',
                  fontWeight: 600,
                  fontSize: '0.8125rem',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={executingDecision}
                onClick={handleExecuteDecision}
                style={{
                  padding: '0.55rem 1.25rem',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: confirmDialog.type === 'REJECT' ? '#dc2626' : '#15803d',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.8125rem',
                  cursor: executingDecision ? 'not-allowed' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                }}
              >
                {executingDecision ? <Loader2 size={14} className="animate-spin" /> : null}
                <span>Confirm Decision</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollaborationAdminPage;
