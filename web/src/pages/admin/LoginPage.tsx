import React, { useState, useEffect } from 'react';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  KeyRound,
  RefreshCw,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { UserSession } from '../../types/index.js';
import { AuthStore } from '../../services/authStore.js';
import { AuthApi } from '../../api/auth.api.js';

interface Props {
  onLoginSuccess: (session: UserSession) => void;
  onBackToHome?: () => void;
}

export const LoginPage: React.FC<Props> = ({ onLoginSuccess, onBackToHome }) => {
  // Login Method: default is 'PASSWORD', can toggle to 'OTP'
  const [loginMethod, setLoginMethod] = useState<'PASSWORD' | 'OTP'>('PASSWORD');
  const [isForgotPassword, setIsForgotPassword] = useState<boolean>(false);

  // Form Fields
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [otp, setOtp] = useState<string>('');

  // Reset Password Fields
  const [resetEmail, setResetEmail] = useState<string>('');
  const [resetOtp, setResetOtp] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);

  // UI States
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [otpCountdown, setOtpCountdown] = useState<number>(0);
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);

  // Timer for OTP resend cooldown
  useEffect(() => {
    let timer: any;
    if (otpCountdown > 0) {
      timer = setInterval(() => setOtpCountdown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [otpCountdown]);

  // Switch between Password and OTP on the same form
  const handleToggleLoginMethod = (method: 'PASSWORD' | 'OTP') => {
    setLoginMethod(method);
    setErrorMessage(null);
    setSuccessMessage(null);
    setDevOtpHint(null);
  };

  // --- 1. Send OTP to Mail ---
  const handleSendOtp = async (purpose: 'LOGIN' | 'RESET_PASSWORD' = 'LOGIN') => {
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
      });

      setOtpSent(true);
      setOtpCountdown(60);
      setSuccessMessage(res.message || `A 6-digit OTP code has been dispatched to ${targetEmail}`);
      if (res.devOtp) {
        setDevOtpHint(res.devOtp);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to send OTP code.');
    } finally {
      setLoading(false);
    }
  };

  // --- 2. Submit Login (Password OR OTP) ---
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMessage('Please enter your registered email address.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      let res: { token: string; user: any };

      if (loginMethod === 'PASSWORD') {
        if (!password.trim()) {
          setErrorMessage('Please enter your password.');
          setLoading(false);
          return;
        }
        res = await AuthApi.loginWithPassword({
          email: email.trim(),
          password: password.trim(),
        });
      } else {
        if (!otp.trim()) {
          setErrorMessage('Please enter the 6-digit OTP sent to your mail.');
          setLoading(false);
          return;
        }
        res = await AuthApi.loginWithEmailOtp({
          email: email.trim(),
          otp: otp.trim(),
        });
      }

      const role = res.user?.role;
      if (!role || !res.user?.userId) {
        throw new Error('Invalid user payload returned from server.');
      }

      const session: UserSession = {
        userId: res.user.userId,
        name: res.user.name,
        role: role,
        phoneNumber: res.user.phoneNumber,
        token: res.token,
        avatarUrl: res.user.photoUrl || 
          `https://ui-avatars.com/api/?name=${encodeURIComponent(res.user.name || 'User')}&background=15803d&color=fff&size=200`,
      };

      AuthStore.setSession(session);
      onLoginSuccess(session);
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please verify your credentials or OTP.');
    } finally {
      setLoading(false);
    }
  };

  // --- 3. Submit Reset Password ---
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim() || !resetOtp.trim() || !newPassword.trim()) {
      setErrorMessage('Please complete all required fields.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('New password and confirmation password do not match.');
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

      setSuccessMessage(res.message || 'Password successfully updated! You can now log in.');
      setPassword(newPassword);
      setEmail(resetEmail);
      setTimeout(() => {
        setIsForgotPassword(false);
        setLoginMethod('PASSWORD');
      }, 1500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to reset password. Please check your OTP.');
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
          maxWidth: '460px',
          borderRadius: '1.25rem',
          padding: '2.25rem',
          backgroundColor: '#ffffff',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.45)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
        }}
      >
        {/* Back Button */}
        {onBackToHome && (
          <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '-0.5rem' }}>
            <button 
              onClick={onBackToHome}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.25rem',
                background: 'none', border: 'none', color: '#64748b',
                fontSize: '0.75rem', cursor: 'pointer', padding: '0.25rem'
              }}
            >
              <ArrowLeft size={14} /> Back to Website
            </button>
          </div>
        )}

        {/* Brand Header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '0.5rem' }}>
          <img
            src="/app_logo.png"
            alt="Kisan Mithar Logo"
            style={{
              height: '84px',
              maxWidth: '220px',
              objectFit: 'contain',
              marginBottom: '0.25rem',
            }}
          />
          <div>
            <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#15803d', letterSpacing: '0.08em' }}>
              EXPERT & AGRONOMY CONSOLE
            </div>
          </div>
          <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: 0 }}>
            Horticultural Advisory, Feasibility & Agronomy Portal
          </p>
        </div>

        {/* Error / Success Notifications */}
        {errorMessage && (
          <div
            style={{
              padding: '0.625rem 0.75rem',
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
            <AlertTriangle size={16} color="#dc2626" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div
            style={{
              padding: '0.625rem 0.75rem',
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
            <CheckCircle2 size={16} color="#16a34a" />
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <KeyRound size={14} color="#2563eb" />
              <span>OTP: <strong>{devOtpHint}</strong></span>
            </div>
            <button
              type="button"
              onClick={() => {
                if (isForgotPassword) setResetOtp(devOtpHint);
                else setOtp(devOtpHint);
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
              Fill OTP
            </button>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* MAIN UNIFIED LOGIN FORM (Password by default / OTP) */}
        {/* ---------------------------------------------------- */}
        {!isForgotPassword ? (
          <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Field 1: Email Address */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  style={{
                    width: '100%',
                    padding: '0.625rem 0.75rem 0.625rem 2.25rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.875rem',
                    boxSizing: 'border-box',
                  }}
                />
                <Mail
                  size={16}
                  color="#94a3b8"
                  style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }}
                />
              </div>
            </div>

            {/* Field 2: Password (Default) OR OTP (When selected) */}
            {loginMethod === 'PASSWORD' ? (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#334155' }}>
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPassword(true);
                      setResetEmail(email);
                      setErrorMessage(null);
                      setSuccessMessage(null);
                    }}
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
                      padding: '0.625rem 2.5rem 0.625rem 2.25rem',
                      borderRadius: '0.5rem',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.875rem',
                      boxSizing: 'border-box',
                    }}
                  />
                  <Lock
                    size={16}
                    color="#94a3b8"
                    style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }}
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
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {/* Option to switch to OTP login right below Password field */}
                <div style={{ marginTop: '0.5rem', textAlign: 'right' }}>
                  <button
                    type="button"
                    onClick={() => handleToggleLoginMethod('OTP')}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '0.75rem',
                      color: '#15803d',
                      fontWeight: 600,
                      cursor: 'pointer',
                      padding: 0,
                      textDecoration: 'underline',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                    }}
                  >
                    <KeyRound size={13} />
                    <span>Login via OTP</span>
                  </button>
                </div>
              </div>
            ) : (
              /* OTP Mode: Field name is "OTP", with Send OTP and switch back to Password below */
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                  OTP
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="Enter 6-digit OTP"
                  required
                  style={{
                    width: '100%',
                    padding: '0.625rem 0.75rem',
                    borderRadius: '0.5rem',
                    border: '2px solid #cbd5e1',
                    fontSize: '1.125rem',
                    textAlign: 'center',
                    letterSpacing: '0.25em',
                    fontWeight: 700,
                    boxSizing: 'border-box',
                    fontFamily: 'monospace',
                  }}
                />

                {/* Actions below OTP field: Send OTP & Switch back to password */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => handleSendOtp('LOGIN')}
                    disabled={loading || otpCountdown > 0}
                    style={{
                      padding: '0.375rem 0.75rem',
                      backgroundColor: otpCountdown > 0 ? '#e2e8f0' : '#15803d',
                      color: otpCountdown > 0 ? '#64748b' : 'white',
                      border: 'none',
                      borderRadius: '0.375rem',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: otpCountdown > 0 || loading ? 'not-allowed' : 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.375rem',
                    }}
                  >
                    <Mail size={13} />
                    <span>{otpCountdown > 0 ? `Resend OTP in ${otpCountdown}s` : otpSent ? 'Resend OTP' : 'Send OTP to Mail'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggleLoginMethod('PASSWORD')}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '0.75rem',
                      color: '#64748b',
                      fontWeight: 600,
                      cursor: 'pointer',
                      padding: 0,
                      textDecoration: 'underline',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                    }}
                  >
                    <Lock size={13} />
                    <span>Login with Password</span>
                  </button>
                </div>
              </div>
            )}

            {/* Submit Button */}
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
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <span>{loading ? 'Authenticating...' : loginMethod === 'PASSWORD' ? 'Sign In' : 'Verify OTP & Sign In'}</span>
              <ArrowRight size={16} />
            </button>
          </form>
        ) : (
          /* ---------------------------------------------------- */
          /* FORGOT / RESET PASSWORD FORM                          */
          /* ---------------------------------------------------- */
          <form onSubmit={handleResetPasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <RefreshCw size={15} color="#15803d" />
                <span style={{ fontWeight: 700, fontSize: '0.875rem', color: '#0f172a' }}>Reset Password</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsForgotPassword(false);
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '0.75rem',
                  color: '#15803d',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                }}
              >
                <span>Back to Login</span>
                <ArrowRight size={13} />
              </button>
            </div>

            {/* Email Address */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                Registered Email Address
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="Enter email"
                    required
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.75rem 0.5rem 2rem',
                      borderRadius: '0.375rem',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.8125rem',
                      boxSizing: 'border-box',
                    }}
                  />
                  <Mail
                    size={14}
                    color="#94a3b8"
                    style={{ position: 'absolute', left: '0.625rem', top: '50%', transform: 'translateY(-50%)' }}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleSendOtp('RESET_PASSWORD')}
                  disabled={loading || otpCountdown > 0}
                  style={{
                    padding: '0.5rem 0.75rem',
                    backgroundColor: otpCountdown > 0 ? '#e2e8f0' : '#15803d',
                    color: otpCountdown > 0 ? '#64748b' : 'white',
                    border: 'none',
                    borderRadius: '0.375rem',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: otpCountdown > 0 || loading ? 'not-allowed' : 'pointer',
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                  }}
                >
                  <Mail size={12} />
                  <span>{otpCountdown > 0 ? `Resend (${otpCountdown}s)` : 'Send OTP'}</span>
                </button>
              </div>
            </div>

            {/* OTP Input */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                OTP Code
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
                  padding: '0.5rem 0.75rem',
                  borderRadius: '0.375rem',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.9375rem',
                  letterSpacing: '0.2em',
                  textAlign: 'center',
                  fontWeight: 700,
                  boxSizing: 'border-box',
                  fontFamily: 'monospace',
                }}
              />
            </div>

            {/* New Password */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                New Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  required
                  style={{
                    width: '100%',
                    padding: '0.5rem 2.25rem 0.5rem 2rem',
                    borderRadius: '0.375rem',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.8125rem',
                    boxSizing: 'border-box',
                  }}
                />
                <Lock
                  size={14}
                  color="#94a3b8"
                  style={{ position: 'absolute', left: '0.625rem', top: '50%', transform: 'translateY(-50%)' }}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.5rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#64748b',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {showNewPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                Confirm Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  required
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem 0.5rem 2rem',
                    borderRadius: '0.375rem',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.8125rem',
                    boxSizing: 'border-box',
                  }}
                />
                <Lock
                  size={14}
                  color="#94a3b8"
                  style={{ position: 'absolute', left: '0.625rem', top: '50%', transform: 'translateY(-50%)' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
              <button
                type="button"
                onClick={() => setIsForgotPassword(false)}
                className="btn-secondary"
                style={{ flex: 1, padding: '0.5rem', fontSize: '0.8125rem' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
                style={{ flex: 1, padding: '0.5rem', fontSize: '0.8125rem', justifyContent: 'center' }}
              >
                {loading ? 'Updating...' : 'Submit Reset'}
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
          <ShieldCheck size={14} color="#16a34a" />
          <span>Secured via Authentication & Audit Trail</span>
        </div>
      </div>
    </div>
  );
};
