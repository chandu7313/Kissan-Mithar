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
    return 'landing';
  };

  // App routing state (Landing vs Admin Dashboard)
  const [view, setView] = useState<'landing' | 'app'>(getInitialView());

  // Keep URL in sync with state
  useEffect(() => {
    if (view === 'landing') {
      if (window.location.pathname !== '/') {
        window.history.replaceState({}, '', '/');
      }
    } else if (view === 'app') {
      if (!session && window.location.pathname !== '/admin-login') {
        window.history.replaceState({}, '', '/admin-login');
      } else if (session && window.location.pathname !== '/admin') {
        window.history.replaceState({}, '', '/admin');
      }
    }
  }, [view, session]);

  // Sync state with browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      setView(getInitialView());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateToAdminLogin = () => {
    setView('app');
  };

  const navigateToHome = () => {
    setView('landing');
  };

  const handleLogout = () => {
    AuthStore.clearSession();
    setSession(null);
    setSelectedRequest(null);
    setReportBuilderSource(null);
    navigateToHome();
  };

  // Always show landing page if view === 'landing'
  if (view === 'landing') {
    return <LandingPage onAdminLogin={navigateToAdminLogin} />;
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
