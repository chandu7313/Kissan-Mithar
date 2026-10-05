import React from 'react';
import { Menu, X } from 'lucide-react';
import '../../pages/public/LandingPage.css'; // Ensure navbar styles are available

interface PublicNavbarProps {
  onAdminLogin?: () => void;
  transparent?: boolean;
  onNavigateSection?: (sectionId: string) => void;
}

export const PublicNavbar: React.FC<PublicNavbarProps> = ({ onAdminLogin, transparent = false, onNavigateSection }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [isVisible, setIsVisible] = React.useState(true);
  const [isAtTop, setIsAtTop] = React.useState(true);
  const lastScrollY = React.useRef(0);

  React.useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Check if at the top
      setIsAtTop(currentScrollY < 50);

      // Determine visibility
      if (currentScrollY > 150) {
        if (currentScrollY > lastScrollY.current) {
          // Scrolling down
          setIsVisible(false);
          setMobileMenuOpen(false); // Close mobile menu if open
        } else {
          // Scrolling up
          setIsVisible(true);
        }
      } else {
        // Always show near top
        setIsVisible(true);
      }
      
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <nav 
        className={`landing-navbar ${transparent && isAtTop ? 'bg-transparent' : 'bg-white shadow-sm'}`} 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          transform: isVisible ? 'translateY(0)' : 'translateY(-100%)',
          transition: 'transform 0.3s ease-in-out, background-color 0.3s ease-in-out'
        }}
      >
        <div className="navbar-content">
          <a href="/" className="logo-container" onClick={(e) => {
            if (onNavigateSection) { e.preventDefault(); onNavigateSection('home'); }
          }}>
            <img src="/kissan_mithar_logo_v2.png" alt="Kissan Mithar Logo" className="logo-image" />
            <div className="logo-text-wrapper">
              <span className="logo-name-top">KISSAN</span>
              <span className="logo-name-bottom">MITHAR</span>
              <span className="logo-slogan">• SOW • GROW •</span>
            </div>
          </a>

          {/* Desktop Nav */}
          <div className="desktop-nav">
            <a href="/" onClick={(e) => {
              if (onNavigateSection) { e.preventDefault(); onNavigateSection('home'); }
            }}>Home</a>
            <a href="/services" onClick={(e) => {
              if (onNavigateSection) { e.preventDefault(); onNavigateSection('services'); }
            }}>Services</a>
            <a href="/about" onClick={(e) => {
              if (onNavigateSection) { e.preventDefault(); onNavigateSection('about'); }
            }}>About</a>
            <a href="/farmers" onClick={(e) => {
              if (onNavigateSection) { e.preventDefault(); onNavigateSection('farmers'); }
            }}>For Farmers</a>
            <a href="/experts" onClick={(e) => {
              if (onNavigateSection) { e.preventDefault(); onNavigateSection('experts'); }
            }}>Experts</a>
            <a href="/partners" onClick={(e) => {
              if (onNavigateSection) { e.preventDefault(); onNavigateSection('partners'); }
            }}>Partners</a>
            <a href="/contact" onClick={(e) => {
              if (onNavigateSection) { e.preventDefault(); onNavigateSection('contact'); }
            }}>Contact</a>
          </div>

          <div className="navbar-actions">
            <a href="https://drive.google.com/uc?export=download&id=1LhJ4mMGZG01RkQp0EtcE-4f2xOJh6gKe" target="_blank" rel="noopener noreferrer" className="btn-primary get-app-btn">
              Download App
            </a>
            {onAdminLogin && (
              <button className="btn-secondary admin-login-btn" onClick={onAdminLogin}>
                Admin Login
              </button>
            )}
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
            <a href="/" onClick={(e) => {
              setMobileMenuOpen(false);
              if (onNavigateSection) { e.preventDefault(); onNavigateSection('home'); }
            }}>Home</a>
            <a href="/services" onClick={(e) => {
              setMobileMenuOpen(false);
              if (onNavigateSection) { e.preventDefault(); onNavigateSection('services'); }
            }}>Services</a>
            <a href="/about" onClick={(e) => {
              setMobileMenuOpen(false);
              if (onNavigateSection) { e.preventDefault(); onNavigateSection('about'); }
            }}>About</a>
            <a href="/farmers" onClick={(e) => {
              setMobileMenuOpen(false);
              if (onNavigateSection) { e.preventDefault(); onNavigateSection('farmers'); }
            }}>For Farmers</a>
            <a href="/experts" onClick={(e) => {
              setMobileMenuOpen(false);
              if (onNavigateSection) { e.preventDefault(); onNavigateSection('experts'); }
            }}>Experts</a>
            <a href="/partners" onClick={(e) => {
              setMobileMenuOpen(false);
              if (onNavigateSection) { e.preventDefault(); onNavigateSection('partners'); }
            }}>Partners</a>
            <a href="/contact" onClick={(e) => {
              setMobileMenuOpen(false);
              if (onNavigateSection) { e.preventDefault(); onNavigateSection('contact'); }
            }}>Contact</a>
            
            <a href="https://drive.google.com/uc?export=download&id=1LhJ4mMGZG01RkQp0EtcE-4f2xOJh6gKe" target="_blank" rel="noopener noreferrer" className="btn-primary mobile-download-btn">
              Download App
            </a>
            {onAdminLogin && (
              <button className="btn-secondary mobile-admin-btn" onClick={onAdminLogin}>
                Admin Login
              </button>
            )}
          </div>
        )}
      </nav>
    </>
  );
};
