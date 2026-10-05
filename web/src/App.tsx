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
import { SocketProvider } from './context/SocketContext.js';
import { LandingPage } from './pages/public/LandingPage.js';
import { ServiceDetailPage } from './pages/public/ServiceDetailPage.js';

export const App: React.FC = () => {
  const [session, setSession] = useState<UserSession | null>(AuthStore.getSession());
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedRequest, setSelectedRequest] = useState<OrchardRequest | null>(null);
  
  // Tracks if Report Builder is open and where it was opened from
  const [reportBuilderSource, setReportBuilderSource] = useState<'list' | 'detail' | null>(null);

  // Determine initial view based on URL
  const getInitialView = () => {
    const path = window.location.pathname;
    if (path.startsWith('/admin') || path.startsWith('/admin-login')) return 'app';
    if (path.startsWith('/services/')) return 'service-detail';
    return 'landing';
  };

  // App routing state (Landing vs Admin Dashboard vs Service Detail)
  const [view, setView] = useState<'landing' | 'app' | 'service-detail'>(getInitialView());
  const [serviceSlug, setServiceSlug] = useState<string>(
    window.location.pathname.startsWith('/services/') ? window.location.pathname.split('/services/')[1] : ''
  );

  // Keep URL in sync with state
  useEffect(() => {
    if (view === 'landing') {
      const validLandingPaths = ['/', '/about', '/contact', '/services'];
      if (!validLandingPaths.includes(window.location.pathname)) {
        window.history.replaceState({}, '', '/');
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
  };

  const navigateToHome = () => {
    setView('landing');
    window.history.pushState({}, '', '/');
  };

  const navigateToService = (slug: string) => {
    setServiceSlug(slug);
    setView('service-detail');
    window.history.pushState({}, '', `/services/${slug}`);
  };

  const navigateToSection = (sectionId: string) => {
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

  if (view === 'service-detail') {
    return <ServiceDetailPage slug={serviceSlug} onNavigateHome={navigateToHome} onNavigateService={navigateToService} onAdminLogin={navigateToAdminLogin} onNavigateSection={navigateToSection} />;
  }

  // Always show landing page if view === 'landing'
  if (view === 'landing') {
    return <LandingPage onAdminLogin={navigateToAdminLogin} onNavigateService={navigateToService} onNavigateSection={navigateToSection} />;
  }

  // If viewing app but not logged in (e.g. clicked Admin Login)
  if (!session) {
    return (
      <LoginPage 
        onLoginSuccess={(s) => {
          setSession(s);
          // The useEffect will automatically update the URL to /admin
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
          />
        </div>

        <div style={{ display: activeTab === 'consultations' ? 'block' : 'none', height: '100%' }}>
          <ConsultationsPage />
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

        {session.role === 'ADMIN' && (
          <div style={{ display: activeTab === 'experts' ? 'block' : 'none', height: '100%' }}>
            <ExpertsPage />
          </div>
        )}
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
