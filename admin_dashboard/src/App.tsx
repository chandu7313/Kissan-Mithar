import React, { useState } from 'react';
import { UserSession, OrchardRequest } from './types/index.js';
import { AuthStore } from './services/authStore.js';
import { Layout } from './components/layout/Layout.js';
import { LoginPage } from './pages/LoginPage.js';
import { DashboardPage } from './pages/DashboardPage.js';
import { RequestsListPage } from './pages/RequestsListPage.js';
import { RequestDetailPage } from './pages/RequestDetailPage.js';
import { ReportBuilderPage } from './pages/ReportBuilderPage.js';
import { ConsultationsPage } from './pages/ConsultationsPage.js';
import { ExpertsPage } from './pages/ExpertsPage.js';
import { SocketProvider } from './context/SocketContext.js';

export const App: React.FC = () => {
  const [session, setSession] = useState<UserSession | null>(AuthStore.getSession());
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedRequest, setSelectedRequest] = useState<OrchardRequest | null>(null);
  
  // Tracks if Report Builder is open and where it was opened from
  const [reportBuilderSource, setReportBuilderSource] = useState<'list' | 'detail' | null>(null);

  const handleLogout = () => {
    AuthStore.clearSession();
    setSession(null);
    setSelectedRequest(null);
    setReportBuilderSource(null);
  };

  if (!session) {
    return <LoginPage onLoginSuccess={(s) => setSession(s)} />;
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
