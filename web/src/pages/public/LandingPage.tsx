import React from 'react';
import './LandingPage.css';
import {
  Menu, X, Globe, MapPin, ShieldCheck,
  Star, Download, Play, ArrowRight
} from 'lucide-react';

import { ASSETS } from '../../assets';

interface LandingPageProps {
  onAdminLogin: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onAdminLogin }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  React.useEffect(() => {
    const path = window.location.pathname;
    let targetId = '';

    if (path === '/about') targetId = 'about';
    else if (path === '/services') targetId = 'services';
    else if (path === '/contact') targetId = 'contact';

    if (targetId) {
      setTimeout(() => {
        const el = document.getElementById(targetId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 300);
    }
  }, []);

  const services = [
    {
      title: 'Orchard Planning',
      desc: 'Plan and establish all types of orchards',
      image: ASSETS.SERVICES.ORCHARD_PLANNING,
    },
    {
      title: 'Expert Consultancy',
      desc: 'Talk directly with agriculture experts',
      image: ASSETS.SERVICES.EXPERT_CONSULTANCY,
    },
    {
      title: 'Fertilizer Guide',
      desc: 'Get crop-specific fertilizer recommendations',
      image: ASSETS.SERVICES.FERTILIZERS,
    },
    {
      title: 'Disease Help',
      desc: 'Identify crop problems and get treatment guidance',
      image: ASSETS.SERVICES.DISEASE_HELP,
    },
    {
      title: 'Weather',
      desc: 'Live weather and farming alerts',
      image: ASSETS.SERVICES.WEATHER,
    },
    {
      title: 'Farm Labour',
      desc: 'Find skilled labour for your farm work',
      image: ASSETS.SERVICES.LABOUR,
    },
    {
      title: 'Farm Machinery',
      desc: 'Find tractors, harvesters, drones and more',
      image: ASSETS.SERVICES.MACHINERY,
    },
    {
      title: 'Crop Connect',
      desc: 'Connect with buyers and industries',
      image: ASSETS.SERVICES.CROP_CONNECT,
    },
    {
      title: 'AI Farming Assistant',
      desc: 'Ask any farming question in your language',
      image: ASSETS.SERVICES.AI_ASSISTANT,
    }
  ];

  return (
    <div className="landing-container">
      {/* Navbar */}
      <nav className="landing-navbar">
        <div className="navbar-content">
          <a href="/" className="logo-container">
            <img src="/kissan_mithar_logo_v2.png" alt="Kissan Mithar Logo" className="logo-image" />
            <div className="logo-text-wrapper">
              <span className="logo-name-top">KISSAN</span>
              <span className="logo-name-bottom">MITHAR</span>
              <span className="logo-slogan">• SOW • GROW •</span>
            </div>
          </a>

          {/* Desktop Nav */}
          <div className="desktop-nav">
            <a href="/">Home</a>
            <a href="#services">Services</a>
            <a href="#about">About</a>
            <a href="#farmers">For Farmers</a>
            <a href="#experts">Experts</a>
            <a href="#partners">Partners</a>
            <a href="#contact">Contact</a>
          </div>

          <div className="navbar-actions">
            <a href="https://drive.google.com/uc?export=download&id=1LhJ4mMGZG01RkQp0EtcE-4f2xOJh6gKe" target="_blank" rel="noopener noreferrer" className="btn-primary get-app-btn">
              Download App
            </a>
            <button className="btn-secondary admin-login-btn" onClick={onAdminLogin}>
              Admin Login
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <div className="mobile-nav">
            <a href="/" onClick={() => setMobileMenuOpen(false)}>Home</a>
            <a href="#services" onClick={() => setMobileMenuOpen(false)}>Services</a>
            <a href="#about" onClick={() => setMobileMenuOpen(false)}>About</a>
            <a href="#farmers" onClick={() => setMobileMenuOpen(false)}>For Farmers</a>
            <a href="#experts" onClick={() => setMobileMenuOpen(false)}>Experts</a>
            <a href="#partners" onClick={() => setMobileMenuOpen(false)}>Partners</a>
            <a href="#contact" onClick={() => setMobileMenuOpen(false)}>Contact</a>

            <a href="https://drive.google.com/uc?export=download&id=1LhJ4mMGZG01RkQp0EtcE-4f2xOJh6gKe" target="_blank" rel="noopener noreferrer" className="btn-primary full-width" style={{ marginTop: '1rem', textDecoration: 'none' }}>
              Download App
            </a>
            <button className="btn-secondary full-width" onClick={onAdminLogin} style={{ marginTop: '0.5rem' }}>
              Admin / Expert Login
            </button>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="hero-section" style={{
        backgroundImage: `url('/assets/hero-image.png')`,
        backgroundSize: 'cover',
        backgroundPosition: '75% center', // Shifted left
        backgroundRepeat: 'no-repeat',
        position: 'relative',
        minHeight: '70vh',
        display: 'flex',
        alignItems: 'center',
        padding: '0 5%',
        paddingTop: '60px',
      }}>
        {/* Soft White Shadow Overlay */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          width: '70%',
          background: 'linear-gradient(to right, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.4) 30%, rgba(255,255,255,0) 100%)',
          pointerEvents: 'none',
          zIndex: 1
        }} />

        <div style={{
          position: 'absolute',
          top: '30px',
          right: '5%',
          background: 'rgba(255, 255, 255, 0.9)',
          borderRadius: '30px',
          display: 'flex',
          overflow: 'hidden',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <button style={{ padding: '8px 16px', border: 'none', background: 'transparent', fontWeight: 'bold', cursor: 'pointer' }}>EN</button>
          <button style={{ padding: '8px 16px', border: 'none', background: 'transparent', cursor: 'pointer' }}>తెలుగు</button>
          <button style={{ padding: '8px 16px', border: 'none', background: 'transparent', cursor: 'pointer' }}>हिंदी</button>
        </div>

        <div style={{
          position: 'relative',
          display: 'flex',
          justifyContent: 'flex-start', // Align text to left, card will be absolute
          alignItems: 'center',
          width: '100%',
          maxWidth: '1280px',
          margin: '0 auto',
          paddingBottom: '20px',
          minHeight: '500px' // Give it enough height to place the card at the bottom
        }}>
          {/* Left Text Content */}
          <div style={{
            textAlign: 'left',
            maxWidth: '590px',
            zIndex: 5,
            padding: '2rem 0'
          }}>
            <h1 style={{
              fontSize: '4rem',
              fontWeight: 900,
              lineHeight: 1.1,
              color: '#0f172a',
              marginBottom: '1.25rem',
              fontFamily: 'Outfit, sans-serif',
              letterSpacing: '0.03em'
            }}>
              Everything Your<br />
              Farm Needs.<br />
              One Trusted Platform.
            </h1>
            <p style={{
              fontSize: '1.125rem',
              color: '#1e293b',
              lineHeight: 1.6,
              marginBottom: '2.5rem',
              fontWeight: 500,
              maxWidth: '520px'
            }}>
              Expert advice, weather, machinery, labour, crop guidance and market connections — all in one place.
            </p>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2.5rem' }}>
              <a href="https://drive.google.com/uc?export=download&id=1LhJ4mMGZG01RkQp0EtcE-4f2xOJh6gKe" target="_blank" rel="noopener noreferrer" style={{
                display: 'inline-flex', alignItems: 'center', background: '#166534', color: 'white', padding: '14px 28px', borderRadius: '12px', fontWeight: 600, textDecoration: 'none', fontSize: '1rem'
              }}>
                <Play size={20} style={{ marginRight: '8px', fill: 'white' }} />
                Download App
              </a>
              <a href="#services" style={{
                display: 'inline-flex', alignItems: 'center', background: 'white', color: '#0f172a', padding: '14px 28px', borderRadius: '12px', fontWeight: 600, textDecoration: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', fontSize: '1rem'
              }}>
                Explore Services
              </a>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <img src="https://ui-avatars.com/api/?name=Farmer&background=166534&color=fff&size=32" alt="F" style={{ borderRadius: '50%', border: '2px solid white', marginLeft: 0 }} />
                <img src="https://ui-avatars.com/api/?name=User&background=ea580c&color=fff&size=32" alt="U" style={{ borderRadius: '50%', border: '2px solid white', marginLeft: '-12px' }} />
                <img src="https://ui-avatars.com/api/?name=Agri&background=2563eb&color=fff&size=32" alt="A" style={{ borderRadius: '50%', border: '2px solid white', marginLeft: '-12px' }} />
                <img src="https://ui-avatars.com/api/?name=Plus&background=64748b&color=fff&size=32" alt="P" style={{ borderRadius: '50%', border: '2px solid white', marginLeft: '-12px' }} />
              </div>
              <span style={{ fontSize: '1.05rem', fontWeight: 700, color: 'white', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>50,000+ Farmers Trust Us</span>
            </div>
          </div>

          {/* Right AI Bot Card */}
          <div style={{
            position: 'absolute',
            bottom: '80px',
            right: '-80px',
            background: 'white',
            padding: '1.5rem',
            borderRadius: '20px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            width: '360px', // Narrower to save space
            zIndex: 10
          }}>
            {/* The AI Bot Image poking out */}
            <img src="/assets/ai-bot.png" alt="AI Bot" className="ai-bot-animated" style={{
              position: 'absolute',
              top: '-100px',
              right: '15px',
              width: '130px',
              height: 'auto',
              zIndex: 11,
              filter: 'drop-shadow(0px 15px 25px rgba(0,0,0,0.2))'
            }} />

            <h4 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem', fontFamily: 'Outfit, sans-serif' }}>Ask AI Farming Assistant</h4>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '0.875rem 1.25rem'
            }}>
              <p style={{ fontSize: '0.9375rem', color: '#94a3b8', margin: 0, flex: 1, paddingRight: '1rem' }}>
                Ask about your crop, disease, fertilizer, weather or any farming problem...
              </p>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#166534', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                <ArrowRight size={20} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="stats-bar">
        <div className="stats-bar-inner">
          <div className="stat-item">
            <div className="stat-icon"><img src="https://img.icons8.com/color/48/000000/farmer-male.png" alt="icon" style={{ width: 24 }} /></div>
            <div className="stat-text">
              <div className="stat-number">50K+</div>
              <div className="stat-label">Farmers</div>
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-icon"><img src="https://img.icons8.com/color/48/000000/scientist-male.png" alt="icon" style={{ width: 24 }} /></div>
            <div className="stat-text">
              <div className="stat-number">500+</div>
              <div className="stat-label">Experts</div>
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-icon"><img src="https://img.icons8.com/color/48/000000/labour-day.png" alt="icon" style={{ width: 24 }} /></div>
            <div className="stat-text">
              <div className="stat-number">2K+</div>
              <div className="stat-label">Labour</div>
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-icon"><img src="https://img.icons8.com/color/48/000000/tractor.png" alt="icon" style={{ width: 24 }} /></div>
            <div className="stat-text">
              <div className="stat-number">800+</div>
              <div className="stat-label">Machinery</div>
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-icon"><img src="https://img.icons8.com/color/48/000000/money-bag.png" alt="icon" style={{ width: 24 }} /></div>
            <div className="stat-text">
              <div className="stat-number">1K+</div>
              <div className="stat-label">Buyers</div>
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-icon"><MapPin size={24} color="#166534" /></div>
            <div className="stat-text">
              <div className="stat-number">25+</div>
              <div className="stat-label">Districts</div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="services-section">
        <div className="services-top-row">
          <div className="section-header left-align">
            <h2 className="section-title">Our Services</h2>
            <p className="section-subtitle">
              Complete support for your farming journey
            </p>
          </div>
          <a href="#" className="view-all-link">
            View All Services <ArrowRight size={16} />
          </a>
        </div>

        <div className="services-grid">
          {services.map((service, idx) => (
            <div key={idx} className="service-card">
              <div className="service-card-image">
                <img src={service.image} alt={service.title} />
              </div>
              <div className="service-card-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3>{service.title}</h3>
                    <p>{service.desc}</p>
                  </div>
                  <div className="service-card-arrow">
                    <ArrowRight size={18} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Seed to Sale Journey */}
      <section className="journey-section">

        <div className="journey-image-container" style={{
          textAlign: 'center',
          marginTop: '3rem',
          width: '100vw',
          marginLeft: 'calc(-50vw + 50%)'
        }}>
          <img
            src={ASSETS.WORKFLOW_IMAGE}
            alt="Agricultural Workflow from Plan to Sell"
            style={{
              width: '100%',
              height: 'auto',
              WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
              maskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)'
            }}
          />
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="how-it-works-section">
        <div className="section-header">
          <h2 className="section-title">How It Works</h2>
          <p className="section-subtitle">
            Get the help you need in just a few simple steps
          </p>
        </div>

        <div className="timeline-container">
          <div className="timeline-step">
            <div className="step-number">1</div>
            <div className="step-icon">
              <img src="https://img.icons8.com/color/96/000000/smartphone.png" alt="Download" style={{ width: 32 }} />
            </div>
            <h4>Download App</h4>
            <p>Install Kissan Mithar app</p>
          </div>

          <div className="timeline-step">
            <div className="step-number">2</div>
            <div className="step-icon">
              <img src="https://img.icons8.com/color/96/000000/field.png" alt="Farm" style={{ width: 32 }} />
            </div>
            <h4>Set Up Your Farm</h4>
            <p>Add your land & crops</p>
          </div>

          <div className="timeline-step">
            <div className="step-number">3</div>
            <div className="step-icon">
              <img src="https://img.icons8.com/color/96/000000/farmer-male.png" alt="Service" style={{ width: 32 }} />
            </div>
            <h4>Choose a Service</h4>
            <p>Get advice, labour, machinery or connect buyers</p>
          </div>

          <div className="timeline-step">
            <div className="step-number">4</div>
            <div className="step-icon">
              <img src="https://img.icons8.com/color/96/000000/sprout.png" alt="Grow" style={{ width: 32 }} />
            </div>
            <h4>Get Results</h4>
            <p>Grow better, earn more</p>
          </div>
        </div>
      </section>

      {/* App Promo Section */}
      <section className="app-promo-section" style={{
        backgroundImage: `url('/assets/hero-image.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        padding: '4rem 5%',
        overflow: 'hidden',
        minHeight: '80vh',
        width: '100vw',
        marginLeft: 'calc(-50vw + 50%)'
      }}>
        {/* Soft White Shadow Overlay */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          width: '60%',
          background: 'linear-gradient(to right, rgba(255,255,255,1) 0%, rgba(255,255,255,0.9) 50%, rgba(255,255,255,0) 100%)',
          pointerEvents: 'none',
          zIndex: 1
        }} />

        {/* Content Container */}
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', width: '100%', maxWidth: '1280px', margin: '0 auto', alignItems: 'center' }}>
          
          {/* Left Text */}
          <div style={{ flex: 1, paddingRight: '2rem' }}>
            <h2 style={{ fontSize: '3.5rem', fontWeight: 900, color: '#0f172a', lineHeight: 1.2, marginBottom: '1rem', fontFamily: 'Outfit, sans-serif' }}>
              Your Farm Assistant.<br />In Your Pocket.
            </h2>
            <p style={{ fontSize: '1.25rem', color: '#334155', marginBottom: '2.5rem', fontWeight: 500 }}>
              Download the Kissan Mithar mobile app
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '3rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontWeight: 600, color: '#1e293b' }}>
                <img src={ASSETS.SERVICES.EXPERT_CONSULTANCY} style={{ width: 28 }} alt="icon" /> Expert Advice
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontWeight: 600, color: '#1e293b' }}>
                <img src={ASSETS.SERVICES.WEATHER} style={{ width: 28 }} alt="icon" /> Weather Alerts
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontWeight: 600, color: '#1e293b' }}>
                <img src={ASSETS.SERVICES.ORCHARD_PLANNING} style={{ width: 28 }} alt="icon" /> Crop Guidance
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontWeight: 600, color: '#1e293b' }}>
                <img src={ASSETS.SERVICES.MACHINERY} style={{ width: 28 }} alt="icon" /> Labour & Machinery
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontWeight: 600, color: '#1e293b' }}>
                <img src={ASSETS.SERVICES.CROP_CONNECT} style={{ width: 28 }} alt="icon" /> Crop Connect
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontWeight: 600, color: '#1e293b' }}>
                <img src={ASSETS.SERVICES.AI_ASSISTANT} style={{ width: 28 }} alt="icon" /> AI Assistant
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
              <a href="#" style={{ display: 'block' }}>
                <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Google Play" style={{ height: '60px' }} />
              </a>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'white', padding: '0.5rem', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https%3A%2F%2Fplay.google.com" alt="QR" style={{ width: '60px', height: '60px', borderRadius: '8px' }} />
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#64748b', paddingRight: '0.5rem' }}>Scan to Download</span>
              </div>
            </div>
          </div>
          
          {/* Right Phone Image */}
          <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', position: 'relative' }}>
            <img src={ASSETS.MOBILE_APP} alt="Mobile App" style={{ maxWidth: '400px', width: '100%', height: 'auto', filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.2))' }} />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="stories" className="stories-section">
        <div className="section-header left-align">
          <div className="header-row">
            <h2 className="section-title">What Farmers Say</h2>
            <a href="#" className="view-all-link" style={{ border: 'none' }}>View More &rarr;</a>
          </div>
          <p className="section-subtitle" style={{ margin: 0, textAlign: 'left' }}>Real farmers. Real stories.</p>
        </div>

        <div className="stories-grid">
          <div className="story-card">
            <p className="story-quote">"మొబైల్ యాప్‌లో ఆర్కిడ్ ప్లానింగ్ ద్వారా నా మామిడి తోటలో రెండు అడుగుల స్థలం ఎలా ఉపయోగించుకోవాలో తెలిసింది."</p>
            <div className="stars">
              <Star size={16} fill="#FFB800" color="#FFB800" />
              <Star size={16} fill="#FFB800" color="#FFB800" />
              <Star size={16} fill="#FFB800" color="#FFB800" />
              <Star size={16} fill="#FFB800" color="#FFB800" />
              <Star size={16} fill="#FFB800" color="#FFB800" />
            </div>
            <div className="story-author">
              <div className="author-avatar"><img src="https://ui-avatars.com/api/?name=Ramesh&background=166534&color=fff" style={{ borderRadius: '50%' }} alt="Ramesh" /></div>
              <div className="author-info">
                <strong>Ramesh</strong>
                <span>Mango Farmer, Nalgonda</span>
              </div>
            </div>
          </div>

          <div className="story-card">
            <p className="story-quote">"Expert guidance helped me save my crop from disease."</p>
            <div className="stars">
              <Star size={16} fill="#FFB800" color="#FFB800" />
              <Star size={16} fill="#FFB800" color="#FFB800" />
              <Star size={16} fill="#FFB800" color="#FFB800" />
              <Star size={16} fill="#FFB800" color="#FFB800" />
              <Star size={16} fill="#FFB800" color="#FFB800" />
            </div>
            <div className="story-author">
              <div className="author-avatar"><img src="https://ui-avatars.com/api/?name=Suresh&background=ea580c&color=fff" style={{ borderRadius: '50%' }} alt="Suresh" /></div>
              <div className="author-info">
                <strong>Suresh</strong>
                <span>Cotton Farmer, Gadwal</span>
              </div>
            </div>
          </div>

          <div className="story-card">
            <p className="story-quote">"Found harvester on time at reasonable price."</p>
            <div className="stars">
              <Star size={16} fill="#FFB800" color="#FFB800" />
              <Star size={16} fill="#FFB800" color="#FFB800" />
              <Star size={16} fill="#FFB800" color="#FFB800" />
              <Star size={16} fill="#FFB800" color="#FFB800" />
              <Star size={16} fill="#FFB800" color="#FFB800" />
            </div>
            <div className="story-author">
              <div className="author-avatar"><img src="https://ui-avatars.com/api/?name=Mahesh&background=2563eb&color=fff" style={{ borderRadius: '50%' }} alt="Mahesh" /></div>
              <div className="author-info">
                <strong>Mahesh</strong>
                <span>Paddy Farmer, Narayanpet</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section id="partners" className="partners-section">
        <h3>Our Partners</h3>
        <p>Working together for a stronger agriculture ecosystem</p>

        <div className="partners-grid">
          <div className="partner-item">
            <div className="partner-icon">🏛️</div>
            <span>Government</span>
          </div>
          <div className="partner-item">
            <div className="partner-icon">👥</div>
            <span>FPOs</span>
          </div>
          <div className="partner-item">
            <div className="partner-icon">🎓</div>
            <span>Agricultural<br />Universities</span>
          </div>
          <div className="partner-item">
            <div className="partner-icon">🏢</div>
            <span>Agri<br />Companies</span>
          </div>
          <div className="partner-item">
            <div className="partner-icon">🤝</div>
            <span>NGOs</span>
          </div>
          <div className="partner-item">
            <div className="partner-icon">🏭</div>
            <span>Factories</span>
          </div>
          <div className="partner-item">
            <div className="partner-icon">🚢</div>
            <span>Exporters</span>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-container">
          <div className="cta-content">
            <h2 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Let's Build a Stronger Farming Future Together</h2>
            <p style={{ margin: 0, color: 'rgba(255,255,255,0.8)' }}>Join thousands of farmers who are growing better with Kissan Mithar.</p>
          </div>
          <div className="cta-buttons">
            <a href="https://drive.google.com/uc?export=download&id=1LhJ4mMGZG01RkQp0EtcE-4f2xOJh6gKe" target="_blank" rel="noopener noreferrer" className="btn-light">
              Download App
            </a>
            <a href="#contact" className="btn-dark" style={{ textDecoration: 'none' }}>
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
            <p>Empowering millions of Indian farmers with accurate, soil-verified data tailored for maximum harvest. Farm smarter, farm with Mithar.</p>
            <p className="contact-details">
              Registered Office: Hyderabad • +91 9392699963
            </p>
          </div>

          <div className="footer-col">
            <h4>FARMER SERVICES</h4>
            <a href="#">Orchard Planning</a>
            <a href="#">Soil Nutrition Blueprints</a>
            <a href="#">Pest Advisory & Control</a>
            <a href="#">Agri Scientist Live Call</a>
            <a href="#">Hyperlocal Village Weather</a>
            <a href="#">Mandi Price Tracking</a>
          </div>

          <div className="footer-col">
            <h4>SUPPORTED DIALECTS</h4>
            <a href="#">• English</a>
            <a href="#">• हिन्दी (Hindi)</a>
            <a href="#">• ಕನ್ನಡ (Kannada)</a>
            <a href="#">• తెలుగు (Telugu)</a>
          </div>

          <div className="footer-col">
            <h4>SUPPORT & TRUST</h4>
            <a href="#">About Kissan Mithar</a>
            <a href="#">Agronomist Network</a>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="language-dropdown-dark">
            <Globe size={16} />
            <span>EN </span>
            <span style={{ fontFamily: 'sans-serif' }}>తెలుగు </span>
            <span style={{ fontFamily: 'sans-serif' }}>हिंदी</span>
          </div>
          <p>&copy; 2026 Kissan Mithar Agrotech Pvt. Ltd. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
