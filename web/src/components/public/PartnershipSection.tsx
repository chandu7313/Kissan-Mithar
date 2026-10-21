import React from 'react';
import { ArrowRight, Sprout, Users, TrendingUp, HeartHandshake, Sparkles } from 'lucide-react';

interface PartnershipSectionProps {
  onNavigatePartnerships: () => void;
}

export const PartnershipSection: React.FC<PartnershipSectionProps> = ({ onNavigatePartnerships }) => {
  return (
    <section
      id="partners"
      style={{
        padding: '3rem 1.5rem',
        maxWidth: '1240px',
        margin: '0 auto',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          position: 'relative',
          borderRadius: '24px',
          overflow: 'hidden',
          backgroundColor: '#0a3d2e',
          boxShadow: '0 16px 40px rgba(10, 61, 46, 0.14)',
          border: '1px solid #dcfce7',
          minHeight: '380px',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {/* Background Image with Crisp Right Handshake */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'url(/assets/partnership_handshake.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'right center',
            backgroundRepeat: 'no-repeat',
          }}
        />

        {/* Soft Left-to-Right Gradient to make text readable and pop */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(90deg, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.95) 45%, rgba(255,255,255,0.78) 65%, rgba(255,255,255,0.15) 100%)',
            pointerEvents: 'none',
          }}
        />

        {/* Subtle Decorative Organic Leaf curves */}
        <svg
          style={{
            position: 'absolute',
            top: '20px',
            right: '28%',
            width: '160px',
            height: '160px',
            opacity: 0.18,
            pointerEvents: 'none',
          }}
          viewBox="0 0 200 200"
          fill="none"
        >
          <path
            d="M40 160C70 90 130 60 180 40C170 110 130 160 70 180C55 185 45 175 40 160Z"
            fill="#16a34a"
          />
        </svg>

        {/* Content Container */}
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            padding: '2.5rem 3rem',
            maxWidth: '680px',
            boxSizing: 'border-box',
          }}
        >
          {/* Top Tag & Handwritten Accent Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.85rem',
              flexWrap: 'wrap',
              gap: '0.75rem',
            }}
          >
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.6875rem',
                fontWeight: 800,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#15803d',
                backgroundColor: '#dcfce7',
                padding: '0.35rem 0.75rem',
                borderRadius: '9999px',
                border: '1px solid #bbf7d0',
              }}
            >
              <Sparkles size={11} color="#16a34a" />
              PARTNERSHIP OPPORTUNITIES
            </span>

            {/* Handwritten Tagline: Stronger Farmers Brighter Futures */}
            <div
              style={{
                fontFamily: "'Caveat', cursive",
                fontSize: '1.35rem',
                fontWeight: 700,
                color: '#14532d',
                transform: 'rotate(-3deg)',
                userSelect: 'none',
                lineHeight: 1.1,
              }}
            >
              Stronger Farmers, Brighter Futures
            </div>
          </div>

          {/* Heading */}
          <h2
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: '2.25rem',
              fontWeight: 800,
              color: '#06291a',
              letterSpacing: '-0.03em',
              lineHeight: 1.15,
              margin: '0 0 0.85rem 0',
            }}
          >
            Let's Grow Together
          </h2>

          {/* Description */}
          <p
            style={{
              fontSize: '0.9375rem',
              color: '#475569',
              lineHeight: 1.55,
              margin: '0 0 1.5rem 0',
              fontWeight: 500,
              maxWidth: '560px',
            }}
          >
            Collaborate with Kissan Mithar to create real impact for farmers, markets and the agriculture ecosystem.
            We invite agri-input companies, crop buyers, FPOs, NGOs, and technology partners.
          </p>

          {/* 4 Feature Highlights Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '0.85rem',
              marginBottom: '1.75rem',
            }}
          >
            {/* Benefit 1 */}
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.92)',
                borderRadius: '12px',
                padding: '0.75rem 0.65rem',
                border: '1px solid rgba(226, 232, 240, 0.8)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                minHeight: '84px',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '6px',
                  backgroundColor: '#dcfce7',
                  color: '#16a34a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '0.35rem',
                }}
              >
                <Sprout size={15} />
              </div>
              <div
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: '#0f172a',
                  lineHeight: 1.25,
                }}
              >
                New Market
                <br />
                Opportunities
              </div>
            </div>

            {/* Benefit 2 */}
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.92)',
                borderRadius: '12px',
                padding: '0.75rem 0.65rem',
                border: '1px solid rgba(226, 232, 240, 0.8)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                minHeight: '84px',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '6px',
                  backgroundColor: '#dbeafe',
                  color: '#2563eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '0.35rem',
                }}
              >
                <Users size={15} />
              </div>
              <div
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: '#0f172a',
                  lineHeight: 1.25,
                }}
              >
                Stronger
                <br />
                Farmer Networks
              </div>
            </div>

            {/* Benefit 3 */}
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.92)',
                borderRadius: '12px',
                padding: '0.75rem 0.65rem',
                border: '1px solid rgba(226, 232, 240, 0.8)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                minHeight: '84px',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '6px',
                  backgroundColor: '#e0e7ff',
                  color: '#4f46e5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '0.35rem',
                }}
              >
                <TrendingUp size={15} />
              </div>
              <div
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: '#0f172a',
                  lineHeight: 1.25,
                }}
              >
                Collaborative
                <br />
                Innovation
              </div>
            </div>

            {/* Benefit 4 */}
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.92)',
                borderRadius: '12px',
                padding: '0.75rem 0.65rem',
                border: '1px solid rgba(226, 232, 240, 0.8)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                minHeight: '84px',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '6px',
                  backgroundColor: '#fef3c7',
                  color: '#d97706',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '0.35rem',
                }}
              >
                <HeartHandshake size={15} />
              </div>
              <div
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: '#0f172a',
                  lineHeight: 1.25,
                }}
              >
                Inclusive
                <br />
                Growth
              </div>
            </div>
          </div>

          {/* Action Row: Primary Button + Secondary Link */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1.25rem',
              flexWrap: 'wrap',
            }}
          >
            <button
              type="button"
              onClick={onNavigatePartnerships}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.8rem 1.6rem',
                borderRadius: '10px',
                backgroundColor: '#15803d',
                color: '#ffffff',
                fontSize: '0.9375rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(21, 128, 61, 0.35)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#166534';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#15803d';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <span>Become a Partner</span>
              <ArrowRight size={16} />
            </button>

            <button
              type="button"
              onClick={onNavigatePartnerships}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                background: 'none',
                border: 'none',
                color: '#15803d',
                fontSize: '0.875rem',
                fontWeight: 700,
                cursor: 'pointer',
                padding: '0.5rem 0',
                transition: 'color 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#166534';
                e.currentTarget.style.textDecoration = 'underline';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#15803d';
                e.currentTarget.style.textDecoration = 'none';
              }}
            >
              <span>Explore Collaborations</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
