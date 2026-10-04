import React, { useState, useEffect } from 'react';
import {
  Users,
  Briefcase,
  Tractor,
  ShoppingCart,
  PhoneCall,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { AnalyticsApi } from '../../api/analytics.api.js';
import { AnalyticsSummary } from '../../types/index.js';
import { StatCard } from '../../components/common/StatCard.js';

interface Props {
  onNavigateToRequests: () => void;
  onNavigateToConsultations: () => void;
}

export const DashboardPage: React.FC<Props> = ({
  onNavigateToRequests,
  onNavigateToConsultations,
}) => {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = () => {
    setError(null);
    AnalyticsApi.getSummary()
      .then(setAnalytics)
      .catch((err) => {
        console.error('[DashboardPage] Failed to load analytics:', err);
        setError('Failed to load dashboard data. The database may be temporarily unavailable.');
      });
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p style={{ color: '#ef4444', marginBottom: '1rem' }}>{error}</p>
        <button
          onClick={fetchAnalytics}
          className="btn-primary"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!analytics) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading Dashboard...</div>;
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1.25rem' }}>
          Admin Dashboard
        </h1>
        
        {/* KPI Cards Grid - Matching Reference Design */}
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '1rem',
          }}
        >
          <StatCard
            title="Total Surveys"
            value={analytics.totalRequests}
            icon={<div style={{ padding: '6px', background: '#f0fdf4', borderRadius: '8px', color: '#16a34a' }}><Users size={20} /></div>}
          />
          <StatCard
            title="Pending Review"
            value={analytics.pendingReviews}
            icon={<div style={{ padding: '6px', background: '#fffbeb', borderRadius: '8px', color: '#d97706' }}><Clock size={20} /></div>}
          />
          <StatCard
            title="Completed"
            value={analytics.reportsCompleted}
            icon={<div style={{ padding: '6px', background: '#f0fdf4', borderRadius: '8px', color: '#16a34a' }}><CheckCircle2 size={20} /></div>}
          />
          <StatCard
            title="Avg Days"
            value={analytics.avgTurnaroundDays}
            icon={<div style={{ padding: '6px', background: '#eff6ff', borderRadius: '8px', color: '#2563eb' }}><Clock size={20} /></div>}
          />
          <StatCard
            title="Satisfaction"
            value={`${analytics.farmerSatisfaction}/5`}
            icon={<div style={{ padding: '6px', background: '#fef2f2', borderRadius: '8px', color: '#dc2626' }}><CheckCircle2 size={20} /></div>}
          />
          <StatCard
            title="Consultations"
            value="Active"
            icon={<div style={{ padding: '6px', background: '#eff6ff', borderRadius: '8px', color: '#2563eb' }}><PhoneCall size={20} /></div>}
          />
        </div>
      </div>

      {/* Main Content Area - Charts & Breakdowns matching reference */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        
        {/* Line Chart Mockup (Crop Demand) */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--text-main)' }}>Service Trends</h3>
          
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {analytics.cropDemand.map((item) => (
                <div key={item.crop} style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{item.crop}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{item.percentage}%</span>
                  </div>
                  <div style={{ height: '8px', backgroundColor: 'var(--km-gray-100)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${item.percentage}%`,
                        backgroundColor: 'var(--km-green-500)',
                        borderRadius: '4px',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Donut Chart Mockup (Status Breakdown) */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--text-main)' }}>Service Requests</h3>
          
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2rem' }}>
            {/* CSS Donut Chart */}
            <div style={{
              width: '180px',
              height: '180px',
              borderRadius: '50%',
              background: 'conic-gradient(var(--km-green-500) 0% 60%, var(--km-gold) 60% 85%, var(--km-info) 85% 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative'
            }}>
              <div style={{
                width: '130px',
                height: '130px',
                backgroundColor: 'white',
                borderRadius: '50%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total</span>
                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>{analytics.totalRequests}</span>
              </div>
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8125rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--km-green-500)' }}></div>
                  <span style={{ color: 'var(--text-muted)' }}>Completed</span>
                </div>
                <span style={{ fontWeight: 600 }}>{analytics.statusBreakdown['PLAN_READY'] || 0}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8125rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--km-gold)' }}></div>
                  <span style={{ color: 'var(--text-muted)' }}>Pending</span>
                </div>
                <span style={{ fontWeight: 600 }}>{analytics.statusBreakdown['SUBMITTED'] || 0}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8125rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--km-info)' }}></div>
                  <span style={{ color: 'var(--text-muted)' }}>Under Review</span>
                </div>
                <span style={{ fontWeight: 600 }}>{analytics.statusBreakdown['UNDER_REVIEW'] || 0}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
