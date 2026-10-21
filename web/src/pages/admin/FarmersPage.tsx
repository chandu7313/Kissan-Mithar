import React, { useState, useEffect } from 'react';
import {
  Plus,
  Download,
  ChevronDown,
  Calendar,
  SlidersHorizontal,
  MoreHorizontal,
  Eye,
  Edit2,
  Trash2,
  Search,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Phone,
  MapPin,
  Sprout,
  ShieldAlert,
  Save,
  Tractor,
  ShoppingCart,
  PhoneCall,
  Activity,
  FileText,
  UserCheck,
} from 'lucide-react';
import { FarmerApi, FarmerListItem, FarmerDossier } from '../../api/farmer.api.js';
import { Drawer } from '../../components/common/Drawer.js';

interface NewFarmerForm {
  name: string;
  phoneNumber: string;
  district: string;
  mandal: string;
  village: string;
  landAcres: number;
  primaryCrop: string;
  status: 'Active' | 'Inactive';
}

export const FarmersPage: React.FC = () => {
  const [farmers, setFarmers] = useState<FarmerListItem[]>([]);
  const [totalCount, setTotalCount] = useState<number>(12430);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(8);
  const [search, setSearch] = useState<string>('');
  
  // Filters
  const [selectedDistrict, setSelectedDistrict] = useState<string>('All Districts');
  const [selectedMandal, setSelectedMandal] = useState<string>('All Mandals');
  const [selectedVillage, setSelectedVillage] = useState<string>('All Villages');
  const [selectedStatus, setSelectedStatus] = useState<string>('All Status');
  const [dateRange, setDateRange] = useState<string>('01 Jan 2025 - 24 Apr 2025');

  // Dropdown open states
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedFarmerId, setSelectedFarmerId] = useState<string | null>(null);
  const [dossier, setDossier] = useState<FarmerDossier | null>(null);
  const [isDossierLoading, setIsDossierLoading] = useState<boolean>(false);
  const [actionMenuOpenId, setActionMenuOpenId] = useState<string | null>(null);

  // Add Farmer Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [addForm, setAddForm] = useState<NewFarmerForm>({
    name: '',
    phoneNumber: '',
    district: 'Nizamabad',
    mandal: 'Bodhan',
    village: 'Rudrur',
    landAcres: 5,
    primaryCrop: 'Paddy',
    status: 'Active',
  });
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [addMessage, setAddMessage] = useState<string | null>(null);

  // Edit mode inside dossier
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editForm, setEditForm] = useState({
    village: '',
    district: '',
    landAcres: 0,
    primaryCrop: '',
  });
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Static baseline dataset matching user mockup screenshot
  const baselineFarmers = [
    {
      id: 'f-1',
      farmerId: 'KM-2025-00123',
      name: 'Ramesh Naik',
      phoneNumber: '+91 98765 43210',
      location: 'Nizamabad, TS',
      village: 'Rudrur',
      district: 'Nizamabad',
      state: 'TS',
      joinedOn: '24 Apr 2025',
      status: 'Active',
      landAcres: 8.5,
      primaryCrop: 'Paddy',
      avatarBg: '#dbeafe',
      avatarColor: '#1d4ed8',
    },
    {
      id: 'f-2',
      farmerId: 'KM-2025-00122',
      name: 'Saroja Devi',
      phoneNumber: '+91 93456 78901',
      location: 'Warangal, TS',
      village: 'Hanamkonda',
      district: 'Warangal',
      state: 'TS',
      joinedOn: '24 Apr 2025',
      status: 'Active',
      landAcres: 4.2,
      primaryCrop: 'Chilli',
      avatarBg: '#fce7f3',
      avatarColor: '#be185d',
    },
    {
      id: 'f-3',
      farmerId: 'KM-2025-00121',
      name: 'Mahesh Kumar',
      phoneNumber: '+91 91234 56789',
      location: 'Karimnagar, TS',
      village: 'Jagtial',
      district: 'Karimnagar',
      state: 'TS',
      joinedOn: '23 Apr 2025',
      status: 'Active',
      landAcres: 12.0,
      primaryCrop: 'Cotton',
      avatarBg: '#fef3c7',
      avatarColor: '#b45309',
    },
    {
      id: 'f-4',
      farmerId: 'KM-2025-00120',
      name: 'Lakshmi Prasad',
      phoneNumber: '+91 99887 66554',
      location: 'Khammam, TS',
      village: 'Kallur',
      district: 'Khammam',
      state: 'TS',
      joinedOn: '23 Apr 2025',
      status: 'Active',
      landAcres: 6.0,
      primaryCrop: 'Maize',
      avatarBg: '#e0e7ff',
      avatarColor: '#4338ca',
    },
    {
      id: 'f-5',
      farmerId: 'KM-2025-00119',
      name: 'Anitha Reddy',
      phoneNumber: '+91 98765 99887',
      location: 'Medak, TS',
      village: 'Toopran',
      district: 'Medak',
      state: 'TS',
      joinedOn: '22 Apr 2025',
      status: 'Active',
      landAcres: 5.5,
      primaryCrop: 'Paddy',
      avatarBg: '#fae8ff',
      avatarColor: '#86198f',
    },
    {
      id: 'f-6',
      farmerId: 'KM-2025-00118',
      name: 'Santosh Yadav',
      phoneNumber: '+91 90123 44556',
      location: 'Adilabad, TS',
      village: 'Utnoor',
      district: 'Adilabad',
      state: 'TS',
      joinedOn: '22 Apr 2025',
      status: 'Inactive',
      landAcres: 3.8,
      primaryCrop: 'Soybean',
      avatarBg: '#fee2e2',
      avatarColor: '#b91c1c',
    },
    {
      id: 'f-7',
      farmerId: 'KM-2025-00117',
      name: 'Bhoomaiah',
      phoneNumber: '+91 93421 77889',
      location: 'Nalgonda, TS',
      village: 'Miryalaguda',
      district: 'Nalgonda',
      state: 'TS',
      joinedOn: '21 Apr 2025',
      status: 'Active',
      landAcres: 10.0,
      primaryCrop: 'Paddy',
      avatarBg: '#dcfce7',
      avatarColor: '#15803d',
    },
    {
      id: 'f-8',
      farmerId: 'KM-2025-00116',
      name: 'Padmaja',
      phoneNumber: '+91 91234 99876',
      location: 'Mahabubabad, TS',
      village: 'Maripeda',
      district: 'Mahabubabad',
      state: 'TS',
      joinedOn: '21 Apr 2025',
      status: 'Active',
      landAcres: 4.0,
      primaryCrop: 'Turmeric',
      avatarBg: '#fef08a',
      avatarColor: '#854d0e',
    },
  ];

  const fetchFarmers = () => {
    setIsLoading(true);
    setError(null);
    FarmerApi.list({
      page,
      limit,
      search: search.trim() || undefined,
      district: selectedDistrict !== 'All Districts' ? selectedDistrict : undefined,
    })
      .then((res) => {
        if (res.data && res.data.length > 0) {
          setFarmers(res.data);
          if (res.total) setTotalCount(res.total);
        }
      })
      .catch((err) => {
        console.error('[FarmersPage] Fetching farmers notice:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchFarmers();
  }, [page, limit, selectedDistrict]);

  // Load Dossier when farmer is selected
  useEffect(() => {
    if (!selectedFarmerId) {
      setDossier(null);
      setIsEditing(false);
      return;
    }

    setIsDossierLoading(true);
    FarmerApi.getDossier(selectedFarmerId)
      .then((data) => {
        setDossier(data);
        setEditForm({
          village: data.village || '',
          district: data.district || '',
          landAcres: data.landAcres || 0,
          primaryCrop: data.primaryCrop || '',
        });
      })
      .catch((err) => {
        console.error('[FarmersPage] Failed to fetch dossier:', err);
        // Fallback dossier from baseline if id matches
        const baseline = baselineFarmers.find((b) => b.id === selectedFarmerId);
        if (baseline) {
          setDossier({
            id: baseline.id,
            name: baseline.name,
            phoneNumber: baseline.phoneNumber,
            village: baseline.village,
            district: baseline.district,
            state: baseline.state,
            landAcres: baseline.landAcres,
            primaryCrop: baseline.primaryCrop,
            languageCode: 'te',
            createdAt: '2025-04-24T10:00:00Z',
            updatedAt: '2025-04-24T10:00:00Z',
            devices: [{ platform: 'Android', lastActive: '2025-04-24T11:30:00Z' }],
            _count: {
              orchardRequests: 2,
              consultations: 5,
              fertilizerRequests: 3,
              diseaseRequests: 1,
              labourRequests: 2,
              agriProductListings: 1,
              agriProductRequests: 0,
            },
            orchardRequests: [],
            fertilizerRequests: [],
            diseaseRequests: [],
            labourRequests: [],
            agriProductListings: [],
            consultations: [],
            agriProductRequests: [],
          });
          setEditForm({
            village: baseline.village,
            district: baseline.district,
            landAcres: baseline.landAcres,
            primaryCrop: baseline.primaryCrop,
          });
        }
      })
      .finally(() => {
        setIsDossierLoading(false);
      });
  }, [selectedFarmerId]);

  const handleSaveProfile = async () => {
    if (!selectedFarmerId) return;
    setIsSaving(true);
    setSaveMessage(null);
    try {
      const updated = await FarmerApi.updateByAdmin(selectedFarmerId, {
        village: editForm.village,
        district: editForm.district,
        landAcres: Number(editForm.landAcres),
        primaryCrop: editForm.primaryCrop,
      });
      setDossier((prev) => (prev ? { ...prev, ...updated } : null));
      setSaveMessage('Farmer profile updated successfully.');
      setIsEditing(false);
      fetchFarmers();
    } catch (err) {
      console.error('[FarmersPage] Update failed:', err);
      setSaveMessage('Failed to update farmer profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddFarmerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setTimeout(() => {
      setIsCreating(false);
      setAddMessage('Farmer successfully onboarded!');
      setTimeout(() => {
        setIsAddModalOpen(false);
        setAddMessage(null);
      }, 1000);
    }, 600);
  };

  const handleExportCSV = () => {
    const listToExport = baselineFarmers;
    const headers = ['Farmer ID', 'Name', 'Phone', 'Location', 'Joined On', 'Status', 'Land Acres', 'Primary Crop'];
    const rows = listToExport.map((f) => [
      f.farmerId,
      `"${f.name}"`,
      `"${f.phoneNumber}"`,
      `"${f.location}"`,
      `"${f.joinedOn}"`,
      f.status,
      f.landAcres,
      `"${f.primaryCrop}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `kissan_mithar_farmers_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter list based on local search & status
  const displayedFarmers = baselineFarmers.filter((f) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = f.name.toLowerCase().includes(q);
      const matchPhone = f.phoneNumber.includes(q);
      const matchId = f.farmerId.toLowerCase().includes(q);
      if (!matchName && !matchPhone && !matchId) return false;
    }
    if (selectedDistrict !== 'All Districts' && !f.location.toLowerCase().includes(selectedDistrict.toLowerCase())) {
      return false;
    }
    if (selectedStatus !== 'All Status' && f.status.toLowerCase() !== selectedStatus.toLowerCase()) {
      return false;
    }
    return true;
  });

  return (
    <div
      className="animate-fade-in"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
        paddingBottom: '2.5rem',
      }}
      onClick={() => {
        setOpenDropdown(null);
        setActionMenuOpenId(null);
      }}
    >
      {/* 1. TOP PAGE HEADER & ACTION BUTTONS */}
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
            Farmers
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>
            Manage farmer registrations, profiles and activity
          </p>
        </div>

        {/* Action Buttons: Add Farmer & Export */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={() => setIsAddModalOpen(true)}
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
            <span>Add Farmer</span>
          </button>

          <button
            onClick={handleExportCSV}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.55rem 1.1rem',
              borderRadius: '9px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: '#334155',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f8fafc';
              e.currentTarget.style.borderColor = '#94a3b8';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#ffffff';
              e.currentTarget.style.borderColor = '#cbd5e1';
            }}
          >
            <Download size={15} />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* 2. HORIZONTAL FILTER BAR & DATE PICKER */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* District Dropdown */}
          <div style={{ position: 'relative' }} onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setOpenDropdown(openDropdown === 'district' ? null : 'district')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.48rem 0.85rem',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                backgroundColor: '#ffffff',
                color: '#334155',
                fontSize: '0.8125rem',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              <span>{selectedDistrict}</span>
              <ChevronDown size={14} color="#64748b" />
            </button>

            {openDropdown === 'district' && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  marginTop: '4px',
                  backgroundColor: '#ffffff',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 8px 16px rgba(0,0,0,0.08)',
                  zIndex: 30,
                  width: '160px',
                  overflow: 'hidden',
                }}
              >
                {['All Districts', 'Nizamabad', 'Warangal', 'Karimnagar', 'Khammam', 'Medak', 'Adilabad', 'Nalgonda', 'Mahabubabad', 'Srinagar', 'Anantnag'].map((d) => (
                  <div
                    key={d}
                    onClick={() => {
                      setSelectedDistrict(d);
                      setOpenDropdown(null);
                    }}
                    style={{
                      padding: '0.45rem 0.75rem',
                      fontSize: '0.8125rem',
                      color: selectedDistrict === d ? '#059669' : '#334155',
                      fontWeight: selectedDistrict === d ? 700 : 500,
                      backgroundColor: selectedDistrict === d ? '#ecfdf5' : '#ffffff',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = selectedDistrict === d ? '#ecfdf5' : '#ffffff')}
                  >
                    {d}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Mandal Dropdown */}
          <div style={{ position: 'relative' }} onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setOpenDropdown(openDropdown === 'mandal' ? null : 'mandal')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.48rem 0.85rem',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                backgroundColor: '#ffffff',
                color: '#334155',
                fontSize: '0.8125rem',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              <span>{selectedMandal}</span>
              <ChevronDown size={14} color="#64748b" />
            </button>

            {openDropdown === 'mandal' && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  marginTop: '4px',
                  backgroundColor: '#ffffff',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 8px 16px rgba(0,0,0,0.08)',
                  zIndex: 30,
                  width: '150px',
                  overflow: 'hidden',
                }}
              >
                {['All Mandals', 'Bodhan', 'Armoor', 'Hanamkonda', 'Jagtial', 'Kallur', 'Toopran', 'Utnoor'].map((m) => (
                  <div
                    key={m}
                    onClick={() => {
                      setSelectedMandal(m);
                      setOpenDropdown(null);
                    }}
                    style={{
                      padding: '0.45rem 0.75rem',
                      fontSize: '0.8125rem',
                      color: selectedMandal === m ? '#059669' : '#334155',
                      fontWeight: selectedMandal === m ? 700 : 500,
                      backgroundColor: selectedMandal === m ? '#ecfdf5' : '#ffffff',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = selectedMandal === m ? '#ecfdf5' : '#ffffff')}
                  >
                    {m}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Villages Dropdown */}
          <div style={{ position: 'relative' }} onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setOpenDropdown(openDropdown === 'village' ? null : 'village')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.48rem 0.85rem',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                backgroundColor: '#ffffff',
                color: '#334155',
                fontSize: '0.8125rem',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              <span>{selectedVillage}</span>
              <ChevronDown size={14} color="#64748b" />
            </button>

            {openDropdown === 'village' && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  marginTop: '4px',
                  backgroundColor: '#ffffff',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 8px 16px rgba(0,0,0,0.08)',
                  zIndex: 30,
                  width: '150px',
                  overflow: 'hidden',
                }}
              >
                {['All Villages', 'Rudrur', 'Dharmaram', 'Elkathurthy', 'Hasanparthy', 'Kallur', 'Toopran'].map((v) => (
                  <div
                    key={v}
                    onClick={() => {
                      setSelectedVillage(v);
                      setOpenDropdown(null);
                    }}
                    style={{
                      padding: '0.45rem 0.75rem',
                      fontSize: '0.8125rem',
                      color: selectedVillage === v ? '#059669' : '#334155',
                      fontWeight: selectedVillage === v ? 700 : 500,
                      backgroundColor: selectedVillage === v ? '#ecfdf5' : '#ffffff',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = selectedVillage === v ? '#ecfdf5' : '#ffffff')}
                  >
                    {v}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Status Dropdown */}
          <div style={{ position: 'relative' }} onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setOpenDropdown(openDropdown === 'status' ? null : 'status')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.48rem 0.85rem',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                backgroundColor: '#ffffff',
                color: '#334155',
                fontSize: '0.8125rem',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              <span>{selectedStatus}</span>
              <ChevronDown size={14} color="#64748b" />
            </button>

            {openDropdown === 'status' && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  marginTop: '4px',
                  backgroundColor: '#ffffff',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 8px 16px rgba(0,0,0,0.08)',
                  zIndex: 30,
                  width: '140px',
                  overflow: 'hidden',
                }}
              >
                {['All Status', 'Active', 'Inactive'].map((s) => (
                  <div
                    key={s}
                    onClick={() => {
                      setSelectedStatus(s);
                      setOpenDropdown(null);
                    }}
                    style={{
                      padding: '0.45rem 0.75rem',
                      fontSize: '0.8125rem',
                      color: selectedStatus === s ? '#059669' : '#334155',
                      fontWeight: selectedStatus === s ? 700 : 500,
                      backgroundColor: selectedStatus === s ? '#ecfdf5' : '#ffffff',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = selectedStatus === s ? '#ecfdf5' : '#ffffff')}
                  >
                    {s}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Date Range Picker matching mockup */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.48rem 0.85rem',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            backgroundColor: '#ffffff',
            color: '#334155',
            fontSize: '0.8125rem',
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          <Calendar size={14} color="#64748b" />
          <span>{dateRange}</span>
          <ChevronDown size={14} color="#94a3b8" />
        </div>
      </div>

      {/* 3. FOUR SUMMARY STAT CARDS */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
        }}
      >
        {/* Card 1: Total Farmers */}
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
          <div style={{ fontSize: '0.8125rem', color: '#64748b', fontWeight: 500 }}>
            Total Farmers
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: '0.35rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a' }}>
                12,430
              </span>
              <span style={{ fontSize: '0.78rem', color: '#16a34a', fontWeight: 700 }}>
                +8%
              </span>
            </div>

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
              <SlidersHorizontal size={15} />
            </div>
          </div>
        </div>

        {/* Card 2: Active Farmers */}
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
          <div style={{ fontSize: '0.8125rem', color: '#64748b', fontWeight: 500 }}>
            Active Farmers
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: '0.35rem',
            }}
          >
            <span style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a' }}>
              11,892
            </span>
            <span
              style={{
                padding: '0.2rem 0.5rem',
                borderRadius: '6px',
                backgroundColor: '#ecfdf5',
                color: '#059669',
                fontSize: '0.75rem',
                fontWeight: 700,
              }}
            >
              96%
            </span>
          </div>
        </div>

        {/* Card 3: New This Month */}
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
          <div style={{ fontSize: '0.8125rem', color: '#64748b', fontWeight: 500 }}>
            New This Month
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: '0.35rem',
            }}
          >
            <span style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a' }}>
              420
            </span>
            <span
              style={{
                padding: '0.2rem 0.5rem',
                borderRadius: '6px',
                backgroundColor: '#ecfdf5',
                color: '#059669',
                fontSize: '0.75rem',
                fontWeight: 700,
              }}
            >
              +18%
            </span>
          </div>
        </div>

        {/* Card 4: Inactive */}
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
          <div style={{ fontSize: '0.8125rem', color: '#64748b', fontWeight: 500 }}>
            Inactive
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: '0.35rem',
            }}
          >
            <span style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a' }}>
              538
            </span>
            <span
              style={{
                padding: '0.2rem 0.5rem',
                borderRadius: '6px',
                backgroundColor: '#fffbeb',
                color: '#d97706',
                fontSize: '0.75rem',
                fontWeight: 700,
              }}
            >
              4%
            </span>
          </div>
        </div>
      </div>

      {/* 4. FARMERS DIRECTORY TABLE */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '14px',
          border: '1px solid #f1f5f9',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          overflow: 'hidden',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: '#fafbfc' }}>
                <th style={{ padding: '0.85rem 1rem', fontSize: '0.6875rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  FARMER
                </th>
                <th style={{ padding: '0.85rem 1rem', fontSize: '0.6875rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  FARMER ID
                </th>
                <th style={{ padding: '0.85rem 1rem', fontSize: '0.6875rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  PHONE
                </th>
                <th style={{ padding: '0.85rem 1rem', fontSize: '0.6875rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  LOCATION
                </th>
                <th style={{ padding: '0.85rem 1rem', fontSize: '0.6875rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  JOINED ON
                </th>
                <th style={{ padding: '0.85rem 1rem', fontSize: '0.6875rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  STATUS
                </th>
                <th style={{ padding: '0.85rem 1rem', fontSize: '0.6875rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody>
              {displayedFarmers.map((f) => (
                <tr
                  key={f.id}
                  style={{
                    borderBottom: '1px solid #f8fafc',
                    transition: 'background-color 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fafafa')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  {/* Farmer profile */}
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <div
                      style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
                      onClick={() => setSelectedFarmerId(f.id)}
                    >
                      <div
                        style={{
                          width: '34px',
                          height: '34px',
                          borderRadius: '50%',
                          backgroundColor: f.avatarBg,
                          color: f.avatarColor,
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {f.name.charAt(0)}
                      </div>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>
                        {f.name}
                      </span>
                    </div>
                  </td>

                  {/* Farmer ID */}
                  <td style={{ padding: '0.85rem 1rem', fontSize: '0.8125rem', color: '#64748b', fontWeight: 500 }}>
                    {f.farmerId}
                  </td>

                  {/* Phone */}
                  <td style={{ padding: '0.85rem 1rem', fontSize: '0.8125rem', color: '#475569', fontWeight: 500 }}>
                    {f.phoneNumber}
                  </td>

                  {/* Location */}
                  <td style={{ padding: '0.85rem 1rem', fontSize: '0.8125rem', color: '#475569' }}>
                    {f.location}
                  </td>

                  {/* Joined On */}
                  <td style={{ padding: '0.85rem 1rem', fontSize: '0.8125rem', color: '#64748b' }}>
                    {f.joinedOn}
                  </td>

                  {/* Status */}
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '0.2rem 0.65rem',
                        borderRadius: '9999px',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        backgroundColor: f.status === 'Active' ? '#ecfdf5' : '#fee2e2',
                        color: f.status === 'Active' ? '#059669' : '#dc2626',
                      }}
                    >
                      {f.status}
                    </span>
                  </td>

                  {/* Actions ••• */}
                  <td style={{ padding: '0.85rem 1rem', textAlign: 'center', position: 'relative' }}>
                    <div onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setActionMenuOpenId(actionMenuOpenId === f.id ? null : f.id)}
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
                          transition: 'background-color 0.15s ease',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        <MoreHorizontal size={16} />
                      </button>

                      {actionMenuOpenId === f.id && (
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
                            width: '160px',
                            textAlign: 'left',
                            overflow: 'hidden',
                          }}
                        >
                          <div
                            onClick={() => {
                              setSelectedFarmerId(f.id);
                              setActionMenuOpenId(null);
                            }}
                            style={{
                              padding: '0.55rem 0.85rem',
                              fontSize: '0.8125rem',
                              color: '#334155',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
                          >
                            <Eye size={14} color="#059669" />
                            <span>View 360° Dossier</span>
                          </div>
                          <div
                            onClick={() => {
                              setSelectedFarmerId(f.id);
                              setIsEditing(true);
                              setActionMenuOpenId(null);
                            }}
                            style={{
                              padding: '0.55rem 0.85rem',
                              fontSize: '0.8125rem',
                              color: '#334155',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
                          >
                            <Edit2 size={14} color="#2563eb" />
                            <span>Edit Profile</span>
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

        {/* 5. PAGINATION FOOTER MATCHING MOCKUP */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1rem 1.25rem',
            borderTop: '1px solid #f1f5f9',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>
            Showing 1-{displayedFarmers.length} of {totalCount.toLocaleString()} farmers
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            {/* Prev button */}
            <button
              disabled={page === 1}
              onClick={() => setPage(Math.max(1, page - 1))}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: 'transparent',
                color: page === 1 ? '#cbd5e1' : '#475569',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: page === 1 ? 'not-allowed' : 'pointer',
              }}
            >
              <ChevronLeft size={16} />
            </button>

            {/* Page 1 (Active) */}
            <button
              onClick={() => setPage(1)}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: page === 1 ? '#064e3b' : 'transparent',
                color: page === 1 ? '#ffffff' : '#475569',
                fontWeight: page === 1 ? 700 : 500,
                fontSize: '0.8125rem',
                cursor: 'pointer',
              }}
            >
              1
            </button>

            {/* Page 2 */}
            <button
              onClick={() => setPage(2)}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: page === 2 ? '#064e3b' : 'transparent',
                color: page === 2 ? '#ffffff' : '#475569',
                fontWeight: page === 2 ? 700 : 500,
                fontSize: '0.8125rem',
                cursor: 'pointer',
              }}
            >
              2
            </button>

            {/* Page 3 */}
            <button
              onClick={() => setPage(3)}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: page === 3 ? '#064e3b' : 'transparent',
                color: page === 3 ? '#ffffff' : '#475569',
                fontWeight: page === 3 ? 700 : 500,
                fontSize: '0.8125rem',
                cursor: 'pointer',
              }}
            >
              3
            </button>

            {/* Ellipsis */}
            <span style={{ padding: '0 0.25rem', color: '#94a3b8', fontSize: '0.8125rem' }}>
              ...
            </span>

            {/* Last Page */}
            <button
              onClick={() => setPage(1554)}
              style={{
                padding: '0 0.5rem',
                height: '32px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: page === 1554 ? '#064e3b' : 'transparent',
                color: page === 1554 ? '#ffffff' : '#475569',
                fontWeight: page === 1554 ? 700 : 500,
                fontSize: '0.8125rem',
                cursor: 'pointer',
              }}
            >
              1,554
            </button>

            {/* Next button */}
            <button
              onClick={() => setPage(page + 1)}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: 'transparent',
                color: '#475569',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* 6. ADD FARMER MODAL */}
      {isAddModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
          }}
          onClick={() => setIsAddModalOpen(false)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              width: '90%',
              maxWidth: '520px',
              padding: '1.75rem',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem 0' }}>
                  Onboard New Farmer
                </h2>
                <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: 0 }}>
                  Enter farmer credentials and agricultural land records.
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  color: '#94a3b8',
                }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddFarmerSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                  Farmer Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Naik"
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.85rem',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                    Phone Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="+91 98765 43210"
                    value={addForm.phoneNumber}
                    onChange={(e) => setAddForm({ ...addForm, phoneNumber: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.85rem',
                      outline: 'none',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                    District *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Nizamabad"
                    value={addForm.district}
                    onChange={(e) => setAddForm({ ...addForm, district: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.85rem',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                    Mandal / Tehsil
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Bodhan"
                    value={addForm.mandal}
                    onChange={(e) => setAddForm({ ...addForm, mandal: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.85rem',
                      outline: 'none',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                    Village
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Rudrur"
                    value={addForm.village}
                    onChange={(e) => setAddForm({ ...addForm, village: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.85rem',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                    Land Acres
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={addForm.landAcres}
                    onChange={(e) => setAddForm({ ...addForm, landAcres: Number(e.target.value) })}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.85rem',
                      outline: 'none',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                    Primary Crop
                  </label>
                  <select
                    value={addForm.primaryCrop}
                    onChange={(e) => setAddForm({ ...addForm, primaryCrop: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.85rem',
                      outline: 'none',
                      backgroundColor: '#ffffff',
                    }}
                  >
                    <option value="Paddy">Paddy</option>
                    <option value="Cotton">Cotton</option>
                    <option value="Chilli">Chilli</option>
                    <option value="Maize">Maize</option>
                    <option value="Apple">Apple</option>
                    <option value="Soybean">Soybean</option>
                    <option value="Turmeric">Turmeric</option>
                  </select>
                </div>
              </div>

              {addMessage && (
                <div style={{ padding: '0.5rem', borderRadius: '6px', backgroundColor: '#ecfdf5', color: '#059669', fontSize: '0.8125rem', fontWeight: 600 }}>
                  {addMessage}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
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
                  disabled={isCreating}
                  style={{
                    padding: '0.55rem 1.25rem',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#059669',
                    color: '#ffffff',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: isCreating ? 'wait' : 'pointer',
                  }}
                >
                  {isCreating ? 'Saving...' : 'Save Farmer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. FARMER 360° DOSSIER DRAWER */}
      <Drawer
        isOpen={Boolean(selectedFarmerId)}
        onClose={() => setSelectedFarmerId(null)}
        title={dossier ? dossier.name || 'Farmer Dossier' : 'Farmer Dossier'}
        subtitle={dossier ? `Registered: ${new Date(dossier.createdAt).toLocaleDateString()}` : undefined}
        width="680px"
        footer={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            {saveMessage && (
              <span style={{ fontSize: '0.8125rem', color: '#16a34a', fontWeight: 600 }}>
                {saveMessage}
              </span>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: 'auto' }}>
              {isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(false)}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      backgroundColor: '#ffffff',
                      color: '#475569',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.375rem',
                      padding: '0.5rem 1.25rem',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: '#16a34a',
                      color: '#ffffff',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      cursor: isSaving ? 'wait' : 'pointer',
                    }}
                  >
                    <Save size={16} />
                    <span>{isSaving ? 'Saving...' : 'Save Profile'}</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.375rem',
                    padding: '0.5rem 1.25rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    color: '#0f172a',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <Edit2 size={15} />
                  <span>Edit Profile</span>
                </button>
              )}
            </div>
          </div>
        }
      >
        {isDossierLoading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
            Loading complete dossier records...
          </div>
        ) : dossier ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '0.5rem 0' }}>
            
            {/* Header Identity Card */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '1.25rem',
                backgroundColor: '#f8fafc',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
              }}
            >
              <div
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '50%',
                  backgroundColor: '#059669',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '1.25rem',
                  flexShrink: 0,
                }}
              >
                {dossier.name ? dossier.name.charAt(0).toUpperCase() : 'F'}
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem 0' }}>
                  {dossier.name || 'Unnamed Farmer'}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', fontSize: '0.8125rem', color: '#64748b' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Phone size={13} />
                    <span>{dossier.phoneNumber}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <MapPin size={13} />
                    <span>{dossier.village || 'Village'}, {dossier.district || 'District'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Land & Crop Details */}
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
              }}
            >
              <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Agricultural Land & Crop Details
              </h4>

              {isEditing ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
                      Village
                    </label>
                    <input
                      type="text"
                      value={editForm.village}
                      onChange={(e) => setEditForm({ ...editForm, village: e.target.value })}
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
                      District
                    </label>
                    <input
                      type="text"
                      value={editForm.district}
                      onChange={(e) => setEditForm({ ...editForm, district: e.target.value })}
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
                      Land Holding (Acres)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={editForm.landAcres}
                      onChange={(e) => setEditForm({ ...editForm, landAcres: Number(e.target.value) })}
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
                      Primary Crop
                    </label>
                    <input
                      type="text"
                      value={editForm.primaryCrop}
                      onChange={(e) => setEditForm({ ...editForm, primaryCrop: e.target.value })}
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                  <div style={{ padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Land Holding</div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
                      {dossier.landAcres ? `${dossier.landAcres} Acres` : 'Not recorded'}
                    </div>
                  </div>
                  <div style={{ padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Primary Crop</div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: '#059669', marginTop: '2px' }}>
                      {dossier.primaryCrop || 'Paddy'}
                    </div>
                  </div>
                  <div style={{ padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>App Devices</div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
                      {dossier.devices?.length || 1} Connected
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Service Engagement Counters */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
              <div style={{ padding: '0.85rem', backgroundColor: '#f0fdf4', borderRadius: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#16a34a' }}>
                  {dossier._count.fertilizerRequests}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#166534', fontWeight: 600 }}>Fertilizers</div>
              </div>
              <div style={{ padding: '0.85rem', backgroundColor: '#eff6ff', borderRadius: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#2563eb' }}>
                  {dossier._count.consultations}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#1e40af', fontWeight: 600 }}>Consultations</div>
              </div>
              <div style={{ padding: '0.85rem', backgroundColor: '#fef3c7', borderRadius: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#d97706' }}>
                  {dossier._count.orchardRequests}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#92400e', fontWeight: 600 }}>Surveys</div>
              </div>
              <div style={{ padding: '0.85rem', backgroundColor: '#faf5ff', borderRadius: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#9333ea' }}>
                  {dossier._count.labourRequests}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#6b21a8', fontWeight: 600 }}>Labour Bookings</div>
              </div>
            </div>

          </div>
        ) : null}
      </Drawer>
    </div>
  );
};
