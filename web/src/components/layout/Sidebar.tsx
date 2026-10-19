import React from 'react';
import {
  BarChart3,
  Users,
  Sprout,
  PhoneCall,
  Tractor,
  ShoppingCart,
  Bell,
  FileText,
  ShieldCheck,
  Activity,
  LogOut,
  Circle,
  TreeDeciduous,
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
  pendingCount,
  onOpenProfile,
  onLogout,
  session,
}) => {
  const isAdmin = session?.role === 'ADMIN';

  // 10 Unified Operational Workspaces
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'farmers', label: 'Farmers', icon: Users },
    { id: 'services', label: 'Services Desk', icon: Sprout, badge: pendingCount },
    { id: 'requests', label: 'Orchard Surveys', icon: TreeDeciduous },
    { id: 'consultations', label: 'Consultations', icon: PhoneCall },
    { id: 'labour', label: 'Labour & Machinery', icon: Tractor },
    { id: 'agri-bazaar', label: 'Agri Bazaar', icon: ShoppingCart },
    { id: 'notifications', label: 'Push & Broadcast', icon: Bell },
    { id: 'reports', label: 'Reports & Exports', icon: FileText },
    ...(isAdmin ? [
      { id: 'staff', label: 'Staff & Roles', icon: ShieldCheck },
      { id: 'system', label: 'System & Audits', icon: Activity },
    ] : []),
  ];

  return (
    <aside className="sidebar-wrapper">
      {/* Brand Header */}
      <div
        className="sidebar-brand-text"
        style={{
          padding: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <img
          src="/kissan_mithar_logo.PNG"
          alt="Kissan Mithar"
          style={{
            height: '40px',
            width: '40px',
            objectFit: 'contain',
            borderRadius: '8px',
            backgroundColor: 'white',
            padding: '2px',
          }}
        />
        <div>
          <div
            style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 800,
              fontSize: '1.1rem',
              letterSpacing: '-0.02em',
              color: '#ffffff',
            }}
          >
            KISSAN MITHAR
          </div>
          <div
            style={{
              fontSize: '0.625rem',
              color: 'rgba(255,255,255,0.7)',
              fontWeight: 600,
              letterSpacing: '0.05em',
            }}
          >
            Administrative Control Center
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav
        style={{
          padding: '1rem 0.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.25rem',
          flex: 1,
          overflowY: 'auto',
        }}
      >
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
                padding: '0.7rem 0.875rem',
                borderRadius: '8px',
                backgroundColor: isActive ? 'rgba(22, 101, 52, 0.5)' : 'transparent',
                color: isActive ? '#fef08a' : '#cbd5e1',
                fontWeight: isActive ? 600 : 500,
                fontSize: '0.875rem',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                textAlign: 'left',
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)';
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <IconComp size={18} color={isActive ? '#fef08a' : '#94a3b8'} />
                <span className="sidebar-nav-text">{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span
                  style={{
                    backgroundColor: isActive ? '#fef08a' : 'rgba(255,255,255,0.12)',
                    color: isActive ? '#14532d' : '#ffffff',
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
      </nav>

      {/* System Status & Logout Footer */}
      <div
        className="sidebar-footer"
        style={{
          padding: '1rem 1.25rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          fontSize: '0.75rem',
          color: '#cbd5e1',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#4ade80' }}>
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#4ade80',
                display: 'inline-block',
                boxShadow: '0 0 8px #4ade80',
              }}
            />
            <span style={{ fontWeight: 600 }}>System Live</span>
          </div>
          <span style={{ fontSize: '0.6875rem', color: 'rgba(255, 255, 255, 0.5)' }}>
            v2.4.0
          </span>
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
              borderRadius: '8px',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              color: '#fca5a5',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              fontSize: '0.8125rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
            }}
          >
            <LogOut size={15} />
            <span>Sign Out</span>
          </button>
        )}
      </div>
    </aside>
  );
};
