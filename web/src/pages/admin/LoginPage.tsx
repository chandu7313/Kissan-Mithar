import React, { useState, useEffect } from 'react';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Loader2,
  Globe,
  LogIn,
  Info,
  Code2,
  Shield,
  Settings,
  Users,
  Sprout,
  ShoppingBasket,
  Headphones,
  Tractor,
  Folder,
  Megaphone,
  BarChart3,
  GraduationCap,
  TrendingUp,
} from 'lucide-react';
import { UserSession, DevAccountRole } from '../../types/index.js';
import { AuthStore } from '../../services/authStore.js';
import { AuthApi } from '../../api/auth.api.js';

interface Props {
  onLoginSuccess: (session: UserSession) => void;
  onBackToHome?: () => void;
}

// Visual definition for the 10 company roles matching the screenshot design
const ROLE_UI_SPECS: Record<
  string,
  {
    name: string;
    description: string;
    icon: React.ComponentType<any>;
    iconColor: string;
    iconBg: string;
    column: 1 | 2;
    order: number;
  }
> = {
  SUPER_ADMIN: {
    name: 'Founder / Super Admin',
    description: 'Full system access',
    icon: Shield,
    iconColor: '#d97706',
    iconBg: '#fef3c7',
    column: 1,
    order: 1,
  },
  SYSTEM_ADMIN: {
    name: 'System Administrator',
    description: 'Manage system health & settings',
    icon: Settings,
    iconColor: '#2563eb',
    iconBg: '#dbeafe',
    column: 1,
    order: 2,
  },
  OPERATIONS_MANAGER: {
    name: 'Operations Manager',
    description: 'Oversee daily operations',
    icon: Users,
    iconColor: '#0284c7',
    iconBg: '#e0f2fe',
    column: 1,
    order: 3,
  },
  AGRONOMY_EXPERT: {
    name: 'Agriculture Expert',
    description: 'Provide expert advisory',
    icon: Sprout,
    iconColor: '#16a34a',
    iconBg: '#dcfce7',
    column: 1,
    order: 4,
  },
  PROCUREMENT_MANAGER: {
    name: 'Procurement Manager',
    description: 'Manage Agri Bazaar & procurement',
    icon: ShoppingBasket,
    iconColor: '#e11d48',
    iconBg: '#ffe4e6',
    column: 1,
    order: 5,
  },
  FARMER_SUPPORT: {
    name: 'Farmer Support Executive',
    description: 'Handle farmer inquiries',
    icon: Headphones,
    iconColor: '#9333ea',
    iconBg: '#f3e8ff',
    column: 2,
    order: 1,
  },
  FIELD_COORDINATOR: {
    name: 'Field Services Coordinator',
    description: 'Manage labour & machinery',
    icon: Tractor,
    iconColor: '#15803d',
    iconBg: '#dcfce7',
    column: 2,
    order: 2,
  },
  FINANCE_COMPLIANCE: {
    name: 'Finance & Compliance Officer',
    description: 'View financial records & reports',
    icon: Folder,
    iconColor: '#ca8a04',
    iconBg: '#fef9c3',
    column: 2,
    order: 3,
  },
  MARKETING_MANAGER: {
    name: 'Marketing & Content Manager',
    description: 'Manage content & communications',
    icon: Megaphone,
    iconColor: '#dc2626',
    iconBg: '#fee2e2',
    column: 2,
    order: 4,
  },
  BUSINESS_ANALYST: {
    name: 'Business Analyst / Auditor',
    description: 'View reports & analytics (read-only)',
    icon: BarChart3,
    iconColor: '#4f46e5',
    iconBg: '#e0e7ff',
    column: 2,
    order: 5,
  },
};

