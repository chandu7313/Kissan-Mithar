import React, { useEffect, useState } from 'react';
import { ExternalLink, Activity, ShieldCheck, ChevronRight, Search, Bell } from 'lucide-react';
import { UserSession } from '../../types/index.js';
import { AdminApi, SystemHealthData } from '../../api/admin.api.js';

interface Props {
  session: UserSession;
  activeTab?: string;
  onSessionChange: (session: UserSession) => void;
  onOpenProfile: () => void;
  onLogout: () => void;
  onNavigateToNotifications?: () => void;
}

const TAB_TITLES: Record<string, string> = {
  dashboard: 'Executive Dashboard',
  farmers: 'Farmer Directory & Dossiers',
  services: 'Service Operations Desk',
  requests: 'Orchard Surveys',
  consultations: 'Tele-Consultation Queue',
  labour: 'Labour & Farm Mechanization Desk',
  'agri-bazaar': 'Agri Bazaar & Procurement',
  notifications: 'Mobile Notifications & FCM Broadcast',
  reports: 'Reports & Data Exports',
  staff: 'Staff & Agronomy Experts',
  experts: 'Agronomy Experts',
  system: 'Security Audit Logs & Telemetry',
};

export const Header: React.FC<Props> = ({
  session,
  activeTab = 'dashboard',
  onOpenProfile,
  onLogout,
  onNavigateToNotifications,
}) => {
  const [health, setHealth] = useState<SystemHealthData | null>(null);

  useEffect(() => {
    let mounted = true;
    AdminApi.getSystemHealth()
      .then((data) => {
        if (mounted) setHealth(data);
      })
      .catch(() => {
        // Silent fail for non-admins or offline
      });

    const interval = setInterval(() => {
      // Avoid duplicate polling if user is on the dedicated SystemHealthPage or browser tab is hidden
      if (!document.hidden && activeTab !== 'system') {
        AdminApi.getSystemHealth()
          .then((data) => {
            if (mounted) setHealth(data);
          })
          .catch(() => {});
      }
    }, 60000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const pageTitle = TAB_TITLES[activeTab] || 'Management Portal';

  return (
    <header
      style={{
        height: '70px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        padding: '0 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
        zIndex: 50,
        gap: '1rem',
      }}
    >
      {/* Left: Global Search Input */}
      <div style={{ display: 'flex', alignItems: 'center', flex: 1, maxWidth: '420px' }}>
        <div
          style={{
            position: 'relative',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Search
            size={16}
            color="#94a3b8"
            style={{ position: 'absolute', left: '12px', pointerEvents: 'none' }}
          />
          <input
            type="text"
            placeholder="Search farmers, requests, listings..."
            style={{
              width: '100%',
              padding: '0.52rem 0.875rem 0.52rem 2.25rem',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              backgroundColor: '#f8fafc',
              fontSize: '0.84rem',
              color: '#0f172a',
              outline: 'none',
              transition: 'border-color 0.15s ease, background-color 0.15s ease',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#16a34a';
              e.currentTarget.style.backgroundColor = '#ffffff';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '#e2e8f0';
              e.currentTarget.style.backgroundColor = '#f8fafc';
            }}
          />
        </div>
      </div>

      {/* Right: Notification Bell, Health pill & Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
        {/* Telemetry pill */}
        {health && (
          <div
            title={`Database: ${health.database.provider} (${health.database.latencyMs}ms latency) | Uptime: ${health.process.uptime}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              padding: '0.25rem 0.625rem',
              borderRadius: '9999px',
              backgroundColor: health.status === 'operational' ? '#f0fdf4' : '#fffbeb',
              border: `1px solid ${health.status === 'operational' ? '#bbf7d0' : '#fde68a'}`,
              fontSize: '0.75rem',
              fontWeight: 600,
              color: health.status === 'operational' ? '#15803d' : '#b45309',
            }}
            className="hide-on-mobile"
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: health.status === 'operational' ? '#22c55e' : '#f59e0b',
                display: 'inline-block',
              }}
            />
            <span>DB {health.database.latencyMs}ms</span>
          </div>
        )}

        {/* View Public Portal */}
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.375rem',
            padding: '0.4rem 0.75rem',
            borderRadius: '8px',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            color: '#475569',
            fontSize: '0.8125rem',
            fontWeight: 500,
            textDecoration: 'none',
            transition: 'all 0.15s ease',
          }}
          className="hide-on-mobile"
        >
          <span>Farmer Site</span>
          <ExternalLink size={13} />
        </a>

        {/* Notification Bell */}
        <button
          onClick={onNavigateToNotifications}
          title="Notifications"
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            backgroundColor: '#f1f5f9',
            border: 'none',
            color: '#475569',
            cursor: 'pointer',
            transition: 'background-color 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#e2e8f0')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
        >
          <Bell size={18} />
          <span
            style={{
              position: 'absolute',
              top: '6px',
              right: '6px',
              width: '15px',
              height: '15px',
              borderRadius: '50%',
              backgroundColor: '#ef4444',
              color: '#ffffff',
              fontSize: '0.625rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid #ffffff',
            }}
          >
            1
          </span>
        </button>

        {/* Subtle divider */}
        <div style={{ width: '1px', height: '24px', backgroundColor: '#e2e8f0', margin: '0 0.15rem' }} />

        {/* User profile avatar matching screenshot */}
        <div
          onClick={onOpenProfile}
          title={session.name}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.625rem',
            cursor: 'pointer',
          }}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              backgroundColor: '#166534',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.95rem',
              boxShadow: '0 2px 4px rgba(22, 101, 52, 0.2)',
            }}
          >
            {session.name ? session.name.charAt(0).toUpperCase() : 'R'}
          </div>
        </div>
      </div>
    </header>
  );
};
