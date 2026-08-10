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

export const App: React.FC = () => {
  const [session, setSession] = useState<UserSession | null>(AuthStore.getSession());
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedRequest, setSelectedRequest] = useState<OrchardRequest | null>(null);
  const [isBuildingReport, setIsBuildingReport] = useState<boolean>(false);

  const handleLogout = () => {
    AuthStore.clearSession();
    setSession(null);
    setSelectedRequest(null);
    setIsBuildingReport(false);
  };

  if (!session) {
    return <LoginPage onLoginSuccess={(s) => setSession(s)} />;
  }

  const handleSelectRequest = (req: OrchardRequest) => {
    setSelectedRequest(req);
    setIsBuildingReport(false);
  };

  const handleOpenReportBuilder = (req: OrchardRequest) => {
    setSelectedRequest(req);
    setIsBuildingReport(true);
  };

  const handleBackToRequests = () => {
    setSelectedRequest(null);
    setIsBuildingReport(false);
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
          {isBuildingReport && selectedRequest ? (
            <ReportBuilderPage
              request={selectedRequest}
              onBack={() => setIsBuildingReport(false)}
            />
          ) : selectedRequest ? (
            <RequestDetailPage
              request={selectedRequest}
              onBack={handleBackToRequests}
              onOpenReportBuilder={handleOpenReportBuilder}
            />
          ) : (
            <RequestsListPage
              onSelectRequest={handleSelectRequest}
              onOpenReportBuilder={handleOpenReportBuilder}
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
    <Layout
      activeTab={activeTab}
      setActiveTab={(tab) => {
        setActiveTab(tab);
        setSelectedRequest(null);
        setIsBuildingReport(false);
      }}
      session={session}
      onSessionChange={(s) => setSession(s)}
      onLogout={handleLogout}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;
