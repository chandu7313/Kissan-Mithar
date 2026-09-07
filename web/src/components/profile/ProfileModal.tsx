import React, { useEffect, useState } from 'react';
import {
  X,
  Phone,
  Star,
  Sprout,
  Clock,
  RefreshCw,
  LogIn,
  LogOut,
} from 'lucide-react';
import { UserSession } from '../../types/index.js';
import { AuthApi, AuthAuditRecord } from '../../api/auth.api.js';
import { AuthStore } from '../../services/authStore.js';

interface Props {
  session: UserSession;
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

export const ProfileModal: React.FC<Props> = ({ session, isOpen, onClose, onLogout }) => {
  const [logs, setLogs] = useState<AuthAuditRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      loadAuditLogs();
    }
  }, [isOpen, session.userId]);

  const loadAuditLogs = async () => {
    setLoading(true);
    try {
      const records = await AuthApi.getAuditLogs(session.userId);
      setLogs(records);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutClick = async () => {
    setIsLoggingOut(true);
    try {
      await AuthApi.logout(session);
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setIsLoggingOut(false);
      onLogout();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // 1. Upload to Cloudinary
      const uploadedUrl = await AuthApi.uploadProfilePicture(file);
      // 2. Update Backend
      await AuthApi.updateProfile(uploadedUrl);
      // 3. Update session locally to reflect immediately
      const updatedSession = { ...session, avatarUrl: uploadedUrl };
      AuthStore.setSession(updatedSession);
      alert('Profile picture updated successfully!');
      window.location.reload();
    } catch (err) {
      console.error('Upload error:', err);
      alert('Failed to upload profile picture. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };


  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1.5rem',
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '620px',
          maxHeight: '90vh',
          overflowY: 'auto',
          borderRadius: '1.25rem',
          backgroundColor: '#ffffff',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          padding: '2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <img
              src="/kissan_mithar_logo.PNG"
              alt="Kissan Mithar"
              style={{ width: '40px', height: '40px', objectFit: 'contain' }}
            />
            <div>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                Expert Profile & Session Logs
              </h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                KISAN MITHAR EXPERT CONSOLE
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '0.25rem 0.5rem',
              borderRadius: '0.375rem',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Profile Card */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.25rem',
            padding: '1.25rem',
            backgroundColor: '#f8fafc',
            borderRadius: '0.75rem',
            border: '1px solid #e2e8f0',
          }}
        >
          <div style={{ position: 'relative', width: '64px', height: '64px', cursor: 'pointer' }} onClick={() => !isUploading && fileInputRef.current?.click()}>
            <img
              src={session.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(session.name || 'User')}&background=15803d&color=fff&size=200`}
              alt={session.name}
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '3px solid var(--primary-500)',
                opacity: isUploading ? 0.5 : 1,
                transition: 'opacity 0.2s',
              }}
            />
            {/* Hover Edit Overlay */}
            <div
              style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.5)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: isUploading ? 1 : 0,
                transition: 'opacity 0.2s',
              }}
              onMouseEnter={(e) => {
                if (!isUploading) e.currentTarget.style.opacity = '1';
              }}
              onMouseLeave={(e) => {
                if (!isUploading) e.currentTarget.style.opacity = '0';
              }}
            >
              {isUploading ? (
                <RefreshCw size={20} color="white" className="spin-animation" />
              ) : (
                <span style={{ color: 'white', fontSize: '0.75rem', fontWeight: 600 }}>Edit</span>
              )}
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              accept="image/*" 
              onChange={handleFileChange} 
            />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                {session.name}
              </h3>
              <span
                style={{
                  padding: '0.125rem 0.5rem',
                  borderRadius: '9999px',
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  backgroundColor: session.role === 'ADMIN' ? '#fef3c7' : '#dcfce7',
                  color: session.role === 'ADMIN' ? '#b45309' : '#15803d',
                }}
              >
                {session.role}
              </span>
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              {session.role === 'ADMIN' ? 'Head of Agronomy & Platform Operations' : 'Senior Horticultural Consultant & Soil Specialist'}
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', fontSize: '0.75rem', color: '#64748b' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Phone size={12} color="#15803d" />
                {session.phoneNumber || '+91 98111 22233'}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Star size={12} fill="#eab308" color="#eab308" />
                4.9 Rating (140+ Plans)
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Sprout size={12} color="#16a34a" />
                12 Yrs Exp
              </span>
            </div>
          </div>
        </div>

        {/* Login & Logout History Table */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={16} color="var(--primary-600)" />
              <h4 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>
                Authentication & Session Audit Trail
              </h4>
            </div>
            <button
              onClick={loadAuditLogs}
              style={{
                fontSize: '0.75rem',
                color: 'var(--primary-600)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
            >
              <RefreshCw size={12} />
              <span>Refresh</span>
            </button>
          </div>

          <div
            style={{
              maxHeight: '220px',
              overflowY: 'auto',
              border: '1px solid var(--border-light)',
              borderRadius: '0.5rem',
            }}
          >
            {loading ? (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                Loading authentication records...
              </div>
            ) : logs.length === 0 ? (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                No authentication activity logged yet.
              </div>
            ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f1f5f9', color: '#475569', borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '0.5rem 0.75rem' }}>Action</th>
                    <th style={{ padding: '0.5rem 0.75rem' }}>Timestamp</th>
                    <th style={{ padding: '0.5rem 0.75rem' }}>IP Address</th>
                    <th style={{ padding: '0.5rem 0.75rem' }}>Device / Client</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => {
                    const isLogin = log.action === 'LOGIN';
                    const dateFormatted = new Date(log.timestamp).toLocaleString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    });
                    return (
                      <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '0.5rem 0.75rem' }}>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              padding: '0.125rem 0.375rem',
                              borderRadius: '0.25rem',
                              fontWeight: 700,
                              fontSize: '0.6875rem',
                              backgroundColor: isLogin ? '#dcfce7' : '#fee2e2',
                              color: isLogin ? '#166534' : '#991b1b',
                            }}
                          >
                            {isLogin ? <LogIn size={11} /> : <LogOut size={11} />}
                            <span>{log.action}</span>
                          </span>
                        </td>
                        <td style={{ padding: '0.5rem 0.75rem', color: '#334155', fontWeight: 500 }}>
                          {dateFormatted}
                        </td>
                        <td style={{ padding: '0.5rem 0.75rem', color: '#64748b', fontFamily: 'monospace' }}>
                          {log.ipAddress || '127.0.0.1'}
                        </td>
                        <td
                          style={{
                            padding: '0.5rem 0.75rem',
                            color: '#64748b',
                            maxWidth: '140px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                          title={log.userAgent}
                        >
                          {log.userAgent || 'Web Console'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid var(--border-light)',
            paddingTop: '1rem',
          }}
        >
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Session ID: <code style={{ backgroundColor: '#f1f5f9', padding: '0.125rem 0.25rem', borderRadius: '4px' }}>{session.userId}</code>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={onClose}
              className="btn-secondary"
              style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
            >
              Close
            </button>

            <button
              onClick={handleLogoutClick}
              disabled={isLoggingOut}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                backgroundColor: '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                padding: '0.5rem 1.25rem',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: isLoggingOut ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.15s ease',
              }}
              onMouseEnter={(e) => {
                if (!isLoggingOut) e.currentTarget.style.backgroundColor = '#b91c1c';
              }}
              onMouseLeave={(e) => {
                if (!isLoggingOut) e.currentTarget.style.backgroundColor = '#dc2626';
              }}
            >
              <LogOut size={14} />
              <span>{isLoggingOut ? 'Logging out...' : 'Sign Out'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
