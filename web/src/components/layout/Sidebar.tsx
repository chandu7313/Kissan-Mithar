import React from 'react';
import {
  BarChart3,
  Trees,
  Stethoscope,
  ClipboardList,
  LogOut,
  Circle,
  Users,
} from 'lucide-react';
import { UserSession } from '../../types/index.js';

interface Props {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  pendingCount?: number;
  onOpenProfile?: () => void;
  onLogout?: () => void;
  session?: UserSession;
}

export const Sidebar: React.FC<Props> = ({
  activeTab,
  setActiveTab,
  pendingCount = 12,
  onOpenProfile,
  onLogout,
  session,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard & Analytics', icon: BarChart3 },
    { id: 'requests', label: 'Orchard Surveys', icon: Trees, badge: pendingCount },
    { id: 'consultations', label: 'Consultations Hub', icon: Stethoscope },
  ];

  if (session?.role === 'ADMIN') {
    navItems.push({ id: 'experts', label: 'Expert Management', icon: Users });
  }

  return (
    <aside className="sidebar-wrapper">
      {/* Brand Header */}
      <div
        className="sidebar-brand-text"
        style={{
          padding: '1.25rem 1.25rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
        }}
      >
        <img
          src="/kissan_mithar_logo.PNG"
          alt="Kissan Mithar"
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
          const IconComp = item.icon;
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
                <IconComp size={18} color={isActive ? '#ffffff' : '#94a3b8'} />
                <span className="sidebar-nav-text">{item.label}</span>
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
            <ClipboardList size={18} color="#94a3b8" />
            <span className="sidebar-nav-text">Profile & Audit Logs</span>
          </button>
        )}
      </nav>

      {/* System Status & Logout Footer */}
      <div
        className="sidebar-footer"
        style={{
          padding: '1rem 1.25rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          fontSize: '0.75rem',
          color: '#64748b',
          flexDirection: 'column',
          gap: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: '#4ade80' }}>
            <Circle size={8} fill="#4ade80" /> System Online
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
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        )}
      </div>
    </aside>
  );
};
