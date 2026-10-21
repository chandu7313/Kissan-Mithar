import React, { useEffect, useState } from 'react';
import { ExternalLink, Activity, ShieldCheck, ChevronRight } from 'lucide-react';
import { UserSession } from '../../types/index.js';
import { AdminApi, SystemHealthData } from '../../api/admin.api.js';

interface Props {
  session: UserSession;
  activeTab?: string;
  onSessionChange: (session: UserSession) => void;
  onOpenProfile: () => void;
  onLogout: () => void;
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
      }}
    >
      {/* Left: Dynamic Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#64748b' }}>
          KM Admin
        </span>
        <ChevronRight size={14} color="#94a3b8" />
        <h1
          style={{
            fontSize: '1rem',
            fontWeight: 700,
            color: '#0f172a',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          {pageTitle}
        </h1>
      </div>

      {/* Right: Telemetry pill, Public link & Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
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

        {/* User profile capsule */}
        <div
          onClick={onOpenProfile}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.625rem',
            padding: '0.375rem 0.75rem',
            borderRadius: '10px',
            cursor: 'pointer',
            transition: 'background-color 0.15s ease, border-color 0.15s ease',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f1f5f9';
            e.currentTarget.style.borderColor = '#cbd5e1';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#f8fafc';
            e.currentTarget.style.borderColor = '#e2e8f0';
          }}
        >
          <img
            src={session.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(session.name || 'User')}&background=166534&color=fff&size=200`}
            alt={session.name}
            style={{ width: '30px', height: '30px', borderRadius: '50%', objectFit: 'cover' }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left', lineHeight: 1.2 }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#0f172a' }}>
              {session.name}
            </span>
            <span
              style={{
                fontSize: '0.6875rem',
                color: session.role === 'ADMIN' ? '#166534' : '#2563eb',
                fontWeight: 600,
              }}
            >
              {session.role === 'ADMIN' ? 'Super Admin' : 'Agronomist'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
