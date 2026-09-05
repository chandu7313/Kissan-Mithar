import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowUpRight,
  User,
  Sprout,
  Mic,
  Zap,
  UserCheck,
  MapPin,
  Camera,
  Droplets,
  CheckCircle2,
  XCircle,
  MessageCircle,
} from 'lucide-react';
import { OrchardRequest, OrchardStatus } from '../../types/index.js';
import { StatusBadge } from '../../components/common/StatusBadge.js';
import { ImageGallery } from '../../components/common/ImageGallery.js';
import { AudioPlayer } from '../../components/common/AudioPlayer.js';
import { MapPreview } from '../../components/common/MapPreview.js';
import { OrchardApi } from '../../api/orchard.api.js';

// --- CONFIGURATION ---
// If you want to use a fixed WhatsApp number (e.g. your business number), set it here.
// Example: const WHATSAPP_TARGET_NUMBER = "919392699963";
// If left null, it will automatically use the current farmer's phone number.
const WHATSAPP_TARGET_NUMBER: string | null = null;

// Change this message to customize the pre-filled text when opening WhatsApp.
const WHATSAPP_DEFAULT_MESSAGE = "";
// ---------------------

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

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    farmerName: request.farmer?.name || '',
    phoneNumber: request.farmer?.phoneNumber || '',
    village: request.gps.village || '',
    district: request.gps.district || '',
    state: request.gps.state || 'Maharashtra',
    landSize: request.landDetails.size || '',
    soilType: request.landDetails.soilType || '',
    waterSources: request.landDetails.waterSources?.join(', ') || '',
    drip: request.landDetails.drip || false,
    electricity: request.landDetails.electricity || false,
    existingCrops: request.landDetails.existingCrops?.join(', ') || '',
  });

  const handleSaveDetails = async () => {
    try {
      setIsUpdating(true);
      const updatedDetails = {
        ...editForm,
        waterSources: editForm.waterSources.split(',').map(s => s.trim()).filter(Boolean),
        existingCrops: editForm.existingCrops.split(',').map(s => s.trim()).filter(Boolean),
      };
      const updatedRequest = await OrchardApi.updateDetails(request.id, updatedDetails);
      setRequest(updatedRequest);
      setIsEditing(false);
      setFeedbackMsg('Details successfully updated!');
      setTimeout(() => setFeedbackMsg(null), 3500);
    } catch (error) {
      console.error("Error updating details", error);
      alert("Failed to update details");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelEdit = () => {
    setEditForm({
      farmerName: request.farmer?.name || '',
      phoneNumber: request.farmer?.phoneNumber || '',
      village: request.gps.village || '',
      district: request.gps.district || '',
      state: request.gps.state || 'Maharashtra',
      landSize: request.landDetails.size || '',
      soilType: request.landDetails.soilType || '',
      waterSources: request.landDetails.waterSources?.join(', ') || '',
      drip: request.landDetails.drip || false,
      electricity: request.landDetails.electricity || false,
      existingCrops: request.landDetails.existingCrops?.join(', ') || '',
    });
    setIsEditing(false);
  };

  const handleStatusChange = async (newStatus: OrchardStatus) => {
    setIsUpdating(true);
    setStatus(newStatus);
    await OrchardApi.updateStatus(request.id, newStatus);
    setRequest({ ...request, status: newStatus });
    setIsUpdating(false);
    setFeedbackMsg(`Status successfully changed to ${newStatus.replace('_', ' ')}!`);
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  const handleWhatsAppClick = () => {
    let rawNumber = WHATSAPP_TARGET_NUMBER || request.farmer?.phoneNumber;
    
    if (!rawNumber) {
      alert("No phone number available to message.");
      return;
    }
    
    // Remove all non-numeric characters from the phone number
    let formattedPhone = rawNumber.replace(/\D/g, '');
    
    // Ensure it has the Indian country code if it's exactly 10 digits
    if (formattedPhone.length === 10) {
      formattedPhone = `91${formattedPhone}`;
    }

    let waUrl = `https://wa.me/${formattedPhone}`;
    if (WHATSAPP_DEFAULT_MESSAGE) {
      const text = encodeURIComponent(WHATSAPP_DEFAULT_MESSAGE);
      waUrl += `?text=${text}`;
    }
    
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Breadcrumb & Action Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={onBack}
            className="btn-secondary"
            style={{ padding: '0.5rem 0.875rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}
          >
            <ArrowLeft size={16} />
            <span>Back to Surveys</span>
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

        <button
          onClick={() => onOpenReportBuilder(request)}
          className="btn-gold"
          style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}
        >
          <Sprout size={16} />
          <span>Open Agronomy Report Builder</span>
          <ArrowUpRight size={15} />
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
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <CheckCircle2 size={16} color="#16a34a" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Main Grid: 2 Columns */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
        {/* Left Column: Farmer & Land Specifications */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Farmer Contact Card */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <User size={18} color="var(--primary-700)" />
                <h3 style={{ fontSize: '1.0625rem', fontWeight: 600, margin: 0 }}>Farmer Information</h3>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {isEditing ? (
                  <>
                    <button onClick={handleCancelEdit} className="btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>Cancel</button>
                    <button onClick={handleSaveDetails} disabled={isUpdating} className="btn-gold" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>Save</button>
                  </>
                ) : (
                  <button onClick={() => setIsEditing(true)} className="btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>Edit Details</button>
                )}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.875rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Full Name</span>
                {isEditing ? (
                  <input type="text" value={editForm.farmerName} onChange={e => setEditForm({...editForm, farmerName: e.target.value})} style={{ width: '100%', padding: '0.25rem' }} />
                ) : (
                  <div style={{ fontWeight: 600 }}>{request.farmer?.name}</div>
                )}
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Phone Number</span>
                {isEditing ? (
                  <input type="text" value={editForm.phoneNumber} onChange={e => setEditForm({...editForm, phoneNumber: e.target.value})} style={{ width: '100%', padding: '0.25rem' }} />
                ) : (
                  <div style={{ fontWeight: 600 }}>{request.farmer?.phoneNumber}</div>
                )}
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Village & District</span>
                {isEditing ? (
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <input type="text" placeholder="Village" value={editForm.village} onChange={e => setEditForm({...editForm, village: e.target.value})} style={{ width: '100%', padding: '0.25rem' }} />
                    <input type="text" placeholder="District" value={editForm.district} onChange={e => setEditForm({...editForm, district: e.target.value})} style={{ width: '100%', padding: '0.25rem' }} />
                  </div>
                ) : (
                  <div style={{ fontWeight: 500 }}>{request.gps.village}, {request.gps.district}</div>
                )}
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>State</span>
                {isEditing ? (
                  <input type="text" value={editForm.state} onChange={e => setEditForm({...editForm, state: e.target.value})} style={{ width: '100%', padding: '0.25rem' }} />
                ) : (
                  <div style={{ fontWeight: 500 }}>{request.gps.state || 'Maharashtra'}</div>
                )}
              </div>
            </div>

            {/* WhatsApp Contact Button */}
            <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '0.75rem' }}>
              <button
                onClick={handleWhatsAppClick}
                style={{
                  width: '100%',
                  padding: '0.625rem 1rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  background: 'linear-gradient(135deg, #25d366 0%, #128c7e 100%)',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  transition: 'opacity 0.15s, transform 0.15s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.9';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <MessageCircle size={16} />
                <span>Message on WhatsApp</span>
              </button>
            </div>
          </div>

          {/* Land & Soil Characteristics */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sprout size={18} color="var(--primary-700)" />
              <h3 style={{ fontSize: '1.0625rem', fontWeight: 600, margin: 0 }}>Land & Soil Parameters</h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.875rem' }}>
              <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Total Survey Area</span>
                {isEditing ? (
                  <input type="text" value={editForm.landSize} onChange={e => setEditForm({...editForm, landSize: e.target.value})} style={{ width: '100%', padding: '0.25rem', marginTop: '0.25rem' }} />
                ) : (
                  <div style={{ fontWeight: 700, color: 'var(--primary-800)', fontSize: '1.125rem' }}>
                    {request.landDetails.size}
                  </div>
                )}
              </div>

              <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Soil Type</span>
                {isEditing ? (
                  <input type="text" value={editForm.soilType} onChange={e => setEditForm({...editForm, soilType: e.target.value})} style={{ width: '100%', padding: '0.25rem', marginTop: '0.25rem' }} />
                ) : (
                  <div style={{ fontWeight: 700, color: '#b45309', fontSize: '0.9375rem' }}>
                    {request.landDetails.soilType}
                  </div>
                )}
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Water Resources</span>
                {isEditing ? (
                  <input type="text" value={editForm.waterSources} onChange={e => setEditForm({...editForm, waterSources: e.target.value})} placeholder="Comma separated" style={{ width: '100%', padding: '0.25rem', marginTop: '0.25rem' }} />
                ) : (
                  <div style={{ fontWeight: 500 }}>
                    {request.landDetails.waterSources?.join(', ') || 'Borewell'}
                  </div>
                )}
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Drip & Power Status</span>
                {isEditing ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.25rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input type="checkbox" checked={editForm.drip} onChange={e => setEditForm({...editForm, drip: e.target.checked})} />
                      Drip installed
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input type="checkbox" checked={editForm.electricity} onChange={e => setEditForm({...editForm, electricity: e.target.checked})} />
                      3-Phase Power
                    </label>
                  </div>
                ) : (
                  <div style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.375rem', flexWrap: 'wrap' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                      {request.landDetails.drip ? <Droplets size={13} color="#0284c7" /> : <XCircle size={13} color="#dc2626" />}
                      {request.landDetails.drip ? 'Drip installed' : 'No drip yet'}
                    </span>
                    <span>·</span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                      {request.landDetails.electricity ? <Zap size={13} color="#eab308" /> : null}
                      {request.landDetails.electricity ? '3-Phase Power' : 'No power'}
                    </span>
                  </div>
                )}
              </div>
            </div>

              <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '0.75rem' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Existing Crops / Trees</span>
                {isEditing ? (
                  <input type="text" value={editForm.existingCrops} onChange={e => setEditForm({...editForm, existingCrops: e.target.value})} placeholder="Comma separated" style={{ width: '100%', padding: '0.25rem', marginTop: '0.25rem' }} />
                ) : (
                  <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>
                    {request.landDetails.existingCrops?.join(', ')}
                  </div>
                )}
              </div>
          </div>

          {/* Farmer Notes & Voice Note */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Mic size={18} color="var(--primary-700)" />
              <h3 style={{ fontSize: '1.0625rem', fontWeight: 600, margin: 0 }}>Farmer Audio & Special Request</h3>
            </div>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Zap size={18} color="var(--primary-800)" />
              <h3 style={{ fontSize: '1.0625rem', fontWeight: 600, color: 'var(--primary-900)', margin: 0 }}>
                Agronomist Action Center
              </h3>
            </div>

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
                <UserCheck size={16} color="var(--primary-700)" />
                <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>Dr. Sunil Rao (Horticulture Lead)</div>
              </div>
            </div>
          </div>

          {/* GPS Coordinates Preview */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin size={18} color="var(--primary-700)" />
              <h3 style={{ fontSize: '1.0625rem', fontWeight: 600, margin: 0 }}>Field GPS Location</h3>
            </div>
            <MapPreview gps={request.gps} />
          </div>

          {/* Uploaded Photos Gallery */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Camera size={18} color="var(--primary-700)" />
              <h3 style={{ fontSize: '1.0625rem', fontWeight: 600, margin: 0 }}>Multi-Angle Land Survey Photos</h3>
            </div>
            <ImageGallery photos={request.photos} />
          </div>
        </div>
      </div>
    </div>
  );
};

