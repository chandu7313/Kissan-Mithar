import React, { useState } from 'react';
import { OrchardRequest, OrchardStatus } from '../types/index.js';
import { StatusBadge } from '../components/common/StatusBadge.js';
import { ImageGallery } from '../components/common/ImageGallery.js';
import { AudioPlayer } from '../components/common/AudioPlayer.js';
import { MapPreview } from '../components/common/MapPreview.js';
import { OrchardApi } from '../api/orchard.api.js';

interface Props {
  request: OrchardRequest;
  onBack: () => void;
  onOpenReportBuilder: (request: OrchardRequest) => void;
}

export const RequestDetailPage: React.FC<Props> = ({
  request: initialRequest,
  onBack,
  onOpenReportBuilder,
}) => {
  const [request, setRequest] = useState<OrchardRequest>(initialRequest);
  const [status, setStatus] = useState<OrchardStatus>(request.status);
  const [isUpdating, setIsUpdating] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const handleStatusChange = async (newStatus: OrchardStatus) => {
    setIsUpdating(true);
    setStatus(newStatus);
    await OrchardApi.updateStatus(request.id, newStatus);
    setRequest({ ...request, status: newStatus });
    setIsUpdating(false);
    setFeedbackMsg(`Status successfully changed to ${newStatus.replace('_', ' ')}!`);
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Breadcrumb & Action Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button onClick={onBack} className="btn-secondary" style={{ padding: '0.5rem 0.875rem' }}>
            ← Back to Surveys
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <h1 style={{ fontSize: '1.375rem', fontWeight: 700 }}>{request.farmer?.name}'s Orchard Survey</h1>
              <StatusBadge status={status} />
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Survey ID: {request.id} · Submitted on {new Date(request.submittedAt).toLocaleDateString('en-IN')}
            </div>
          </div>
        </div>

        <button onClick={() => onOpenReportBuilder(request)} className="btn-gold">
          <span>🌿</span> Open Agronomy Report Builder ↗
        </button>
      </div>

      {feedbackMsg && (
        <div
          style={{
            padding: '0.75rem 1rem',
            borderRadius: '0.5rem',
            backgroundColor: '#dcfce7',
            color: '#15803d',
            border: '1px solid #bbf7d0',
            fontWeight: 600,
            fontSize: '0.875rem',
          }}
        >
          ✓ {feedbackMsg}
        </div>
      )}

      {/* Main Grid: 2 Columns */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
        {/* Left Column: Farmer & Land Specifications */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Farmer Contact Card */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ fontSize: '1.0625rem', fontWeight: 600 }}>👨‍🌾 Farmer Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.875rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Full Name</span>
                <div style={{ fontWeight: 600 }}>{request.farmer?.name}</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Phone Number</span>
                <div style={{ fontWeight: 600 }}>{request.farmer?.phoneNumber}</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Village & District</span>
                <div style={{ fontWeight: 500 }}>{request.gps.village}, {request.gps.district}</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>State</span>
                <div style={{ fontWeight: 500 }}>{request.gps.state || 'Maharashtra'}</div>
              </div>
            </div>
          </div>

          {/* Land & Soil Characteristics */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ fontSize: '1.0625rem', fontWeight: 600 }}>🌱 Land & Soil Parameters</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.875rem' }}>
              <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Total Survey Area</span>
                <div style={{ fontWeight: 700, color: 'var(--primary-800)', fontSize: '1.125rem' }}>
                  {request.landDetails.size}
                </div>
              </div>

              <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Soil Type</span>
                <div style={{ fontWeight: 700, color: '#b45309', fontSize: '0.9375rem' }}>
                  {request.landDetails.soilType}
                </div>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Water Resources</span>
                <div style={{ fontWeight: 500 }}>
                  {request.landDetails.waterSources.join(', ') || 'Borewell'}
                </div>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Drip & Power Status</span>
                <div style={{ fontWeight: 500 }}>
                  {request.landDetails.drip ? '💧 Drip installed' : '❌ No drip yet'} ·{' '}
                  {request.landDetails.electricity ? '⚡ 3-Phase Power' : 'No power'}
                </div>
              </div>
            </div>

            {request.landDetails.existingCrops?.length > 0 && (
              <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '0.75rem' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Existing Crops / Trees</span>
                <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>
                  {request.landDetails.existingCrops.join(', ')}
                </div>
              </div>
            )}
          </div>

          {/* Farmer Notes & Voice Note */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ fontSize: '1.0625rem', fontWeight: 600 }}>🎙️ Farmer Audio & Special Request</h3>
            <AudioPlayer url={request.voiceNoteUrl} title={`${request.farmer?.name}'s Spoken Instructions`} />

            {request.notes && (
              <div style={{ backgroundColor: '#f8fafc', padding: '0.875rem', borderRadius: '0.5rem', fontSize: '0.875rem', fontStyle: 'italic', color: 'var(--text-main)' }}>
                "{request.notes}"
              </div>
            )}
          </div>
        </div>

        {/* Right Column: GPS Map, Survey Photos & Expert Action Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Quick Status Transition & Assignment Action Card */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', border: '1px solid var(--primary-200)', backgroundColor: '#f0fdf4' }}>
            <h3 style={{ fontSize: '1.0625rem', fontWeight: 600, color: 'var(--primary-900)' }}>
              ⚡ Agronomist Action Center
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary-800)' }}>
                Update Workflow Status:
              </label>
              <select
                value={status}
                disabled={isUpdating}
                onChange={(e) => handleStatusChange(e.target.value as OrchardStatus)}
                style={{
                  padding: '0.625rem 0.75rem',
                  borderRadius: '0.5rem',
                  border: '1px solid var(--primary-300)',
                  backgroundColor: 'white',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                }}
              >
                <option value="SUBMITTED">1. Submitted (Pending Review)</option>
                <option value="UNDER_REVIEW">2. Under Agronomist Review</option>
                <option value="EXPERT_ASSIGNED">3. Expert Assigned</option>
                <option value="PLAN_READY">4. Plan Ready (Delivered to App)</option>
                <option value="COMPLETED">5. Completed / Plantation Active</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary-800)' }}>
                Assigned Expert:
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', backgroundColor: 'white', padding: '0.625rem 0.75rem', borderRadius: '0.5rem', border: '1px solid var(--primary-200)' }}>
                <span>👨‍⚕️</span>
                <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>Dr. Sunil Rao (Horticulture Lead)</div>
              </div>
            </div>
          </div>

          {/* GPS Coordinates Preview */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ fontSize: '1.0625rem', fontWeight: 600 }}>📍 Field GPS Location</h3>
            <MapPreview gps={request.gps} />
          </div>

          {/* Uploaded Photos Gallery */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ fontSize: '1.0625rem', fontWeight: 600 }}>📸 Multi-Angle Land Survey Photos</h3>
            <ImageGallery photos={request.photos} />
          </div>
        </div>
      </div>
    </div>
  );
};
