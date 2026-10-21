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
  CheckCircle2,
  ChevronDown,
  MoreHorizontal,
  X,
  Link2,
  Send,
  Droplets,
  CloudRain,
  TrendingUp,
  Check,
  Search,
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
  const [activeTab, setActiveTab] = useState<'overview' | 'advisory' | 'soil' | 'fertilizer' | 'disease' | 'weather'>('overview');
  const [isCreateAdvisoryOpen, setIsCreateAdvisoryOpen] = useState<boolean>(false);
  const [trendsPeriod, setTrendsPeriod] = useState<string>('Last 6 Months');
  const [isTrendsOpen, setIsTrendsOpen] = useState<boolean>(false);
  const [activeActionId, setActiveActionId] = useState<string | null>(null);
  const [advisorySuccessMessage, setAdvisorySuccessMessage] = useState<string | null>(null);

  // New Advisory Form State
  const [advisoryForm, setAdvisoryForm] = useState({
    title: '',
    category: 'Crop Advisory',
    cropType: 'Paddy',
    priority: 'NORMAL',
    targetDistrict: 'All Districts',
    expertId: '',
    notes: '',
    farmerContact: '',
  });
  const [isSubmittingAdvisory, setIsSubmittingAdvisory] = useState<boolean>(false);

  const handleCreateAdvisorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!advisoryForm.title.trim() || !advisoryForm.notes.trim()) return;
    setIsSubmittingAdvisory(true);
    setTimeout(() => {
      setIsSubmittingAdvisory(false);
      setIsCreateAdvisoryOpen(false);
      setAdvisorySuccessMessage(`Advisory "${advisoryForm.title}" published successfully to ${advisoryForm.targetDistrict}!`);
      setAdvisoryForm({
        title: '',
        category: 'Crop Advisory',
        cropType: 'Paddy',
        priority: 'NORMAL',
        targetDistrict: 'All Districts',
        expertId: '',
        notes: '',
        farmerContact: '',
      });
      setTimeout(() => {
        setAdvisorySuccessMessage(null);
      }, 5000);
    }, 600);
  };
  
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

  // Load Initial Counts for Tabs on Mount
  useEffect(() => {
    loadFertilizers();
    loadDiseases();
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
    } else if (activeTab === 'disease') {
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
    <div
      className="animate-fade-in"
      style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
      onClick={() => {
        setIsTrendsOpen(false);
        setActiveActionId(null);
      }}
    >
      {advisorySuccessMessage && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.85rem 1.25rem',
            backgroundColor: '#ecfdf5',
            border: '1px solid #a7f3d0',
            borderRadius: '10px',
            color: '#065f46',
            fontSize: '0.875rem',
            fontWeight: 600,
            boxShadow: '0 1px 3px rgba(16, 185, 129, 0.1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <CheckCircle2 size={18} color="#059669" />
            <span>{advisorySuccessMessage}</span>
          </div>
          <button
            onClick={() => setAdvisorySuccessMessage(null)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#065f46',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: '0.2rem',
            }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* 1. TOP HEADER & ACTION BUTTONS MATCHING MOCKUP */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '1.75rem',
              fontWeight: 800,
              color: '#0f172a',
              margin: '0 0 0.25rem 0',
              letterSpacing: '-0.02em',
            }}
          >
            Agriculture Services
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>
            Manage crop advisory, soil analysis, fertilizer guidance and disease assistance
          </p>
        </div>

        <button
          onClick={() => setIsCreateAdvisoryOpen(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.55rem 1.15rem',
            borderRadius: '9px',
            border: 'none',
            backgroundColor: '#059669',
            color: '#ffffff',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(5, 150, 105, 0.25)',
            transition: 'background-color 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#047857')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#059669')}
        >
          <Plus size={16} strokeWidth={2.5} />
          <span>Create Advisory</span>
        </button>
      </div>

      {/* 2. SUB-NAVIGATION TABS MATCHING MOCKUP */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          borderBottom: '1px solid #e2e8f0',
          paddingBottom: '0.25rem',
          flexWrap: 'wrap',
        }}
      >
        {[
          { key: 'overview', label: 'Overview' },
          { key: 'advisory', label: 'Advisory' },
          { key: 'soil', label: 'Soil Reports' },
          { key: 'fertilizer', label: `Fertilizer (${fertTotal || 10})` },
          { key: 'disease', label: `Disease Assistance (${diseaseTotal || 10})` },
          { key: 'weather', label: 'Weather & Mandi' },
        ].map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '0.48rem 1rem',
                borderRadius: '8px',
                border: isActive ? '1px solid #bbf7d0' : '1px solid transparent',
                backgroundColor: isActive ? '#ecfdf5' : 'transparent',
                color: isActive ? '#059669' : '#64748b',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. OVERVIEW VIEW MATCHING VISUAL SPEC */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Five Status Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '1rem',
            }}
          >
            {/* Card 1: Total Requests */}
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #f1f5f9',
                padding: '1.15rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.8125rem', color: '#64748b', fontWeight: 500 }}>
                  Total Requests
                </span>
                <div
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '8px',
                    backgroundColor: '#ecfdf5',
                    color: '#10b981',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Link2 size={16} />
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.4rem' }}>
                <span style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a' }}>1,842</span>
                <span style={{ fontSize: '0.78rem', color: '#16a34a', fontWeight: 700 }}>+12%</span>
              </div>
            </div>

            {/* Card 2: Completed */}
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #f1f5f9',
                padding: '1.15rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.8125rem', color: '#64748b', fontWeight: 500 }}>
                  Completed
                </span>
                <div
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '8px',
                    backgroundColor: '#ecfdf5',
                    color: '#10b981',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <CheckCircle2 size={16} />
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.4rem' }}>
                <span style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a' }}>1,067</span>
                <span style={{ fontSize: '0.78rem', color: '#16a34a', fontWeight: 700 }}>58%</span>
              </div>
            </div>

            {/* Card 3: In Progress */}
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #f1f5f9',
                padding: '1.15rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.8125rem', color: '#64748b', fontWeight: 500 }}>
                  In Progress
                </span>
                <div
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '8px',
                    backgroundColor: '#eff6ff',
                    color: '#3b82f6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <FileText size={16} />
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.4rem' }}>
                <span style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a' }}>405</span>
                <span style={{ fontSize: '0.78rem', color: '#2563eb', fontWeight: 700 }}>22%</span>
              </div>
            </div>

            {/* Card 4: Pending */}
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #f1f5f9',
                padding: '1.15rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.8125rem', color: '#64748b', fontWeight: 500 }}>
                  Pending
                </span>
                <div
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '8px',
                    backgroundColor: '#fffbeb',
                    color: '#f59e0b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Clock size={16} />
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.4rem' }}>
                <span style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a' }}>258</span>
                <span style={{ fontSize: '0.78rem', color: '#d97706', fontWeight: 700 }}>14%</span>
              </div>
            </div>

            {/* Card 5: Escalated */}
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #f1f5f9',
                padding: '1.15rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.8125rem', color: '#64748b', fontWeight: 500 }}>
                  Escalated
                </span>
                <div
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '8px',
                    backgroundColor: '#fef2f2',
                    color: '#ef4444',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <AlertTriangle size={16} />
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.4rem' }}>
                <span style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a' }}>112</span>
                <span style={{ fontSize: '0.78rem', color: '#dc2626', fontWeight: 700 }}>6%</span>
              </div>
            </div>
          </div>

          {/* Middle Section: 3 Cards (Category Donut, Monthly Trends, Top Crops) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1.1fr 1.35fr 0.95fr',
              gap: '1.25rem',
            }}
          >
            {/* Card 1: Requests by Category */}
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '14px',
                border: '1px solid #f1f5f9',
                padding: '1.25rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.85rem 0' }}>
                Requests by Category
              </h3>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', flex: 1 }}>
                {/* SVG Donut */}
                <div style={{ position: 'relative', width: '130px', height: '130px', flexShrink: 0 }}>
                  <svg viewBox="0 0 140 140" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                    {[
                      { pct: 32, color: '#0ea5e9', dash: 377 * 0.32, offset: 0 },
                      { pct: 26, color: '#10b981', dash: 377 * 0.26, offset: -(377 * 0.32) },
                      { pct: 18, color: '#64748b', dash: 377 * 0.18, offset: -(377 * 0.58) },
                      { pct: 15, color: '#a855f7', dash: 377 * 0.15, offset: -(377 * 0.76) },
                      { pct: 9, color: '#7c3aed', dash: 377 * 0.09, offset: -(377 * 0.91) },
                    ].map((seg, idx) => (
                      <circle
                        key={idx}
                        cx="70"
                        cy="70"
                        r="55"
                        fill="transparent"
                        stroke={seg.color}
                        strokeWidth="18"
                        strokeDasharray={`${seg.dash} 377`}
                        strokeDashoffset={seg.offset}
                        strokeLinecap="butt"
                      />
                    ))}
                  </svg>
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      pointerEvents: 'none',
                    }}
                  >
                    <span style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
                      1,842
                    </span>
                    <span style={{ fontSize: '0.6875rem', color: '#64748b', fontWeight: 500, marginTop: '2px' }}>
                      Total
                    </span>
                  </div>
                </div>

                {/* Legend on right */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1, fontSize: '0.78rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#0ea5e9' }} />
                      <span style={{ color: '#334155' }}>Crop Advisory</span>
                    </div>
                    <span style={{ fontWeight: 700, color: '#0f172a' }}>32%</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                      <span style={{ color: '#334155' }}>Soil Analysis</span>
                    </div>
                    <span style={{ fontWeight: 700, color: '#0f172a' }}>26%</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#64748b' }} />
                      <span style={{ color: '#334155' }}>Fertilizer Guidance</span>
                    </div>
                    <span style={{ fontWeight: 700, color: '#0f172a' }}>18%</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#a855f7' }} />
                      <span style={{ color: '#334155' }}>Disease Assistance</span>
                    </div>
                    <span style={{ fontWeight: 700, color: '#0f172a' }}>15%</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#7c3aed' }} />
                      <span style={{ color: '#334155' }}>Weather Info</span>
                    </div>
                    <span style={{ fontWeight: 700, color: '#0f172a' }}>9%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Monthly Trends */}
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '14px',
                border: '1px solid #f1f5f9',
                padding: '1.25rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  Monthly Trends
                </h3>
                <div style={{ position: 'relative' }} onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => setIsTrendsOpen(!isTrendsOpen)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.3rem 0.65rem',
                      borderRadius: '7px',
                      border: '1px solid #e2e8f0',
                      backgroundColor: '#ffffff',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      color: '#475569',
                      cursor: 'pointer',
                    }}
                  >
                    <span>{trendsPeriod}</span>
                    <ChevronDown size={13} />
                  </button>
                  {isTrendsOpen && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '100%',
                        right: 0,
                        marginTop: '4px',
                        backgroundColor: '#ffffff',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 6px 14px rgba(0,0,0,0.08)',
                        zIndex: 20,
                        width: '130px',
                        overflow: 'hidden',
                      }}
                    >
                      {['Last 6 Months', 'Last 30 Days', 'Last Year'].map((p) => (
                        <div
                          key={p}
                          onClick={() => {
                            setTrendsPeriod(p);
                            setIsTrendsOpen(false);
                          }}
                          style={{
                            padding: '0.45rem 0.75rem',
                            fontSize: '0.8rem',
                            color: trendsPeriod === p ? '#059669' : '#334155',
                            backgroundColor: trendsPeriod === p ? '#ecfdf5' : '#ffffff',
                            cursor: 'pointer',
                          }}
                        >
                          {p}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Legend */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.78rem', marginBottom: '0.35rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#0284c7' }} />
                  <span style={{ color: '#475569' }}>Advisory</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#0d9488' }} />
                  <span style={{ color: '#475569' }}>Soil</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#a855f7' }} />
                  <span style={{ color: '#475569' }}>Disease</span>
                </div>
              </div>

              {/* SVG Spline Chart */}
              <div style={{ width: '100%', height: '140px' }}>
                <svg viewBox="0 0 380 140" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                  <defs>
                    <linearGradient id="trendsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0d9488" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#0d9488" stopOpacity="0.01" />
                    </linearGradient>
                  </defs>

                  {/* Grid lines */}
                  {[120, 85, 50, 15].map((y, idx) => (
                    <line key={idx} x1="25" y1={y} x2="370" y2={y} stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
                  ))}

                  {/* Y Axis text */}
                  <text x="18" y="18" textAnchor="end" fill="#94a3b8" fontSize="8" fontWeight="600">3K</text>
                  <text x="18" y="53" textAnchor="end" fill="#94a3b8" fontSize="8" fontWeight="600">2K</text>
                  <text x="18" y="88" textAnchor="end" fill="#94a3b8" fontSize="8" fontWeight="600">1K</text>
                  <text x="18" y="123" textAnchor="end" fill="#94a3b8" fontSize="8" fontWeight="600">0</text>

                  {/* Shaded Area for Soil/Main curve */}
                  <path
                    d="M 35 120 C 65 110, 85 90, 105 85 C 125 100, 150 95, 175 75 C 200 90, 225 65, 250 45 C 275 48, 305 38, 335 38 C 345 38, 360 38, 365 38 L 365 120 L 35 120 Z"
                    fill="url(#trendsGrad)"
                  />

                  {/* Lines */}
                  {/* Soil Line (teal) */}
                  <path
                    d="M 35 120 C 65 110, 85 90, 105 85 C 125 100, 150 95, 175 75 C 200 90, 225 65, 250 45 C 275 48, 305 38, 335 38 C 345 38, 360 38, 365 38"
                    fill="none"
                    stroke="#0d9488"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                  />
                  {/* Disease Line (purple) */}
                  <path
                    d="M 35 120 C 65 115, 85 110, 105 105 C 125 110, 150 115, 175 105 C 200 102, 225 100, 250 95 C 275 92, 305 85, 335 88 C 345 89, 360 90, 365 91"
                    fill="none"
                    stroke="#a855f7"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  />
                  {/* Advisory Line (blue) */}
                  <path
                    d="M 35 120 C 65 115, 85 105, 105 95 C 125 105, 150 110, 175 95 C 200 105, 225 110, 250 105 C 275 102, 305 105, 335 108 C 345 109, 360 110, 365 112"
                    fill="none"
                    stroke="#0284c7"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />

                  {/* Month points & labels */}
                  {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((m, i) => {
                    const x = 35 + i * 66;
                    return (
                      <g key={m}>
                        <text x={x} y="135" textAnchor="middle" fill="#64748b" fontSize="9" fontWeight="500">
                          {m}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>

            {/* Card 3: Top Crop Queries */}
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '14px',
                border: '1px solid #f1f5f9',
                padding: '1.25rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.85rem 0' }}>
                Top Crop Queries
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {[
                  { name: 'Paddy', count: 420, emoji: '🌾' },
                  { name: 'Cotton', count: 318, emoji: '🌱' },
                  { name: 'Maize', count: 286, emoji: '🌽' },
                  { name: 'Chilli', count: 195, emoji: '🌶️' },
                  { name: 'Turmeric', count: 142, emoji: '🫚' },
                ].map((crop) => (
                  <div
                    key={crop.name}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.84rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <span style={{ fontSize: '1.1rem' }}>{crop.emoji}</span>
                      <span style={{ fontWeight: 600, color: '#334155' }}>{crop.name}</span>
                    </div>
                    <span style={{ fontWeight: 700, color: '#0f172a' }}>{crop.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Table: Recent Service Requests */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '14px',
              border: '1px solid #f1f5f9',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1.15rem 1.25rem 0.75rem 1.25rem',
              }}
            >
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Recent Service Requests
              </h3>
              <button
                onClick={() => setActiveTab('fertilizer')}
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: '#0284c7',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                }}
              >
                <span>View all</span>
                <ArrowRight size={13} />
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: '#fafbfc' }}>
                    <th style={{ padding: '0.75rem 1rem', fontSize: '0.6875rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>ID</th>
                    <th style={{ padding: '0.75rem 1rem', fontSize: '0.6875rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>FARMER</th>
                    <th style={{ padding: '0.75rem 1rem', fontSize: '0.6875rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>TYPE</th>
                    <th style={{ padding: '0.75rem 1rem', fontSize: '0.6875rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>CROP</th>
                    <th style={{ padding: '0.75rem 1rem', fontSize: '0.6875rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>SUBMITTED ON</th>
                    <th style={{ padding: '0.75rem 1rem', fontSize: '0.6875rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>STATUS</th>
                    <th style={{ padding: '0.75rem 1rem', fontSize: '0.6875rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>ASSIGNED TO</th>
                    <th style={{ padding: '0.75rem 1rem', fontSize: '0.6875rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    {
                      id: 'SR-2025-00421',
                      farmer: 'Ramesh Naik',
                      type: 'Crop Advisory',
                      crop: 'Paddy',
                      date: '24 Apr 2025',
                      status: 'In Progress',
                      assigned: 'Dr. Anil Kumar',
                      statusBg: '#eff6ff',
                      statusColor: '#1d4ed8',
                    },
                    {
                      id: 'SR-2025-00420',
                      farmer: 'Saroja Devi',
                      type: 'Soil Analysis',
                      crop: 'Cotton',
                      date: '24 Apr 2025',
                      status: 'Completed',
                      assigned: 'Dr. Priya Sharma',
                      statusBg: '#ecfdf5',
                      statusColor: '#059669',
                    },
                    {
                      id: 'SR-2025-00419',
                      farmer: 'Mahesh Kumar',
                      type: 'Disease Assistance',
                      crop: 'Chilli',
                      date: '23 Apr 2025',
                      status: 'Pending',
                      assigned: 'Unassigned',
                      statusBg: '#fee2e2',
                      statusColor: '#dc2626',
                    },
                    {
                      id: 'SR-2025-00418',
                      farmer: 'Lakshmi Prasad',
                      type: 'Fertilizer Guidance',
                      crop: 'Maize',
                      date: '23 Apr 2025',
                      status: 'In Progress',
                      assigned: 'Dr. Sunil Rao',
                      statusBg: '#eff6ff',
                      statusColor: '#1d4ed8',
                    },
                    {
                      id: 'SR-2025-00417',
                      farmer: 'Anitha Reddy',
                      type: 'Weather & Mandi',
                      crop: 'Turmeric',
                      date: '22 Apr 2025',
                      status: 'Completed',
                      assigned: 'Auto System',
                      statusBg: '#ecfdf5',
                      statusColor: '#059669',
                    },
                  ].map((req) => (
                    <tr
                      key={req.id}
                      style={{ borderBottom: '1px solid #f8fafc', transition: 'background-color 0.15s ease' }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fafafa')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <td style={{ padding: '0.85rem 1rem', fontSize: '0.8125rem', color: '#64748b', fontWeight: 600 }}>
                        {req.id}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', color: '#0f172a', fontWeight: 700 }}>
                        {req.farmer}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontSize: '0.8125rem', color: '#475569' }}>
                        {req.type}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontSize: '0.8125rem', color: '#059669', fontWeight: 600 }}>
                        {req.crop}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontSize: '0.8125rem', color: '#64748b' }}>
                        {req.date}
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '0.2rem 0.65rem',
                            borderRadius: '9999px',
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            backgroundColor: req.statusBg,
                            color: req.statusColor,
                          }}
                        >
                          {req.status}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontSize: '0.8125rem', color: req.assigned === 'Unassigned' ? '#94a3b8' : '#334155', fontWeight: 500 }}>
                        {req.assigned}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'center', position: 'relative' }}>
                        <div onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => setActiveActionId(activeActionId === req.id ? null : req.id)}
                            style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '6px',
                              border: 'none',
                              backgroundColor: 'transparent',
                              color: '#64748b',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <MoreHorizontal size={16} />
                          </button>
                          {activeActionId === req.id && (
                            <div
                              style={{
                                position: 'absolute',
                                right: '1rem',
                                top: '70%',
                                backgroundColor: '#ffffff',
                                borderRadius: '8px',
                                border: '1px solid #e2e8f0',
                                boxShadow: '0 8px 18px rgba(0,0,0,0.1)',
                                zIndex: 40,
                                width: '170px',
                                textAlign: 'left',
                                overflow: 'hidden',
                              }}
                            >
                              <div
                                onClick={() => {
                                  setActiveTab('fertilizer');
                                  setActiveActionId(null);
                                }}
                                style={{ padding: '0.55rem 0.85rem', fontSize: '0.8125rem', color: '#334155', cursor: 'pointer' }}
                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
                              >
                                View Detailed Dossier
                              </div>
                              <div
                                onClick={() => {
                                  setFertilizerModalOpen(true);
                                  setActiveActionId(null);
                                }}
                                style={{ padding: '0.55rem 0.85rem', fontSize: '0.8125rem', color: '#059669', fontWeight: 600, cursor: 'pointer' }}
                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
                              >
                                Formulate Prescription
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. DEDICATED SERVICE DESKS */}

      {/* 4A. Fertilizer Desk */}
      {activeTab === 'fertilizer' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
        </div>
      )}

      {/* 4B. Disease Assistance Desk */}
      {activeTab === 'disease' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
        </div>
      )}

      {/* 4C. Crop Advisory Desk */}
      {activeTab === 'advisory' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#ffffff',
              padding: '1rem 1.25rem',
              borderRadius: '12px',
              border: '1px solid #f1f5f9',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            }}
          >
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.2rem 0' }}>
                Active Advisory Bulletins & Alerts
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
                Agronomic advisories broadcast to farmers across districts
              </p>
            </div>
            <button
              onClick={() => setIsCreateAdvisoryOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#059669',
                color: '#ffffff',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <Plus size={15} />
              <span>Issue New Advisory</span>
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem' }}>
            {[
              {
                crop: 'Paddy (Rice)',
                icon: '🌾',
                priority: 'URGENT',
                priorityBg: '#fee2e2',
                priorityColor: '#dc2626',
                title: 'Panicle Blast Precautionary Measures & Tricyclazole Spray Protocol',
                summary: 'With intermittent rain and high relative humidity (>85%), blast susceptibility is elevated in tillering stage. Recommended spray: Tricyclazole 75% WP @ 0.6g/L or Isoprothiolane 40% EC @ 1.5ml/L.',
                districts: 'Warangal & Karimnagar',
                reach: '1,840 Farmers',
                expert: 'Dr. Anil Kumar',
                date: 'Today, 09:30 AM',
              },
              {
                crop: 'Cotton',
                icon: '🌱',
                priority: 'SEASONAL',
                priorityBg: '#ecfdf5',
                priorityColor: '#059669',
                title: 'Pink Bollworm Surveillance & Pheromone Trap Density Guidelines',
                summary: 'Install 5-8 Pheromone traps per acre at 45-50 DAS. If moth catches exceed 8 moths/trap/day for 3 consecutive days, initiate spray of Profenofos 50% EC @ 2ml/L.',
                districts: 'Adilabad & Khammam',
                reach: '2,420 Farmers',
                expert: 'Dr. Priya Sharma',
                date: 'Yesterday, 04:15 PM',
              },
              {
                crop: 'Chilli',
                icon: '🌶️',
                priority: 'CRITICAL',
                priorityBg: '#fee2e2',
                priorityColor: '#dc2626',
                title: 'Thrips & Gemini Yellow Mosaic Vector Suppression',
                summary: 'Black thrips infestations noticed on lower leaves. Spray Spinosad 45% SC @ 0.3ml/L or Fipronil 5% SC @ 2ml/L. Apply neem oil 10,000 ppm @ 2ml/L as oviposition deterrent.',
                districts: 'Guntur & Khammam',
                reach: '980 Farmers',
                expert: 'Dr. Sunil Rao',
                date: '20 Oct 2026',
              },
              {
                crop: 'Maize',
                icon: '🌽',
                priority: 'SURVEILLANCE',
                priorityBg: '#eff6ff',
                priorityColor: '#2563eb',
                title: 'Fall Armyworm (Spodoptera frugiperda) Early Whorl Scouting',
                summary: 'Scout fields twice a week. In whorl stage, apply Emamectin benzoate 5% SG @ 0.4g/L or Chlorantraniliprole 18.5% SC @ 0.4ml/L targeting central plant whorls.',
                districts: 'Nizamabad & Medak',
                reach: '1,350 Farmers',
                expert: 'Dr. Meenakshi Sundaram',
                date: '19 Oct 2026',
              },
            ].map((adv, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '14px',
                  border: '1px solid #f1f5f9',
                  padding: '1.25rem',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '0.85rem',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>
                      <span>{adv.icon}</span>
                      <span>{adv.crop}</span>
                    </div>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        padding: '0.15rem 0.55rem',
                        borderRadius: '9999px',
                        backgroundColor: adv.priorityBg,
                        color: adv.priorityColor,
                      }}
                    >
                      {adv.priority}
                    </span>
                  </div>

                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.5rem 0', lineHeight: 1.35 }}>
                    {adv.title}
                  </h4>
                  <p style={{ fontSize: '0.8125rem', color: '#475569', margin: 0, lineHeight: 1.45 }}>
                    {adv.summary}
                  </p>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '0.75rem',
                    borderTop: '1px solid #f1f5f9',
                    fontSize: '0.75rem',
                    color: '#64748b',
                  }}
                >
                  <div>
                    <div>📍 <strong>{adv.districts}</strong></div>
                    <div style={{ marginTop: '0.15rem' }}>👨‍🌾 Reached {adv.reach} • {adv.expert}</div>
                  </div>
                  <button
                    onClick={() => {
                      setAdvisoryForm((prev) => ({
                        ...prev,
                        title: `Update: ${adv.title}`,
                        notes: adv.summary,
                      }));
                      setIsCreateAdvisoryOpen(true);
                    }}
                    style={{
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      padding: '0.35rem 0.65rem',
                      backgroundColor: '#ffffff',
                      color: '#059669',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                    }}
                  >
                    Broadcast Update
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4D. Soil Reports Desk */}
      {activeTab === 'soil' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Soil Telemetry Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div style={{ backgroundColor: '#ffffff', padding: '1rem', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
              <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>Total Soil Samples</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginTop: '0.25rem' }}>1,480</div>
              <div style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600, marginTop: '0.2rem' }}>+18% from last cycle</div>
            </div>
            <div style={{ backgroundColor: '#ffffff', padding: '1rem', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
              <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>Optimal pH (6.5 - 7.5)</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#059669', marginTop: '0.25rem' }}>68%</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>1,006 normal test plots</div>
            </div>
            <div style={{ backgroundColor: '#ffffff', padding: '1rem', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
              <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>Organic Carbon Deficit</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#d97706', marginTop: '0.25rem' }}>42%</div>
              <div style={{ fontSize: '0.75rem', color: '#d97706', fontWeight: 600, marginTop: '0.2rem' }}>&lt; 0.50% organic matter</div>
            </div>
            <div style={{ backgroundColor: '#ffffff', padding: '1rem', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
              <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>Micronutrient Alert</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#dc2626', marginTop: '0.25rem' }}>31%</div>
              <div style={{ fontSize: '0.75rem', color: '#dc2626', fontWeight: 600, marginTop: '0.2rem' }}>Zinc / Boron deficiency</div>
            </div>
          </div>

          {/* Soil Tests Table */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid #f1f5f9', overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #f1f5f9' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.2rem 0' }}>
                Recent Soil Laboratory Analyses & Health Cards
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
                N-P-K nutrient profiles, soil reaction (pH), and micronutrient status
              </p>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: '#fafbfc', borderBottom: '1px solid #f1f5f9', fontSize: '0.6875rem', color: '#94a3b8', textTransform: 'uppercase' }}>
                    <th style={{ padding: '0.75rem 1rem' }}>Sample ID</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Farmer</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Soil Type</th>
                    <th style={{ padding: '0.75rem 1rem' }}>pH</th>
                    <th style={{ padding: '0.75rem 1rem' }}>EC (dS/m)</th>
                    <th style={{ padding: '0.75rem 1rem' }}>N-P-K Status</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Micronutrients</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { id: 'ST-2025-0891', farmer: 'Ramesh Naik', village: 'Warangal', soil: 'Red Sandy Loam', ph: '6.8 (Neutral)', ec: '0.32', npk: 'Low-Med-High', micro: 'Zn Deficient (0.48 ppm)', status: 'Prescribed', statusBg: '#ecfdf5', statusColor: '#059669' },
                    { id: 'ST-2025-0892', farmer: 'Saroja Devi', village: 'Khammam', soil: 'Black Clay (Vertisol)', ph: '7.9 (Mod. Alkaline)', ec: '0.45', npk: 'Low-Low-High', micro: 'Fe Deficient (4.2 ppm)', status: 'Report Ready', statusBg: '#eff6ff', statusColor: '#2563eb' },
                    { id: 'ST-2025-0893', farmer: 'Mahesh Kumar', village: 'Guntur', soil: 'Alluvial Loam', ph: '7.2 (Neutral)', ec: '0.28', npk: 'Med-High-Med', micro: 'Sufficient', status: 'In Testing', statusBg: '#fffbeb', statusColor: '#d97706' },
                    { id: 'ST-2025-0894', farmer: 'Lakshmi Prasad', village: 'Karimnagar', soil: 'Red Loamy Soil', ph: '6.4 (Slightly Acidic)', ec: '0.22', npk: 'Low-Med-High', micro: 'Boron Deficient', status: 'Prescribed', statusBg: '#ecfdf5', statusColor: '#059669' },
                    { id: 'ST-2025-0895', farmer: 'Anitha Reddy', village: 'Nalgonda', soil: 'Chalkas (Sandy Loam)', ph: '7.6 (Neutral)', ec: '0.39', npk: 'Med-Med-Med', micro: 'Sufficient', status: 'Report Ready', statusBg: '#eff6ff', statusColor: '#2563eb' },
                  ].map((row) => (
                    <tr key={row.id} style={{ borderBottom: '1px solid #f8fafc', fontSize: '0.8125rem' }}>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#64748b' }}>{row.id}</td>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#0f172a' }}>{row.farmer} <span style={{ fontWeight: 400, color: '#64748b', fontSize: '0.75rem' }}>({row.village})</span></td>
                      <td style={{ padding: '0.75rem 1rem', color: '#475569' }}>{row.soil}</td>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#0f172a' }}>{row.ph}</td>
                      <td style={{ padding: '0.75rem 1rem', color: '#64748b' }}>{row.ec}</td>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#059669' }}>{row.npk}</td>
                      <td style={{ padding: '0.75rem 1rem', color: '#d97706', fontWeight: 500 }}>{row.micro}</td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span style={{ padding: '0.2rem 0.6rem', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 700, backgroundColor: row.statusBg, color: row.statusColor }}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4E. Weather & Mandi Intelligence Desk */}
      {activeTab === 'weather' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.25rem' }}>
          {/* Card 1: 5-Day Agro-Weather Forecast */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid #f1f5f9', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.2rem 0' }}>
                  Agro-Weather Forecast & Spray Window
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
                  Hyderabad & Regional Agro-Climatic Zones
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>32°C</div>
                <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>Clear Sky</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { day: 'Today', temp: '32°C / 24°C', rain: '20%', wind: '12 km/h', advice: 'Ideal spray window until 4:00 PM', badge: 'Optimal', badgeBg: '#ecfdf5', badgeColor: '#059669' },
                { day: 'Tomorrow', temp: '30°C / 23°C', rain: '45%', wind: '16 km/h', advice: 'Light evening showers anticipated', badge: 'Moderate', badgeBg: '#fffbeb', badgeColor: '#d97706' },
                { day: 'Thursday', temp: '29°C / 22°C', rain: '75%', wind: '22 km/h', advice: 'Postpone pesticide spraying; check field bunds', badge: 'Avoid Spray', badgeBg: '#fee2e2', badgeColor: '#dc2626' },
                { day: 'Friday', temp: '31°C / 24°C', rain: '30%', wind: '14 km/h', advice: 'Clearing skies; check pest traps', badge: 'Favorable', badgeBg: '#ecfdf5', badgeColor: '#059669' },
                { day: 'Saturday', temp: '33°C / 25°C', rain: '10%', wind: '10 km/h', advice: 'Dry warm weather; excellent for harvesting', badge: 'Optimal', badgeBg: '#ecfdf5', badgeColor: '#059669' },
              ].map((w, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    backgroundColor: '#fafbfc',
                    border: '1px solid #f1f5f9',
                    fontSize: '0.8125rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontWeight: 700, color: '#0f172a', width: '70px' }}>{w.day}</span>
                    <span style={{ color: '#475569', fontWeight: 600 }}>{w.temp}</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>🌧️ {w.rain} • 💨 {w.wind}</div>
                  <span style={{ padding: '0.15rem 0.55rem', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 700, backgroundColor: w.badgeBg, color: w.badgeColor }}>
                    {w.badge}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Card 2: Live Mandi Wholesale Market Prices */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid #f1f5f9', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.2rem 0' }}>
                  Live Mandi Wholesale Market Rates
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
                  Real-time commodity arrivals across Telangana & AP nodes
                </p>
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669', backgroundColor: '#ecfdf5', padding: '0.2rem 0.5rem', borderRadius: '6px' }}>
                ● Live Updates
              </span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8125rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#fafbfc', borderBottom: '1px solid #f1f5f9', fontSize: '0.6875rem', color: '#94a3b8', textTransform: 'uppercase' }}>
                    <th style={{ padding: '0.6rem 0.75rem' }}>Commodity</th>
                    <th style={{ padding: '0.6rem 0.75rem' }}>Market Yard</th>
                    <th style={{ padding: '0.6rem 0.75rem' }}>Modal Price</th>
                    <th style={{ padding: '0.6rem 0.75rem' }}>Arrivals</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { crop: '🌾 Paddy (Common)', yard: 'Suryapet', price: '₹2,320 / Qtl', diff: '+₹45', diffColor: '#16a34a', arrivals: '4,200 Qtl' },
                    { crop: '🌱 Cotton (Long Staple)', yard: 'Warangal', price: '₹7,450 / Qtl', diff: '+₹120', diffColor: '#16a34a', arrivals: '8,500 Qtl' },
                    { crop: '🌶️ Chilli (Teja Variety)', yard: 'Khammam', price: '₹18,500 / Qtl', diff: '+₹300', diffColor: '#16a34a', arrivals: '2,100 Qtl' },
                    { crop: '🌽 Maize (Kharif)', yard: 'Nizamabad', price: '₹2,100 / Qtl', diff: '₹0', diffColor: '#64748b', arrivals: '3,400 Qtl' },
                    { crop: '🫚 Turmeric (Finger)', yard: 'Nizamabad', price: '₹14,200 / Qtl', diff: '+₹250', diffColor: '#16a34a', arrivals: '1,800 Qtl' },
                    { crop: '🥣 Red Gram (Tur)', yard: 'Tandur', price: '₹10,800 / Qtl', diff: '+₹180', diffColor: '#16a34a', arrivals: '1,200 Qtl' },
                  ].map((m, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f8fafc' }}>
                      <td style={{ padding: '0.65rem 0.75rem', fontWeight: 600, color: '#0f172a' }}>{m.crop}</td>
                      <td style={{ padding: '0.65rem 0.75rem', color: '#64748b' }}>{m.yard}</td>
                      <td style={{ padding: '0.65rem 0.75rem', fontWeight: 700, color: '#0f172a' }}>
                        <div>{m.price}</div>
                        <div style={{ fontSize: '0.6875rem', color: m.diffColor, fontWeight: 600 }}>{m.diff}</div>
                      </td>
                      <td style={{ padding: '0.65rem 0.75rem', color: '#475569', fontSize: '0.78rem' }}>{m.arrivals}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
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

      {/* Create Advisory Modal */}
      {isCreateAdvisoryOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(15, 23, 42, 0.55)',
            backdropFilter: 'blur(4px)',
            padding: '1rem',
          }}
          onClick={() => setIsCreateAdvisoryOpen(false)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '640px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              display: 'flex',
              flexDirection: 'column',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid #e2e8f0',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    backgroundColor: '#ecfdf5',
                    color: '#059669',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Sprout size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Create Agricultural Advisory
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
                    Formulate and broadcast specialized agronomic guidance to farmers
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateAdvisoryOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '0.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '6px',
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateAdvisorySubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  Advisory Subject / Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Precautionary Spray Advisory for Paddy Blast & Leaf Folder"
                  value={advisoryForm.title}
                  onChange={(e) => setAdvisoryForm({ ...advisoryForm, title: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.875rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    Advisory Category
                  </label>
                  <select
                    value={advisoryForm.category}
                    onChange={(e) => setAdvisoryForm({ ...advisoryForm, category: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.875rem',
                      outline: 'none',
                      backgroundColor: '#ffffff',
                      boxSizing: 'border-box',
                    }}
                  >
                    <option value="Crop Advisory">Crop Advisory</option>
                    <option value="Soil Analysis">Soil Analysis</option>
                    <option value="Fertilizer Guidance">Fertilizer Guidance</option>
                    <option value="Disease Assistance">Disease Assistance</option>
                    <option value="Weather Alert">Weather Alert</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    Target Crop
                  </label>
                  <select
                    value={advisoryForm.cropType}
                    onChange={(e) => setAdvisoryForm({ ...advisoryForm, cropType: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.875rem',
                      outline: 'none',
                      backgroundColor: '#ffffff',
                      boxSizing: 'border-box',
                    }}
                  >
                    <option value="Paddy">Paddy (Rice)</option>
                    <option value="Cotton">Cotton</option>
                    <option value="Chilli">Chilli</option>
                    <option value="Maize">Maize</option>
                    <option value="Turmeric">Turmeric</option>
                    <option value="Groundnut">Groundnut</option>
                    <option value="All Crops">All Crops (General)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    Priority / Severity
                  </label>
                  <select
                    value={advisoryForm.priority}
                    onChange={(e) => setAdvisoryForm({ ...advisoryForm, priority: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.875rem',
                      outline: 'none',
                      backgroundColor: '#ffffff',
                      boxSizing: 'border-box',
                    }}
                  >
                    <option value="NORMAL">Standard Routine Advisory</option>
                    <option value="URGENT">Urgent (Seasonal Vulnerability)</option>
                    <option value="CRITICAL">Critical Alert (Pest Outbreak / Cyclone)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    Target Region / District
                  </label>
                  <select
                    value={advisoryForm.targetDistrict}
                    onChange={(e) => setAdvisoryForm({ ...advisoryForm, targetDistrict: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.875rem',
                      outline: 'none',
                      backgroundColor: '#ffffff',
                      boxSizing: 'border-box',
                    }}
                  >
                    <option value="All Districts">All Districts (State-wide)</option>
                    <option value="Warangal">Warangal</option>
                    <option value="Karimnagar">Karimnagar</option>
                    <option value="Nalgonda">Nalgonda</option>
                    <option value="Khammam">Khammam</option>
                    <option value="Guntur">Guntur</option>
                    <option value="Kurnool">Kurnool</option>
                    <option value="Adilabad">Adilabad</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    Authorizing Agronomist / Expert
                  </label>
                  <select
                    value={advisoryForm.expertId}
                    onChange={(e) => setAdvisoryForm({ ...advisoryForm, expertId: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.875rem',
                      outline: 'none',
                      backgroundColor: '#ffffff',
                      boxSizing: 'border-box',
                    }}
                  >
                    <option value="">Dr. Anil Kumar (Chief Agronomist)</option>
                    {experts.map((exp) => (
                      <option key={exp.id} value={exp.id}>
                        {exp.name} ({exp.specialization})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    Target Farmer / Phone (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Leave empty for all farmers"
                    value={advisoryForm.farmerContact}
                    onChange={(e) => setAdvisoryForm({ ...advisoryForm, farmerContact: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.875rem',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  Agronomic Guidance & Treatment Instructions *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Detail symptoms, prescribed chemical/biological dosages, spray timing, precautionary waiting periods, and weather safety instructions..."
                  value={advisoryForm.notes}
                  onChange={(e) => setAdvisoryForm({ ...advisoryForm, notes: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.875rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                  }}
                />
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: '0.75rem',
                  paddingTop: '0.5rem',
                  borderTop: '1px solid #f1f5f9',
                }}
              >
                <button
                  type="button"
                  onClick={() => setIsCreateAdvisoryOpen(false)}
                  style={{
                    padding: '0.55rem 1rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    color: '#475569',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAdvisory}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    padding: '0.55rem 1.25rem',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#059669',
                    color: '#ffffff',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: isSubmittingAdvisory ? 'not-allowed' : 'pointer',
                    boxShadow: '0 1px 3px rgba(5, 150, 105, 0.3)',
                    opacity: isSubmittingAdvisory ? 0.7 : 1,
                  }}
                >
                  <Send size={15} />
                  <span>{isSubmittingAdvisory ? 'Broadcasting...' : 'Publish & Broadcast'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
