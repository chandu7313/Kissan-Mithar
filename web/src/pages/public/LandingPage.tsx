import React from 'react';
import './LandingPage.css';
import { 
  Menu, X, Globe, Phone, MapPin, CloudRain, ShieldCheck, 
  Leaf, Star, Download, Play, Quote 
} from 'lucide-react';

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

  return (
    <div className="landing-container">
      {/* Navbar */}
      <nav className="landing-navbar">
        <div className="navbar-content">
          <div className="logo-container">
            <Leaf className="logo-icon" />
            <span className="logo-text">Kissan<br/>Mithar</span>
          </div>

          {/* Desktop Nav */}
          <div className="desktop-nav">
            <a href="#services">Services</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#impact">Proven Impact</a>
            <a href="#stories">Farmer Stories</a>
            <a href="#about">About Us</a>
          </div>

          <div className="navbar-actions">
            <div className="lang-selector">
              <Globe size={16} />
              <span>Shift: English / हिन्दी</span>
            </div>

            <button className="btn-primary get-app-btn">
              Get Free App
            </button>
            
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
            <a href="#services" onClick={() => setMobileMenuOpen(false)}>Services</a>
            <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)}>How It Works</a>
            <a href="#impact" onClick={() => setMobileMenuOpen(false)}>Proven Impact</a>
            <button className="btn-primary full-width" style={{marginTop: '1rem'}}>
              Get Free App
            </button>
            <button className="btn-secondary full-width" onClick={onAdminLogin} style={{marginTop: '0.5rem'}}>
              Admin / Expert Login
            </button>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">
            <ShieldCheck size={16} />
            <span>DIRECT FARMER GUIDANCE & AGRI-ADVISORY</span>
          </div>
          
          <h1 className="hero-title">
            Smart Farming,<br/>
            <span className="text-green">Simple Language.</span>
          </h1>
          
          <p className="hero-subtitle">
            Personalised orchard planning, direct agricultural scientist calls, and 
            hyperlocal weather alerts — delivered in your mother tongue without 
            complicated jargon.
          </p>
          
          <div className="hero-buttons">
            <button className="btn-primary hero-btn">
              <Download size={20} />
              Download KisanMithar App
            </button>
            <button className="btn-outline hero-btn">
              <Phone size={20} />
              Book Free Expert Call
            </button>
          </div>

          <div className="hero-features">
            <span><ShieldCheck size={16} className="text-green"/> Under 15MB lightweight app</span>
            <span><ShieldCheck size={16} className="text-green"/> Works on 2G/3G without lag</span>
            <span><ShieldCheck size={16} className="text-green"/> 100% Free Advisory</span>
          </div>
          
          <div className="hero-rating">
            <div className="avatars">
               {/* Placeholders for farmer faces */}
               <div className="avatar a1"></div>
               <div className="avatar a2"></div>
               <div className="avatar a3"></div>
               <div className="avatar a4"></div>
            </div>
            <div className="rating-text">
              <div className="stars">
                <Star size={16} fill="#FFB800" color="#FFB800" />
                <Star size={16} fill="#FFB800" color="#FFB800" />
                <Star size={16} fill="#FFB800" color="#FFB800" />
                <Star size={16} fill="#FFB800" color="#FFB800" />
                <Star size={16} fill="#FFB800" color="#FFB800" />
              </div>
              <span><strong>4.8</strong> Rating on Google Play Store from over <strong>50,000+ happy farmers</strong></span>
            </div>
          </div>
        </div>

        <div className="hero-image-wrapper">
          <div className="yield-badge">
            <Leaf size={16} className="text-green" />
            <div>
              <span className="badge-title">AVERAGE YIELD</span>
              <span className="badge-value text-green">+35% Increase</span>
            </div>
          </div>
          <div className="hero-image-overlay">
            <div className="soil-badge">
              <ShieldCheck size={16} className="text-green" />
              <span>100% Soil Tested Solutions</span>
            </div>
            <div className="soil-badge orange">
              <span>Available in 4 Dialects</span>
            </div>
          </div>
          <img 
            src="/assets/orchard1.jpeg" 
            alt="Kissan Mithar Farm" 
            className="hero-image"
          />
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="services-section">
        <div className="section-header">
          <span className="section-badge">WHAT WE PROVIDE</span>
          <h2 className="section-title">Our Farmer Services</h2>
          <p className="section-subtitle">
            Engineered specifically for regional farmers with step-by-step guidance and zero 
            complicated terminology.
          </p>
        </div>

        <div className="services-grid">
          {/* Card 1 */}
          <div className="service-card">
            <div className="icon-wrapper green-bg">
              <MapPin size={24} className="text-green" />
            </div>
            <h3>Orchard Planning</h3>
            <p>Customized fruit and nut crop schedules, plantation spacing blueprints, and precise irrigation designs matched directly to your acre size and soil composition.</p>
            <ul className="service-list">
              <li><ShieldCheck size={14} className="text-orange" /> Detailed spacing layout calculations</li>
              <li><ShieldCheck size={14} className="text-orange" /> Intercropping schedule planner</li>
              <li><ShieldCheck size={14} className="text-orange" /> Soil nutrient balancing guide</li>
            </ul>
            <a href="#" className="service-link">Explore Orchard Plans &rarr;</a>
          </div>

          {/* Card 2 */}
          <div className="service-card">
            <div className="icon-wrapper orange-bg">
              <Phone size={24} className="text-orange" />
            </div>
            <h3>Expert Call Request</h3>
            <p>Connect directly with certified agricultural scientists within 15 minutes. Describe problems in a voice note in your regional dialect without typing.</p>
            <ul className="service-list">
              <li><ShieldCheck size={14} className="text-orange" /> Average call back under 15 minutes</li>
              <li><ShieldCheck size={14} className="text-orange" /> Voice-diagnostic for pest issues</li>
              <li><ShieldCheck size={14} className="text-orange" /> Spoken answers in regional languages</li>
            </ul>
            <a href="#" className="service-link">Book Expert Call &rarr;</a>
          </div>

          {/* Card 3 */}
          <div className="service-card">
            <div className="icon-wrapper blue-bg">
              <CloudRain size={24} className="text-blue" />
            </div>
            <h3>Live Hyperlocal Weather</h3>
            <p>Hyper-accurate weather tied to your specific village pin code. Instant warnings for sudden rainfall, hailstorms, frost, and high humidity windows.</p>
            <ul className="service-list">
              <li><ShieldCheck size={14} className="text-blue" /> Village-level 7-day precipitation</li>
              <li><ShieldCheck size={14} className="text-blue" /> Ideal spray & sowing windows</li>
              <li><ShieldCheck size={14} className="text-blue" /> SMS / voice alerts for storm alerts</li>
            </ul>
            <a href="#" className="service-link">View Village Weather &rarr;</a>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="how-it-works-section">
        <div className="section-header">
          <span className="section-badge">SIMPLE PROCESS</span>
          <h2 className="section-title">How Kissan Mithar Works</h2>
          <p className="section-subtitle">
            Four quick steps to boost your farm and yield and cut seasonal crop risks.
          </p>
        </div>

        <div className="timeline-container">
          <div className="timeline-line"></div>
          
          <div className="timeline-step">
            <div className="step-number">1</div>
            <div className="step-icon">
              <MapPin size={24} className="text-orange" />
            </div>
            <h4>Enter Land Details</h4>
            <p>Tell us your location, acres, and water sources in a quick 1-minute voice prompt. Not a single form!</p>
          </div>

          <div className="timeline-step">
            <div className="step-number">2</div>
            <div className="step-icon">
              <Leaf size={24} className="text-green" />
            </div>
            <h4>Select Your Crop</h4>
            <p>Pick your preferred fruits, cereals or get high-yield recommendations tailored to market demand.</p>
          </div>

          <div className="timeline-step">
            <div className="step-number">3</div>
            <div className="step-icon">
              <ShieldCheck size={24} className="text-orange" />
            </div>
            <h4>Get Custom Blueprint</h4>
            <p>Receive day-by-day guidance from sowing to harvest sent straight to your phone with audio alerts.</p>
          </div>

          <div className="timeline-step">
            <div className="step-number">4</div>
            <div className="step-icon">
              <Phone size={24} className="text-orange" />
            </div>
            <h4>Talk to Agri-Experts</h4>
            <p>Direct audio & video advisory whenever you spot leaf discoloration, pests, or irrigation challenges.</p>
          </div>
        </div>
      </section>

      {/* Orchard Gallery Section */}
      <section id="our-work" className="gallery-section">
        <div className="section-header">
          <span className="section-badge">OUR WORK</span>
          <h2 className="section-title">Successful Orchard Planning</h2>
          <p className="section-subtitle">Take a look at some of the thriving orchards our experts have helped plan and cultivate across India.</p>
        </div>
        
        <div className="gallery-grid">
          {[1, 2, 3, 4, 5, 6].map((num) => (
            <div key={num} className="gallery-item">
              <img src={`/assets/orchard${num}.jpeg`} alt={`Kissan Mithar Orchard Project ${num}`} loading="lazy" />
            </div>
          ))}
        </div>
      </section>

      {/* Impact Stats */}
      <section id="impact" className="impact-section">
        <div className="section-header">
          <span className="section-badge">PROVEN IMPACT</span>
          <h2 className="section-title">Growing Trust Across Indian Farmlands</h2>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <h3>50,000+</h3>
            <h4>Happy Farmers</h4>
            <p>Active users across the country</p>
          </div>
          <div className="stat-card">
            <h3>12+ States</h3>
            <h4>Across India</h4>
            <p>Covering major agricultural zones</p>
          </div>
          <div className="stat-card">
            <h3>35%</h3>
            <h4>Average Yield Increase</h4>
            <p>Reported in the 1st year</p>
          </div>
          <div className="stat-card">
            <h3>4.8 <Star size={20} fill="#FFB800" color="#FFB800" style={{display: 'inline', verticalAlign: 'text-bottom'}} /></h3>
            <h4>Play Store Rating</h4>
            <p>From 12,000+ verified farmer reviews</p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="stories" className="stories-section">
        <div className="section-header left-align">
          <span className="section-badge">REAL STORIES</span>
          <div className="header-row">
            <h2 className="section-title">Voices from the Field</h2>
            <span className="audio-badge">Over 12,000+ voice recordings submitted <Play size={14} fill="currentColor" /></span>
          </div>
          <p className="section-subtitle">Real experiences shared by growers using Kissan Mithar every week.</p>
        </div>

        <div className="stories-grid">
          <div className="story-card">
            <div className="stars">
              <Star size={16} fill="#FFB800" color="#FFB800" />
              <Star size={16} fill="#FFB800" color="#FFB800" />
              <Star size={16} fill="#FFB800" color="#FFB800" />
              <Star size={16} fill="#FFB800" color="#FFB800" />
              <Star size={16} fill="#FFB800" color="#FFB800" />
            </div>
            <p className="story-quote">"Kissan Mithar's orchard guidance helped me set up 3 acres of guava with 40% less water usage. The advice on drip lines was completely spot on."</p>
            <div className="story-author">
              <div className="author-avatar green">RP</div>
              <div className="author-info">
                <strong>Ramesh Patil</strong>
                <span>Nashik, Maharashtra • Guava & Grapes</span>
              </div>
            </div>
          </div>

          <div className="story-card">
            <div className="stars">
              <Star size={16} fill="#FFB800" color="#FFB800" />
              <Star size={16} fill="#FFB800" color="#FFB800" />
              <Star size={16} fill="#FFB800" color="#FFB800" />
              <Star size={16} fill="#FFB800" color="#FFB800" />
              <Star size={16} fill="#FFB800" color="#FFB800" />
            </div>
            <p className="story-quote">"Speaking to agri scientists in Punjabi gave me immense confidence during pest attacks. Saved my tomato crop from severe fruit fly damage!"</p>
            <div className="story-author">
              <div className="author-avatar orange">GS</div>
              <div className="author-info">
                <strong>Gurpreet Singh</strong>
                <span>Ludhiana, Punjab • Tomato & Wheat</span>
              </div>
            </div>
          </div>

          <div className="story-card">
            <div className="stars">
              <Star size={16} fill="#FFB800" color="#FFB800" />
              <Star size={16} fill="#FFB800" color="#FFB800" />
              <Star size={16} fill="#FFB800" color="#FFB800" />
              <Star size={16} fill="#FFB800" color="#FFB800" />
              <Star size={16} fill="#FFB800" color="#FFB800" />
            </div>
            <p className="story-quote">"Clear soil analysis and step-by-step drip guidance gave me a record chili harvest this year. Zero technical English, everything in simple Telugu."</p>
            <div className="story-author">
              <div className="author-avatar blue">SK</div>
              <div className="author-info">
                <strong>Suresh Kumar</strong>
                <span>Guntur, Andhra Pradesh • Red Chili & Cotton</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* About Us & Location Section */}
      <section className="landing-section bg-white" id="about">
        <div className="section-content">
          <div className="section-header text-center">
            <h2 className="section-title">About Kissan Mithar</h2>
            <p className="section-subtitle">Founded with a vision to empower every farmer with technology and expert guidance.</p>
          </div>
          
          <div className="about-grid">
            {/* Founder Info */}
            <div className="about-card">
              <div className="founder-profile">
                <div className="founder-avatar">
                  <img src="/assets/ceo&founder.png" alt="Ranjith - CEO & Founder" />
                </div>
                <div>
                  <h3 className="founder-name">Ranjith</h3>
                  <p className="founder-title">CEO & Founder, Kissan Mithar</p>
                </div>
              </div>
              <p className="founder-quote">
                "Growing up closely with agricultural communities, I saw firsthand the challenges farmers face with unpredictable weather, soil degradation, and a lack of timely expert advice. I founded Kissan Mithar to bridge this gap, ensuring that every farmer, regardless of their location, has access to world-class agronomy support right in their pocket."
              </p>
            </div>

            {/* Location & Map */}
            <div className="about-card">
              <div className="location-header">
                <MapPin className="text-green" size={24} />
                <div>
                  <h3 className="location-title">Our Headquarters</h3>
                  <p className="location-subtitle">Hyderabad, Telangana, India</p>
                </div>
              </div>
              <div className="map-container">
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d12182.30520634488!2d78.36830595222033!3d17.4475459384784!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb93dc8c5d69df%3A0x19688beb557fa0ee!2sHITEC%20City%2C%20Hyderabad%2C%20Telangana%20500081!5e0!3m2!1sen!2sin!4v1709210214251!5m2!1sen!2sin" 
                  width="100%" 
                  height="100%" 
                  style={{ border: 0, borderRadius: '8px' }} 
                  allowFullScreen={false} 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade">
                </iframe>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-container">
          <div className="cta-content">
            <span className="cta-badge">START TODAY • FREE ADVISORY</span>
            <h2>Ready for Better Harvests &<br/>Smarter Farming?</h2>
            <p>Join over 50,000 farmers growing smarter with personalized blueprints today. Works smoothly on all basic Android smartphones.</p>
            
            <div className="cta-buttons">
              <button className="btn-light">
                <Download size={20} className="text-green" />
                Download Free APK (15 MB)
              </button>
              <button className="btn-dark">
                <Play size={20} />
                GET IT ON Google Play
              </button>
            </div>
          </div>
          <div className="cta-qr">
            <div className="qr-box">
              {/* Fake QR code visualization */}
              <div className="qr-placeholder"></div>
              <span>Scan to install App</span>
              <span className="small">From official secure servers</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer" id="contact">
        <div className="footer-content">
          <div className="footer-col brand-col">
            <div className="logo-container white">
              <Leaf className="logo-icon" />
              <span className="logo-text">Kissan<br/>Mithar</span>
            </div>
            <p>Empowering millions of Indian farmers with accurate, soil-verified data tailored for maximum harvest. Farm smarter, farm with Mithar.</p>
            <p className="contact-details">
              Registered Office: Hyderabad • +91 9876543210
            </p>
            <div className="footer-helpline">
              <span>Toll-Free Helpline:</span>
              <strong>1800-120-6472</strong>
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
            <a href="#">• हिन्दी (Hindi)</a>
            <a href="#">• ਪੰਜਾਬੀ (Punjabi)</a>
            <a href="#">• मराठी (Marathi)</a>
            <a href="#">• ಕನ್ನಡ (Kannada)</a>
            <a href="#">• తెలుగు (Telugu)</a>
            <a href="#">• ગુજરાતી (Gujarati)</a>
          </div>

          <div className="footer-col">
            <h4>SUPPORT & TRUST</h4>
            <a href="#">About Kissan Mithar</a>
            <a href="#">Partner with Mithar</a>
            <a href="#">NGO & Govt Partners</a>
            <a href="#">Agronomist Network</a>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="language-dropdown-dark">
            <Globe size={16} />
            <span>Shift: English </span>
          </div>
          <p>&copy; 2026 Kissan Mithar Agrotech Pvt. Ltd. All rights reserved. Made with pride for Indian farmers.</p>
        </div>
      </footer>
    </div>
  );
};
