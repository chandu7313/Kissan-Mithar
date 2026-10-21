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
  UserCheck,
  ShieldAlert,
  FileCheck,
  CalendarCheck,
  Sparkles,
  Plus,
  Edit3,
  IndianRupee,
  HelpCircle,
} from 'lucide-react';
import {
  ServiceOperationsApi,
  FertilizerRequestItem,
  DiseaseRequestItem,
  FertilizerPlanPayload,
  DiseaseTreatmentPayload,
} from '../../api/serviceOperations.api.js';
import { ExpertApi, Expert } from '../../api/expert.api.js';
import { FertilizerPlanModal } from '../../components/services/FertilizerPlanModal.js';
import { DiseaseTreatmentModal } from '../../components/services/DiseaseTreatmentModal.js';
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

  // Experts Directory State
  const [experts, setExperts] = useState<Expert[]>([]);
  const [selectedExpertId, setSelectedExpertId] = useState<string>('');
  const [isAssigningExpert, setIsAssigningExpert] = useState<boolean>(false);

  // Prescription Modals State
  const [fertilizerModalOpen, setFertilizerModalOpen] = useState<boolean>(false);
  const [diseaseTreatmentModalOpen, setDiseaseTreatmentModalOpen] = useState<boolean>(false);

  // Load Experts List on Mount
  useEffect(() => {
    ExpertApi.listExperts()
      .then((res) => setExperts(res))
      .catch((err) => console.warn('[ServicesPage] Could not load experts:', err));
  }, []);

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

  // Load full details upon selecting a row
  const handleSelectFert = async (row: FertilizerRequestItem) => {
    setSelectedFert(row);
    try {
      const full = await ServiceOperationsApi.getFertilizerRequestById(row.id);
      if (full) setSelectedFert(full);
    } catch {}
  };

  const handleSelectDisease = async (row: DiseaseRequestItem) => {
    setSelectedDisease(row);
    try {
      const full = await ServiceOperationsApi.getDiseaseRequestById(row.id);
      if (full) setSelectedDisease(full);
    } catch {}
  };

  // Expert Assignment Handlers
  const handleAssignFertilizerExpert = async (expertId: string) => {
    if (!selectedFert || !expertId) return;
    setIsAssigningExpert(true);
    try {
      const updated = await ServiceOperationsApi.assignFertilizerExpert(selectedFert.id, expertId);
      setSelectedFert((prev) => (prev ? { ...prev, expertId: updated.expertId, expert: updated.expert, status: updated.status } : null));
      loadFertilizers();
    } catch (err) {
      console.error('[ServicesPage] Failed to assign fertilizer expert:', err);
    } finally {
      setIsAssigningExpert(false);
    }
  };

  const handleAssignDiseaseExpert = async (expertId: string) => {
    if (!selectedDisease || !expertId) return;
    setIsAssigningExpert(true);
    try {
      const updated = await ServiceOperationsApi.assignDiseaseExpert(selectedDisease.id, expertId);
      setSelectedDisease((prev) => (prev ? { ...prev, expertId: updated.expertId, expert: updated.expert, status: updated.status } : null));
      loadDiseases();
    } catch (err) {
      console.error('[ServicesPage] Failed to assign disease expert:', err);
    } finally {
      setIsAssigningExpert(false);
    }
  };

  // Prescription Plan Handlers
  const handleSubmitFertilizerPlan = async (plan: FertilizerPlanPayload) => {
    if (!selectedFert) return;
    await ServiceOperationsApi.createFertilizerPlan(selectedFert.id, plan);
    const refreshed = await ServiceOperationsApi.getFertilizerRequestById(selectedFert.id);
    setSelectedFert(refreshed);
    loadFertilizers();
  };

  const handleSubmitDiseaseTreatment = async (treatment: DiseaseTreatmentPayload) => {
    if (!selectedDisease) return;
    await ServiceOperationsApi.createDiseaseTreatment(selectedDisease.id, treatment);
    const refreshed = await ServiceOperationsApi.getDiseaseRequestById(selectedDisease.id);
    setSelectedDisease(refreshed);
    loadDiseases();
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
          onClick={() => handleSelectFert(row)}
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
          onClick={() => handleSelectDisease(row)}
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
            {/* Agronomist Assignment Card */}
            <div
              style={{
                padding: '1rem',
                borderRadius: '10px',
                border: '1px solid #e2e8f0',
                backgroundColor: '#ffffff',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <UserCheck size={16} color="#166534" />
                  <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0f172a' }}>
                    Assigned Agronomy Specialist
                  </span>
                </div>
                {selectedFert.expert && (
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#166534', backgroundColor: '#dcfce7', padding: '0.15rem 0.5rem', borderRadius: '9999px' }}>
                    Active Assignment
                  </span>
                )}
              </div>

              {selectedFert.expert ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.875rem' }}>
                      {selectedFert.expert.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      {selectedFert.expert.specialization || 'Soil & Agronomy Consultant'}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <select
                      onChange={(e) => {
                        if (e.target.value) handleAssignFertilizerExpert(e.target.value);
                      }}
                      defaultValue=""
                      disabled={isAssigningExpert}
                      style={{
                        padding: '0.35rem 0.5rem',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.75rem',
                        color: '#475569',
                      }}
                    >
                      <option value="" disabled>
                        Reassign specialist...
                      </option>
                      {experts.map((exp) => (
                        <option key={exp.id} value={exp.id}>
                          {exp.name} ({exp.specialization})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
                  <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>
                    No agronomist assigned yet:
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <select
                      id="assignFertExpertSelect"
                      defaultValue=""
                      style={{
                        padding: '0.35rem 0.5rem',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.75rem',
                      }}
                    >
                      <option value="" disabled>
                        Select agronomist...
                      </option>
                      {experts.map((exp) => (
                        <option key={exp.id} value={exp.id}>
                          {exp.name} ({exp.specialization})
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => {
                        const el = document.getElementById('assignFertExpertSelect') as HTMLSelectElement;
                        if (el && el.value) handleAssignFertilizerExpert(el.value);
                      }}
                      disabled={isAssigningExpert}
                      style={{
                        padding: '0.35rem 0.75rem',
                        borderRadius: '6px',
                        backgroundColor: '#166534',
                        color: '#ffffff',
                        border: 'none',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      {isAssigningExpert ? 'Assigning...' : 'Assign'}
                    </button>
                  </div>
                </div>
              )}
            </div>

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

            {/* Official Fertilizer Recommendation Schedule */}
            <div
              style={{
                padding: '1.25rem',
                borderRadius: '12px',
                border: '1px solid #bbf7d0',
                backgroundColor: '#f0fdf4',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Sprout size={18} color="#166534" />
                  <h4 style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#166534', margin: 0 }}>
                    Official Fertilizer Recommendation Schedule
                  </h4>
                </div>

                <button
                  onClick={() => setFertilizerModalOpen(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.375rem',
                    padding: '0.375rem 0.75rem',
                    borderRadius: '6px',
                    backgroundColor: '#166534',
                    color: '#ffffff',
                    border: 'none',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {selectedFert.plan ? <Edit3 size={12} /> : <Plus size={12} />}
                  <span>{selectedFert.plan ? 'Update Schedule' : 'Formulate Schedule'}</span>
                </button>
              </div>

              {selectedFert.plan ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#15803d', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Clinical Diagnosis
                    </div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a', marginTop: '0.125rem' }}>
                      {selectedFert.plan.diagnosis}
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: '#334155', marginTop: '0.25rem', lineHeight: 1.4 }}>
                      {selectedFert.plan.summary}
                    </div>
                  </div>

                  {selectedFert.plan.estimatedBudget && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', color: '#166534', fontWeight: 700 }}>
                      <IndianRupee size={14} />
                      <span>Estimated Nutritional Budget: ₹{selectedFert.plan.estimatedBudget.toLocaleString()}</span>
                    </div>
                  )}

                  {selectedFert.plan.schedule && Array.isArray(selectedFert.plan.schedule) && selectedFert.plan.schedule.length > 0 && (
                    <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #cbd5e1', overflow: 'hidden' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
                        <thead>
                          <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#475569' }}>
                            <th style={{ padding: '0.5rem 0.75rem' }}>Stage & Timing</th>
                            <th style={{ padding: '0.5rem 0.75rem' }}>Fertilizers & Dosage</th>
                            <th style={{ padding: '0.5rem 0.75rem' }}>Method & Notes</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedFert.plan.schedule.map((stg: any, sIdx: number) => (
                            <tr key={sIdx} style={{ borderBottom: sIdx === selectedFert.plan!.schedule.length - 1 ? 'none' : '1px solid #f1f5f9' }}>
                              <td style={{ padding: '0.5rem 0.75rem', verticalAlign: 'top', fontWeight: 600, color: '#0f172a' }}>
                                <div>{stg.stage}</div>
                                <div style={{ fontSize: '0.6875rem', color: '#64748b' }}>{stg.timing}</div>
                              </td>
                              <td style={{ padding: '0.5rem 0.75rem', verticalAlign: 'top' }}>
                                {stg.fertilizers && Array.isArray(stg.fertilizers) ? (
                                  stg.fertilizers.map((f: any, fIdx: number) => (
                                    <div key={fIdx} style={{ marginBottom: '0.25rem' }}>
                                      <strong style={{ color: '#166534' }}>{f.name}:</strong> {f.dosage}
                                    </div>
                                  ))
                                ) : (
                                  '—'
                                )}
                              </td>
                              <td style={{ padding: '0.5rem 0.75rem', verticalAlign: 'top', color: '#475569' }}>
                                {stg.fertilizers && stg.fertilizers[0]?.method && (
                                  <div style={{ fontWeight: 600 }}>{stg.fertilizers[0].method}</div>
                                )}
                                {stg.notes && <div style={{ fontStyle: 'italic', fontSize: '0.6875rem' }}>{stg.notes}</div>}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {(selectedFert.plan.soilTreatment || selectedFert.plan.organicAlternatives) && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.75rem' }}>
                      {selectedFert.plan.soilTreatment && (
                        <div style={{ padding: '0.5rem', backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                          <strong style={{ color: '#0f172a' }}>Soil Amendment:</strong> {selectedFert.plan.soilTreatment}
                        </div>
                      )}
                      {selectedFert.plan.organicAlternatives && (
                        <div style={{ padding: '0.5rem', backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                          <strong style={{ color: '#15803d' }}>Organic Options:</strong> {selectedFert.plan.organicAlternatives}
                        </div>
                      )}
                    </div>
                  )}

                  {selectedFert.plan.precautions && (
                    <div style={{ fontSize: '0.75rem', color: '#b45309', backgroundColor: '#fef3c7', padding: '0.5rem', borderRadius: '6px', border: '1px solid #fde68a' }}>
                      <strong>Precautions:</strong> {selectedFert.plan.precautions}
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '1rem', color: '#64748b', fontSize: '0.8125rem' }}>
                  No customized fertilizer plan has been formulated yet. Formulate and deliver a multi-stage schedule to the farmer's mobile app.
                </div>
              )}
            </div>
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
            {/* Plant Pathologist Assignment Card */}
            <div
              style={{
                padding: '1rem',
                borderRadius: '10px',
                border: '1px solid #e2e8f0',
                backgroundColor: '#ffffff',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <UserCheck size={16} color="#c2410c" />
                  <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0f172a' }}>
                    Assigned Plant Pathologist
                  </span>
                </div>
                {selectedDisease.expert && (
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#c2410c', backgroundColor: '#fed7aa', padding: '0.15rem 0.5rem', borderRadius: '9999px' }}>
                    Active Assignment
                  </span>
                )}
              </div>

              {selectedDisease.expert ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.875rem' }}>
                      {selectedDisease.expert.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      {selectedDisease.expert.specialization || 'Plant Pathology Specialist'}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <select
                      onChange={(e) => {
                        if (e.target.value) handleAssignDiseaseExpert(e.target.value);
                      }}
                      defaultValue=""
                      disabled={isAssigningExpert}
                      style={{
                        padding: '0.35rem 0.5rem',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.75rem',
                        color: '#475569',
                      }}
                    >
                      <option value="" disabled>
                        Reassign pathologist...
                      </option>
                      {experts.map((exp) => (
                        <option key={exp.id} value={exp.id}>
                          {exp.name} ({exp.specialization})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
                  <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>
                    No pathologist assigned yet:
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <select
                      id="assignDiseaseExpertSelect"
                      defaultValue=""
                      style={{
                        padding: '0.35rem 0.5rem',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.75rem',
                      }}
                    >
                      <option value="" disabled>
                        Select pathologist...
                      </option>
                      {experts.map((exp) => (
                        <option key={exp.id} value={exp.id}>
                          {exp.name} ({exp.specialization})
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => {
                        const el = document.getElementById('assignDiseaseExpertSelect') as HTMLSelectElement;
                        if (el && el.value) handleAssignDiseaseExpert(el.value);
                      }}
                      disabled={isAssigningExpert}
                      style={{
                        padding: '0.35rem 0.75rem',
                        borderRadius: '6px',
                        backgroundColor: '#c2410c',
                        color: '#ffffff',
                        border: 'none',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      {isAssigningExpert ? 'Assigning...' : 'Assign'}
                    </button>
                  </div>
                </div>
              )}
            </div>

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

            {/* Official Pathology Prescription Section */}
            <div
              style={{
                padding: '1.25rem',
                borderRadius: '12px',
                border: '1px solid #fed7aa',
                backgroundColor: '#fff7ed',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Activity size={18} color="#c2410c" />
                  <h4 style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#c2410c', margin: 0 }}>
                    Official Plant Pathology Prescription
                  </h4>
                </div>

                <button
                  onClick={() => setDiseaseTreatmentModalOpen(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.375rem',
                    padding: '0.375rem 0.75rem',
                    borderRadius: '6px',
                    backgroundColor: '#c2410c',
                    color: '#ffffff',
                    border: 'none',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {selectedDisease.treatment ? <Edit3 size={12} /> : <Plus size={12} />}
                  <span>{selectedDisease.treatment ? 'Update Prescription' : 'Formulate Prescription'}</span>
                </button>
              </div>

              {selectedDisease.treatment ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <span
                        style={{
                          fontSize: '0.6875rem',
                          fontWeight: 800,
                          padding: '0.15rem 0.5rem',
                          borderRadius: '9999px',
                          backgroundColor:
                            selectedDisease.treatment.severity === 'CRITICAL'
                              ? '#fee2e2'
                              : selectedDisease.treatment.severity === 'HIGH'
                              ? '#ffedd5'
                              : '#fef3c7',
                          color:
                            selectedDisease.treatment.severity === 'CRITICAL'
                              ? '#dc2626'
                              : selectedDisease.treatment.severity === 'HIGH'
                              ? '#c2410c'
                              : '#b45309',
                        }}
                      >
                        {selectedDisease.treatment.severity || 'MEDIUM'} SEVERITY
                      </span>
                      {selectedDisease.treatment.causalOrganism && (
                        <span style={{ fontSize: '0.75rem', color: '#64748b', fontStyle: 'italic' }}>
                          Pathogen: {selectedDisease.treatment.causalOrganism}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                      {selectedDisease.treatment.diseaseName}
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: '#334155', marginTop: '0.25rem', lineHeight: 1.4 }}>
                      {selectedDisease.treatment.diagnosisSummary}
                    </div>
                  </div>

                  {/* Immediate Emergency Action Alert Box */}
                  <div
                    style={{
                      padding: '0.75rem',
                      borderRadius: '8px',
                      backgroundColor: '#fef2f2',
                      border: '1px solid #fca5a5',
                      fontSize: '0.8125rem',
                      color: '#991b1b',
                      lineHeight: 1.4,
                    }}
                  >
                    <strong>🚨 Immediate Emergency Action:</strong> {selectedDisease.treatment.immediateAction}
                  </div>

                  {/* Estimated Cost & Follow-up */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.8125rem', color: '#475569' }}>
                    {selectedDisease.treatment.estimatedCost && (
                      <span style={{ fontWeight: 700, color: '#c2410c', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <IndianRupee size={14} />
                        Estimated Cost: ₹{selectedDisease.treatment.estimatedCost.toLocaleString()}
                      </span>
                    )}
                    {selectedDisease.treatment.followUpDays && (
                      <span style={{ fontWeight: 600 }}>
                        📅 Follow-up inspection: Every {selectedDisease.treatment.followUpDays} days
                      </span>
                    )}
                  </div>

                  {/* Chemical Treatment Table */}
                  {selectedDisease.treatment.chemicalTreatment &&
                    Array.isArray(selectedDisease.treatment.chemicalTreatment) &&
                    selectedDisease.treatment.chemicalTreatment.length > 0 && (
                      <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #cbd5e1', overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
                          <thead>
                            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#475569' }}>
                              <th style={{ padding: '0.5rem 0.75rem' }}>Chemical & Brand</th>
                              <th style={{ padding: '0.5rem 0.75rem' }}>Dosage</th>
                              <th style={{ padding: '0.5rem 0.75rem' }}>Application & PHI</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedDisease.treatment.chemicalTreatment.map((chem: any, cIdx: number) => (
                              <tr key={cIdx} style={{ borderBottom: cIdx === selectedDisease.treatment!.chemicalTreatment.length - 1 ? 'none' : '1px solid #f1f5f9' }}>
                                <td style={{ padding: '0.5rem 0.75rem', verticalAlign: 'top', fontWeight: 600, color: '#0f172a' }}>
                                  <div>{chem.chemicalName}</div>
                                  <div style={{ fontSize: '0.6875rem', color: '#c2410c' }}>Brand: {chem.commercialBrand}</div>
                                </td>
                                <td style={{ padding: '0.5rem 0.75rem', verticalAlign: 'top', fontWeight: 600 }}>
                                  {chem.dosage}
                                </td>
                                <td style={{ padding: '0.5rem 0.75rem', verticalAlign: 'top', color: '#475569' }}>
                                  <div>{chem.applicationMethod}</div>
                                  {chem.waitingPeriodDays && (
                                    <div style={{ fontSize: '0.6875rem', color: '#dc2626', fontWeight: 600 }}>
                                      PHI: {chem.waitingPeriodDays} days
                                    </div>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                  {/* Organic & Cultural Controls */}
                  {(selectedDisease.treatment.organicTreatment || selectedDisease.treatment.preventativeMeasures) && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.75rem' }}>
                      {selectedDisease.treatment.organicTreatment && (
                        <div style={{ padding: '0.5rem', backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                          <strong style={{ color: '#15803d' }}>Bio/Organic:</strong> {selectedDisease.treatment.organicTreatment}
                        </div>
                      )}
                      {selectedDisease.treatment.preventativeMeasures && (
                        <div style={{ padding: '0.5rem', backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                          <strong style={{ color: '#0f172a' }}>Cultural Control:</strong> {selectedDisease.treatment.preventativeMeasures}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '1rem', color: '#64748b', fontSize: '0.8125rem' }}>
                  No pathology treatment plan formulated yet. Formulate and deliver scientific fungicide and cultural control instructions to the farmer.
                </div>
              )}
            </div>
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

      {/* Fertilizer Plan Formulation Modal */}
      <FertilizerPlanModal
        isOpen={fertilizerModalOpen}
        onClose={() => setFertilizerModalOpen(false)}
        onSubmit={handleSubmitFertilizerPlan}
        initialPlan={selectedFert?.plan ? {
          diagnosis: selectedFert.plan.diagnosis,
          summary: selectedFert.plan.summary,
          schedule: selectedFert.plan.schedule,
          organicAlternatives: selectedFert.plan.organicAlternatives || undefined,
          soilTreatment: selectedFert.plan.soilTreatment || undefined,
          precautions: (selectedFert.plan as any).precautions || undefined,
          estimatedBudget: selectedFert.plan.estimatedBudget || undefined,
        } : null}
        cropType={selectedFert?.cropType || undefined}
        landAcres={selectedFert?.landAcres}
      />

      {/* Disease Treatment Formulation Modal */}
      <DiseaseTreatmentModal
        isOpen={diseaseTreatmentModalOpen}
        onClose={() => setDiseaseTreatmentModalOpen(false)}
        onSubmit={handleSubmitDiseaseTreatment}
        initialTreatment={selectedDisease?.treatment ? {
          diseaseName: selectedDisease.treatment.diseaseName,
          causalOrganism: selectedDisease.treatment.causalOrganism || undefined,
          severity: selectedDisease.treatment.severity as any,
          diagnosisSummary: selectedDisease.treatment.diagnosisSummary,
          immediateAction: selectedDisease.treatment.immediateAction,
          chemicalTreatment: selectedDisease.treatment.chemicalTreatment,
          organicTreatment: selectedDisease.treatment.organicTreatment || undefined,
          preventativeMeasures: selectedDisease.treatment.preventativeMeasures || undefined,
          followUpDays: selectedDisease.treatment.followUpDays || undefined,
          estimatedCost: selectedDisease.treatment.estimatedCost || undefined,
        } : null}
        cropType={selectedDisease?.cropType || undefined}
        affectedPart={selectedDisease?.affectedPart || undefined}
      />

    </div>
  );
};
