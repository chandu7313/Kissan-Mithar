import React, { useState } from 'react';
import { UserSession } from '../types/index.js';
import { AuthStore } from '../services/authStore.js';
import { AuthApi } from '../api/auth.api.js';

interface Props {
  onLoginSuccess: (session: UserSession) => void;
}

export const LoginPage: React.FC<Props> = ({ onLoginSuccess }) => {
  const [loadingRole, setLoadingRole] = useState<string | null>(null);
  const [showCustomForm, setShowCustomForm] = useState<boolean>(false);
  const [customName, setCustomName] = useState<string>('');
  const [customPhone, setCustomPhone] = useState<string>('');
  const [customEmail, setCustomEmail] = useState<string>('');
  const [customRole, setCustomRole] = useState<'EXPERT' | 'ADMIN'>('EXPERT');

  const handleLoginAs = async (role: 'EXPERT' | 'ADMIN') => {
    setLoadingRole(role);
    try {
      if (role === 'EXPERT') {
        const res = await AuthApi.login({
          phoneNumber: '+919811122233',
          name: 'Dr. Sunil Rao',
          email: 'sunil.rao@kissanmithar.in',
          role: 'EXPERT',
        });
        const session: UserSession = {
          userId: res.user?.userId || 'EXPERT-001',
          name: 'Dr. Sunil Rao',
          role: 'EXPERT',
          phoneNumber: '+919811122233',
          token: res.token || 'demo_expert_jwt_token',
          avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200',
        };
        AuthStore.setSession(session);
        onLoginSuccess(session);
      } else {
        const res = await AuthApi.login({
          phoneNumber: '+919999900000',
          name: 'Kisan Mithar Ops Admin',
          email: 'admin@kissanmithar.in',
          role: 'ADMIN',
        });
        const session: UserSession = {
          userId: res.user?.userId || 'ADMIN-001',
          name: 'Kisan Mithar Ops Admin',
          role: 'ADMIN',
          phoneNumber: '+919999900000',
          token: res.token || 'demo_admin_jwt_token',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
        };
        AuthStore.setSession(session);
        onLoginSuccess(session);
      }
    } catch (err) {
      console.error('Login error:', err);
    } finally {
      setLoadingRole(null);
    }
  };

  const handleCustomLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim() || !customPhone.trim()) return;

    setLoadingRole('CUSTOM');
    try {
      const res = await AuthApi.login({
        phoneNumber: customPhone.trim(),
        name: customName.trim(),
        email: customEmail.trim() || undefined,
        role: customRole,
      });

      const session: UserSession = {
        userId: res.user?.userId || `USR-${Date.now()}`,
        name: customName.trim(),
        role: customRole,
        phoneNumber: customPhone.trim(),
        token: res.token || `jwt_${Date.now()}`,
        avatarUrl:
          customRole === 'ADMIN'
            ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'
            : 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200',
      };
      AuthStore.setSession(session);
      onLoginSuccess(session);
    } catch (err) {
      console.error('Custom login error:', err);
    } finally {
      setLoadingRole(null);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #091e12 0%, #0f2e1b 50%, #06180e 100%)',
        padding: '1.5rem',
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '480px',
          borderRadius: '1.25rem',
          padding: '2.5rem',
          backgroundColor: '#ffffff',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
        }}
      >
        {/* Logo & Branding */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              backgroundColor: '#15803d',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              boxShadow: '0 10px 25px -5px rgba(21, 128, 61, 0.5)',
            }}
          >
            🌾
          </div>
          <div>
            <h1 style={{ fontSize: '1.625rem', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
              KISAN MITHAR
            </h1>
            <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#15803d', letterSpacing: '0.08em', marginTop: '0.25rem' }}>
              EXPERT & AGRONOMY CONSOLE
            </div>
          </div>
          <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0, maxWidth: '340px' }}>
            Horticultural Orchard Feasibility, Prescription Engine & Tele-Agronomy Management
          </p>
        </div>

        {/* Login Options */}
        {!showCustomForm ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
            {/* Dr. Sunil Rao Option */}
            <button
              onClick={() => handleLoginAs('EXPERT')}
              disabled={loadingRole !== null}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '1rem 1.25rem',
                backgroundColor: '#f0fdf4',
                border: '2px solid #bbf7d0',
                borderRadius: '0.75rem',
                cursor: loadingRole !== null ? 'not-allowed' : 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                if (!loadingRole) {
                  e.currentTarget.style.borderColor = '#22c55e';
                  e.currentTarget.style.backgroundColor = '#dcfce7';
                }
              }}
              onMouseLeave={(e) => {
                if (!loadingRole) {
                  e.currentTarget.style.borderColor = '#bbf7d0';
                  e.currentTarget.style.backgroundColor = '#f0fdf4';
                }
              }}
            >
              <img
                src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200"
                alt="Dr. Sunil Rao"
                style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #22c55e' }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#0f172a' }}>
                    Dr. Sunil Rao
                  </span>
                  <span style={{ fontSize: '0.6875rem', fontWeight: 700, backgroundColor: '#dcfce7', color: '#15803d', padding: '0.125rem 0.375rem', borderRadius: '4px' }}>
                    EXPERT
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.125rem' }}>
                  Senior Agronomist · High-Density Orchards
                </div>
              </div>
              <span style={{ fontSize: '1.25rem' }}>➔</span>
            </button>

            {/* Ops Admin Option */}
            <button
              onClick={() => handleLoginAs('ADMIN')}
              disabled={loadingRole !== null}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '1rem 1.25rem',
                backgroundColor: '#fffbeb',
                border: '2px solid #fde68a',
                borderRadius: '0.75rem',
                cursor: loadingRole !== null ? 'not-allowed' : 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                if (!loadingRole) {
                  e.currentTarget.style.borderColor = '#f59e0b';
                  e.currentTarget.style.backgroundColor = '#fef3c7';
                }
              }}
              onMouseLeave={(e) => {
                if (!loadingRole) {
                  e.currentTarget.style.borderColor = '#fde68a';
                  e.currentTarget.style.backgroundColor = '#fffbeb';
                }
              }}
            >
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200"
                alt="Ops Admin"
                style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #f59e0b' }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#0f172a' }}>
                    Kisan Mithar Admin
                  </span>
                  <span style={{ fontSize: '0.6875rem', fontWeight: 700, backgroundColor: '#fef3c7', color: '#b45309', padding: '0.125rem 0.375rem', borderRadius: '4px' }}>
                    ADMIN
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.125rem' }}>
                  Platform Operations & Assignment Hub
                </div>
              </div>
              <span style={{ fontSize: '1.25rem' }}>➔</span>
            </button>

            <button
              onClick={() => setShowCustomForm(true)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '0.8125rem',
                color: '#15803d',
                cursor: 'pointer',
                fontWeight: 600,
                padding: '0.5rem',
                textDecoration: 'underline',
              }}
            >
              Sign in with custom phone / role ➔
            </button>
          </div>
        ) : (
          <form onSubmit={handleCustomLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                Full Name
              </label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="e.g. Dr. Ramesh Gupta"
                required
                style={{
                  width: '100%',
                  padding: '0.625rem 0.75rem',
                  borderRadius: '0.5rem',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.875rem',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                Phone Number
              </label>
              <input
                type="tel"
                value={customPhone}
                onChange={(e) => setCustomPhone(e.target.value)}
                placeholder="+91 9876543210"
                required
                style={{
                  width: '100%',
                  padding: '0.625rem 0.75rem',
                  borderRadius: '0.5rem',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.875rem',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                Email Address (Optional)
              </label>
              <input
                type="email"
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                placeholder="expert@kissanmithar.in"
                style={{
                  width: '100%',
                  padding: '0.625rem 0.75rem',
                  borderRadius: '0.5rem',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.875rem',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                Console Role
              </label>
              <select
                value={customRole}
                onChange={(e) => setCustomRole(e.target.value as any)}
                style={{
                  width: '100%',
                  padding: '0.625rem 0.75rem',
                  borderRadius: '0.5rem',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.875rem',
                  boxSizing: 'border-box',
                  backgroundColor: 'white',
                }}
              >
                <option value="EXPERT">Agronomy Expert (EXPERT)</option>
                <option value="ADMIN">Operations Administrator (ADMIN)</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setShowCustomForm(false)}
                className="btn-secondary"
                style={{ flex: 1, padding: '0.625rem', fontSize: '0.875rem' }}
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loadingRole !== null}
                className="btn-primary"
                style={{ flex: 1, padding: '0.625rem', fontSize: '0.875rem', justifyContent: 'center' }}
              >
                {loadingRole ? 'Logging in...' : 'Sign In'}
              </button>
            </div>
          </form>
        )}

        {/* Security & Audit notice */}
        <div
          style={{
            fontSize: '0.6875rem',
            color: '#64748b',
            borderTop: '1px solid #e2e8f0',
            paddingTop: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.375rem',
          }}
        >
          <span>🔒</span>
          <span>Every login & logout is recorded in the PostgreSQL Auth Audit Trail</span>
        </div>
      </div>
    </div>
  );
};
