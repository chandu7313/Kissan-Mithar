import React from 'react';
import { UserSession } from '../../types/index.js';
import { AuthStore } from '../../services/authStore.js';

interface Props {
  session: UserSession;
  onSessionChange: (session: UserSession) => void;
}

export const Header: React.FC<Props> = ({ session, onSessionChange }) => {
  const toggleRole = () => {
    if (session.role === 'EXPERT') {
      const adminSess = AuthStore.getAdminSession();
      AuthStore.setSession(adminSess);
      onSessionChange(adminSess);
    } else {
      const expSess = AuthStore.getDefaultExpertSession();
      AuthStore.setSession(expSess);
      onSessionChange(expSess);
    }
  };

  return (
    <header
      style={{
        height: '64px',
        backgroundColor: 'var(--bg-card)',
        borderBottom: '1px solid var(--border-light)',
        padding: '0 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-main)' }}>
          Horticulture Decision Support & Feasibility Hub
        </h2>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        {/* Role Switcher */}
        <button
          onClick={toggleRole}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.375rem',
            padding: '0.375rem 0.75rem',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: 600,
            backgroundColor: session.role === 'ADMIN' ? '#fef3c7' : '#dcfce7',
            color: session.role === 'ADMIN' ? '#b45309' : '#15803d',
            border: `1px solid ${session.role === 'ADMIN' ? '#fde68a' : '#bbf7d0'}`,
            cursor: 'pointer',
          }}
          title="Click to toggle between Expert and Admin view"
        >
          <span>{session.role === 'ADMIN' ? '🛡️' : '👨‍⚕️'}</span>
          <span>Role: {session.role} (Switch)</span>
        </button>

        {/* User profile capsule */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <img
            src={session.avatarUrl || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200'}
            alt={session.name}
            style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
          />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>
              {session.name}
            </span>
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
              {session.role === 'ADMIN' ? 'Operations Admin' : 'Senior Agronomist'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
