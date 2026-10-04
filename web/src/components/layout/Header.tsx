import React from 'react';
import { ChevronDown } from 'lucide-react';
import { UserSession } from '../../types/index.js';

interface Props {
  session: UserSession;
  onSessionChange: (session: UserSession) => void;
  onOpenProfile: () => void;
  onLogout: () => void;
}

export const Header: React.FC<Props> = ({ session, onOpenProfile }) => {
  return (
    <header
      style={{
        height: '72px',
        backgroundColor: 'transparent',
        padding: '0 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end', // Only profile on the right
        flexShrink: 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* User profile capsule */}
        <div
          onClick={onOpenProfile}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.5rem',
            borderRadius: '12px',
            cursor: 'pointer',
            transition: 'background-color 0.15s ease',
            backgroundColor: 'white',
            border: '1px solid var(--border-light)',
            boxShadow: 'var(--shadow-xs)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--km-gray-50)')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'white')}
        >
          <img
            src={session.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(session.name || 'User')}&background=166534&color=fff&size=200`}
            alt={session.name}
            style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
          />
          <div className="hide-on-mobile" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>
              {session.name}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {session.role === 'ADMIN' ? 'Admin' : 'Expert'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
