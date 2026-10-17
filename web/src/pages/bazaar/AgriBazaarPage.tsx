import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  MapPin,
  Compass,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Truck,
  ArrowRight,
  Filter,
  Plus,
  Edit2,
  Trash2,
  X,
  Upload,
  ChevronRight,
  AlertCircle,
  HelpCircle,
  Package,
  Layers,
  Phone,
  User,
  ShoppingBag,
  ExternalLink,
  ChevronDown,
  Menu,
  Sparkles,
  Info
} from 'lucide-react';
import { UserSession } from '../../types/index.js';
import {
  AgriBazaarApi,
  AgriProductListing,
  AgriProductRequest
} from '../../api/agriBazaar.api.js';
import { MobileBottomNav } from '../../components/layout/MobileBottomNav.js';
import './AgriBazaar.css';

interface AgriBazaarPageProps {
  session: UserSession | null;
  onNavigateHome: () => void;
  onAdminLogin?: () => void;
  onNavigateAdminDesk?: () => void;
}

type BazaarView =
  | 'home'
  | 'browse'
  | 'how-it-works'
  | 'about'
  | 'contact'
  | 'my-requests'
  | 'my-products';

const QUANTITY_UNITS = ['kg', 'quintal', 'tonne', 'crates', 'bags', 'boxes', 'pieces'];
const PRICE_UNITS = ['₹ / kg', '₹ / quintal', '₹ / tonne', '₹ / crate', '₹ / bag', '₹ / piece'];

const REQUEST_STATUS_STAGES = [
  { key: 'SUBMITTED', title: '1. Submitted', desc: 'Request logged with requirements & location' },
  { key: 'UNDER_REVIEW', title: '2. Under Review', desc: 'Kissan Mithar sourcing desk reviewing produce specs' },
  { key: 'SOURCING_IN_PROGRESS', title: '3. Sourcing in Progress', desc: 'Sourcing team checking registered grower network' },
  { key: 'SUPPLIER_IDENTIFIED', title: '4. Supplier Identified', desc: 'Matching grower produce shortlisted' },
  { key: 'VERIFICATION_IN_PROGRESS', title: '5. Verification in Progress', desc: 'Field agronomists verifying quantity & quality' },
  { key: 'PROCUREMENT_IN_PROGRESS', title: '6. Procurement in Progress', desc: 'Commercial agreement & loading scheduled' },
  { key: 'DELIVERY_IN_PROGRESS', title: '7. Delivery in Progress', desc: 'Produce in transit with managed freight' },
  { key: 'DELIVERED', title: '8. Delivered', desc: 'Produce received and verified at destination' },
];