export const LoginPage: React.FC<Props> = ({ onLoginSuccess, onBackToHome }) => {
  // Check if running in development environment
  const isDev =
    import.meta.env.DEV ||
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1';

  // State
  const [email, setEmail] = useState<string>(() => {
    return localStorage.getItem('kissan_mithar_remembered_email') || '';
  });
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(() => {
    return !!localStorage.getItem('kissan_mithar_remembered_email');
  });

  // UI Flow States
  const [isForgotPassword, setIsForgotPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Quick Login Collapsible State & Real DB Accounts
  const [quickLoginOpen, setQuickLoginOpen] = useState<boolean>(true);
  const [devAccounts, setDevAccounts] = useState<DevAccountRole[]>([]);
  const [loadingDevAccounts, setLoadingDevAccounts] = useState<boolean>(false);
  const [submittingRole, setSubmittingRole] = useState<string | null>(null);

  // Reset Password Fields
  const [resetEmail, setResetEmail] = useState<string>('');
  const [resetOtp, setResetOtp] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [otpCountdown, setOtpCountdown] = useState<number>(0);

  // Timer for OTP resend cooldown
  useEffect(() => {
    let timer: any;
    if (otpCountdown > 0) {
      timer = setInterval(() => setOtpCountdown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [otpCountdown]);

  // Load real development accounts from database in development mode
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

  // --- Production Form Submit ---
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMessage('Please enter your registered email address.');
      return;
    }
    if (!password.trim()) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await AuthApi.loginWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

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
      }, 400);
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.message ||
          err.message ||
          'Authentication failed. Please verify your credentials or contact administration.'
      );
    } finally {
      setLoading(false);
    }
  };

  // --- Quick-Login Action (Authenticates Real Development Account) ---
  const handleUseAccount = async (roleKey: string) => {
    const accountInfo = devAccounts.find((a) => a.roleKey === roleKey);
    if (!accountInfo || !accountInfo.isAvailable || !accountInfo.email) {
      setErrorMessage(`No development account configured for this role.`);
      return;
    }

    setEmail(accountInfo.email);
    setPassword('Kisan@123');
    setSubmittingRole(roleKey);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      // Submits real credentials through the standard backend authentication endpoint
      const res = await AuthApi.loginWithPassword({
        email: accountInfo.email,
        password: 'Kisan@123',
      });

      const role = res.user?.role;
      if (!role || !res.user?.userId) {
        throw new Error('Invalid authentication response from server.');
      }

      setIsSuccess(true);
      setSuccessMessage(`Signed in as ${accountInfo.roleName}. Redirecting...`);

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
      }, 400);
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.message ||
          err.message ||
          `Failed to sign in as ${accountInfo.roleName}. Please check credentials.`
      );
    } finally {
      setSubmittingRole(null);
    }
  };

  // --- Password Reset Handlers ---
  const handleSendResetOtp = async () => {
    if (!resetEmail.trim() || !resetEmail.includes('@')) {
      setErrorMessage('Please enter a valid registered email address.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await AuthApi.sendEmailOtp({
        email: resetEmail.trim(),
        purpose: 'RESET_PASSWORD',
      });
      setOtpCountdown(60);
      setSuccessMessage(res.message || `Password reset code sent to ${resetEmail}`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to dispatch reset code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim() || !resetOtp.trim() || !newPassword.trim()) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }
    if (newPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
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
      }, 1200);
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
        flexDirection: 'row',
        backgroundColor: '#ffffff',
        fontFamily: "'Inter', sans-serif",
        overflowX: 'hidden',
      }}
    >
      {/* ============================================================ */}
      {/* LEFT PANEL: HERO & BRAND STORY (MATCHING PROVIDED IMAGE)      */}
      {/* ============================================================ */}
      <div
        style={{
          flex: '1 1 50%',
          position: 'relative',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '2.75rem 3.5rem',
          boxSizing: 'border-box',
          backgroundImage: 'url(/assets/loginpage-img.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center bottom',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Soft top gradient to ensure crystal-clear text contrast */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.78) 32%, rgba(255,255,255,0.15) 55%, rgba(0,0,0,0.1) 100%)',
            pointerEvents: 'none',
          }}
        />

        {/* Decorative translucent organic green leaf curves at upper right */}
        <svg
          style={{
            position: 'absolute',
            top: '80px',
            right: '-10px',
            width: '280px',
            height: '280px',
            opacity: 0.28,
            pointerEvents: 'none',
          }}
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M50 160C80 90 140 60 190 40C180 110 140 160 80 180C65 185 55 175 50 160Z"
            fill="#16a34a"
          />
          <path
            d="M30 190C60 140 110 110 160 90C150 150 110 190 60 200C45 205 35 200 30 190Z"
            fill="#22c55e"
          />
        </svg>

        {/* Top Header Bar inside Left Hero */}
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
          }}
        >
          {/* Brand Logo & Slogan */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                backgroundColor: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                padding: '4px',
              }}
            >
              <img
                src="/kissan_mithar_logo_v2.png"
                alt="Kissan Mithar"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </div>
            <div>
              <div
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: '1.45rem',
                  fontWeight: 800,
                  color: '#0f172a',
                  lineHeight: 1.1,
                  letterSpacing: '-0.02em',
                }}
              >
                Kissan Mithar
              </div>
              <div
                style={{
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: '#475569',
                  marginTop: '0.15rem',
                }}
              >
                For a Prosperous Farmer
              </div>
            </div>
          </div>

          {/* Handwritten Tagline: "Empowering Farmers. Growing Together." */}
          <div
            style={{
              fontFamily: "'Caveat', cursive",
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#14532d',
              lineHeight: 1.15,
              textAlign: 'left',
              transform: 'rotate(-4deg)',
              userSelect: 'none',
            }}
          >
            <div>Empowering</div>
            <div>Farmers.</div>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              Growing Together.
              <span
                style={{
                  position: 'absolute',
                  left: 0,
                  bottom: '-3px',
                  width: '100%',
                  height: '3px',
                  backgroundColor: '#16a34a',
                  borderRadius: '2px',
                }}
              />
            </div>
          </div>
        </div>

        {/* Hero Middle Content: Headline, Subtitle, & 4 Value Props */}
        <div style={{ position: 'relative', zIndex: 2, margin: '2rem 0' }}>
          <h1
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: '2.5rem',
              fontWeight: 800,
              color: '#06291a',
              lineHeight: 1.18,
              letterSpacing: '-0.03em',
              margin: '0 0 1rem 0',
              maxWidth: '560px',
            }}
          >
            A Stronger
            <br />
            Agriculture Ecosystem
            <br />
            for a Brighter Tomorrow
          </h1>

          <p
            style={{
              fontSize: '0.9375rem',
              color: '#334155',
              lineHeight: 1.55,
              maxWidth: '520px',
              margin: '0 0 2rem 0',
              fontWeight: 500,
            }}
          >
            Kissan Mithar connects farmers, experts, markets and resources to build a more sustainable
            and prosperous agricultural community.
          </p>

          {/* 4 Feature Cards in a row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '1rem',
              maxWidth: '680px',
            }}
          >
            {/* Feature 1 */}
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.94)',
                backdropFilter: 'blur(10px)',
                borderRadius: '12px',
                padding: '1rem 0.85rem',
                border: '1px solid rgba(255, 255, 255, 0.8)',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: '#dcfce7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#16a34a',
                  marginBottom: '0.65rem',
                }}
              >
                <Sprout size={18} />
              </div>
              <div style={{ fontWeight: 800, fontSize: '0.8125rem', color: '#0f172a' }}>
                Farmers First
              </div>
              <div style={{ fontSize: '0.6875rem', color: '#64748b', marginTop: '0.2rem', lineHeight: 1.35 }}>
                Better support.
                <br />
                Greater opportunities.
              </div>
            </div>

            {/* Feature 2 */}
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.94)',
                backdropFilter: 'blur(10px)',
                borderRadius: '12px',
                padding: '1rem 0.85rem',
                border: '1px solid rgba(255, 255, 255, 0.8)',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: '#dbeafe',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#2563eb',
                  marginBottom: '0.65rem',
                }}
              >
                <GraduationCap size={18} />
              </div>
              <div style={{ fontWeight: 800, fontSize: '0.8125rem', color: '#0f172a' }}>
                Expert Guidance
              </div>
              <div style={{ fontSize: '0.6875rem', color: '#64748b', marginTop: '0.2rem', lineHeight: 1.35 }}>
                From soil to markets,
                <br />
                we're with you.
              </div>
            </div>

            {/* Feature 3 */}
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.94)',
                backdropFilter: 'blur(10px)',
                borderRadius: '12px',
                padding: '1rem 0.85rem',
                border: '1px solid rgba(255, 255, 255, 0.8)',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: '#e0e7ff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#4f46e5',
                  marginBottom: '0.65rem',
                }}
              >
                <Users size={18} />
              </div>
              <div style={{ fontWeight: 800, fontSize: '0.8125rem', color: '#0f172a' }}>
                Stronger Markets
              </div>
              <div style={{ fontSize: '0.6875rem', color: '#64748b', marginTop: '0.2rem', lineHeight: 1.35 }}>
                More value for
                <br />
                every harvest.
              </div>
            </div>

            {/* Feature 4 */}
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.94)',
                backdropFilter: 'blur(10px)',
                borderRadius: '12px',
                padding: '1rem 0.85rem',
                border: '1px solid rgba(255, 255, 255, 0.8)',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: '#dcfce7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#16a34a',
                  marginBottom: '0.65rem',
                }}
              >
                <TrendingUp size={18} />
              </div>
              <div style={{ fontWeight: 800, fontSize: '0.8125rem', color: '#0f172a' }}>
                Sustainable Growth
              </div>
              <div style={{ fontSize: '0.6875rem', color: '#64748b', marginTop: '0.2rem', lineHeight: 1.35 }}>
                Healthy farms.
                <br />
                Thriving communities.
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Floating Quote Box */}
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            alignSelf: 'flex-end',
            maxWidth: '320px',
            backgroundColor: 'rgba(12, 38, 26, 0.88)',
            backdropFilter: 'blur(12px)',
            borderRadius: '14px',
            padding: '1rem 1.25rem',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            boxShadow: '0 12px 32px rgba(0, 0, 0, 0.3)',
            color: '#ffffff',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
            <div
              style={{
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                backgroundColor: '#16a34a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                flexShrink: 0,
                marginTop: '2px',
              }}
            >
              <Sprout size={14} />
            </div>
            <div>
              <div
                style={{
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  lineHeight: 1.4,
                  color: '#f8fafc',
                  fontStyle: 'italic',
                }}
              >
                “When farmers grow, communities prosper.”
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.35rem' }}>
                — Kissan Mithar
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* RIGHT PANEL: LOGIN & DEVELOPER QUICK LOGIN (MATCHING SCREEN)  */}
      {/* ============================================================ */}
      <div
        style={{
          flex: '1 1 50%',
          minHeight: '100vh',
          backgroundColor: '#f8fafc',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '2.5rem 3rem',
          boxSizing: 'border-box',
          overflowY: 'auto',
        }}
      >
        {/* Top Navigation Row: Language Selector & Back Button */}
        <div
          style={{
            width: '100%',
            maxWidth: '620px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.25rem',
          }}
        >
          {onBackToHome ? (
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
              <ArrowLeft size={14} />
              <span>Back to Website</span>
            </button>
          ) : (
            <div />
          )}

          {/* Language Selector Pill */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.4rem 0.85rem',
              borderRadius: '9999px',
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              fontSize: '0.8125rem',
              color: '#334155',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
            }}
          >
            <Globe size={14} color="#64748b" />
            <span>English</span>
            <ChevronDown size={14} color="#94a3b8" />
          </div>
        </div>

        {/* White Card Container */}
        <div
          style={{
            width: '100%',
            maxWidth: '620px',
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            padding: '2.25rem 2.25rem',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.05)',
            border: '1px solid #f1f5f9',
            boxSizing: 'border-box',
          }}
        >
          {/* Card Header */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div
              style={{
                fontSize: '0.75rem',
                fontWeight: 800,
                color: '#15803d',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                marginBottom: '0.35rem',
              }}
            >
              KISSAN MITHAR ADMIN PORTAL
            </div>
            <h2
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: '2rem',
                fontWeight: 800,
                color: '#0f172a',
                margin: 0,
                letterSpacing: '-0.025em',
              }}
            >
              Welcome back
            </h2>
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

          {/* Feedback Alerts */}
          {errorMessage && (
            <div
              role="alert"
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#991b1b',
                fontSize: '0.8125rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                marginBottom: '1.25rem',
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
                borderRadius: '8px',
                backgroundColor: '#f0fdf4',
                border: '1px solid #bbf7d0',
                color: '#166534',
                fontSize: '0.8125rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                marginBottom: '1.25rem',
              }}
            >
              <CheckCircle2 size={18} color="#16a34a" style={{ flexShrink: 0 }} />
              <span>{successMessage}</span>
            </div>
          )}

          {/* ---------------------------------------------------- */}
          {/* MAIN LOGIN FORM (MATCHING SCREENSHOT)                */}
          {/* ---------------------------------------------------- */}
          {!isForgotPassword ? (
            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
              {/* Field 1: Email Address */}
              <div>
                <label
                  htmlFor="admin-email-input"
                  style={{
                    display: 'block',
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    color: '#0f172a',
                    marginBottom: '0.45rem',
                  }}
                >
                  Email address
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="admin-email-input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    autoComplete="email"
                    required
                    style={{
                      width: '100%',
                      padding: '0.7rem 0.85rem 0.7rem 2.45rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.875rem',
                      boxSizing: 'border-box',
                      outline: 'none',
                      color: '#0f172a',
                      backgroundColor: '#ffffff',
                      transition: 'border-color 0.15s ease',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = '#16a34a')}
                    onBlur={(e) => (e.target.style.borderColor = '#cbd5e1')}
                  />
                  <Mail
                    size={16}
                    color="#94a3b8"
                    style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }}
                  />
                </div>
              </div>

              {/* Field 2: Password with Forgot password? link */}
              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.45rem',
                  }}
                >
                  <label
                    htmlFor="admin-password-input"
                    style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0f172a' }}
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
                      fontSize: '0.8125rem',
                      color: '#2563eb',
                      fontWeight: 600,
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    Forgot password?
                  </button>
                </div>

                <div style={{ position: 'relative' }}>
                  <input
                    id="admin-password-input"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                    style={{
                      width: '100%',
                      padding: '0.7rem 2.5rem 0.7rem 2.45rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.875rem',
                      boxSizing: 'border-box',
                      outline: 'none',
                      color: '#0f172a',
                      backgroundColor: '#ffffff',
                      transition: 'border-color 0.15s ease',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = '#16a34a')}
                    onBlur={(e) => (e.target.style.borderColor = '#cbd5e1')}
                  />
                  <Lock
                    size={16}
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
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Remember me Checkbox */}
              <div>
                <label
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.8125rem',
                    color: '#475569',
                    cursor: 'pointer',
                    userSelect: 'none',
                    fontWeight: 500,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => handleRememberMeChange(e.target.checked)}
                    style={{
                      accentColor: '#0a3d2e',
                      width: '16px',
                      height: '16px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  />
                  <span>Remember me</span>
                </label>
              </div>

              {/* Sign in Button */}
              <button
                type="submit"
                disabled={loading || isSuccess}
                style={{
                  width: '100%',
                  height: '46px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: isSuccess ? '#16a34a' : '#083325',
                  color: '#ffffff',
                  fontSize: '0.9375rem',
                  fontWeight: 700,
                  cursor: loading || isSuccess ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  marginTop: '0.25rem',
                  boxShadow: '0 4px 12px rgba(8, 51, 37, 0.25)',
                  transition: 'background-color 0.15s ease',
                  opacity: loading ? 0.75 : 1,
                }}
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : isSuccess ? (
                  <>
                    <CheckCircle2 size={16} />
                    <span>Authenticated</span>
                  </>
                ) : (
                  <>
                    <LogIn size={16} />
                    <span>Sign in</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Forgot Password Flow */
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
                  onClick={() => setIsForgotPassword(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '0.75rem',
                    color: '#2563eb',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Back to Sign In
                </button>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.35rem' }}>
                  Registered Email Address
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="Enter email"
                    required
                    style={{
                      flex: 1,
                      padding: '0.6rem 0.75rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.8125rem',
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleSendResetOtp}
                    disabled={loading || otpCountdown > 0}
                    style={{
                      padding: '0.6rem 0.85rem',
                      backgroundColor: otpCountdown > 0 ? '#e2e8f0' : '#083325',
                      color: otpCountdown > 0 ? '#64748b' : '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: otpCountdown > 0 || loading ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {otpCountdown > 0 ? `Resend (${otpCountdown}s)` : 'Send OTP'}
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.35rem' }}>
                  6-Digit OTP Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={resetOtp}
                  onChange={(e) => setResetOtp(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="• • • • • •"
                  required
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '1.1rem',
                    textAlign: 'center',
                    letterSpacing: '0.25em',
                    fontWeight: 800,
                    boxSizing: 'border-box',
                    fontFamily: 'monospace',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.35rem' }}>
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  required
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.8125rem',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.35rem' }}>
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  required
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.8125rem',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsForgotPassword(false)}
                  style={{
                    flex: 1,
                    padding: '0.6rem',
                    borderRadius: '8px',
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
                    padding: '0.6rem',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#083325',
                    color: '#ffffff',
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    cursor: loading ? 'not-allowed' : 'pointer',
                  }}
                >
                  {loading ? 'Saving...' : 'Save New Password'}
                </button>
              </div>
            </form>
          )}

          {/* OR Divider */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              margin: '1.5rem 0',
              color: '#94a3b8',
              fontSize: '0.75rem',
              fontWeight: 700,
            }}
          >
            <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }} />
            <span style={{ padding: '0 0.85rem' }}>OR</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }} />
          </div>

          {/* ============================================================ */}
          {/* DEVELOPER QUICK LOGIN SECTION (MATCHING SCREENSHOT)           */}
          {/* ============================================================ */}
          <div
            style={{
              backgroundColor: '#f6fcf8',
              borderRadius: '12px',
              border: '1px solid #e0f2e9',
              padding: '1.25rem',
            }}
          >
            {/* Quick Login Header with Chevron */}
            <div
              onClick={() => setQuickLoginOpen(!quickLoginOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                userSelect: 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '6px',
                    backgroundColor: '#dcfce7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#16a34a',
                  }}
                >
                  <Code2 size={16} />
                </div>
                <div>
                  <div
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: 800,
                      color: '#0f172a',
                      lineHeight: 1.2,
                    }}
                  >
                    Developer Quick Login — Development Only
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.15rem' }}>
                    Use these accounts for faster access during development.
                  </div>
                </div>
              </div>

              <div style={{ color: '#64748b' }}>
                {quickLoginOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </div>
            </div>

            {quickLoginOpen && (
              <div style={{ marginTop: '1rem' }}>
                {/* Cyan Info Callout Banner */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.5rem',
                    backgroundColor: '#e0f2fe',
                    borderRadius: '8px',
                    border: '1px solid #bae6fd',
                    padding: '0.65rem 0.85rem',
                    fontSize: '0.75rem',
                    color: '#0369a1',
                    lineHeight: 1.4,
                    marginBottom: '1rem',
                  }}
                >
                  <Info size={15} color="#0284c7" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    These are real accounts from your development database.
                    <br />
                    Please do not use them in production.
                  </div>
                </div>

                {/* 2-Column Grid of 10 Roles */}
                {loadingDevAccounts ? (
                  <div
                    style={{
                      padding: '1.5rem',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.5rem',
                      color: '#64748b',
                    }}
                  >
                    <Loader2 size={20} className="animate-spin" color="#16a34a" />
                    <span style={{ fontSize: '0.75rem' }}>Checking database accounts...</span>
                  </div>
                ) : (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '0.75rem',
                    }}
                  >
                    {/* Render roles in 2 columns according to specification */}
                    {Object.entries(ROLE_UI_SPECS)
                      .sort((a, b) => {
                        if (a[1].column !== b[1].column) return a[1].column - b[1].column;
                        return a[1].order - b[1].order;
                      })
                      .map(([roleKey, spec]) => {
                        const account = devAccounts.find((a) => a.roleKey === roleKey);
                        const isSubmitting = submittingRole === roleKey;
                        const IconComponent = spec.icon;

                        return (
                          <div
                            key={roleKey}
                            style={{
                              backgroundColor: '#ffffff',
                              borderRadius: '8px',
                              border: '1px solid #f1f5f9',
                              padding: '0.75rem 0.85rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: '0.5rem',
                              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', minWidth: 0 }}>
                              <div
                                style={{
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '6px',
                                  backgroundColor: spec.iconBg,
                                  color: spec.iconColor,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  flexShrink: 0,
                                }}
                              >
                                <IconComponent size={16} />
                              </div>
                              <div style={{ minWidth: 0 }}>
                                <div
                                  style={{
                                    fontWeight: 700,
                                    fontSize: '0.8125rem',
                                    color: '#0f172a',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    lineHeight: 1.2,
                                  }}
                                >
                                  {spec.name}
                                </div>
                                <div
                                  style={{
                                    fontSize: '0.6875rem',
                                    color: '#64748b',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    marginTop: '2px',
                                  }}
                                >
                                  {spec.description}
                                </div>
                              </div>
                            </div>

                            <button
                              type="button"
                              disabled={isSubmitting || loading || isSuccess}
                              onClick={() => handleUseAccount(roleKey)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                padding: '0.35rem 0.55rem',
                                borderRadius: '4px',
                                backgroundColor: '#f0fdf4',
                                border: '1px solid #bbf7d0',
                                color: '#166534',
                                fontSize: '0.6875rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                                flexShrink: 0,
                                transition: 'all 0.15s ease',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#dcfce7';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#f0fdf4';
                              }}
                            >
                              {isSubmitting ? (
                                <Loader2 size={11} className="animate-spin" />
                              ) : (
                                <>
                                  <span>Use this account</span>
                                  <ArrowRight size={10} />
                                </>
                              )}
                            </button>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
