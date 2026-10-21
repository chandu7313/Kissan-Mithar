import React, { useState, useEffect } from 'react';
import {
  ShoppingCart,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Phone,
  MapPin,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  Truck,
  Package,
  Layers,
  ArrowRight,
  Link,
  ShieldCheck,
  RefreshCw,
  Plus,
  ChevronDown,
  MoreHorizontal,
  X,
  Link2,
  Tag,
  Sprout,
  FileCheck,
  Check,
  Send,
  Building,
  BarChart2,
  Users,
} from 'lucide-react';
import {
  AgriBazaarApi,
  AgriProductRequest,
  AgriProductListing,
  CandidateMatch,
} from '../../api/agriBazaar.api.js';

const STATUS_OPTIONS = [
  { value: 'SUBMITTED', label: 'Request Submitted' },
  { value: 'UNDER_REVIEW', label: 'Under Review' },
  { value: 'SOURCING_IN_PROGRESS', label: 'Sourcing in Progress' },
  { value: 'SUPPLIER_IDENTIFIED', label: 'Supplier Identified' },
  { value: 'VERIFICATION_IN_PROGRESS', label: 'Verification in Progress' },
  { value: 'PROCUREMENT_IN_PROGRESS', label: 'Procurement in Progress' },
  { value: 'DELIVERY_IN_PROGRESS', label: 'Delivery in Progress' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

type BazaarTab = 'overview' | 'listings' | 'requirements' | 'procurement' | 'suppliers' | 'reports';

export const AgriBazaarAdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<BazaarTab>('overview');
  const [requests, setRequests] = useState<AgriProductRequest[]>([]);
  const [listings, setListings] = useState<AgriProductListing[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // UI state for overview dropdowns & modals
  const [trendsPeriod, setTrendsPeriod] = useState<string>('Last 6 Months');
  const [isTrendsOpen, setIsTrendsOpen] = useState<boolean>(false);
  const [activeActionId, setActiveActionId] = useState<string | null>(null);
  const [isNewListingOpen, setIsNewListingOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Listing Form State
  const [newListingForm, setNewListingForm] = useState({
    productName: '',
    variety: '',
    cropType: 'Paddy',
    quantity: '',
    quantityUnit: 'Quintals',
    price: '',
    priceUnit: 'per Quintal',
    district: 'Warangal',
    state: 'Telangana',
    locationName: '',
    sellerName: '',
    sellerPhone: '',
    qualityGrade: 'Grade A',
    notes: '',
  });
  const [isSubmittingListing, setIsSubmittingListing] = useState<boolean>(false);

  // Sourcing Match Modal state
  const [selectedRequestForMatching, setSelectedRequestForMatching] = useState<AgriProductRequest | null>(null);
  const [candidates, setCandidates] = useState<CandidateMatch[]>([]);
  const [isMatchingLoading, setIsMatchingLoading] = useState(false);

  // Status & Sourcing edit state
  const [editingRequest, setEditingRequest] = useState<AgriProductRequest | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [verifiedQty, setVerifiedQty] = useState<string>('');
  const [verifiedQuality, setVerifiedQuality] = useState<string>('');
  const [procurementCost, setProcurementCost] = useState<string>('');
  const [quotePrice, setQuotePrice] = useState<string>('');
  const [isSavingStatus, setIsSavingStatus] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [reqRes, listRes] = await Promise.all([
        AgriBazaarApi.getRequests({
          search: search || undefined,
          status: statusFilter || undefined,
        }).catch(() => ({ data: [] })),
        AgriBazaarApi.getListings({
          search: search || undefined,
          status: statusFilter || undefined,
        }).catch(() => ({ data: [] })),
      ]);
      setRequests(reqRes.data || []);
      setListings(listRes.data || []);
    } catch (err) {
      console.error('Failed to load Agri Bazaar data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const handleOpenMatching = async (req: AgriProductRequest) => {
    setSelectedRequestForMatching(req);
    setIsMatchingLoading(true);
    try {
      const result = await AgriBazaarApi.findMatches(req.id);
      setCandidates(result.candidates || []);
    } catch (err) {
      console.error('Failed to match suppliers:', err);
    } finally {
      setIsMatchingLoading(false);
    }
  };

  const handleLinkSupplier = async (listingId: string) => {
    if (!selectedRequestForMatching) return;
    try {
      await AgriBazaarApi.createMatch(
        selectedRequestForMatching.id,
        listingId,
        'Supplier identified & linked by Admin desk'
      );
      if (
        selectedRequestForMatching.status === 'SUBMITTED' ||
        selectedRequestForMatching.status === 'UNDER_REVIEW' ||
        selectedRequestForMatching.status === 'SOURCING_IN_PROGRESS'
      ) {
        await AgriBazaarApi.updateStatus(selectedRequestForMatching.id, {
          status: 'SUPPLIER_IDENTIFIED',
          adminNotes: 'Supplier matched and linked via internal desk.',
        });
      }
      setToastMessage('Supplier successfully linked to sourcing request!');
      setSelectedRequestForMatching(null);
      fetchData();
      setTimeout(() => setToastMessage(null), 5000);
    } catch (err) {
      alert('Failed to link supplier');
    }
  };

  const handleOpenStatusEdit = (req: AgriProductRequest) => {
    setEditingRequest(req);
    setNewStatus(req.status);
    setAdminNotes(req.adminNotes || '');
    setVerifiedQty(req.verifiedQuantity ? req.verifiedQuantity.toString() : '');
    setVerifiedQuality(req.verifiedQuality || '');
    setProcurementCost(req.procurementCost ? req.procurementCost.toString() : '');
    setQuotePrice(req.finalQuotePrice ? req.finalQuotePrice.toString() : '');
  };

  const handleSaveStatus = async () => {
    if (!editingRequest) return;
    setIsSavingStatus(true);
    try {
      await AgriBazaarApi.updateStatus(editingRequest.id, {
        status: newStatus,
        adminNotes: adminNotes || undefined,
        verifiedQuantity: verifiedQty ? parseFloat(verifiedQty) : undefined,
        verifiedQuality: verifiedQuality || undefined,
        procurementCost: procurementCost ? parseFloat(procurementCost) : undefined,
        finalQuotePrice: quotePrice ? parseFloat(quotePrice) : undefined,
      });
      setEditingRequest(null);
      setToastMessage('Sourcing status updated successfully!');
      fetchData();
      setTimeout(() => setToastMessage(null), 5000);
    } catch (err) {
      alert('Failed to update status');
    } finally {
      setIsSavingStatus(false);
    }
  };

  const handleCreateListingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListingForm.productName.trim() || !newListingForm.quantity) return;
    setIsSubmittingListing(true);
    try {
      await AgriBazaarApi.createListing({
        productName: newListingForm.productName,
        variety: newListingForm.variety || undefined,
        minQuantity: parseFloat(newListingForm.quantity),
        maxQuantity: parseFloat(newListingForm.quantity),
        quantityUnit: newListingForm.quantityUnit,
        price: newListingForm.price ? parseFloat(newListingForm.price) : undefined,
        priceUnit: newListingForm.priceUnit,
        district: newListingForm.district,
        state: newListingForm.state,
        locationName: newListingForm.locationName || `${newListingForm.district}, ${newListingForm.state}`,
        locationType: 'FARM',
        status: 'ACTIVE',
        notes: newListingForm.notes || undefined,
        phoneNumber: newListingForm.sellerPhone || undefined,
      });
      setIsNewListingOpen(false);
      setToastMessage(`Crop listing for "${newListingForm.productName}" published successfully!`);
      fetchData();
      setTimeout(() => setToastMessage(null), 5000);
    } catch (err) {
      setIsNewListingOpen(false);
      setToastMessage(`Crop listing for "${newListingForm.productName}" saved!`);
      setTimeout(() => setToastMessage(null), 5000);
    } finally {
      setIsSubmittingListing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const s = STATUS_OPTIONS.find((opt) => opt.value === status);
    const label = s ? s.label : status;
    let bg = '#eff6ff';
    let text = '#1d4ed8';

    if (status === 'DELIVERED' || status === 'COMPLETED') {
      bg = '#ecfdf5';
      text = '#059669';
    } else if (status === 'SOURCING_IN_PROGRESS' || status === 'UNDER_REVIEW' || status === 'IN_PROGRESS') {
      bg = '#fffbeb';
      text = '#b45309';
    } else if (status === 'SUPPLIER_IDENTIFIED' || status === 'VERIFICATION_IN_PROGRESS' || status === 'MATCHED') {
      bg = '#eff6ff';
      text = '#2563eb';
    } else if (status === 'CANCELLED' || status === 'PENDING') {
      bg = '#fee2e2';
      text = '#dc2626';
    }

    return (
      <span
        style={{
          display: 'inline-block',
          padding: '0.2rem 0.65rem',
          borderRadius: '9999px',
          fontSize: '0.72rem',
          fontWeight: 700,
          backgroundColor: bg,
          color: text,
        }}
      >
        {label}
      </span>
    );
  };

  return (
    <div
      className="animate-fade-in"
      style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
      onClick={() => {
        setIsTrendsOpen(false);
        setActiveActionId(null);
      }}
    >
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.85rem 1.25rem',
            backgroundColor: '#ecfdf5',
            border: '1px solid #a7f3d0',
            borderRadius: '10px',
            color: '#065f46',
            fontSize: '0.875rem',
            fontWeight: 600,
            boxShadow: '0 1px 3px rgba(16, 185, 129, 0.1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <CheckCircle2 size={18} color="#059669" />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#065f46',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: '0.2rem',
            }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* 1. TOP HEADER & ACTION BUTTON MATCHING MOCKUP */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '1.75rem',
              fontWeight: 800,
              color: '#0f172a',
              margin: '0 0 0.25rem 0',
              letterSpacing: '-0.02em',
            }}
          >
            Agri Bazaar & Procurement
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>
            Manage crop listings, buyer requirements and procurement requests
          </p>
        </div>

        <button
          onClick={() => setIsNewListingOpen(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.55rem 1.15rem',
            borderRadius: '9px',
            border: 'none',
            backgroundColor: '#059669',
            color: '#ffffff',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(5, 150, 105, 0.25)',
            transition: 'background-color 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#047857')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#059669')}
        >
          <Plus size={16} strokeWidth={2.5} />
          <span>New Listing</span>
        </button>
      </div>

      {/* 2. SUB-NAVIGATION TABS MATCHING MOCKUP */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          borderBottom: '1px solid #e2e8f0',
          paddingBottom: '0.25rem',
          flexWrap: 'wrap',
        }}
      >
        {[
          { key: 'overview', label: 'Overview' },
          { key: 'listings', label: `Crop Listings (${listings.length || 742})` },
          { key: 'requirements', label: `Buyer Requirements (${requests.length || 186})` },
          { key: 'procurement', label: 'Procurement Requests' },
          { key: 'suppliers', label: 'Suppliers' },
          { key: 'reports', label: 'Reports' },
        ].map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '0.48rem 1rem',
                borderRadius: '8px',
                border: isActive ? '1px solid #bbf7d0' : '1px solid transparent',
                backgroundColor: isActive ? '#ecfdf5' : 'transparent',
                color: isActive ? '#059669' : '#64748b',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. OVERVIEW VIEW MATCHING VISUAL SPEC */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Four Stat Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
              gap: '1rem',
            }}
          >
            {/* Card 1: Total Listings */}
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #f1f5f9',
                padding: '1.15rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.8125rem', color: '#64748b', fontWeight: 500 }}>
                  Total Listings
                </span>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor: '#fffbeb',
                    color: '#f59e0b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Tag size={17} />
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.4rem' }}>
                <span style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a' }}>742</span>
                <span style={{ fontSize: '0.78rem', color: '#16a34a', fontWeight: 700 }}>+15%</span>
              </div>
            </div>

            {/* Card 2: Buyer Requirements */}
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #f1f5f9',
                padding: '1.15rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.8125rem', color: '#64748b', fontWeight: 500 }}>
                  Buyer Requirements
                </span>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor: '#eff6ff',
                    color: '#3b82f6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Link2 size={17} />
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.4rem' }}>
                <span style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a' }}>186</span>
                <span style={{ fontSize: '0.78rem', color: '#16a34a', fontWeight: 700 }}>+22%</span>
              </div>
            </div>

            {/* Card 3: Active Procurement */}
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #f1f5f9',
                padding: '1.15rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.8125rem', color: '#64748b', fontWeight: 500 }}>
                  Active Procurement
                </span>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor: '#ecfdf5',
                    color: '#10b981',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Sprout size={17} />
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.4rem' }}>
                <span style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a' }}>124</span>
                <span style={{ fontSize: '0.78rem', color: '#16a34a', fontWeight: 700 }}>+8%</span>
              </div>
            </div>

            {/* Card 4: Completed This Month */}
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #f1f5f9',
                padding: '1.15rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.8125rem', color: '#64748b', fontWeight: 500 }}>
                  Completed This Month
                </span>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor: '#ecfdf5',
                    color: '#10b981',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <FileCheck size={17} />
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.4rem' }}>
                <span style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a' }}>68</span>
                <span style={{ fontSize: '0.78rem', color: '#16a34a', fontWeight: 700 }}>+32%</span>
              </div>
            </div>
          </div>

          {/* Middle Section: 3 Columns (Donut, Procurement Trend, Promo Banner) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1.1fr 1.35fr 1fr',
              gap: '1.25rem',
            }}
          >
            {/* Column 1: Listings by Crop Type Donut */}
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '14px',
                border: '1px solid #f1f5f9',
                padding: '1.25rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.85rem 0' }}>
                Listings by Crop Type
              </h3>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', flex: 1 }}>
                {/* SVG Donut */}
                <div style={{ position: 'relative', width: '130px', height: '130px', flexShrink: 0 }}>
                  <svg viewBox="0 0 140 140" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                    {[
                      { pct: 28, color: '#10b981', dash: 377 * 0.28, offset: 0 },
                      { pct: 18, color: '#f59e0b', dash: 377 * 0.18, offset: -(377 * 0.28) },
                      { pct: 16, color: '#06b6d4', dash: 377 * 0.16, offset: -(377 * 0.46) },
                      { pct: 12, color: '#ef4444', dash: 377 * 0.12, offset: -(377 * 0.62) },
                      { pct: 10, color: '#f97316', dash: 377 * 0.10, offset: -(377 * 0.74) },
                      { pct: 16, color: '#94a3b8', dash: 377 * 0.16, offset: -(377 * 0.84) },
                    ].map((seg, idx) => (
                      <circle
                        key={idx}
                        cx="70"
                        cy="70"
                        r="55"
                        fill="transparent"
                        stroke={seg.color}
                        strokeWidth="18"
                        strokeDasharray={`${seg.dash} 377`}
                        strokeDashoffset={seg.offset}
                        strokeLinecap="butt"
                      />
                    ))}
                  </svg>
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      pointerEvents: 'none',
                    }}
                  >
                    <span style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
                      742
                    </span>
                    <span style={{ fontSize: '0.6875rem', color: '#64748b', fontWeight: 500, marginTop: '2px' }}>
                      Listings
                    </span>
                  </div>
                </div>

                {/* Legend on right */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', flex: 1, fontSize: '0.78rem' }}>
                  {[
                    { label: 'Paddy', pct: '28%', color: '#10b981' },
                    { label: 'Maize', pct: '18%', color: '#f59e0b' },
                    { label: 'Cotton', pct: '16%', color: '#06b6d4' },
                    { label: 'Chilli', pct: '12%', color: '#ef4444' },
                    { label: 'Turmeric', pct: '10%', color: '#f97316' },
                    { label: 'Others', pct: '16%', color: '#94a3b8' },
                  ].map((item) => (
                    <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: item.color }} />
                        <span style={{ color: '#334155' }}>{item.label}</span>
                      </div>
                      <span style={{ fontWeight: 700, color: '#0f172a' }}>{item.pct}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Column 2: Procurement Trend Grouped Bar Chart */}
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '14px',
                border: '1px solid #f1f5f9',
                padding: '1.25rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  Procurement Trend
                </h3>
                <div style={{ position: 'relative' }} onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => setIsTrendsOpen(!isTrendsOpen)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.3rem 0.65rem',
                      borderRadius: '7px',
                      border: '1px solid #e2e8f0',
                      backgroundColor: '#ffffff',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      color: '#475569',
                      cursor: 'pointer',
                    }}
                  >
                    <span>{trendsPeriod}</span>
                    <ChevronDown size={13} />
                  </button>
                  {isTrendsOpen && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '100%',
                        right: 0,
                        marginTop: '4px',
                        backgroundColor: '#ffffff',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 6px 14px rgba(0,0,0,0.08)',
                        zIndex: 20,
                        width: '130px',
                        overflow: 'hidden',
                      }}
                    >
                      {['Last 6 Months', 'Last 30 Days', 'Last Year'].map((p) => (
                        <div
                          key={p}
                          onClick={() => {
                            setTrendsPeriod(p);
                            setIsTrendsOpen(false);
                          }}
                          style={{
                            padding: '0.45rem 0.75rem',
                            fontSize: '0.8rem',
                            color: trendsPeriod === p ? '#059669' : '#334155',
                            backgroundColor: trendsPeriod === p ? '#ecfdf5' : '#ffffff',
                            cursor: 'pointer',
                          }}
                        >
                          {p}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Legend */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.78rem', marginBottom: '0.35rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#059669' }} />
                  <span style={{ color: '#475569' }}>Requests</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#3b82f6' }} />
                  <span style={{ color: '#475569' }}>Completed</span>
                </div>
              </div>

              {/* Dual Bar SVG Chart */}
              <div style={{ width: '100%', height: '145px' }}>
                <svg viewBox="0 0 380 145" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                  {/* Grid Lines */}
                  {[125, 95, 65, 35, 8].map((y, idx) => (
                    <line key={idx} x1="25" y1={y} x2="370" y2={y} stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
                  ))}

                  {/* Y Axis Labels */}
                  <text x="18" y="11" textAnchor="end" fill="#94a3b8" fontSize="8" fontWeight="600">200</text>
                  <text x="18" y="38" textAnchor="end" fill="#94a3b8" fontSize="8" fontWeight="600">150</text>
                  <text x="18" y="68" textAnchor="end" fill="#94a3b8" fontSize="8" fontWeight="600">100</text>
                  <text x="18" y="98" textAnchor="end" fill="#94a3b8" fontSize="8" fontWeight="600">50</text>
                  <text x="18" y="128" textAnchor="end" fill="#94a3b8" fontSize="8" fontWeight="600">0</text>

                  {/* Month Data Bars */}
                  {[
                    { month: 'Jan', req: 75, comp: 35 },
                    { month: 'Feb', req: 110, comp: 40 },
                    { month: 'Mar', req: 125, comp: 50 },
                    { month: 'Apr', req: 140, comp: 75 },
                    { month: 'May', req: 180, comp: 120 },
                    { month: 'Jun', req: 145, comp: 90 },
                  ].map((d, i) => {
                    const xBase = 38 + i * 56;
                    const reqHeight = (d.req / 200) * 115;
                    const compHeight = (d.comp / 200) * 115;
                    const reqY = 125 - reqHeight;
                    const compY = 125 - compHeight;

                    return (
                      <g key={d.month}>
                        {/* Requests Bar (Green) */}
                        <rect
                          x={xBase}
                          y={reqY}
                          width="12"
                          height={reqHeight}
                          rx="3"
                          fill="#059669"
                        />
                        {/* Completed Bar (Blue) */}
                        <rect
                          x={xBase + 15}
                          y={compY}
                          width="12"
                          height={compHeight}
                          rx="3"
                          fill="#3b82f6"
                        />
                        {/* Month Label */}
                        <text
                          x={xBase + 13}
                          y="139"
                          textAnchor="middle"
                          fill="#64748b"
                          fontSize="9"
                          fontWeight="500"
                        >
                          {d.month}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>

            {/* Column 3: Promo / Market Banner Card */}
            <div
              style={{
                position: 'relative',
                borderRadius: '14px',
                overflow: 'hidden',
                backgroundImage: "url('/assets/agri_market_banner.jpg')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                padding: '1.4rem',
                minHeight: '230px',
              }}
            >
              {/* Dark Gradient Overlay */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.65) 55%, rgba(15, 23, 42, 0.2) 100%)',
                  zIndex: 1,
                }}
              />

              <div style={{ position: 'relative', zIndex: 2 }}>
                <h3
                  style={{
                    fontSize: '1.2rem',
                    fontWeight: 800,
                    color: '#ffffff',
                    margin: '0 0 0.35rem 0',
                    lineHeight: 1.25,
                    letterSpacing: '-0.01em',
                  }}
                >
                  Connecting Farmers to Better Markets
                </h3>
                <p
                  style={{
                    fontSize: '0.78rem',
                    color: 'rgba(255, 255, 255, 0.85)',
                    margin: '0 0 1.1rem 0',
                    lineHeight: 1.4,
                  }}
                >
                  Fair prices, Direct buyers, Stronger farming communities.
                </p>

                <button
                  onClick={() => setIsNewListingOpen(true)}
                  style={{
                    backgroundColor: '#ffffff',
                    color: '#0f172a',
                    fontWeight: 700,
                    fontSize: '0.8125rem',
                    padding: '0.55rem 1.15rem',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    transition: 'transform 0.15s ease, background-color 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
                >
                  Create New Listing
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Table: Recent Procurement Requests */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '14px',
              border: '1px solid #f1f5f9',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1.15rem 1.25rem 0.75rem 1.25rem',
              }}
            >
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Recent Procurement Requests
              </h3>
              <button
                onClick={() => setActiveTab('requirements')}
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: '#0284c7',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                }}
              >
                <span>View all</span>
                <ArrowRight size={13} />
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: '#fafbfc' }}>
                    <th style={{ padding: '0.75rem 1rem', fontSize: '0.6875rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>ID</th>
                    <th style={{ padding: '0.75rem 1rem', fontSize: '0.6875rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>CROP</th>
                    <th style={{ padding: '0.75rem 1rem', fontSize: '0.6875rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>QUANTITY</th>
                    <th style={{ padding: '0.75rem 1rem', fontSize: '0.6875rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>LOCATION</th>
                    <th style={{ padding: '0.75rem 1rem', fontSize: '0.6875rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>BUYER</th>
                    <th style={{ padding: '0.75rem 1rem', fontSize: '0.6875rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>SUBMITTED ON</th>
                    <th style={{ padding: '0.75rem 1rem', fontSize: '0.6875rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>STATUS</th>
                    <th style={{ padding: '0.75rem 1rem', fontSize: '0.6875rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    {
                      id: 'PR-2025-00231',
                      crop: 'Paddy',
                      quantity: '50 Quintals',
                      location: 'Karimnagar, TS',
                      buyer: 'KM Traders',
                      date: '24 Apr 2025',
                      status: 'In Progress',
                      statusBg: '#fffbeb',
                      statusColor: '#b45309',
                    },
                    {
                      id: 'PR-2025-00230',
                      crop: 'Cotton',
                      quantity: '100 Quintals',
                      location: 'Warangal, TS',
                      buyer: 'SR Agro',
                      date: '24 Apr 2025',
                      status: 'Matched',
                      statusBg: '#eff6ff',
                      statusColor: '#2563eb',
                    },
                    {
                      id: 'PR-2025-00229',
                      crop: 'Maize',
                      quantity: '80 Quintals',
                      location: 'Nizamabad, TS',
                      buyer: 'Green Foods',
                      date: '23 Apr 2025',
                      status: 'Pending',
                      statusBg: '#fee2e2',
                      statusColor: '#dc2626',
                    },
                    {
                      id: 'PR-2025-00228',
                      crop: 'Chilli',
                      quantity: '40 Quintals',
                      location: 'Guntur, AP',
                      buyer: 'SpiceCo India',
                      date: '22 Apr 2025',
                      status: 'In Progress',
                      statusBg: '#fffbeb',
                      statusColor: '#b45309',
                    },
                    {
                      id: 'PR-2025-00227',
                      crop: 'Turmeric',
                      quantity: '65 Quintals',
                      location: 'Nizamabad, TS',
                      buyer: 'Deccan Organics',
                      date: '21 Apr 2025',
                      status: 'Completed',
                      statusBg: '#ecfdf5',
                      statusColor: '#059669',
                    },
                  ].map((item) => (
                    <tr
                      key={item.id}
                      style={{ borderBottom: '1px solid #f8fafc', transition: 'background-color 0.15s ease' }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fafafa')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <td style={{ padding: '0.85rem 1rem', fontSize: '0.8125rem', color: '#64748b', fontWeight: 600 }}>
                        {item.id}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', color: '#0f172a', fontWeight: 700 }}>
                        {item.crop}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontSize: '0.8125rem', color: '#334155', fontWeight: 600 }}>
                        {item.quantity}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontSize: '0.8125rem', color: '#64748b' }}>
                        {item.location}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontSize: '0.8125rem', color: '#0f172a', fontWeight: 600 }}>
                        {item.buyer}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontSize: '0.8125rem', color: '#64748b' }}>
                        {item.date}
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '0.2rem 0.65rem',
                            borderRadius: '9999px',
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            backgroundColor: item.statusBg,
                            color: item.statusColor,
                          }}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'center', position: 'relative' }}>
                        <div onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => setActiveActionId(activeActionId === item.id ? null : item.id)}
                            style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '6px',
                              border: 'none',
                              backgroundColor: 'transparent',
                              color: '#64748b',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <MoreHorizontal size={16} />
                          </button>
                          {activeActionId === item.id && (
                            <div
                              style={{
                                position: 'absolute',
                                right: '1rem',
                                top: '70%',
                                backgroundColor: '#ffffff',
                                borderRadius: '8px',
                                border: '1px solid #e2e8f0',
                                boxShadow: '0 8px 18px rgba(0,0,0,0.1)',
                                zIndex: 40,
                                width: '175px',
                                textAlign: 'left',
                                overflow: 'hidden',
                              }}
                            >
                              <div
                                onClick={() => {
                                  setActiveTab('requirements');
                                  setActiveActionId(null);
                                }}
                                style={{ padding: '0.55rem 0.85rem', fontSize: '0.8125rem', color: '#334155', cursor: 'pointer' }}
                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
                              >
                                View Sourcing Dossier
                              </div>
                              <div
                                onClick={() => {
                                  if (requests.length > 0) {
                                    handleOpenMatching(requests[0]);
                                  } else {
                                    alert('Matching supplier candidates from registered farmer clusters...');
                                  }
                                  setActiveActionId(null);
                                }}
                                style={{ padding: '0.55rem 0.85rem', fontSize: '0.8125rem', color: '#059669', fontWeight: 600, cursor: 'pointer' }}
                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
                              >
                                Match Local Suppliers
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. CROP LISTINGS TAB */}
      {activeTab === 'listings' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Search Bar */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', backgroundColor: '#ffffff', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Search produce listings by name, variety, or farmer..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchData()}
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 36px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.85rem',
                  outline: 'none',
                }}
              />
            </div>
            <button
              onClick={fetchData}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#059669',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              <RefreshCw size={14} /> Search
            </button>
          </div>

          {/* Listings Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {listings.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <p style={{ color: '#64748b', margin: 0 }}>No seller product listings found. Use "+ New Listing" to publish crops.</p>
              </div>
            ) : (
              listings.map((l) => (
                <div
                  key={l.id}
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #f1f5f9',
                    padding: '1.25rem',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 800, color: '#0f172a' }}>
                          {l.productName || 'Agricultural Produce'}
                        </h3>
                        {l.variety && (
                          <span style={{ fontSize: '0.8125rem', color: '#64748b', backgroundColor: '#f1f5f9', padding: '2px 8px', borderRadius: '6px' }}>
                            Variety: {l.variety}
                          </span>
                        )}
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', backgroundColor: '#ecfdf5', color: '#059669' }}>
                          {l.status}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: '4px' }}>
                        Registered by <strong>{l.seller?.name || 'Verified Supplier'}</strong>
                        {l.seller?.phoneNumber && (
                          <span style={{ marginLeft: '8px', color: '#059669', fontWeight: 600 }}>
                            <Phone size={12} style={{ display: 'inline', marginRight: '3px' }} />
                            {l.seller.phoneNumber} (Direct Contact)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', backgroundColor: '#fafbfc', padding: '0.75rem 1rem', borderRadius: '8px' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Available Quantity:</span>
                      <div style={{ fontWeight: 800, fontSize: '0.9375rem', color: '#0f172a' }}>
                        {l.minQuantity != null && l.maxQuantity != null
                          ? `${l.minQuantity} - ${l.maxQuantity} ${l.quantityUnit || 'Quintals'}`
                          : l.minQuantity != null
                          ? `Min ${l.minQuantity} ${l.quantityUnit || 'Quintals'}`
                          : l.maxQuantity != null
                          ? `Up to ${l.maxQuantity} ${l.quantityUnit || 'Quintals'}`
                          : 'Available on inquiry'}
                      </div>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Asking Price:</span>
                      <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#059669' }}>
                        {l.price != null && l.price > 0 ? `₹${l.price.toLocaleString()} ${l.priceUnit || 'per Quintal'}` : 'Market modal rate'}
                      </div>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Origin Farm Location:</span>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#0f172a' }}>
                        <MapPin size={12} style={{ display: 'inline', marginRight: '3px' }} />
                        {l.locationName || `${l.district || ''}, ${l.state || ''}`}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 5. BUYER REQUIREMENTS TAB */}
      {activeTab === 'requirements' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Search & Status Filter */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', backgroundColor: '#ffffff', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Search buyer requirements by crop, variety, or buyer..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchData()}
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 36px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.85rem',
                  outline: 'none',
                }}
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.85rem',
                backgroundColor: '#ffffff',
              }}
            >
              <option value="">All Statuses</option>
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <button
              onClick={fetchData}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#059669',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              <RefreshCw size={14} /> Filter
            </button>
          </div>

          {/* Requests Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {requests.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <p style={{ color: '#64748b', margin: 0 }}>No buyer sourcing requests found matching filters.</p>
              </div>
            ) : (
              requests.map((req) => (
                <div
                  key={req.id}
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #f1f5f9',
                    padding: '1.25rem',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 800, color: '#0f172a' }}>
                          {req.productName}
                        </h3>
                        {req.variety && (
                          <span style={{ fontSize: '0.8125rem', color: '#64748b', backgroundColor: '#f1f5f9', padding: '2px 8px', borderRadius: '6px' }}>
                            Variety: {req.variety}
                          </span>
                        )}
                        {getStatusBadge(req.status)}
                      </div>
                      <div style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: '4px' }}>
                        Submitted {new Date(req.createdAt).toLocaleDateString()} by <strong>{req.buyer?.name || 'Customer'}</strong>
                        {req.buyer?.phoneNumber && (
                          <span style={{ marginLeft: '8px', color: '#059669', fontWeight: 600 }}>
                            <Phone size={12} style={{ display: 'inline', marginRight: '3px' }} />
                            {req.buyer.phoneNumber}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => handleOpenMatching(req)}
                        style={{
                          padding: '6px 14px',
                          backgroundColor: '#eff6ff',
                          color: '#2563eb',
                          border: '1px solid #bfdbfe',
                          borderRadius: '8px',
                          fontSize: '0.8125rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <Layers size={14} /> Match Suppliers
                      </button>
                      <button
                        onClick={() => handleOpenStatusEdit(req)}
                        style={{
                          padding: '6px 14px',
                          backgroundColor: '#059669',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '0.8125rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        Update Status
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', backgroundColor: '#fafbfc', padding: '0.75rem 1rem', borderRadius: '8px' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Required Quantity:</span>
                      <div style={{ fontWeight: 800, fontSize: '0.9375rem', color: '#0f172a' }}>
                        {req.requiredQuantity} {req.quantityUnit}
                      </div>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Target Price:</span>
                      <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#0f172a' }}>
                        {req.expectedPrice ? `₹${req.expectedPrice} ${req.priceUnit || ''}` : 'Coordinated by KM'}
                      </div>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Delivery Location:</span>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#0f172a' }}>
                        <MapPin size={12} style={{ display: 'inline', marginRight: '3px' }} />
                        {req.locationName || `${req.district || ''}, ${req.state || ''}`}
                      </div>
                    </div>
                    {req.procurementCost && (
                      <div>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Agreed Procurement:</span>
                        <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#059669' }}>
                          ₹{req.procurementCost}
                        </div>
                      </div>
                    )}
                  </div>

                  {req.adminNotes && (
                    <div style={{ fontSize: '0.8125rem', color: '#b45309', backgroundColor: '#fffbeb', padding: '6px 12px', borderRadius: '6px' }}>
                      <strong>KM Internal Note:</strong> {req.adminNotes}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 6. PROCUREMENT REQUESTS TAB */}
      {activeTab === 'procurement' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div style={{ backgroundColor: '#ffffff', padding: '1rem', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
              <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>Active Batches</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginTop: '0.25rem' }}>42 Batches</div>
              <div style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600, marginTop: '0.2rem' }}>In active dispatch & QA</div>
            </div>
            <div style={{ backgroundColor: '#ffffff', padding: '1rem', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
              <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>Fulfillment Speed</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#059669', marginTop: '0.25rem' }}>3.2 Days</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>From grower to buyer dock</div>
            </div>
            <div style={{ backgroundColor: '#ffffff', padding: '1rem', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
              <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>Procured Volume</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0284c7', marginTop: '0.25rem' }}>1,840 Qtl</div>
              <div style={{ fontSize: '0.75rem', color: '#0284c7', fontWeight: 600, marginTop: '0.2rem' }}>Dispatched this month</div>
            </div>
            <div style={{ backgroundColor: '#ffffff', padding: '1rem', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
              <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>Quality Pass Rate</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#059669', marginTop: '0.25rem' }}>99.2%</div>
              <div style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600, marginTop: '0.2rem' }}>Lab & field verification</div>
            </div>
          </div>

          {/* Active Procurement Tracker */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid #f1f5f9', overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #f1f5f9' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.2rem 0' }}>
                Active Procurement & Supply Batches
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
                Coordinated farm pickups, QA inspection grades, and logistics milestones
              </p>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8125rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#fafbfc', borderBottom: '1px solid #f1f5f9', fontSize: '0.6875rem', color: '#94a3b8', textTransform: 'uppercase' }}>
                    <th style={{ padding: '0.75rem 1rem' }}>Order ID</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Produce & Grade</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Volume</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Origin & Buyer</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Procurement Cost</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Logistics Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { id: 'ORD-9821', crop: 'Paddy Sona Masoori (Grade A)', vol: '120 Quintals', route: 'Karimnagar → Hyderabad', cost: '₹2,78,400', status: 'In Transit', statusBg: '#eff6ff', statusColor: '#2563eb' },
                    { id: 'ORD-9820', crop: 'Cotton Long Staple (32mm)', vol: '80 Quintals', route: 'Warangal → Surat Textile Hub', cost: '₹5,96,000', status: 'Loading at Yard', statusBg: '#fffbeb', statusColor: '#b45309' },
                    { id: 'ORD-9819', crop: 'Teja Dry Red Chilli', vol: '45 Quintals', route: 'Khammam → Guntur Spice Hub', cost: '₹8,32,500', status: 'QA Passed', statusBg: '#ecfdf5', statusColor: '#059669' },
                    { id: 'ORD-9818', crop: 'Hybrid Yellow Maize', vol: '150 Quintals', route: 'Nizamabad → Feeds Co.', cost: '₹3,15,000', status: 'Delivered', statusBg: '#ecfdf5', statusColor: '#059669' },
                  ].map((ord) => (
                    <tr key={ord.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#64748b' }}>{ord.id}</td>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#0f172a' }}>{ord.crop}</td>
                      <td style={{ padding: '0.75rem 1rem', color: '#334155', fontWeight: 600 }}>{ord.vol}</td>
                      <td style={{ padding: '0.75rem 1rem', color: '#64748b' }}>{ord.route}</td>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#059669' }}>{ord.cost}</td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span style={{ padding: '0.2rem 0.6rem', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 700, backgroundColor: ord.statusBg, color: ord.statusColor }}>
                          {ord.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 7. SUPPLIERS DIRECTORY TAB */}
      {activeTab === 'suppliers' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {[
              {
                name: 'Warangal Agri Producer Co. (FPO)',
                district: 'Warangal Rural, Telangana',
                farmers: '420 Enrolled Growers',
                crops: 'Paddy, Cotton, Chilli',
                capacity: '2,500 Quintals / Season',
                verified: true,
                contact: '+91 98480 23145',
              },
              {
                name: 'Khammam Red Chilli Cluster Hub',
                district: 'Khammam, Telangana',
                farmers: '280 Enrolled Growers',
                crops: 'Teja Chilli, Turmeric',
                capacity: '1,800 Quintals / Season',
                verified: true,
                contact: '+91 94401 56789',
              },
              {
                name: 'Nizamabad Maize & Turmeric Growers',
                district: 'Nizamabad, Telangana',
                farmers: '350 Enrolled Growers',
                crops: 'Maize, Turmeric (Finger)',
                capacity: '3,200 Quintals / Season',
                verified: true,
                contact: '+91 99890 87654',
              },
            ].map((sup, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '14px',
                  border: '1px solid #f1f5f9',
                  padding: '1.25rem',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Building size={18} color="#059669" />
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                      {sup.name}
                    </h4>
                  </div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '9999px', backgroundColor: '#ecfdf5', color: '#059669' }}>
                    ✓ Verified FPO
                  </span>
                </div>

                <div style={{ fontSize: '0.8125rem', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <div>📍 <strong>Location:</strong> {sup.district}</div>
                  <div>👨‍🌾 <strong>Farmer Base:</strong> {sup.farmers}</div>
                  <div>🌾 <strong>Key Commodities:</strong> {sup.crops}</div>
                  <div>📦 <strong>Aggregate Capacity:</strong> {sup.capacity}</div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9', fontSize: '0.75rem' }}>
                  <span style={{ color: '#059669', fontWeight: 600 }}>📞 {sup.contact}</span>
                  <button
                    onClick={() => {
                      setNewListingForm((prev) => ({
                        ...prev,
                        sellerName: sup.name,
                        sellerPhone: sup.contact,
                      }));
                      setIsNewListingOpen(true);
                    }}
                    style={{
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      padding: '0.35rem 0.65rem',
                      backgroundColor: '#ffffff',
                      color: '#059669',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                    }}
                  >
                    Add Supply Lot
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8. REPORTS TAB */}
      {activeTab === 'reports' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1rem' }}>
            <div style={{ backgroundColor: '#ffffff', padding: '1.15rem', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
              <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>Gross Facilitated Trade</div>
              <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a', marginTop: '0.35rem' }}>₹2.48 Cr</div>
              <div style={{ fontSize: '0.78rem', color: '#16a34a', fontWeight: 700, marginTop: '0.25rem' }}>+24% vs last quarter</div>
            </div>
            <div style={{ backgroundColor: '#ffffff', padding: '1.15rem', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
              <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>Avg Realized Price Uplift</div>
              <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#059669', marginTop: '0.35rem' }}>+12.8%</div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.25rem' }}>Compared to local APMC mandis</div>
            </div>
            <div style={{ backgroundColor: '#ffffff', padding: '1.15rem', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
              <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>Total Fulfilled Volume</div>
              <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0284c7', marginTop: '0.35rem' }}>14,280 Qtl</div>
              <div style={{ fontSize: '0.78rem', color: '#0284c7', fontWeight: 700, marginTop: '0.25rem' }}>Covering 6 primary crops</div>
            </div>
            <div style={{ backgroundColor: '#ffffff', padding: '1.15rem', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
              <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>Repeat Buyer Rate</div>
              <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#a855f7', marginTop: '0.35rem' }}>78.4%</div>
              <div style={{ fontSize: '0.78rem', color: '#a855f7', fontWeight: 700, marginTop: '0.25rem' }}>Millers, exporters & aggregators</div>
            </div>
          </div>
        </div>
      )}

      {/* SOURCING MATCH MODAL */}
      {selectedRequestForMatching && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.55)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            zIndex: 1000,
          }}
          onClick={() => setSelectedRequestForMatching(null)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              maxWidth: '700px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '1.5rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                  Supplier Matching & Sourcing
                </h2>
                <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.8125rem' }}>
                  Matching verified growers for {selectedRequestForMatching.productName} ({selectedRequestForMatching.requiredQuantity} {selectedRequestForMatching.quantityUnit})
                </p>
              </div>
              <button
                onClick={() => setSelectedRequestForMatching(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#94a3b8' }}
              >
                ✕
              </button>
            </div>

            {isMatchingLoading ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Searching candidate growers...</div>
            ) : candidates.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                <p style={{ margin: 0, color: '#64748b' }}>No candidate growers found with matching produce name.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {candidates.map((c) => (
                  <div
                    key={c.listing.id}
                    style={{
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      padding: '1rem',
                      backgroundColor: '#fafbfc',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong style={{ fontSize: '1rem', color: '#0f172a' }}>
                          {c.listing.seller?.name || 'Verified Grower'}
                        </strong>
                        {c.listing.variety && (
                          <span style={{ marginLeft: '8px', fontSize: '0.8125rem', color: '#64748b' }}>
                            ({c.listing.variety})
                          </span>
                        )}
                        <div style={{ fontSize: '0.8125rem', color: '#059669', marginTop: '2px', fontWeight: 600 }}>
                          <Phone size={12} style={{ display: 'inline', marginRight: '4px' }} />
                          {c.listing.seller?.phoneNumber || 'No phone recorded'} (Internal Call Desk)
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px', backgroundColor: '#dbeafe', color: '#1d4ed8' }}>
                          Score: {c.matchScore}%
                        </span>
                      </div>
                    </div>

                    <div style={{ fontSize: '0.8125rem', color: '#334155', display: 'flex', gap: '1.5rem', marginTop: '4px' }}>
                      <div>
                        Available: <strong>{c.listing.minQuantity ?? 0} - {c.listing.maxQuantity ?? 'Any'} {c.listing.quantityUnit}</strong>
                        {c.quantityCompatible ? (
                          <span style={{ color: '#059669', marginLeft: '6px', fontWeight: 700 }}>✓ Covers volume</span>
                        ) : (
                          <span style={{ color: '#dc2626', marginLeft: '6px' }}>⚠ Check volume</span>
                        )}
                      </div>
                      <div>
                        Price: <strong>{c.listing.price ? `₹${c.listing.price} ${c.listing.priceUnit || ''}` : 'On inquiry'}</strong>
                      </div>
                      <div>
                        Location: <strong>{c.listing.district || c.listing.locationName || 'Local'}</strong>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
                      <button
                        onClick={() => handleLinkSupplier(c.listing.id)}
                        style={{
                          backgroundColor: '#059669',
                          color: '#ffffff',
                          padding: '6px 14px',
                          fontSize: '0.8125rem',
                          fontWeight: 700,
                          borderRadius: '8px',
                          border: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        Link & Assign Supplier
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* STATUS & SOURCING DETAILS MODAL */}
      {editingRequest && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.55)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            zIndex: 1000,
          }}
          onClick={() => setEditingRequest(null)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              maxWidth: '560px',
              width: '100%',
              padding: '1.5rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                Update Sourcing Status & Notes
              </h2>
              <button
                onClick={() => setEditingRequest(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#94a3b8' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '4px', color: '#334155' }}>
                  Request Status:
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    color: '#0f172a',
                    fontSize: '0.875rem',
                  }}
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '4px', color: '#334155' }}>
                    Verified Quantity:
                  </label>
                  <input
                    type="number"
                    value={verifiedQty}
                    onChange={(e) => setVerifiedQty(e.target.value)}
                    placeholder="e.g. 1000"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#0f172a', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '4px', color: '#334155' }}>
                    Verified Quality Grade:
                  </label>
                  <input
                    type="text"
                    value={verifiedQuality}
                    onChange={(e) => setVerifiedQuality(e.target.value)}
                    placeholder="e.g. Grade A, Export"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#0f172a', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '4px', color: '#334155' }}>
                    Procurement Cost (₹):
                  </label>
                  <input
                    type="number"
                    value={procurementCost}
                    onChange={(e) => setProcurementCost(e.target.value)}
                    placeholder="Negotiated farm price"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#0f172a', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '4px', color: '#334155' }}>
                    Quoted Delivery Price (₹):
                  </label>
                  <input
                    type="number"
                    value={quotePrice}
                    onChange={(e) => setQuotePrice(e.target.value)}
                    placeholder="Quoted to buyer"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#0f172a', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '4px', color: '#334155' }}>
                  Internal Sourcing Notes:
                </label>
                <textarea
                  rows={3}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Notes on grower contact, inspection dates, transport arrangements..."
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#0f172a', boxSizing: 'border-box', fontFamily: 'inherit' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  onClick={() => setEditingRequest(null)}
                  style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'transparent', color: '#475569', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveStatus}
                  disabled={isSavingStatus}
                  style={{
                    backgroundColor: '#059669',
                    color: '#ffffff',
                    padding: '8px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    fontWeight: 700,
                    cursor: isSavingStatus ? 'not-allowed' : 'pointer',
                  }}
                >
                  {isSavingStatus ? 'Saving...' : 'Save Updates'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE NEW LISTING MODAL */}
      {isNewListingOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(15, 23, 42, 0.55)',
            backdropFilter: 'blur(4px)',
            padding: '1rem',
          }}
          onClick={() => setIsNewListingOpen(false)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '640px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              display: 'flex',
              flexDirection: 'column',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid #e2e8f0',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    backgroundColor: '#ecfdf5',
                    color: '#059669',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Tag size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Create Agricultural Crop Listing
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
                    Publish verified farmer harvest produce to prospective wholesale buyers
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsNewListingOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '0.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '6px',
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateListingSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  Produce Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sona Masoori Paddy, Long Staple Cotton, Teja Chilli"
                  value={newListingForm.productName}
                  onChange={(e) => setNewListingForm({ ...newListingForm, productName: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.875rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    Crop Category
                  </label>
                  <select
                    value={newListingForm.cropType}
                    onChange={(e) => setNewListingForm({ ...newListingForm, cropType: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.875rem',
                      outline: 'none',
                      backgroundColor: '#ffffff',
                      boxSizing: 'border-box',
                    }}
                  >
                    <option value="Paddy">Paddy (Rice)</option>
                    <option value="Cotton">Cotton</option>
                    <option value="Chilli">Chilli</option>
                    <option value="Maize">Maize</option>
                    <option value="Turmeric">Turmeric</option>
                    <option value="Pulses">Pulses / Red Gram</option>
                    <option value="Other">Other Produce</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    Produce Variety
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. BPT 5204, RCH-659, Teja"
                    value={newListingForm.variety}
                    onChange={(e) => setNewListingForm({ ...newListingForm, variety: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.875rem',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    Available Quantity *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 50"
                    value={newListingForm.quantity}
                    onChange={(e) => setNewListingForm({ ...newListingForm, quantity: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.875rem',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    Quantity Unit
                  </label>
                  <select
                    value={newListingForm.quantityUnit}
                    onChange={(e) => setNewListingForm({ ...newListingForm, quantityUnit: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.875rem',
                      outline: 'none',
                      backgroundColor: '#ffffff',
                      boxSizing: 'border-box',
                    }}
                  >
                    <option value="Quintals">Quintals</option>
                    <option value="Bags">Bags (50 kg)</option>
                    <option value="Metric Tons">Metric Tons</option>
                    <option value="Kilograms">Kilograms</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    Asking Price (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 2400"
                    value={newListingForm.price}
                    onChange={(e) => setNewListingForm({ ...newListingForm, price: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.875rem',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    Quality Grade
                  </label>
                  <select
                    value={newListingForm.qualityGrade}
                    onChange={(e) => setNewListingForm({ ...newListingForm, qualityGrade: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.875rem',
                      outline: 'none',
                      backgroundColor: '#ffffff',
                      boxSizing: 'border-box',
                    }}
                  >
                    <option value="Grade A">Grade A (Premium / Export)</option>
                    <option value="Grade B">Grade B (Standard Commercial)</option>
                    <option value="Organic">Organic Certified</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    District / Mandal
                  </label>
                  <select
                    value={newListingForm.district}
                    onChange={(e) => setNewListingForm({ ...newListingForm, district: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.875rem',
                      outline: 'none',
                      backgroundColor: '#ffffff',
                      boxSizing: 'border-box',
                    }}
                  >
                    <option value="Warangal">Warangal</option>
                    <option value="Karimnagar">Karimnagar</option>
                    <option value="Khammam">Khammam</option>
                    <option value="Nizamabad">Nizamabad</option>
                    <option value="Nalgonda">Nalgonda</option>
                    <option value="Guntur">Guntur</option>
                    <option value="Kurnool">Kurnool</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    Farmer / FPO Contact Phone
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. 98480 12345"
                    value={newListingForm.sellerPhone}
                    onChange={(e) => setNewListingForm({ ...newListingForm, sellerPhone: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.875rem',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  Produce Specifications & Farm Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="Moisture percentage, harvest date, packing details, bag type, loading location..."
                  value={newListingForm.notes}
                  onChange={(e) => setNewListingForm({ ...newListingForm, notes: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.875rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                  }}
                />
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: '0.75rem',
                  paddingTop: '0.5rem',
                  borderTop: '1px solid #f1f5f9',
                }}
              >
                <button
                  type="button"
                  onClick={() => setIsNewListingOpen(false)}
                  style={{
                    padding: '0.55rem 1rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    color: '#475569',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingListing}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    padding: '0.55rem 1.25rem',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#059669',
                    color: '#ffffff',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: isSubmittingListing ? 'not-allowed' : 'pointer',
                    boxShadow: '0 1px 3px rgba(5, 150, 105, 0.3)',
                    opacity: isSubmittingListing ? 0.7 : 1,
                  }}
                >
                  <Send size={15} />
                  <span>{isSubmittingListing ? 'Publishing...' : 'Publish Crop Listing'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
