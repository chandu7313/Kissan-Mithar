import React, { useState, useEffect } from 'react';
import {
  Sprout,
  Activity,
  TreeDeciduous,
  Filter,
  Eye,
  CheckCircle,
  Clock,
  AlertTriangle,
  FileText,
  User,
  Phone,
  Calendar,
  Layers,
  ArrowRight,
} from 'lucide-react';
import {
  ServiceOperationsApi,
  FertilizerRequestItem,
  DiseaseRequestItem,
} from '../../api/serviceOperations.api.js';
import { DataTable, Column } from '../../components/common/DataTable.js';
import { FilterBar, FilterSelect } from '../../components/common/FilterBar.js';
import { Pagination } from '../../components/common/Pagination.js';
import { Drawer } from '../../components/common/Drawer.js';
import { ConfirmationModal } from '../../components/common/ConfirmationModal.js';
import { AudioPlayer } from '../../components/common/AudioPlayer.js';
import { ImageGallery } from '../../components/common/ImageGallery.js';

interface Props {
  onNavigateToOrchards?: () => void;
}

export const ServicesPage: React.FC<Props> = ({ onNavigateToOrchards }) => {
  const [activeTab, setActiveTab] = useState<'fertilizer' | 'disease'>('fertilizer');
  
  // Fertilizer state
  const [fertList, setFertList] = useState<FertilizerRequestItem[]>([]);
  const [fertTotal, setFertTotal] = useState<number>(0);
  const [fertPage, setFertPage] = useState<number>(1);
  const [fertLimit, setFertLimit] = useState<number>(10);
  const [fertStatus, setFertStatus] = useState<string>('ALL');
  const [fertSearch, setFertSearch] = useState<string>('');
  const [selectedFert, setSelectedFert] = useState<FertilizerRequestItem | null>(null);

  // Disease state
  const [diseaseList, setDiseaseList] = useState<DiseaseRequestItem[]>([]);
  const [diseaseTotal, setDiseaseTotal] = useState<number>(0);
  const [diseasePage, setDiseasePage] = useState<number>(1);
  const [diseaseLimit, setDiseaseLimit] = useState<number>(10);
  const [diseaseStatus, setDiseaseStatus] = useState<string>('ALL');
  const [diseaseSearch, setDiseaseSearch] = useState<string>('');
  const [selectedDisease, setSelectedDisease] = useState<DiseaseRequestItem | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Status Change State
  const [statusModalOpen, setStatusModalOpen] = useState<boolean>(false);
  const [targetNewStatus, setTargetNewStatus] = useState<string>('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);

  // Load Fertilizer Requests
  const loadFertilizers = () => {
    setIsLoading(true);
    ServiceOperationsApi.listFertilizers({
      page: fertPage,
      limit: fertLimit,
      status: fertStatus !== 'ALL' ? fertStatus : undefined,
      search: fertSearch.trim() || undefined,
    })
      .then((res) => {
        setFertList(res.data);
        setFertTotal(res.total);
      })
      .catch((err) => console.error('[ServicesPage] Failed to fetch fertilizers:', err))
      .finally(() => setIsLoading(false));
  };

  // Load Disease Requests
  const loadDiseases = () => {
    setIsLoading(true);
    ServiceOperationsApi.listDiseases({
      page: diseasePage,
      limit: diseaseLimit,
      status: diseaseStatus !== 'ALL' ? diseaseStatus : undefined,
      search: diseaseSearch.trim() || undefined,
    })
      .then((res) => {
        setDiseaseList(res.data);
        setDiseaseTotal(res.total);
      })
      .catch((err) => console.error('[ServicesPage] Failed to fetch diseases:', err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    if (activeTab === 'fertilizer') {
      loadFertilizers();
    } else {
      loadDiseases();
    }
  }, [activeTab, fertPage, fertLimit, fertStatus, diseasePage, diseaseLimit, diseaseStatus]);

  // Debounced search
  useEffect(() => {
    const handler = setTimeout(() => {
      if (activeTab === 'fertilizer') {
        setFertPage(1);
        loadFertilizers();
      } else {
        setDiseasePage(1);
        loadDiseases();
      }
    }, 350);
    return () => clearTimeout(handler);
  }, [fertSearch, diseaseSearch]);

  const handleUpdateStatusConfirm = async () => {
    if (!targetNewStatus) return;
    setIsUpdatingStatus(true);
    try {
      if (activeTab === 'fertilizer' && selectedFert) {
        const updated = await ServiceOperationsApi.updateFertilizerStatus(selectedFert.id, targetNewStatus as any);
        setSelectedFert({ ...selectedFert, status: updated.status });
        loadFertilizers();
      } else if (activeTab === 'disease' && selectedDisease) {
        const updated = await ServiceOperationsApi.updateDiseaseStatus(selectedDisease.id, targetNewStatus as any);
        setSelectedDisease({ ...selectedDisease, status: updated.status });
        loadDiseases();
      }
      setStatusModalOpen(false);
    } catch (err) {
      console.error('[ServicesPage] Status update failed:', err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Columns for Fertilizer Table
  const fertColumns: Column<FertilizerRequestItem>[] = [
    {
      key: 'farmer',
      header: 'Farmer & Contact',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600, color: '#0f172a' }}>{row.farmer.name}</div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
            {row.farmer.phoneNumber} • {row.farmer.village || 'Kashmir'}
          </div>
        </div>
      ),
    },
    {
      key: 'crop',
      header: 'Crop & Land',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600, color: '#166534' }}>{row.cropType || 'Apple Orchard'}</div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
            {row.landAcres ? `${row.landAcres} Acres` : '—'} • {row.soilType || 'Soil not specified'}
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Review Status',
      render: (row) => (
        <span
          style={{
            padding: '0.2rem 0.6rem',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: 700,
            backgroundColor:
              row.status === 'COMPLETED' || row.status === 'PLAN_READY'
                ? '#dcfce7'
                : row.status === 'SUBMITTED'
                ? '#fef3c7'
                : '#eff6ff',
            color:
              row.status === 'COMPLETED' || row.status === 'PLAN_READY'
                ? '#15803d'
                : row.status === 'SUBMITTED'
                ? '#b45309'
                : '#1d4ed8',
          }}
        >
          {row.status}
        </span>
      ),
    },
    {
      key: 'submitted',
      header: 'Submitted',
      render: (row) => (
        <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>
          {new Date(row.submittedAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Action',
      render: (row) => (
        <button
          onClick={() => setSelectedFert(row)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.375rem',
            padding: '0.375rem 0.75rem',
            borderRadius: '8px',
            border: '1px solid #cbd5e1',
            backgroundColor: '#ffffff',
            color: '#166534',
            fontSize: '0.8125rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <Eye size={14} />
          <span>Review Request</span>
        </button>
      ),
    },
  ];

  // Columns for Disease Table
  const diseaseColumns: Column<DiseaseRequestItem>[] = [
    {
      key: 'farmer',
      header: 'Farmer & Contact',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600, color: '#0f172a' }}>{row.farmer.name}</div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
            {row.farmer.phoneNumber} • {row.farmer.village || 'Kashmir'}
          </div>
        </div>
      ),
    },
    {
      key: 'crop',
      header: 'Affected Crop & Part',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600, color: '#b45309' }}>{row.cropType || 'Apple (Kashmir)'}</div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
            Affected: {row.affectedPart || 'Foliage / Fruit'} • Spread: {row.spreadRate || 'Medium'}
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <span
          style={{
            padding: '0.2rem 0.6rem',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: 700,
            backgroundColor:
              row.status === 'COMPLETED' || row.status === 'DIAGNOSED'
                ? '#dcfce7'
                : row.status === 'SUBMITTED'
                ? '#fef3c7'
                : '#eff6ff',
            color:
              row.status === 'COMPLETED' || row.status === 'DIAGNOSED'
                ? '#15803d'
                : row.status === 'SUBMITTED'
                ? '#b45309'
                : '#1d4ed8',
          }}
        >
          {row.status}
        </span>
      ),
    },
    {
      key: 'submitted',
      header: 'Submitted',
      render: (row) => (
        <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>
          {new Date(row.submittedAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Action',
      render: (row) => (
        <button
          onClick={() => setSelectedDisease(row)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.375rem',
            padding: '0.375rem 0.75rem',
            borderRadius: '8px',
            border: '1px solid #cbd5e1',
            backgroundColor: '#ffffff',
            color: '#166534',
            fontSize: '0.8125rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <Eye size={14} />
          <span>Review Pathology</span>
        </button>
      ),
    },
  ];

  const statusOptions = [
    { label: 'All Statuses', value: 'ALL' },
    { label: 'Submitted (New)', value: 'SUBMITTED' },
    { label: 'Under Review', value: 'UNDER_REVIEW' },
    { label: 'Expert Assigned', value: 'EXPERT_ASSIGNED' },
    { label: 'Plan Ready / Diagnosed', value: 'PLAN_READY' },
    { label: 'Completed', value: 'COMPLETED' },
    { label: 'Cancelled', value: 'CANCELLED' },
  ];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Top Banner & Quick Links */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          padding: '1.25rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem 0' }}>
            Agronomy Service Operations Desk
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>
            Triage, diagnostic analysis, and advisory delivery for Soil & Fertilizer guidance and Crop Pathology requests.
          </p>
        </div>

        {onNavigateToOrchards && (
          <button
            onClick={onNavigateToOrchards}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              backgroundColor: '#f0fdf4',
              border: '1px solid #bbf7d0',
              color: '#166534',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <TreeDeciduous size={16} />
            <span>Switch to Orchard Surveys</span>
            <ArrowRight size={14} />
          </button>
        )}
      </div>

      {/* Workspace Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
        <button
          onClick={() => setActiveTab('fertilizer')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.625rem 1.25rem',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: activeTab === 'fertilizer' ? '#166534' : 'transparent',
            color: activeTab === 'fertilizer' ? '#ffffff' : '#64748b',
            fontWeight: 700,
            fontSize: '0.875rem',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <Sprout size={16} />
          <span>Soil & Fertilizer Guidance ({fertTotal})</span>
        </button>

        <button
          onClick={() => setActiveTab('disease')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.625rem 1.25rem',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: activeTab === 'disease' ? '#166534' : 'transparent',
            color: activeTab === 'disease' ? '#ffffff' : '#64748b',
            fontWeight: 700,
            fontSize: '0.875rem',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <Activity size={16} />
          <span>Crop Pathology & Disease ({diseaseTotal})</span>
        </button>
      </div>

      {/* Main Table & Filters */}
      {activeTab === 'fertilizer' ? (
        <>
          <FilterBar
            searchQuery={fertSearch}
            onSearchChange={setFertSearch}
            searchPlaceholder="Search fertilizer requests by farmer name, phone, or crop..."
            filters={[
              {
                key: 'fertStatus',
                label: 'Status',
                value: fertStatus,
                options: statusOptions,
                onChange: (v) => {
                  setFertStatus(v);
                  setFertPage(1);
                },
              },
            ]}
            onReset={() => {
              setFertSearch('');
              setFertStatus('ALL');
            }}
            onRefresh={loadFertilizers}
            isRefreshing={isLoading}
          />

          <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <DataTable
              columns={fertColumns}
              data={fertList}
              isLoading={isLoading}
              keyExtractor={(r) => r.id}
              emptyMessage="No soil & fertilizer requests found matching the current filters."
            />
            <Pagination
              currentPage={fertPage}
              totalItems={fertTotal}
              pageSize={fertLimit}
              onPageChange={setFertPage}
              onPageSizeChange={(newLimit) => {
                setFertLimit(newLimit);
                setFertPage(1);
              }}
            />
          </div>
        </>
      ) : (
        <>
          <FilterBar
            searchQuery={diseaseSearch}
            onSearchChange={setDiseaseSearch}
            searchPlaceholder="Search pathology requests by farmer name, phone, or crop..."
            filters={[
              {
                key: 'diseaseStatus',
                label: 'Status',
                value: diseaseStatus,
                options: statusOptions,
                onChange: (v) => {
                  setDiseaseStatus(v);
                  setDiseasePage(1);
                },
              },
            ]}
            onReset={() => {
              setDiseaseSearch('');
              setDiseaseStatus('ALL');
            }}
            onRefresh={loadDiseases}
            isRefreshing={isLoading}
          />

          <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <DataTable
              columns={diseaseColumns}
              data={diseaseList}
              isLoading={isLoading}
              keyExtractor={(r) => r.id}
              emptyMessage="No crop disease pathology requests found matching the current filters."
            />
            <Pagination
              currentPage={diseasePage}
              totalItems={diseaseTotal}
              pageSize={diseaseLimit}
              onPageChange={setDiseasePage}
              onPageSizeChange={(newLimit) => {
                setDiseaseLimit(newLimit);
                setDiseasePage(1);
              }}
            />
          </div>
        </>
      )}

      {/* Drawer: Fertilizer Request Inspection */}
      <Drawer
        isOpen={Boolean(selectedFert)}
        onClose={() => setSelectedFert(null)}
        title={selectedFert ? `Fertilizer Request: ${selectedFert.cropType || 'Crop Guidance'}` : ''}
        subtitle={selectedFert ? `Farmer: ${selectedFert.farmer.name} (${selectedFert.farmer.phoneNumber})` : undefined}
        width="620px"
        footer={
          selectedFert && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>Change Status:</span>
                <select
                  value={selectedFert.status}
                  onChange={(e) => {
                    setTargetNewStatus(e.target.value);
                    setStatusModalOpen(true);
                  }}
                  style={{
                    padding: '0.4rem 0.6rem',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                  }}
                >
                  <option value="SUBMITTED">Submitted</option>
                  <option value="UNDER_REVIEW">Under Review</option>
                  <option value="EXPERT_ASSIGNED">Expert Assigned</option>
                  <option value="PLAN_READY">Plan Ready</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

              <button
                onClick={() => setSelectedFert(null)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  color: '#475569',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Close Drawer
              </button>
            </div>
          )
        }
      >
        {selectedFert && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Agronomic Summary Box */}
            <div style={{ padding: '1rem', borderRadius: '10px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.8125rem' }}>
                <div>
                  <span style={{ color: '#64748b' }}>Soil Type:</span>
                  <div style={{ fontWeight: 600, color: '#0f172a' }}>{selectedFert.soilType || 'Not specified'}</div>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Landholding:</span>
                  <div style={{ fontWeight: 600, color: '#0f172a' }}>{selectedFert.landAcres ? `${selectedFert.landAcres} Acres` : 'N/A'}</div>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Irrigation Type:</span>
                  <div style={{ fontWeight: 600, color: '#0f172a' }}>{selectedFert.irrigationType || 'Drip / Traditional'}</div>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Problem Category:</span>
                  <div style={{ fontWeight: 600, color: '#166534' }}>{selectedFert.problemCategory || 'Nutrient deficiency'}</div>
                </div>
              </div>
            </div>

            {/* Farmer's Issue Description */}
            <div>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.5rem 0' }}>
                Farmer's Problem Description
              </h4>
              <div
                style={{
                  padding: '0.75rem',
                  borderRadius: '8px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.875rem',
                  color: '#334155',
                  lineHeight: 1.5,
                }}
              >
                {selectedFert.issueDescription || 'No written description provided by farmer.'}
              </div>
            </div>

            {/* Audio Voice Note */}
            <div>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.5rem 0' }}>
                Voice Note (Kashmiri / Urdu / English)
              </h4>
              <AudioPlayer url={selectedFert.voiceNoteUrl || undefined} title="Farmer Problem Voice Note" />
              {selectedFert.voiceText && (
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem' }}>
                  <strong>Transcription:</strong> {selectedFert.voiceText}
                </div>
              )}
            </div>

            {/* Photos */}
            {selectedFert.photos && Array.isArray(selectedFert.photos) && selectedFert.photos.length > 0 && (
              <div>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.5rem 0' }}>
                  Soil & Foliage Photos ({selectedFert.photos.length})
                </h4>
                <ImageGallery images={selectedFert.photos} />
              </div>
            )}
          </div>
        )}
      </Drawer>

      {/* Drawer: Disease Request Inspection */}
      <Drawer
        isOpen={Boolean(selectedDisease)}
        onClose={() => setSelectedDisease(null)}
        title={selectedDisease ? `Disease Diagnosis: ${selectedDisease.cropType || 'Crop Pathology'}` : ''}
        subtitle={selectedDisease ? `Farmer: ${selectedDisease.farmer.name} (${selectedDisease.farmer.phoneNumber})` : undefined}
        width="620px"
        footer={
          selectedDisease && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>Change Status:</span>
                <select
                  value={selectedDisease.status}
                  onChange={(e) => {
                    setTargetNewStatus(e.target.value);
                    setStatusModalOpen(true);
                  }}
                  style={{
                    padding: '0.4rem 0.6rem',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                  }}
                >
                  <option value="SUBMITTED">Submitted</option>
                  <option value="UNDER_REVIEW">Under Review</option>
                  <option value="EXPERT_ASSIGNED">Expert Assigned</option>
                  <option value="DIAGNOSED">Diagnosed</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

              <button
                onClick={() => setSelectedDisease(null)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  color: '#475569',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Close Drawer
              </button>
            </div>
          )
        }
      >
        {selectedDisease && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Pathology Symptoms Box */}
            <div style={{ padding: '1rem', borderRadius: '10px', backgroundColor: '#fef2f2', border: '1px solid #fecaca' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.8125rem' }}>
                <div>
                  <span style={{ color: '#991b1b' }}>Affected Plant Part:</span>
                  <div style={{ fontWeight: 600, color: '#0f172a' }}>{selectedDisease.affectedPart || 'Leaves / Stem'}</div>
                </div>
                <div>
                  <span style={{ color: '#991b1b' }}>Spread Rate:</span>
                  <div style={{ fontWeight: 600, color: '#0f172a' }}>{selectedDisease.spreadRate || 'Rapid'}</div>
                </div>
                <div>
                  <span style={{ color: '#991b1b' }}>Prior Pesticides:</span>
                  <div style={{ fontWeight: 600, color: '#0f172a' }}>{selectedDisease.previousPesticides || 'None applied'}</div>
                </div>
                <div>
                  <span style={{ color: '#991b1b' }}>Crop Age:</span>
                  <div style={{ fontWeight: 600, color: '#0f172a' }}>{selectedDisease.cropAge || 'Matured trees'}</div>
                </div>
              </div>
            </div>

            {/* Farmer's Symptoms Description */}
            <div>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.5rem 0' }}>
                Observed Symptoms & Blight Pattern
              </h4>
              <div
                style={{
                  padding: '0.75rem',
                  borderRadius: '8px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.875rem',
                  color: '#334155',
                  lineHeight: 1.5,
                }}
              >
                {selectedDisease.symptomDescription || 'No written symptom details provided.'}
              </div>
            </div>

            {/* Audio Voice Note */}
            <div>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.5rem 0' }}>
                Voice Note (Farmer Observation)
              </h4>
              <AudioPlayer url={selectedDisease.voiceNoteUrl || undefined} title="Farmer Symptom Voice Note" />
            </div>

            {/* Symptoms Photos */}
            {selectedDisease.photos && Array.isArray(selectedDisease.photos) && selectedDisease.photos.length > 0 && (
              <div>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.5rem 0' }}>
                  Infected Foliage / Crop Photos ({selectedDisease.photos.length})
                </h4>
                <ImageGallery images={selectedDisease.photos} />
              </div>
            )}
          </div>
        )}
      </Drawer>

      {/* Confirmation Modal for Status Updates */}
      <ConfirmationModal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        onConfirm={handleUpdateStatusConfirm}
        title="Update Service Request Status"
        message={`Are you sure you want to change the status of this request to "${targetNewStatus}"? This will be recorded in the system audit trail.`}
        confirmText="Confirm Status Update"
        isLoading={isUpdatingStatus}
      />

    </div>
  );
};
