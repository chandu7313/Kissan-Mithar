import React from 'react';
import './LandingPage.css';
import {
  Menu, X, Globe, MapPin, ShieldCheck,
  Star, Download, Play, ArrowRight,
  Users, Award, Tractor, Handshake,
  Sprout, Briefcase, Package, CloudSun, Link, Bot, Leaf
} from 'lucide-react';

import { ASSETS } from '../../assets';
import { PublicNavbar } from '../../components/layout/PublicNavbar';

interface LandingPageProps {
  onAdminLogin: () => void;
  onNavigateService?: (slug: string) => void;
  onNavigateSection?: (sectionId: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onAdminLogin, onNavigateService, onNavigateSection }) => {
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
      slug: 'crop-planning',
      title: 'Orchard & Crop Planning',
      desc: 'Plan and establish all types of crops and orchards with location-specific recommendations.',
      image: ASSETS.SERVICES.ORCHARD_PLANNING,
      icon: <Leaf size={24} />,
      tags: ['Soil Analysis', 'Crop Selection', 'Yield Planning'],
      popular: true,
      span: 4
    },
    {
      slug: 'expert-consultancy',
      title: 'Expert Consultancy',
      desc: 'Get advice directly from agriculture experts via call or chat.',
      image: ASSETS.SERVICES.EXPERT_CONSULTANCY,
      icon: <Briefcase size={24} />,
      tags: ['Crop Advisory', 'Video/Call', 'On-field Visit'],
      span: 4
    },
    {
      slug: 'fertilizer-guide',
      title: 'Fertilizer Guide',
      desc: 'Get crop-specific fertilizer recommendations for better growth and higher yield.',
      image: ASSETS.SERVICES.FERTILIZERS,
      icon: <Package size={24} />,
      tags: ['Balanced Nutrition', 'Dosage Guide', 'Cost Saving'],
      span: 4
    },
    {
      slug: 'disease-help',
      title: 'Disease Help',
      desc: 'Identify crop problems and get treatment guidance.',
      image: ASSETS.SERVICES.DISEASE_HELP,
      icon: <ShieldCheck size={24} />,
      span: 3
    },
    {
      slug: 'weather',
      title: 'Weather',
      desc: 'Live weather updates and farming alerts for your location.',
      image: ASSETS.SERVICES.WEATHER,
      icon: <CloudSun size={24} />,
      span: 3
    },
    {
      slug: 'farm-labour',
      title: 'Farm Labour',
      desc: 'Find skilled labour for your farm work.',
      image: ASSETS.SERVICES.LABOUR,
      icon: <Users size={24} />,
      span: 3
    },
    {
      slug: 'farm-machinery',
      title: 'Farm Machinery',
      desc: 'Find tractors, harvesters, drones and more on rent or purchase.',
      image: ASSETS.SERVICES.MACHINERY,
      icon: <Tractor size={24} />,
      span: 3
    },
    {
      slug: 'crop-connect',
      title: 'Crop Connect',
      desc: 'Connect with buyers, traders and industries for better prices.',
      image: ASSETS.SERVICES.CROP_CONNECT,
      icon: <Link size={24} />,
      span: 3
    },
    {
      slug: 'ai-farming-assistant',
      title: 'AI Farming Assistant',
      desc: 'Ask any farming question in your language.',
      image: ASSETS.SERVICES.AI_ASSISTANT,
      icon: <Bot size={24} />,
      span: 3
    }
  ];

  return (
    <div className="landing-container">
      <PublicNavbar onAdminLogin={onAdminLogin} transparent={true} onNavigateSection={onNavigateSection} />

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
              fontSize: '4.5rem',
              fontWeight: 900,
              lineHeight: 1.1,
              color: '#0f172a',
              marginBottom: '1.25rem',
              fontFamily: 'Outfit, sans-serif',
              letterSpacing: '-0.02em'
            }}>
              Everything Your<br />
              Farm Needs.<br />
              <span style={{ color: '#166534' }}>One Trusted Platform.</span>
            </h1>
            <p style={{
              fontSize: '1.25rem',
              color: '#334155',
              lineHeight: 1.6,
              marginBottom: '2.5rem',
              fontWeight: 500,
              maxWidth: '560px'
            }}>
              Expert advice, weather updates, machinery, labour, crop guidance and market connections — all seamlessly accessible in one place.
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
            <div className="stat-icon"><Users size={24} /></div>
            <div className="stat-text">
              <div className="stat-number">50K+</div>
              <div className="stat-label">Farmers</div>
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-icon"><Award size={24} /></div>
            <div className="stat-text">
              <div className="stat-number">500+</div>
              <div className="stat-label">Experts</div>
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-icon"><Handshake size={24} /></div>
            <div className="stat-text">
              <div className="stat-number">2K+</div>
              <div className="stat-label">Labour</div>
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-icon"><Tractor size={24} /></div>
            <div className="stat-text">
              <div className="stat-number">800+</div>
              <div className="stat-label">Machinery</div>
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-icon"><ShieldCheck size={24} /></div>
            <div className="stat-text">
              <div className="stat-number">1K+</div>
              <div className="stat-label">Buyers</div>
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-icon"><MapPin size={24} /></div>
            <div className="stat-text">
              <div className="stat-number">25+</div>
              <div className="stat-label">Districts</div>
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
              From soil to sale, Kissan Mithar provides expert guidance,<br />resources and real-time support at every stage.
            </p>
          </div>

        </div>

        <div className="bento-grid">
          {services.map((service, idx) => (
            <div 
              key={idx} 
              className={`bento-card bento-span-${service.span} ${onNavigateService && service.slug ? 'cursor-pointer hover-lift' : ''}`}
              onClick={() => onNavigateService && service.slug && onNavigateService(service.slug)}
            >
              <div className="bento-image-wrapper">
                {service.popular && (
                  <div className="popular-badge"><Star size={12} fill="#166534" /> Popular</div>
                )}
                <img src={service.image} alt={service.title} />
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
                  <div className="commitment-stat-icon"><Users size={28} /></div>
                  <div className="commitment-stat-text">
                    <strong>50K+</strong>
                    <span>Farmers</span>
                  </div>
                </div>
                <div className="commitment-stat">
                  <div className="commitment-stat-icon"><Award size={28} /></div>
                  <div className="commitment-stat-text">
                    <strong>500+</strong>
                    <span>Experts</span>
                  </div>
                </div>
                <div className="commitment-stat">
                  <div className="commitment-stat-icon"><MapPin size={28} /></div>
                  <div className="commitment-stat-text">
                    <strong>25+</strong>
                    <span>Districts</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="commitment-image">
              <Sprout size={120} color="#166534" strokeWidth={1} style={{ opacity: 0.1, transform: 'translate(20px, 20px)' }} />
            </div>
          </div>
        </div>
      </section>

      {/* Seed to Sale Journey */}
      <section id="about" className="journey-section">

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
      <section id="experts" className="how-it-works-section">
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
      <section id="farmers" className="app-promo-section" style={{ background: '#ffffff', padding: '6rem 5%' }}>
        <div style={{ display: 'flex', width: '100%', maxWidth: '1280px', margin: '0 auto', alignItems: 'center', gap: '4rem' }}>

          {/* Left Text */}
          <div style={{ flex: 1, zIndex: 2 }}>
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
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <img src={ASSETS.MOBILE_APP} alt="Mobile App" style={{
              width: '100%',
              maxWidth: '450px',
              height: 'auto',
              filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.08))'
            }} />
          </div>
        </div>
      </section>


      {/* Testimonials */}
      <section id="partners" className="stories-section">
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
            <div className="contact-details" style={{ marginTop: '1rem', lineHeight: '1.6' }}>
              <strong>Kissan Mithar Agrotech Pvt. Ltd.</strong><br />
              Founder & CEO: Ranjith<br />
              Location: Gadwal, Telangana<br />
              Mobile: +91 9392699963
            </div>
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
