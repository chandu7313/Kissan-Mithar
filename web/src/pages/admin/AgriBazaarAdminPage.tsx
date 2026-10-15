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

export const AgriBazaarAdminPage: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'requests' | 'listings'>('requests');
  const [requests, setRequests] = useState<AgriProductRequest[]>([]);
  const [listings, setListings] = useState<AgriProductListing[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

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
      if (activeSubTab === 'requests') {
        const res = await AgriBazaarApi.getRequests({
          search: search || undefined,
          status: statusFilter || undefined,
        });
        setRequests(res.data || []);
      } else {
        const res = await AgriBazaarApi.getListings({
          search: search || undefined,
          status: statusFilter || undefined,
        });
        setListings(res.data || []);
      }
    } catch (err) {
      console.error('Failed to load Agri Bazaar data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeSubTab, statusFilter]);

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
      // Auto-update request status to SUPPLIER_IDENTIFIED if currently SUBMITTED or UNDER_REVIEW
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
      alert('Supplier successfully linked to this sourcing request!');
      setSelectedRequestForMatching(null);
      fetchData();
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
      fetchData();
    } catch (err) {
      alert('Failed to update status');
    } finally {
      setIsSavingStatus(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const s = STATUS_OPTIONS.find((opt) => opt.value === status);
    const label = s ? s.label : status;
    let bg = '#eff6ff';
    let text = '#1d4ed8';

    if (status === 'DELIVERED') {
      bg = '#f0fdf4';
      text = '#15803d';
    } else if (status === 'SOURCING_IN_PROGRESS' || status === 'UNDER_REVIEW') {
      bg = '#fffbeb';
      text = '#b45309';
    } else if (status === 'SUPPLIER_IDENTIFIED' || status === 'VERIFICATION_IN_PROGRESS') {
      bg = '#faf5ff';
      text = '#7e22ce';
    } else if (status === 'CANCELLED') {
      bg = '#fef2f2';
      text = '#b91c1c';
    }

    return (
      <span
        style={{
          display: 'inline-block',
          padding: '4px 10px',
          borderRadius: '999px',
          fontSize: '0.75rem',
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', color: '#16a34a', textTransform: 'uppercase' }}>
              Managed Sourcing Desk
            </span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
            Agri Bazaar — by Kissan Mithar
          </h1>
          <p style={{ margin: '0.25rem 0 0', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Coordinate customer sourcing requests, verify grower supplies, manage pricing & logistics.
          </p>
        </div>

        {/* Tab Toggle */}
        <div style={{ display: 'flex', background: 'var(--bg-card)', padding: '4px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <button
            onClick={() => { setActiveSubTab('requests'); setStatusFilter(''); }}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.875rem',
              cursor: 'pointer',
              backgroundColor: activeSubTab === 'requests' ? '#16a34a' : 'transparent',
              color: activeSubTab === 'requests' ? '#ffffff' : 'var(--text-main)',
            }}
          >
            Buyer Requests ({requests.length})
          </button>
          <button
            onClick={() => { setActiveSubTab('listings'); setStatusFilter(''); }}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.875rem',
              cursor: 'pointer',
              backgroundColor: activeSubTab === 'listings' ? '#16a34a' : 'transparent',
              color: activeSubTab === 'listings' ? '#ffffff' : 'var(--text-main)',
            }}
          >
            Seller Listings ({listings.length})
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', background: 'var(--bg-card)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
        <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search by produce name, variety, or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchData()}
            style={{
              width: '100%',
              padding: '10px 12px 10px 38px',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-main)',
              color: 'var(--text-main)',
              fontSize: '0.875rem',
            }}
          />
        </div>

        {activeSubTab === 'requests' && (
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '10px 14px',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-main)',
              color: 'var(--text-main)',
              fontSize: '0.875rem',
            }}
          >
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        )}

        <button
          onClick={fetchData}
          className="btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '10px 18px' }}
        >
          <RefreshCw size={16} /> Filter
        </button>
      </div>

      {/* Content Area */}
      {isLoading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading Agri Bazaar records...
        </div>
      ) : activeSubTab === 'requests' ? (
        /* Requests Table / Cards */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {requests.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <p style={{ color: 'var(--text-muted)', margin: 0 }}>No product sourcing requests found.</p>
            </div>
          ) : (
            requests.map((req) => (
              <div
                key={req.id}
                style={{
                  background: 'var(--bg-card)',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color)',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-main)' }}>
                        {req.productName}
                      </h3>
                      {req.variety && (
                        <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', background: 'var(--bg-main)', padding: '2px 8px', borderRadius: '6px' }}>
                          Variety: {req.variety}
                        </span>
                      )}
                      {getStatusBadge(req.status)}
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      Submitted {new Date(req.createdAt).toLocaleDateString()} by <strong>{req.buyer?.name || 'Customer'}</strong>
                      {req.buyer?.phoneNumber && (
                        <span style={{ marginLeft: '8px', color: '#16a34a', fontWeight: 600 }}>
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
                        background: '#eff6ff',
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
                        background: '#16a34a',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '0.8125rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      Update Status & Notes
                    </button>
                  </div>
                </div>

                {/* Key specs */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', background: 'var(--bg-main)', padding: '0.75rem 1rem', borderRadius: '8px' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Required Quantity (Fixed):</span>
                    <div style={{ fontWeight: 800, fontSize: '0.9375rem', color: 'var(--text-main)' }}>
                      {req.requiredQuantity} {req.quantityUnit}
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Target Price:</span>
                    <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-main)' }}>
                      {req.expectedPrice ? `₹${req.expectedPrice} ${req.priceUnit || ''}` : 'Coordinated by KM'}
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Delivery Location:</span>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-main)' }}>
                      <MapPin size={12} style={{ display: 'inline', marginRight: '3px' }} />
                      {req.locationName || `${req.district || ''}, ${req.state || ''}`}
                    </div>
                  </div>
                  {req.procurementCost && (
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Agreed Procurement:</span>
                      <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#16a34a' }}>
                        ₹{req.procurementCost}
                      </div>
                    </div>
                  )}
                </div>

                {req.adminNotes && (
                  <div style={{ fontSize: '0.8125rem', color: '#b45309', background: '#fffbeb', padding: '6px 12px', borderRadius: '6px' }}>
                    <strong>KM Internal Note:</strong> {req.adminNotes}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      ) : (
        /* Listings Table / Cards */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {listings.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <p style={{ color: 'var(--text-muted)', margin: 0 }}>No seller product listings found.</p>
            </div>
          ) : (
            listings.map((l) => (
              <div
                key={l.id}
                style={{
                  background: 'var(--bg-card)',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color)',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-main)' }}>
                        {l.productName || 'Agricultural Produce'}
                      </h3>
                      {l.variety && (
                        <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', background: 'var(--bg-main)', padding: '2px 8px', borderRadius: '6px' }}>
                          Variety: {l.variety}
                        </span>
                      )}
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', background: '#f0fdf4', color: '#15803d' }}>
                        {l.status}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      Registered by <strong>{l.seller?.name || 'Verified Supplier'}</strong>
                      {l.seller?.phoneNumber && (
                        <span style={{ marginLeft: '8px', color: '#16a34a', fontWeight: 600 }}>
                          <Phone size={12} style={{ display: 'inline', marginRight: '3px' }} />
                          {l.seller.phoneNumber} (Internal Contact)
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', background: 'var(--bg-main)', padding: '0.75rem 1rem', borderRadius: '8px' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Available Quantity:</span>
                    <div style={{ fontWeight: 800, fontSize: '0.9375rem', color: 'var(--text-main)' }}>
                      {l.minQuantity != null && l.maxQuantity != null
                        ? `${l.minQuantity} - ${l.maxQuantity} ${l.quantityUnit || 'kg'}`
                        : l.minQuantity != null
                        ? `Min ${l.minQuantity} ${l.quantityUnit || 'kg'}`
                        : l.maxQuantity != null
                        ? `Up to ${l.maxQuantity} ${l.quantityUnit || 'kg'}`
                        : 'On Inquiry'}
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Expected Price:</span>
                    <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-main)' }}>
                      {l.price != null && l.price > 0 ? `₹${l.price} ${l.priceUnit || ''}` : 'Open to offer'}
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Origin Farm Location:</span>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-main)' }}>
                      <MapPin size={12} style={{ display: 'inline', marginRight: '3px' }} />
                      {l.locationName || `${l.district || ''}, ${l.state || ''}`}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* SOURCING MATCH MODAL */}
      {selectedRequestForMatching && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: 'var(--bg-card)',
              borderRadius: '16px',
              maxWidth: '700px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '1.5rem',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  Supplier Matching & Sourcing
                </h2>
                <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                  Matching suppliers for {selectedRequestForMatching.productName} ({selectedRequestForMatching.requiredQuantity} {selectedRequestForMatching.quantityUnit})
                </p>
              </div>
              <button
                onClick={() => setSelectedRequestForMatching(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                ✕
              </button>
            </div>

            {isMatchingLoading ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Searching candidate growers...</div>
            ) : candidates.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', background: 'var(--bg-main)', borderRadius: '8px' }}>
                <p style={{ margin: 0, color: 'var(--text-muted)' }}>No candidate growers found with matching produce name.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {candidates.map((c, i) => (
                  <div
                    key={c.listing.id}
                    style={{
                      border: '1px solid var(--border-color)',
                      borderRadius: '10px',
                      padding: '1rem',
                      background: 'var(--bg-main)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong style={{ fontSize: '1rem', color: 'var(--text-main)' }}>
                          {c.listing.seller?.name || 'Verified Grower'}
                        </strong>
                        {c.listing.variety && (
                          <span style={{ marginLeft: '8px', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                            ({c.listing.variety})
                          </span>
                        )}
                        <div style={{ fontSize: '0.8125rem', color: '#16a34a', marginTop: '2px', fontWeight: 600 }}>
                          <Phone size={12} style={{ display: 'inline', marginRight: '4px' }} />
                          {c.listing.seller?.phoneNumber || 'No phone recorded'} (Internal Call Desk)
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px', background: '#dbeafe', color: '#1d4ed8' }}>
                          Score: {c.matchScore}%
                        </span>
                      </div>
                    </div>

                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-main)', display: 'flex', gap: '1.5rem', marginTop: '4px' }}>
                      <div>
                        Available: <strong>{c.listing.minQuantity ?? 0} - {c.listing.maxQuantity ?? 'Any'} {c.listing.quantityUnit}</strong>
                        {c.quantityCompatible ? (
                          <span style={{ color: '#16a34a', marginLeft: '6px', fontWeight: 700 }}>✓ Covers volume</span>
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
                        className="btn-primary"
                        style={{ padding: '6px 14px', fontSize: '0.8125rem' }}
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
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: 'var(--bg-card)',
              borderRadius: '16px',
              maxWidth: '560px',
              width: '100%',
              padding: '1.5rem',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
                Update Sourcing Status & Notes
              </h2>
              <button
                onClick={() => setEditingRequest(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '4px', color: 'var(--text-main)' }}>
                  Request Status:
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-main)',
                    color: 'var(--text-main)',
                  }}
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '4px', color: 'var(--text-main)' }}>
                    Verified Quantity:
                  </label>
                  <input
                    type="number"
                    value={verifiedQty}
                    onChange={(e) => setVerifiedQty(e.target.value)}
                    placeholder="e.g. 1000"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '4px', color: 'var(--text-main)' }}>
                    Verified Quality Grade:
                  </label>
                  <input
                    type="text"
                    value={verifiedQuality}
                    onChange={(e) => setVerifiedQuality(e.target.value)}
                    placeholder="e.g. Grade A, Export"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '4px', color: 'var(--text-main)' }}>
                    Procurement Cost (₹):
                  </label>
                  <input
                    type="number"
                    value={procurementCost}
                    onChange={(e) => setProcurementCost(e.target.value)}
                    placeholder="Negotiated farm price"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '4px', color: 'var(--text-main)' }}>
                    Quoted Delivery Price (₹):
                  </label>
                  <input
                    type="number"
                    value={quotePrice}
                    onChange={(e) => setQuotePrice(e.target.value)}
                    placeholder="Quoted to buyer"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '4px', color: 'var(--text-main)' }}>
                  Internal Sourcing Notes:
                </label>
                <textarea
                  rows={3}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Notes on grower contact, inspection dates, transport arrangements..."
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  onClick={() => setEditingRequest(null)}
                  style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-main)', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveStatus}
                  disabled={isSavingStatus}
                  className="btn-primary"
                  style={{ padding: '8px 20px' }}
                >
                  {isSavingStatus ? 'Saving...' : 'Save Updates'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
