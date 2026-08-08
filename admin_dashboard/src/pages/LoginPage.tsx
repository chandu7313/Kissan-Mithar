import React, { useState, useEffect } from 'react';
import { UserSession } from '../types/index.js';
import { AuthStore } from '../services/authStore.js';
import { AuthApi } from '../api/auth.api.js';

interface Props {
  onLoginSuccess: (session: UserSession) => void;
}

type AuthMode = 'PASSWORD' | 'OTP' | 'FORGOT_PASSWORD';

export const LoginPage: React.FC<Props> = ({ onLoginSuccess }) => {
  const [authMode, setAuthMode] = useState<AuthMode>('PASSWORD');
  const [role, setRole] = useState<'EXPERT' | 'ADMIN'>('EXPERT');

  // Form Fields
  const [email, setEmail] = useState<string>('sunil.rao@kissanmithar.in');
  const [password, setPassword] = useState<string>('Kisan@123');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [otp, setOtp] = useState<string>('');

  // Reset Password Fields
  const [resetEmail, setResetEmail] = useState<string>('sunil.rao@kissanmithar.in');
  const [resetOtp, setResetOtp] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);

  // States
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [otpCountdown, setOtpCountdown] = useState<number>(0);
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);

  // Countdown timer for OTP resend
  useEffect(() => {
    let timer: any;
    if (otpCountdown > 0) {
      timer = setInterval(() => setOtpCountdown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [otpCountdown]);

  // Clear messages when switching tabs
  const switchMode = (mode: AuthMode) => {
    setAuthMode(mode);
    setErrorMessage(null);
    setSuccessMessage(null);
    setDevOtpHint(null);
  };

  // Quick fill preset credentials
  const fillPreset = (presetRole: 'EXPERT' | 'ADMIN') => {
    setRole(presetRole);
    if (presetRole === 'EXPERT') {
      setEmail('sunil.rao@kissanmithar.in');
      setPassword('Kisan@123');
      setResetEmail('sunil.rao@kissanmithar.in');
    } else {
      setEmail('admin@kissanmithar.in');
      setPassword('admin123');
      setResetEmail('admin@kissanmithar.in');
    }
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  // --- Handlers ---

  // 1. Password Login Handler
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter both your email address and password.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await AuthApi.loginWithPassword({
        email: email.trim(),
        password: password.trim(),
        role,
      });

      const session: UserSession = {
        userId: res.user?.userId || (role === 'ADMIN' ? 'ADMIN-001' : 'EXPERT-001'),
        name: res.user?.name || (role === 'ADMIN' ? 'Kisan Mithar Ops Admin' : 'Dr. Sunil Rao'),
        role: res.user?.role || role,
        phoneNumber: res.user?.phoneNumber || (role === 'ADMIN' ? '+919999900000' : '+919811122233'),
        token: res.token || `jwt_pass_${Date.now()}`,
        avatarUrl:
          role === 'ADMIN'
            ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'
            : 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200',
      };

      AuthStore.setSession(session);
      onLoginSuccess(session);
    } catch (err: any) {
      setErrorMessage(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Send OTP to Email Handler
  const handleSendEmailOtp = async (purpose: 'LOGIN' | 'RESET_PASSWORD' = 'LOGIN') => {
    const targetEmail = purpose === 'LOGIN' ? email.trim() : resetEmail.trim();
    if (!targetEmail || !targetEmail.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await AuthApi.sendEmailOtp({
        email: targetEmail,
        purpose,
        role,
      });

      setOtpSent(true);
      setOtpCountdown(60);
      setSuccessMessage(res.message || `A 6-digit verification code was sent to ${targetEmail}`);
      if (res.devOtp) {
        setDevOtpHint(res.devOtp);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to dispatch email verification code.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Verify Email OTP & Login Handler
  const handleEmailOtpLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !otp.trim()) {
      setErrorMessage('Please enter the 6-digit code sent to your email.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await AuthApi.loginWithEmailOtp({
        email: email.trim(),
        otp: otp.trim(),
        role,
      });

      const session: UserSession = {
        userId: res.user?.userId || (role === 'ADMIN' ? 'ADMIN-001' : 'EXPERT-001'),
        name: res.user?.name || (role === 'ADMIN' ? 'Kisan Mithar Ops Admin' : 'Dr. Sunil Rao'),
        role: res.user?.role || role,
        phoneNumber: res.user?.phoneNumber || (role === 'ADMIN' ? '+919999900000' : '+919811122233'),
        token: res.token || `jwt_otp_${Date.now()}`,
        avatarUrl:
          role === 'ADMIN'
            ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'
            : 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200',
      };

      AuthStore.setSession(session);
      onLoginSuccess(session);
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid or expired OTP code.');
    } finally {
      setLoading(false);
    }
  };

  // 4. Reset Password Handler
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim() || !resetOtp.trim() || !newPassword.trim()) {
      setErrorMessage('Please complete all required fields.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage('New password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('New password and confirmation do not match.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await AuthApi.resetPassword({
        email: resetEmail.trim(),
        otp: resetOtp.trim(),
        newPassword: newPassword.trim(),
      });

      setSuccessMessage(res.message || 'Password successfully reset! You can now log in.');
      setPassword(newPassword);
      setEmail(resetEmail);
      setTimeout(() => {
        switchMode('PASSWORD');
      }, 2000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to reset password. Please verify your OTP code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #091e12 0%, #0f2e1b 50%, #06180e 100%)',
        padding: '1.5rem',
        boxSizing: 'border-box',
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '500px',
          borderRadius: '1.25rem',
          padding: '2.5rem',
          backgroundColor: '#ffffff',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.45)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
        }}
      >
        {/* Brand Header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '0.5rem' }}>
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '16px',
              backgroundColor: '#15803d',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              boxShadow: '0 10px 25px -5px rgba(21, 128, 61, 0.5)',
            }}
          >
            🌾
          </div>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
              KISAN MITHAR
            </h1>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#15803d', letterSpacing: '0.08em', marginTop: '0.125rem' }}>
              EXPERT & AGRONOMY CONSOLE
            </div>
          </div>
          <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: 0 }}>
            Horticultural Advisory, Feasibility & Agronomist Management
          </p>
        </div>

        {/* Quick Demo Fill Buttons */}
        <div style={{ display: 'flex', gap: '0.5rem', padding: '0.375rem', backgroundColor: '#f1f5f9', borderRadius: '0.5rem' }}>
          <button
            type="button"
            onClick={() => fillPreset('EXPERT')}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.375rem',
              padding: '0.4rem 0.5rem',
              borderRadius: '0.375rem',
              border: 'none',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              backgroundColor: role === 'EXPERT' ? '#ffffff' : 'transparent',
              color: role === 'EXPERT' ? '#15803d' : '#64748b',
              boxShadow: role === 'EXPERT' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <span>👨‍⚕️</span> Dr. Sunil Rao (Expert)
          </button>

          <button
            type="button"
            onClick={() => fillPreset('ADMIN')}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.375rem',
              padding: '0.4rem 0.5rem',
              borderRadius: '0.375rem',
              border: 'none',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              backgroundColor: role === 'ADMIN' ? '#ffffff' : 'transparent',
              color: role === 'ADMIN' ? '#b45309' : '#64748b',
              boxShadow: role === 'ADMIN' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <span>🛡️</span> Ops Admin
          </button>
        </div>

        {/* Tab Selector: Password vs Email OTP (Hidden in Forgot Password mode) */}
        {authMode !== 'FORGOT_PASSWORD' && (
          <div style={{ display: 'flex', borderBottom: '2px solid #e2e8f0', gap: '1rem', marginTop: '0.25rem' }}>
            <button
              type="button"
              onClick={() => switchMode('PASSWORD')}
              style={{
                flex: 1,
                padding: '0.625rem 0',
                background: 'none',
                border: 'none',
                borderBottom: authMode === 'PASSWORD' ? '3px solid #15803d' : '3px solid transparent',
                marginBottom: '-2px',
                fontWeight: authMode === 'PASSWORD' ? 700 : 500,
                color: authMode === 'PASSWORD' ? '#15803d' : '#64748b',
                fontSize: '0.875rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.375rem',
              }}
            >
              <span>🔑</span> Login with Password
            </button>

            <button
              type="button"
              onClick={() => switchMode('OTP')}
              style={{
                flex: 1,
                padding: '0.625rem 0',
                background: 'none',
                border: 'none',
                borderBottom: authMode === 'OTP' ? '3px solid #15803d' : '3px solid transparent',
                marginBottom: '-2px',
                fontWeight: authMode === 'OTP' ? 700 : 500,
                color: authMode === 'OTP' ? '#15803d' : '#64748b',
                fontSize: '0.875rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.375rem',
              }}
            >
              <span>📨</span> Login with Email OTP
            </button>
          </div>
        )}

        {/* Notifications / Alerts */}
        {errorMessage && (
          <div
            style={{
              padding: '0.75rem',
              borderRadius: '0.5rem',
              backgroundColor: '#fee2e2',
              border: '1px solid #fecaca',
              color: '#991b1b',
              fontSize: '0.8125rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <span>⚠️</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div
            style={{
              padding: '0.75rem',
              borderRadius: '0.5rem',
              backgroundColor: '#dcfce7',
              border: '1px solid #bbf7d0',
              color: '#166534',
              fontSize: '0.8125rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <span>✅</span>
            <span>{successMessage}</span>
          </div>
        )}

        {/* Dev OTP Helper Banner */}
        {devOtpHint && (
          <div
            style={{
              padding: '0.5rem 0.75rem',
              borderRadius: '0.5rem',
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              color: '#1e40af',
              fontSize: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span>🔑 Dev Mode Code: <strong>{devOtpHint}</strong></span>
            <button
              type="button"
              onClick={() => {
                if (authMode === 'OTP') setOtp(devOtpHint);
                if (authMode === 'FORGOT_PASSWORD') setResetOtp(devOtpHint);
              }}
              style={{
                backgroundColor: '#1d4ed8',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '0.2rem 0.5rem',
                fontSize: '0.6875rem',
                cursor: 'pointer',
              }}
            >
              Auto-Fill OTP
            </button>
          </div>
        )}

        {/* ----------------------------------------- */}
        {/* MODE 1: PASSWORD LOGIN FORM */}
        {/* ----------------------------------------- */}
        {authMode === 'PASSWORD' && (
          <form onSubmit={handlePasswordLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="expert@kissanmithar.in"
                required
                style={{
                  width: '100%',
                  padding: '0.625rem 0.75rem',
                  borderRadius: '0.5rem',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.875rem',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#334155' }}>
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => switchMode('FORGOT_PASSWORD')}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '0.75rem',
                    color: '#15803d',
                    fontWeight: 600,
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  Forgot Password?
                </button>
              </div>

              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  style={{
                    width: '100%',
                    padding: '0.625rem 2.5rem 0.625rem 0.75rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.875rem',
                    boxSizing: 'border-box',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#64748b',
                    cursor: 'pointer',
                    fontSize: '1rem',
                  }}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '0.75rem',
                fontSize: '0.9375rem',
                fontWeight: 700,
                justifyContent: 'center',
                marginTop: '0.5rem',
              }}
            >
              {loading ? 'Authenticating...' : 'Sign In with Password'}
            </button>
          </form>
        )}

        {/* ----------------------------------------- */}
        {/* MODE 2: EMAIL OTP LOGIN FORM */}
        {/* ----------------------------------------- */}
        {authMode === 'OTP' && (
          <form onSubmit={handleEmailOtpLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                Registered Email Address
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="expert@kissanmithar.in"
                  required
                  style={{
                    flex: 1,
                    padding: '0.625rem 0.75rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.875rem',
                    boxSizing: 'border-box',
                  }}
                />
                <button
                  type="button"
                  onClick={() => handleSendEmailOtp('LOGIN')}
                  disabled={loading || otpCountdown > 0}
                  style={{
                    padding: '0.625rem 1rem',
                    backgroundColor: otpCountdown > 0 ? '#e2e8f0' : '#15803d',
                    color: otpCountdown > 0 ? '#64748b' : 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: otpCountdown > 0 || loading ? 'not-allowed' : 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {otpCountdown > 0 ? `Resend in ${otpCountdown}s` : 'Send OTP'}
                </button>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                6-Digit Email Verification Code
              </label>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="e.g. 582914"
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  border: '2px solid #cbd5e1',
                  fontSize: '1.25rem',
                  textAlign: 'center',
                  letterSpacing: '0.35em',
                  fontWeight: 700,
                  boxSizing: 'border-box',
                  fontFamily: 'monospace',
                }}
              />
              <div style={{ fontSize: '0.6875rem', color: '#64748b', marginTop: '0.25rem', textAlign: 'center' }}>
                Check your email inbox or spam folder for the 6-digit code
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || otp.length < 4}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '0.75rem',
                fontSize: '0.9375rem',
                fontWeight: 700,
                justifyContent: 'center',
                marginTop: '0.5rem',
                opacity: otp.length < 4 ? 0.6 : 1,
              }}
            >
              {loading ? 'Verifying OTP...' : 'Verify OTP & Sign In'}
            </button>
          </form>
        )}

        {/* ----------------------------------------- */}
        {/* MODE 3: FORGOT / RESET PASSWORD FORM */}
        {/* ----------------------------------------- */}
        {authMode === 'FORGOT_PASSWORD' && (
          <form onSubmit={handleResetPasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <span>🔄</span>
                <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#0f172a' }}>Reset Account Password</span>
              </div>
              <button
                type="button"
                onClick={() => switchMode('PASSWORD')}
                style={{ background: 'none', border: 'none', fontSize: '0.75rem', color: '#15803d', fontWeight: 600, cursor: 'pointer' }}
              >
                Back to Login ➔
              </button>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                Registered Email Address
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="expert@kissanmithar.in"
                  required
                  style={{
                    flex: 1,
                    padding: '0.625rem 0.75rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.875rem',
                    boxSizing: 'border-box',
                  }}
                />
                <button
                  type="button"
                  onClick={() => handleSendEmailOtp('RESET_PASSWORD')}
                  disabled={loading || otpCountdown > 0}
                  style={{
                    padding: '0.625rem 1rem',
                    backgroundColor: otpCountdown > 0 ? '#e2e8f0' : '#15803d',
                    color: otpCountdown > 0 ? '#64748b' : 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: otpCountdown > 0 || loading ? 'not-allowed' : 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {otpCountdown > 0 ? `Resend (${otpCountdown}s)` : 'Send OTP'}
                </button>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                6-Digit Reset OTP Code
              </label>
              <input
                type="text"
                maxLength={6}
                value={resetOtp}
                onChange={(e) => setResetOtp(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="Enter 6-digit code"
                required
                style={{
                  width: '100%',
                  padding: '0.625rem 0.75rem',
                  borderRadius: '0.5rem',
                  border: '1px solid #cbd5e1',
                  fontSize: '1rem',
                  letterSpacing: '0.2em',
                  textAlign: 'center',
                  fontWeight: 700,
                  boxSizing: 'border-box',
                  fontFamily: 'monospace',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                New Password (min 6 characters)
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new strong password"
                  required
                  style={{
                    width: '100%',
                    padding: '0.625rem 2.5rem 0.625rem 0.75rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.875rem',
                    boxSizing: 'border-box',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#64748b',
                    cursor: 'pointer',
                  }}
                >
                  {showNewPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                Confirm New Password
              </label>
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                required
                style={{
                  width: '100%',
                  padding: '0.625rem 0.75rem',
                  borderRadius: '0.5rem',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.875rem',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={() => switchMode('PASSWORD')}
                className="btn-secondary"
                style={{ flex: 1, padding: '0.625rem', fontSize: '0.875rem' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
                style={{ flex: 1, padding: '0.625rem', fontSize: '0.875rem', justifyContent: 'center' }}
              >
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        )}

        {/* Security & Audit Footer */}
        <div
          style={{
            fontSize: '0.6875rem',
            color: '#64748b',
            borderTop: '1px solid #e2e8f0',
            paddingTop: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.375rem',
          }}
        >
          <span>🔒</span>
          <span>Secured via PostgreSQL Auth Audits & OTP Verification</span>
        </div>
      </div>
    </div>
  );
};
