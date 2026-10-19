import React, { useState, useEffect } from 'react';
import {
  Users,
  Smartphone,
  MapPin,
  Calendar,
  Eye,
  Edit2,
  Download,
  Check,
  X,
  Phone,
  Sprout,
  ShieldAlert,
  Save,
  Tractor,
  ShoppingCart,
  PhoneCall,
  Activity,
} from 'lucide-react';
import { FarmerApi, FarmerListItem, FarmerDossier } from '../../api/farmer.api.js';
import { DataTable, Column } from '../../components/common/DataTable.js';
import { FilterBar, FilterSelect } from '../../components/common/FilterBar.js';
import { Pagination } from '../../components/common/Pagination.js';
import { Drawer } from '../../components/common/Drawer.js';

export const FarmersPage: React.FC = () => {
  const [farmers, setFarmers] = useState<FarmerListItem[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [search, setSearch] = useState<string>('');
  const [district, setDistrict] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedFarmerId, setSelectedFarmerId] = useState<string | null>(null);
  const [dossier, setDossier] = useState<FarmerDossier | null>(null);
  const [isDossierLoading, setIsDossierLoading] = useState<boolean>(false);
  
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

  const fetchFarmers = () => {
    setIsLoading(true);
    FarmerApi.list({
      page,
      limit,
      search: search.trim() || undefined,
      district: district !== 'ALL' ? district : undefined,
    })
      .then((res) => {
        setFarmers(res.data);
        setTotalCount(res.total);
      })
      .catch((err) => {
        console.error('[FarmersPage] Failed to fetch farmers:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchFarmers();
  }, [page, limit, district]);

  // Handle Search Debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      setPage(1);
      fetchFarmers();
    }, 350);
    return () => clearTimeout(handler);
  }, [search]);

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

  const handleExportCSV = () => {
    if (farmers.length === 0) return;
    const headers = ['Farmer ID', 'Name', 'Phone', 'Village', 'District', 'Land (Acres)', 'Primary Crop', 'Total Requests', 'Registered At'];
    const rows = farmers.map((f) => [
      f.id,
      `"${f.name || ''}"`,
      `"${f.phoneNumber || ''}"`,
      `"${f.village || ''}"`,
      `"${f.district || ''}"`,
      f.landAcres || 0,
      `"${f.primaryCrop || ''}"`,
      (f._count.orchardRequests + f._count.fertilizerRequests + f._count.diseaseRequests + f._count.labourRequests),
      new Date(f.createdAt).toISOString(),
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

  const districtOptions = [
    { label: 'All Districts', value: 'ALL' },
    { label: 'Srinagar', value: 'Srinagar' },
    { label: 'Baramulla', value: 'Baramulla' },
    { label: 'Anantnag', value: 'Anantnag' },
    { label: 'Shopian', value: 'Shopian' },
    { label: 'Pulwama', value: 'Pulwama' },
    { label: 'Kulgam', value: 'Kulgam' },
    { label: 'Budgam', value: 'Budgam' },
    { label: 'Ganderbal', value: 'Ganderbal' },
    { label: 'Kupwara', value: 'Kupwara' },
    { label: 'Bandipora', value: 'Bandipora' },
  ];

  const filterConfigs: FilterSelect[] = [
    {
      key: 'district',
      label: 'District',
      value: district,
      options: districtOptions,
      onChange: (v) => {
        setDistrict(v);
        setPage(1);
      },
    },
  ];

  const columns: Column<FarmerListItem>[] = [
    {
      key: 'name',
      header: 'Farmer Profile',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: '#166534',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.875rem',
            }}
          >
            {row.name ? row.name.charAt(0).toUpperCase() : 'F'}
          </div>
          <div>
            <div style={{ fontWeight: 600, color: '#0f172a' }}>{row.name || 'Unnamed Farmer'}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Phone size={12} />
              <span>{row.phoneNumber}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'location',
      header: 'Location',
      render: (row) => (
        <div style={{ fontSize: '0.8125rem' }}>
          <div style={{ color: '#0f172a', fontWeight: 500 }}>
            {row.village || 'Village Not Set'}
          </div>
          <div style={{ color: '#64748b', fontSize: '0.75rem' }}>
            {row.district ? `${row.district}, ${row.state || 'J&K'}` : 'Jammu & Kashmir'}
          </div>
        </div>
      ),
    },
    {
      key: 'land',
      header: 'Holding & Crop',
      render: (row) => (
        <div style={{ fontSize: '0.8125rem' }}>
          <div style={{ color: '#0f172a', fontWeight: 600 }}>
            {row.landAcres ? `${row.landAcres} Acres` : '—'}
          </div>
          <div style={{ color: '#166534', fontSize: '0.75rem', fontWeight: 500 }}>
            {row.primaryCrop || 'Apple (Kashmir)'}
          </div>
        </div>
      ),
    },
    {
      key: 'devices',
      header: 'App Connectivity',
      render: (row) => {
        const deviceCount = row.devices?.length || 0;
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                padding: '0.2rem 0.5rem',
                borderRadius: '9999px',
                fontSize: '0.6875rem',
                fontWeight: 600,
                backgroundColor: deviceCount > 0 ? '#dcfce7' : '#f1f5f9',
                color: deviceCount > 0 ? '#15803d' : '#94a3b8',
              }}
            >
              <Smartphone size={12} />
              <span>{deviceCount > 0 ? `${deviceCount} Active` : 'Web Only'}</span>
            </span>
          </div>
        );
      },
    },
    {
      key: 'services',
      header: 'Service Engagement',
      render: (row) => {
        const total =
          (row._count?.orchardRequests || 0) +
          (row._count?.fertilizerRequests || 0) +
          (row._count?.diseaseRequests || 0) +
          (row._count?.labourRequests || 0) +
          (row._count?.consultations || 0);
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <span
              style={{
                padding: '0.2rem 0.6rem',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 700,
                backgroundColor: total > 0 ? '#e0e7ff' : '#f8fafc',
                color: total > 0 ? '#4338ca' : '#94a3b8',
                border: '1px solid #c7d2fe',
              }}
            >
              {total} Requests
            </span>
          </div>
        );
      },
    },
    {
      key: 'actions',
      header: 'Action',
      render: (row) => (
        <button
          onClick={() => setSelectedFarmerId(row.id)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.375rem',
            padding: '0.4rem 0.75rem',
            borderRadius: '8px',
            border: '1px solid #cbd5e1',
            backgroundColor: '#ffffff',
            color: '#166534',
            fontSize: '0.8125rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f0fdf4';
            e.currentTarget.style.borderColor = '#16a34a';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#ffffff';
            e.currentTarget.style.borderColor = '#cbd5e1';
          }}
        >
          <Eye size={14} />
          <span>360° Dossier</span>
        </button>
      ),
    },
  ];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Page Title & Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem 0' }}>
            Farmer Directory & Profiles
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>
            Authoritative registry of onboarded Kashmiri growers, land records, devices, and historical service dossiers.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          disabled={farmers.length === 0}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            border: '1px solid #cbd5e1',
            backgroundColor: '#ffffff',
            color: '#334155',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: farmers.length === 0 ? 'not-allowed' : 'pointer',
          }}
        >
          <Download size={16} />
          <span>Export Directory (CSV)</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <FilterBar
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search farmer by name, mobile number, or village..."
        filters={filterConfigs}
        onReset={() => {
          setSearch('');
          setDistrict('ALL');
        }}
        onRefresh={fetchFarmers}
        isRefreshing={isLoading}
      />

      {/* Farmers Table */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <DataTable
          columns={columns}
          data={farmers}
          isLoading={isLoading}
          keyExtractor={(item) => item.id}
          emptyMessage="No farmers found matching the specified query or district filter."
        />

        <Pagination
          currentPage={page}
          totalItems={totalCount}
          pageSize={limit}
          onPageChange={setPage}
          onPageSizeChange={(newLimit) => {
            setLimit(newLimit);
            setPage(1);
          }}
        />
      </div>

      {/* Farmer 360° Dossier Drawer */}
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
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    color: '#1e293b',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <Edit2 size={15} />
                  <span>Edit Farmer Details</span>
                </button>
              )}
            </div>
          </div>
        }
      >
        {isDossierLoading || !dossier ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
            Loading 360° farmer relation history...
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '1rem' }}>
            
            {/* Identity & Land Information Box */}
            <div
              style={{
                padding: '1.25rem',
                borderRadius: '12px',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
              }}
            >
              <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a', margin: '0 0 1rem 0' }}>
                Demographics & Agronomic Profile
              </h4>

              {isEditing ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '0.25rem' }}>
                      Village / Mohalla
                    </label>
                    <input
                      type="text"
                      value={editForm.village}
                      onChange={(e) => setEditForm({ ...editForm, village: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.875rem',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '0.25rem' }}>
                      District
                    </label>
                    <input
                      type="text"
                      value={editForm.district}
                      onChange={(e) => setEditForm({ ...editForm, district: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.875rem',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '0.25rem' }}>
                      Landholdings (Acres)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={editForm.landAcres}
                      onChange={(e) => setEditForm({ ...editForm, landAcres: parseFloat(e.target.value) || 0 })}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.875rem',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '0.25rem' }}>
                      Primary Crop
                    </label>
                    <input
                      type="text"
                      value={editForm.primaryCrop}
                      onChange={(e) => setEditForm({ ...editForm, primaryCrop: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.875rem',
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', fontSize: '0.8125rem' }}>
                  <div>
                    <span style={{ color: '#64748b' }}>Phone Number:</span>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{dossier.phoneNumber}</div>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>Location:</span>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>
                      {dossier.village || 'N/A'}, {dossier.district || 'Jammu & Kashmir'}
                    </div>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>Land Holding:</span>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>
                      {dossier.landAcres ? `${dossier.landAcres} Acres` : 'Not documented'}
                    </div>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>Primary Crop:</span>
                    <div style={{ fontWeight: 600, color: '#166534' }}>
                      {dossier.primaryCrop || 'Apple (Kashmir)'}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Devices & App Push Status */}
            <div>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.5rem 0' }}>
                Registered Mobile Devices ({dossier.devices?.length || 0})
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {dossier.devices && dossier.devices.length > 0 ? (
                  dossier.devices.map((dev, i) => (
                    <div
                      key={i}
                      style={{
                        padding: '0.5rem 0.75rem',
                        borderRadius: '8px',
                        backgroundColor: '#ffffff',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.75rem',
                      }}
                    >
                      <strong style={{ color: '#0f172a' }}>{dev.platform.toUpperCase()}</strong>
                      <span style={{ color: '#64748b', marginLeft: '0.5rem' }}>
                        Last Active: {new Date(dev.lastActive).toLocaleDateString()}
                      </span>
                    </div>
                  ))
                ) : (
                  <div style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>
                    No mobile push notification tokens registered yet.
                  </div>
                )}
              </div>
            </div>

            {/* Comprehensive Activity Timeline */}
            <div>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.75rem 0' }}>
                360° Historical Services Timeline
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {/* Orchard Surveys */}
                {dossier.orchardRequests?.map((r) => (
                  <div
                    key={`orchard-${r.id}`}
                    style={{
                      padding: '0.75rem',
                      borderRadius: '8px',
                      backgroundColor: '#ffffff',
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: '#0f172a' }}>
                        Orchard Survey Request
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        Submitted {new Date(r.submittedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <span
                      style={{
                        padding: '0.2rem 0.5rem',
                        borderRadius: '9999px',
                        fontSize: '0.6875rem',
                        fontWeight: 600,
                        backgroundColor: '#f0fdf4',
                        color: '#15803d',
                      }}
                    >
                      {r.status}
                    </span>
                  </div>
                ))}

                {/* Fertilizer Requests */}
                {dossier.fertilizerRequests?.map((r) => (
                  <div
                    key={`fert-${r.id}`}
                    style={{
                      padding: '0.75rem',
                      borderRadius: '8px',
                      backgroundColor: '#ffffff',
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: '#0f172a' }}>
                        Soil & Fertilizer Guidance ({r.cropType || 'Crop'})
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        Soil: {r.soilType || 'Loam'} • {new Date(r.submittedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <span
                      style={{
                        padding: '0.2rem 0.5rem',
                        borderRadius: '9999px',
                        fontSize: '0.6875rem',
                        fontWeight: 600,
                        backgroundColor: '#eff6ff',
                        color: '#1d4ed8',
                      }}
                    >
                      {r.status}
                    </span>
                  </div>
                ))}

                {/* Disease Requests */}
                {dossier.diseaseRequests?.map((r) => (
                  <div
                    key={`disease-${r.id}`}
                    style={{
                      padding: '0.75rem',
                      borderRadius: '8px',
                      backgroundColor: '#ffffff',
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: '#0f172a' }}>
                        Crop Pathology Diagnosis ({r.cropType || 'Crop'})
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        Part: {r.affectedPart || 'Leaves'} • {new Date(r.submittedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <span
                      style={{
                        padding: '0.2rem 0.5rem',
                        borderRadius: '9999px',
                        fontSize: '0.6875rem',
                        fontWeight: 600,
                        backgroundColor: '#fffbeb',
                        color: '#b45309',
                      }}
                    >
                      {r.status}
                    </span>
                  </div>
                ))}

                {/* Labour Requests */}
                {dossier.labourRequests?.map((r) => (
                  <div
                    key={`labour-${r.id}`}
                    style={{
                      padding: '0.75rem',
                      borderRadius: '8px',
                      backgroundColor: '#ffffff',
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: '#0f172a' }}>
                        Farm Labour Request ({r.taskType})
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {r.labourersRequired} Workers needed • {new Date(r.submittedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <span
                      style={{
                        padding: '0.2rem 0.5rem',
                        borderRadius: '9999px',
                        fontSize: '0.6875rem',
                        fontWeight: 600,
                        backgroundColor: '#fdf2f8',
                        color: '#be185d',
                      }}
                    >
                      {r.status}
                    </span>
                  </div>
                ))}

                {/* Consultations */}
                {dossier.consultations?.map((r) => (
                  <div
                    key={`consult-${r.id}`}
                    style={{
                      padding: '0.75rem',
                      borderRadius: '8px',
                      backgroundColor: '#ffffff',
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: '#0f172a' }}>
                        Tele-Consultation ({r.category})
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        Mode: {r.mode} • {new Date(r.scheduledAt).toLocaleDateString()}
                      </div>
                    </div>
                    <span
                      style={{
                        padding: '0.2rem 0.5rem',
                        borderRadius: '9999px',
                        fontSize: '0.6875rem',
                        fontWeight: 600,
                        backgroundColor: '#f1f5f9',
                        color: '#334155',
                      }}
                    >
                      {r.status}
                    </span>
                  </div>
                ))}

                {(!dossier.orchardRequests?.length &&
                  !dossier.fertilizerRequests?.length &&
                  !dossier.diseaseRequests?.length &&
                  !dossier.labourRequests?.length &&
                  !dossier.consultations?.length) && (
                  <div style={{ textAlign: 'center', padding: '1.5rem', color: '#94a3b8', fontSize: '0.8125rem' }}>
                    No service requests submitted yet by this farmer.
                  </div>
                )}
              </div>
            </div>

          </div>
        )}
      </Drawer>

    </div>
  );
};
