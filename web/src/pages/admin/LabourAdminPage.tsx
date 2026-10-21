import React, { useState, useEffect } from 'react';
import {
  Users,
  Calendar,
  IndianRupee,
  MapPin,
  Eye,
  CheckCircle,
  Clock,
  Briefcase,
  AlertCircle,
  Phone,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  ChevronDown,
  X,
  Link2,
  UserCheck,
  ShieldCheck,
  Send,
  ArrowRight,
  Sprout,
  Check,
} from 'lucide-react';
import { ServiceOperationsApi, LabourRequestItem } from '../../api/serviceOperations.api.js';
import { DataTable, Column } from '../../components/common/DataTable.js';
import { Pagination } from '../../components/common/Pagination.js';
import { Drawer } from '../../components/common/Drawer.js';
import { ConfirmationModal } from '../../components/common/ConfirmationModal.js';

interface LabourGroup {
  id: string;
  name: string;
  image: string;
  district: string;
  state: string;
  workersCount: number;
  wageType: string;
  crops: string;
  status: 'Available' | 'Busy';
  leaderName: string;
  phone: string;
  specialization: string;
  experienceYears: number;
  rating: number;
}

const INITIAL_LABOUR_GROUPS: LabourGroup[] = [
  {
    id: 'LG-2025-001',
    name: 'Sri Laxmi Labour Group',
    image: '/assets/labour_group_1.jpg',
    district: 'Medak',
    state: 'TS',
    workersCount: 15,
    wageType: 'Daily Wage',
    crops: 'Paddy, Cotton, Maize',
    status: 'Available',
    leaderName: 'Mallesh Goud',
    phone: '+91 98480 34211',
    specialization: 'Transplanting, Harvesting, De-weeding',
    experienceYears: 8,
    rating: 4.9,
  },
  {
    id: 'LG-2025-002',
    name: 'Raju Farmers Team',
    image: '/assets/labour_group_2.jpg',
    district: 'Nizamabad',
    state: 'TS',
    workersCount: 8,
    wageType: 'Daily Wage',
    crops: 'Weeding, Harvesting, Planting',
    status: 'Busy',
    leaderName: 'Raju Yadav',
    phone: '+91 94401 55678',
    specialization: 'Vegetable Harvesting & Nursery Prep',
    experienceYears: 6,
    rating: 4.8,
  },
  {
    id: 'LG-2025-003',
    name: 'Shiv Shakti Group',
    image: '/assets/labour_group_3.jpg',
    district: 'Karimnagar',
    state: 'TS',
    workersCount: 12,
    wageType: 'Daily Wage',
    crops: 'All Crops',
    status: 'Available',
    leaderName: 'Shankar Nayak',
    phone: '+91 99890 12345',
    specialization: 'Paddy Reaping, Bagging & Farm Loading',
    experienceYears: 10,
    rating: 4.95,
  },
  {
    id: 'LG-2025-004',
    name: 'Sri Sai Labourers Crew',
    image: '/assets/labour_group_1.jpg',
    district: 'Warangal',
    state: 'TS',
    workersCount: 20,
    wageType: 'Contract / Acre',
    crops: 'Chilli, Turmeric Harvesting',
    status: 'Available',
    leaderName: 'Ramesh Reddy',
    phone: '+91 98480 88990',
    specialization: 'Commercial Crop Harvest & Drying',
    experienceYears: 12,
    rating: 4.85,
  },
  {
    id: 'LG-2025-005',
    name: 'Jai Kisan Women Farm Crew',
    image: '/assets/labour_group_2.jpg',
    district: 'Khammam',
    state: 'TS',
    workersCount: 10,
    wageType: 'Daily Wage',
    crops: 'Cotton Picking, Weeding',
    status: 'Available',
    leaderName: 'Laxmamma',
    phone: '+91 97000 66778',
    specialization: 'Delicate Crop Picking & Manual Sorting',
    experienceYears: 9,
    rating: 4.9,
  },
];

interface Props {
  onNavigateToMachinery?: () => void;
}

