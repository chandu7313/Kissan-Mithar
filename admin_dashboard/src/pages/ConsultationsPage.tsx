import React, { useState, useEffect } from 'react';
import { ConsultationApi } from '../api/consultation.api.js';
import { ConsultationItem } from '../types/index.js';

export const ConsultationsPage: React.FC = () => {
  const [consultations, setConsultations] = useState<ConsultationItem[]>([]);
  const [selectedConsultation, setSelectedConsultation] = useState<ConsultationItem | null>(null);
  const [diagnosis, setDiagnosis] = useState('');
  const [medicines, setMedicines] = useState('');
  const [followUp, setFollowUp] = useState('');
  const [prescribedSuccess, setPrescribedSuccess] = useState(false);

  useEffect(() => {
    ConsultationApi.getConsultations().then((list) => {
      setConsultations(list);
      if (list.length > 0) {
        setSelectedConsultation(list[0]);
      }
    });
  }, []);

  const handleSavePrescription = () => {
    setPrescribedSuccess(true);
    setTimeout(() => setPrescribedSuccess(false), 3000);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Agronomy Consultations & Digital Clinic</h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Manage voice, video, and chat sessions with farmers, review leaf/pest symptoms, and issue structured digital prescriptions.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '1.5rem' }}>
        {/* Left Column: List of consultations */}
        <div className="card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-light)' }}>
            Consultation Queue ({consultations.length})
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {consultations.map((c) => {
              const isSelected = selectedConsultation?.id === c.id;
              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedConsultation(c)}
                  style={{
                    padding: '0.875rem',
                    borderRadius: '0.5rem',
                    border: `1px solid ${isSelected ? 'var(--primary-600)' : 'var(--border-light)'}`,
                    backgroundColor: isSelected ? 'var(--primary-50)' : 'white',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{c.farmer?.name}</span>
                    <span
                      style={{
                        fontSize: '0.6875rem',
                        fontWeight: 700,
                        padding: '0.125rem 0.5rem',
                        borderRadius: '9999px',
                        backgroundColor: c.mode === 'VIDEO' ? '#e0f2fe' : '#fef3c7',
                        color: c.mode === 'VIDEO' ? '#0369a1' : '#b45309',
                      }}
                    >
                      {c.mode === 'VIDEO' ? '🎥 VIDEO' : '📞 VOICE'}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                    Issue: {c.category} · {c.language}
                  </div>

                  <div style={{ fontSize: '0.75rem', color: 'var(--primary-800)', fontWeight: 500 }}>
                    ⏰ {new Date(c.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ·{' '}
                    {new Date(c.scheduledAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected consultation detail & prescription maker */}
        {selectedConsultation ? (
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                  {selectedConsultation.farmer?.name} ({selectedConsultation.category})
                </h2>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                  Phone: {selectedConsultation.farmer?.phoneNumber} · {selectedConsultation.farmer?.village}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn-primary" style={{ padding: '0.5rem 0.875rem', fontSize: '0.8125rem' }}>
                  📞 Launch Call
                </button>
              </div>
            </div>

            {/* Farmer Notes */}
            <div style={{ backgroundColor: '#f8fafc', padding: '0.875rem', borderRadius: '0.5rem', fontSize: '0.875rem' }}>
              <div style={{ fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                Farmer Problem Statement:
              </div>
              <div>"{selectedConsultation.notes}"</div>
            </div>

            {/* Symptom Photo Preview */}
            {selectedConsultation.mediaUrls && selectedConsultation.mediaUrls.length > 0 && (
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  Uploaded Symptom Photos:
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  {selectedConsultation.mediaUrls.map((url, i) => (
                    <img
                      key={i}
                      src={url}
                      alt="Symptom"
                      style={{ width: '120px', height: '90px', objectFit: 'cover', borderRadius: '0.375rem', border: '1px solid var(--border-light)' }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Expert Prescription Pad */}
            <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.25rem' }}>📋</span>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary-900)' }}>
                  Official Agronomist Prescription
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600 }}>Clinical Diagnosis:</label>
                <input
                  placeholder="e.g. Zinc & Magnesium deficiency chlorosis with secondary fungal spotting"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  style={{ padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid var(--border-light)', fontSize: '0.8125rem' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600 }}>Recommended Spray / Medicines & Dosage:</label>
                <textarea
                  rows={3}
                  placeholder="e.g. 1. Zinc Sulphate 0.5% (5g/L) + Urea 1% foliar spray. 2. Hexaconazole 5% SC @ 2ml/L water for leaf spot control."
                  value={medicines}
                  onChange={(e) => setMedicines(e.target.value)}
                  style={{ padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid var(--border-light)', fontSize: '0.8125rem' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600 }}>Follow-up Instructions & Date:</label>
                <input
                  placeholder="Repeat foliar spray after 12 days. Check soil moisture before spraying."
                  value={followUp}
                  onChange={(e) => setFollowUp(e.target.value)}
                  style={{ padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid var(--border-light)', fontSize: '0.8125rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '1rem' }}>
                {prescribedSuccess && (
                  <span style={{ fontSize: '0.8125rem', color: '#15803d', fontWeight: 600 }}>
                    ✓ Prescription dispatched to farmer app!
                  </span>
                )}
                <button onClick={handleSavePrescription} className="btn-primary">
                  <span>💊</span> Dispatch Prescription
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Select a consultation from the queue to view details.
          </div>
        )}
      </div>
    </div>
  );
};
