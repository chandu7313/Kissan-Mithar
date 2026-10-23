import React, { useState, useEffect } from 'react';
import { UserSession, OrchardRequest } from './types/index.js';
import { AuthStore } from './services/authStore.js';
import { Layout } from './components/layout/Layout.js';
import { LoginPage } from './pages/admin/LoginPage.js';
import { DashboardPage } from './pages/admin/DashboardPage.js';
import { RequestsListPage } from './pages/admin/RequestsListPage.js';
import { RequestDetailPage } from './pages/admin/RequestDetailPage.js';
import { ReportBuilderPage } from './pages/admin/ReportBuilderPage.js';
import { ConsultationsPage } from './pages/admin/ConsultationsPage.js';
import { ExpertsPage } from './pages/admin/ExpertsPage.js';
import { AgriBazaarAdminPage } from './pages/admin/AgriBazaarAdminPage.js';
import { AgriBazaarPage } from './pages/bazaar/AgriBazaarPage.js';
import { FarmersPage } from './pages/admin/FarmersPage.js';
import { ServicesPage } from './pages/admin/ServicesPage.js';
import { LabourAdminPage } from './pages/admin/LabourAdminPage.js';
import { MachineryAdminPage } from './pages/admin/MachineryAdminPage.js';
import { NotificationsPage } from './pages/admin/NotificationsPage.js';
import { ReportsPage } from './pages/admin/ReportsPage.js';
import { StaffPage } from './pages/admin/StaffPage.js';
import { SystemHealthPage } from './pages/admin/SystemHealthPage.js';
import { CollaborationAdminPage } from './pages/admin/CollaborationAdminPage.js';
import { SocketProvider } from './context/SocketContext.js';
import { LandingPage } from './pages/public/LandingPage.js';
import { ServiceDetailPage } from './pages/public/ServiceDetailPage.js';
import { PartnershipsPage } from './pages/public/PartnershipsPage.js';
import { AboutPage } from './pages/public/AboutPage.js';

const ROLE_DEFAULT_TABS: Record<string, string> = {
  SUPER_ADMIN: 'dashboard',
  SYSTEM_ADMIN: 'system',
  OPERATIONS_MANAGER: 'services',
  AGRONOMY_EXPERT: 'consultations',
  PROCUREMENT_MANAGER: 'agri-bazaar',
  FARMER_SUPPORT: 'farmers',
  FIELD_COORDINATOR: 'labour',
  FINANCE_COMPLIANCE: 'reports',
  MARKETING_MANAGER: 'notifications',
  BUSINESS_ANALYST: 'reports',
};

