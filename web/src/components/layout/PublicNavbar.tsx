import React, { useState, useEffect, useRef } from 'react';
import {
  Menu, X, Home, ShoppingBag, LayoutGrid, Bot,
  Download, Sprout, Users, Handshake, Phone,
  Globe, ShieldCheck, ChevronRight, Play, Info
} from 'lucide-react';
import { MobileBottomNav } from './MobileBottomNav';
import '../../pages/public/LandingPage.css';

interface PublicNavbarProps {
  onAdminLogin?: () => void;
  transparent?: boolean;
  onNavigateSection?: (sectionId: string) => void;
  activeBottomTab?: 'home' | 'bazaar' | 'services' | 'ai' | 'app';
  onNavigateService?: (slug: string) => void;
}

export const PublicNavbar: React.FC<PublicNavbarProps> = ({
  onAdminLogin,
  transparent = false,
  onNavigateSection,
  activeBottomTab = 'home',
  onNavigateService
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isAtTop, setIsAtTop] = useState(true);
  const [activeLang, setActiveLang] = useState<'EN' | 'TE' | 'HI'>('EN');
  const lastScrollY = useRef(0);

  const downloadLink = "https://drive.google.com/uc?export=download&id=1LhJ4mMGZG01RkQp0EtcE-4f2xOJh6gKe";

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsAtTop(currentScrollY < 40);

      if (currentScrollY > 150) {
        if (currentScrollY > lastScrollY.current + 5) {
          // Scrolling down
          setIsVisible(false);
          setMobileMenuOpen(false);
        } else if (currentScrollY < lastScrollY.current - 5) {
          // Scrolling up
          setIsVisible(true);
        }
      } else {
        setIsVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent background scrolling when mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const handleNavClick = (sectionId: string) => {
    setMobileMenuOpen(false);
    if (onNavigateSection) {
      onNavigateSection(sectionId);
    } else {
      if (sectionId === 'home') window.location.href = '/';
      else if (sectionId === 'agri-bazaar') window.location.href = '/agri-bazaar';
      else window.location.href = `/#${sectionId}`;
    }
  };

  return (
    <>
      <header
        className={`landing-navbar ${transparent && isAtTop ? 'navbar-transparent' : 'navbar-solid'}`}
        style={{
          transform: isVisible ? 'translateY(0)' : 'translateY(-100%)',
          transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.25s ease, box-shadow 0.25s ease'
        }}
      >
        <div className="navbar-content">
          {/* Logo / Brand */}
          <a
            href="/"
            className="logo-container"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick('home');
            }}
          >
            <img src="/kissan_mithar_logo_v2.png" alt="Kissan Mithar Logo" className="logo-image" />
            <div className="logo-text-wrapper">
              <span className="logo-name-top">KISSAN</span>
              <span className="logo-name-bottom">MITHAR</span>
              <span className="logo-slogan">• SOW • GROW •</span>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="desktop-nav" aria-label="Desktop Navigation">
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                handleNavClick('home');
              }}
            >
              Home
            </a>
            <a
              href="/agri-bazaar"
              className="nav-bazaar-link"
              onClick={(e) => {
                e.preventDefault();
                handleNavClick('agri-bazaar');
              }}
            >
              <span className="nav-tag-badge">Market</span>
              Agri Bazaar
            </a>
            <a
              href="/services"
              onClick={(e) => {
                e.preventDefault();
                handleNavClick('services');
              }}
            >
              Services
            </a>
            <a
              href="/about"
              onClick={(e) => {
                e.preventDefault();
                handleNavClick('about');
              }}
            >
              About
            </a>
            <a
              href="/farmers"
              onClick={(e) => {
                e.preventDefault();
                handleNavClick('farmers');
              }}
            >
              For Farmers
            </a>
            <a
              href="/experts"
              onClick={(e) => {
                e.preventDefault();
                handleNavClick('experts');
              }}
            >
              Experts
            </a>
            <a
              href="/partners"
              onClick={(e) => {
                e.preventDefault();
                handleNavClick('partners');
              }}
            >
              Partners
            </a>
            <a
              href="/contact"
              onClick={(e) => {
                e.preventDefault();
                handleNavClick('contact');
              }}
            >
              Contact
            </a>
          </nav>

          {/* Desktop Actions */}
          <div className="navbar-actions">
            {/* Language toggle */}
            <div className="navbar-lang-pill">
              <button
                type="button"
                className={`lang-btn ${activeLang === 'EN' ? 'active' : ''}`}
                onClick={() => setActiveLang('EN')}
              >
                EN
              </button>
              <button
                type="button"
                className={`lang-btn ${activeLang === 'TE' ? 'active' : ''}`}
                onClick={() => setActiveLang('TE')}
              >
                తెలుగు
              </button>
              <button
                type="button"
                className={`lang-btn ${activeLang === 'HI' ? 'active' : ''}`}
                onClick={() => setActiveLang('HI')}
              >
                हिंदी
              </button>
            </div>

            <a
              href={downloadLink}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary get-app-btn"
            >
              <Download size={16} />
              <span>Download App</span>
            </a>

            {onAdminLogin && (
              <button
                type="button"
                className="btn-secondary admin-login-btn"
                onClick={onAdminLogin}
              >
                Admin Login
              </button>
            )}
          </div>

          {/* Mobile Right Bar: Language Pill + Menu Toggle */}
          <div className="mobile-header-actions">
            <button
              type="button"
              className="mobile-lang-chip"
              onClick={() => {
                const next = activeLang === 'EN' ? 'TE' : activeLang === 'TE' ? 'HI' : 'EN';
                setActiveLang(next);
              }}
              title="Change Dialect"
            >
              <Globe size={14} />
              <span>{activeLang === 'EN' ? 'EN' : activeLang === 'TE' ? 'తెలుగు' : 'हिंदी'}</span>
            </button>

            <button
              type="button"
              className="mobile-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Navigation Drawer"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile App Drawer & Backdrop */}
        {mobileMenuOpen && (
          <div className="mobile-drawer-overlay" onClick={() => setMobileMenuOpen(false)}>
            <div className="mobile-drawer" onClick={(e) => e.stopPropagation()}>
              <div className="drawer-header">
                <div className="drawer-brand">
                  <img src="/kissan_mithar_logo_v2.png" alt="Logo" className="drawer-logo" />
                  <div>
                    <h3 className="drawer-title">KISSAN MITHAR</h3>
                    <span className="drawer-subtitle">Farmer-First Smart Agritech</span>
                  </div>
                </div>
                <button
                  type="button"
                  className="drawer-close-btn"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Language Selector Inside Drawer */}
              <div className="drawer-lang-selector">
                <span className="drawer-section-label">Select Dialect / భాష</span>
                <div className="drawer-lang-row">
                  <button
                    type="button"
                    className={`drawer-lang-btn ${activeLang === 'EN' ? 'active' : ''}`}
                    onClick={() => setActiveLang('EN')}
                  >
                    English
                  </button>
                  <button
                    type="button"
                    className={`drawer-lang-btn ${activeLang === 'TE' ? 'active' : ''}`}
                    onClick={() => setActiveLang('TE')}
                  >
                    తెలుగు
                  </button>
                  <button
                    type="button"
                    className={`drawer-lang-btn ${activeLang === 'HI' ? 'active' : ''}`}
                    onClick={() => setActiveLang('HI')}
                  >
                    हिंदी
                  </button>
                </div>
              </div>

              {/* Drawer Links */}
              <div className="drawer-nav-list">
                <button
                  type="button"
                  className="drawer-nav-item"
                  onClick={() => handleNavClick('home')}
                >
                  <Home size={18} className="drawer-item-icon" />
                  <span>Home</span>
                  <ChevronRight size={16} className="drawer-arrow" />
                </button>

                <button
                  type="button"
                  className="drawer-nav-item highlight-item"
                  onClick={() => handleNavClick('agri-bazaar')}
                >
                  <ShoppingBag size={18} className="drawer-item-icon" />
                  <div className="drawer-nav-item-text">
                    <span>Agri Bazaar</span>
                    <span className="drawer-badge-hot">Marketplace</span>
                  </div>
                  <ChevronRight size={16} className="drawer-arrow" />
                </button>

                <button
                  type="button"
                  className="drawer-nav-item"
                  onClick={() => handleNavClick('services')}
                >
                  <LayoutGrid size={18} className="drawer-item-icon" />
                  <span>All Services</span>
                  <ChevronRight size={16} className="drawer-arrow" />
                </button>

                <button
                  type="button"
                  className="drawer-nav-item"
                  onClick={() => handleNavClick('about')}
                >
                  <Info size={18} className="drawer-item-icon" />
                  <span>About Kissan Mithar</span>
                  <ChevronRight size={16} className="drawer-arrow" />
                </button>

                <button
                  type="button"
                  className="drawer-nav-item"
                  onClick={() => handleNavClick('farmers')}
                >
                  <Sprout size={18} className="drawer-item-icon" />
                  <span>For Farmers</span>
                  <ChevronRight size={16} className="drawer-arrow" />
                </button>

                <button
                  type="button"
                  className="drawer-nav-item"
                  onClick={() => handleNavClick('experts')}
                >
                  <Users size={18} className="drawer-item-icon" />
                  <span>Experts & Agronomists</span>
                  <ChevronRight size={16} className="drawer-arrow" />
                </button>

                <button
                  type="button"
                  className="drawer-nav-item"
                  onClick={() => handleNavClick('contact')}
                >
                  <Phone size={18} className="drawer-item-icon" />
                  <span>Contact & Support</span>
                  <ChevronRight size={16} className="drawer-arrow" />
                </button>
              </div>

              {/* Drawer Actions */}
              <div className="drawer-footer">
                <a
                  href={downloadLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary drawer-download-btn"
                >
                  <Play size={18} fill="white" />
                  <span>Download Mobile App (APK)</span>
                </a>

                {onAdminLogin && (
                  <button
                    type="button"
                    className="drawer-admin-btn"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onAdminLogin();
                    }}
                  >
                    <ShieldCheck size={16} />
                    <span>Admin Desk Login</span>
                  </button>
                )}

                <div className="drawer-support-note">
                  Need direct assistance? Call <strong>+91 9392699963</strong>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Persistent Native-App Bottom Navigation Bar */}
      <MobileBottomNav
        activeTab={activeBottomTab}
        onNavigateSection={onNavigateSection}
        onNavigateHome={() => {
          if (onNavigateSection) onNavigateSection('home');
          else window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onNavigateBazaar={() => {
          if (onNavigateSection) onNavigateSection('agri-bazaar');
          else window.location.href = '/agri-bazaar';
        }}
        onNavigateService={onNavigateService}
      />
    </>
  );
};

export default PublicNavbar;
