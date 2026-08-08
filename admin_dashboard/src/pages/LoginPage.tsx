import React from 'react';
import { UserSession } from '../types/index.js';
import { AuthStore } from '../services/authStore.js';

interface Props {
  onLoginSuccess: (session: UserSession) => void;
}

export const LoginPage: React.FC<Props> = ({ onLoginSuccess }) => {
  const handleExpertLogin = () => {
    const session = AuthStore.getDefaultExpertSession();
    AuthStore.setSession(session);
    onLoginSuccess(session);
  };

  const handleAdminLogin = () => {
    const session = AuthStore.getAdminSession();
    AuthStore.setSession(session);
    onLoginSuccess(session);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        padding: '1.5rem',
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '440px',
          borderRadius: '1rem',
          padding: '2.5rem',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          textAlign: 'center',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '12px',
              backgroundColor: 'var(--primary-700)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.75rem',
              boxShadow: 'var(--shadow-glow)',
            }}
          >
            🌾
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>
            KISAN MITHAR
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', maxWidth: '320px' }}>
            Horticultural Advisory, Feasibility & Agronomy Expert Management Portal
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', marginTop: '1rem' }}>
          <button onClick={handleExpertLogin} className="btn-primary" style={{ justifyContent: 'center', padding: '0.875rem' }}>
            <span>👨‍⚕️</span> Sign In as Senior Agronomist (Dr. Sunil Rao)
          </button>

          <button onClick={handleAdminLogin} className="btn-secondary" style={{ justifyContent: 'center', padding: '0.875rem' }}>
            <span>🛡️</span> Sign In as Operations Admin
          </button>
        </div>

        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-light)', paddingTop: '1rem' }}>
          Authenticated via Backend JWT & RBAC Middleware
        </div>
      </div>
    </div>
  );
};
