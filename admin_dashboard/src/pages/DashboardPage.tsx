import React, { useState, useEffect } from 'react';
import {
  ClipboardList,
  PhoneCall,
  MapPin,
  Clock,
  FileCheck,
  Zap,
  Star,
} from 'lucide-react';
import { AnalyticsApi } from '../api/analytics.api.js';
import { AnalyticsSummary } from '../types/index.js';
import { StatCard } from '../components/common/StatCard.js';

interface Props {
  onNavigateToRequests: () => void;
  onNavigateToConsultations: () => void;
}

export const DashboardPage: React.FC<Props> = ({
  onNavigateToRequests,
  onNavigateToConsultations,
}) => {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);

  useEffect(() => {
    AnalyticsApi.getSummary().then(setAnalytics);
  }, []);

  if (!analytics) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading Analytics Hub...</div>;
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Welcome Banner */}
      <div
        className="desktop-banner"
        style={{
          background: 'linear-gradient(135deg, var(--primary-800) 0%, var(--primary-900) 100%)',
          color: 'white',
          borderRadius: '1rem',
          padding: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            Horticultural Operations & Feasibility Overview
          </h1>
          <p style={{ color: '#bbf7d0', fontSize: '0.9375rem', maxWidth: '600px' }}>
            Monitor land survey requests, review farmer GPS soil surveys, generate stamped feasibility PDF reports, and provide expert audio/video consultations.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={onNavigateToRequests}
            className="btn-gold"
            style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}
          >
            <ClipboardList size={16} />
            <span>Review Surveys ({analytics.pendingReviews})</span>
          </button>
          <button
            onClick={onNavigateToConsultations}
            className="btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}
          >
            <PhoneCall size={15} />
            <span>Consultations</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
        }}
      >
        <StatCard
          title="Total Survey Requests"
          value={analytics.totalRequests}
          icon={<ClipboardList size={20} color="var(--primary-600)" />}
          trend="+18% this month"
          trendPositive={true}
        />
        <StatCard
          title="Pending Expert Review"
          value={analytics.pendingReviews}
          icon={<Clock size={20} color="#d97706" />}
          subtitle="Action required"
        />
        <StatCard
          title="Reports Delivered"
          value={analytics.reportsCompleted}
          icon={<FileCheck size={20} color="#2563eb" />}
          trend="+24% delivery"
          trendPositive={true}
        />
        <StatCard
          title="Avg Turnaround Time"
          value={`${analytics.avgTurnaroundDays} Days`}
          icon={<Zap size={20} color="#7c3aed" />}
          subtitle="Target < 2.0 days"
        />
        <StatCard
          title="Farmer Satisfaction"
          value={`${analytics.farmerSatisfaction} / 5.0`}
          icon={<Star size={20} fill="#eab308" color="#eab308" />}
          trend="99.2% positive"
          trendPositive={true}
        />
      </div>

      {/* Bottom Section: Pipeline and Crops */}
      <div className="responsive-grid">
        {/* Status Distribution */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Orchard Request Pipeline by Status</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {Object.entries(analytics.statusBreakdown).map(([status, count]) => {
              const total = analytics.totalRequests;
              const pct = Math.round((count / total) * 100);
              return (
                <div key={status} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                    <span style={{ fontWeight: 600 }}>{status.replace('_', ' ')}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{count} ({pct}%)</span>
                  </div>
                  <div style={{ height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${pct}%`,
                        backgroundColor:
                          status === 'PLAN_READY' ? 'var(--primary-600)' :
                            status === 'UNDER_REVIEW' ? '#0284c7' :
                              status === 'SUBMITTED' ? 'var(--accent-gold)' : '#94a3b8',
                        borderRadius: '4px',
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Demanded Crops */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Top Recommended Horticultural Crops</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {analytics.cropDemand.map((item) => (
              <div key={item.crop} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                  <span style={{ fontWeight: 600 }}>{item.crop}</span>
                  <span style={{ color: 'var(--text-muted)' }}>{item.percentage}% of reports</span>
                </div>
                <div style={{ height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${item.percentage}%`,
                      backgroundColor: 'var(--primary-700)',
                      borderRadius: '4px',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
