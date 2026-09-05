import React, { useEffect, useState } from 'react';
import { Plus, Search, Users, ShieldCheck, Mail, Phone, Briefcase, Star, X } from 'lucide-react';
import { ExpertApi, Expert } from '../../api/expert.api.js';

export const ExpertsPage: React.FC = () => {
  const [experts, setExperts] = useState<Expert[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    specialization: '',
    experienceYears: 5,
    password: '',
  });
  const [creating, setCreating] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchExperts = async () => {
    try {
      setLoading(true);
      const data = await ExpertApi.listExperts();
      setExperts(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load experts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExperts();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'experienceYears' ? Number(value) : value,
    }));
  };

  const handleCreateExpert = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setCreating(true);

    try {
      await ExpertApi.createExpert(formData);
      setIsModalOpen(false);
      setFormData({
        name: '',
        email: '',
        phoneNumber: '',
        specialization: '',
        experienceYears: 5,
        password: '',
      });
      fetchExperts();
    } catch (err: any) {
      setFormError(err.message || 'Failed to create expert');
    } finally {
      setCreating(false);
    }
  };

  const filteredExperts = experts.filter(
    (exp) =>
      exp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.phoneNumber.includes(searchQuery)
  );

  return (
    <div style={{ padding: '2rem', height: '100%', boxSizing: 'border-box', overflowY: 'auto' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Users size={28} color="var(--primary-600)" />
              Expert Management
            </h1>
            <p style={{ color: 'var(--text-secondary)', margin: '0.5rem 0 0 0', fontSize: '0.9375rem' }}>
              Create and manage horticultural experts in your organization.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1rem' }}
          >
            <Plus size={18} />
            Add New Expert
          </button>
        </div>

        {/* Toolbar */}
        <div className="glass-panel" style={{ padding: '1rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
            <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search by name, specialization, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.625rem 1rem 0.625rem 2.5rem',
                borderRadius: '0.5rem',
                border: '1px solid #e2e8f0',
                fontSize: '0.875rem',
                boxSizing: 'border-box'
              }}
            />
          </div>
        </div>

        {/* Experts Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>Loading experts...</div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#dc2626' }}>{error}</div>
        ) : filteredExperts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)', backgroundColor: 'white', borderRadius: '0.75rem', border: '1px dashed #cbd5e1' }}>
            No experts found matching your search.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {filteredExperts.map((expert) => (
              <div key={expert.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', backgroundColor: expert.isAvailable !== false ? '#10b981' : '#cbd5e1' }} />
                
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.125rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                      {expert.name}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--primary-600)', fontSize: '0.8125rem', fontWeight: 500 }}>
                      <Briefcase size={14} />
                      {expert.specialization}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', backgroundColor: '#fffbeb', color: '#d97706', padding: '0.25rem 0.5rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 600 }}>
                    <Star size={12} fill="currentColor" />
                    {expert.rating?.toFixed(1) || '4.8'}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    <Mail size={14} />
                    {expert.email || 'No email provided'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    <Phone size={14} />
                    {expert.phoneNumber}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    <ShieldCheck size={14} />
                    {expert.experienceYears} Years Experience
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Expert Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', backgroundColor: 'white', padding: '0', overflow: 'hidden' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-primary)' }}>Register New Expert</h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateExpert} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {formError && (
                <div style={{ padding: '0.75rem', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '0.5rem', fontSize: '0.875rem' }}>
                  {formError}
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.375rem' }}>Full Name *</label>
                <input required type="text" name="name" value={formData.name} onChange={handleInputChange} className="form-input" placeholder="e.g. Dr. Sunil Rao" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.375rem' }}>Email Address *</label>
                  <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="form-input" placeholder="expert@example.com" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.375rem' }}>Phone Number *</label>
                  <input required type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} className="form-input" placeholder="+91 98000 00000" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.375rem' }}>Specialization *</label>
                  <input required type="text" name="specialization" value={formData.specialization} onChange={handleInputChange} className="form-input" placeholder="e.g. Horticulture & Soil Health" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.375rem' }}>Experience (Yrs)</label>
                  <input required type="number" name="experienceYears" min="1" max="50" value={formData.experienceYears} onChange={handleInputChange} className="form-input" />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.375rem' }}>Initial Password (Optional)</label>
                <input type="password" name="password" value={formData.password} onChange={handleInputChange} className="form-input" placeholder="Defaults to Kisan@123 if left blank" />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary" style={{ padding: '0.625rem 1.25rem' }}>
                  Cancel
                </button>
                <button type="submit" disabled={creating} className="btn-primary" style={{ padding: '0.625rem 1.25rem' }}>
                  {creating ? 'Creating...' : 'Create Expert'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
