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
  ChevronDown,
  ChevronUp,
  Sparkles,
  Loader2,
  Crown,
  Server,
  Briefcase,
  Sprout,
  ShoppingCart,
  Headphones,
  Tractor,
  FileSpreadsheet,
  Megaphone,
  LineChart,
} from 'lucide-react';
import { UserSession, DevAccountRole } from '../../types/index.js';
import { AuthStore } from '../../services/authStore.js';
import { AuthApi } from '../../api/auth.api.js';

interface Props {
  onLoginSuccess: (session: UserSession) => void;
  onBackToHome?: () => void;
}

const ROLE_ICONS: Record<string, React.ComponentType<any>> = {
  SUPER_ADMIN: Crown,
  SYSTEM_ADMIN: Server,
  OPERATIONS_MANAGER: Briefcase,
  AGRONOMY_EXPERT: Sprout,
  PROCUREMENT_MANAGER: ShoppingCart,
  FARMER_SUPPORT: Headphones,
  FIELD_COORDINATOR: Tractor,
  FINANCE_COMPLIANCE: FileSpreadsheet,
  MARKETING_MANAGER: Megaphone,
  BUSINESS_ANALYST: LineChart,
};

const ROLE_COLORS: Record<string, { bg: string; border: string; text: string; icon: string }> = {
  SUPER_ADMIN: { bg: '#fffbeb', border: '#fef3c7', text: '#92400e', icon: '#d97706' },
  SYSTEM_ADMIN: { bg: '#eff6ff', border: '#dbeafe', text: '#1e40af', icon: '#2563eb' },
  OPERATIONS_MANAGER: { bg: '#f0fdf4', border: '#dcfce7', text: '#166534', icon: '#16a34a' },
  AGRONOMY_EXPERT: { bg: '#ecfdf5', border: '#d1fae5', text: '#065f46', icon: '#059669' },
  PROCUREMENT_MANAGER: { bg: '#faf5ff', border: '#f3e8ff', text: '#6b21a8', icon: '#9333ea' },
  FARMER_SUPPORT: { bg: '#ecfeff', border: '#cffafe', text: '#155e75', icon: '#0891b2' },
  FIELD_COORDINATOR: { bg: '#fff7ed', border: '#ffedd5', text: '#9a3412', icon: '#ea580c' },
  FINANCE_COMPLIANCE: { bg: '#fff1f2', border: '#ffe4e6', text: '#9f1239', icon: '#e11d48' },
  MARKETING_MANAGER: { bg: '#fdf2f8', border: '#fce7f3', text: '#831843', icon: '#db2777' },
  BUSINESS_ANALYST: { bg: '#f0fdfa', border: '#ccfbf1', text: '#115e59', icon: '#0d9488' },
};