export const AgriBazaarPage: React.FC<AgriBazaarPageProps> = ({
  session,
  onNavigateHome,
  onAdminLogin,
  onNavigateAdminDesk
}) => {
  // Navigation State
  const [currentView, setCurrentView] = useState<BazaarView>('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // User Identity (from session, or saved phone identifier for buyers/sellers)
  const [userPhone, setUserPhone] = useState<string>(() => {
    return session?.phoneNumber || localStorage.getItem('bz_user_phone') || '';
  });
  const [userName, setUserName] = useState<string>(() => {
    return session?.name || localStorage.getItem('bz_user_name') || '';
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authPhoneInput, setAuthPhoneInput] = useState('');
  const [authNameInput, setAuthNameInput] = useState('');

  // Browse Catalog State
  const [listings, setListings] = useState<AgriProductListing[]>([]);
  const [loadingListings, setLoadingListings] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStateFilter, setSelectedStateFilter] = useState('');
  const [selectedListingDetail, setSelectedListingDetail] = useState<AgriProductListing | null>(null);

  // Quick Request State
  const [quickForm, setQuickForm] = useState({
    productName: '',
    requiredQuantity: '',
    quantityUnit: 'tonne',
    deliveryLocation: '',
    expectedPrice: '',
    priceUnit: '₹ / tonne',
  });

  // Full Buyer Request Modal State
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requestFormData, setRequestFormData] = useState({
    productName: '',
    variety: '',
    requiredQuantity: '',
    quantityUnit: 'tonne',
    expectedPrice: '',
    priceUnit: '₹ / tonne',
    locationName: '',
    village: '',
    district: '',
    state: '',
    pincode: '',
    latitude: undefined as number | undefined,
    longitude: undefined as number | undefined,
    photos: [] as string[],
    phoneNumber: userPhone,
  });
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [requestConfirmedData, setRequestConfirmedData] = useState<AgriProductRequest | null>(null);

  // Full Seller Product Modal State
  const [isSellerModalOpen, setIsSellerModalOpen] = useState(false);
  const [sellerFormData, setSellerFormData] = useState({
    id: undefined as string | undefined,
    productName: '',
    variety: '',
    minQuantity: '',
    maxQuantity: '',
    quantityUnit: 'tonne',
    price: '',
    priceUnit: '₹ / tonne',
    locationName: '',
    village: '',
    district: '',
    state: '',
    pincode: '',
    latitude: undefined as number | undefined,
    longitude: undefined as number | undefined,
    photos: [] as string[],
    phoneNumber: userPhone,
    notes: '',
  });
  const [submittingSeller, setSubmittingSeller] = useState(false);

  // Buyer My Requests State
  const [myRequests, setMyRequests] = useState<AgriProductRequest[]>([]);
  const [loadingMyRequests, setLoadingMyRequests] = useState(false);
  const [selectedTrackingRequest, setSelectedTrackingRequest] = useState<AgriProductRequest | null>(null);
  const [isEditRequestModalOpen, setIsEditRequestModalOpen] = useState(false);

  // Seller My Products State
  const [myProducts, setMyProducts] = useState<AgriProductListing[]>([]);
  const [loadingMyProducts, setLoadingMyProducts] = useState(false);

  // Feedback notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Sync phone identity
  useEffect(() => {
    if (session?.phoneNumber) {
      setUserPhone(session.phoneNumber);
      setUserName(session.name);
    }
  }, [session]);

  // Load public catalog listings
  const loadListings = async () => {
    setLoadingListings(true);
    try {
      const res = await AgriBazaarApi.getListings({
        search: searchQuery || undefined,
        state: selectedStateFilter || undefined,
        limit: 30,
      });
      setListings(res.data || []);
    } catch (err) {
      console.error('Failed to load listings:', err);
    } finally {
      setLoadingListings(false);
    }
  };

  useEffect(() => {
    loadListings();
  }, [searchQuery, selectedStateFilter]);

  // Load user's buyer requests
  const loadMyRequests = async () => {
    if (!userPhone && !session?.userId) return;
    setLoadingMyRequests(true);
    try {
      const res = await AgriBazaarApi.getRequests({
        phoneNumber: userPhone || undefined,
        buyerId: session?.userId || undefined,
        limit: 50,
      });
      setMyRequests(res.data || []);
    } catch (err) {
      console.error('Failed to load user requests:', err);
    } finally {
      setLoadingMyRequests(false);
    }
  };

  // Load user's seller products
  const loadMyProducts = async () => {
    if (!userPhone && !session?.userId) return;
    setLoadingMyProducts(true);
    try {
      const res = await AgriBazaarApi.getListings({
        phoneNumber: userPhone || undefined,
        sellerId: session?.userId || undefined,
        limit: 50,
      });
      setMyProducts(res.data || []);
    } catch (err) {
      console.error('Failed to load seller products:', err);
    } finally {
      setLoadingMyProducts(false);
    }
  };

  useEffect(() => {
    if (currentView === 'my-requests') {
      loadMyRequests();
    } else if (currentView === 'my-products') {
      loadMyProducts();
    }
  }, [currentView, userPhone, session]);

  // Geolocation Handler
  const handleDetectLocation = (target: 'buyer' | 'seller' | 'quick') => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser. Please enter location manually.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        let formatted = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;

        // Attempt reverse geocoding via OpenStreetMap
        try {
          const resp = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          if (resp.ok) {
            const data = await resp.json();
            const addr = data.address || {};
            const town = addr.village || addr.town || addr.city || addr.suburb || '';
            const dist = addr.state_district || addr.county || '';
            const st = addr.state || '';
            const pin = addr.postcode || '';

            if (target === 'quick') {
              setQuickForm((prev) => ({
                ...prev,
                deliveryLocation: [town, dist, st].filter(Boolean).join(', '),
              }));
            } else if (target === 'buyer') {
              setRequestFormData((prev) => ({
                ...prev,
                locationName: [town, dist, st].filter(Boolean).join(', '),
                village: town,
                district: dist,
                state: st,
                pincode: pin,
                latitude,
                longitude,
              }));
            } else {
              setSellerFormData((prev) => ({
                ...prev,
                locationName: [town, dist, st].filter(Boolean).join(', '),
                village: town,
                district: dist,
                state: st,
                pincode: pin,
                latitude,
                longitude,
              }));
            }
            showToast('Location coordinates detected');
            return;
          }
        } catch {
          // Fallback to coordinates
        }

        if (target === 'quick') {
          setQuickForm((prev) => ({ ...prev, deliveryLocation: formatted }));
        } else if (target === 'buyer') {
          setRequestFormData((prev) => ({
            ...prev,
            locationName: formatted,
            latitude,
            longitude,
          }));
        } else {
          setSellerFormData((prev) => ({
            ...prev,
            locationName: formatted,
            latitude,
            longitude,
          }));
        }
        showToast('Location coordinates detected');
      },
      (error) => {
        console.warn('Geolocation error:', error);
        alert('Could not access current location. Please enter your location manually.');
      },
      { timeout: 8000 }
    );
  };

  // Photo Upload Handler
  const handleUploadPhoto = async (
    e: React.ChangeEvent<HTMLInputElement>,
    target: 'buyer' | 'seller'
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (file.size > 10 * 1024 * 1024) {
      alert('File exceeds 10MB limit. Please choose a smaller photo.');
      return;
    }

    try {
      showToast('Uploading photo...');
      const photoUrl = await AgriBazaarApi.uploadPhoto(file);
      if (target === 'buyer') {
        setRequestFormData((prev) => ({
          ...prev,
          photos: [...prev.photos, photoUrl],
        }));
      } else {
        setSellerFormData((prev) => ({
          ...prev,
          photos: [...prev.photos, photoUrl],
        }));
      }
      showToast('Photo uploaded');
    } catch (err) {
      console.error('Photo upload failed:', err);
      alert('Photo upload failed. Please try again or continue without photo.');
    }
  };

  // Submit Quick Request -> Prefill Full Request Form
  const handleContinueQuickRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickForm.productName.trim()) {
      alert('Please enter the product name you need.');
      return;
    }
    if (!quickForm.requiredQuantity || Number(quickForm.requiredQuantity) <= 0) {
      alert('Please enter a valid required quantity.');
      return;
    }

    setRequestFormData((prev) => ({
      ...prev,
      productName: quickForm.productName,
      requiredQuantity: quickForm.requiredQuantity,
      quantityUnit: quickForm.quantityUnit,
      locationName: quickForm.deliveryLocation,
      expectedPrice: quickForm.expectedPrice,
      priceUnit: quickForm.priceUnit,
    }));
    setIsRequestModalOpen(true);
  };

  // Submit Full Buyer Request
  const handleSubmitBuyerRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestFormData.productName.trim()) {
      alert('Product name is required.');
      return;
    }
    if (!requestFormData.requiredQuantity || Number(requestFormData.requiredQuantity) <= 0) {
      alert('Please provide a valid numeric required quantity.');
      return;
    }
    if (!requestFormData.locationName.trim() && !requestFormData.district.trim()) {
      alert('Please provide the delivery destination or location.');
      return;
    }

    const phoneToUse = requestFormData.phoneNumber || userPhone;
    if (!phoneToUse && !session?.userId) {
      alert('Please provide a contact phone number so our team can coordinate with you.');
      return;
    }

    setSubmittingRequest(true);
    try {
      const payload = {
        productName: requestFormData.productName.trim(),
        variety: requestFormData.variety.trim() || undefined,
        requiredQuantity: Number(requestFormData.requiredQuantity),
        quantityUnit: requestFormData.quantityUnit,
        expectedPrice: requestFormData.expectedPrice ? Number(requestFormData.expectedPrice) : undefined,
        priceUnit: requestFormData.expectedPrice ? requestFormData.priceUnit : undefined,
        locationType: (requestFormData.latitude ? 'CURRENT' : 'MANUAL') as 'CURRENT' | 'MANUAL',
        locationName: requestFormData.locationName || undefined,
        village: requestFormData.village || undefined,
        district: requestFormData.district || undefined,
        state: requestFormData.state || undefined,
        pincode: requestFormData.pincode || undefined,
        latitude: requestFormData.latitude,
        longitude: requestFormData.longitude,
        photos: requestFormData.photos,
        phoneNumber: phoneToUse,
        buyerId: session?.userId,
      };

      const created = await AgriBazaarApi.createRequest(payload);
      if (phoneToUse && phoneToUse !== userPhone) {
        setUserPhone(phoneToUse);
        localStorage.setItem('bz_user_phone', phoneToUse);
      }

      setIsRequestModalOpen(false);
      setRequestConfirmedData(created);
      showToast('Product request submitted to Kissan Mithar');
      loadMyRequests();
    } catch (err: any) {
      console.error('Request submission failed:', err);
      alert(err.response?.data?.message || 'Failed to submit request. Please check required fields.');
    } finally {
      setSubmittingRequest(false);
    }
  };

  // Submit Seller Listing Registration / Edit
  const handleSubmitSellerListing = async (e: React.FormEvent) => {
    e.preventDefault();
    const phoneToUse = sellerFormData.phoneNumber || userPhone;
    if (!phoneToUse && !session?.userId) {
      alert('Please provide a contact phone number so Kissan Mithar can contact you when sourcing.');
      return;
    }

    const minQ = sellerFormData.minQuantity ? Number(sellerFormData.minQuantity) : undefined;
    const maxQ = sellerFormData.maxQuantity ? Number(sellerFormData.maxQuantity) : undefined;

    if (minQ !== undefined && maxQ !== undefined && minQ > maxQ) {
      alert('Minimum quantity cannot be greater than maximum quantity.');
      return;
    }

    setSubmittingSeller(true);
    try {
      const payload = {
        productName: sellerFormData.productName.trim() || undefined,
        variety: sellerFormData.variety.trim() || undefined,
        minQuantity: minQ,
        maxQuantity: maxQ,
        quantityUnit: minQ !== undefined || maxQ !== undefined ? sellerFormData.quantityUnit : undefined,
        price: sellerFormData.price ? Number(sellerFormData.price) : undefined,
        priceUnit: sellerFormData.price ? sellerFormData.priceUnit : undefined,
        locationType: (sellerFormData.latitude ? 'CURRENT' : 'MANUAL') as 'CURRENT' | 'MANUAL',
        locationName: sellerFormData.locationName || undefined,
        village: sellerFormData.village || undefined,
        district: sellerFormData.district || undefined,
        state: sellerFormData.state || undefined,
        pincode: sellerFormData.pincode || undefined,
        latitude: sellerFormData.latitude,
        longitude: sellerFormData.longitude,
        photos: sellerFormData.photos,
        notes: sellerFormData.notes || undefined,
        phoneNumber: phoneToUse,
        sellerId: session?.userId,
      };

      if (sellerFormData.id) {
        await AgriBazaarApi.updateListing(sellerFormData.id, payload);
        showToast('Product listing updated');
      } else {
        await AgriBazaarApi.createListing(payload);
        showToast('Product registered with Kissan Mithar Agri Bazaar');
      }

      if (phoneToUse && phoneToUse !== userPhone) {
        setUserPhone(phoneToUse);
        localStorage.setItem('bz_user_phone', phoneToUse);
      }

      setIsSellerModalOpen(false);
      loadListings();
      loadMyProducts();
    } catch (err: any) {
      console.error('Seller submission failed:', err);
      alert(err.response?.data?.message || 'Failed to register product.');
    } finally {
      setSubmittingSeller(false);
    }
  };

  // Delete Seller Listing
  const handleDeleteListing = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this product listing?')) return;
    try {
      await AgriBazaarApi.deleteListing(id);
      showToast('Product listing removed');
      loadMyProducts();
      loadListings();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to remove listing.');
    }
  };

  // Cancel Buyer Request
  const handleCancelRequest = async (id: string) => {
    if (!window.confirm('Are you sure you want to cancel this request?')) return;
    try {
      await AgriBazaarApi.cancelRequest(id);
      showToast('Request cancelled');
      loadMyRequests();
      if (selectedTrackingRequest?.id === id) {
        setSelectedTrackingRequest(null);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Cannot cancel request at this stage.');
    }
  };

  // Phone Identification Modal
  const handleSavePhoneIdentity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authPhoneInput.trim()) {
      alert('Please enter your phone number.');
      return;
    }
    setUserPhone(authPhoneInput.trim());
    if (authNameInput.trim()) setUserName(authNameInput.trim());
    localStorage.setItem('bz_user_phone', authPhoneInput.trim());
    if (authNameInput.trim()) localStorage.setItem('bz_user_name', authNameInput.trim());
    setIsAuthModalOpen(false);
    showToast(`Identity saved for ${authPhoneInput.trim()}`);
  };

  // Status Badge Helper
  const renderStatusBadge = (status: string) => {
    const s = status.toUpperCase();
    let badgeClass = 'bz-badge-submitted';
    let label = status;

    switch (s) {
      case 'SUBMITTED':
        badgeClass = 'bz-badge-submitted';
        label = 'Submitted';
        break;
      case 'UNDER_REVIEW':
        badgeClass = 'bz-badge-review';
        label = 'Under Review';
        break;
      case 'SOURCING_IN_PROGRESS':
        badgeClass = 'bz-badge-sourcing';
        label = 'Sourcing';
        break;
      case 'SUPPLIER_IDENTIFIED':
        badgeClass = 'bz-badge-identified';
        label = 'Supplier Found';
        break;
      case 'VERIFICATION_IN_PROGRESS':
        badgeClass = 'bz-badge-verification';
        label = 'Verifying';
        break;
      case 'PROCUREMENT_IN_PROGRESS':
        badgeClass = 'bz-badge-procurement';
        label = 'Procuring';
        break;
      case 'DELIVERY_IN_PROGRESS':
        badgeClass = 'bz-badge-delivery';
        label = 'In Transit';
        break;
      case 'DELIVERED':
        badgeClass = 'bz-badge-delivered';
        label = 'Delivered';
        break;
      case 'CANCELLED':
        badgeClass = 'bz-badge-cancelled';
        label = 'Cancelled';
        break;
      case 'ACTIVE':
        badgeClass = 'bz-badge-sourcing';
        label = 'Available';
        break;
      case 'FULFILLED':
        badgeClass = 'bz-badge-delivered';
        label = 'Fulfilled';
        break;
    }

    return <span className={`bz-badge ${badgeClass}`}>{label}</span>;
  };

  // Available unique states for filtering
  const availableStates = useMemo(() => {
    const set = new Set<string>();
    listings.forEach((l) => {
      if (l.state) set.add(l.state);
    });
    return Array.from(set);
  }, [listings]);

  return (
    <div className="agri-bazaar-root">
      {/* Toast Feedback */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            backgroundColor: '#1b4332',
            color: '#ffffff',
            padding: '12px 20px',
            borderRadius: '9999px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
            zIndex: 9999,
            fontSize: '14px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <CheckCircle2 size={18} color="#52b788" />
          {toastMessage}
        </div>
      )}

      {/* ====================================================================
          1. HEADER AND NAVIGATION
          ==================================================================== */}
      <header className="bz-header">
        <div className="bz-header-container">
          {/* Brand Identity */}
          <div
            className="bz-brand"
            onClick={() => {
              setCurrentView('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            <img
              src="/kissan_mithar_logo_v2.png"
              alt="Kissan Mithar"
              className="bz-brand-logo"
            />
            <div className="bz-brand-text">
              <div className="bz-brand-title">
                Agri Bazaar <span className="bz-accent">— by Kissan Mithar</span>
              </div>
              <div className="bz-brand-descriptor">
                Agricultural Products Sourcing & Supply
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="bz-nav-desktop">
            <span
              className={`bz-nav-link ${currentView === 'home' ? 'active' : ''}`}
              onClick={() => setCurrentView('home')}
            >
              Home
            </span>
            <span
              className={`bz-nav-link ${currentView === 'browse' ? 'active' : ''}`}
              onClick={() => setCurrentView('browse')}
            >
              Browse Products
            </span>
            <span
              className={`bz-nav-link ${currentView === 'how-it-works' ? 'active' : ''}`}
              onClick={() => setCurrentView('how-it-works')}
            >
              How It Works
            </span>
            <span
              className={`bz-nav-link ${currentView === 'my-products' ? 'active' : ''}`}
              onClick={() => {
                if (!userPhone && !session) {
                  setIsAuthModalOpen(true);
                } else {
                  setCurrentView('my-products');
                }
              }}
            >
              For Suppliers
            </span>
            <span
              className={`bz-nav-link ${currentView === 'about' ? 'active' : ''}`}
              onClick={() => setCurrentView('about')}
            >
              About
            </span>
            <span
              className={`bz-nav-link ${currentView === 'contact' ? 'active' : ''}`}
              onClick={() => setCurrentView('contact')}
            >
              Contact
            </span>
          </nav>

          {/* Header Action CTAs */}
          <div className="bz-header-actions">
            {/* User Activity Hub */}
            {userPhone || session ? (
              <div
                className="bz-user-menu-btn"
                onClick={() => {
                  if (currentView === 'my-requests') setCurrentView('my-products');
                  else setCurrentView('my-requests');
                }}
                title="Switch between your buyer requests & supplier listings"
              >
                <User size={15} />
                <span>{userName || userPhone || 'My Account'}</span>
                <ChevronDown size={14} />
              </div>
            ) : (
              <button
                className="bz-btn-pill bz-btn-ghost"
                onClick={() => setIsAuthModalOpen(true)}
              >
                <Phone size={14} />
                <span>My Orders</span>
              </button>
            )}

            {/* Admin Desk Direct Link if logged in as Admin/Expert */}
            {session && (session.role === 'ADMIN' || session.role === 'EXPERT') && (
              <button
                className="bz-btn-pill bz-btn-outline"
                onClick={onNavigateAdminDesk || onNavigateHome}
                title="Go to Internal Sourcing Desk"
              >
                Admin Desk
              </button>
            )}

            {/* Primary Request CTA */}
            <button
              className="bz-btn-pill bz-btn-primary"
              onClick={() => {
                setRequestFormData({
                  productName: '',
                  variety: '',
                  requiredQuantity: '',
                  quantityUnit: 'tonne',
                  expectedPrice: '',
                  priceUnit: '₹ / tonne',
                  locationName: '',
                  village: '',
                  district: '',
                  state: '',
                  pincode: '',
                  latitude: undefined,
                  longitude: undefined,
                  photos: [],
                  phoneNumber: userPhone,
                });
                setIsRequestModalOpen(true);
              }}
            >
              <Package size={15} />
              <span>Request a Product</span>
            </button>

            {/* Mobile Menu Toggle */}
            <button
              className="bz-mobile-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="bz-mobile-drawer">
            <span
              className={`bz-mobile-nav-link ${currentView === 'home' ? 'active' : ''}`}
              onClick={() => {
                setCurrentView('home');
                setMobileMenuOpen(false);
              }}
            >
              Home
            </span>
            <span
              className={`bz-mobile-nav-link ${currentView === 'browse' ? 'active' : ''}`}
              onClick={() => {
                setCurrentView('browse');
                setMobileMenuOpen(false);
              }}
            >
              Browse Products
            </span>
            <span
              className={`bz-mobile-nav-link ${currentView === 'how-it-works' ? 'active' : ''}`}
              onClick={() => {
                setCurrentView('how-it-works');
                setMobileMenuOpen(false);
              }}
            >
              How It Works
            </span>
            <span
              className={`bz-mobile-nav-link ${currentView === 'my-products' ? 'active' : ''}`}
              onClick={() => {
                setMobileMenuOpen(false);
                if (!userPhone && !session) setIsAuthModalOpen(true);
                else setCurrentView('my-products');
              }}
            >
              For Suppliers (My Products)
            </span>
            <span
              className={`bz-mobile-nav-link ${currentView === 'my-requests' ? 'active' : ''}`}
              onClick={() => {
                setMobileMenuOpen(false);
                if (!userPhone && !session) setIsAuthModalOpen(true);
                else setCurrentView('my-requests');
              }}
            >
              My Requests & Tracking
            </span>
            <span
              className={`bz-mobile-nav-link ${currentView === 'about' ? 'active' : ''}`}
              onClick={() => {
                setCurrentView('about');
                setMobileMenuOpen(false);
              }}
            >
              About Agri Bazaar
            </span>
            <span
              className={`bz-mobile-nav-link ${currentView === 'contact' ? 'active' : ''}`}
              onClick={() => {
                setCurrentView('contact');
                setMobileMenuOpen(false);
              }}
            >
              Contact / Help
            </span>

            <div className="bz-mobile-actions">
              <button
                className="bz-btn-pill bz-btn-primary"
                style={{ width: '100%' }}
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsRequestModalOpen(true);
                }}
              >
                Request a Product
              </button>
              <button
                className="bz-btn-pill bz-btn-outline"
                style={{ width: '100%' }}
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsSellerModalOpen(true);
                }}
              >
                Register as a Supplier
              </button>
              {onAdminLogin && (
                <button
                  className="bz-btn-pill bz-btn-ghost"
                  style={{ width: '100%' }}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onAdminLogin();
                  }}
                >
                  Admin Login
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ====================================================================
          SUBVIEW DISPATCHER
          ==================================================================== */}
      {currentView === 'browse' ? (
        renderBrowseCatalogView()
      ) : currentView === 'my-requests' ? (
        renderMyRequestsView()
      ) : currentView === 'my-products' ? (
        renderMyProductsView()
      ) : currentView === 'how-it-works' ? (
        renderHowItWorksPageView()
      ) : currentView === 'about' ? (
        renderAboutPageView()
      ) : currentView === 'contact' ? (
        renderContactPageView()
      ) : (
        renderHomePageView()
      )}

      {/* ====================================================================
          FOOTER
          ==================================================================== */}
      <footer className="bz-footer">
        <div className="bz-footer-container">
          <div className="bz-footer-brand">
            <div className="bz-brand-title" style={{ color: '#ffffff' }}>
              Agri Bazaar <span style={{ color: '#52b788' }}>— by Kissan Mithar</span>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.6, maxWidth: 360 }}>
              Your Agricultural Needs, Sourced and Delivered. A managed agricultural product sourcing and supply service operated by Kissan Mithar.
            </p>
            <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
              <span className="bz-badge bz-badge-sourcing">Managed Sourcing</span>
              <span className="bz-badge bz-badge-identified">Farm Gate Verification</span>
            </div>
          </div>

          <div>
            <div className="bz-footer-title">Navigation</div>
            <div className="bz-footer-links">
              <span className="bz-footer-link" onClick={() => setCurrentView('home')}>
                Agri Bazaar Home
              </span>
              <span className="bz-footer-link" onClick={() => setCurrentView('browse')}>
                Browse Products
              </span>
              <span className="bz-footer-link" onClick={() => setCurrentView('how-it-works')}>
                How It Works
              </span>
              <span className="bz-footer-link" onClick={() => setCurrentView('about')}>
                About Service
              </span>
              <span className="bz-footer-link" onClick={() => setCurrentView('contact')}>
                Contact & Support
              </span>
            </div>
          </div>

          <div>
            <div className="bz-footer-title">For Sourcing & Supply</div>
            <div className="bz-footer-links">
              <span className="bz-footer-link" onClick={() => setIsRequestModalOpen(true)}>
                Request a Product
              </span>
              <span className="bz-footer-link" onClick={() => setIsSellerModalOpen(true)}>
                Register as a Supplier
              </span>
              <span className="bz-footer-link" onClick={() => setCurrentView('my-requests')}>
                My Requests & Tracking
              </span>
              <span className="bz-footer-link" onClick={() => setCurrentView('my-products')}>
                My Registered Products
              </span>
              <span className="bz-footer-link" onClick={onNavigateHome}>
                Kissan Mithar Home
              </span>
            </div>
          </div>

          <div>
            <div className="bz-footer-title">Kissan Mithar Operations</div>
            <p style={{ color: '#94a3b8', fontSize: '13.5px', lineHeight: 1.6 }}>
              Central Operations Desk:
              <br />
              Telangana & Andhra Pradesh Agricultural Supply Networks
              <br />
              Support hours: Mon - Sat, 9:00 AM - 7:00 PM IST
            </p>
            <div style={{ marginTop: 12 }}>
              <span
                style={{ color: '#52b788', fontSize: '13px', cursor: 'pointer', fontWeight: 600 }}
                onClick={onAdminLogin}
              >
                Authorized Staff Access →
              </span>
            </div>
          </div>
        </div>

        <div className="bz-footer-bottom">
          <div>
            © {new Date().getFullYear()} Kissan Mithar. All rights reserved. Agri Bazaar is an internal managed supply service.
          </div>
          <div style={{ display: 'flex', gap: 20 }}>
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Managed Sourcing Standards</span>
          </div>
        </div>
      </footer>

      {/* ====================================================================
          BUYER REQUEST MODAL
          ==================================================================== */}
      {isRequestModalOpen && (
        <div className="bz-modal-backdrop" onClick={() => setIsRequestModalOpen(false)}>
          <div className="bz-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="bz-modal-header">
              <div className="bz-modal-title">Request an Agricultural Product</div>
              <button
                className="bz-modal-close-btn"
                onClick={() => setIsRequestModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitBuyerRequest}>
              <div className="bz-modal-body">
                <div
                  style={{
                    background: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    fontSize: '13px',
                    color: '#166534',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                  }}
                >
                  <Info size={18} style={{ flexShrink: 0 }} />
                  <span>
                    <strong>Managed Sourcing:</strong> Kissan Mithar will verify registered suppliers, physically inspect produce quality, and coordinate delivery to your destination.
                  </span>
                </div>

                {/* Product Name (Required) */}
                <div className="bz-form-group">
                  <label className="bz-form-label">
                    Product Name <span className="req">*</span>
                  </label>
                  <input
                    type="text"
                    className="bz-input"
                    placeholder="e.g. Lemon, Tomato, Red Chillies, Paddy, Mango"
                    required
                    value={requestFormData.productName}
                    onChange={(e) =>
                      setRequestFormData({ ...requestFormData, productName: e.target.value })
                    }
                  />
                </div>

                {/* Variety (Optional) */}
                <div className="bz-form-group">
                  <label className="bz-form-label">
                    Variety (Optional)
                  </label>
                  <input
                    type="text"
                    className="bz-input"
                    placeholder="e.g. Kagzi, BPT 5204, Alphonso, Guntur Sannam"
                    value={requestFormData.variety}
                    onChange={(e) =>
                      setRequestFormData({ ...requestFormData, variety: e.target.value })
                    }
                  />
                </div>

                {/* Required Quantity (Single Fixed Value, Required) */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 14 }}>
                  <div className="bz-form-group">
                    <label className="bz-form-label">
                      Required Quantity (Fixed) <span className="req">*</span>
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0.1"
                      className="bz-input"
                      placeholder="e.g. 5"
                      required
                      value={requestFormData.requiredQuantity}
                      onChange={(e) =>
                        setRequestFormData({ ...requestFormData, requiredQuantity: e.target.value })
                      }
                    />
                  </div>

                  <div className="bz-form-group">
                    <label className="bz-form-label">
                      Quantity Unit <span className="req">*</span>
                    </label>
                    <select
                      className="bz-select"
                      value={requestFormData.quantityUnit}
                      onChange={(e) =>
                        setRequestFormData({ ...requestFormData, quantityUnit: e.target.value })
                      }
                    >
                      {QUANTITY_UNITS.map((u) => (
                        <option key={u} value={u}>
                          {u}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Expected Price & Unit (Optional) */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 14 }}>
                  <div className="bz-form-group">
                    <label className="bz-form-label">
                      Expected Price (Optional)
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      className="bz-input"
                      placeholder="e.g. 45000"
                      value={requestFormData.expectedPrice}
                      onChange={(e) =>
                        setRequestFormData({ ...requestFormData, expectedPrice: e.target.value })
                      }
                    />
                  </div>

                  <div className="bz-form-group">
                    <label className="bz-form-label">Price Unit</label>
                    <select
                      className="bz-select"
                      value={requestFormData.priceUnit}
                      onChange={(e) =>
                        setRequestFormData({ ...requestFormData, priceUnit: e.target.value })
                      }
                    >
                      {PRICE_UNITS.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Delivery Location */}
                <div className="bz-form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label className="bz-form-label">
                      Delivery Location / Destination <span className="req">*</span>
                    </label>
                    <button
                      type="button"
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#2d6a4f',
                        fontSize: '12.5px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                      onClick={() => handleDetectLocation('buyer')}
                    >
                      <Compass size={14} /> Use Current Location
                    </button>
                  </div>
                  <input
                    type="text"
                    className="bz-input"
                    placeholder="Enter city, mandi, village, or warehouse address"
                    required
                    value={requestFormData.locationName}
                    onChange={(e) =>
                      setRequestFormData({ ...requestFormData, locationName: e.target.value })
                    }
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div className="bz-form-group">
                    <label className="bz-form-label">District</label>
                    <input
                      type="text"
                      className="bz-input"
                      placeholder="e.g. Rangareddy"
                      value={requestFormData.district}
                      onChange={(e) =>
                        setRequestFormData({ ...requestFormData, district: e.target.value })
                      }
                    />
                  </div>
                  <div className="bz-form-group">
                    <label className="bz-form-label">State</label>
                    <input
                      type="text"
                      className="bz-input"
                      placeholder="e.g. Telangana"
                      value={requestFormData.state}
                      onChange={(e) =>
                        setRequestFormData({ ...requestFormData, state: e.target.value })
                      }
                    />
                  </div>
                </div>

                {/* Contact Phone Number */}
                <div className="bz-form-group">
                  <label className="bz-form-label">
                    Contact Phone Number <span className="req">*</span>
                  </label>
                  <input
                    type="tel"
                    className="bz-input"
                    placeholder="10-digit mobile number"
                    required
                    value={requestFormData.phoneNumber}
                    onChange={(e) =>
                      setRequestFormData({ ...requestFormData, phoneNumber: e.target.value })
                    }
                  />
                  <span style={{ fontSize: '11.5px', color: '#64748b' }}>
                    Your contact is strictly kept confidential with Kissan Mithar and never shared publicly.
                  </span>
                </div>

                {/* Reference Photos */}
                <div className="bz-form-group">
                  <label className="bz-form-label">Reference Photos (Optional)</label>
                  <div className="bz-photo-upload-grid">
                    {requestFormData.photos.map((p, idx) => (
                      <div key={idx} className="bz-photo-preview-item">
                        <img src={p} alt={`Produce reference ${idx + 1}`} />
                        <button
                          type="button"
                          className="bz-photo-remove-btn"
                          onClick={() => {
                            setRequestFormData({
                              ...requestFormData,
                              photos: requestFormData.photos.filter((_, i) => i !== idx),
                            });
                          }}
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                    {requestFormData.photos.length < 4 && (
                      <label className="bz-upload-trigger-box">
                        <Upload size={18} />
                        <span>Add Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={(e) => handleUploadPhoto(e, 'buyer')}
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>

              <div className="bz-modal-footer">
                <button
                  type="button"
                  className="bz-btn-pill bz-btn-ghost"
                  onClick={() => setIsRequestModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bz-btn-pill bz-btn-primary"
                  disabled={submittingRequest}
                >
                  {submittingRequest ? 'Submitting Request...' : 'Submit Sourcing Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================================
          REQUEST CONFIRMATION MODAL
          ==================================================================== */}
      {requestConfirmedData && (
        <div className="bz-modal-backdrop" onClick={() => setRequestConfirmedData(null)}>
          <div className="bz-modal-box" style={{ maxWidth: 540 }} onClick={(e) => e.stopPropagation()}>
            <div className="bz-modal-header" style={{ borderBottom: 'none', paddingBottom: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    background: '#d8f3dc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#2d6a4f',
                  }}
                >
                  <CheckCircle2 size={24} />
                </div>
                <div className="bz-modal-title">Request Received</div>
              </div>
              <button className="bz-modal-close-btn" onClick={() => setRequestConfirmedData(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="bz-modal-body" style={{ paddingTop: 16 }}>
              <p style={{ fontSize: '15px', color: '#475569', lineHeight: 1.5 }}>
                Your product request for{' '}
                <strong style={{ color: '#1b4332' }}>
                  {requestConfirmedData.requiredQuantity} {requestConfirmedData.quantityUnit} of {requestConfirmedData.productName}
                </strong>{' '}
                has been submitted to Kissan Mithar Agri Bazaar.
              </p>

              <div
                style={{
                  background: '#f8fafc',
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: '#64748b' }}>Request ID:</span>
                  <span style={{ fontWeight: 700, fontFamily: 'monospace' }}>
                    {requestConfirmedData.id.slice(0, 13)}...
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: '#64748b' }}>Status:</span>
                  {renderStatusBadge(requestConfirmedData.status)}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: '#64748b' }}>Delivery Location:</span>
                  <span style={{ fontWeight: 600 }}>{requestConfirmedData.locationName || 'Specified'}</span>
                </div>
              </div>

              <div style={{ fontSize: '13.5px', color: '#334155' }}>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>Next Steps:</div>
                <ol style={{ paddingLeft: 20, margin: 0, lineHeight: 1.6 }}>
                  <li>Our sourcing team matches suitable growers and suppliers.</li>
                  <li>Agronomists verify availability, quality, and quantity.</li>
                  <li>We coordinate final commercial confirmation and dispatch.</li>
                </ol>
              </div>
            </div>

            <div className="bz-modal-footer">
              <button
                className="bz-btn-pill bz-btn-primary"
                style={{ width: '100%' }}
                onClick={() => {
                  setRequestConfirmedData(null);
                  setCurrentView('my-requests');
                }}
              >
                Track Request Status
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          SELLER SUPPLIER REGISTRATION MODAL
          ==================================================================== */}
      {isSellerModalOpen && (
        <div className="bz-modal-backdrop" onClick={() => setIsSellerModalOpen(false)}>
          <div className="bz-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="bz-modal-header">
              <div className="bz-modal-title">
                {sellerFormData.id ? 'Edit Supplier Product' : 'Register as an Agricultural Supplier'}
              </div>
              <button className="bz-modal-close-btn" onClick={() => setIsSellerModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitSellerListing}>
              <div className="bz-modal-body">
                <div
                  style={{
                    background: '#fbfaf6',
                    border: '1px solid #e9d8a6',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    fontSize: '13px',
                    color: '#6b4c35',
                  }}
                >
                  Register the produce you have available. When buyers submit matching requests, Kissan Mithar will contact you directly to verify and procure. No buyer-seller chat or spam calls.
                </div>

                {/* Product Name (Optional text) */}
                <div className="bz-form-group">
                  <label className="bz-form-label">Product Name</label>
                  <input
                    type="text"
                    className="bz-input"
                    placeholder="e.g. Lemon, Tomato, Pomegranate, Onion, Paddy"
                    value={sellerFormData.productName}
                    onChange={(e) =>
                      setSellerFormData({ ...sellerFormData, productName: e.target.value })
                    }
                  />
                </div>

                {/* Variety (Optional text) */}
                <div className="bz-form-group">
                  <label className="bz-form-label">Variety (Optional)</label>
                  <input
                    type="text"
                    className="bz-input"
                    placeholder="e.g. Balaji, Bhagwa, Sona Masoori, Shahi"
                    value={sellerFormData.variety}
                    onChange={(e) =>
                      setSellerFormData({ ...sellerFormData, variety: e.target.value })
                    }
                  />
                </div>

                {/* Min & Max Available Quantity Range */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                  <div className="bz-form-group">
                    <label className="bz-form-label">Min Available Qty</label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      className="bz-input"
                      placeholder="e.g. 500"
                      value={sellerFormData.minQuantity}
                      onChange={(e) =>
                        setSellerFormData({ ...sellerFormData, minQuantity: e.target.value })
                      }
                    />
                  </div>

                  <div className="bz-form-group">
                    <label className="bz-form-label">Max Available Qty</label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      className="bz-input"
                      placeholder="e.g. 2000"
                      value={sellerFormData.maxQuantity}
                      onChange={(e) =>
                        setSellerFormData({ ...sellerFormData, maxQuantity: e.target.value })
                      }
                    />
                  </div>

                  <div className="bz-form-group">
                    <label className="bz-form-label">Quantity Unit</label>
                    <select
                      className="bz-select"
                      value={sellerFormData.quantityUnit}
                      onChange={(e) =>
                        setSellerFormData({ ...sellerFormData, quantityUnit: e.target.value })
                      }
                    >
                      {QUANTITY_UNITS.map((u) => (
                        <option key={u} value={u}>
                          {u}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Price & Unit (Optional) */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 14 }}>
                  <div className="bz-form-group">
                    <label className="bz-form-label">Expected Price (Optional)</label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      className="bz-input"
                      placeholder="e.g. 35"
                      value={sellerFormData.price}
                      onChange={(e) =>
                        setSellerFormData({ ...sellerFormData, price: e.target.value })
                      }
                    />
                  </div>

                  <div className="bz-form-group">
                    <label className="bz-form-label">Price Unit</label>
                    <select
                      className="bz-select"
                      value={sellerFormData.priceUnit}
                      onChange={(e) =>
                        setSellerFormData({ ...sellerFormData, priceUnit: e.target.value })
                      }
                    >
                      {PRICE_UNITS.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Location */}
                <div className="bz-form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label className="bz-form-label">Farm / Warehouse Location</label>
                    <button
                      type="button"
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#2d6a4f',
                        fontSize: '12.5px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                      onClick={() => handleDetectLocation('seller')}
                    >
                      <Compass size={14} /> Detect Current Location
                    </button>
                  </div>
                  <input
                    type="text"
                    className="bz-input"
                    placeholder="Enter village, mandal, district or address"
                    value={sellerFormData.locationName}
                    onChange={(e) =>
                      setSellerFormData({ ...sellerFormData, locationName: e.target.value })
                    }
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div className="bz-form-group">
                    <label className="bz-form-label">District</label>
                    <input
                      type="text"
                      className="bz-input"
                      placeholder="e.g. Nalgonda"
                      value={sellerFormData.district}
                      onChange={(e) =>
                        setSellerFormData({ ...sellerFormData, district: e.target.value })
                      }
                    />
                  </div>
                  <div className="bz-form-group">
                    <label className="bz-form-label">State</label>
                    <input
                      type="text"
                      className="bz-input"
                      placeholder="e.g. Telangana"
                      value={sellerFormData.state}
                      onChange={(e) =>
                        setSellerFormData({ ...sellerFormData, state: e.target.value })
                      }
                    />
                  </div>
                </div>

                {/* Contact Phone */}
                <div className="bz-form-group">
                  <label className="bz-form-label">
                    Contact Phone Number <span className="req">*</span>
                  </label>
                  <input
                    type="tel"
                    className="bz-input"
                    placeholder="10-digit mobile number"
                    required
                    value={sellerFormData.phoneNumber}
                    onChange={(e) =>
                      setSellerFormData({ ...sellerFormData, phoneNumber: e.target.value })
                    }
                  />
                  <span style={{ fontSize: '11.5px', color: '#64748b' }}>
                    Strictly confidential. Only Kissan Mithar internal sourcing staff will contact you.
                  </span>
                </div>

                {/* Product Photos */}
                <div className="bz-form-group">
                  <label className="bz-form-label">Product / Harvest Photos</label>
                  <div className="bz-photo-upload-grid">
                    {sellerFormData.photos.map((p, idx) => (
                      <div key={idx} className="bz-photo-preview-item">
                        <img src={p} alt={`Product ${idx + 1}`} />
                        <button
                          type="button"
                          className="bz-photo-remove-btn"
                          onClick={() => {
                            setSellerFormData({
                              ...sellerFormData,
                              photos: sellerFormData.photos.filter((_, i) => i !== idx),
                            });
                          }}
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                    {sellerFormData.photos.length < 4 && (
                      <label className="bz-upload-trigger-box">
                        <Upload size={18} />
                        <span>Add Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={(e) => handleUploadPhoto(e, 'seller')}
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>

              <div className="bz-modal-footer">
                <button
                  type="button"
                  className="bz-btn-pill bz-btn-ghost"
                  onClick={() => setIsSellerModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bz-btn-pill bz-btn-primary"
                  disabled={submittingSeller}
                >
                  {submittingSeller ? 'Saving...' : sellerFormData.id ? 'Update Listing' : 'Register Produce'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================================
          PRODUCT DETAILS MODAL
          ==================================================================== */}
      {selectedListingDetail && (
        <div className="bz-modal-backdrop" onClick={() => setSelectedListingDetail(null)}>
          <div className="bz-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="bz-modal-header">
              <div className="bz-modal-title">
                {selectedListingDetail.productName || 'Agricultural Produce'}
              </div>
              <button className="bz-modal-close-btn" onClick={() => setSelectedListingDetail(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="bz-modal-body">
              {/* Media gallery */}
              <div
                style={{
                  height: 260,
                  borderRadius: 14,
                  overflow: 'hidden',
                  background: '#f5f2eb',
                  position: 'relative',
                }}
              >
                <img
                  src={
                    selectedListingDetail.photos && selectedListingDetail.photos[0]
                      ? selectedListingDetail.photos[0]
                      : '/assets/services/crop-connect.png'
                  }
                  alt={selectedListingDetail.productName}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <span className="bz-product-badge">
                  {selectedListingDetail.status || 'Available'}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#1b4332', margin: 0 }}>
                    {selectedListingDetail.productName || 'Agricultural Produce'}
                  </h3>
                  {selectedListingDetail.variety && (
                    <div style={{ fontSize: '15px', color: '#b07d62', fontWeight: 600, marginTop: 4 }}>
                      Variety: {selectedListingDetail.variety}
                    </div>
                  )}
                </div>

                <div style={{ textAlign: 'right' }}>
                  {selectedListingDetail.price ? (
                    <div>
                      <div className="bz-price-val">
                        ₹ {selectedListingDetail.price.toLocaleString()}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>
                        {selectedListingDetail.priceUnit || 'per unit'}
                      </div>
                    </div>
                  ) : (
                    <div className="bz-price-unspec">Price to be confirmed upon inquiry</div>
                  )}
                </div>
              </div>

              {/* Specifications table */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 12,
                  background: '#f8fafc',
                  padding: 16,
                  borderRadius: 12,
                  border: '1px solid #e2e8f0',
                }}
              >
                <div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>Available Volume</div>
                  <div style={{ fontSize: '14.5px', fontWeight: 700, color: '#1e293b', marginTop: 2 }}>
                    {selectedListingDetail.minQuantity !== undefined || selectedListingDetail.maxQuantity !== undefined
                      ? `${selectedListingDetail.minQuantity || 0} - ${selectedListingDetail.maxQuantity || 'Any'} ${selectedListingDetail.quantityUnit || ''}`
                      : 'Volume to be verified'}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>Sourcing Location</div>
                  <div style={{ fontSize: '14.5px', fontWeight: 700, color: '#1e293b', marginTop: 2 }}>
                    {[selectedListingDetail.district, selectedListingDetail.state].filter(Boolean).join(', ') ||
                      selectedListingDetail.locationName ||
                      'India'}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>Supplier Status</div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#2d6a4f', marginTop: 2 }}>
                    Verified Kissan Mithar Network
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>Quality Verification</div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#2d6a4f', marginTop: 2 }}>
                    On-Site Farm Gate Inspection
                  </div>
                </div>
              </div>

              {/* Privacy Notice */}
              <div
                style={{
                  background: '#f0fdf4',
                  padding: '12px 16px',
                  borderRadius: 8,
                  border: '1px solid #bbf7d0',
                  fontSize: '12.5px',
                  color: '#166534',
                }}
              >
                <strong>Managed Sourcing Policy:</strong> To protect buyers from quality inconsistencies and prevent middlemen inflation, Kissan Mithar manages procurement, quality verification, and transportation directly. Direct supplier phone numbers are kept private.
              </div>
            </div>

            <div className="bz-modal-footer">
              <button
                type="button"
                className="bz-btn-pill bz-btn-ghost"
                onClick={() => setSelectedListingDetail(null)}
              >
                Close
              </button>
              <button
                type="button"
                className="bz-btn-pill bz-btn-primary"
                onClick={() => {
                  setRequestFormData((prev) => ({
                    ...prev,
                    productName: selectedListingDetail.productName || '',
                    variety: selectedListingDetail.variety || '',
                    quantityUnit: selectedListingDetail.quantityUnit || 'tonne',
                    expectedPrice: selectedListingDetail.price ? String(selectedListingDetail.price) : '',
                    priceUnit: selectedListingDetail.priceUnit || '₹ / tonne',
                  }));
                  setSelectedListingDetail(null);
                  setIsRequestModalOpen(true);
                }}
              >
                Request Kissan Mithar to Source This
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          PHONE IDENTITY MODAL
          ==================================================================== */}
      {isAuthModalOpen && (
        <div className="bz-modal-backdrop" onClick={() => setIsAuthModalOpen(false)}>
          <div className="bz-modal-box" style={{ maxWidth: 440 }} onClick={(e) => e.stopPropagation()}>
            <div className="bz-modal-header">
              <div className="bz-modal-title">Track Orders & Listings</div>
              <button className="bz-modal-close-btn" onClick={() => setIsAuthModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSavePhoneIdentity}>
              <div className="bz-modal-body">
                <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
                  Enter your mobile number to view and track your submitted product requests or supplier produce registrations.
                </p>

                <div className="bz-form-group">
                  <label className="bz-form-label">
                    Mobile Number <span className="req">*</span>
                  </label>
                  <input
                    type="tel"
                    className="bz-input"
                    placeholder="10-digit mobile number"
                    required
                    value={authPhoneInput}
                    onChange={(e) => setAuthPhoneInput(e.target.value)}
                  />
                </div>

                <div className="bz-form-group">
                  <label className="bz-form-label">Your Name (Optional)</label>
                  <input
                    type="text"
                    className="bz-input"
                    placeholder="e.g. Ramesh Kumar"
                    value={authNameInput}
                    onChange={(e) => setAuthNameInput(e.target.value)}
                  />
                </div>
              </div>

              <div className="bz-modal-footer">
                <button
                  type="button"
                  className="bz-btn-pill bz-btn-ghost"
                  onClick={() => setIsAuthModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="bz-btn-pill bz-btn-primary">
                  Continue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mobile App Bottom Navigation Bar */}
      <MobileBottomNav
        activeTab="bazaar"
        onNavigateHome={onNavigateHome}
        onNavigateBazaar={() => {
          setCurrentView('home');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onNavigateSection={(sectionId) => {
          if (sectionId === 'home') onNavigateHome();
          else if (sectionId === 'services') {
            window.location.href = '/#services';
          }
        }}
      />
    </div>
  );

  /* ========================================================================
     VIEW: HOMEPAGE
     ======================================================================== */
  function renderHomePageView() {
    return (
      <main>
        {/* 2.B HERO SECTION */}
        <section className="bz-hero-section">
          <div className="bz-hero-container">
            <div className="bz-hero-content">
              <div className="bz-pill-badge">
                <Sparkles size={14} />
                <span>Agricultural Products Sourcing & Supply</span>
              </div>

              <h1 className="bz-hero-headline">
                Your Agricultural Needs, Sourced and Delivered.
              </h1>

              <p className="bz-hero-subtext">
                From fresh fruits and vegetables to paddy, spices, nursery plants, and bulk agricultural produce, Agri Bazaar helps you source the products you need through Kissan Mithar.
              </p>

              <div className="bz-hero-ctas">
                <button
                  className="bz-btn-pill bz-btn-primary"
                  onClick={() => setIsRequestModalOpen(true)}
                >
                  <Package size={16} />
                  <span>Request a Product</span>
                </button>

                <button
                  className="bz-btn-pill bz-btn-outline"
                  onClick={() => setIsSellerModalOpen(true)}
                >
                  <ShoppingBag size={16} />
                  <span>Register as a Supplier</span>
                </button>
              </div>

              <div className="bz-trust-strip">
                <ShieldCheck size={18} />
                <span>Managed sourcing. Supplier verification. Coordinated delivery.</span>
              </div>
            </div>

            <div className="bz-hero-visual">
              <div className="bz-hero-card-frame">
                <img
                  src="/assets/services/crop-connect.png"
                  alt="Agricultural Sourcing & Supply"
                  className="bz-hero-img-main"
                />
                <div className="bz-hero-badge-overlay">
                  <div>
                    <div className="bz-overlay-label">Managed Supply Desk</div>
                    <div className="bz-overlay-value">Farm Gate Quality Verified</div>
                  </div>
                  <span className="bz-badge bz-badge-sourcing">100% Coordinated</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2.C QUICK PRODUCT REQUEST PANEL */}
        <section className="bz-quick-request-section">
          <div className="bz-quick-request-card">
            <div className="bz-quick-header">
              <div>
                <div className="bz-quick-title">
                  <Package size={20} color="#2d6a4f" />
                  <span>Quick Product Sourcing Request</span>
                </div>
                <div className="bz-quick-subtitle">
                  Tell us what you need and our procurement team coordinates suitable options.
                </div>
              </div>
              <span className="bz-badge bz-badge-review">No middleman fees</span>
            </div>

            <form onSubmit={handleContinueQuickRequest} className="bz-quick-form-grid">
              <div className="bz-form-group">
                <label className="bz-form-label">
                  Product Name <span className="req">*</span>
                </label>
                <input
                  type="text"
                  className="bz-input"
                  placeholder="e.g. Lemon, Paddy, Mango"
                  required
                  value={quickForm.productName}
                  onChange={(e) => setQuickForm({ ...quickForm, productName: e.target.value })}
                />
              </div>

              <div className="bz-form-group">
                <label className="bz-form-label">
                  Required Qty <span className="req">*</span>
                </label>
                <input
                  type="number"
                  step="any"
                  min="0.1"
                  className="bz-input"
                  placeholder="e.g. 5"
                  required
                  value={quickForm.requiredQuantity}
                  onChange={(e) =>
                    setQuickForm({ ...quickForm, requiredQuantity: e.target.value })
                  }
                />
              </div>

              <div className="bz-form-group">
                <label className="bz-form-label">Unit</label>
                <select
                  className="bz-select"
                  value={quickForm.quantityUnit}
                  onChange={(e) =>
                    setQuickForm({ ...quickForm, quantityUnit: e.target.value })
                  }
                >
                  {QUANTITY_UNITS.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>

              <div className="bz-form-group bz-loc-group">
                <label className="bz-form-label">Delivery Location</label>
                <input
                  type="text"
                  className="bz-input"
                  placeholder="City or district"
                  value={quickForm.deliveryLocation}
                  onChange={(e) =>
                    setQuickForm({ ...quickForm, deliveryLocation: e.target.value })
                  }
                />
                <button
                  type="button"
                  className="bz-loc-btn"
                  onClick={() => handleDetectLocation('quick')}
                  title="Detect Current GPS Location"
                >
                  <Compass size={16} />
                </button>
              </div>

              <div className="bz-form-group">
                <label className="bz-form-label">Expected Price</label>
                <input
                  type="number"
                  step="any"
                  className="bz-input"
                  placeholder="Optional"
                  value={quickForm.expectedPrice}
                  onChange={(e) =>
                    setQuickForm({ ...quickForm, expectedPrice: e.target.value })
                  }
                />
              </div>

              <div>
                <button
                  type="submit"
                  className="bz-btn-pill bz-btn-primary"
                  style={{ width: '100%', height: 46 }}
                >
                  <span>Continue Request</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* 2.D BROWSE AGRICULTURAL PRODUCTS (FEATURED DISCOVERY) */}
        <section className="bz-section">
          <div className="bz-section-header">
            <div className="bz-section-title-wrap">
              <div className="bz-pill-badge">Registered Produce</div>
              <h2 className="bz-section-title">Browse Available Agricultural Products</h2>
              <p className="bz-section-desc">
                Discover active harvests and nursery stocks registered by verified growers in the Kissan Mithar network.
              </p>
            </div>

            <button
              className="bz-btn-pill bz-btn-outline"
              onClick={() => setCurrentView('browse')}
            >
              <span>View All Products</span>
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Product Cards Grid */}
          {loadingListings ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
              Loading products from verified suppliers...
            </div>
          ) : listings.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '60px 20px',
                background: '#ffffff',
                borderRadius: 16,
                border: '1px solid #e2e8f0',
              }}
            >
              <Package size={36} color="#64748b" style={{ margin: '0 auto 12px' }} />
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#1b4332' }}>
                No product listings available right now
              </div>
              <p style={{ color: '#64748b', fontSize: '14px', maxWidth: 460, margin: '8px auto 20px' }}>
                You can still submit a custom sourcing request! Our procurement team will source it from our grower network.
              </p>
              <button
                className="bz-btn-pill bz-btn-primary"
                onClick={() => setIsRequestModalOpen(true)}
              >
                Submit Custom Sourcing Request
              </button>
            </div>
          ) : (
            <div className="bz-product-grid">
              {listings.slice(0, 8).map((listing) => (
                <div key={listing.id} className="bz-product-card">
                  <div className="bz-product-card-media">
                    <img
                      src={
                        listing.photos && listing.photos[0]
                          ? listing.photos[0]
                          : '/assets/services/crop-connect.png'
                      }
                      alt={listing.productName || 'Agricultural Produce'}
                      className="bz-product-card-img"
                    />
                    <span className="bz-product-badge">
                      {listing.status || 'Available'}
                    </span>
                  </div>

                  <div className="bz-product-card-body">
                    <div className="bz-product-title-row">
                      <div className="bz-product-title">
                        {listing.productName || 'Agricultural Produce'}
                      </div>
                    </div>

                    {listing.variety && (
                      <div className="bz-product-variety">{listing.variety}</div>
                    )}

                    <div className="bz-product-meta-item">
                      <Package size={15} />
                      <span>
                        {listing.minQuantity !== undefined || listing.maxQuantity !== undefined
                          ? `${listing.minQuantity || 0} - ${listing.maxQuantity || 'Any'} ${listing.quantityUnit || ''}`
                          : 'Availability to be confirmed'}
                      </span>
                    </div>

                    <div className="bz-product-meta-item">
                      <MapPin size={15} />
                      <span>
                        {[listing.district, listing.state].filter(Boolean).join(', ') ||
                          listing.locationName ||
                          'Verified Supplier Location'}
                      </span>
                    </div>

                    <div className="bz-product-price-row">
                      <div>
                        {listing.price ? (
                          <div className="bz-price-val">
                            ₹ {listing.price.toLocaleString()}{' '}
                            <span style={{ fontSize: '12px', fontWeight: 500, color: '#64748b' }}>
                              {listing.priceUnit}
                            </span>
                          </div>
                        ) : (
                          <div className="bz-price-unspec">Price not specified</div>
                        )}
                      </div>

                      <button
                        className="bz-btn-pill bz-btn-outline"
                        style={{ padding: '6px 14px', fontSize: '13px' }}
                        onClick={() => setSelectedListingDetail(listing)}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 2.E HOW AGRI BAZAAR WORKS */}
        <section className="bz-section" style={{ background: '#fbfaf6', borderRadius: 24 }}>
          <div className="bz-section-header">
            <div className="bz-section-title-wrap">
              <div className="bz-pill-badge">Managed Operating Model</div>
              <h2 className="bz-section-title">How Agri Bazaar Works</h2>
              <p className="bz-section-desc">
                We handle the complete sourcing lifecycle so buyers get verified quality and growers receive fair value without middlemen uncertainty.
              </p>
            </div>
          </div>

          <div className="bz-how-it-works-grid">
            <div className="bz-step-card">
              <span className="bz-step-number">STEP 01</span>
              <div className="bz-step-icon-wrap">
                <Package size={22} />
              </div>
              <div className="bz-step-heading">Tell Us What You Need</div>
              <div className="bz-step-text">
                Buyers submit a product request with the required quantity, product details, and delivery location.
              </div>
            </div>

            <div className="bz-step-card">
              <span className="bz-step-number">STEP 02</span>
              <div className="bz-step-icon-wrap">
                <Search size={22} />
              </div>
              <div className="bz-step-heading">We Find Suitable Suppliers</div>
              <div className="bz-step-text">
                The Kissan Mithar team searches registered supplier listings and contacts potential suppliers.
              </div>
            </div>

            <div className="bz-step-card">
              <span className="bz-step-number">STEP 03</span>
              <div className="bz-step-icon-wrap">
                <ShieldCheck size={22} />
              </div>
              <div className="bz-step-heading">We Verify the Details</div>
              <div className="bz-step-text">
                The team verifies availability, quantity, quality, and commercial terms at the farm gate.
              </div>
            </div>

            <div className="bz-step-card">
              <span className="bz-step-number">STEP 04</span>
              <div className="bz-step-icon-wrap">
                <Truck size={22} />
              </div>
              <div className="bz-step-heading">We Coordinate Supply</div>
              <div className="bz-step-text">
                Kissan Mithar coordinates procurement and delivery according to the confirmed agreement.
              </div>
            </div>
          </div>
        </section>

        {/* 2.F WHY CHOOSE AGRI BAZAAR? */}
        <section className="bz-section">
          <div className="bz-section-header">
            <div className="bz-section-title-wrap">
              <div className="bz-pill-badge">Service Advantages</div>
              <h2 className="bz-section-title">Why Choose Agri Bazaar?</h2>
              <p className="bz-section-desc">
                Unlike open classifieds or unverified directories, our model provides human-supervised agricultural trade.
              </p>
            </div>
          </div>

          <div className="bz-why-grid">
            <div className="bz-why-card">
              <div className="bz-why-icon">
                <ShieldCheck size={22} />
              </div>
              <div className="bz-why-title">Managed Sourcing</div>
              <div className="bz-why-text">
                Direct coordination through Kissan Mithar's internal desk eliminates fraudulent listings and unconfirmed availability.
              </div>
            </div>

            <div className="bz-why-card">
              <div className="bz-why-icon">
                <Layers size={22} />
              </div>
              <div className="bz-why-title">Registered Supplier Network</div>
              <div className="bz-why-text">
                Direct access to authentic farmers, orchard owners, and agricultural producers across Telangana and Andhra Pradesh.
              </div>
            </div>

            <div className="bz-why-card">
              <div className="bz-why-icon">
                <Package size={22} />
              </div>
              <div className="bz-why-title">Bulk & Custom Volume</div>
              <div className="bz-why-text">
                Submit specific volume requirements from a few quintals to multi-tonne freight requirements.
              </div>
            </div>

            <div className="bz-why-card">
              <div className="bz-why-icon">
                <Sparkles size={22} />
              </div>
              <div className="bz-why-title">Variety & Spec Matching</div>
              <div className="bz-why-text">
                Specify exact crop varieties, maturity grades, packaging specifications, and harvest timelines.
              </div>
            </div>

            <div className="bz-why-card">
              <div className="bz-why-icon">
                <MapPin size={22} />
              </div>
              <div className="bz-why-title">Location-Aware Sourcing</div>
              <div className="bz-why-text">
                Optimized matching based on geographical proximity to minimize freight transit time and transport costs.
              </div>
            </div>

            <div className="bz-why-card">
              <div className="bz-why-icon">
                <User size={22} />
              </div>
              <div className="bz-why-title">Human Coordination</div>
              <div className="bz-why-text">
                Agricultural field coordinators physically inspect produce, verify moisture and size grades, and oversee dispatch.
              </div>
            </div>
          </div>
        </section>

        {/* 2.G BULK AND BUSINESS SOURCING */}
        <section className="bz-section" style={{ paddingTop: 0 }}>
          <div className="bz-bulk-box">
            <div>
              <div className="bz-pill-badge" style={{ background: 'rgba(255,255,255,0.15)', color: '#ffffff', borderColor: 'rgba(255,255,255,0.3)' }}>
                Commercial Sourcing
              </div>
              <h2 className="bz-bulk-title" style={{ marginTop: 14 }}>
                Need Agricultural Products in Bulk?
              </h2>
              <p className="bz-bulk-text">
                Share your product specifications, required quantity, and delivery location. Our team will review your requirements and coordinate suitable sourcing options.
              </p>

              <div className="bz-bulk-audiences">
                <span className="bz-bulk-tag">Wholesalers & Traders</span>
                <span className="bz-bulk-tag">Retail Chains</span>
                <span className="bz-bulk-tag">Food Processors</span>
                <span className="bz-bulk-tag">Hotels & Commercial Kitchens</span>
                <span className="bz-bulk-tag">Distributors & Exporters</span>
                <span className="bz-bulk-tag">Nursery Plantations</span>
              </div>
            </div>

            <div className="bz-bulk-action-wrap">
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff' }}>
                Dedicated Sourcing Desk
              </div>
              <div style={{ fontSize: '13.5px', color: '#cbd5e1', lineHeight: 1.5 }}>
                Custom quotes, staggered fulfillment schedules, and single-point billing managed by Kissan Mithar.
              </div>
              <button
                className="bz-btn-pill bz-btn-primary"
                style={{ background: '#52b788', color: '#0f2419', borderColor: '#52b788', width: '100%' }}
                onClick={() => setIsRequestModalOpen(true)}
              >
                <span>Submit a Bulk Request</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </section>

        {/* 2.H SUPPLIER REGISTRATION SECTION */}
        <section className="bz-section">
          <div className="bz-supplier-invite">
            <div>
              <div className="bz-pill-badge">Grower Partnership</div>
              <h2 className="bz-section-title" style={{ marginTop: 12 }}>
                Supply Through Agri Bazaar
              </h2>
              <p className="bz-section-desc">
                Register the agricultural products you grow or supply so the Kissan Mithar team can consider them for relevant sourcing requests.
              </p>

              <div className="bz-supplier-list">
                <div className="bz-supplier-item">
                  <CheckCircle2 size={18} />
                  <span>Register your crops, fruits, and nursery produce</span>
                </div>
                <div className="bz-supplier-item">
                  <CheckCircle2 size={18} />
                  <span>Maintain your available quantity range</span>
                </div>
                <div className="bz-supplier-item">
                  <CheckCircle2 size={18} />
                  <span>Update your prices and location anytime</span>
                </div>
                <div className="bz-supplier-item">
                  <CheckCircle2 size={18} />
                  <span>Receive sourcing enquiries through managed workflow</span>
                </div>
              </div>

              <button
                className="bz-btn-pill bz-btn-primary"
                onClick={() => setIsSellerModalOpen(true)}
              >
                <ShoppingBag size={15} />
                <span>Register as a Supplier</span>
              </button>
            </div>

            <div style={{ borderRadius: 20, overflow: 'hidden', boxShadow: '0 12px 30px rgba(0,0,0,0.1)' }}>
              <img
                src="/assets/From Seed to Sale_ Farming Journey.png"
                alt="Farmer Harvest Sourcing"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            </div>
          </div>
        </section>

        {/* 2.I TRUST AND SERVICE PROCESS */}
        <section className="bz-section" style={{ background: '#ffffff', borderRadius: 24, border: '1px solid #e2e8f0' }}>
          <div className="bz-section-header">
            <div className="bz-section-title-wrap">
              <div className="bz-pill-badge">Trust & Quality Assurance</div>
              <h2 className="bz-section-title">Transparent Verification & Fair Trade</h2>
              <p className="bz-section-desc">
                We bridge the gap between farm gates and bulk consumers with scientific verification and accountability.
              </p>
            </div>
          </div>

          <div className="bz-why-grid">
            <div className="bz-why-card" style={{ background: '#fbfaf6' }}>
              <div className="bz-why-title">Physical Farm Inspection</div>
              <div className="bz-why-text">
                Before procurement agreements are finalized, Kissan Mithar agronomists inspect the crop on-site to verify condition, maturity, and pesticide safety.
              </div>
            </div>

            <div className="bz-why-card" style={{ background: '#fbfaf6' }}>
              <div className="bz-why-title">Certified Weighment</div>
              <div className="bz-why-text">
                Weighing and grading are conducted transparently at certified weighbridges or electronic scales with digital receipts for growers and buyers.
              </div>
            </div>

            <div className="bz-why-card" style={{ background: '#fbfaf6' }}>
              <div className="bz-why-title">Strict Privacy Guarantee</div>
              <div className="bz-why-text">
                Grower and buyer personal contact numbers are strictly guarded against marketing exploitation, cold calls, and predatory intermediaries.
              </div>
            </div>
          </div>
        </section>

        {/* 2.J FAQ SECTION */}
        <section className="bz-section">
          <div className="bz-section-header">
            <div className="bz-section-title-wrap">
              <div className="bz-pill-badge">Common Questions</div>
              <h2 className="bz-section-title">Frequently Asked Questions</h2>
              <p className="bz-section-desc">
                Everything you need to know about Agri Bazaar's managed agricultural sourcing service.
              </p>
            </div>
          </div>

          <div className="bz-faq-grid">
            <div className="bz-faq-item">
              <div className="bz-faq-question">
                <HelpCircle size={18} color="#2d6a4f" />
                <span>What is Agri Bazaar?</span>
              </div>
              <div className="bz-faq-answer">
                Agri Bazaar is a managed agricultural product sourcing and supply service operated by Kissan Mithar. We identify suitable sellers, verify quantity and quality, coordinate fair pricing, and manage end-to-end delivery.
              </div>
            </div>

            <div className="bz-faq-item">
              <div className="bz-faq-question">
                <HelpCircle size={18} color="#2d6a4f" />
                <span>How can I request a product?</span>
              </div>
              <div className="bz-faq-answer">
                Click "Request a Product", enter the product name, required fixed quantity, quantity unit, and delivery location. Our team reviews your request and coordinates suitable suppliers.
              </div>
            </div>

            <div className="bz-faq-item">
              <div className="bz-faq-question">
                <HelpCircle size={18} color="#2d6a4f" />
                <span>Can I request products in bulk?</span>
              </div>
              <div className="bz-faq-answer">
                Yes. Agri Bazaar is specifically optimized for bulk and commercial requirements, catering to wholesalers, food processors, retail chains, and institutions.
              </div>
            </div>

            <div className="bz-faq-item">
              <div className="bz-faq-question">
                <HelpCircle size={18} color="#2d6a4f" />
                <span>Can I request a product that is not currently listed?</span>
              </div>
              <div className="bz-faq-answer">
                Yes! You can request any agricultural produce, spice, grain, fruit, vegetable, or nursery plant. Our sourcing team taps our extensive grower network across rural regions to source it for you.
              </div>
            </div>

            <div className="bz-faq-item">
              <div className="bz-faq-question">
                <HelpCircle size={18} color="#2d6a4f" />
                <span>How can I register as a supplier?</span>
              </div>
              <div className="bz-faq-answer">
                Click "Register as a Supplier" and provide your available product name, variety, min-max quantity range, expected price, and farm location.
              </div>
            </div>

            <div className="bz-faq-item">
              <div className="bz-faq-question">
                <HelpCircle size={18} color="#2d6a4f" />
                <span>Can sellers update product quantities and prices?</span>
              </div>
              <div className="bz-faq-answer">
                Yes. Sellers can view and edit their registered produce under the "For Suppliers" tab to adjust available volumes, prices, or harvest status.
              </div>
            </div>

            <div className="bz-faq-item">
              <div className="bz-faq-question">
                <HelpCircle size={18} color="#2d6a4f" />
                <span>How does Kissan Mithar coordinate sourcing?</span>
              </div>
              <div className="bz-faq-answer">
                Our central desk evaluates supplier proximity, variety specs, and volume. Field coordinators inspect the crop at the farm gate, verify quantity, and organize transport logistics.
              </div>
            </div>

            <div className="bz-faq-item">
              <div className="bz-faq-question">
                <HelpCircle size={18} color="#2d6a4f" />
                <span>How can I track my requests?</span>
              </div>
              <div className="bz-faq-answer">
                You can track your requests under the "My Requests" tab with our live 9-stage status timeline, from initial submission through verification, procurement, and final delivery.
              </div>
            </div>

            <div className="bz-faq-item">
              <div className="bz-faq-question">
                <HelpCircle size={18} color="#2d6a4f" />
                <span>Are product availability and prices guaranteed?</span>
              </div>
              <div className="bz-faq-answer">
                Product availability is confirmed once our agronomists complete on-site verification. Prices are finalized transparently upon agreed commercial terms before dispatch.
              </div>
            </div>

            <div className="bz-faq-item">
              <div className="bz-faq-question">
                <HelpCircle size={18} color="#2d6a4f" />
                <span>How do I contact the Kissan Mithar team?</span>
              </div>
              <div className="bz-faq-answer">
                You can reach our Agri Bazaar coordination desk through the Contact page or via Kissan Mithar's support channels during standard operations hours.
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  /* ========================================================================
     VIEW: BROWSE CATALOG
     ======================================================================== */
  function renderBrowseCatalogView() {
    return (
      <main className="bz-section">
        <div className="bz-section-header">
          <div className="bz-section-title-wrap">
            <div className="bz-pill-badge">Agricultural Catalog</div>
            <h1 className="bz-section-title">Browse Available Products</h1>
            <p className="bz-section-desc">
              Search real agricultural produce listings registered by verified suppliers across the Kissan Mithar network.
            </p>
          </div>

          <button
            className="bz-btn-pill bz-btn-primary"
            onClick={() => setIsRequestModalOpen(true)}
          >
            <Package size={15} />
            <span>Request Specific Product</span>
          </button>
        </div>

        {/* Search & Location Filter Bar */}
        <div className="bz-search-filters-bar">
          <div className="bz-search-input-wrap">
            <Search size={18} className="bz-search-icon" />
            <input
              type="text"
              className="bz-search-input"
              placeholder="Search by product name, variety, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Filter size={16} color="#64748b" />
            <select
              className="bz-filter-select"
              value={selectedStateFilter}
              onChange={(e) => setSelectedStateFilter(e.target.value)}
            >
              <option value="">All States / Regions</option>
              {availableStates.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results */}
        {loadingListings ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#64748b' }}>
            Loading agricultural products...
          </div>
        ) : listings.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '60px 20px',
              background: '#ffffff',
              borderRadius: 16,
              border: '1px solid #e2e8f0',
            }}
          >
            <Package size={40} color="#64748b" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1b4332' }}>
              No products found matching your search
            </h3>
            <p style={{ color: '#64748b', fontSize: '14px', maxWidth: 440, margin: '8px auto 20px' }}>
              Don't worry! Submit your required product and quantity, and Kissan Mithar will source it directly.
            </p>
            <button
              className="bz-btn-pill bz-btn-primary"
              onClick={() => setIsRequestModalOpen(true)}
            >
              Request Kissan Mithar to Source This
            </button>
          </div>
        ) : (
          <div className="bz-product-grid">
            {listings.map((listing) => (
              <div key={listing.id} className="bz-product-card">
                <div className="bz-product-card-media">
                  <img
                    src={
                      listing.photos && listing.photos[0]
                        ? listing.photos[0]
                        : '/assets/services/crop-connect.png'
                    }
                    alt={listing.productName || 'Agricultural Produce'}
                    className="bz-product-card-img"
                  />
                  <span className="bz-product-badge">
                    {listing.status || 'Available'}
                  </span>
                </div>

                <div className="bz-product-card-body">
                  <div className="bz-product-title-row">
                    <div className="bz-product-title">
                      {listing.productName || 'Agricultural Produce'}
                    </div>
                  </div>

                  {listing.variety && (
                    <div className="bz-product-variety">{listing.variety}</div>
                  )}

                  <div className="bz-product-meta-item">
                    <Package size={15} />
                    <span>
                      {listing.minQuantity !== undefined || listing.maxQuantity !== undefined
                        ? `${listing.minQuantity || 0} - ${listing.maxQuantity || 'Any'} ${listing.quantityUnit || ''}`
                        : 'Availability to be confirmed'}
                    </span>
                  </div>

                  <div className="bz-product-meta-item">
                    <MapPin size={15} />
                    <span>
                      {[listing.district, listing.state].filter(Boolean).join(', ') ||
                        listing.locationName ||
                        'Verified Supplier Location'}
                    </span>
                  </div>

                  <div className="bz-product-price-row">
                    <div>
                      {listing.price ? (
                        <div className="bz-price-val">
                          ₹ {listing.price.toLocaleString()}{' '}
                          <span style={{ fontSize: '12px', fontWeight: 500, color: '#64748b' }}>
                            {listing.priceUnit}
                          </span>
                        </div>
                      ) : (
                        <div className="bz-price-unspec">Price not specified</div>
                      )}
                    </div>

                    <button
                      className="bz-btn-pill bz-btn-outline"
                      style={{ padding: '6px 14px', fontSize: '13px' }}
                      onClick={() => setSelectedListingDetail(listing)}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    );
  }

  /* ========================================================================
     VIEW: BUYER MY REQUESTS & TRACKING
     ======================================================================== */
  function renderMyRequestsView() {
    return (
      <main className="bz-section">
        <div className="bz-section-header">
          <div className="bz-section-title-wrap">
            <div className="bz-pill-badge">Buyer Operations</div>
            <h1 className="bz-section-title">My Product Requests & Tracking</h1>
            <p className="bz-section-desc">
              Track the live 9-stage status of your agricultural product sourcing requests managed by Kissan Mithar.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              className="bz-btn-pill bz-btn-outline"
              onClick={() => setIsAuthModalOpen(true)}
            >
              <Phone size={14} />
              <span>{userPhone ? `Phone: ${userPhone}` : 'Enter Phone Number'}</span>
            </button>
            <button
              className="bz-btn-pill bz-btn-primary"
              onClick={() => setIsRequestModalOpen(true)}
            >
              <Plus size={15} />
              <span>New Request</span>
            </button>
          </div>
        </div>

        {/* Selected Request Tracking Detail Drawer */}
        {selectedTrackingRequest && (
          <div className="bz-tracking-container" style={{ marginBottom: 36 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#1b4332', margin: 0 }}>
                    {selectedTrackingRequest.productName}
                  </h2>
                  {renderStatusBadge(selectedTrackingRequest.status)}
                </div>
                <div style={{ fontSize: '13px', color: '#64748b', marginTop: 4 }}>
                  Request ID: <span style={{ fontFamily: 'monospace' }}>{selectedTrackingRequest.id}</span> • Submitted on{' '}
                  {new Date(selectedTrackingRequest.createdAt).toLocaleDateString()}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                {(selectedTrackingRequest.status === 'SUBMITTED' || selectedTrackingRequest.status === 'UNDER_REVIEW') && (
                  <button
                    className="bz-btn-pill bz-btn-ghost"
                    style={{ color: '#b91c1c', borderColor: '#fca5a5' }}
                    onClick={() => handleCancelRequest(selectedTrackingRequest.id)}
                  >
                    Cancel Request
                  </button>
                )}
                <button
                  className="bz-btn-pill bz-btn-ghost"
                  onClick={() => setSelectedTrackingRequest(null)}
                >
                  Close Tracking
                </button>
              </div>
            </div>

            {/* Quick Metrics */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: 14,
                margin: '20px 0',
                background: '#f8fafc',
                padding: 16,
                borderRadius: 12,
                border: '1px solid #e2e8f0',
              }}
            >
              <div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>Required Quantity</div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b' }}>
                  {selectedTrackingRequest.requiredQuantity} {selectedTrackingRequest.quantityUnit}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>Delivery Destination</div>
                <div style={{ fontSize: '14.5px', fontWeight: 600, color: '#1e293b' }}>
                  {selectedTrackingRequest.locationName || 'Specified Destination'}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>Expected Budget</div>
                <div style={{ fontSize: '14.5px', fontWeight: 600, color: '#1e293b' }}>
                  {selectedTrackingRequest.expectedPrice
                    ? `₹ ${selectedTrackingRequest.expectedPrice.toLocaleString()} ${selectedTrackingRequest.priceUnit || ''}`
                    : 'Open Quote'}
                </div>
              </div>

              {selectedTrackingRequest.verifiedQuantity && (
                <div>
                  <div style={{ fontSize: '12px', color: '#15803d', fontWeight: 600 }}>Verified Lot Quantity</div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: '#15803d' }}>
                    {selectedTrackingRequest.verifiedQuantity} {selectedTrackingRequest.quantityUnit}
                  </div>
                </div>
              )}
            </div>

            {/* 9-Stage Status Stepper */}
            <div style={{ marginTop: 24 }}>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#1b4332', marginBottom: 12 }}>
                Sourcing Progress & Fulfilment Timeline
              </div>

              {selectedTrackingRequest.status === 'CANCELLED' ? (
                <div
                  style={{
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    padding: 16,
                    borderRadius: 10,
                    color: '#991b1b',
                    fontSize: '14px',
                  }}
                >
                  This request has been cancelled. If you still need this product, please submit a new request.
                </div>
              ) : (
                <div className="bz-stepper-timeline">
                  {REQUEST_STATUS_STAGES.map((st, index) => {
                    const currentIndex = REQUEST_STATUS_STAGES.findIndex(
                      (s) => s.key === selectedTrackingRequest.status
                    );
                    const isCompleted = index < currentIndex;
                    const isActive = index === currentIndex;

                    return (
                      <div
                        key={st.key}
                        className={`bz-step-item ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}
                      >
                        <div className="bz-step-indicator">
                          {isCompleted ? <CheckCircle2 size={18} /> : index + 1}
                        </div>
                        <div className="bz-step-details">
                          <div className="bz-step-title">{st.title}</div>
                          <div className="bz-step-desc">{st.desc}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* List of Requests */}
        {loadingMyRequests ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
            Loading your requests...
          </div>
        ) : myRequests.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '60px 20px',
              background: '#ffffff',
              borderRadius: 16,
              border: '1px solid #e2e8f0',
            }}
          >
            <Package size={36} color="#64748b" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1b4332' }}>
              No requests found for this phone number
            </h3>
            <p style={{ color: '#64748b', fontSize: '14px', maxWidth: 440, margin: '8px auto 20px' }}>
              {userPhone
                ? `No requests currently linked to ${userPhone}. Submit a new product request anytime.`
                : 'Enter your phone number to view previously submitted requests, or create a new request below.'}
            </p>
            <button
              className="bz-btn-pill bz-btn-primary"
              onClick={() => setIsRequestModalOpen(true)}
            >
              Request a Product
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {myRequests.map((req) => (
              <div
                key={req.id}
                style={{
                  background: '#ffffff',
                  borderRadius: 14,
                  padding: '20px 24px',
                  border: '1px solid #e2e8f0',
                  boxShadow: 'var(--bz-shadow-sm)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 16,
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1b4332', margin: 0 }}>
                      {req.productName}
                    </h3>
                    {req.variety && (
                      <span style={{ fontSize: '13px', color: '#b07d62', fontWeight: 600 }}>
                        ({req.variety})
                      </span>
                    )}
                    {renderStatusBadge(req.status)}
                  </div>
                  <div style={{ fontSize: '13.5px', color: '#475569', marginTop: 6 }}>
                    Required: <strong>{req.requiredQuantity} {req.quantityUnit}</strong> • Destination:{' '}
                    <strong>{req.locationName || 'Specified'}</strong>
                  </div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: 4 }}>
                    Submitted {new Date(req.createdAt).toLocaleDateString()} • ID: {req.id.slice(0, 8)}...
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <button
                    className="bz-btn-pill bz-btn-primary"
                    style={{ padding: '8px 18px', fontSize: '13.5px' }}
                    onClick={() => {
                      setSelectedTrackingRequest(req);
                      window.scrollTo({ top: 120, behavior: 'smooth' });
                    }}
                  >
                    Track Progress
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    );
  }

  /* ========================================================================
     VIEW: SELLER MY PRODUCTS
     ======================================================================== */
  function renderMyProductsView() {
    return (
      <main className="bz-section">
        <div className="bz-section-header">
          <div className="bz-section-title-wrap">
            <div className="bz-pill-badge">Supplier Desk</div>
            <h1 className="bz-section-title">My Registered Agricultural Produce</h1>
            <p className="bz-section-desc">
              Manage the harvest, crops, and nursery stocks you supply through Kissan Mithar Agri Bazaar.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              className="bz-btn-pill bz-btn-outline"
              onClick={() => setIsAuthModalOpen(true)}
            >
              <Phone size={14} />
              <span>{userPhone ? `Phone: ${userPhone}` : 'Enter Phone Number'}</span>
            </button>
            <button
              className="bz-btn-pill bz-btn-primary"
              onClick={() => {
                setSellerFormData({
                  id: undefined,
                  productName: '',
                  variety: '',
                  minQuantity: '',
                  maxQuantity: '',
                  quantityUnit: 'tonne',
                  price: '',
                  priceUnit: '₹ / tonne',
                  locationName: '',
                  village: '',
                  district: '',
                  state: '',
                  pincode: '',
                  latitude: undefined,
                  longitude: undefined,
                  photos: [],
                  phoneNumber: userPhone,
                  notes: '',
                });
                setIsSellerModalOpen(true);
              }}
            >
              <Plus size={15} />
              <span>Register New Produce</span>
            </button>
          </div>
        </div>

        {/* List of Supplier Products */}
        {loadingMyProducts ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
            Loading your registered produce...
          </div>
        ) : myProducts.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '60px 20px',
              background: '#ffffff',
              borderRadius: 16,
              border: '1px solid #e2e8f0',
            }}
          >
            <ShoppingBag size={36} color="#64748b" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1b4332' }}>
              You haven't registered any products yet
            </h3>
            <p style={{ color: '#64748b', fontSize: '14px', maxWidth: 440, margin: '8px auto 20px' }}>
              Register your available harvest so the Kissan Mithar sourcing team can match you with incoming bulk requests.
            </p>
            <button
              className="bz-btn-pill bz-btn-primary"
              onClick={() => setIsSellerModalOpen(true)}
            >
              Register as a Supplier
            </button>
          </div>
        ) : (
          <div className="bz-product-grid">
            {myProducts.map((p) => (
              <div key={p.id} className="bz-product-card">
                <div className="bz-product-card-media">
                  <img
                    src={p.photos && p.photos[0] ? p.photos[0] : '/assets/services/crop-connect.png'}
                    alt={p.productName || 'Produce'}
                    className="bz-product-card-img"
                  />
                  <span className="bz-product-badge">{p.status || 'Active'}</span>
                </div>

                <div className="bz-product-card-body">
                  <div className="bz-product-title-row">
                    <div className="bz-product-title">{p.productName || 'Agricultural Produce'}</div>
                  </div>

                  {p.variety && <div className="bz-product-variety">{p.variety}</div>}

                  <div className="bz-product-meta-item">
                    <Package size={15} />
                    <span>
                      {p.minQuantity !== undefined || p.maxQuantity !== undefined
                        ? `${p.minQuantity || 0} - ${p.maxQuantity || 'Any'} ${p.quantityUnit || ''}`
                        : 'Quantity on inquiry'}
                    </span>
                  </div>

                  <div className="bz-product-meta-item">
                    <MapPin size={15} />
                    <span>
                      {[p.district, p.state].filter(Boolean).join(', ') || p.locationName || 'Farm Location'}
                    </span>
                  </div>

                  <div className="bz-product-price-row">
                    <div>
                      {p.price ? (
                        <div className="bz-price-val">
                          ₹ {p.price.toLocaleString()}{' '}
                          <span style={{ fontSize: '12px', fontWeight: 500, color: '#64748b' }}>
                            {p.priceUnit}
                          </span>
                        </div>
                      ) : (
                        <div className="bz-price-unspec">Price not specified</div>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        className="bz-btn-pill bz-btn-outline"
                        style={{ padding: '6px 12px', fontSize: '12.5px' }}
                        onClick={() => {
                          setSellerFormData({
                            id: p.id,
                            productName: p.productName || '',
                            variety: p.variety || '',
                            minQuantity: p.minQuantity !== undefined ? String(p.minQuantity) : '',
                            maxQuantity: p.maxQuantity !== undefined ? String(p.maxQuantity) : '',
                            quantityUnit: p.quantityUnit || 'tonne',
                            price: p.price !== undefined ? String(p.price) : '',
                            priceUnit: p.priceUnit || '₹ / tonne',
                            locationName: p.locationName || '',
                            village: p.village || '',
                            district: p.district || '',
                            state: p.state || '',
                            pincode: p.pincode || '',
                            latitude: p.latitude,
                            longitude: p.longitude,
                            photos: p.photos || [],
                            phoneNumber: userPhone,
                            notes: p.notes || '',
                          });
                          setIsSellerModalOpen(true);
                        }}
                      >
                        <Edit2 size={13} />
                        <span>Edit</span>
                      </button>

                      <button
                        className="bz-btn-pill bz-btn-ghost"
                        style={{ padding: '6px 10px', color: '#b91c1c' }}
                        onClick={() => handleDeleteListing(p.id)}
                        title="Remove Listing"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    );
  }

  /* ========================================================================
     VIEW: HOW IT WORKS DEDICATED PAGE
     ======================================================================== */
  function renderHowItWorksPageView() {
    return (
      <main className="bz-section">
        <div className="bz-section-header">
          <div className="bz-section-title-wrap">
            <div className="bz-pill-badge">Workflow Architecture</div>
            <h1 className="bz-section-title">How Agri Bazaar Works</h1>
            <p className="bz-section-desc">
              Understand our managed sourcing methodology designed to ensure predictable quality, reliable supply, and transparent commercial terms.
            </p>
          </div>
        </div>

        <div className="bz-how-it-works-grid" style={{ marginBottom: 40 }}>
          <div className="bz-step-card">
            <span className="bz-step-number">01</span>
            <div className="bz-step-heading">Tell Us What You Need</div>
            <div className="bz-step-text">
              Buyers submit a product request specifying the required product, exact single fixed quantity, grade specifications, and delivery destination.
            </div>
          </div>

          <div className="bz-step-card">
            <span className="bz-step-number">02</span>
            <div className="bz-step-heading">We Find Suitable Suppliers</div>
            <div className="bz-step-text">
              The Kissan Mithar internal desk searches registered supplier listings and grower cooperatives, filtering for quality history and volume compatibility.
            </div>
          </div>

          <div className="bz-step-card">
            <span className="bz-step-number">03</span>
            <div className="bz-step-heading">We Verify the Details</div>
            <div className="bz-step-text">
              Our field agronomists inspect the produce directly at the farm gate. We check maturity, physical size, pesticide safety, and total available lots.
            </div>
          </div>

          <div className="bz-step-card">
            <span className="bz-step-number">04</span>
            <div className="bz-step-heading">We Coordinate Supply</div>
            <div className="bz-step-text">
              Kissan Mithar coordinates fair procurement pricing, harvesting schedules, packaging, transport freight, and destination delivery.
            </div>
          </div>
        </div>

        <div
          style={{
            background: '#ffffff',
            borderRadius: 20,
            padding: 36,
            border: '1px solid #e2e8f0',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 32,
          }}
        >
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#1b4332', marginTop: 0 }}>
              The Problem with Open Marketplaces
            </h3>
            <ul style={{ color: '#475569', lineHeight: 1.8, fontSize: '14.5px', paddingLeft: 20 }}>
              <li>Unverified listings often lead to stock shortages upon arrival.</li>
              <li>Direct phone numbers attract spam calls and broker harassment.</li>
              <li>Absence of on-site inspection leads to grade and moisture disputes.</li>
              <li>Logistics and loading responsibilities remain uncoordinated.</li>
            </ul>
          </div>

          <div>
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#1b4332', marginTop: 0 }}>
              The Agri Bazaar Advantage
            </h3>
            <ul style={{ color: '#475569', lineHeight: 1.8, fontSize: '14.5px', paddingLeft: 20 }}>
              <li>Single-point accountability with Kissan Mithar management.</li>
              <li>Confidential handling: no unsolicited public contact.</li>
              <li>On-site quality checking by qualified agriculture personnel.</li>
              <li>End-to-end status tracking from review to doorstep delivery.</li>
            </ul>
          </div>
        </div>
      </main>
    );
  }

  /* ========================================================================
     VIEW: ABOUT AGRI BAZAAR
     ======================================================================== */
  function renderAboutPageView() {
    return (
      <main className="bz-section">
        <div className="bz-section-header">
          <div className="bz-section-title-wrap">
            <div className="bz-pill-badge">About Our Service</div>
            <h1 className="bz-section-title">About Agri Bazaar — by Kissan Mithar</h1>
            <p className="bz-section-desc">
              Building a dependable bridge between agricultural producers and commercial buyers across India.
            </p>
          </div>
        </div>

        <div
          style={{
            background: '#ffffff',
            borderRadius: 20,
            padding: 40,
            border: '1px solid #e2e8f0',
            lineHeight: 1.7,
            color: '#334155',
            fontSize: '15.5px',
          }}
        >
          <p>
            <strong>Agri Bazaar</strong> is an integrated agricultural sourcing and supply service operated by Kissan Mithar. We operate as a dedicated procurement desk that simplifies how Indian businesses, food processors, retail chains, and agricultural traders source farm produce directly from rural grower hubs.
          </p>

          <h3 style={{ color: '#1b4332', fontSize: '20px', fontWeight: 800, marginTop: 28 }}>
            Our Operating Principles
          </h3>
          <p>
            Agricultural trade cannot rely on automated clicks alone. Farming involves natural variations in moisture, fruit caliber, harvesting windows, and weather conditions. That is why Agri Bazaar integrates digital registration with human verification by agricultural experts.
          </p>

          <h3 style={{ color: '#1b4332', fontSize: '20px', fontWeight: 800, marginTop: 28 }}>
            Data Privacy & Grower Protection
          </h3>
          <p>
            We strictly protect the personal contact information of both farmers and buyers. Farmers are never subjected to cold sales harassment or predatory middleman bidding, and buyers never have to negotiate with unverified third parties. All communication, quality assurance, and commercial fulfillment are coordinated through Kissan Mithar.
          </p>

          <div style={{ marginTop: 32, display: 'flex', gap: 14 }}>
            <button className="bz-btn-pill bz-btn-primary" onClick={() => setIsRequestModalOpen(true)}>
              Request a Product
            </button>
            <button className="bz-btn-pill bz-btn-outline" onClick={() => setIsSellerModalOpen(true)}>
              Register as a Supplier
            </button>
          </div>
        </div>
      </main>
    );
  }

  /* ========================================================================
     VIEW: CONTACT & SUPPORT
     ======================================================================== */
  function renderContactPageView() {
    return (
      <main className="bz-section">
        <div className="bz-section-header">
          <div className="bz-section-title-wrap">
            <div className="bz-pill-badge">Support & Coordination</div>
            <h1 className="bz-section-title">Contact Agri Bazaar Operations Desk</h1>
            <p className="bz-section-desc">
              Have questions regarding custom crop sourcing, logistics, or registration? Get in touch with our operations team.
            </p>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.2fr 0.8fr',
            gap: 32,
            background: '#ffffff',
            borderRadius: 20,
            padding: 36,
            border: '1px solid #e2e8f0',
          }}
        >
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#1b4332', marginTop: 0 }}>
              Sourcing Desk Enquiries
            </h3>
            <p style={{ color: '#475569', fontSize: '14.5px', lineHeight: 1.6 }}>
              For high-volume procurement, corporate institutional demand, or supplier onboarding queries, submit your message below:
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                showToast('Message sent to Kissan Mithar Sourcing Desk');
                (e.target as HTMLFormElement).reset();
              }}
              style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 16 }}
            >
              <div className="bz-form-group">
                <label className="bz-form-label">Full Name</label>
                <input type="text" className="bz-input" required placeholder="Your name" />
              </div>

              <div className="bz-form-group">
                <label className="bz-form-label">Phone Number</label>
                <input type="tel" className="bz-input" required placeholder="10-digit mobile number" />
              </div>

              <div className="bz-form-group">
                <label className="bz-form-label">Message / Requirement Details</label>
                <textarea
                  className="bz-input"
                  style={{ height: 100, padding: 12 }}
                  required
                  placeholder="Describe the produce, volume, or query..."
                />
              </div>

              <button type="submit" className="bz-btn-pill bz-btn-primary" style={{ width: 'fit-content' }}>
                Send Message
              </button>
            </form>
          </div>

          <div
            style={{
              background: '#fbfaf6',
              padding: 28,
              borderRadius: 14,
              border: '1px solid #e9d8a6',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#1b4332', margin: 0 }}>
              Operating Desk Information
            </h4>
            <div style={{ fontSize: '14px', color: '#475569', lineHeight: 1.6 }}>
              <strong>Kissan Mithar Operations</strong>
              <br />
              Central Telangana & Andhra Pradesh Agri Sourcing Hub
              <br />
              Operating Hours: Monday – Saturday (9:00 AM – 7:00 PM IST)
            </div>

            <div style={{ fontSize: '14px', color: '#475569', lineHeight: 1.6 }}>
              <strong>Direct Actions:</strong>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                <span
                  style={{ color: '#2d6a4f', cursor: 'pointer', fontWeight: 600 }}
                  onClick={() => setIsRequestModalOpen(true)}
                >
                  → Submit a Product Request
                </span>
                <span
                  style={{ color: '#2d6a4f', cursor: 'pointer', fontWeight: 600 }}
                  onClick={() => setIsSellerModalOpen(true)}
                >
                  → Register as a Supplier
                </span>
                <span
                  style={{ color: '#2d6a4f', cursor: 'pointer', fontWeight: 600 }}
                  onClick={() => setCurrentView('my-requests')}
                >
                  → Track Your Sourcing Status
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }
};

export default AgriBazaarPage;
