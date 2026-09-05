import React, { useState } from 'react';
import { Sidebar } from './Sidebar.js';
import { Header } from './Header.js';
import { ProfileModal } from '../profile/ProfileModal.js';
import { UserSession } from '../../types/index.js';

interface Props {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  session: UserSession;
  onSessionChange: (session: UserSession) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

export const Layout: React.FC<Props> = ({
  activeTab,
  setActiveTab,
  session,
  onSessionChange,
  onLogout,
  children,
}) => {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);

  return (
    <div className="layout-wrapper">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onLogout={onLogout}
        session={session}
      />
      <div className="content-wrapper">
        <Header
          session={session}
          onSessionChange={onSessionChange}
          onOpenProfile={() => setIsProfileModalOpen(true)}
          onLogout={onLogout}
        />
        <main className="main-content">
          {children}
        </main>
      </div>

      <ProfileModal
        session={session}
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onLogout={onLogout}
      />
    </div>
  );
};
