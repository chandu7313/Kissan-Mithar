import React from 'react';
import {
  BarChart3,
  Users,
  Briefcase,
  Tractor,
  ShoppingCart,
  Sprout,
  PhoneCall,
  CreditCard,
  FileText,
  Settings,
  LogOut,
  Circle,
  Stethoscope,
  ClipboardList
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
  // Following the exact reference admin sidebar structure
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'requests', label: 'Farmers', icon: Users, badge: pendingCount },
    { id: 'experts', label: 'Experts', icon: Briefcase },
    { id: 'labour', label: 'Labour', icon: Users },
    { id: 'machinery', label: 'Machinery', icon: Tractor },
    { id: 'buyers', label: 'Buyers', icon: ShoppingCart },
    { id: 'crop-listings', label: 'Crop Listings', icon: Sprout },
    { id: 'consultations', label: 'Consultations', icon: PhoneCall },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
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
          }}
        />
        <div>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.125rem', letterSpacing: '-0.02em', color: '#ffffff' }}>
            KISSAN MITHAR
          </div>
          <div style={{ fontSize: '0.625rem', color: 'rgba(255,255,255,0.7)', fontWeight: 600, letterSpacing: '0.05em' }}>
            Smart Farming, Brighter Tomorrow
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav style={{ padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1, overflowY: 'auto' }}>
        {navItems.map((item) => {
          // Temporarily map original routes to the new visual labels to keep routing working
          const isActive = activeTab === item.id || 
                          (activeTab === 'requests' && item.label === 'Farmers') ||
                          (activeTab === 'consultations' && item.label === 'Consultations');
                          
          const IconComp = item.icon;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id === 'dashboard' || item.id === 'requests' || item.id === 'consultations' || item.id === 'experts' ? item.id : activeTab)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                backgroundColor: isActive ? 'rgba(22, 101, 52, 0.4)' : 'transparent',
                color: isActive ? '#fef08a' : '#cbd5e1',
                fontWeight: isActive ? 600 : 500,
                fontSize: '0.9375rem',
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
                <IconComp size={18} color={isActive ? '#fef08a' : '#cbd5e1'} />
                <span className="sidebar-nav-text">{item.label}</span>
              </div>
              {/* Reference image shows a small dot indicator for Farmers menu dropdown, but we will use the badge for now */}
              {item.badge !== undefined && item.badge > 0 && (
                <span
                  style={{
                    backgroundColor: isActive ? '#fef08a' : 'rgba(255,255,255,0.1)',
                    color: isActive ? '#14532d' : 'white',
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
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          fontSize: '0.75rem',
          color: '#cbd5e1',
          flexDirection: 'column',
          gap: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: '#4ade80' }}>
            <Circle size={8} fill="#4ade80" /> System Online
          </div>
        </div>

        {onLogout && (
          <button
            onClick={onLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.6rem',
              borderRadius: '8px',
              backgroundColor: 'transparent',
              color: '#f87171',
              border: '1px solid rgba(248, 113, 113, 0.3)',
              fontSize: '0.8125rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(248, 113, 113, 0.1)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        )}
      </div>
    </aside>
  );
};
