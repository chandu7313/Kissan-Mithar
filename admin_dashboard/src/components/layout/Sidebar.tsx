import React from 'react';

interface Props {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  pendingCount?: number;
  onOpenProfile?: () => void;
  onLogout?: () => void;
}

export const Sidebar: React.FC<Props> = ({
  activeTab,
  setActiveTab,
  pendingCount = 12,
  onOpenProfile,
  onLogout,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard & Analytics', icon: '📊' },
    { id: 'requests', label: 'Orchard Surveys', icon: '🌾', badge: pendingCount },
    { id: 'consultations', label: 'Consultations Hub', icon: '👨‍⚕️' },
  ];

  return (
    <aside
      style={{
        width: '260px',
        backgroundColor: 'var(--bg-sidebar)',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          padding: '1.25rem 1.25rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
        }}
      >
        <img
          src="/app_logo.png"
          alt="Kisan Mithar"
          style={{
            height: '42px',
            width: '42px',
            objectFit: 'contain',
            borderRadius: '8px',
            backgroundColor: 'white',
            padding: '2px',
            boxShadow: '0 0 12px rgba(34, 197, 94, 0.4)',
          }}
        />
        <div>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.0625rem', letterSpacing: '-0.02em', color: '#ffffff' }}>
            KISAN MITHAR
          </div>
          <div style={{ fontSize: '0.6875rem', color: '#94a3b8', fontWeight: 500, letterSpacing: '0.05em' }}>
            EXPERT CONSOLE
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav style={{ padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.375rem', flex: 1 }}>
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 1rem',
                borderRadius: '0.5rem',
                backgroundColor: isActive ? 'var(--primary-700)' : 'transparent',
                color: isActive ? 'white' : '#94a3b8',
                fontWeight: isActive ? 600 : 500,
                fontSize: '0.875rem',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                textAlign: 'left',
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.125rem' }}>{item.icon}</span>
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span
                  style={{
                    backgroundColor: isActive ? 'white' : 'var(--accent-gold)',
                    color: isActive ? 'var(--primary-800)' : 'white',
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    padding: '0.125rem 0.5rem',
                    borderRadius: '9999px',
                  }}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Quick Profile & Activity trigger */}
        {onOpenProfile && (
          <button
            onClick={onOpenProfile}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 1rem',
              borderRadius: '0.5rem',
              backgroundColor: 'transparent',
              color: '#94a3b8',
              fontWeight: 500,
              fontSize: '0.875rem',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              textAlign: 'left',
              marginTop: '0.5rem',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <span style={{ fontSize: '1.125rem' }}>📋</span>
            <span>Profile & Audit Logs</span>
          </button>
        )}
      </nav>

      {/* System Status & Logout Footer */}
      <div
        style={{
          padding: '1rem 1.25rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          fontSize: '0.75rem',
          color: '#64748b',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: '#4ade80' }}>
            <span>●</span> PostgreSQL Online
          </div>
          <span style={{ color: '#94a3b8' }}>v1.0.0</span>
        </div>

        {onLogout && (
          <button
            onClick={onLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.5rem',
              borderRadius: '0.375rem',
              backgroundColor: 'rgba(220, 38, 38, 0.15)',
              color: '#f87171',
              border: '1px solid rgba(220, 38, 38, 0.3)',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(220, 38, 38, 0.25)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(220, 38, 38, 0.15)')}
          >
            <span>🚪</span>
            <span>Sign Out</span>
          </button>
        )}
      </div>
    </aside>
  );
};
