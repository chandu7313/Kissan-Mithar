import React, { useEffect } from 'react';
import './LandingPage.css';
import {
  MapPin, ShieldCheck, Star, Play, ArrowRight,
  Users, Award, Tractor, Handshake, Sprout,
  Briefcase, Package, CloudSun, Bot, Leaf,
  ShoppingCart, Sparkles, CheckCircle2
} from 'lucide-react';

import { ASSETS } from '../../assets';
import { PublicNavbar } from '../../components/layout/PublicNavbar';

interface LandingPageProps {
  onAdminLogin: () => void;
  onNavigateService?: (slug: string) => void;
  onNavigateSection?: (sectionId: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onAdminLogin, onNavigateService, onNavigateSection }) => {
  useEffect(() => {
    const path = window.location.pathname;
    let targetId = '';

    if (path === '/about') targetId = 'about';
    else if (path === '/services') targetId = 'services';
    else if (path === '/contact') targetId = 'contact';
    else if (path === '/farmers') targetId = 'farmers';
    else if (path === '/experts') targetId = 'experts';
    else if (path === '/partners') targetId = 'partners';

    if (targetId) {
      setTimeout(() => {
        const el = document.getElementById(targetId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 300);
    }
  }, []);

  const downloadUrl = "https://drive.google.com/uc?export=download&id=1LhJ4mMGZG01RkQp0EtcE-4f2xOJh6gKe";

  const services = [
    {
      slug: 'crop-planning',
      title: 'Orchard & Crop Planning',
      desc: 'Plan and establish all types of crops and orchards with location-specific recommendations.',
      image: ASSETS.SERVICES.ORCHARD_PLANNING,
      icon: <Leaf size={22} />,
      tags: ['Soil Analysis', 'Crop Selection', 'Yield Planning'],
      popular: true,
      span: 4
    },
    {
      slug: 'expert-consultancy',
      title: 'Expert Consultancy',
      desc: 'Get advice directly from certified agriculture scientists via call, video or chat.',
      image: ASSETS.SERVICES.EXPERT_CONSULTANCY,
      icon: <Briefcase size={22} />,
      tags: ['Crop Advisory', 'Live Call', 'Field Visit'],
      span: 4
    },
    {
      slug: 'fertilizer-guide',
      title: 'Fertilizer Guide',
      desc: 'Crop-specific dosage and nutrient schedules for maximum soil health and higher harvest.',
      image: ASSETS.SERVICES.FERTILIZERS,
      icon: <Package size={22} />,
      tags: ['Balanced Nutrition', 'Dosage Guide', 'Cost Saving'],
      span: 4
    },
    {
      slug: 'disease-help',
      title: 'Disease Help',
      desc: 'Identify crop infections, pests and fungal issues with AI diagnosis and cure advice.',
      image: ASSETS.SERVICES.DISEASE_HELP,
      icon: <ShieldCheck size={22} />,
      span: 3
    },
    {
      slug: 'weather',
      title: 'Weather & Alerts',
      desc: 'Village-level live weather forecasts, rain radars and agronomic spray timings.',
      image: ASSETS.SERVICES.WEATHER,
      icon: <CloudSun size={22} />,
      span: 3
    },
    {
      slug: 'farm-labour',
      title: 'Farm Labour Hub',
      desc: 'Connect with verified agricultural labour groups for sowing, weeding and harvest.',
      image: ASSETS.SERVICES.LABOUR,
      icon: <Users size={22} />,
      span: 3
    },
    {
      slug: 'farm-machinery',
      title: 'Farm Machinery',
      desc: 'Rent or buy modern tractors, harvesters, seeders and spraying drones nearby.',
      image: ASSETS.SERVICES.MACHINERY,
      icon: <Tractor size={22} />,
      span: 3
    },
    {
      slug: 'crop-connect',
      title: 'Agri Bazaar',
      desc: 'Agricultural Products Sourcing & Direct Farmer Marketplace — by Kissan Mithar.',
      image: ASSETS.SERVICES.CROP_CONNECT,
      icon: <ShoppingCart size={22} />,
      span: 3
    },
    {
      slug: 'ai-farming-assistant',
      title: 'AI Farming Assistant',
      desc: 'Ask any farming query 24/7 in Telugu, Hindi or English for instant advisory.',
      image: ASSETS.SERVICES.AI_ASSISTANT,
      icon: <Bot size={22} />,
      span: 3
    }
  ];

  return (
    <div className="landing-container">
      {/* App-like Top Bar + Mobile Bottom Tab Bar */}
      <PublicNavbar
        onAdminLogin={onAdminLogin}
        transparent={true}
        onNavigateSection={onNavigateSection}
        activeBottomTab="home"
        onNavigateService={onNavigateService}
      />

      {/* Hero Section */}
      <section className="hero-section" id="home">
        <div className="hero-gradient-overlay" />

        <div className="hero-container">
          {/* Left Text Block */}
          <div className="hero-text-block">
            <div className="hero-app-badge">
              <Sparkles size={14} className="badge-sparkle-icon" />
              <span>Smart Agri Tech • Telangana & AP</span>
            </div>

            <h1 className="hero-main-title">
              Everything Your<br />
              Farm Needs.<br />
              <span className="hero-title-highlight">One Trusted Platform.</span>
            </h1>

            <p className="hero-main-desc">
              Expert agronomy advisory, weather radar, machinery rental, skilled labour, disease diagnosis, and direct market connections — all built for Indian farmers.
            </p>

            <div className="hero-cta-group">
              <a
                href={downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hero-btn-primary"
              >
                <Play size={18} fill="white" />
                <span>Download App</span>
              </a>
              <a
                href="#services"
                className="hero-btn-secondary"
                onClick={(e) => {
                  e.preventDefault();
                  const el = document.getElementById('services');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <span>Explore Services</span>
                <ArrowRight size={18} />
              </a>
            </div>

            <div className="hero-trust-badge">
              <div className="hero-avatar-stack">
                <img src="https://ui-avatars.com/api/?name=Farmer&background=166534&color=fff&size=32" alt="Farmer" />
                <img src="https://ui-avatars.com/api/?name=User&background=ea580c&color=fff&size=32" alt="User" />
                <img src="https://ui-avatars.com/api/?name=Agri&background=2563eb&color=fff&size=32" alt="Agri" />
                <img src="https://ui-avatars.com/api/?name=Plus&background=64748b&color=fff&size=32" alt="Community" />
              </div>
              <span className="hero-trust-text">50,000+ Farmers Trust Us</span>
            </div>
          </div>

          {/* Right AI Bot Card (Desktop Floating Mascot / Mobile In-App Search Widget) */}
          <div id="ai-assistant-widget" className="hero-ai-card">
            {/* The AI Bot Image */}
            <div className="hero-ai-bot-avatar">
              <img src="/assets/ai-bot.png" alt="AI Farming Assistant" className="ai-bot-animated" />
            </div>

            <div className="hero-ai-card-content">
              <div className="hero-ai-header">
                <div className="hero-ai-icon-pulse">
                  <Bot size={20} />
                </div>
                <div>
                  <h4 className="hero-ai-title">Ask AI Farming Assistant</h4>
                  <span className="hero-ai-subtitle">Instant voice & text advisory in your language</span>
                </div>
              </div>

              <div
                className="hero-ai-search-bar"
                onClick={() => onNavigateService && onNavigateService('ai-farming-assistant')}
              >
                <p className="hero-ai-placeholder">
                  Ask about crops, diseases, fertilizers, weather, mandi rates...
                </p>
                <button
                  type="button"
                  className="hero-ai-submit"
                  aria-label="Ask AI"
                >
                  <ArrowRight size={18} />
                </button>
              </div>

              <div className="hero-ai-tags">
                <button
                  type="button"
                  className="hero-ai-tag-pill"
                  onClick={() => onNavigateService && onNavigateService('fertilizer-guide')}
                >
                  🌱 Fertilizer dose
                </button>
                <button
                  type="button"
                  className="hero-ai-tag-pill"
                  onClick={() => onNavigateService && onNavigateService('disease-help')}
                >
                  🔍 Leaf spot cure
                </button>
                <button
                  type="button"
                  className="hero-ai-tag-pill"
                  onClick={() => onNavigateService && onNavigateService('weather')}
                >
                  🌦️ Rain forecast
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="stats-bar">
        <div className="stats-bar-inner">
          <div className="stat-item">
            <div className="stat-icon"><Users size={22} /></div>
            <div className="stat-text">
              <div className="stat-number">50K+</div>
              <div className="stat-label">Active Farmers</div>
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-icon"><Award size={22} /></div>
            <div className="stat-text">
              <div className="stat-number">500+</div>
              <div className="stat-label">Agri Scientists</div>
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-icon"><Handshake size={22} /></div>
            <div className="stat-text">
              <div className="stat-number">2K+</div>
              <div className="stat-label">Labour Crews</div>
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-icon"><Tractor size={22} /></div>
            <div className="stat-text">
              <div className="stat-number">800+</div>
              <div className="stat-label">Machinery Units</div>
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-icon"><ShieldCheck size={22} /></div>
            <div className="stat-text">
              <div className="stat-number">1K+</div>
              <div className="stat-label">Verified Buyers</div>
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-icon"><MapPin size={22} /></div>
            <div className="stat-text">
              <div className="stat-number">25+</div>
              <div className="stat-label">Agri Districts</div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="bento-section-wrapper">
        <div className="bento-header-grid">
          <div className="bento-header-text">
            <div className="services-badge">
              <Leaf size={16} fill="#166534" /> OUR SERVICES
            </div>
            <h2 className="bento-header-title">Complete Support for<br />Your Farming Journey</h2>
            <p className="bento-header-desc">
              From soil testing to harvest sales, Kissan Mithar equips farmers with precision agronomy and transparent resources.
            </p>
          </div>
        </div>

        <div className="bento-grid">
          {services.map((service, idx) => (
            <div
              key={idx}
              className={`bento-card bento-span-${service.span} ${service.slug ? 'cursor-pointer hover-lift' : ''}`}
              onClick={() => onNavigateService && service.slug && onNavigateService(service.slug)}
            >
              <div className="bento-image-wrapper">
                {service.popular && (
                  <div className="popular-badge"><Star size={12} fill="#166534" /> Popular</div>
                )}
                <img src={service.image} alt={service.title} loading="lazy" />
              </div>
              <div className="bento-content">
                <div>
                  <div className="bento-top-row">
                    <div className="bento-icon-wrapper">
                      {service.icon}
                    </div>
                    <div className="bento-arrow">
                      <ArrowRight size={16} />
                    </div>
                  </div>
                  <h3 className="bento-title">{service.title}</h3>
                  <p className="bento-desc">{service.desc}</p>
                </div>
                {service.tags && (
                  <div className="bento-tags">
                    {service.tags.map((tag, tIdx) => (
                      <span key={tIdx} className="bento-tag">{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Our Commitment Card */}
          <div className="commitment-card bento-span-6">
            <div className="commitment-content">
              <div className="commitment-badge"><Leaf size={12} fill="#166534" /> OUR COMMITMENT</div>
              <h3 className="commitment-title">Better Tools. Better Advice.<br />A Brighter Farming Future.</h3>
              <div className="commitment-stats">
                <div className="commitment-stat">
                  <div className="commitment-stat-icon"><Users size={24} /></div>
                  <div className="commitment-stat-text">
                    <strong>50K+</strong>
                    <span>Farmers</span>
                  </div>
                </div>
                <div className="commitment-stat">
                  <div className="commitment-stat-icon"><Award size={24} /></div>
                  <div className="commitment-stat-text">
                    <strong>500+</strong>
                    <span>Scientists</span>
                  </div>
                </div>
                <div className="commitment-stat">
                  <div className="commitment-stat-icon"><MapPin size={24} /></div>
                  <div className="commitment-stat-text">
                    <strong>25+</strong>
                    <span>Districts</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="commitment-image">
              <Sprout size={120} color="#166534" strokeWidth={1} style={{ opacity: 0.12 }} />
            </div>
          </div>
        </div>
      </section>

      {/* Seed to Sale Journey Section */}
      <section id="about" className="journey-section">
        <div className="section-header">
          <div className="section-badge"><Sprout size={14} /> COMPLETE LIFECYCLE</div>
          <h2 className="section-title">From Seed to Harvest & Sale</h2>
          <p className="section-subtitle">
            An end-to-end scientific workflow designed to maximize your yield, lower input costs, and get guaranteed market reach.
          </p>
        </div>

        <div className="journey-image-wrapper">
          <img
            src={ASSETS.WORKFLOW_IMAGE}
            alt="Agricultural Workflow from Plan to Sell"
            className="journey-workflow-img"
            loading="lazy"
          />
        </div>
      </section>

      {/* How it Works Section */}
      <section id="experts" className="how-it-works-section">
        <div className="section-header">
          <div className="section-badge"><Tractor size={14} /> SIMPLE 4-STEP PROCESS</div>
          <h2 className="section-title">How It Works</h2>
          <p className="section-subtitle">
            Get personalized farm advisory and market access in four easy steps
          </p>
        </div>

        <div className="timeline-container">
          <div className="timeline-step">
            <div className="step-number">1</div>
            <div className="step-icon">
              <img src="https://img.icons8.com/color/96/000000/smartphone.png" alt="Download" style={{ width: 32 }} />
            </div>
            <h4>Download App</h4>
            <p>Install the lightweight Kissan Mithar Android App</p>
          </div>

          <div className="timeline-step">
            <div className="step-number">2</div>
            <div className="step-icon">
              <img src="https://img.icons8.com/color/96/000000/field.png" alt="Farm Setup" style={{ width: 32 }} />
            </div>
            <h4>Set Up Your Farm</h4>
            <p>Add land acreage, soil type and current crop details</p>
          </div>

          <div className="timeline-step">
            <div className="step-number">3</div>
            <div className="step-icon">
              <img src="https://img.icons8.com/color/96/000000/farmer-male.png" alt="Pick Services" style={{ width: 32 }} />
            </div>
            <h4>Choose a Service</h4>
            <p>Get instant scientist advisory, labour, machinery or sell crops</p>
          </div>

          <div className="timeline-step">
            <div className="step-number">4</div>
            <div className="step-icon">
              <img src="https://img.icons8.com/color/96/000000/sprout.png" alt="Harvest & Earn" style={{ width: 32 }} />
            </div>
            <h4>Grow & Earn More</h4>
            <p>Achieve higher yield, save input costs and connect with buyers</p>
          </div>
        </div>
      </section>

      {/* Mobile App Promotion Section */}
      <section id="farmers" className="app-promo-section">
        <div className="app-promo-inner">
          {/* Left Text Column */}
          <div className="app-promo-text-col">
            <div className="section-badge"><Sparkles size={14} /> OFFICIAL MOBILE APP</div>
            <h2 className="app-promo-headline">
              Your Farm Assistant.<br />
              In Your Pocket.
            </h2>
            <p className="app-promo-sub">
              Get live crop guidance, hyperlocal weather alarms, disease diagnosis, and reliable mandi prices in Telugu, Hindi and English.
            </p>

            <div className="app-features-grid">
              <div className="app-feature-item">
                <CheckCircle2 size={18} className="feat-check" />
                <span>Scientist Video Advisory</span>
              </div>
              <div className="app-feature-item">
                <CheckCircle2 size={18} className="feat-check" />
                <span>Hyperlocal Weather Alarms</span>
              </div>
              <div className="app-feature-item">
                <CheckCircle2 size={18} className="feat-check" />
                <span>Soil & Orchard Blueprint</span>
              </div>
              <div className="app-feature-item">
                <CheckCircle2 size={18} className="feat-check" />
                <span>Labour & Machinery Hub</span>
              </div>
              <div className="app-feature-item">
                <CheckCircle2 size={18} className="feat-check" />
                <span>Agri Bazaar Direct Selling</span>
              </div>
              <div className="app-feature-item">
                <CheckCircle2 size={18} className="feat-check" />
                <span>24/7 AI Farming Chatbot</span>
              </div>
            </div>

            <div className="app-download-actions">
              <a
                href={downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="app-play-button"
              >
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                  alt="Get it on Google Play"
                  className="play-badge-img"
                />
              </a>

              <div className="app-qr-card">
                <img
                  src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https%3A%2F%2Fplay.google.com"
                  alt="Scan to Download QR"
                  className="qr-code-img"
                />
                <div className="qr-text">
                  <strong>Scan QR Code</strong>
                  <span>Direct APK Download</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Phone Mockup Column */}
          <div className="app-promo-visual-col">
            <img
              src={ASSETS.MOBILE_APP}
              alt="Kissan Mithar Mobile Application Preview"
              className="app-promo-phone-mockup"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="partners" className="stories-section">
        <div className="section-header left-align">
          <div className="header-row">
            <h2 className="section-title">What Farmers Say</h2>
            <div className="verified-farmers-pill">
              <ShieldCheck size={16} />
              <span>Verified Grower Feedback</span>
            </div>
          </div>
          <p className="section-subtitle">Real farmers. Real results across Telangana & Andhra Pradesh.</p>
        </div>

        <div className="stories-grid">
          <div className="story-card">
            <div className="stars">
              <Star size={16} fill="#F59E0B" color="#F59E0B" />
              <Star size={16} fill="#F59E0B" color="#F59E0B" />
              <Star size={16} fill="#F59E0B" color="#F59E0B" />
              <Star size={16} fill="#F59E0B" color="#F59E0B" />
              <Star size={16} fill="#F59E0B" color="#F59E0B" />
            </div>
            <p className="story-quote">
              "మొబైల్ యాప్‌లో ఆర్కిడ్ ప్లానింగ్ ద్వారా నా మామిడి తోటలో రెండు అడుగుల స్థలం ఎలా ఉపయోగించుకోవాలో తెలిసింది. దిగుబడి 30% పెరిగింది."
            </p>
            <div className="story-author">
              <img
                src="https://ui-avatars.com/api/?name=Ramesh+Goud&background=166534&color=fff"
                className="author-avatar-img"
                alt="Ramesh Goud"
              />
              <div className="author-info">
                <strong>Ramesh Goud</strong>
                <span>Mango Grower • Nalgonda</span>
              </div>
            </div>
          </div>

          <div className="story-card">
            <div className="stars">
              <Star size={16} fill="#F59E0B" color="#F59E0B" />
              <Star size={16} fill="#F59E0B" color="#F59E0B" />
              <Star size={16} fill="#F59E0B" color="#F59E0B" />
              <Star size={16} fill="#F59E0B" color="#F59E0B" />
              <Star size={16} fill="#F59E0B" color="#F59E0B" />
            </div>
            <p className="story-quote">
              "When pink bollworm struck our cotton field, the live scientist chat identified the exact bio-spray within minutes. Saved our crop!"
            </p>
            <div className="story-author">
              <img
                src="https://ui-avatars.com/api/?name=Suresh+Reddy&background=ea580c&color=fff"
                className="author-avatar-img"
                alt="Suresh Reddy"
              />
              <div className="author-info">
                <strong>Suresh Reddy</strong>
                <span>Cotton Farmer • Gadwal</span>
              </div>
            </div>
          </div>

          <div className="story-card">
            <div className="stars">
              <Star size={16} fill="#F59E0B" color="#F59E0B" />
              <Star size={16} fill="#F59E0B" color="#F59E0B" />
              <Star size={16} fill="#F59E0B" color="#F59E0B" />
              <Star size={16} fill="#F59E0B" color="#F59E0B" />
              <Star size={16} fill="#F59E0B" color="#F59E0B" />
            </div>
            <p className="story-quote">
              "We booked a paddy combine harvester directly on Kissan Mithar. Arrived right on time at reasonable local rates without middleman cuts."
            </p>
            <div className="story-author">
              <img
                src="https://ui-avatars.com/api/?name=Mahesh+K&background=2563eb&color=fff"
                className="author-avatar-img"
                alt="Mahesh K"
              />
              <div className="author-info">
                <strong>Mahesh K.</strong>
                <span>Paddy Farmer • Narayanpet</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-container">
          <div className="cta-content">
            <h2>Let's Build a Stronger Farming Future Together</h2>
            <p>Join over 50,000 farmers growing smarter and earning higher harvests with Kissan Mithar.</p>
          </div>
          <div className="cta-buttons">
            <a
              href={downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-light"
            >
              <Play size={18} fill="#166534" />
              <span>Download App</span>
            </a>
            <a
              href="#contact"
              className="btn-dark"
              onClick={(e) => {
                e.preventDefault();
                const el = document.getElementById('contact');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Contact Us
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer" id="contact">
        <div className="footer-content">
          <div className="footer-col brand-col">
            <div className="logo-container white">
              <img src="/kissan_mithar_logo_v2.png" alt="Kissan Mithar Logo" className="logo-image" />
              <div className="logo-text-wrapper">
                <span className="logo-name-top">KISSAN</span>
                <span className="logo-name-bottom">MITHAR</span>
                <span className="logo-slogan">• SOW • GROW •</span>
              </div>
            </div>
            <p>
              Empowering millions of Indian farmers with accurate, soil-verified data tailored for maximum harvest. Farm smarter, farm with Mithar.
            </p>
            <div className="contact-details">
              <strong>Kissan Mithar Agrotech Pvt. Ltd.</strong><br />
              Founder & CEO: Ranjith<br />
              Headquarters: Gadwal, Telangana, India<br />
              Farmer Helpline: <a href="tel:+919392699963">+91 9392699963</a>
            </div>
          </div>

          <div className="footer-col">
            <h4>FARMER SERVICES</h4>
            <a href="#services" onClick={() => onNavigateService && onNavigateService('crop-planning')}>Orchard Planning</a>
            <a href="#services" onClick={() => onNavigateService && onNavigateService('fertilizer-guide')}>Soil Nutrition Blueprints</a>
            <a href="#services" onClick={() => onNavigateService && onNavigateService('disease-help')}>Pest Advisory & Control</a>
            <a href="#services" onClick={() => onNavigateService && onNavigateService('expert-consultancy')}>Agri Scientist Live Call</a>
            <a href="#services" onClick={() => onNavigateService && onNavigateService('weather')}>Hyperlocal Village Weather</a>
            <a href="/agri-bazaar">Agri Bazaar Produce Trading</a>
          </div>

          <div className="footer-col">
            <h4>SUPPORTED DIALECTS</h4>
            <span>• English (Global)</span>
            <span>• हिन्दी (Hindi)</span>
            <span>• తెలుగు (Telugu)</span>
            <span>• ಕನ್ನಡ (Kannada)</span>
          </div>

          <div className="footer-col">
            <h4>QUICK LINKS & TRUST</h4>
            <a href="#about">About Kissan Mithar</a>
            <a href="#experts">Agronomist Network</a>
            <a href="/agri-bazaar">Agri Bazaar</a>
            <a href={downloadUrl} target="_blank" rel="noopener noreferrer">Download Android App</a>
            <button type="button" className="footer-admin-link" onClick={onAdminLogin}>
              Admin Desk Login &rarr;
            </button>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2026 Kissan Mithar Agrotech Pvt. Ltd. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