export const LabourAdminPage: React.FC<Props> = ({ onNavigateToMachinery }) => {
  const [activeTab, setActiveTab] = useState<'groups' | 'requests' | 'workers' | 'wages'>('groups');
  const [labourGroups, setLabourGroups] = useState<LabourGroup[]>(INITIAL_LABOUR_GROUPS);
  const [selectedGroup, setSelectedGroup] = useState<LabourGroup | null>(null);

  // Filters
  const [selectedDistrict, setSelectedDistrict] = useState<string>('All Districts');
  const [selectedMandal, setSelectedMandal] = useState<string>('All Mandals');
  const [selectedVillage, setSelectedVillage] = useState<string>('All Villages');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals & Notifications
  const [isAddGroupOpen, setIsAddGroupOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Add Group Form
  const [newGroupForm, setNewGroupForm] = useState({
    name: '',
    leaderName: '',
    phone: '',
    district: 'Warangal',
    workersCount: '',
    wageType: 'Daily Wage',
    crops: '',
    specialization: '',
  });
  const [isSubmittingGroup, setIsSubmittingGroup] = useState<boolean>(false);

  // Existing Live Labour Requests state (Backend DB integration)
  const [list, setList] = useState<LabourRequestItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [status, setStatus] = useState<string>('ALL');
  const [requestSearch, setRequestSearch] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedItem, setSelectedItem] = useState<LabourRequestItem | null>(null);
  const [statusModalOpen, setStatusModalOpen] = useState<boolean>(false);
  const [targetStatus, setTargetStatus] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  const fetchLabour = () => {
    setIsLoading(true);
    ServiceOperationsApi.listLabour({
      page,
      limit,
      status: status !== 'ALL' ? status : undefined,
      search: requestSearch.trim() || undefined,
    })
      .then((res) => {
        setList(res.data);
        setTotal(res.total);
      })
      .catch((err) => console.error('[LabourAdminPage] Failed to fetch labour requests:', err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchLabour();
  }, [page, limit, status]);

  const handleStatusUpdateConfirm = async () => {
    if (!selectedItem || !targetStatus) return;
    setIsUpdating(true);
    try {
      const updated = await ServiceOperationsApi.updateLabourStatus(selectedItem.id, targetStatus as any);
      setSelectedItem({ ...selectedItem, status: updated.status });
      fetchLabour();
      setStatusModalOpen(false);
      setToastMessage(`Booking status updated to ${targetStatus}`);
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      console.error('[LabourAdminPage] Failed to update labour status:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddGroupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupForm.name.trim() || !newGroupForm.phone.trim()) return;
    setIsSubmittingGroup(true);
    setTimeout(() => {
      const created: LabourGroup = {
        id: `LG-2025-${String(labourGroups.length + 1).padStart(3, '0')}`,
        name: newGroupForm.name,
        image: '/assets/labour_group_1.jpg',
        district: newGroupForm.district,
        state: 'TS',
        workersCount: parseInt(newGroupForm.workersCount) || 12,
        wageType: newGroupForm.wageType,
        crops: newGroupForm.crops || 'Paddy, Cotton, Chilli',
        status: 'Available',
        leaderName: newGroupForm.leaderName || 'Group Leader',
        phone: newGroupForm.phone,
        specialization: newGroupForm.specialization || 'Field Cultivation & Harvesting',
        experienceYears: 5,
        rating: 5.0,
      };
      setLabourGroups([created, ...labourGroups]);
      setIsSubmittingGroup(false);
      setIsAddGroupOpen(false);
      setToastMessage(`Labour group "${created.name}" registered successfully!`);
      setNewGroupForm({
        name: '',
        leaderName: '',
        phone: '',
        district: 'Warangal',
        workersCount: '',
        wageType: 'Daily Wage',
        crops: '',
        specialization: '',
      });
      setTimeout(() => setToastMessage(null), 5000);
    }, 500);
  };

  // Filtered labour groups
  const filteredGroups = labourGroups.filter((g) => {
    if (selectedDistrict !== 'All Districts' && g.district !== selectedDistrict) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        g.name.toLowerCase().includes(q) ||
        g.district.toLowerCase().includes(q) ||
        g.phone.includes(q) ||
        g.leaderName.toLowerCase().includes(q) ||
        g.crops.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Table columns for live requests
  const columns: Column<LabourRequestItem>[] = [
    {
      key: 'farmer',
      header: 'Farmer & Location',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600, color: '#0f172a' }}>{row.farmer.name}</div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
            {row.farmer.phoneNumber} • {row.farmer.village || 'Telangana'}
          </div>
        </div>
      ),
    },
    {
      key: 'task',
      header: 'Task & Crew Required',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600, color: '#0f172a' }}>{row.taskType}</div>
          <div style={{ fontSize: '0.75rem', color: '#166534', fontWeight: 600 }}>
            {row.labourersRequired} Workers • {row.durationDays ? `${row.durationDays} Days` : 'Single Day'}
          </div>
        </div>
      ),
    },
    {
      key: 'wage',
      header: 'Daily Wage Offered',
      render: (row) => (
        <div style={{ fontSize: '0.8125rem' }}>
          <div style={{ fontWeight: 700, color: '#0f172a' }}>
            {row.dailyWage ? `₹${row.dailyWage.toLocaleString()} / day` : 'Market standard'}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
            Start: {row.preferredStartDate ? new Date(row.preferredStartDate).toLocaleDateString() : 'Immediate'}
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
              row.status === 'COMPLETED'
                ? '#dcfce7'
                : row.status === 'SUBMITTED'
                ? '#fef3c7'
                : '#eff6ff',
            color:
              row.status === 'COMPLETED'
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
      key: 'actions',
      header: 'Action',
      render: (row) => (
        <button
          onClick={() => setSelectedItem(row)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.375rem',
            padding: '0.375rem 0.75rem',
            borderRadius: '6px',
            border: '1px solid #cbd5e1',
            backgroundColor: '#ffffff',
            color: '#0f172a',
            fontSize: '0.8125rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <Eye size={14} />
          <span>Review Booking</span>
        </button>
      ),
    },
  ];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Toast Notification Banner */}
      {toastMessage && (
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
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
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

      {/* 1. TOP HEADER & ACTION BUTTON MATCHING MOCKUP */}
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
            Labour Groups
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>
            Manage labour groups and worker deployments
          </p>
        </div>

        <button
          onClick={() => setIsAddGroupOpen(true)}
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
          <span>Add Labour Group</span>
        </button>
      </div>

      {/* 2. SUB-NAVIGATION TABS */}
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
          { key: 'groups', label: `Labour Groups (${labourGroups.length})` },
          { key: 'requests', label: `Booking Requests (${total || 14})` },
          { key: 'workers', label: 'Worker Directory (1,842)' },
          { key: 'wages', label: 'Wage Standards & Payouts' },
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

      {/* 3. THREE STAT KPI CARDS MATCHING MOCKUP */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1.25rem',
        }}
      >
        {/* Card 1: Total Labour Groups */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #f1f5f9',
            padding: '1.25rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8125rem', color: '#64748b', fontWeight: 500 }}>
              Total Labour Groups
            </span>
            <div
              style={{
                width: '32px',
                height: '32px',
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
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.5rem' }}>
            <span style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>284</span>
            <span style={{ fontSize: '0.78rem', color: '#16a34a', fontWeight: 700 }}>+12%</span>
          </div>
        </div>

        {/* Card 2: Active Groups */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #f1f5f9',
            padding: '1.25rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8125rem', color: '#64748b', fontWeight: 500 }}>
              Active Groups
            </span>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: '#ecfdf5',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Users size={16} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.5rem' }}>
            <span style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>236</span>
            <span style={{ fontSize: '0.78rem', color: '#16a34a', fontWeight: 700 }}>83%</span>
          </div>
        </div>

        {/* Card 3: Total Workers */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #f1f5f9',
            padding: '1.25rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8125rem', color: '#64748b', fontWeight: 500 }}>
              Total Workers
            </span>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: '#eff6ff',
                color: '#3b82f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <UserCheck size={16} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.5rem' }}>
            <span style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>1,842</span>
            <span style={{ fontSize: '0.78rem', color: '#16a34a', fontWeight: 700 }}>+15%</span>
          </div>
        </div>
      </div>

      {/* 4. HORIZONTAL FILTER BAR MATCHING MOCKUP */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr)) 1.8fr',
          gap: '0.75rem',
          backgroundColor: '#ffffff',
          padding: '0.75rem 1rem',
          borderRadius: '12px',
          border: '1px solid #f1f5f9',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
        }}
      >
        <select
          value={selectedDistrict}
          onChange={(e) => setSelectedDistrict(e.target.value)}
          style={{
            padding: '0.55rem 0.85rem',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            backgroundColor: '#ffffff',
            fontSize: '0.84rem',
            color: '#334155',
            outline: 'none',
          }}
        >
          <option value="All Districts">All Districts</option>
          <option value="Medak">Medak</option>
          <option value="Nizamabad">Nizamabad</option>
          <option value="Karimnagar">Karimnagar</option>
          <option value="Warangal">Warangal</option>
          <option value="Khammam">Khammam</option>
        </select>

        <select
          value={selectedMandal}
          onChange={(e) => setSelectedMandal(e.target.value)}
          style={{
            padding: '0.55rem 0.85rem',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            backgroundColor: '#ffffff',
            fontSize: '0.84rem',
            color: '#334155',
            outline: 'none',
          }}
        >
          <option value="All Mandals">All Mandals</option>
          <option value="Siddipet Rural">Siddipet Rural</option>
          <option value="Bodhan">Bodhan</option>
          <option value="Huzurabad">Huzurabad</option>
          <option value="Parkal">Parkal</option>
        </select>

        <select
          value={selectedVillage}
          onChange={(e) => setSelectedVillage(e.target.value)}
          style={{
            padding: '0.55rem 0.85rem',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            backgroundColor: '#ffffff',
            fontSize: '0.84rem',
            color: '#334155',
            outline: 'none',
          }}
        >
          <option value="All Villages">All Villages</option>
          <option value="Chinna Shivnoor">Chinna Shivnoor</option>
          <option value="Kothapalli">Kothapalli</option>
          <option value="Velgatoor">Velgatoor</option>
        </select>

        <div style={{ position: 'relative' }}>
          <Search
            size={16}
            color="#94a3b8"
            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            placeholder="Search by name, village or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.55rem 0.85rem 0.55rem 2.25rem',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              backgroundColor: '#ffffff',
              fontSize: '0.84rem',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>
      </div>

      {/* 5. TAB VIEW: LABOUR GROUPS (CARD DIRECTORY MATCHING MOCKUP) */}
      {activeTab === 'groups' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {filteredGroups.map((group) => (
            <div
              key={group.id}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '14px',
                border: '1px solid #f1f5f9',
                padding: '1.25rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1.25rem',
                transition: 'box-shadow 0.15s ease',
              }}
            >
              {/* Left Column: Image + Info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flex: 1, minWidth: '320px' }}>
                <img
                  src={group.image}
                  alt={group.name}
                  style={{
                    width: '135px',
                    height: '90px',
                    borderRadius: '10px',
                    objectFit: 'cover',
                    flexShrink: 0,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                  }}
                />

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                      {group.name}
                    </h3>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'auto auto', gap: '0.35rem 1.5rem', fontSize: '0.8125rem', color: '#64748b' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <MapPin size={14} color="#64748b" />
                      <span>{group.district}, {group.state}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Users size={14} color="#64748b" />
                      <span>{group.workersCount} Workers</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <ShieldCheck size={14} color="#059669" />
                      <span>{group.workersCount} Workers</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Calendar size={14} color="#64748b" />
                      <span>{group.wageType}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', color: '#475569', marginTop: '0.1rem' }}>
                    <Sprout size={13} color="#059669" />
                    <span>{group.crops}</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Status Badge + Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span
                  style={{
                    padding: '0.3rem 0.85rem',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    backgroundColor: group.status === 'Available' ? '#ecfdf5' : '#fee2e2',
                    color: group.status === 'Available' ? '#059669' : '#dc2626',
                  }}
                >
                  {group.status}
                </span>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', minWidth: '120px' }}>
                  <a
                    href={`tel:${group.phone}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.35rem',
                      padding: '0.45rem 1rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      backgroundColor: '#ffffff',
                      color: '#0f172a',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      textDecoration: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <Phone size={13} />
                    <span>Call</span>
                  </a>

                  <button
                    onClick={() => setSelectedGroup(group)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '0.48rem 1rem',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: '#059669',
                      color: '#ffffff',
                      fontSize: '0.8125rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Profile
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 6. TAB VIEW: BOOKING REQUESTS (WITH LIVE BACKEND SUPABASE DATA) */}
      {activeTab === 'requests' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <DataTable
              columns={columns}
              data={list}
              isLoading={isLoading}
              keyExtractor={(r) => r.id}
              emptyMessage="No labour booking requests found."
            />
            <Pagination
              currentPage={page}
              totalItems={total}
              pageSize={limit}
              onPageChange={setPage}
              onPageSizeChange={(newLimit) => {
                setLimit(newLimit);
                setPage(1);
              }}
            />
          </div>
        </div>
      )}

      {/* 7. TAB VIEW: WORKER DIRECTORY */}
      {activeTab === 'workers' && (
        <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid #f1f5f9', padding: '1.25rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.5rem 0' }}>
            Registered Agricultural Workers Directory
          </h3>
          <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: '0 0 1rem 0' }}>
            1,842 verified rural laborers registered across Medak, Warangal, Nizamabad, and Karimnagar mandals.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {[
              { name: 'K. Ramulu', role: 'Team Leader / Mukkadam', village: 'Medak', experience: '15 Yrs', phone: '+91 98480 34211', skill: 'Paddy Harvesting, Machine Bunding' },
              { name: 'S. Pochamma', role: 'Head Crew Specialist', village: 'Khammam', experience: '12 Yrs', phone: '+91 97000 66778', skill: 'Cotton Picking & Sorting' },
              { name: 'M. Venkanna', role: 'Heavy Equipment Crew', village: 'Warangal', experience: '8 Yrs', phone: '+91 98480 88990', skill: 'Turmeric Boiler Operator' },
              { name: 'B. Sathaiah', role: 'Transplanting Specialist', village: 'Karimnagar', experience: '10 Yrs', phone: '+91 99890 12345', skill: 'System of Rice Intensification (SRI)' },
            ].map((worker, idx) => (
              <div key={idx} style={{ padding: '1rem', backgroundColor: '#fafbfc', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                <div style={{ fontWeight: 700, color: '#0f172a' }}>{worker.name}</div>
                <div style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600 }}>{worker.role}</div>
                <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.35rem' }}>📍 {worker.village} • ⏱️ {worker.experience} exp</div>
                <div style={{ fontSize: '0.78rem', color: '#334155', marginTop: '0.2rem' }}>🌾 {worker.skill}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8. TAB VIEW: WAGES */}
      {activeTab === 'wages' && (
        <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid #f1f5f9', padding: '1.25rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.5rem 0' }}>
            District Wage Standards & Minimum Benchmarks
          </h3>
          <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: '0 0 1rem 0' }}>
            Fair labor standards benchmarked with Telangana State Rural Employment guidelines.
          </p>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#fafbfc', borderBottom: '1px solid #f1f5f9', color: '#94a3b8', fontSize: '0.6875rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '0.75rem 1rem' }}>Farm Operation</th>
                <th style={{ padding: '0.75rem 1rem' }}>Standard Working Hours</th>
                <th style={{ padding: '0.75rem 1rem' }}>Benchmark Daily Wage</th>
                <th style={{ padding: '0.75rem 1rem' }}>Piece-Rate Alternative</th>
              </tr>
            </thead>
            <tbody>
              {[
                { op: 'Paddy Manual Transplanting', hrs: '8 AM - 4 PM (8 hrs)', wage: '₹450 - ₹550 / day', piece: '₹3,500 - ₹4,200 / acre' },
                { op: 'Cotton Picking (Manual)', hrs: '8 AM - 4 PM', wage: '₹400 - ₹500 / day', piece: '₹12 - ₹15 / kg picked' },
                { op: 'Chilli Harvesting (Red Dry)', hrs: '8 AM - 5 PM', wage: '₹450 - ₹550 / day', piece: '₹14 - ₹18 / kg harvested' },
                { op: 'Weeding & Intercultivation', hrs: '8 AM - 3 PM (7 hrs)', wage: '₹350 - ₹420 / day', piece: '₹1,800 - ₹2,200 / acre' },
              ].map((w, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #f8fafc' }}>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#0f172a' }}>{w.op}</td>
                  <td style={{ padding: '0.75rem 1rem', color: '#64748b' }}>{w.hrs}</td>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#059669' }}>{w.wage}</td>
                  <td style={{ padding: '0.75rem 1rem', color: '#475569' }}>{w.piece}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* DRAWER: LABOUR GROUP PROFILE */}
      <Drawer
        isOpen={Boolean(selectedGroup)}
        onClose={() => setSelectedGroup(null)}
        title={selectedGroup ? selectedGroup.name : ''}
        subtitle={selectedGroup ? `Leader: ${selectedGroup.leaderName} (${selectedGroup.phone})` : undefined}
        width="560px"
      >
        {selectedGroup && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <img
              src={selectedGroup.image}
              alt={selectedGroup.name}
              style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '12px' }}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', backgroundColor: '#fafbfc', padding: '1rem', borderRadius: '10px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Group Strength:</span>
                <div style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a' }}>{selectedGroup.workersCount} Workers</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Current Status:</span>
                <div>
                  <span style={{ padding: '0.2rem 0.6rem', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 700, backgroundColor: selectedGroup.status === 'Available' ? '#ecfdf5' : '#fee2e2', color: selectedGroup.status === 'Available' ? '#059669' : '#dc2626' }}>
                    {selectedGroup.status}
                  </span>
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Location:</span>
                <div style={{ fontWeight: 600, color: '#0f172a' }}>{selectedGroup.district}, {selectedGroup.state}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Payment Mode:</span>
                <div style={{ fontWeight: 600, color: '#0f172a' }}>{selectedGroup.wageType}</div>
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.4rem 0' }}>Specialized Crop Operations</h4>
              <p style={{ fontSize: '0.85rem', color: '#475569', margin: 0 }}>{selectedGroup.specialization}</p>
            </div>

            <div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.4rem 0' }}>Experience & Client Rating</h4>
              <p style={{ fontSize: '0.85rem', color: '#475569', margin: 0 }}>⭐ {selectedGroup.rating} / 5.0 (Across 80+ seasonal farm deployments) • {selectedGroup.experienceYears} Years active service</p>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
              <a
                href={`tel:${selectedGroup.phone}`}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  backgroundColor: '#059669',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  textDecoration: 'none',
                }}
              >
                <Phone size={16} />
                <span>Call {selectedGroup.leaderName}</span>
              </a>
            </div>
          </div>
        )}
      </Drawer>

      {/* DRAWER: LIVE BOOKING REQUEST INSPECTION */}
      <Drawer
        isOpen={Boolean(selectedItem)}
        onClose={() => setSelectedItem(null)}
        title={selectedItem ? `Labour Booking: ${selectedItem.taskType}` : ''}
        subtitle={selectedItem ? `Farmer: ${selectedItem.farmer.name} (${selectedItem.farmer.phoneNumber})` : undefined}
        width="600px"
        footer={
          selectedItem && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>Update Status:</span>
                <select
                  value={selectedItem.status}
                  onChange={(e) => {
                    setTargetStatus(e.target.value);
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
                  <option value="LABOURERS_ASSIGNED">Labourers Assigned</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Close Dossier
              </button>
            </div>
          )
        }
      >
        {selectedItem && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ backgroundColor: '#fafbfc', padding: '1rem', borderRadius: '8px' }}>
              <div style={{ fontWeight: 700, color: '#0f172a' }}>{selectedItem.taskType}</div>
              <div style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: '0.25rem' }}>
                Required: {selectedItem.labourersRequired} Workers • Start: {selectedItem.preferredStartDate ? new Date(selectedItem.preferredStartDate).toLocaleDateString() : 'Immediate'}
              </div>
            </div>
          </div>
        )}
      </Drawer>

      {/* CONFIRMATION MODAL FOR STATUS UPDATES */}
      <ConfirmationModal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        onConfirm={handleStatusUpdateConfirm}
        title="Update Labour Booking Status"
        message={`Are you sure you want to change the status of this booking to "${targetStatus}"?`}
        confirmText="Confirm Status Update"
        isLoading={isUpdating}
      />

      {/* ADD LABOUR GROUP MODAL */}
      {isAddGroupOpen && (
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
          onClick={() => setIsAddGroupOpen(false)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '600px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              display: 'flex',
              flexDirection: 'column',
            }}
            onClick={(e) => e.stopPropagation()}
          >
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
                  <Users size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Register New Labour Group
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
                    Add a verified agricultural labour crew to the rural network
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddGroupOpen(false)}
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

            <form onSubmit={handleAddGroupSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  Labour Group Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sri Venkateshwara Labour Team"
                  value={newGroupForm.name}
                  onChange={(e) => setNewGroupForm({ ...newGroupForm, name: e.target.value })}
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
                    Group Leader / Mukkadam Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Chandraiah"
                    value={newGroupForm.leaderName}
                    onChange={(e) => setNewGroupForm({ ...newGroupForm, leaderName: e.target.value })}
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

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    Leader Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 98480 55667"
                    value={newGroupForm.phone}
                    onChange={(e) => setNewGroupForm({ ...newGroupForm, phone: e.target.value })}
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    Crew Strength (Workers Count) *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 15"
                    value={newGroupForm.workersCount}
                    onChange={(e) => setNewGroupForm({ ...newGroupForm, workersCount: e.target.value })}
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

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    District
                  </label>
                  <select
                    value={newGroupForm.district}
                    onChange={(e) => setNewGroupForm({ ...newGroupForm, district: e.target.value })}
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
                    <option value="Warangal">Warangal</option>
                    <option value="Medak">Medak</option>
                    <option value="Nizamabad">Nizamabad</option>
                    <option value="Karimnagar">Karimnagar</option>
                    <option value="Khammam">Khammam</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    Preferred Wage Type
                  </label>
                  <select
                    value={newGroupForm.wageType}
                    onChange={(e) => setNewGroupForm({ ...newGroupForm, wageType: e.target.value })}
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
                    <option value="Daily Wage">Daily Wage</option>
                    <option value="Contract / Acre">Contract / Acre Basis</option>
                    <option value="Piece-Rate">Piece-Rate (per kg / bag)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    Primary Crops
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Paddy, Cotton, Chilli"
                    value={newGroupForm.crops}
                    onChange={(e) => setNewGroupForm({ ...newGroupForm, crops: e.target.value })}
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
                  Specialized Operations & Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Skilled in paddy transplanting, mechanical harvesting accompaniment, sorting..."
                  value={newGroupForm.specialization}
                  onChange={(e) => setNewGroupForm({ ...newGroupForm, specialization: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.875rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit',
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
                  onClick={() => setIsAddGroupOpen(false)}
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
                  disabled={isSubmittingGroup}
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
                    cursor: isSubmittingGroup ? 'not-allowed' : 'pointer',
                    boxShadow: '0 1px 3px rgba(5, 150, 105, 0.3)',
                    opacity: isSubmittingGroup ? 0.7 : 1,
                  }}
                >
                  <Send size={15} />
                  <span>{isSubmittingGroup ? 'Saving...' : 'Register Group'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
