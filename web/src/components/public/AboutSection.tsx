import React from 'react';
import './AboutSection.css';
import {
  ArrowDown, ArrowRight, Eye, Target, TrendingUp, Sprout,
  Check, Linkedin, Github, Mail, Building2, Calendar,
  Landmark, MapPin, Wheat, Users, Globe, Layers, Handshake,
  Lightbulb, ShieldCheck, Map
} from 'lucide-react';
import { ASSETS } from '../../assets';

interface AboutSectionProps {
  onNavigatePartnerships?: () => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ onNavigatePartnerships }) => {
  const handleScrollToStory = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById('our-story');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handlePartnerClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onNavigatePartnerships) {
      onNavigatePartnerships();
    } else {
      const el = document.getElementById('partners');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleOpenMap = () => {
    window.open('https://maps.google.com/?q=Telangana,India', '_blank', 'noopener,noreferrer');
  };

  return (
    <section id="about" className="about-section-wrapper">
      <div className="about-container">
        {/* ===================================================
            1. HERO BANNER
            =================================================== */}
        <div className="about-hero-card">
          <div className="about-hero-bg" />
          <div className="about-hero-overlay" />

          {/* Slogan in top right */}
          <div className="about-hero-slogan-decor">
            <div>Stronger Farmers</div>
            <div>Healthier Communities</div>
            <div>Greener Tomorrow</div>
          </div>

          <div className="about-hero-content">
            <div className="about-hero-badge">
              <Sprout size={14} />
              <span>ABOUT KISSAN MITHAR</span>
            </div>

            <h1 className="about-hero-title">
              Empowering Farmers<br />
              for a <span className="about-hero-title-highlight">Brighter Tomorrow</span>
            </h1>

            <p className="about-hero-desc">
              Kissan Mithar is an agriculture technology and services company building a connected ecosystem to support farmers, strengthen agricultural supply chains, and create sustainable opportunities across the farming community.
            </p>

            <div className="about-hero-ctas">
              <a href="#our-story" onClick={handleScrollToStory} className="about-btn-primary">
                <span>Our Story</span>
                <ArrowDown size={16} />
              </a>
              <a href="#partners" onClick={handlePartnerClick} className="about-btn-secondary">
                <span>Partner With Us</span>
              </a>
            </div>

            <div className="about-hero-pillars">
              <div className="about-hero-pillar-item">
                <div className="about-pillar-icon green">
                  <Wheat size={17} />
                </div>
                <div className="about-pillar-label">
                  <strong>Farmers</strong>
                  <span>Focused</span>
                </div>
              </div>

              <div className="about-hero-pillar-item">
                <div className="about-pillar-icon orange">
                  <TrendingUp size={17} />
                </div>
                <div className="about-pillar-label">
                  <strong>Sustainable</strong>
                  <span>Growth</span>
                </div>
              </div>

              <div className="about-hero-pillar-item">
                <div className="about-pillar-icon blue">
                  <Lightbulb size={17} />
                </div>
                <div className="about-pillar-label">
                  <strong>Technology</strong>
                  <span>Enabled</span>
                </div>
              </div>

              <div className="about-hero-pillar-item">
                <div className="about-pillar-icon purple">
                  <Handshake size={17} />
                </div>
                <div className="about-pillar-label">
                  <strong>Community</strong>
                  <span>Driven</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ===================================================
            2. FOUR CORE PILLARS
            =================================================== */}
        <div className="about-core-pillars-grid">
          {/* Vision */}
          <div className="about-core-pillar-card">
            <div className="about-card-icon-circle vision">
              <Eye size={22} />
            </div>
            <h3>Our Vision</h3>
            <p>
              A prosperous farming ecosystem where every farmer has access to knowledge, services, markets and opportunities.
            </p>
          </div>

          {/* Mission */}
          <div className="about-core-pillar-card">
            <div className="about-card-icon-circle mission">
              <Target size={22} />
            </div>
            <h3>Our Mission</h3>
            <p>
              To make agricultural services, market connections and technology accessible and useful for farmers and agri-businesses.
            </p>
          </div>

          {/* Purpose */}
          <div className="about-core-pillar-card">
            <div className="about-card-icon-circle purpose">
              <TrendingUp size={22} />
            </div>
            <h3>Our Purpose</h3>
            <p>
              To create meaningful impact for farmers, rural communities and the wider agricultural ecosystem through reliable and innovative solutions.
            </p>
          </div>

          {/* Values */}
          <div className="about-core-pillar-card">
            <div className="about-card-icon-circle values">
              <Sprout size={22} />
            </div>
            <h3>Our Values</h3>
            <ul className="about-values-list">
              <li>
                <span className="about-values-check"><Check size={11} strokeWidth={3} /></span>
                <span>Farmer-centric</span>
              </li>
              <li>
                <span className="about-values-check"><Check size={11} strokeWidth={3} /></span>
                <span>Trustworthy</span>
              </li>
              <li>
                <span className="about-values-check"><Check size={11} strokeWidth={3} /></span>
                <span>Inclusive</span>
              </li>
              <li>
                <span className="about-values-check"><Check size={11} strokeWidth={3} /></span>
                <span>Innovative</span>
              </li>
              <li>
                <span className="about-values-check"><Check size={11} strokeWidth={3} /></span>
                <span>Committed to sustainable growth</span>
              </li>
            </ul>
          </div>
        </div>

        {/* ===================================================
            3. OUR STORY
            =================================================== */}
        <div id="our-story" className="about-story-grid">
          <div className="about-story-text">
            <div className="about-tag">
              <span>OUR STORY</span>
            </div>
            <h2 className="about-heading">Built on Trust, Driven by Farmers</h2>
            <p className="about-story-desc">
              Kissan Mithar was founded with a simple belief — farmers deserve better access to information, services and market opportunities. We bring technology, expertise and strong partnerships together to support farmers at every step of their journey, from crop planning and cultivation to harvesting, selling and business growth.
            </p>
            <div>
              <a href="#about" className="about-btn-primary">
                <span>Read Our Full Story</span>
                <ArrowRight size={16} />
              </a>
            </div>
          </div>

          <div className="about-story-quote-card">
            <div className="about-story-quote-bg" />
            <div className="about-story-quote-overlay" />
            <div className="about-story-quote-inner">
              <div className="about-quote-mark">“</div>
              <p className="about-quote-text">
                When farmers grow, communities grow and the future grows brighter.
              </p>
            </div>
          </div>
        </div>

        {/* ===================================================
            4. LEADERSHIP & COMPANY SNAPSHOT
            =================================================== */}
        <div className="about-leadership-snapshot-grid">
          {/* Leadership */}
          <div>
            <div className="about-tag">
              <span>OUR LEADERSHIP</span>
            </div>
            <h2 className="about-heading">CEO & Founder</h2>

            <div className="about-founder-composite-card">
              <div className="about-founder-profile-card">
                <img
                  src={ASSETS.ABOUT.FOUNDER}
                  alt="G. Chandu - CEO & Founder"
                  className="about-founder-avatar-img"
                />
                <h3 className="about-founder-name">G. Chandu</h3>
                <div className="about-founder-title">CEO & Founder</div>
                <p className="about-founder-bio">
                  Passionate about using technology to solve real problems in agriculture and create meaningful opportunities for farmers and rural communities.
                </p>
                <div className="about-founder-socials">
                  <a
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="about-social-btn"
                    aria-label="LinkedIn"
                  >
                    <Linkedin size={15} />
                  </a>
                  <a
                    href="https://github.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="about-social-btn"
                    aria-label="GitHub"
                  >
                    <Github size={15} />
                  </a>
                  <a
                    href="mailto:contact@kissanmithar.com"
                    className="about-social-btn"
                    aria-label="Email"
                  >
                    <Mail size={15} />
                  </a>
                </div>
              </div>

              <div className="about-founder-quote-bubble">
                <div className="about-bubble-quote-mark">“</div>
                <p className="about-founder-quote-msg">
                  My goal is to build a connected agricultural ecosystem where every farmer can access the right knowledge, services and market opportunities, and create a more sustainable future for our farming community.
                </p>
                <div className="about-founder-signature">
                  <strong>— G. Chandu</strong>
                  <span>CEO & Founder, Kissan Mithar</span>
                </div>
              </div>
            </div>
          </div>

          {/* Company Snapshot */}
          <div>
            <div className="about-tag">
              <span>COMPANY SNAPSHOT</span>
            </div>
            <h2 className="about-heading">Kissan Mithar Private Limited</h2>

            <div className="about-snapshot-card">
              <div className="about-snapshot-list">
                <div className="about-snapshot-row">
                  <Building2 size={16} className="about-snapshot-icon" />
                  <span className="about-snapshot-label">Company Name</span>
                  <span className="about-snapshot-value">Kissan Mithar Private Limited</span>
                </div>

                <div className="about-snapshot-row">
                  <Calendar size={16} className="about-snapshot-icon" />
                  <span className="about-snapshot-label">Incorporation Year</span>
                  <span className="about-snapshot-value">2024</span>
                </div>

                <div className="about-snapshot-row">
                  <Landmark size={16} className="about-snapshot-icon" />
                  <span className="about-snapshot-label">Company Type</span>
                  <span className="about-snapshot-value">Private Limited (India)</span>
                </div>

                <div className="about-snapshot-row">
                  <MapPin size={16} className="about-snapshot-icon" />
                  <span className="about-snapshot-label">Registered Address</span>
                  <span className="about-snapshot-value">Telangana, India</span>
                </div>

                <div className="about-snapshot-row">
                  <Wheat size={16} className="about-snapshot-icon" />
                  <span className="about-snapshot-label">Industry</span>
                  <span className="about-snapshot-value">Agriculture Technology, Farmer Services & Agri-Commerce</span>
                </div>

                <div className="about-snapshot-row">
                  <Users size={16} className="about-snapshot-icon" />
                  <span className="about-snapshot-label">Focus Areas</span>
                  <span className="about-snapshot-value">Farmer Services, Agri Bazaar, Agri Products, Digital Platform</span>
                </div>

                <div className="about-snapshot-row">
                  <Globe size={16} className="about-snapshot-icon" />
                  <span className="about-snapshot-label">Website</span>
                  <span className="about-snapshot-value">
                    <a href="https://www.kissanmithar.com" target="_blank" rel="noopener noreferrer">
                      www.kissanmithar.com
                    </a>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ===================================================
            5. OUR IMPACT
            =================================================== */}
        <div className="about-impact-block">
          <div className="about-impact-bg-pattern" />

          <div className="about-impact-header">
            <div className="about-tag">
              <span>OUR IMPACT</span>
            </div>
            <h2 className="about-heading" style={{ marginBottom: 0 }}>
              Driving Positive Change in Agriculture
            </h2>
          </div>

          <div className="about-impact-grid">
            <div className="about-impact-card">
              <div className="about-impact-top">
                <div className="about-impact-icon green">
                  <Users size={20} />
                </div>
                <div className="about-impact-num">12K+</div>
              </div>
              <h4 className="about-impact-title">Farmers Reached</h4>
              <p className="about-impact-sub">Through our services and platform</p>
            </div>

            <div className="about-impact-card">
              <div className="about-impact-top">
                <div className="about-impact-icon orange">
                  <Layers size={20} />
                </div>
                <div className="about-impact-num">20+</div>
              </div>
              <h4 className="about-impact-title">Service Categories</h4>
              <p className="about-impact-sub">From advisory to market access</p>
            </div>

            <div className="about-impact-card">
              <div className="about-impact-top">
                <div className="about-impact-icon blue">
                  <MapPin size={20} />
                </div>
                <div className="about-impact-num">6+</div>
              </div>
              <h4 className="about-impact-title">States Covered</h4>
              <p className="about-impact-sub">Expanding across India</p>
            </div>

            <div className="about-impact-card">
              <div className="about-impact-top">
                <div className="about-impact-icon purple">
                  <Handshake size={20} />
                </div>
                <div className="about-impact-num">50+</div>
              </div>
              <h4 className="about-impact-title">Partner Organizations</h4>
              <p className="about-impact-sub">FPOs, businesses, NGOs and institutions</p>
            </div>
          </div>
        </div>

        {/* ===================================================
            6. OUR LOCATION
            =================================================== */}
        <div>
          <div className="about-tag">
            <span>OUR LOCATION</span>
          </div>
          <h2 className="about-heading">Headquartered in Telangana, India</h2>

          <div className="about-location-card">
            {/* Left: Office Building Image */}
            <div className="about-office-image-box">
              <img
                src={ASSETS.ABOUT.OFFICE}
                alt="Kissan Mithar Headquarters Office"
                className="about-office-image"
              />
            </div>

            {/* Middle: Office Info & View on Map button */}
            <div className="about-office-details">
              <div className="about-office-pin-header">
                <MapPin size={20} />
                <strong>Our Office</strong>
              </div>
              <h3 className="about-office-name">Kissan Mithar Private Limited</h3>
              <div className="about-office-city">Telangana, India</div>
              <p className="about-office-desc">
                Strategically located to serve farmers and partners across Telangana and nearby regions.
              </p>
              <div>
                <button
                  type="button"
                  onClick={handleOpenMap}
                  className="about-btn-secondary"
                  style={{ padding: '0.55rem 1rem', fontSize: '0.85rem' }}
                >
                  <Map size={15} />
                  <span>View on Map</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>

            {/* Right: Map Illustration */}
            <div className="about-map-box">
              <img
                src={ASSETS.ABOUT.MAP}
                alt="Telangana India Map Location"
                className="about-map-img"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
