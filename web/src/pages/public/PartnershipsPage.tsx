import React, { useState } from 'react';
import {
  Sparkles, ArrowRight, CheckCircle2, Building2, User, Mail, Phone,
  Globe, MapPin, Upload, FileText, Check, AlertCircle, Loader2,
  Sprout, Factory, Users, Tractor, Cpu, GraduationCap, ShoppingBag, Compass
} from 'lucide-react';
import { PublicNavbar } from '../../components/layout/PublicNavbar.js';
import { CollaborationApi, CollaborationSubmitPayload } from '../../api/collaboration.api.js';

interface PartnershipsPageProps {
  onNavigateHome: () => void;
  onAdminLogin: () => void;
  onNavigateSection?: (sectionId: string) => void;
  onNavigateService?: (slug: string) => void;
}

const CATEGORIES = [
  {
    id: 'agri-input',
    title: 'Agri-input Companies',
    desc: 'Seeds, fertilizers, crop protection and farming equipment.',
    icon: Sprout,
    image: '/assets/services/seed.jpg',
    color: '#16a34a',
    bg: '#dcfce7',
  },
  {
    id: 'buyers',
    title: 'Buyers & Procurement',
    desc: 'Rice mills, feed processors, wholesalers, distributors and bulk crop buyers.',
    icon: Factory,
    image: '/assets/services/market.jpg',
    color: '#d97706',
    bg: '#fef3c7',
  },
  {
    id: 'fpos',
    title: 'FPOs & Farmer Organizations',
    desc: 'Farmer producer organizations, cooperatives and rural networks.',
    icon: Users,
    image: '/assets/labour_group_1.jpg',
    color: '#2563eb',
    bg: '#dbeafe',
  },
  {
    id: 'services',
    title: 'Agricultural Service Providers',
    desc: 'Expert consultancy, soil testing, machinery, labour and other farmer services.',
    icon: Tractor,
    image: '/assets/machinery_tractor.jpg',
    color: '#059669',
    bg: '#d1fae5',
  },
  {
    id: 'tech',
    title: 'Technology Partners',
    desc: 'Agriculture software, AI, weather data, logistics and digital infrastructure.',
    icon: Cpu,
    image: '/assets/ai-bot.png',
    color: '#0284c7',
    bg: '#e0f2fe',
  },
  {
    id: 'institutions',
    title: 'NGOs, Research & Institutions',
    desc: 'Development organizations, academic institutions and research partners.',
    icon: GraduationCap,
    image: '/assets/services/expert.jpg',
    color: '#7c3aed',
    bg: '#ede9fe',
  },
  {
    id: 'retail',
    title: 'Distribution & Retail Partners',
    desc: 'Retail chains, agri-stores and private-label manufacturing.',
    icon: ShoppingBag,
    image: '/assets/agri_market_banner.jpg',
    color: '#ea580c',
    bg: '#ffedd5',
  },
  {
    id: 'other',
    title: 'Other Strategic Collaborations',
    desc: "Have a unique idea? We're open to exploring new opportunities.",
    icon: Compass,
    image: '/assets/farmer_hero_banner.jpg',
    color: '#4f46e5',
    bg: '#e0e7ff',
  },
];

