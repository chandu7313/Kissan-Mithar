import React, { useState, useEffect } from 'react';
import {
  Activity,
  Database,
  Cpu,
  Shield,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Server,
  Cloud,
  Smartphone,
  Eye,
  Lock,
} from 'lucide-react';
import { AdminApi, SystemHealthData, AuditLogItem } from '../../api/admin.api.js';
import { DataTable, Column } from '../../components/common/DataTable.js';
import { Drawer } from '../../components/common/Drawer.js';

export const SystemHealthPage: React.FC = () => {
  const [health, setHealth] = useState<SystemHealthData | null>(null);
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchData = () => {
    setIsLoading(true);
    setError(null);
    Promise.all([
      AdminApi.getSystemHealth(),
      AdminApi.getAuditLogs(100),
    ])
      .then(([healthData, auditData]) => {
        setHealth(healthData);
        setLogs(auditData);
      })
      .catch((err) => {
        console.error('[SystemHealthPage] Failed to fetch system data:', err);
        setError('Failed to fetch telemetry or audit logs. Ensure you are signed in with an ADMIN account.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const auditColumns: Column<AuditLogItem>[] = [
    {
      key: 'action',
      header: 'Audit Action',
      render: (row) => (
        <span
          style={{
            padding: '0.2rem 0.5rem',
            borderRadius: '6px',
            fontSize: '0.75rem',
            fontWeight: 700,
            fontFamily: 'monospace',
            backgroundColor: row.action.includes('DELETE')
              ? '#fee2e2'
              : row.action.includes('CREATE')
              ? '#dcfce7'
              : row.action.includes('UPDATE')
              ? '#eff6ff'
              : '#f1f5f9',
            color: row.action.includes('DELETE')
              ? '#b91c1c'
              : row.action.includes('CREATE')
              ? '#15803d'
              : row.action.includes('UPDATE')
              ? '#1d4ed8'
              : '#334155',
          }}
        >
          {row.action}
        </span>
      ),
    },
    {
      key: 'user',
      header: 'Actor / User',
      render: (row) => (
        <div style={{ fontSize: '0.8125rem' }}>
          <div style={{ fontWeight: 600, color: '#0f172a' }}>
            {row.userName || row.userEmail || `User ${row.userId.slice(0, 8)}`}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
            Role: <strong style={{ color: '#166534' }}>{row.userType}</strong>
          </div>
        </div>
      ),
    },
    {
      key: 'network',
      header: 'Network & Client',
      render: (row) => (
        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
          <div>IP: {row.ipAddress || 'Internal AWS VPC'}</div>
          <div style={{ maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {row.userAgent || 'App Client'}
          </div>
        </div>
      ),
    },
    {
      key: 'timestamp',
      header: 'Timestamp',
      render: (row) => (
        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
          {new Date(row.timestamp).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          })}
        </span>
      ),
    },
    {
      key: 'actionButton',
      header: 'Inspect',
      render: (row) => (
        <button
          onClick={() => setSelectedLog(row)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem',
            padding: '0.3rem 0.6rem',
            borderRadius: '6px',
            border: '1px solid #cbd5e1',
            backgroundColor: '#ffffff',
            color: '#166534',
            fontSize: '0.75rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <Eye size={12} />
          <span>Payload</span>
        </button>
      ),
    },
  ];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '2rem' }}>
      
      {/* Title */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem 0' }}>
            Security Audit Logs & Infrastructure Telemetry
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>
            Live production diagnostics, Supabase database pooler latency, memory profiling, and tamper-evident audit trail.
          </p>
        </div>

        <button
          onClick={fetchData}
          disabled={isLoading}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 0.875rem',
            borderRadius: '8px',
            border: '1px solid #cbd5e1',
            backgroundColor: '#ffffff',
            color: '#475569',
            fontSize: '0.8125rem',
            fontWeight: 600,
            cursor: isLoading ? 'wait' : 'pointer',
          }}
        >
          <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      {error && (
        <div style={{ padding: '1rem', borderRadius: '8px', backgroundColor: '#fee2e2', color: '#b91c1c', fontSize: '0.875rem' }}>
          {error}
        </div>
      )}

      {/* Telemetry Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        {/* DB Card */}
        <div style={{ padding: '1.25rem', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ padding: '10px', borderRadius: '10px', backgroundColor: '#dcfce7', color: '#16a34a' }}>
            <Database size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Database Pooler</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
              {health ? `${health.database.latencyMs}ms` : '—'}
            </div>
            <div style={{ fontSize: '0.6875rem', color: '#16a34a', fontWeight: 600 }}>
              {health?.database.provider || 'PostgreSQL Pooler'}
            </div>
          </div>
        </div>

        {/* Process Uptime */}
        <div style={{ padding: '1.25rem', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ padding: '10px', borderRadius: '10px', backgroundColor: '#eff6ff', color: '#2563eb' }}>
            <Server size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Process Uptime</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
              {health ? health.process.uptime : '—'}
            </div>
            <div style={{ fontSize: '0.6875rem', color: '#64748b' }}>
              Node {health?.process.nodeVersion || '20.x'} ({health?.process.platform || 'linux'})
            </div>
          </div>
        </div>

        {/* Memory RSS */}
        <div style={{ padding: '1.25rem', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ padding: '10px', borderRadius: '10px', backgroundColor: '#fffbeb', color: '#d97706' }}>
            <Cpu size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Memory Usage (RSS)</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
              {health ? `${health.memory.rssMb} MB` : '—'}
            </div>
            <div style={{ fontSize: '0.6875rem', color: '#64748b' }}>
              Heap: {health?.memory.heapUsedMb || 0} / {health?.memory.heapTotalMb || 0} MB
            </div>
          </div>
        </div>

        {/* Security Events */}
        <div style={{ padding: '1.25rem', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ padding: '10px', borderRadius: '10px', backgroundColor: '#f1f5f9', color: '#475569' }}>
            <Shield size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>24h Security Events</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
              {health ? health.security.recent24hAuditEvents : '—'}
            </div>
            <div style={{ fontSize: '0.6875rem', color: '#16a34a', fontWeight: 600 }}>
              Tamper-evident log active
            </div>
          </div>
        </div>
      </div>

      {/* Integrations Health */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
        <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#0f172a', margin: '0 0 1rem 0' }}>
          Third-Party Operational Connectors
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', borderRadius: '8px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#0f172a' }}>Firebase Cloud Messaging</span>
              <span style={{ fontSize: '0.6875rem', padding: '0.15rem 0.5rem', borderRadius: '9999px', backgroundColor: '#dcfce7', color: '#15803d', fontWeight: 700 }}>
                {health?.integrations.firebaseAdmin || 'Active'}
              </span>
            </div>
          </div>

          <div style={{ padding: '0.75rem', borderRadius: '8px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#0f172a' }}>Cloudinary CDN Storage</span>
              <span style={{ fontSize: '0.6875rem', padding: '0.15rem 0.5rem', borderRadius: '9999px', backgroundColor: '#dcfce7', color: '#15803d', fontWeight: 700 }}>
                {health?.integrations.cloudinary || 'Connected'}
              </span>
            </div>
          </div>

          <div style={{ padding: '0.75rem', borderRadius: '8px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#0f172a' }}>SMS Gateway</span>
              <span style={{ fontSize: '0.6875rem', padding: '0.15rem 0.5rem', borderRadius: '9999px', backgroundColor: '#dcfce7', color: '#15803d', fontWeight: 700 }}>
                {health?.integrations.smsProvider || 'Enabled'}
              </span>
            </div>
          </div>

          <div style={{ padding: '0.75rem', borderRadius: '8px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#0f172a' }}>OpenWeather Kashmir API</span>
              <span style={{ fontSize: '0.6875rem', padding: '0.15rem 0.5rem', borderRadius: '9999px', backgroundColor: '#dcfce7', color: '#15803d', fontWeight: 700 }}>
                {health?.integrations.weatherApi || 'Active'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Security Audit Trail Table */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.25rem 0' }}>
            Tamper-Evident Security Audit Trail
          </h3>
          <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>
            Every administrative mutation, user role change, and broadcast is recorded with actor metadata and IP address.
          </p>
        </div>

        <DataTable
          columns={auditColumns}
          data={logs}
          isLoading={isLoading}
          keyExtractor={(r) => r.id}
          emptyMessage="No audit log records available."
        />
      </div>

      {/* Payload Inspection Drawer */}
      <Drawer
        isOpen={Boolean(selectedLog)}
        onClose={() => setSelectedLog(null)}
        title={selectedLog ? `Audit Event: ${selectedLog.action}` : ''}
        subtitle={selectedLog ? `Recorded ${new Date(selectedLog.timestamp).toLocaleString()}` : undefined}
        width="540px"
      >
        {selectedLog && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ padding: '1rem', borderRadius: '8px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', fontSize: '0.8125rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div><strong>User ID:</strong> {selectedLog.userId}</div>
                <div><strong>Role:</strong> {selectedLog.userType}</div>
                <div><strong>Name:</strong> {selectedLog.userName || 'N/A'}</div>
                <div><strong>Email:</strong> {selectedLog.userEmail || 'N/A'}</div>
                <div><strong>IP Address:</strong> {selectedLog.ipAddress || 'Internal'}</div>
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.5rem 0' }}>
                Event Metadata (Sanitized)
              </h4>
              <pre
                style={{
                  padding: '1rem',
                  borderRadius: '8px',
                  backgroundColor: '#0f172a',
                  color: '#4ade80',
                  fontSize: '0.75rem',
                  fontFamily: 'monospace',
                  overflowX: 'auto',
                  margin: 0,
                }}
              >
                {JSON.stringify(selectedLog.metadata, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </Drawer>

    </div>
  );
};