export const LoginPage: React.FC<Props> = ({ onLoginSuccess, onBackToHome }) => {
  // Check if running in development environment
  const isDev =
    import.meta.env.DEV ||
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1';

  // Login Mode: 'PASSWORD' (default production mode) or 'OTP'
  const [loginMethod, setLoginMethod] = useState<'PASSWORD' | 'OTP'>('PASSWORD');
  const [isForgotPassword, setIsForgotPassword] = useState<boolean>(false);

  // Form Fields
  const [email, setEmail] = useState<string>(() => {
    return localStorage.getItem('kissan_mithar_remembered_email') || '';
  });
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(() => {
    return !!localStorage.getItem('kissan_mithar_remembered_email');
  });
  const [otp, setOtp] = useState<string>('');

  // Reset Password Fields
  const [resetEmail, setResetEmail] = useState<string>('');
  const [resetOtp, setResetOtp] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);

  // UI States
  const [loading, setLoading] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [otpCountdown, setOtpCountdown] = useState<number>(0);
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);

  // Developer Quick Login States
  const [quickLoginOpen, setQuickLoginOpen] = useState<boolean>(true);
  const [devAccounts, setDevAccounts] = useState<DevAccountRole[]>([]);
  const [loadingDevAccounts, setLoadingDevAccounts] = useState<boolean>(false);
  const [quickLoginRoleLoading, setQuickLoginRoleLoading] = useState<string | null>(null);

  // Timer for OTP resend cooldown
  useEffect(() => {
    let timer: any;
    if (otpCountdown > 0) {
      timer = setInterval(() => setOtpCountdown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [otpCountdown]);

  // Load real development accounts in development mode
  useEffect(() => {
    if (isDev) {
      setLoadingDevAccounts(true);
      AuthApi.getDevAccounts()
        .then((accounts) => {
          setDevAccounts(accounts);
        })
        .catch((err) => {
          console.warn('[LoginPage] Dev accounts discovery skipped or unavailable:', err);
        })
        .finally(() => {
          setLoadingDevAccounts(false);
        });
    }
  }, [isDev]);

  // Handle Remember Me persistence
  const handleRememberMeChange = (checked: boolean) => {
    setRememberMe(checked);
    if (!checked) {
      localStorage.removeItem('kissan_mithar_remembered_email');
    } else if (email) {
      localStorage.setItem('kissan_mithar_remembered_email', email.trim());
    }
  };

  // Toggle between Password and OTP modes
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

  // --- 2. Production Form Submit (Password or OTP) ---
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
        throw new Error('Invalid authentication response returned from server.');
      }

      if (rememberMe) {
        localStorage.setItem('kissan_mithar_remembered_email', email.trim());
      } else {
        localStorage.removeItem('kissan_mithar_remembered_email');
      }

      setIsSuccess(true);
      setSuccessMessage('Authentication successful! Initializing workspace...');

      const session: UserSession = {
        userId: res.user.userId,
        name: res.user.name,
        role: role,
        staffRole: res.user.staffRole,
        email: res.user.email,
        phoneNumber: res.user.phoneNumber,
        token: res.token,
        avatarUrl:
          res.user.photoUrl ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(res.user.name || 'User')}&background=15803d&color=fff&size=200`,
      };

      AuthStore.setSession(session);

      setTimeout(() => {
        onLoginSuccess(session);
      }, 500);
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.message ||
        err.message ||
        'Authentication failed. Please verify your credentials or contact your administrator.'
      );
    } finally {
      setLoading(false);
    }
  };

  // --- 3. Quick-Login Action (Uses Real Backend Endpoint & Real Dev Credentials) ---
  const handleQuickLoginRole = async (accountRole: DevAccountRole) => {
    if (!accountRole.isAvailable || !accountRole.email) {
      setErrorMessage(`No active development account configured for ${accountRole.roleName}.`);
      return;
    }

    setEmail(accountRole.email);
    setQuickLoginRoleLoading(accountRole.roleKey);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      // Submits real credentials through the exact same backend authentication endpoint
      const res = await AuthApi.loginWithPassword({
        email: accountRole.email,
        password: 'Kisan@123',
      });

      const role = res.user?.role;
      if (!role || !res.user?.userId) {
        throw new Error('Invalid user payload returned from server.');
      }

      setIsSuccess(true);
      setSuccessMessage(`Authenticated as ${accountRole.roleName} (${accountRole.accountName}). Navigating...`);

      const session: UserSession = {
        userId: res.user.userId,
        name: res.user.name,
        role: role,
        staffRole: res.user.staffRole,
        email: res.user.email,
        phoneNumber: res.user.phoneNumber,
        token: res.token,
        avatarUrl:
          res.user.photoUrl ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(res.user.name || 'Staff')}&background=15803d&color=fff&size=200`,
      };

      AuthStore.setSession(session);

      setTimeout(() => {
        onLoginSuccess(session);
      }, 500);
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.message ||
        err.message ||
        `Quick login failed for ${accountRole.roleName}. Please verify credentials.`
      );
    } finally {
      setQuickLoginRoleLoading(null);
    }
  };

  // --- 4. Submit Reset Password ---
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
        background: 'linear-gradient(135deg, #06190e 0%, #0c2d1b 45%, #05140b 100%)',
        padding: '2rem 1.5rem',
        boxSizing: 'border-box',
        overflowY: 'auto',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: isDev ? '840px' : '480px',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          margin: 'auto',
        }}
      >
        {/* Main Glass Panel Card */}
        <div
          className="glass-panel"
          style={{
            width: '100%',
            borderRadius: '1.25rem',
            padding: '2.5rem',
            backgroundColor: '#ffffff',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.45)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            boxSizing: 'border-box',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}
        >
          {/* Back to Website Button */}
          {onBackToHome && (
            <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '-0.5rem' }}>
              <button
                type="button"
                onClick={onBackToHome}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: '0.25rem 0',
                }}
              >
                <ArrowLeft size={15} />
                <span>Back to Website</span>
              </button>
            </div>
          )}

          {/* Brand Header */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: '0.65rem',
            }}
          >
            <img
              src="/kissan_mithar_logo_v2.png"
              alt="Kissan Mithar Logo"
              style={{
                height: '76px',
                width: '76px',
                objectFit: 'contain',
                borderRadius: '16px',
                backgroundColor: '#ffffff',
                padding: '4px',
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.08)',
              }}
            />
            <div>
              <h1
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1.75rem',
                  fontWeight: 800,
                  color: '#0f172a',
                  margin: 0,
                  letterSpacing: '-0.025em',
                }}
              >
                Welcome back
              </h1>
              <p
                style={{
                  fontSize: '0.875rem',
                  color: '#64748b',
                  margin: '0.35rem 0 0 0',
                  fontWeight: 500,
                }}
              >
                Sign in to manage Kissan Mithar operations.
              </p>
            </div>
          </div>

          {/* Feedback Alerts */}
          {errorMessage && (
            <div
              role="alert"
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '0.625rem',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#991b1b',
                fontSize: '0.8125rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                lineHeight: 1.4,
              }}
            >
              <AlertTriangle size={18} color="#dc2626" style={{ flexShrink: 0 }} />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div
              role="status"
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '0.625rem',
                backgroundColor: '#f0fdf4',
                border: '1px solid #bbf7d0',
                color: '#166534',
                fontSize: '0.8125rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                lineHeight: 1.4,
              }}
            >
              <CheckCircle2 size={18} color="#16a34a" style={{ flexShrink: 0 }} />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Dev OTP Helper Banner */}
          {devOtpHint && (
            <div
              style={{
                padding: '0.55rem 0.85rem',
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <KeyRound size={15} color="#2563eb" />
                <span>
                  Simulated OTP: <strong>{devOtpHint}</strong>
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (isForgotPassword) setResetOtp(devOtpHint);
                  else setOtp(devOtpHint);
                }}
                style={{
                  backgroundColor: '#1d4ed8',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '0.25rem 0.6rem',
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Fill Code
              </button>
            </div>
          )}

          {/* ---------------------------------------------------- */}
          {/* PRODUCTION LOGIN FORM (Password by default / OTP)    */}
          {/* ---------------------------------------------------- */}
          {!isForgotPassword ? (
            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
              {/* Field 1: Email Address */}
              <div>
                <label
                  htmlFor="admin-login-email"
                  style={{
                    display: 'block',
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    color: '#334155',
                    marginBottom: '0.35rem',
                  }}
                >
                  Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="admin-login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@kissanmithar.in"
                    autoComplete="email"
                    required
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem 0.65rem 2.4rem',
                      borderRadius: '0.5rem',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.875rem',
                      boxSizing: 'border-box',
                      outline: 'none',
                      color: '#0f172a',
                      transition: 'border-color 0.15s ease',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = '#16a34a')}
                    onBlur={(e) => (e.target.style.borderColor = '#cbd5e1')}
                  />
                  <Mail
                    size={17}
                    color="#94a3b8"
                    style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }}
                  />
                </div>
              </div>

              {/* Field 2: Password (Default) OR OTP */}
              {loginMethod === 'PASSWORD' ? (
                <div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '0.35rem',
                    }}
                  >
                    <label
                      htmlFor="admin-login-password"
                      style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#334155' }}
                    >
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
                        fontWeight: 700,
                        cursor: 'pointer',
                        padding: 0,
                      }}
                    >
                      Forgot password?
                    </button>
                  </div>

                  <div style={{ position: 'relative' }}>
                    <input
                      id="admin-login-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your account password"
                      autoComplete="current-password"
                      required
                      style={{
                        width: '100%',
                        padding: '0.65rem 2.6rem 0.65rem 2.4rem',
                        borderRadius: '0.5rem',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.875rem',
                        boxSizing: 'border-box',
                        outline: 'none',
                        color: '#0f172a',
                        transition: 'border-color 0.15s ease',
                      }}
                      onFocus={(e) => (e.target.style.borderColor = '#16a34a')}
                      onBlur={(e) => (e.target.style.borderColor = '#cbd5e1')}
                    />
                    <Lock
                      size={17}
                      color="#94a3b8"
                      style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '0.85rem',
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
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>

                  {/* Remember Me & OTP Switch Row */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginTop: '0.65rem',
                    }}
                  >
                    <label
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.45rem',
                        fontSize: '0.8125rem',
                        color: '#475569',
                        cursor: 'pointer',
                        userSelect: 'none',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => handleRememberMeChange(e.target.checked)}
                        style={{
                          accentColor: '#16a34a',
                          width: '15px',
                          height: '15px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                      />
                      <span>Remember me</span>
                    </label>

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
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                      }}
                    >
                      <KeyRound size={13} />
                      <span>Sign in with Email OTP</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* OTP Verification Mode */
                <div>
                  <label
                    htmlFor="admin-login-otp"
                    style={{
                      display: 'block',
                      fontSize: '0.8125rem',
                      fontWeight: 700,
                      color: '#334155',
                      marginBottom: '0.35rem',
                    }}
                  >
                    6-Digit Security OTP
                  </label>
                  <input
                    id="admin-login-otp"
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="• • • • • •"
                    required
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '0.5rem',
                      border: '2px solid #cbd5e1',
                      fontSize: '1.25rem',
                      textAlign: 'center',
                      letterSpacing: '0.35em',
                      fontWeight: 800,
                      boxSizing: 'border-box',
                      fontFamily: 'monospace',
                      outline: 'none',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = '#16a34a')}
                    onBlur={(e) => (e.target.style.borderColor = '#cbd5e1')}
                  />

                  {/* Actions below OTP field: Send OTP & Switch back to password */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginTop: '0.65rem',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => handleSendOtp('LOGIN')}
                      disabled={loading || otpCountdown > 0}
                      style={{
                        padding: '0.4rem 0.75rem',
                        backgroundColor: otpCountdown > 0 ? '#e2e8f0' : '#15803d',
                        color: otpCountdown > 0 ? '#64748b' : '#ffffff',
                        border: 'none',
                        borderRadius: '0.375rem',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: otpCountdown > 0 || loading ? 'not-allowed' : 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                      }}
                    >
                      <Mail size={13} />
                      <span>
                        {otpCountdown > 0
                          ? `Resend in ${otpCountdown}s`
                          : otpSent
                          ? 'Resend OTP'
                          : 'Send Code to Email'}
                      </span>
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
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                      }}
                    >
                      <Lock size={13} />
                      <span>Use password instead</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || isSuccess}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  backgroundColor: isSuccess ? '#16a34a' : '#15803d',
                  color: '#ffffff',
                  fontSize: '0.9375rem',
                  fontWeight: 700,
                  cursor: loading || isSuccess ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  marginTop: '0.35rem',
                  boxShadow: '0 4px 12px rgba(22, 163, 74, 0.3)',
                  transition: 'all 0.15s ease',
                  opacity: loading ? 0.75 : 1,
                }}
              >
                {loading ? (
                  <>
                    <Loader2 size={17} className="animate-spin" />
                    <span>Authenticating...</span>
                  </>
                ) : isSuccess ? (
                  <>
                    <CheckCircle2 size={17} />
                    <span>Authenticated</span>
                  </>
                ) : (
                  <>
                    <span>{loginMethod === 'PASSWORD' ? 'Sign In' : 'Verify & Sign In'}</span>
                    <ArrowRight size={17} />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* ---------------------------------------------------- */
            /* FORGOT / RESET PASSWORD WORKFLOW                      */
            /* ---------------------------------------------------- */
            <form onSubmit={handleResetPasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid #e2e8f0',
                  paddingBottom: '0.65rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <RefreshCw size={16} color="#15803d" />
                  <span style={{ fontWeight: 800, fontSize: '0.9375rem', color: '#0f172a' }}>
                    Reset Account Password
                  </span>
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
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                  }}
                >
                  <span>Back to Sign In</span>
                  <ArrowRight size={13} />
                </button>
              </div>

              {/* Reset Email Address */}
              <div>
                <label
                  htmlFor="reset-email"
                  style={{
                    display: 'block',
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    color: '#334155',
                    marginBottom: '0.35rem',
                  }}
                >
                  Registered Email Address
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <input
                      id="reset-email"
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="name@kissanmithar.in"
                      required
                      style={{
                        width: '100%',
                        padding: '0.55rem 0.75rem 0.55rem 2.25rem',
                        borderRadius: '0.375rem',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.8125rem',
                        boxSizing: 'border-box',
                      }}
                    />
                    <Mail
                      size={15}
                      color="#94a3b8"
                      style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSendOtp('RESET_PASSWORD')}
                    disabled={loading || otpCountdown > 0}
                    style={{
                      padding: '0.55rem 0.85rem',
                      backgroundColor: otpCountdown > 0 ? '#e2e8f0' : '#15803d',
                      color: otpCountdown > 0 ? '#64748b' : '#ffffff',
                      border: 'none',
                      borderRadius: '0.375rem',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: otpCountdown > 0 || loading ? 'not-allowed' : 'pointer',
                      whiteSpace: 'nowrap',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                    }}
                  >
                    <Mail size={13} />
                    <span>{otpCountdown > 0 ? `Resend (${otpCountdown}s)` : 'Send OTP'}</span>
                  </button>
                </div>
              </div>

              {/* OTP Input */}
              <div>
                <label
                  htmlFor="reset-otp"
                  style={{
                    display: 'block',
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    color: '#334155',
                    marginBottom: '0.35rem',
                  }}
                >
                  6-Digit OTP Code
                </label>
                <input
                  id="reset-otp"
                  type="text"
                  maxLength={6}
                  value={resetOtp}
                  onChange={(e) => setResetOtp(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="Enter 6-digit code"
                  required
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.75rem',
                    borderRadius: '0.375rem',
                    border: '1px solid #cbd5e1',
                    fontSize: '1rem',
                    letterSpacing: '0.25em',
                    textAlign: 'center',
                    fontWeight: 800,
                    boxSizing: 'border-box',
                    fontFamily: 'monospace',
                  }}
                />
              </div>

              {/* New Password */}
              <div>
                <label
                  htmlFor="reset-new-password"
                  style={{
                    display: 'block',
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    color: '#334155',
                    marginBottom: '0.35rem',
                  }}
                >
                  New Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="reset-new-password"
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    required
                    style={{
                      width: '100%',
                      padding: '0.55rem 2.4rem 0.55rem 2.25rem',
                      borderRadius: '0.375rem',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.8125rem',
                      boxSizing: 'border-box',
                    }}
                  />
                  <Lock
                    size={15}
                    color="#94a3b8"
                    style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }}
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
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    {showNewPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="reset-confirm-password"
                  style={{
                    display: 'block',
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    color: '#334155',
                    marginBottom: '0.35rem',
                  }}
                >
                  Confirm New Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="reset-confirm-password"
                    type={showNewPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password to confirm"
                    required
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem 0.55rem 2.25rem',
                      borderRadius: '0.375rem',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.8125rem',
                      boxSizing: 'border-box',
                    }}
                  />
                  <Lock
                    size={15}
                    color="#94a3b8"
                    style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsForgotPassword(false)}
                  style={{
                    flex: 1,
                    padding: '0.55rem',
                    borderRadius: '0.375rem',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    color: '#475569',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    flex: 1,
                    padding: '0.55rem',
                    borderRadius: '0.375rem',
                    border: 'none',
                    backgroundColor: '#15803d',
                    color: '#ffffff',
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    cursor: loading ? 'not-allowed' : 'pointer',
                  }}
                >
                  {loading ? 'Updating...' : 'Save New Password'}
                </button>
              </div>
            </form>
          )}

          {/* Security & Audit Footer */}
          <div
            style={{
              fontSize: '0.75rem',
              color: '#64748b',
              borderTop: '1px solid #e2e8f0',
              paddingTop: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.45rem',
            }}
          >
            <ShieldCheck size={16} color="#16a34a" />
            <span>Secured via Argon2/Bcrypt Password Hash & Database Audit Trail</span>
          </div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* DEVELOPER QUICK LOGIN SECTION (STRICTLY IN DEVELOPMENT ONLY)        */}
        {/* ------------------------------------------------------------------ */}
        {isDev && (
          <div
            style={{
              width: '100%',
              borderRadius: '1.25rem',
              backgroundColor: 'rgba(255, 255, 255, 0.98)',
              boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.35)',
              border: '1px solid #fde047',
              overflow: 'hidden',
              boxSizing: 'border-box',
            }}
          >
            {/* Collapsible Header */}
            <div
              onClick={() => setQuickLoginOpen(!quickLoginOpen)}
              style={{
                padding: '1.15rem 1.5rem',
                backgroundColor: '#fefce8',
                borderBottom: quickLoginOpen ? '1px solid #fef08a' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                userSelect: 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor: '#eab308',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                  }}
                >
                  <Sparkles size={18} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span
                      style={{
                        fontFamily: 'var(--font-heading)',
                        fontWeight: 800,
                        fontSize: '0.9375rem',
                        color: '#713f12',
                      }}
                    >
                      Developer Quick Login — Development Only
                    </span>
                    <span
                      style={{
                        padding: '0.15rem 0.45rem',
                        borderRadius: '9999px',
                        backgroundColor: '#ca8a04',
                        color: '#ffffff',
                        fontSize: '0.625rem',
                        fontWeight: 800,
                        letterSpacing: '0.05em',
                      }}
                    >
                      DEV ONLY
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#854d0e' }}>
                    Simulate all 10 authoritative company roles with active development staff accounts.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#854d0e' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>
                  {devAccounts.filter((a) => a.isAvailable).length} / 10 Roles Ready
                </span>
                {quickLoginOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </div>
            </div>

            {/* Quick Login 10 Roles Grid */}
            {quickLoginOpen && (
              <div style={{ padding: '1.25rem', backgroundColor: '#ffffff' }}>
                {loadingDevAccounts ? (
                  <div
                    style={{
                      padding: '2rem',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.5rem',
                      color: '#64748b',
                    }}
                  >
                    <Loader2 size={24} className="animate-spin" color="#16a34a" />
                    <span style={{ fontSize: '0.8125rem' }}>
                      Connecting to PostgreSQL development account registry...
                    </span>
                  </div>
                ) : devAccounts.length === 0 ? (
                  <div
                    style={{
                      padding: '1.5rem',
                      textAlign: 'center',
                      backgroundColor: '#f8fafc',
                      borderRadius: '8px',
                      color: '#64748b',
                      fontSize: '0.8125rem',
                    }}
                  >
                    No development accounts configured. Run `npm run seed:dev-staff` in backend to populate.
                  </div>
                ) : (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
                      gap: '0.85rem',
                    }}
                  >
                    {devAccounts.map((accountRole) => {
                      const IconComponent = ROLE_ICONS[accountRole.roleKey] || Briefcase;
                      const roleColor = ROLE_COLORS[accountRole.roleKey] || {
                        bg: '#f8fafc',
                        border: '#e2e8f0',
                        text: '#334155',
                        icon: '#64748b',
                      };
                      const isLoadingThis = quickLoginRoleLoading === accountRole.roleKey;

                      return (
                        <div
                          key={accountRole.roleKey}
                          style={{
                            padding: '0.85rem 1rem',
                            borderRadius: '10px',
                            border: `1px solid ${accountRole.isAvailable ? roleColor.border : '#e2e8f0'}`,
                            backgroundColor: accountRole.isAvailable ? roleColor.bg : '#f8fafc',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            gap: '0.75rem',
                            transition: 'all 0.15s ease',
                            opacity: accountRole.isAvailable ? 1 : 0.6,
                          }}
                        >
                          <div>
                            {/* Role Header */}
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                              <div
                                style={{
                                  width: '34px',
                                  height: '34px',
                                  borderRadius: '8px',
                                  backgroundColor: '#ffffff',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  border: `1px solid ${roleColor.border}`,
                                  color: roleColor.icon,
                                  flexShrink: 0,
                                }}
                              >
                                <IconComponent size={18} />
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div
                                  style={{
                                    fontWeight: 800,
                                    fontSize: '0.875rem',
                                    color: roleColor.text,
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                  }}
                                >
                                  {accountRole.roleName}
                                </div>
                                <div
                                  style={{
                                    fontSize: '0.75rem',
                                    color: '#64748b',
                                    marginTop: '0.15rem',
                                    lineHeight: 1.35,
                                  }}
                                >
                                  {accountRole.description}
                                </div>
                              </div>
                            </div>

                            {/* Account Status Pill */}
                            <div style={{ marginTop: '0.65rem' }}>
                              {accountRole.isAvailable ? (
                                <div
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.35rem',
                                    padding: '0.2rem 0.5rem',
                                    borderRadius: '6px',
                                    backgroundColor: '#ffffff',
                                    border: '1px solid #cbd5e1',
                                    fontSize: '0.6875rem',
                                    color: '#334155',
                                    fontFamily: 'monospace',
                                  }}
                                >
                                  <span
                                    style={{
                                      width: '6px',
                                      height: '6px',
                                      borderRadius: '50%',
                                      backgroundColor: '#16a34a',
                                    }}
                                  />
                                  <span>{accountRole.email}</span>
                                </div>
                              ) : (
                                <span
                                  style={{
                                    fontSize: '0.6875rem',
                                    color: '#94a3b8',
                                    fontStyle: 'italic',
                                  }}
                                >
                                  No development account configured
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Quick Action Button */}
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                              type="button"
                              onClick={() => {
                                if (accountRole.email) {
                                  setEmail(accountRole.email);
                                  setPassword('Kisan@123');
                                }
                              }}
                              style={{
                                flex: 1,
                                padding: '0.4rem 0.65rem',
                                borderRadius: '6px',
                                border: '1px solid #cbd5e1',
                                backgroundColor: '#ffffff',
                                color: '#475569',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                              }}
                            >
                              Fill Form
                            </button>

                            <button
                              type="button"
                              disabled={!accountRole.isAvailable || !!quickLoginRoleLoading}
                              onClick={() => handleQuickLoginRole(accountRole)}
                              style={{
                                flex: 1.5,
                                padding: '0.4rem 0.75rem',
                                borderRadius: '6px',
                                border: 'none',
                                backgroundColor: accountRole.isAvailable ? '#15803d' : '#e2e8f0',
                                color: accountRole.isAvailable ? '#ffffff' : '#94a3b8',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                cursor: accountRole.isAvailable && !quickLoginRoleLoading ? 'pointer' : 'not-allowed',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.35rem',
                                boxShadow: accountRole.isAvailable
                                  ? '0 2px 4px rgba(21, 128, 61, 0.25)'
                                  : 'none',
                              }}
                            >
                              {isLoadingThis ? (
                                <>
                                  <Loader2 size={13} className="animate-spin" />
                                  <span>Signing in...</span>
                                </>
                              ) : (
                                <>
                                  <span>Use this account</span>
                                  <ArrowRight size={13} />
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
