import React, { useState, useEffect } from 'react';
import { OrchardApi } from '../api/orchard.api.js';
import { OrchardRequest, OrchardStatus } from '../types/index.js';
import { StatusBadge } from '../components/common/StatusBadge.js';

interface Props {
  onSelectRequest: (request: OrchardRequest) => void;
  onOpenReportBuilder: (request: OrchardRequest) => void;
}

export const RequestsListPage: React.FC<Props> = ({
  onSelectRequest,
  onOpenReportBuilder,
}) => {
  const [requests, setRequests] = useState<OrchardRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [landSizeFilter, setLandSizeFilter] = useState<string>('ALL');

  useEffect(() => {
    OrchardApi.getRequests().then((data) => {
      setRequests(data);
      setLoading(false);
    });
  }, []);

  const filteredRequests = requests.filter((req) => {
    // 1. Text Search
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      req.id.toLowerCase().includes(q) ||
      req.farmer?.name.toLowerCase().includes(q) ||
      req.farmer?.phoneNumber.includes(q) ||
      req.gps.village?.toLowerCase().includes(q) ||
      req.gps.district?.toLowerCase().includes(q);

    // 2. Status Filter
    const matchesStatus = statusFilter === 'ALL' || req.status === statusFilter;

    // 3. Land Size Filter
    let matchesLand = true;
    const acres = parseFloat(req.landDetails?.size || '0');
    if (landSizeFilter === 'SMALL') matchesLand = acres < 2.0;
    if (landSizeFilter === 'MEDIUM') matchesLand = acres >= 2.0 && acres <= 5.0;
    if (landSizeFilter === 'LARGE') matchesLand = acres > 5.0;

    return matchesSearch && matchesStatus && matchesLand;
  });

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header & Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Farmer Land Surveys & Orchard Requests</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Review GPS field surveys, inspect multi-angle terrain photos, and construct tailored agronomy plans.
          </p>
        </div>
        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary-700)' }}>
          Showing {filteredRequests.length} of {requests.length} surveys
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div
        className="card"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1rem 1.25rem',
        }}
      >
        {/* Search input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: '1 1 260px' }}>
          <span style={{ color: 'var(--text-muted)' }}>🔍</span>
          <input
            type="text"
            placeholder="Search by farmer name, phone, village, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem 0.75rem',
              borderRadius: '0.375rem',
              border: '1px solid var(--border-light)',
              fontSize: '0.875rem',
              outline: 'none',
            }}
          />
        </div>

        {/* Status Filter Chips */}
        <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
          {['ALL', 'SUBMITTED', 'UNDER_REVIEW', 'PLAN_READY', 'COMPLETED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              style={{
                padding: '0.375rem 0.75rem',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: statusFilter === st ? 'var(--primary-700)' : '#f1f5f9',
                color: statusFilter === st ? 'white' : 'var(--text-main)',
                transition: 'all 0.15s ease',
              }}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Land Size Selector */}
        <select
          value={landSizeFilter}
          onChange={(e) => setLandSizeFilter(e.target.value)}
          style={{
            padding: '0.5rem 0.75rem',
            borderRadius: '0.375rem',
            border: '1px solid var(--border-light)',
            fontSize: '0.8125rem',
            fontWeight: 500,
            backgroundColor: 'white',
            cursor: 'pointer',
          }}
        >
          <option value="ALL">All Land Sizes</option>
          <option value="SMALL">&lt; 2.0 Acres (Smallholder)</option>
          <option value="MEDIUM">2.0 - 5.0 Acres (Medium)</option>
          <option value="LARGE">&gt; 5.0 Acres (Commercial)</option>
        </select>
      </div>

      {/* Requests Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading field surveys...
          </div>
        ) : filteredRequests.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No orchard requests matched your search & filter criteria.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border-light)' }}>
                <th style={{ padding: '0.875rem 1.25rem', fontWeight: 600, color: 'var(--text-muted)' }}>Survey ID & Farmer</th>
                <th style={{ padding: '0.875rem 1rem', fontWeight: 600, color: 'var(--text-muted)' }}>Location</th>
                <th style={{ padding: '0.875rem 1rem', fontWeight: 600, color: 'var(--text-muted)' }}>Land & Soil</th>
                <th style={{ padding: '0.875rem 1rem', fontWeight: 600, color: 'var(--text-muted)' }}>Status</th>
                <th style={{ padding: '0.875rem 1rem', fontWeight: 600, color: 'var(--text-muted)' }}>Date</th>
                <th style={{ padding: '0.875rem 1.25rem', fontWeight: 600, color: 'var(--text-muted)', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((req, idx) => (
                <tr
                  key={req.id}
                  style={{
                    borderBottom: idx === filteredRequests.length - 1 ? 'none' : '1px solid var(--border-light)',
                    transition: 'background-color 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  {/* Farmer Info */}
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div
                        style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: '50%',
                          backgroundColor: '#dcfce7',
                          color: 'var(--primary-800)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '0.875rem',
                          flexShrink: 0,
                        }}
                      >
                        {req.farmer?.name?.charAt(0) || 'F'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{req.farmer?.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {req.id} · {req.farmer?.phoneNumber}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Location */}
                  <td style={{ padding: '1rem 1rem' }}>
                    <div style={{ fontWeight: 500 }}>{req.gps.village || 'Field'}, {req.gps.district || ''}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {req.gps.state || 'India'}
                    </div>
                  </td>

                  {/* Land & Soil */}
                  <td style={{ padding: '1rem 1rem' }}>
                    <div style={{ fontWeight: 600, color: 'var(--primary-800)' }}>
                      {req.landDetails.size}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {req.landDetails.soilType}
                    </div>
                  </td>

                  {/* Status */}
                  <td style={{ padding: '1rem 1rem' }}>
                    <StatusBadge status={req.status} />
                  </td>

                  {/* Date */}
                  <td style={{ padding: '1rem 1rem', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    {new Date(req.submittedAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>

                  {/* Actions */}
                  <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => onSelectRequest(req)}
                        className="btn-secondary"
                        style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem' }}
                      >
                        Inspect
                      </button>
                      <button
                        onClick={() => onOpenReportBuilder(req)}
                        className="btn-primary"
                        style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem' }}
                      >
                        Plan & Report ↗
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
