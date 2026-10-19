import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Briefcase,
  UserPlus,
  Trash2,
  Edit2,
  Mail,
  Phone,
  CheckCircle,
  AlertTriangle,
  X,
  Lock,
  User,
  Star,
} from 'lucide-react';
import { AdminApi, AdminUser } from '../../api/admin.api.js';
import { ExpertApi, Expert } from '../../api/expert.api.js';
import { DataTable, Column } from '../../components/common/DataTable.js';
import { ConfirmationModal } from '../../components/common/ConfirmationModal.js';

export const StaffPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'admins' | 'experts'>('admins');
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [experts, setExperts] = useState<Expert[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Create Admin Modal State
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false);
  const [adminForm, setAdminForm] = useState({ name: '', email: '', password: '', mobileNumber: '' });
  const [isAdminSubmitting, setIsAdminSubmitting] = useState<boolean>(false);
  const [adminError, setAdminError] = useState<string | null>(null);

  // Create Expert Modal State
  const [isExpertModalOpen, setIsExpertModalOpen] = useState<boolean>(false);
  const [expertForm, setExpertForm] = useState({
    name: '',
    phoneNumber: '',
    specialization: 'Apple Orchard Specialist',
    experienceYears: 5,
    password: '',
  });
  const [isExpertSubmitting, setIsExpertSubmitting] = useState<boolean>(false);
  const [expertError, setExpertError] = useState<string | null>(null);

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string; type: 'admin' | 'expert' } | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError?: boolean } | null>(null);

  const loadData = () => {
    setIsLoading(true);
    setStatusMessage(null);
    Promise.all([AdminApi.listUsers(), ExpertApi.listExperts()])
      .then(([adminList, expertList]) => {
        setAdmins(adminList);
        setExperts(expertList);
      })
      .catch((err) => {
        console.error('[StaffPage] Error fetching staff:', err);
        setStatusMessage({ text: 'Failed to load staff list. Ensure you have admin privileges.', isError: true });
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError(null);
    if (!adminForm.name || !adminForm.email || !adminForm.password) {
      setAdminError('Please fill in name, email, and password.');
      return;
    }
    setIsAdminSubmitting(true);
    try {
      await AdminApi.createUser(adminForm);
      setIsAdminModalOpen(false);
      setAdminForm({ name: '', email: '', password: '', mobileNumber: '' });
      setStatusMessage({ text: 'Admin user created successfully.' });
      loadData();
    } catch (err: any) {
      setAdminError(err.response?.data?.message || 'Failed to create admin user.');
    } finally {
      setIsAdminSubmitting(false);
    }
  };

  const handleCreateExpert = async (e: React.FormEvent) => {
    e.preventDefault();
    setExpertError(null);
    if (!expertForm.name || !expertForm.phoneNumber || !expertForm.password) {
      setExpertError('Please fill in name, phone number, and password.');
      return;
    }
    setIsExpertSubmitting(true);
    try {
      await ExpertApi.createExpert({
        name: expertForm.name,
        phoneNumber: expertForm.phoneNumber,
        specialization: expertForm.specialization,
        experienceYears: Number(expertForm.experienceYears),
        password: expertForm.password,
      });
      setIsExpertModalOpen(false);
      setExpertForm({
        name: '',
        phoneNumber: '',
        specialization: 'Apple Orchard Specialist',
        experienceYears: 5,
        password: '',
      });
      setStatusMessage({ text: 'Agronomy expert created successfully.' });
      loadData();
    } catch (err: any) {
      setExpertError(err.response?.data?.message || 'Failed to create expert profile.');
    } finally {
      setIsExpertSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      if (deleteTarget.type === 'admin') {
        const res = await AdminApi.deleteUser(deleteTarget.id);
        setStatusMessage({ text: res.message || 'Admin user removed.' });
      }
      loadData();
      setDeleteTarget(null);
    } catch (err: any) {
      setStatusMessage({
        text: err.response?.data?.message || 'Failed to delete staff member.',
        isError: true,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const adminColumns: Column<AdminUser>[] = [
    {
      key: 'name',
      header: 'Administrator',
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
            {row.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 600, color: '#0f172a' }}>{row.name}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Super Administrator</div>
          </div>
        </div>
      ),
    },
    {
      key: 'contact',
      header: 'Email & Contact',
      render: (row) => (
        <div style={{ fontSize: '0.8125rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: '#0f172a' }}>
            <Mail size={13} color="#64748b" />
            <span>{row.email}</span>
          </div>
          {row.mobileNumber && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: '#64748b', fontSize: '0.75rem' }}>
              <Phone size={12} />
              <span>{row.mobileNumber}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'created',
      header: 'Added On',
      render: (row) => (
        <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>
          {new Date(row.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Action',
      render: (row) => (
        <button
          onClick={() => setDeleteTarget({ id: row.id, name: row.name, type: 'admin' })}
          disabled={admins.length <= 1}
          title={admins.length <= 1 ? 'Cannot delete the only Super Admin' : 'Remove Admin'}
          style={{
            border: 'none',
            background: 'transparent',
            color: admins.length <= 1 ? '#cbd5e1' : '#dc2626',
            cursor: admins.length <= 1 ? 'not-allowed' : 'pointer',
            padding: '4px',
            borderRadius: '6px',
          }}
        >
          <Trash2 size={16} />
        </button>
      ),
    },
  ];

  const expertColumns: Column<Expert>[] = [
    {
      key: 'name',
      header: 'Agronomist',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.875rem',
            }}
          >
            {row.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 600, color: '#0f172a' }}>{row.name}</div>
            <div style={{ fontSize: '0.75rem', color: '#2563eb', fontWeight: 500 }}>{row.specialization}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'contact',
      header: 'Phone Number',
      render: (row) => (
        <div style={{ fontSize: '0.8125rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <Phone size={13} color="#64748b" />
          <span>{row.phoneNumber}</span>
        </div>
      ),
    },
    {
      key: 'experience',
      header: 'Experience',
      render: (row) => (
        <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#0f172a' }}>
          {row.experienceYears} Years
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Availability',
      render: (row) => (
        <span
          style={{
            padding: '0.2rem 0.5rem',
            borderRadius: '9999px',
            fontSize: '0.6875rem',
            fontWeight: 600,
            backgroundColor: row.isAvailable !== false ? '#dcfce7' : '#fee2e2',
            color: row.isAvailable !== false ? '#15803d' : '#b91c1c',
          }}
        >
          {row.isAvailable !== false ? 'Available' : 'Busy'}
        </span>
      ),
    },
  ];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Title & Add Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem 0' }}>
            Staff & Agronomy Experts Management
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>
            Manage platform super administrators, role-based access, and certified field agronomists.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {activeTab === 'admins' ? (
            <button
              onClick={() => setIsAdminModalOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                backgroundColor: '#166534',
                color: '#ffffff',
                border: 'none',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <UserPlus size={16} />
              <span>Add Super Admin</span>
            </button>
          ) : (
            <button
              onClick={() => setIsExpertModalOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                border: 'none',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <UserPlus size={16} />
              <span>Register Expert</span>
            </button>
          )}
        </div>
      </div>

      {statusMessage && (
        <div
          style={{
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            backgroundColor: statusMessage.isError ? '#fee2e2' : '#f0fdf4',
            border: `1px solid ${statusMessage.isError ? '#fca5a5' : '#bbf7d0'}`,
            color: statusMessage.isError ? '#991b1b' : '#166534',
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span>{statusMessage.text}</span>
          <button
            onClick={() => setStatusMessage(null)}
            style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'inherit' }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
        <button
          onClick={() => setActiveTab('admins')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.625rem 1.25rem',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: activeTab === 'admins' ? '#166534' : 'transparent',
            color: activeTab === 'admins' ? '#ffffff' : '#64748b',
            fontWeight: 700,
            fontSize: '0.875rem',
            cursor: 'pointer',
          }}
        >
          <ShieldCheck size={16} />
          <span>Platform Administrators ({admins.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('experts')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.625rem 1.25rem',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: activeTab === 'experts' ? '#2563eb' : 'transparent',
            color: activeTab === 'experts' ? '#ffffff' : '#64748b',
            fontWeight: 700,
            fontSize: '0.875rem',
            cursor: 'pointer',
          }}
        >
          <Briefcase size={16} />
          <span>Agronomy Experts ({experts.length})</span>
        </button>
      </div>

      {/* Table */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        {activeTab === 'admins' ? (
          <DataTable
            columns={adminColumns}
            data={admins}
            isLoading={isLoading}
            keyExtractor={(r) => r.id}
            emptyMessage="No administrators found."
          />
        ) : (
          <DataTable
            columns={expertColumns}
            data={experts}
            isLoading={isLoading}
            keyExtractor={(r) => r.id}
            emptyMessage="No agronomy experts registered yet."
          />
        )}
      </div>

      {/* Add Admin Modal */}
      {isAdminModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div
            onClick={() => setIsAdminModalOpen(false)}
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              backdropFilter: 'blur(3px)',
            }}
          />
          <div
            style={{
              position: 'relative',
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '460px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              overflow: 'hidden',
            }}
          >
            <form onSubmit={handleCreateAdmin}>
              <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                  Create Super Administrator
                </h3>
                <button
                  type="button"
                  onClick={() => setIsAdminModalOpen(false)}
                  style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#94a3b8' }}
                >
                  <X size={18} />
                </button>
              </div>

              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {adminError && (
                  <div style={{ padding: '0.75rem', borderRadius: '8px', backgroundColor: '#fee2e2', color: '#b91c1c', fontSize: '0.8125rem' }}>
                    {adminError}
                  </div>
                )}

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '0.25rem' }}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={adminForm.name}
                    onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })}
                    placeholder="e.g. Tariq Ahmad"
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '0.25rem' }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={adminForm.email}
                    onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                    placeholder="tariq@kissanmithar.com"
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '0.25rem' }}>
                    Password (Min 8 characters)
                  </label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={adminForm.password}
                    onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                    placeholder="••••••••"
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '0.25rem' }}>
                    Mobile Number (Optional)
                  </label>
                  <input
                    type="tel"
                    value={adminForm.mobileNumber}
                    onChange={(e) => setAdminForm({ ...adminForm, mobileNumber: e.target.value })}
                    placeholder="+91 9876543210"
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div style={{ padding: '1rem 1.5rem', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setIsAdminModalOpen(false)}
                  style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#475569', fontWeight: 600 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAdminSubmitting}
                  style={{ padding: '0.5rem 1.25rem', borderRadius: '8px', border: 'none', backgroundColor: '#166534', color: '#ffffff', fontWeight: 600 }}
                >
                  {isAdminSubmitting ? 'Creating...' : 'Create Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Expert Modal */}
      {isExpertModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div
            onClick={() => setIsExpertModalOpen(false)}
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              backdropFilter: 'blur(3px)',
            }}
          />
          <div
            style={{
              position: 'relative',
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '460px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              overflow: 'hidden',
            }}
          >
            <form onSubmit={handleCreateExpert}>
              <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                  Register Agronomy Expert
                </h3>
                <button
                  type="button"
                  onClick={() => setIsExpertModalOpen(false)}
                  style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#94a3b8' }}
                >
                  <X size={18} />
                </button>
              </div>

              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {expertError && (
                  <div style={{ padding: '0.75rem', borderRadius: '8px', backgroundColor: '#fee2e2', color: '#b91c1c', fontSize: '0.8125rem' }}>
                    {expertError}
                  </div>
                )}

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '0.25rem' }}>
                    Expert Name
                  </label>
                  <input
                    type="text"
                    required
                    value={expertForm.name}
                    onChange={(e) => setExpertForm({ ...expertForm, name: e.target.value })}
                    placeholder="Dr. Ghulam Hassan"
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '0.25rem' }}>
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={expertForm.phoneNumber}
                    onChange={(e) => setExpertForm({ ...expertForm, phoneNumber: e.target.value })}
                    placeholder="+91 9876543210"
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '0.25rem' }}>
                    Specialization
                  </label>
                  <select
                    value={expertForm.specialization}
                    onChange={(e) => setExpertForm({ ...expertForm, specialization: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  >
                    <option value="Apple Orchard Specialist">Apple Orchard Specialist</option>
                    <option value="Soil & Nutritional Chemistry">Soil & Nutritional Chemistry</option>
                    <option value="Plant Pathology & Entomology">Plant Pathology & Entomology</option>
                    <option value="High-Density Canopy & Pruning">High-Density Canopy & Pruning</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '0.25rem' }}>
                    Experience (Years)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={expertForm.experienceYears}
                    onChange={(e) => setExpertForm({ ...expertForm, experienceYears: Number(e.target.value) })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '0.25rem' }}>
                    Login Password
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={expertForm.password}
                    onChange={(e) => setExpertForm({ ...expertForm, password: e.target.value })}
                    placeholder="••••••••"
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div style={{ padding: '1rem 1.5rem', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setIsExpertModalOpen(false)}
                  style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#475569', fontWeight: 600 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isExpertSubmitting}
                  style={{ padding: '0.5rem 1.25rem', borderRadius: '8px', border: 'none', backgroundColor: '#2563eb', color: '#ffffff', fontWeight: 600 }}
                >
                  {isExpertSubmitting ? 'Registering...' : 'Register Expert'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Revoke Administrator Access"
        message={`Are you sure you want to delete administrator "${deleteTarget?.name}"? They will immediately lose access to the management portal.`}
        confirmText="Revoke Access"
        isDanger={true}
        isLoading={isDeleting}
      />

    </div>
  );
};