export const PartnershipsPage: React.FC<PartnershipsPageProps> = ({
  onNavigateHome,
  onAdminLogin,
  onNavigateSection,
  onNavigateService,
}) => {
  // Form State
  const [formData, setFormData] = useState<CollaborationSubmitPayload>({
    companyName: '',
    contactPerson: '',
    officialEmail: '',
    phoneNumber: '',
    organizationType: 'Agri-input Companies',
    collaborationCategory: 'Input Supply & Distribution',
    country: 'India',
    state: 'Telangana',
    cityDistrict: '',
    website: '',
    proposalDescription: '',
    expectedOutcomes: '',
    consentAgreed: true,
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submissionSuccess, setSubmissionSuccess] = useState<{
    referenceId: string;
    companyName: string;
  } | null>(null);

  const scrollToForm = () => {
    const el = document.getElementById('collaboration-form');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToCategories = () => {
    const el = document.getElementById('collaboration-categories');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleInputChange = (field: keyof CollaborationSubmitPayload, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        setErrorMessage('File size must be 10MB or less.');
        return;
      }
      setSelectedFile(file);
      setErrorMessage(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!formData.companyName.trim()) {
      setErrorMessage('Company / Organization name is required.');
      return;
    }
    if (!formData.contactPerson.trim()) {
      setErrorMessage('Contact person name is required.');
      return;
    }
    if (!formData.officialEmail.trim()) {
      setErrorMessage('Official business email is required.');
      return;
    }
    if (!formData.phoneNumber.trim()) {
      setErrorMessage('Phone number is required.');
      return;
    }
    if (!formData.proposalDescription.trim()) {
      setErrorMessage('Please provide a brief description of your proposal.');
      return;
    }
    if (!formData.consentAgreed) {
      setErrorMessage('You must agree to the privacy policy and data usage consent.');
      return;
    }

    setSubmitting(true);
    try {
      const payload: CollaborationSubmitPayload = {
        ...formData,
        documentName: selectedFile ? selectedFile.name : undefined,
        documentSizeBytes: selectedFile ? selectedFile.size : undefined,
      };

      const res = await CollaborationApi.submit(payload);
      setSubmissionSuccess({
        referenceId: res.data.referenceId,
        companyName: res.data.companyName,
      });
      window.scrollTo({ top: document.getElementById('collaboration-form')?.offsetTop || 0, behavior: 'smooth' });
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || err.message || 'Failed to submit collaboration request.';
      setErrorMessage(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '100vh', color: '#0f172a' }}>
      {/* 1. Navbar */}
      <PublicNavbar
        onAdminLogin={onAdminLogin}
        onNavigateSection={onNavigateSection}
        onNavigateService={onNavigateService}
      />

      {/* 2. Hero Section */}
      <section
        style={{
          position: 'relative',
          paddingTop: '6rem',
          paddingBottom: '4.5rem',
          backgroundColor: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          overflow: 'hidden',
        }}
      >
        {/* Background Visual Overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'url(/assets/partnership_handshake.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'right 30%',
            opacity: 0.18,
            pointerEvents: 'none',
          }}
        />

        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(90deg, rgba(248,250,252,0.98) 0%, rgba(248,250,252,0.92) 50%, rgba(248,250,252,0.6) 100%)',
            pointerEvents: 'none',
          }}
        />

        <div
          style={{
            maxWidth: '1240px',
            margin: '0 auto',
            padding: '0 1.5rem',
            position: 'relative',
            zIndex: 2,
          }}
        >
          {/* Badge & Handwritten Accent */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1rem',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.75rem',
                fontWeight: 800,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#15803d',
                backgroundColor: '#dcfce7',
                padding: '0.4rem 0.85rem',
                borderRadius: '9999px',
                border: '1px solid #bbf7d0',
              }}
            >
              <Sparkles size={13} color="#16a34a" />
              PARTNERSHIP OPPORTUNITIES
            </span>

            {/* Handwritten Tagline: Partnerships for a sustainable tomorrow */}
            <div
              style={{
                fontFamily: "'Caveat', cursive",
                fontSize: '1.65rem',
                fontWeight: 700,
                color: '#15803d',
                transform: 'rotate(-2deg)',
                userSelect: 'none',
              }}
            >
              🍃 Partnerships for a sustainable tomorrow
            </div>
          </div>

          {/* Hero Title */}
          <h1
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: '3.25rem',
              fontWeight: 800,
              color: '#06291a',
              lineHeight: 1.15,
              letterSpacing: '-0.03em',
              margin: '0 0 1.25rem 0',
              maxWidth: '780px',
            }}
          >
            Let's Build a Stronger
            <br />
            Agricultural Ecosystem <span style={{ color: '#16a34a' }}>Together.</span>
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontSize: '1.1rem',
              color: '#475569',
              lineHeight: 1.6,
              maxWidth: '660px',
              margin: '0 0 2rem 0',
              fontWeight: 500,
            }}
          >
            We collaborate with organizations that share our vision of empowering farmers, strengthening
            agricultural supply chains, and creating sustainable growth across the farming ecosystem.
          </p>

          {/* Hero CTAs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={scrollToForm}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.55rem',
                padding: '0.9rem 1.85rem',
                borderRadius: '10px',
                backgroundColor: '#15803d',
                color: '#ffffff',
                fontSize: '1rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 6px 20px rgba(21, 128, 61, 0.35)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#166534')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#15803d')}
            >
              <span>Submit Collaboration Request</span>
              <ArrowRight size={17} />
            </button>

            <button
              type="button"
              onClick={scrollToCategories}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.9rem 1.75rem',
                borderRadius: '10px',
                backgroundColor: '#ffffff',
                color: '#0f172a',
                fontSize: '1rem',
                fontWeight: 700,
                border: '1px solid #cbd5e1',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#94a3b8')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#cbd5e1')}
            >
              <span>Explore Opportunities</span>
            </button>
          </div>
        </div>
      </section>

      {/* 3. Section: "Who can collaborate with us?" */}
      <section
        id="collaboration-categories"
        style={{
          padding: '5rem 1.5rem',
          maxWidth: '1240px',
          margin: '0 auto',
        }}
      >
        <div style={{ marginBottom: '2.5rem' }}>
          <div
            style={{
              width: '40px',
              height: '4px',
              backgroundColor: '#16a34a',
              borderRadius: '2px',
              marginBottom: '1rem',
            }}
          />
          <h2
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: '2.25rem',
              fontWeight: 800,
              color: '#0f172a',
              letterSpacing: '-0.02em',
              margin: '0 0 0.5rem 0',
            }}
          >
            Who can collaborate with us?
          </h2>
          <p style={{ fontSize: '1rem', color: '#64748b', margin: 0, fontWeight: 500 }}>
            We work with a wide range of organizations across the agricultural and rural development ecosystem.
          </p>
        </div>

        {/* 8 Categories Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.id}
                onClick={scrollToForm}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '16px',
                  border: '1px solid #e2e8f0',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.02)',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  minHeight: '220px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#16a34a';
                  e.currentTarget.style.boxShadow = '0 10px 24px rgba(22, 163, 74, 0.08)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e2e8f0';
                  e.currentTarget.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.02)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div>
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '10px',
                      backgroundColor: cat.bg,
                      color: cat.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '0.85rem',
                    }}
                  >
                    <Icon size={20} />
                  </div>
                  <h3
                    style={{
                      fontSize: '1rem',
                      fontWeight: 800,
                      color: '#0f172a',
                      margin: '0 0 0.4rem 0',
                      lineHeight: 1.3,
                    }}
                  >
                    {cat.title}
                  </h3>
                  <p
                    style={{
                      fontSize: '0.8125rem',
                      color: '#64748b',
                      margin: 0,
                      lineHeight: 1.45,
                    }}
                  >
                    {cat.desc}
                  </p>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: '1.25rem',
                    paddingTop: '0.75rem',
                    borderTop: '1px solid #f1f5f9',
                  }}
                >
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#16a34a' }}>
                    Partner with us
                  </span>
                  <div
                    style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      backgroundColor: '#f0fdf4',
                      color: '#16a34a',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <ArrowRight size={13} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Section: "Why partner with Kissan Mithar?" & "Submit a Collaboration Request" */}
      <section
        style={{
          padding: '4rem 1.5rem 6rem',
          backgroundColor: '#f8fafc',
          borderTop: '1px solid #e2e8f0',
        }}
      >
        <div
          style={{
            maxWidth: '1240px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))',
            gap: '3rem',
            alignItems: 'start',
          }}
        >
          {/* Left Column: Benefits & Community Stats */}
          <div>
            <div
              style={{
                width: '40px',
                height: '4px',
                backgroundColor: '#16a34a',
                borderRadius: '2px',
                marginBottom: '1rem',
              }}
            />
            <h2
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: '2.25rem',
                fontWeight: 800,
                color: '#0f172a',
                letterSpacing: '-0.02em',
                margin: '0 0 0.5rem 0',
              }}
            >
              Why partner with Kissan Mithar?
            </h2>
            <p
              style={{
                fontSize: '0.9375rem',
                color: '#64748b',
                margin: '0 0 2rem 0',
                lineHeight: 1.5,
              }}
            >
              Together we can create meaningful impact for farmers and the wider agriculture ecosystem.
            </p>

            {/* 4 Checklist Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: '#dcfce7',
                    color: '#16a34a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '2px',
                  }}
                >
                  <Check size={14} strokeWidth={3} />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.9375rem', color: '#0f172a' }}>
                    Access to a growing farmer network
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: '0.15rem' }}>
                    Connect with verified farming communities across multiple agricultural regions.
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: '#dcfce7',
                    color: '#16a34a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '2px',
                  }}
                >
                  <Check size={14} strokeWidth={3} />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.9375rem', color: '#0f172a' }}>
                    Collaborative innovation
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: '0.15rem' }}>
                    Co-create tech-enabled and field-proven solutions for real farmer needs.
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: '#dcfce7',
                    color: '#16a34a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '2px',
                  }}
                >
                  <Check size={14} strokeWidth={3} />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.9375rem', color: '#0f172a' }}>
                    Stronger and more resilient supply chains
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: '0.15rem' }}>
                    Support transparent, direct, and efficient market linkages for producers and buyers.
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: '#dcfce7',
                    color: '#16a34a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '2px',
                  }}
                >
                  <Check size={14} strokeWidth={3} />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.9375rem', color: '#0f172a' }}>
                    Social and economic impact
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: '0.15rem' }}>
                    Directly contribute to sustainable farmer income growth and rural prosperity.
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Stats Card matching reference */}
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                padding: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1.5rem',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
              }}
            >
              <div
                style={{
                  width: '90px',
                  height: '90px',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  flexShrink: 0,
                }}
              >
                <img
                  src="/assets/farmer_hero_banner.jpg"
                  alt="Farmer Partner"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                <div>
                  <div
                    style={{
                      fontFamily: "'Outfit', sans-serif",
                      fontSize: '1.75rem',
                      fontWeight: 800,
                      color: '#15803d',
                      lineHeight: 1,
                    }}
                  >
                    12K+
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem', fontWeight: 600 }}>
                    Active Farmers
                  </div>
                </div>

                <div>
                  <div
                    style={{
                      fontFamily: "'Outfit', sans-serif",
                      fontSize: '1.75rem',
                      fontWeight: 800,
                      color: '#0f172a',
                      lineHeight: 1,
                    }}
                  >
                    6+
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem', fontWeight: 600 }}>
                    States Covered
                  </div>
                </div>

                <div>
                  <div
                    style={{
                      fontFamily: "'Outfit', sans-serif",
                      fontSize: '1.75rem',
                      fontWeight: 800,
                      color: '#0f172a',
                      lineHeight: 1,
                    }}
                  >
                    50+
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem', fontWeight: 600 }}>
                    Partner Discussions
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: "Submit a Collaboration Request" Form */}
          <div
            id="collaboration-form"
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              border: '1px solid #e2e8f0',
              padding: '2.25rem 2rem',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.05)',
            }}
          >
            <h3
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: '1.5rem',
                fontWeight: 800,
                color: '#0f172a',
                margin: '0 0 0.35rem 0',
              }}
            >
              Submit a Collaboration Request
            </h3>
            <p
              style={{
                fontSize: '0.875rem',
                color: '#64748b',
                margin: '0 0 1.5rem 0',
                lineHeight: 1.45,
              }}
            >
              Tell us about your organization and the partnership you have in mind. Our team will review your proposal and get back to you.
            </p>

            {/* Error Message */}
            {errorMessage && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#991b1b',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  fontSize: '0.8125rem',
                  marginBottom: '1.25rem',
                }}
              >
                <AlertCircle size={16} color="#dc2626" style={{ flexShrink: 0 }} />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Success State Confirmation */}
            {submissionSuccess ? (
              <div
                style={{
                  backgroundColor: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '12px',
                  padding: '2rem 1.5rem',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    backgroundColor: '#dcfce7',
                    color: '#16a34a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1rem auto',
                  }}
                >
                  <CheckCircle2 size={28} />
                </div>
                <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#166534', margin: '0 0 0.5rem 0' }}>
                  Collaboration Request Submitted!
                </h4>
                <p style={{ fontSize: '0.875rem', color: '#15803d', margin: '0 0 1.25rem 0' }}>
                  Thank you, <strong>{submissionSuccess.companyName}</strong>. Your request has been recorded in our system.
                </p>

                <div
                  style={{
                    display: 'inline-block',
                    backgroundColor: '#ffffff',
                    border: '1px solid #86efac',
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    color: '#065f46',
                    marginBottom: '1.5rem',
                  }}
                >
                  Reference ID: {submissionSuccess.referenceId}
                </div>

                <div style={{ fontSize: '0.8125rem', color: '#64748b', lineHeight: 1.5, marginBottom: '1.5rem' }}>
                  Our partnerships team reviews all submissions against regional farmer requirements.
                  You will receive an update at your registered email address within 2-3 business days.
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSubmissionSuccess(null);
                    setFormData({
                      companyName: '',
                      contactPerson: '',
                      officialEmail: '',
                      phoneNumber: '',
                      organizationType: 'Agri-input Companies',
                      collaborationCategory: 'Input Supply & Distribution',
                      country: 'India',
                      state: 'Telangana',
                      cityDistrict: '',
                      website: '',
                      proposalDescription: '',
                      expectedOutcomes: '',
                      consentAgreed: true,
                    });
                    setSelectedFile(null);
                  }}
                  style={{
                    padding: '0.65rem 1.25rem',
                    borderRadius: '8px',
                    backgroundColor: '#16a34a',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.8125rem',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  Submit Another Request
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* Row 1: Company Name & Contact Person */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: '#334155',
                        marginBottom: '0.35rem',
                      }}
                    >
                      Company / Organization Name *
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        required
                        value={formData.companyName}
                        onChange={(e) => handleInputChange('companyName', e.target.value)}
                        placeholder="Enter company name"
                        style={{
                          width: '100%',
                          padding: '0.65rem 0.75rem 0.65rem 2.25rem',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.8125rem',
                          boxSizing: 'border-box',
                          outline: 'none',
                        }}
                      />
                      <Building2
                        size={15}
                        color="#94a3b8"
                        style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: '#334155',
                        marginBottom: '0.35rem',
                      }}
                    >
                      Contact Person Name *
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        required
                        value={formData.contactPerson}
                        onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                        placeholder="Enter contact person name"
                        style={{
                          width: '100%',
                          padding: '0.65rem 0.75rem 0.65rem 2.25rem',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.8125rem',
                          boxSizing: 'border-box',
                          outline: 'none',
                        }}
                      />
                      <User
                        size={15}
                        color="#94a3b8"
                        style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Row 2: Official Email & Phone Number */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: '#334155',
                        marginBottom: '0.35rem',
                      }}
                    >
                      Official Email Address *
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="email"
                        required
                        value={formData.officialEmail}
                        onChange={(e) => handleInputChange('officialEmail', e.target.value)}
                        placeholder="name@company.com"
                        style={{
                          width: '100%',
                          padding: '0.65rem 0.75rem 0.65rem 2.25rem',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.8125rem',
                          boxSizing: 'border-box',
                          outline: 'none',
                        }}
                      />
                      <Mail
                        size={15}
                        color="#94a3b8"
                        style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: '#334155',
                        marginBottom: '0.35rem',
                      }}
                    >
                      Phone Number *
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="tel"
                        required
                        value={formData.phoneNumber}
                        onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                        placeholder="+91 98765 43210"
                        style={{
                          width: '100%',
                          padding: '0.65rem 0.75rem 0.65rem 2.25rem',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.8125rem',
                          boxSizing: 'border-box',
                          outline: 'none',
                        }}
                      />
                      <Phone
                        size={15}
                        color="#94a3b8"
                        style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Row 3: Organization Type & Collaboration Category */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: '#334155',
                        marginBottom: '0.35rem',
                      }}
                    >
                      Organization Type *
                    </label>
                    <select
                      value={formData.organizationType}
                      onChange={(e) => handleInputChange('organizationType', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.75rem',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.8125rem',
                        boxSizing: 'border-box',
                        outline: 'none',
                        backgroundColor: '#ffffff',
                      }}
                    >
                      <option value="Agri-input Companies">Agri-input Companies</option>
                      <option value="Buyers & Procurement">Buyers & Procurement</option>
                      <option value="FPOs & Farmer Organizations">FPOs & Farmer Organizations</option>
                      <option value="Agricultural Service Providers">Agricultural Service Providers</option>
                      <option value="Technology Partners">Technology Partners</option>
                      <option value="NGOs, Research & Institutions">NGOs, Research & Institutions</option>
                      <option value="Distribution & Retail Partners">Distribution & Retail Partners</option>
                      <option value="Other Strategic Collaborations">Other Strategic Collaborations</option>
                    </select>
                  </div>

                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: '#334155',
                        marginBottom: '0.35rem',
                      }}
                    >
                      Collaboration Category *
                    </label>
                    <select
                      value={formData.collaborationCategory}
                      onChange={(e) => handleInputChange('collaborationCategory', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.75rem',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.8125rem',
                        boxSizing: 'border-box',
                        outline: 'none',
                        backgroundColor: '#ffffff',
                      }}
                    >
                      <option value="Input Supply & Distribution">Input Supply & Distribution</option>
                      <option value="Direct Crop Procurement">Direct Crop Procurement</option>
                      <option value="Technology & AI Integration">Technology & AI Integration</option>
                      <option value="Agronomy Advisory & Extension">Agronomy Advisory & Extension</option>
                      <option value="Financial & Crop Insurance">Financial & Crop Insurance</option>
                      <option value="Farm Mechanization & Labour">Farm Mechanization & Labour</option>
                      <option value="Joint Research & Impact">Joint Research & Impact</option>
                      <option value="Other">Other Strategic Opportunity</option>
                    </select>
                  </div>
                </div>

                {/* Row 4: Country & State */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: '#334155',
                        marginBottom: '0.35rem',
                      }}
                    >
                      Country *
                    </label>
                    <select
                      value={formData.country}
                      onChange={(e) => handleInputChange('country', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.75rem',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.8125rem',
                        boxSizing: 'border-box',
                        outline: 'none',
                        backgroundColor: '#ffffff',
                      }}
                    >
                      <option value="India">India</option>
                      <option value="Other">Other (International)</option>
                    </select>
                  </div>

                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: '#334155',
                        marginBottom: '0.35rem',
                      }}
                    >
                      State / Region *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      placeholder="e.g. Telangana, Andhra Pradesh"
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.75rem',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.8125rem',
                        boxSizing: 'border-box',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>

                {/* Row 5: City / District & Website */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: '#334155',
                        marginBottom: '0.35rem',
                      }}
                    >
                      City / District (Optional)
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        value={formData.cityDistrict || ''}
                        onChange={(e) => handleInputChange('cityDistrict', e.target.value)}
                        placeholder="e.g. Hyderabad / Gadwal"
                        style={{
                          width: '100%',
                          padding: '0.65rem 0.75rem 0.65rem 2.25rem',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.8125rem',
                          boxSizing: 'border-box',
                          outline: 'none',
                        }}
                      />
                      <MapPin
                        size={15}
                        color="#94a3b8"
                        style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: '#334155',
                        marginBottom: '0.35rem',
                      }}
                    >
                      Company Website (Optional)
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="url"
                        value={formData.website || ''}
                        onChange={(e) => handleInputChange('website', e.target.value)}
                        placeholder="https://www.example.com"
                        style={{
                          width: '100%',
                          padding: '0.65rem 0.75rem 0.65rem 2.25rem',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.8125rem',
                          boxSizing: 'border-box',
                          outline: 'none',
                        }}
                      />
                      <Globe
                        size={15}
                        color="#94a3b8"
                        style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Proposal Description */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: '#334155',
                      marginBottom: '0.35rem',
                    }}
                  >
                    Describe your proposal and expected outcomes *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={formData.proposalDescription}
                    onChange={(e) => handleInputChange('proposalDescription', e.target.value)}
                    placeholder="Share your idea, how it can create value for farmers and Kissan Mithar, and your proposed mode of collaboration..."
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.8125rem',
                      boxSizing: 'border-box',
                      outline: 'none',
                      fontFamily: 'inherit',
                      resize: 'vertical',
                    }}
                  />
                </div>

                {/* Upload company profile or proposal (Optional) */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: '#334155',
                      marginBottom: '0.35rem',
                    }}
                  >
                    Upload company profile or proposal (Optional)
                  </label>
                  <label
                    style={{
                      border: '1px dashed #cbd5e1',
                      borderRadius: '8px',
                      padding: '1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      backgroundColor: '#f8fafc',
                      transition: 'border-color 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#16a34a')}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#cbd5e1')}
                  >
                    <input type="file" onChange={handleFileChange} accept=".pdf,.doc,.docx" style={{ display: 'none' }} />
                    <Upload size={20} color="#16a34a" style={{ marginBottom: '0.35rem' }} />
                    <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#334155' }}>
                      {selectedFile ? selectedFile.name : 'Click to upload company profile or proposal'}
                    </div>
                    <div style={{ fontSize: '0.6875rem', color: '#94a3b8', marginTop: '0.15rem' }}>
                      PDF, DOC, DOCX (Max 10 MB)
                    </div>
                  </label>
                </div>

                {/* Consent Checkbox */}
                <div>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.5rem',
                      cursor: 'pointer',
                      userSelect: 'none',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={formData.consentAgreed}
                      onChange={(e) => handleInputChange('consentAgreed', e.target.checked)}
                      style={{
                        accentColor: '#16a34a',
                        width: '16px',
                        height: '16px',
                        marginTop: '2px',
                        cursor: 'pointer',
                      }}
                    />
                    <span style={{ fontSize: '0.75rem', color: '#64748b', lineHeight: 1.4 }}>
                      I agree that the information provided above can be used by Kissan Mithar to review my collaboration
                      request and contact me.
                    </span>
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    width: '100%',
                    height: '46px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#15803d',
                    color: '#ffffff',
                    fontSize: '0.9375rem',
                    fontWeight: 700,
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 4px 12px rgba(21, 128, 61, 0.3)',
                    marginTop: '0.5rem',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!submitting) e.currentTarget.style.backgroundColor = '#166534';
                  }}
                  onMouseLeave={(e) => {
                    if (!submitting) e.currentTarget.style.backgroundColor = '#15803d';
                  }}
                >
                  {submitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Submitting Request...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Request</span>
                      <ArrowRight size={17} />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* 5. Footer */}
      <footer style={{ backgroundColor: '#06291a', color: '#cbd5e1', padding: '3.5rem 1.5rem 2rem' }}>
        <div
          style={{
            maxWidth: '1240px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1.5rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            paddingBottom: '2rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <img
              src="/kissan_mithar_logo_v2.png"
              alt="Kissan Mithar"
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                backgroundColor: '#ffffff',
                padding: '2px',
              }}
            />
            <div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>KISSAN MITHAR</div>
              <div style={{ fontSize: '0.75rem', color: '#86efac' }}>Empowering Farmers. Growing Together.</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.875rem' }}>
            <button
              onClick={onNavigateHome}
              style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', padding: 0 }}
            >
              Home
            </button>
            <a href="#collaboration-categories" style={{ color: '#cbd5e1', textDecoration: 'none' }}>
              Categories
            </a>
            <a href="#collaboration-form" style={{ color: '#cbd5e1', textDecoration: 'none' }}>
              Submit Proposal
            </a>
            <button
              onClick={onAdminLogin}
              style={{
                background: 'none',
                border: 'none',
                color: '#86efac',
                cursor: 'pointer',
                fontWeight: 700,
                padding: 0,
              }}
            >
              Admin Portal &rarr;
            </button>
          </div>
        </div>

        <div
          style={{
            maxWidth: '1240px',
            margin: '1.5rem auto 0 auto',
            textAlign: 'center',
            fontSize: '0.75rem',
            color: '#64748b',
          }}
        >
          &copy; 2026 Kissan Mithar Private Limited. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default PartnershipsPage;
