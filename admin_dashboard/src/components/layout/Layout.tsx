import React from 'react';
import { Sidebar } from './Sidebar.js';
import { Header } from './Header.js';
import { UserSession } from '../../types/index.js';

interface Props {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  session: UserSession;
  onSessionChange: (session: UserSession) => void;
  children: React.ReactNode;
}

export const Layout: React.FC<Props> = ({
  activeTab,
  setActiveTab,
  session,
  onSessionChange,
  children,
}) => {
  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
        <Header session={session} onSessionChange={onSessionChange} />
        <main
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '2rem',
            backgroundColor: 'var(--bg-main)',
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
};
