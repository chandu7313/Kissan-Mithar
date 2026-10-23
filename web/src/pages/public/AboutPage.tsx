import React, { useEffect } from 'react';
import { PublicNavbar } from '../../components/layout/PublicNavbar.js';
import { AboutSection } from '../../components/public/AboutSection.js';
import './LandingPage.css';

interface AboutPageProps {
  onNavigateHome: () => void;
  onAdminLogin: () => void;
  onNavigateSection?: (sectionId: string) => void;
  onNavigateService?: (slug: string) => void;
  onNavigatePartnerships?: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({
  onNavigateHome,
  onAdminLogin,
  onNavigateSection,
  onNavigateService,
  onNavigatePartnerships,
}) => {
  useEffect(() => {
    document.title = 'About Us | Kissan Mithar - Empowering Farmers for a Brighter Tomorrow';
    window.scrollTo(0, 0);
  }, []);

  const downloadUrl = "https://drive.google.com/uc?export=download&id=1LhJ4mMGZG01RkQp0EtcE-4f2xOJh6gKe";

  return (
    <div className="landing-container" style={{ background: '#fbfdfc', minHeight: '100vh' }}>
      {/* Top Navbar */}
      <PublicNavbar
        onAdminLogin={onAdminLogin}
        transparent={false}
        onNavigateSection={onNavigateSection}
        activeBottomTab="home"
        onNavigateService={onNavigateService}
      />

      {/* Main About Content (Rendered with crisp, minimal border-radius) */}
      <main style={{ paddingTop: '5.5rem' }}>
        <AboutSection onNavigatePartnerships={onNavigatePartnerships} />
      </main>

      {/* Landing Footer */}
      <footer className="landing-footer" id="contact" style={{ marginTop: '3rem' }}>
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
              <strong>Kissan Mithar Private Limited.</strong><br />
              CEO & Founder: G. Chandu<br />
              Headquarters: Telangana, India<br />
              Farmer Helpline: <a href="tel:+919392699963">+91 9392699963</a><br />
              Email: <a href="mailto:contact@kissanmithar.com">contact@kissanmithar.com</a>
            </div>
          </div>

          <div className="footer-col">
            <h4>FARMER SERVICES</h4>
            <a href="#services" onClick={(e) => { e.preventDefault(); onNavigateService && onNavigateService('crop-planning'); }}>Orchard Planning</a>
            <a href="#services" onClick={(e) => { e.preventDefault(); onNavigateService && onNavigateService('fertilizer-guide'); }}>Soil Nutrition Blueprints</a>
            <a href="#services" onClick={(e) => { e.preventDefault(); onNavigateService && onNavigateService('disease-help'); }}>Pest Advisory & Control</a>
            <a href="#services" onClick={(e) => { e.preventDefault(); onNavigateService && onNavigateService('expert-consultancy'); }}>Agri Scientist Live Call</a>
            <a href="#services" onClick={(e) => { e.preventDefault(); onNavigateService && onNavigateService('weather'); }}>Hyperlocal Village Weather</a>
            <a href="/agri-bazaar" onClick={(e) => { e.preventDefault(); onNavigateSection && onNavigateSection('agri-bazaar'); }}>Agri Bazaar Produce Trading</a>
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
            <a href="/" onClick={(e) => { e.preventDefault(); onNavigateHome(); }}>Home</a>
            <a href="/about" style={{ color: '#22c55e', fontWeight: 700 }}>About Kissan Mithar</a>
            <a href="/agri-bazaar" onClick={(e) => { e.preventDefault(); onNavigateSection && onNavigateSection('agri-bazaar'); }}>Agri Bazaar</a>
            <a
              href="/partnerships"
              onClick={(e) => {
                e.preventDefault();
                if (onNavigatePartnerships) onNavigatePartnerships();
                else if (onNavigateSection) onNavigateSection('partnerships');
              }}
            >
              Partnership Opportunities
            </a>
            <a href={downloadUrl} target="_blank" rel="noopener noreferrer">Download Android App</a>
            <button type="button" className="footer-admin-link" onClick={onAdminLogin}>
              Staff / Admin Portal →
            </button>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Kissan Mithar Private Limited. All rights reserved.</p>
          <div className="footer-links">
            <a href="#privacy">Privacy Policy</a>
            <span>•</span>
            <a href="#terms">Terms of Service</a>
            <span>•</span>
            <a href="#security">Security</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
export default AboutPage;
