import React, { useState, useEffect } from 'react';
import {
  Users,
  Activity,
  MessageSquare,
  ShoppingBag,
  TrendingUp,
  TrendingDown,
  Sun,
  ChevronDown,
  ArrowRight,
  Sprout,
  CheckCircle2,
  Package,
  HardHat,
  RefreshCw,
} from 'lucide-react';
import { AnalyticsApi, ExecutiveSummary } from '../../api/analytics.api.js';
import { AuthStore } from '../../services/authStore.js';

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
  const [data, setData] = useState<ExecutiveSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedLocation, setSelectedLocation] = useState<string>('Hyderabad, TS');
  const [isLocationOpen, setIsLocationOpen] = useState<boolean>(false);
  const [growthPeriod, setGrowthPeriod] = useState<string>('Last 6 Months');
  const [isGrowthPeriodOpen, setIsGrowthPeriodOpen] = useState<boolean>(false);
  const [hoveredMonth, setHoveredMonth] = useState<number>(3); // Default hover on Apr/May (index 3 or 4)

  const session = AuthStore.getSession();
  const userName = session?.name ? session.name.split(' ')[0] : 'Ravi';

  // Dynamic greeting based on current local hour
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Formatted date string matching "Thu, 24 Apr 2025" style
  const getFormattedDate = () => {
    const now = new Date();
    return now.toLocaleDateString('en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const fetchSummary = () => {
    setIsLoading(true);
    AnalyticsApi.getExecutiveSummary('30d')
      .then((summary) => {
        setData(summary);
      })
      .catch((err) => {
        console.error('[DashboardPage] Failed to fetch executive summary:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  // Growth Chart Coordinates and Metrics
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  // SVG Chart bounds: width 540, height 180, padding 20
  // Values scaled between 0 and 30,000 (Y range 160 to 20)
  const chartData = [
    { month: 'Jan', service: 6500, farmers: 5800, consultations: 3200 },
    { month: 'Feb', service: 9200, farmers: 7800, consultations: 4600 },
    { month: 'Mar', service: 12400, farmers: 9500, consultations: 6800 },
    { month: 'Apr', service: 16800, farmers: 13200, consultations: 7400 },
    { month: 'May', service: 18420, farmers: 14800, consultations: 8900 },
    { month: 'Jun', service: 22600, farmers: 16500, consultations: 10400 },
  ];

  const scaleY = (val: number) => 160 - (val / 30000) * 140;
  const scaleX = (idx: number) => 35 + idx * 95;

  // Generate smooth SVG cubic bezier path
  const makePath = (key: 'service' | 'farmers' | 'consultations') => {
    return chartData.reduce((acc, point, idx) => {
      const x = scaleX(idx);
      const y = scaleY(point[key]);
      if (idx === 0) return `M ${x} ${y}`;
      const prevX = scaleX(idx - 1);
      const prevY = scaleY(chartData[idx - 1][key]);
      const cpX1 = prevX + (x - prevX) / 2;
      const cpX2 = prevX + (x - prevX) / 2;
      return `${acc} C ${cpX1} ${prevY}, ${cpX2} ${y}, ${x} ${y}`;
    }, '');
  };

  const servicePath = makePath('service');
  const farmersPath = makePath('farmers');
  const consultationsPath = makePath('consultations');

  // Closed area paths for gradient fills
  const serviceArea = `${servicePath} L ${scaleX(5)} 160 L ${scaleX(0)} 160 Z`;
  const farmersArea = `${farmersPath} L ${scaleX(5)} 160 L ${scaleX(0)} 160 Z`;
  const consultationsArea = `${consultationsPath} L ${scaleX(5)} 160 L ${scaleX(0)} 160 Z`;

  // Donut chart parameters
  // Total 1842 requests: Completed 58% (1067), In Progress 22% (405), Pending 14% (258), Escalated 6% (112)
  const totalRequests = data?.services.totalActive ? data.services.totalActive + (data.services.totalCompleted || 0) : 1842;
  const donutRadius = 65;
  const circumference = 2 * Math.PI * donutRadius; // ~408.4

  const segments = [
    { label: 'Completed', pct: 58, count: 1067, color: '#10b981', dash: circumference * 0.58 },
    { label: 'In Progress', pct: 22, count: 405, color: '#06b6d4', dash: circumference * 0.22 },
    { label: 'Pending', pct: 14, count: 258, color: '#f59e0b', dash: circumference * 0.14 },
    { label: 'Escalated', pct: 6, count: 112, color: '#ef4444', dash: circumference * 0.06 },
  ];

  // Calculate cumulative stroke dashoffsets for donut ring
  let cumulative = 0;
  const renderedSegments = segments.map((seg) => {
    const offset = -cumulative;
    cumulative += seg.dash;
    return { ...seg, offset };
  });

  return (
    <div
      className="animate-fade-in"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
        paddingBottom: '2.5rem',
      }}
    >
      {/* 1. HERO BANNER WITH INDIAN FARMER & WEATHER WIDGET */}
      <div
        style={{
          position: 'relative',
          borderRadius: '16px',
          minHeight: '200px',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.75rem 2rem',
          boxShadow: '0 4px 14px rgba(0, 0, 0, 0.06)',
          backgroundImage: `linear-gradient(90deg, rgba(15, 23, 42, 0.92) 0%, rgba(15, 23, 42, 0.78) 45%, rgba(15, 23, 42, 0.2) 75%, transparent 100%), url('/assets/farmer_hero_banner.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'right 30% center',
        }}
      >
        {/* Left greeting & message */}
        <div style={{ zIndex: 2, maxWidth: '580px', color: '#ffffff' }}>
          <h1
            style={{
              fontSize: '1.75rem',
              fontWeight: 800,
              margin: '0 0 0.35rem 0',
              letterSpacing: '-0.02em',
              textShadow: '0 2px 4px rgba(0,0,0,0.3)',
            }}
          >
            {getGreeting()}, {userName}!
          </h1>
          <p
            style={{
              fontSize: '0.95rem',
              color: '#e2e8f0',
              margin: '0 0 1rem 0',
              fontWeight: 400,
              textShadow: '0 1px 2px rgba(0,0,0,0.3)',
            }}
          >
            Here's what's happening across Kissan Mithar today.
          </p>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.85rem',
              color: '#cbd5e1',
              fontStyle: 'italic',
              background: 'rgba(255, 255, 255, 0.12)',
              backdropFilter: 'blur(8px)',
              padding: '0.35rem 0.85rem',
              borderRadius: '9999px',
              border: '1px solid rgba(255, 255, 255, 0.15)',
            }}
          >
            <span>🌱</span>
            <span>&ldquo;Empowering farmers. Growing together.&rdquo;</span>
          </div>
        </div>

        {/* Right: Weather Widget Card matching mockup */}
        <div
          style={{
            zIndex: 2,
            backgroundColor: 'rgba(255, 255, 255, 0.94)',
            backdropFilter: 'blur(12px)',
            borderRadius: '14px',
            padding: '1rem 1.25rem',
            minWidth: '220px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
            border: '1px solid rgba(255, 255, 255, 0.8)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.35rem',
            position: 'relative',
          }}
        >
          {/* Date row */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '0.75rem',
              color: '#64748b',
              fontWeight: 500,
            }}
          >
            <span>{getFormattedDate()}</span>
          </div>

          {/* Location dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setIsLocationOpen(!isLocationOpen)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                border: 'none',
                background: 'transparent',
                padding: '0.1rem 0',
                fontSize: '0.85rem',
                fontWeight: 700,
                color: '#1e293b',
                cursor: 'pointer',
              }}
            >
              <span>{selectedLocation}</span>
              <ChevronDown size={14} color="#64748b" />
            </button>

            {isLocationOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  marginTop: '4px',
                  backgroundColor: '#ffffff',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                  zIndex: 20,
                  width: '160px',
                  overflow: 'hidden',
                }}
              >
                {['Hyderabad, TS', 'Warangal, TS', 'Nizamabad, TS', 'Srinagar, J&K', 'Anantnag, J&K'].map((loc) => (
                  <div
                    key={loc}
                    onClick={() => {
                      setSelectedLocation(loc);
                      setIsLocationOpen(false);
                    }}
                    style={{
                      padding: '0.45rem 0.75rem',
                      fontSize: '0.8125rem',
                      color: selectedLocation === loc ? '#16a34a' : '#334155',
                      fontWeight: selectedLocation === loc ? 700 : 500,
                      backgroundColor: selectedLocation === loc ? '#f0fdf4' : '#ffffff',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = selectedLocation === loc ? '#f0fdf4' : '#ffffff')}
                  >
                    {loc}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Weather status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.2rem' }}>
            {/* Animated Sun Icon */}
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, #fde047 30%, #f59e0b 100%)',
                boxShadow: '0 0 16px rgba(245, 158, 11, 0.45)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
              }}
            >
              <Sun size={22} className="animate-spin" style={{ animationDuration: '24s' }} />
            </div>

            <div>
              <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
                32°C
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500, marginTop: '2px' }}>
                Clear Sky
              </div>
            </div>
          </div>

          {/* Decorative green leaf in bottom right corner */}
          <div
            style={{
              position: 'absolute',
              bottom: '8px',
              right: '10px',
              opacity: 0.85,
              pointerEvents: 'none',
            }}
          >
            <svg width="28" height="24" viewBox="0 0 32 28" fill="none">
              <path
                d="M30 4C24 4 18 8 16 14C14 8 8 4 2 4C2 16 10 24 16 26C22 24 30 16 30 4Z"
                fill="#22c55e"
                fillOpacity="0.4"
              />
              <path
                d="M16 26C16 18 16 10 16 4"
                stroke="#15803d"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* 2. FOUR KPI CARDS IN A ROW */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
        }}
      >
        {/* Card 1: Registered Farmers */}
        <div
          onClick={onNavigateToFarmers}
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '14px',
            border: '1px solid #f1f5f9',
            padding: '1.25rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            cursor: 'pointer',
            transition: 'transform 0.15s ease, box-shadow 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 14px rgba(0,0,0,0.06)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.84rem', fontWeight: 600, color: '#64748b' }}>
              Registered Farmers
            </span>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: '#eff6ff',
                color: '#3b82f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Users size={19} />
            </div>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', margin: '0.4rem 0 0.35rem 0' }}>
            {data?.farmers.total ? data.farmers.total.toLocaleString() : '12,430'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', color: '#16a34a', fontWeight: 600 }}>
            <TrendingUp size={14} />
            <span>+8% this month</span>
          </div>
        </div>

        {/* Card 2: Active Service Requests */}
        <div
          onClick={onNavigateToServices}
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '14px',
            border: '1px solid #f1f5f9',
            padding: '1.25rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            cursor: 'pointer',
            transition: 'transform 0.15s ease, box-shadow 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 14px rgba(0,0,0,0.06)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.84rem', fontWeight: 600, color: '#64748b' }}>
              Active Service Requests
            </span>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: '#ecfdf5',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Activity size={19} />
            </div>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', margin: '0.4rem 0 0.35rem 0' }}>
            {data?.services.totalActive ? data.services.totalActive.toLocaleString() : '1,842'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', color: '#ef4444', fontWeight: 600 }}>
            <TrendingDown size={14} />
            <span>-12% from last week</span>
          </div>
        </div>

        {/* Card 3: Consultations */}
        <div
          onClick={onNavigateToConsultations}
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '14px',
            border: '1px solid #f1f5f9',
            padding: '1.25rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            cursor: 'pointer',
            transition: 'transform 0.15s ease, box-shadow 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 14px rgba(0,0,0,0.06)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.84rem', fontWeight: 600, color: '#64748b' }}>
              Consultations
            </span>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: '#faf5ff',
                color: '#a855f7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MessageSquare size={19} />
            </div>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', margin: '0.4rem 0 0.35rem 0' }}>
            {data?.services.consultations.total ? data.services.consultations.total.toLocaleString() : '386'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', color: '#16a34a', fontWeight: 600 }}>
            <TrendingUp size={14} />
            <span>+24% this week</span>
          </div>
        </div>

        {/* Card 4: Agri Bazaar Listings */}
        <div
          onClick={onNavigateToBazaar}
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '14px',
            border: '1px solid #f1f5f9',
            padding: '1.25rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            cursor: 'pointer',
            transition: 'transform 0.15s ease, box-shadow 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 14px rgba(0,0,0,0.06)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.84rem', fontWeight: 600, color: '#64748b' }}>
              Agri Bazaar Listings
            </span>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: '#fffbeb',
                color: '#f59e0b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ShoppingBag size={19} />
            </div>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', margin: '0.4rem 0 0.35rem 0' }}>
            {data?.bazaar.activeListings ? data.bazaar.activeListings.toLocaleString() : '742'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', color: '#16a34a', fontWeight: 600 }}>
            <TrendingUp size={14} />
            <span>+15% this month</span>
          </div>
        </div>
      </div>

      {/* 3. MIDDLE SECTION: PLATFORM GROWTH CHART & SERVICE REQUEST STATUS DONUT */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.5fr 1fr',
          gap: '1.25rem',
        }}
      >
        {/* Left: Platform Growth Area-Line Chart */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '14px',
            border: '1px solid #f1f5f9',
            padding: '1.25rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          {/* Header row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
              Platform Growth
            </h3>

            {/* Time range dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setIsGrowthPeriodOpen(!isGrowthPeriodOpen)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  backgroundColor: '#ffffff',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: '#475569',
                  cursor: 'pointer',
                }}
              >
                <span>{growthPeriod}</span>
                <ChevronDown size={14} />
              </button>

              {isGrowthPeriodOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '4px',
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 6px 16px rgba(0,0,0,0.08)',
                    zIndex: 20,
                    width: '140px',
                    overflow: 'hidden',
                  }}
                >
                  {['Last 6 Months', 'Last 30 Days', 'Last Year'].map((p) => (
                    <div
                      key={p}
                      onClick={() => {
                        setGrowthPeriod(p);
                        setIsGrowthPeriodOpen(false);
                      }}
                      style={{
                        padding: '0.5rem 0.75rem',
                        fontSize: '0.8125rem',
                        color: growthPeriod === p ? '#16a34a' : '#334155',
                        fontWeight: growthPeriod === p ? 700 : 500,
                        backgroundColor: growthPeriod === p ? '#f0fdf4' : '#ffffff',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = growthPeriod === p ? '#f0fdf4' : '#ffffff')}
                    >
                      {p}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', fontSize: '0.8125rem', marginBottom: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }} />
              <span style={{ color: '#475569', fontWeight: 500 }}>Farmers</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#3b82f6' }} />
              <span style={{ color: '#475569', fontWeight: 500 }}>Service Requests</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f59e0b' }} />
              <span style={{ color: '#475569', fontWeight: 500 }}>Consultations</span>
            </div>
          </div>

          {/* SVG Area Line Chart */}
          <div style={{ position: 'relative', width: '100%', height: '210px' }}>
            <svg
              viewBox="0 0 540 190"
              style={{ width: '100%', height: '100%', overflow: 'visible' }}
            >
              <defs>
                <linearGradient id="serviceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.28" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.01" />
                </linearGradient>
                <linearGradient id="farmerGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.01" />
                </linearGradient>
                <linearGradient id="consultGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.01" />
                </linearGradient>
              </defs>

              {/* Horizontal Grid lines */}
              {[30000, 20000, 10000, 0].map((val) => {
                const y = scaleY(val);
                return (
                  <g key={val}>
                    <line
                      x1="30"
                      y1={y}
                      x2="520"
                      y2={y}
                      stroke="#f1f5f9"
                      strokeWidth="1.2"
                      strokeDasharray={val > 0 ? '4 4' : undefined}
                    />
                    <text
                      x="22"
                      y={y + 3}
                      textAnchor="end"
                      fill="#94a3b8"
                      fontSize="9"
                      fontWeight="500"
                    >
                      {val === 0 ? '0' : `${val / 1000}K`}
                    </text>
                  </g>
                );
              })}

              {/* Area fills */}
              <path d={serviceArea} fill="url(#serviceGrad)" />
              <path d={farmersArea} fill="url(#farmerGrad)" />
              <path d={consultationsArea} fill="url(#consultGrad)" />

              {/* Smooth spline curves */}
              <path d={consultationsPath} fill="none" stroke="#f59e0b" strokeWidth="2.4" strokeLinecap="round" />
              <path d={farmersPath} fill="none" stroke="#10b981" strokeWidth="2.4" strokeLinecap="round" />
              <path d={servicePath} fill="none" stroke="#3b82f6" strokeWidth="2.4" strokeLinecap="round" />

              {/* Vertical line indicator on hovered point */}
              {hoveredMonth !== null && (
                <line
                  x1={scaleX(hoveredMonth)}
                  y1={20}
                  x2={scaleX(hoveredMonth)}
                  y2={160}
                  stroke="#cbd5e1"
                  strokeWidth="1.2"
                  strokeDasharray="3 3"
                />
              )}

              {/* Circles on data points */}
              {chartData.map((pt, idx) => {
                const x = scaleX(idx);
                const isHovered = hoveredMonth === idx;
                return (
                  <g
                    key={pt.month}
                    onMouseEnter={() => setHoveredMonth(idx)}
                    style={{ cursor: 'pointer' }}
                  >
                    {/* Consultations circle */}
                    <circle cx={x} cy={scaleY(pt.consultations)} r={isHovered ? 4.5 : 3.5} fill="#ffffff" stroke="#f59e0b" strokeWidth="2" />
                    {/* Farmers circle */}
                    <circle cx={x} cy={scaleY(pt.farmers)} r={isHovered ? 4.5 : 3.5} fill="#ffffff" stroke="#10b981" strokeWidth="2" />
                    {/* Service circle */}
                    <circle cx={x} cy={scaleY(pt.service)} r={isHovered ? 4.5 : 3.5} fill="#ffffff" stroke="#3b82f6" strokeWidth="2" />

                    {/* X-axis Month Label */}
                    <text
                      x={x}
                      y="178"
                      textAnchor="middle"
                      fill={isHovered ? '#0f172a' : '#64748b'}
                      fontSize="10"
                      fontWeight={isHovered ? '700' : '500'}
                    >
                      {pt.month}
                    </text>
                  </g>
                );
              })}

              {/* Active Tooltip over point (matching screenshot e.g. "18,420 Farmers") */}
              {hoveredMonth !== null && (
                <g transform={`translate(${scaleX(hoveredMonth) - 30}, ${scaleY(chartData[hoveredMonth].service) - 45})`}>
                  <rect
                    width="60"
                    height="34"
                    rx="6"
                    fill="#1e293b"
                    filter="drop-shadow(0 4px 6px rgba(0,0,0,0.18))"
                  />
                  {/* Tooltip arrow */}
                  <polygon points="24,34 30,40 36,34" fill="#1e293b" />
                  <text x="30" y="14" textAnchor="middle" fill="#ffffff" fontSize="9.5" fontWeight="700">
                    {chartData[hoveredMonth].service.toLocaleString()}
                  </text>
                  <text x="30" y="27" textAnchor="middle" fill="#94a3b8" fontSize="8" fontWeight="500">
                    Farmers
                  </text>
                </g>
              )}
            </svg>
          </div>
        </div>

        {/* Right: Service Request Status Donut Chart */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '14px',
            border: '1px solid #f1f5f9',
            padding: '1.25rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: '0 0 1rem 0' }}>
            Service Request Status
          </h3>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              flex: 1,
            }}
          >
            {/* SVG Donut Ring */}
            <div style={{ position: 'relative', width: '150px', height: '150px', flexShrink: 0 }}>
              <svg viewBox="0 0 160 160" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                {renderedSegments.map((seg) => (
                  <circle
                    key={seg.label}
                    cx="80"
                    cy="80"
                    r={donutRadius}
                    fill="transparent"
                    stroke={seg.color}
                    strokeWidth="20"
                    strokeDasharray={`${seg.dash} ${circumference}`}
                    strokeDashoffset={seg.offset}
                    strokeLinecap="butt"
                    style={{ transition: 'stroke-dasharray 0.5s ease' }}
                  />
                ))}
              </svg>

              {/* Center text inside donut */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  pointerEvents: 'none',
                }}
              >
                <span style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>
                  {totalRequests.toLocaleString()}
                </span>
                <span style={{ fontSize: '0.6875rem', color: '#64748b', fontWeight: 500, marginTop: '2px' }}>
                  Total Requests
                </span>
              </div>
            </div>

            {/* Breakdown stats on right */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
              {segments.map((seg) => (
                <div
                  key={seg.label}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.8125rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: seg.color,
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ color: '#334155', fontWeight: 500 }}>{seg.label}</span>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontWeight: 700, color: '#0f172a' }}>{seg.pct}%</span>{' '}
                    <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>({seg.count.toLocaleString()})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4. BOTTOM SECTION: RECENT REGISTRATIONS & RECENT ACTIVITY */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1.25rem',
        }}
      >
        {/* Left: Recent Registrations Table */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '14px',
            border: '1px solid #f1f5f9',
            padding: '1.25rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
              Recent Registrations
            </h3>
            {onNavigateToFarmers && (
              <button
                onClick={onNavigateToFarmers}
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: '#0284c7',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                }}
              >
                <span>View all</span>
                <ArrowRight size={13} />
              </button>
            )}
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <th style={{ padding: '0.5rem 0.5rem 0.5rem 0', fontSize: '0.6875rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    FARMER
                  </th>
                  <th style={{ padding: '0.5rem', fontSize: '0.6875rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    LOCATION
                  </th>
                  <th style={{ padding: '0.5rem', fontSize: '0.6875rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    JOINED ON
                  </th>
                  <th style={{ padding: '0.5rem 0 0.5rem 0.5rem', fontSize: '0.6875rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>
                    STATUS
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    name: 'Ramesh Naik',
                    location: 'Nizamabad, TS',
                    date: '24 Apr 2025',
                    status: 'Active',
                    avatarBg: '#dbeafe',
                    avatarColor: '#1d4ed8',
                  },
                  {
                    name: 'Saroja Devi',
                    location: 'Warangal, TS',
                    date: '24 Apr 2025',
                    status: 'Active',
                    avatarBg: '#fce7f3',
                    avatarColor: '#be185d',
                  },
                  {
                    name: 'Mahesh Kumar',
                    location: 'Karimnagar, TS',
                    date: '23 Apr 2025',
                    status: 'Active',
                    avatarBg: '#fef3c7',
                    avatarColor: '#b45309',
                  },
                ].map((farmer) => (
                  <tr
                    key={farmer.name}
                    style={{
                      borderBottom: '1px solid #f8fafc',
                      transition: 'background-color 0.15s ease',
                      cursor: 'pointer',
                    }}
                    onClick={onNavigateToFarmers}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <td style={{ padding: '0.65rem 0.5rem 0.65rem 0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            backgroundColor: farmer.avatarBg,
                            color: farmer.avatarColor,
                            fontWeight: 700,
                            fontSize: '0.75rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          {farmer.name.charAt(0)}
                        </div>
                        <span style={{ fontSize: '0.84rem', fontWeight: 600, color: '#0f172a' }}>
                          {farmer.name}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '0.65rem 0.5rem', fontSize: '0.8125rem', color: '#64748b' }}>
                      {farmer.location}
                    </td>
                    <td style={{ padding: '0.65rem 0.5rem', fontSize: '0.8125rem', color: '#64748b' }}>
                      {farmer.date}
                    </td>
                    <td style={{ padding: '0.65rem 0 0.65rem 0.5rem', textAlign: 'right' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '0.2rem 0.6rem',
                          borderRadius: '9999px',
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          backgroundColor: '#ecfdf5',
                          color: '#059669',
                        }}
                      >
                        {farmer.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Recent Activity Feed */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '14px',
            border: '1px solid #f1f5f9',
            padding: '1.25rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
              Recent Activity
            </h3>
            {onNavigateToServices && (
              <button
                onClick={onNavigateToServices}
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: '#0284c7',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                }}
              >
                <span>View all</span>
                <ArrowRight size={13} />
              </button>
            )}
          </div>

          {/* Activity List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {[
              {
                icon: <MessageSquare size={17} color="#9333ea" />,
                iconBg: '#faf5ff',
                title: 'New consultation request',
                desc: 'From Ramesh Naik',
                time: '2 mins ago',
                onClick: onNavigateToConsultations,
              },
              {
                icon: <Sprout size={17} color="#16a34a" />,
                iconBg: '#f0fdf4',
                title: 'Fertilizer recommendation completed',
                desc: 'For Saroja Devi',
                time: '12 mins ago',
                onClick: onNavigateToServices,
              },
              {
                icon: <Package size={17} color="#ea580c" />,
                iconBg: '#fff7ed',
                title: 'New procurement request',
                desc: '25 quintals - Maize',
                time: '28 mins ago',
                onClick: onNavigateToBazaar,
              },
              {
                icon: <HardHat size={17} color="#d97706" />,
                iconBg: '#fffbeb',
                title: 'Labour group registered',
                desc: 'Bhagya Labour Group - Nirmal',
                time: '1 hour ago',
                onClick: onNavigateToServices,
              },
            ].map((item, idx) => (
              <div
                key={idx}
                onClick={item.onClick}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.45rem 0',
                  cursor: 'pointer',
                  transition: 'background-color 0.15s ease',
                  borderRadius: '8px',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      backgroundColor: item.iconBg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {item.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#0f172a' }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      {item.desc}
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: '0.75rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>
                  {item.time}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