export const App: React.FC = () => {
  const [session, setSession] = useState<UserSession | null>(AuthStore.getSession());
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedRequest, setSelectedRequest] = useState<OrchardRequest | null>(null);
  
  // Tracks if Report Builder is open and where it was opened from
  const [reportBuilderSource, setReportBuilderSource] = useState<'list' | 'detail' | null>(null);

  // Determine initial view based on URL
  const getInitialView = () => {
    const path = window.location.pathname;
    if (path.startsWith('/admin') || path.startsWith('/admin-login') || path === '/login') return 'app';
    if (path.startsWith('/agri-bazaar') || path === '/services/crop-connect') return 'agri-bazaar';
    if (path.startsWith('/partnerships') || path === '/partners') return 'partnerships';
    if (path === '/about' || path.startsWith('/about')) return 'about';
    if (path.startsWith('/services/')) return 'service-detail';
    return 'landing';
  };

  // App routing state (Landing vs Admin Dashboard vs Service Detail vs Agri Bazaar vs Partnerships vs About)
  const [view, setView] = useState<'landing' | 'app' | 'service-detail' | 'agri-bazaar' | 'partnerships' | 'about'>(getInitialView());
  const [serviceSlug, setServiceSlug] = useState<string>(
    window.location.pathname.startsWith('/services/') ? window.location.pathname.split('/services/')[1] : ''
  );

  // Keep URL in sync with state
  useEffect(() => {
    if (view === 'landing') {
      const validLandingPaths = ['/', '/contact', '/services'];
      if (!validLandingPaths.includes(window.location.pathname)) {
        window.history.replaceState({}, '', '/');
      }
    } else if (view === 'about') {
      if (window.location.pathname !== '/about') {
        window.history.replaceState({}, '', '/about');
      }
    } else if (view === 'agri-bazaar') {
      if (!window.location.pathname.startsWith('/agri-bazaar') && window.location.pathname !== '/services/crop-connect') {
        window.history.replaceState({}, '', '/agri-bazaar');
      }
    } else if (view === 'partnerships') {
      if (window.location.pathname !== '/partnerships' && window.location.pathname !== '/partners') {
        window.history.replaceState({}, '', '/partnerships');
      }
    } else if (view === 'service-detail') {
      const expectedPath = `/services/${serviceSlug}`;
      if (window.location.pathname !== expectedPath) {
        window.history.replaceState({}, '', expectedPath);
      }
    } else if (view === 'app') {
      if (!session && window.location.pathname !== '/admin-login') {
        window.history.replaceState({}, '', '/admin-login');
      } else if (session && window.location.pathname !== '/admin') {
        window.history.replaceState({}, '', '/admin');
      }
    }
  }, [view, session, serviceSlug]);

  // Sync state with browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const newView = getInitialView();
      setView(newView);
      if (newView === 'service-detail') {
        setServiceSlug(window.location.pathname.split('/services/')[1] || '');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateToAdminLogin = () => {
    setView('app');
    window.history.pushState({}, '', '/admin-login');
  };

  const navigateToHome = () => {
    setView('landing');
    window.history.pushState({}, '', '/');
  };

  const navigateToPartnerships = () => {
    setView('partnerships');
    window.history.pushState({}, '', '/partnerships');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToService = (slug: string) => {
    if (slug === 'crop-connect' || slug === 'agri-bazaar') {
      setView('agri-bazaar');
      window.history.pushState({}, '', '/agri-bazaar');
      return;
    }
    setServiceSlug(slug);
    setView('service-detail');
    window.history.pushState({}, '', `/services/${slug}`);
  };

  const navigateToAbout = () => {
    setView('about');
    window.history.pushState({}, '', '/about');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToSection = (sectionId: string) => {
    if (sectionId === 'about') {
      navigateToAbout();
      return;
    }
    if (sectionId === 'agri-bazaar') {
      setView('agri-bazaar');
      window.history.pushState({}, '', '/agri-bazaar');
      return;
    }
    if (sectionId === 'partners' || sectionId === 'partnerships') {
      navigateToPartnerships();
      return;
    }
    setView('landing');
    const path = sectionId === 'home' ? '/' : `/${sectionId}`;
    window.history.pushState({}, '', path);
    
    setTimeout(() => {
      const el = document.getElementById(sectionId === 'home' ? 'home' : sectionId);
      if (el) {
        // Need a slight offset for sticky navbar if needed
        const y = el.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top: y, behavior: 'smooth' });
      } else if (sectionId === 'home') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 100);
  };

  const handleLogout = () => {
    AuthStore.clearSession();
    setSession(null);
    setSelectedRequest(null);
    setReportBuilderSource(null);
    navigateToHome();
  };

  if (view === 'about') {
    return (
      <AboutPage
        onNavigateHome={navigateToHome}
        onAdminLogin={navigateToAdminLogin}
        onNavigateSection={navigateToSection}
        onNavigateService={navigateToService}
        onNavigatePartnerships={navigateToPartnerships}
      />
    );
  }

  if (view === 'agri-bazaar') {
    return (
      <AgriBazaarPage
        session={session}
        onNavigateHome={navigateToHome}
        onAdminLogin={navigateToAdminLogin}
        onNavigateAdminDesk={() => {
          setActiveTab('agri-bazaar');
          setView('app');
        }}
      />
    );
  }

  if (view === 'partnerships') {
    return (
      <PartnershipsPage
        onNavigateHome={navigateToHome}
        onAdminLogin={navigateToAdminLogin}
        onNavigateSection={navigateToSection}
        onNavigateService={navigateToService}
      />
    );
  }

  if (view === 'service-detail') {
    return <ServiceDetailPage slug={serviceSlug} onNavigateHome={navigateToHome} onNavigateService={navigateToService} onAdminLogin={navigateToAdminLogin} onNavigateSection={navigateToSection} />;
  }

  // Always show landing page if view === 'landing'
  if (view === 'landing') {
    return (
      <LandingPage
        onAdminLogin={navigateToAdminLogin}
        onNavigateService={navigateToService}
        onNavigateSection={navigateToSection}
        onNavigatePartnerships={navigateToPartnerships}
      />
    );
  }

  // If viewing app but not logged in (e.g. clicked Admin Login)
  if (!session) {
    return (
      <LoginPage 
        onLoginSuccess={(s) => {
          setSession(s);
          const defaultTab = (s.staffRole && ROLE_DEFAULT_TABS[s.staffRole]) || (s.role === 'ADMIN' ? 'dashboard' : 'consultations');
          setActiveTab(defaultTab);
          setView('app');
          window.history.pushState({}, '', '/admin');
        }} 
        onBackToHome={navigateToHome}
      />
    );
  }

  const handleSelectRequest = (req: OrchardRequest) => {
    setSelectedRequest(req);
    setReportBuilderSource(null);
  };

  const handleOpenReportBuilderFromList = (req: OrchardRequest) => {
    setSelectedRequest(req);
    setReportBuilderSource('list');
  };

  const handleOpenReportBuilderFromDetail = (req: OrchardRequest) => {
    setSelectedRequest(req);
    setReportBuilderSource('detail');
  };

  const handleBackToRequests = () => {
    setSelectedRequest(null);
    setReportBuilderSource(null);
  };

  const handleReportBuilderBack = () => {
    if (reportBuilderSource === 'list') {
      // Go all the way back to the list
      setSelectedRequest(null);
      setReportBuilderSource(null);
    } else {
      // Just close builder, go back to detail page
      setReportBuilderSource(null);
    }
  };

  const renderContent = () => {
    return (
      <>
        <div style={{ display: activeTab === 'dashboard' ? 'block' : 'none', height: '100%' }}>
          <DashboardPage
            onNavigateToRequests={() => setActiveTab('requests')}
            onNavigateToConsultations={() => setActiveTab('consultations')}
            onNavigateToFarmers={() => setActiveTab('farmers')}
            onNavigateToServices={() => setActiveTab('services')}
            onNavigateToBazaar={() => setActiveTab('agri-bazaar')}
          />
        </div>

        <div style={{ display: activeTab === 'farmers' ? 'block' : 'none', height: '100%' }}>
          <FarmersPage />
        </div>

        <div style={{ display: activeTab === 'services' ? 'block' : 'none', height: '100%' }}>
          <ServicesPage onNavigateToOrchards={() => setActiveTab('requests')} />
        </div>

        <div style={{ display: activeTab === 'consultations' ? 'block' : 'none', height: '100%' }}>
          <ConsultationsPage />
        </div>

        <div style={{ display: activeTab === 'labour' ? 'block' : 'none', height: '100%' }}>
          <LabourAdminPage onNavigateToMachinery={() => setActiveTab('machinery')} />
        </div>

        <div style={{ display: activeTab === 'machinery' ? 'block' : 'none', height: '100%' }}>
          <MachineryAdminPage onNavigateToLabour={() => setActiveTab('labour')} />
        </div>

        <div style={{ display: activeTab === 'requests' ? 'block' : 'none', height: '100%' }}>
          {reportBuilderSource && selectedRequest ? (
            <ReportBuilderPage
              request={selectedRequest}
              onBack={handleReportBuilderBack}
            />
          ) : selectedRequest ? (
            <RequestDetailPage
              request={selectedRequest}
              onBack={handleBackToRequests}
              onOpenReportBuilder={handleOpenReportBuilderFromDetail}
            />
          ) : (
            <RequestsListPage
              onSelectRequest={handleSelectRequest}
              onOpenReportBuilder={handleOpenReportBuilderFromList}
            />
          )}
        </div>

        <div style={{ display: activeTab === 'notifications' ? 'block' : 'none', height: '100%' }}>
          <NotificationsPage />
        </div>

        <div style={{ display: activeTab === 'reports' ? 'block' : 'none', height: '100%' }}>
          <ReportsPage />
        </div>

        <div style={{ display: activeTab === 'staff' || activeTab === 'experts' ? 'block' : 'none', height: '100%' }}>
          {session.role === 'ADMIN' ? <StaffPage /> : <ExpertsPage />}
        </div>

        {session.role === 'ADMIN' && (
          <div style={{ display: activeTab === 'system' ? 'block' : 'none', height: '100%' }}>
            <SystemHealthPage />
          </div>
        )}

        <div style={{ display: activeTab === 'agri-bazaar' ? 'block' : 'none', height: '100%' }}>
          <AgriBazaarAdminPage />
        </div>

        <div style={{ display: activeTab === 'collaborations' ? 'block' : 'none', height: '100%' }}>
          <CollaborationAdminPage session={session} />
        </div>
      </>
    );
  };

  return (
    <SocketProvider>
      <Layout
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setSelectedRequest(null);
          setReportBuilderSource(null);
        }}
        session={session}
        onSessionChange={(s) => setSession(s)}
        onLogout={handleLogout}
      >
        {renderContent()}
      </Layout>
    </SocketProvider>
  );
};

export default App;
