import React from 'react';
import { ShieldCheck, UserCheck, LogOut, ChevronDown } from 'lucide-react';
import { UserSession } from '../../types/index.js';
import { AuthStore } from '../../services/authStore.js';

interface Props {
  session: UserSession;
  onSessionChange: (session: UserSession) => void;
  onOpenProfile: () => void;
  onLogout: () => void;
}

export const Header: React.FC<Props> = ({ session, onSessionChange, onOpenProfile, onLogout }) => {
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
        <h2 className="desktop-header-title" style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>
          Horticulture Decision Support & Feasibility Hub
        </h2>
        <div className="mobile-header-brand" style={{ alignItems: 'center', gap: '0.5rem' }}>
          <img
            src="/app_logo.png"
            alt="Kissan Mithar"
            style={{
              height: '32px',
              width: '32px',
              objectFit: 'contain',
              borderRadius: '6px',
              backgroundColor: 'white',
              padding: '2px',
              boxShadow: '0 0 8px rgba(34, 197, 94, 0.4)',
            }}
          />
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1rem', letterSpacing: '-0.02em', color: 'var(--text-main)' }}>
            KISAN MITHAR
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>

        {/* User profile capsule (Clickable to open profile modal & audit logs) */}
        <div
          onClick={onOpenProfile}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.25rem 0.5rem',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            transition: 'background-color 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          title="Click to view Profile & Session Audit History"
        >
          <img
            src={session.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(session.name || 'User')}&background=15803d&color=fff&size=200`}
            alt={session.name}
            style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
          />
          <div className="hide-on-mobile" style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>
              {session.name}
            </span>
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '2px' }}>
              {session.role === 'ADMIN' ? 'Operations Admin' : 'Senior Agronomist'}
              <ChevronDown size={11} />
            </span>
          </div>
        </div>

      </div>
    </header>
  );
};
