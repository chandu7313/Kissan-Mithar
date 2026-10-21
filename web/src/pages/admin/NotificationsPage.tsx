import React, { useState, useEffect } from 'react';
import {
  Bell,
  Send,
  Smartphone,
  Apple,
  AlertTriangle,
  CheckCircle,
  Clock,
  Radio,
  Users,
  MapPin,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import {
  NotificationApi,
  NotificationStats,
  BroadcastPayload,
} from '../../api/notification.api.js';
import { StatCard } from '../../components/common/StatCard.js';
import { ConfirmationModal } from '../../components/common/ConfirmationModal.js';

export const NotificationsPage: React.FC = () => {
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Broadcast Form State
  const [targetType, setTargetType] = useState<'ALL' | 'DISTRICT' | 'CROP'>('ALL');
  const [targetValue, setTargetValue] = useState<string>('Shopian');
  const [title, setTitle] = useState<string>('');
  const [body, setBody] = useState<string>('');
  const [broadcastType, setBroadcastType] = useState<'ALERT' | 'SUCCESS' | 'CONSULTATION' | 'MARKET' | 'INFO'>('ALERT');
  const [deepLink, setDeepLink] = useState<string>('');

  // Confirmation Modal
  const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [sendResult, setSendResult] = useState<{
    success: boolean;
    message: string;
    targetCount?: number;
    fcmSuccess?: number;
  } | null>(null);

  const [error, setError] = useState<string | null>(null);

  const fetchStats = () => {
    setIsLoading(true);
    setError(null);
    NotificationApi.getStats()
      .then((data) => {
        setStats(data);
      })
      .catch((err) => {
        console.error('[NotificationsPage] Failed to fetch stats:', err);
        setError(err.response?.data?.error?.message || err.message || 'Failed to fetch notification statistics');
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleSendBroadcast = async () => {
    setIsSending(true);
    setSendResult(null);
    try {
      const res = await NotificationApi.sendBroadcast({
        targetType,
        targetValue: targetType !== 'ALL' ? targetValue : undefined,
        title,
        body,
        type: broadcastType,
        deepLink: deepLink.trim() || undefined,
      });

      setSendResult({
        success: true,
        message: res.message,
        targetCount: res.targetCount,
        fcmSuccess: res.fcmSuccess,
      });

      // Reset form
      setTitle('');
      setBody('');
      setDeepLink('');
      setIsConfirmOpen(false);
      fetchStats();
    } catch (err: any) {
      setSendResult({
        success: false,
        message: err.response?.data?.message || 'Failed to dispatch mobile broadcast.',
      });
    } finally {
      setIsSending(false);
    }
  };

  const districtList = [
    'Srinagar', 'Baramulla', 'Anantnag', 'Shopian', 'Pulwama',
    'Kulgam', 'Budgam', 'Ganderbal', 'Kupwara', 'Bandipora',
  ];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '2rem' }}>
      
      {/* Title */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem 0' }}>
            Mobile Notifications & FCM Broadcast Desk
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>
            Dispatch push alerts to Kashmiri farmers' devices, send frost/weather warnings, and review delivery history.
          </p>
        </div>

        <button
          onClick={fetchStats}
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
          <span>Refresh Stats</span>
        </button>
      </div>

      {/* Error Alert Banner */}
      {error && (
        <div
          style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '10px',
            padding: '1rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.25rem' }}>⚠️</span>
            <div>
              <div style={{ fontWeight: 600, color: '#991b1b', fontSize: '0.875rem' }}>Failed to retrieve notification statistics</div>
              <div style={{ color: '#b91c1c', fontSize: '0.8125rem' }}>{error}</div>
            </div>
          </div>
          <button
            onClick={fetchStats}
            style={{
              padding: '0.4rem 0.875rem',
              borderRadius: '8px',
              backgroundColor: '#dc2626',
              color: '#ffffff',
              border: 'none',
              fontWeight: 600,
              fontSize: '0.8125rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
        }}
      >
        <StatCard
          title="Active FCM Devices"
          value={stats ? stats.devices.active30d.toLocaleString() : '—'}
          subtitle={stats ? `${stats.devices.total} total registered devices` : ''}
          icon={
            <div style={{ padding: '8px', background: '#dcfce7', borderRadius: '8px', color: '#16a34a' }}>
              <Smartphone size={22} />
            </div>
          }
        />

        <StatCard
          title="Android Devices"
          value={stats ? stats.devices.android.toLocaleString() : '—'}
          subtitle="Google Play Services"
          icon={
            <div style={{ padding: '8px', background: '#e0e7ff', borderRadius: '8px', color: '#4338ca' }}>
              <Radio size={22} />
            </div>
          }
        />

        <StatCard
          title="iOS Devices"
          value={stats ? stats.devices.ios.toLocaleString() : '—'}
          subtitle="Apple APNs Tokens"
          icon={
            <div style={{ padding: '8px', background: '#f1f5f9', borderRadius: '8px', color: '#334155' }}>
              <Apple size={22} />
            </div>
          }
        />

        <StatCard
          title="Total Notifications"
          value={stats ? stats.notifications.total.toLocaleString() : '—'}
          subtitle={stats ? `${stats.notifications.unread} unread by farmers` : ''}
          icon={
            <div style={{ padding: '8px', background: '#fef3c7', borderRadius: '8px', color: '#d97706' }}>
              <Bell size={22} />
            </div>
          }
        />
      </div>

      {/* Main Workspace: Composer on Left, Recent Dispatches on Right */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
        
        {/* Broadcast Composer */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Radio size={20} color="#166534" />
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
              Dispatch Push Broadcast
            </h3>
          </div>

          {sendResult && (
            <div
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                backgroundColor: sendResult.success ? '#f0fdf4' : '#fee2e2',
                border: `1px solid ${sendResult.success ? '#bbf7d0' : '#fca5a5'}`,
                color: sendResult.success ? '#166534' : '#991b1b',
                fontSize: '0.875rem',
              }}
            >
              <strong>{sendResult.success ? 'Delivered: ' : 'Failed: '}</strong>
              {sendResult.message}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Target Audience */}
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '0.35rem' }}>
                Target Recipient Group
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setTargetType('ALL')}
                  style={{
                    padding: '0.5rem',
                    borderRadius: '6px',
                    border: targetType === 'ALL' ? '2px solid #166534' : '1px solid #cbd5e1',
                    backgroundColor: targetType === 'ALL' ? '#f0fdf4' : '#ffffff',
                    color: targetType === 'ALL' ? '#166534' : '#475569',
                    fontWeight: 600,
                    fontSize: '0.8125rem',
                    cursor: 'pointer',
                  }}
                >
                  All Farmers
                </button>
                <button
                  type="button"
                  onClick={() => setTargetType('DISTRICT')}
                  style={{
                    padding: '0.5rem',
                    borderRadius: '6px',
                    border: targetType === 'DISTRICT' ? '2px solid #166534' : '1px solid #cbd5e1',
                    backgroundColor: targetType === 'DISTRICT' ? '#f0fdf4' : '#ffffff',
                    color: targetType === 'DISTRICT' ? '#166534' : '#475569',
                    fontWeight: 600,
                    fontSize: '0.8125rem',
                    cursor: 'pointer',
                  }}
                >
                  By District
                </button>
                <button
                  type="button"
                  onClick={() => setTargetType('CROP')}
                  style={{
                    padding: '0.5rem',
                    borderRadius: '6px',
                    border: targetType === 'CROP' ? '2px solid #166534' : '1px solid #cbd5e1',
                    backgroundColor: targetType === 'CROP' ? '#f0fdf4' : '#ffffff',
                    color: targetType === 'CROP' ? '#166534' : '#475569',
                    fontWeight: 600,
                    fontSize: '0.8125rem',
                    cursor: 'pointer',
                  }}
                >
                  By Crop
                </button>
              </div>
            </div>

            {/* Target Value if District or Crop */}
            {targetType === 'DISTRICT' && (
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '0.25rem' }}>
                  Select District
                </label>
                <select
                  value={targetValue}
                  onChange={(e) => setTargetValue(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                >
                  {districtList.map((d) => (
                    <option key={d} value={d}>
                      {d} District
                    </option>
                  ))}
                </select>
              </div>
            )}

            {targetType === 'CROP' && (
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '0.25rem' }}>
                  Specify Crop Type
                </label>
                <input
                  type="text"
                  value={targetValue}
                  onChange={(e) => setTargetValue(e.target.value)}
                  placeholder="e.g. Apple, Walnut, Cherry"
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                />
              </div>
            )}

            {/* Category / Type */}
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '0.25rem' }}>
                Notification Category
              </label>
              <select
                value={broadcastType}
                onChange={(e) => setBroadcastType(e.target.value as any)}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
              >
                <option value="ALERT">Weather & Frost Warning (Critical Alert)</option>
                <option value="MARKET">Mandi Rate Update (Agri Bazaar)</option>
                <option value="CONSULTATION">Agronomist Tele-Clinic Camp</option>
                <option value="SUCCESS">Government Subsidy / Scheme Update</option>
                <option value="INFO">General Agronomic Advisory</option>
              </select>
            </div>

            {/* Title */}
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '0.25rem' }}>
                Broadcast Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Severe Frost Warning Tonight in Shopian"
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
              />
            </div>

            {/* Message Body */}
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '0.25rem' }}>
                Message Body (Supports Kashmiri/Urdu transliteration)
              </label>
              <textarea
                rows={3}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Protect young saplings with orchard smoking or micro-sprinklers..."
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem', resize: 'vertical' }}
              />
            </div>

            {/* Deep Link (Optional) */}
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '0.25rem' }}>
                In-App Deep Link (Optional)
              </label>
              <input
                type="text"
                value={deepLink}
                onChange={(e) => setDeepLink(e.target.value)}
                placeholder="e.g. /agri-bazaar or /services/disease-identifier"
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
              />
            </div>

            <button
              type="button"
              onClick={() => setIsConfirmOpen(true)}
              disabled={!title.trim() || !body.trim()}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.75rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: !title.trim() || !body.trim() ? '#cbd5e1' : '#166534',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.875rem',
                cursor: !title.trim() || !body.trim() ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.15s ease',
              }}
            >
              <Send size={16} />
              <span>Broadcast to Mobile Devices</span>
            </button>
          </div>
        </div>

        {/* Recent Dispatches & Notifications Log */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={18} color="#2563eb" />
              Recent Mobile Dispatches
            </h3>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              Live Database Log
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '480px', overflowY: 'auto' }}>
            {stats && stats.recentHistory && stats.recentHistory.length > 0 ? (
              stats.recentHistory.map((item) => (
                <div
                  key={item.id}
                  style={{
                    padding: '0.75rem',
                    borderRadius: '8px',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.375rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#0f172a' }}>
                      {item.title}
                    </div>
                    <span
                      style={{
                        padding: '0.15rem 0.5rem',
                        borderRadius: '9999px',
                        fontSize: '0.6875rem',
                        fontWeight: 600,
                        backgroundColor: item.type === 'ALERT' ? '#fee2e2' : '#f0fdf4',
                        color: item.type === 'ALERT' ? '#b91c1c' : '#15803d',
                      }}
                    >
                      {item.type}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.8125rem', color: '#475569', margin: 0, lineHeight: 1.4 }}>
                    {item.body}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.6875rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                    <span>
                      Recipient: <strong style={{ color: '#475569' }}>{item.farmer?.name || 'Farmer'}</strong> ({item.farmer?.village || 'J&K'})
                    </span>
                    <span>
                      {new Date(item.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8', fontSize: '0.875rem' }}>
                No recent notifications recorded.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleSendBroadcast}
        title="Confirm Push Notification Broadcast"
        message={`Are you sure you want to broadcast "${title}" to target group ${targetType}${targetType !== 'ALL' ? ` (${targetValue})` : ''}? This will immediately wake up registered mobile devices.`}
        confirmText="Confirm & Dispatch"
        isLoading={isSending}
      />

    </div>
  );
};
