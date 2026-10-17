import React from 'react';
import { Home, ShoppingBag, LayoutGrid, Bot, Download } from 'lucide-react';
import './MobileBottomNav.css';

export interface MobileBottomNavProps {
  activeTab?: 'home' | 'bazaar' | 'services' | 'ai' | 'app';
  onNavigateSection?: (sectionId: string) => void;
  onNavigateHome?: () => void;
  onNavigateBazaar?: () => void;
  onNavigateService?: (slug: string) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab = 'home',
  onNavigateSection,
  onNavigateHome,
  onNavigateBazaar,
  onNavigateService,
}) => {
  const downloadLink = "https://drive.google.com/uc?export=download&id=1LhJ4mMGZG01RkQp0EtcE-4f2xOJh6gKe";

  const handleHomeClick = () => {
    if (onNavigateSection) {
      onNavigateSection('home');
    } else if (onNavigateHome) {
      onNavigateHome();
    } else {
      window.location.href = '/';
    }
  };

  const handleBazaarClick = () => {
    if (onNavigateBazaar) {
      onNavigateBazaar();
    } else if (onNavigateSection) {
      onNavigateSection('agri-bazaar');
    } else {
      window.location.href = '/agri-bazaar';
    }
  };

  const handleServicesClick = () => {
    if (onNavigateSection) {
      onNavigateSection('services');
    } else {
      const el = document.getElementById('services');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.location.href = '/services';
      }
    }
  };

  const handleAiClick = () => {
    if (onNavigateService) {
      onNavigateService('ai-farming-assistant');
    } else {
      const el = document.getElementById('ai-assistant-widget');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else if (onNavigateSection) {
        onNavigateSection('home');
        setTimeout(() => {
          const target = document.getElementById('ai-assistant-widget');
          if (target) target.scrollIntoView({ behavior: 'smooth' });
        }, 200);
      }
    }
  };

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile Bottom Navigation">
      <button 
        type="button" 
        className={`mobile-nav-item ${activeTab === 'home' ? 'active' : ''}`}
        onClick={handleHomeClick}
        aria-label="Home"
      >
        <div className="nav-icon-box">
          <Home size={20} />
        </div>
        <span className="nav-label">Home</span>
        {activeTab === 'home' && <span className="active-dot" />}
      </button>

      <button 
        type="button" 
        className={`mobile-nav-item ${activeTab === 'bazaar' ? 'active' : ''}`}
        onClick={handleBazaarClick}
        aria-label="Agri Bazaar"
      >
        <div className="nav-icon-box">
          <span className="nav-badge-pill">Hot</span>
          <ShoppingBag size={20} />
        </div>
        <span className="nav-label">Bazaar</span>
        {activeTab === 'bazaar' && <span className="active-dot" />}
      </button>

      <button 
        type="button" 
        className={`mobile-nav-item ${activeTab === 'services' ? 'active' : ''}`}
        onClick={handleServicesClick}
        aria-label="Services"
      >
        <div className="nav-icon-box">
          <LayoutGrid size={20} />
        </div>
        <span className="nav-label">Services</span>
        {activeTab === 'services' && <span className="active-dot" />}
      </button>

      <button 
        type="button" 
        className={`mobile-nav-item ${activeTab === 'ai' ? 'active' : ''}`}
        onClick={handleAiClick}
        aria-label="AI Mithar Assistant"
      >
        <div className="nav-icon-box ai-icon-box">
          <Bot size={20} />
        </div>
        <span className="nav-label">AI Mithar</span>
        {activeTab === 'ai' && <span className="active-dot" />}
      </button>

      <a 
        href={downloadLink}
        target="_blank"
        rel="noopener noreferrer"
        className={`mobile-nav-item ${activeTab === 'app' ? 'active' : ''}`}
        aria-label="Download Mobile App"
      >
        <div className="nav-icon-box app-icon-box">
          <Download size={20} />
        </div>
        <span className="nav-label">Get App</span>
        {activeTab === 'app' && <span className="active-dot" />}
      </a>
    </nav>
  );
};

export default MobileBottomNav;
