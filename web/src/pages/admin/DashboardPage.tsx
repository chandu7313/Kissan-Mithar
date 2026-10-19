import React, { useState, useEffect } from 'react';
import {
  Users,
  Smartphone,
  Sprout,
  CheckCircle2,
  Clock,
  PhoneCall,
  ShoppingCart,
  TrendingUp,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Calendar,
  AlertCircle,
  FileCheck,
  Activity,
} from 'lucide-react';
import { AnalyticsApi, ExecutiveSummary } from '../../api/analytics.api.js';
import { StatCard } from '../../components/common/StatCard.js';

interface Props {
  onNavigateToRequests: () => void;
  onNavigateToConsultations: () => void;
  onNavigateToFarmers?: () => void;
  onNavigateToServices?: () => void;
  onNavigateToBazaar?: () => void;
}

export const DashboardPage: React.FC<Props> = ({
  onNavigateToRequests,
  onNavigateToConsultations,
  onNavigateToFarmers,
  onNavigateToServices,
  onNavigateToBazaar,
}) => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [data, setData] = useState<ExecutiveSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = (range = timeRange) => {
    setIsLoading(true);
    setError(null);
    AnalyticsApi.getExecutiveSummary(range)
      .then((summary) => {
        setData(summary);
      })
      .catch((err) => {
        console.error('[DashboardPage] Failed to fetch executive summary:', err);
        setError('Failed to fetch dashboard metrics from the administrative API.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchSummary(timeRange);
  }, [timeRange]);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '2rem' }}>
      
      {/* Header & Filter Controls */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem 0' }}>
            Executive Operations Dashboard
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>
            Live platform metrics, service distribution, farmer engagement, and operational alerts.
          </p>
        </div>

        {/* Time range buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div
            style={{
              display: 'flex',
              backgroundColor: '#e2e8f0',
              borderRadius: '8px',
              padding: '2px',
            }}
          >
            {(['7d', '30d', '90d', 'all'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                style={{
                  border: 'none',
                  padding: '0.375rem 0.75rem',
                  borderRadius: '6px',
                  backgroundColor: timeRange === range ? '#ffffff' : 'transparent',
                  color: timeRange === range ? '#166534' : '#64748b',
                  fontWeight: timeRange === range ? 700 : 500,
                  fontSize: '0.8125rem',
                  cursor: 'pointer',
                  boxShadow: timeRange === range ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                {range === 'all' ? 'All Time' : `Last ${range}`}
              </button>
            ))}
          </div>

          <button
            onClick={() => fetchSummary()}
            disabled={isLoading}
            title="Refresh metrics"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.5rem',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: '#475569',
              cursor: isLoading ? 'wait' : 'pointer',
            }}
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {error && (
        <div
          style={{
            padding: '1rem',
            backgroundColor: '#fee2e2',
            borderRadius: '10px',
            border: '1px solid #fca5a5',
            color: '#b91c1c',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span>{error}</span>
          <button
            onClick={() => fetchSummary()}
            style={{
              padding: '0.375rem 0.75rem',
              borderRadius: '6px',
              backgroundColor: '#dc2626',
              color: '#ffffff',
              border: 'none',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* KPI Cards Row 1: Core Metrics */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '1rem',
        }}
      >
        <StatCard
          title="Total Farmers"
          value={data ? data.farmers.total.toLocaleString() : '—'}
          subtitle={data ? `+${data.farmers.newInPeriod} new in ${data.periodLabel}` : ''}
          icon={
            <div style={{ padding: '8px', background: '#dcfce7', borderRadius: '8px', color: '#16a34a' }}>
              <Users size={22} />
            </div>
          }
        />

        <StatCard
          title="Active Devices"
          value={data ? data.farmers.activeDevices30d.toLocaleString() : '—'}
          subtitle={data ? `${data.farmers.totalDevices} total registered FCM` : ''}
          icon={
            <div style={{ padding: '8px', background: '#e0e7ff', borderRadius: '8px', color: '#4f46e5' }}>
              <Smartphone size={22} />
            </div>
          }
        />

        <StatCard
          title="Active Service Requests"
          value={data ? data.services.totalActive.toLocaleString() : '—'}
          subtitle="Awaiting review or diagnostic plan"
          icon={
            <div style={{ padding: '8px', background: '#fef3c7', borderRadius: '8px', color: '#d97706' }}>
              <Clock size={22} />
            </div>
          }
        />

        <StatCard
          title="Completed Services"
          value={data ? data.services.totalCompleted.toLocaleString() : '—'}
          subtitle="Delivered recommendations"
          icon={
            <div style={{ padding: '8px', background: '#dcfce7', borderRadius: '8px', color: '#15803d' }}>
              <CheckCircle2 size={22} />
            </div>
          }
        />

        <StatCard
          title="Bazaar Active Listings"
          value={data ? data.bazaar.activeListings.toLocaleString() : '—'}
          subtitle={data ? `${data.bazaar.activeProcurementRequests} procurement demands` : ''}
          icon={
            <div style={{ padding: '8px', background: '#fce7f3', borderRadius: '8px', color: '#db2777' }}>
              <ShoppingCart size={22} />
            </div>
          }
        />
      </div>

      {/* Section 2: Service Distribution & Operational Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.25rem' }}>
        
        {/* Service Queues Breakdown Card */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sprout size={18} color="#16a34a" />
              Service Requests by Category
            </h3>
            {onNavigateToServices && (
              <button
                onClick={onNavigateToServices}
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: '#16a34a',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                }}
              >
                <span>View Desk</span>
                <ExternalLink size={12} />
              </button>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {/* Soil & Fertilizer */}
            <div
              style={{
                padding: '0.75rem',
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#0f172a' }}>
                  Soil & Fertilizer Guidance
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  NPK dosage, nutritional deficiency
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '1.125rem', fontWeight: 800, color: '#0f172a' }}>
                  {data?.services.fertilizers.total ?? '—'}
                </span>
                <div style={{ fontSize: '0.6875rem', color: '#d97706', fontWeight: 600 }}>
                  {data?.services.fertilizers.byStatus?.SUBMITTED ?? 0} Pending
                </div>
              </div>
            </div>

            {/* Crop Disease */}
            <div
              style={{
                padding: '0.75rem',
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#0f172a' }}>
                  Crop Disease Pathology
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Pest & fungal diagnostic requests
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '1.125rem', fontWeight: 800, color: '#0f172a' }}>
                  {data?.services.diseases.total ?? '—'}
                </span>
                <div style={{ fontSize: '0.6875rem', color: '#d97706', fontWeight: 600 }}>
                  {data?.services.diseases.byStatus?.SUBMITTED ?? 0} Pending
                </div>
              </div>
            </div>

            {/* Orchard Planning */}
            <div
              style={{
                padding: '0.75rem',
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#0f172a' }}>
                  High-Density Orchard Surveys
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Topography, water, multi-year plans
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '1.125rem', fontWeight: 800, color: '#0f172a' }}>
                  {data?.services.orchards.total ?? '—'}
                </span>
                <div style={{ fontSize: '0.6875rem', color: '#d97706', fontWeight: 600 }}>
                  {data?.services.orchards.byStatus?.SUBMITTED ?? 0} Pending
                </div>
              </div>
            </div>

            {/* Labour Bookings */}
            <div
              style={{
                padding: '0.75rem',
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#0f172a' }}>
                  Farm Labour & Mechanization
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Seasonal harvest, spray, pruning crews
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '1.125rem', fontWeight: 800, color: '#0f172a' }}>
                  {data?.services.labour.total ?? '—'}
                </span>
                <div style={{ fontSize: '0.6875rem', color: '#d97706', fontWeight: 600 }}>
                  {data?.services.labour.byStatus?.OPEN ?? 0} Open
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Operational Events Activity Feed */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity size={18} color="#2563eb" />
              Live Operational Activity Feed
            </h3>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              Database events
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '310px', overflowY: 'auto' }}>
            {data && data.recentEvents.length > 0 ? (
              data.recentEvents.map((event) => (
                <div
                  key={`${event.service}-${event.id}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.625rem 0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #f1f5f9',
                    backgroundColor: '#ffffff',
                    transition: 'background-color 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: event.status === 'COMPLETED' || event.status === 'PLAN_READY' ? '#16a34a' : '#f59e0b',
                      }}
                    />
                    <div>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#0f172a' }}>
                        {event.serviceName}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        Farmer: <strong style={{ color: '#334155' }}>{event.farmerName}</strong> • {event.village || 'Kashmir Valley'}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span
                      style={{
                        padding: '0.15rem 0.5rem',
                        borderRadius: '9999px',
                        fontSize: '0.6875rem',
                        fontWeight: 600,
                        backgroundColor: '#f1f5f9',
                        color: '#475569',
                      }}
                    >
                      {event.status}
                    </span>
                    <div style={{ fontSize: '0.6875rem', color: '#94a3b8', marginTop: '2px' }}>
                      {new Date(event.timestamp).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8', fontSize: '0.875rem' }}>
                No recent activity recorded in this period.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Staff & Consultations Overview Footer */}
      <div
        style={{
          backgroundColor: '#f8fafc',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          padding: '1.25rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={20} color="#166534" />
            <div>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Platform Staff: </span>
              <strong style={{ fontSize: '0.875rem', color: '#0f172a' }}>
                {data?.staff.totalAdmins ?? 0} Admins • {data?.staff.totalExperts ?? 0} Agronomy Experts
              </strong>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <PhoneCall size={18} color="#2563eb" />
            <div>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Tele-Consultations: </span>
              <strong style={{ fontSize: '0.875rem', color: '#0f172a' }}>
                {data?.services.consultations.total ?? 0} Total Sessions
              </strong>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {onNavigateToFarmers && (
            <button
              onClick={onNavigateToFarmers}
              style={{
                padding: '0.45rem 0.875rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                color: '#334155',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Open Farmer Directory
            </button>
          )}
          {onNavigateToConsultations && (
            <button
              onClick={onNavigateToConsultations}
              style={{
                padding: '0.45rem 0.875rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#16a34a',
                color: '#ffffff',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Open Consultations Queue
            </button>
          )}
        </div>
      </div>

    </div>
  );
};
