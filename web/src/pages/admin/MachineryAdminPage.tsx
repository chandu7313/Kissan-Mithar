import React, { useState } from 'react';
import {
  Tractor,
  Calendar,
  IndianRupee,
  MapPin,
  Eye,
  CheckCircle,
  Clock,
  Briefcase,
  AlertCircle,
  Phone,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  ChevronDown,
  X,
  Link2,
  ShieldCheck,
  Send,
  ArrowRight,
  Sprout,
  Check,
  Settings,
  Fuel,
} from 'lucide-react';
import { Drawer } from '../../components/common/Drawer.js';

interface MachineryItem {
  id: string;
  name: string;
  category: string;
  image: string;
  district: string;
  state: string;
  rate: string;
  rateUnit: string;
  horsepower: string;
  implementsAttached: string;
  status: 'Available' | 'Rented';
  ownerName: string;
  phone: string;
  yearModel: string;
  rating: number;
}

const INITIAL_MACHINERY: MachineryItem[] = [
  {
    id: 'MC-2025-001',
    name: 'Mahindra 575 DI Tractor',
    category: 'Tractor',
    image: '/assets/machinery_tractor.jpg',
    district: 'Warangal',
    state: 'TS',
    rate: '₹650',
    rateUnit: 'per Hour',
    horsepower: '45 HP',
    implementsAttached: 'Cultivator, Rotavator, MB Plough',
    status: 'Available',
    ownerName: 'Ramesh Agro Services',
    phone: '+91 98480 11223',
    yearModel: '2023',
    rating: 4.9,
  },
  {
    id: 'MC-2025-002',
    name: 'John Deere 5050D 4WD',
    category: 'Tractor',
    image: '/assets/machinery_tractor.jpg',
    district: 'Karimnagar',
    state: 'TS',
    rate: '₹800',
    rateUnit: 'per Hour',
    horsepower: '50 HP',
    implementsAttached: 'Heavy Subsoiler, Laser Land Leveler',
    status: 'Available',
    ownerName: 'Srinivas Farm Machinery',
    phone: '+91 94401 22334',
    yearModel: '2024',
    rating: 4.95,
  },
  {
    id: 'MC-2025-003',
    name: 'Preet 987 Combine Harvester',
    category: 'Combine Harvester',
    image: '/assets/machinery_tractor.jpg',
    district: 'Nizamabad',
    state: 'TS',
    rate: '₹2,200',
    rateUnit: 'per Hour (With Operator)',
    horsepower: '101 HP',
    implementsAttached: '14ft Cutter Bar, Straw Reaper',
    status: 'Rented',
    ownerName: 'Telangana Harvesters Hub',
    phone: '+91 99890 33445',
    yearModel: '2022',
    rating: 4.8,
  },
  {
    id: 'MC-2025-004',
    name: 'Kisan Drone Sprayer 16L',
    category: 'Agricultural Drone',
    image: '/assets/machinery_tractor.jpg',
    district: 'Medak',
    state: 'TS',
    rate: '₹450',
    rateUnit: 'per Acre',
    horsepower: 'Hexacopter Electric',
    implementsAttached: 'Centrifugal Atomizing Nozzles',
    status: 'Available',
    ownerName: 'AgriAero Drone Tech',
    phone: '+91 97000 44556',
    yearModel: '2025',
    rating: 5.0,
  },
  {
    id: 'MC-2025-005',
    name: 'Kubota DC-68G Paddy Harvester',
    category: 'Combine Harvester',
    image: '/assets/machinery_tractor.jpg',
    district: 'Khammam',
    state: 'TS',
    rate: '₹2,400',
    rateUnit: 'per Hour',
    horsepower: '68 HP',
    implementsAttached: 'Rubber Crawlers (Wet Field Specialized)',
    status: 'Available',
    ownerName: 'Khammam Mechanization Center',
    phone: '+91 98480 77889',
    yearModel: '2023',
    rating: 4.88,
  },
];

interface Props {
  onNavigateToLabour?: () => void;
}

export const MachineryAdminPage: React.FC<Props> = ({ onNavigateToLabour }) => {
  const [activeTab, setActiveTab] = useState<'listings' | 'bookings' | 'operators' | 'maintenance'>('listings');
  const [machineryList, setMachineryList] = useState<MachineryItem[]>(INITIAL_MACHINERY);
  const [selectedMachinery, setSelectedMachinery] = useState<MachineryItem | null>(null);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>('All Equipment');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('All Districts');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [isAddOpen, setIsAddOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Add Machinery Form
  const [newForm, setNewForm] = useState({
    name: '',
    category: 'Tractor',
    district: 'Warangal',
    rate: '',
    rateUnit: 'per Hour',
    horsepower: '',
    implementsAttached: '',
    ownerName: '',
    phone: '',
    yearModel: '2024',
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newForm.name.trim() || !newForm.rate) return;
    setIsSubmitting(true);
    setTimeout(() => {
      const created: MachineryItem = {
        id: `MC-2025-${String(machineryList.length + 1).padStart(3, '0')}`,
        name: newForm.name,
        category: newForm.category,
        image: '/assets/machinery_tractor.jpg',
        district: newForm.district,
        state: 'TS',
        rate: `₹${newForm.rate}`,
        rateUnit: newForm.rateUnit,
        horsepower: newForm.horsepower || '45 HP',
        implementsAttached: newForm.implementsAttached || 'Standard Agricultural Implements',
        status: 'Available',
        ownerName: newForm.ownerName || 'Farm Machinery Provider',
        phone: newForm.phone || '+91 98480 00000',
        yearModel: newForm.yearModel || '2024',
        rating: 5.0,
      };
      setMachineryList([created, ...machineryList]);
      setIsSubmitting(false);
      setIsAddOpen(false);
      setToastMessage(`Machinery "${created.name}" registered successfully!`);
      setNewForm({
        name: '',
        category: 'Tractor',
        district: 'Warangal',
        rate: '',
        rateUnit: 'per Hour',
        horsepower: '',
        implementsAttached: '',
        ownerName: '',
        phone: '',
        yearModel: '2024',
      });
      setTimeout(() => setToastMessage(null), 5000);
    }, 500);
  };

  const filteredList = machineryList.filter((m) => {
    if (selectedCategory !== 'All Equipment' && m.category !== selectedCategory) return false;
    if (selectedDistrict !== 'All Districts' && m.district !== selectedDistrict) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        m.name.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q) ||
        m.district.toLowerCase().includes(q) ||
        m.ownerName.toLowerCase().includes(q) ||
        m.phone.includes(q)
      );
    }
    return true;
  });

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
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

      {/* 1. TOP HEADER & ACTION BUTTON */}
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
            Farm Machinery
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>
            Manage farm machinery listings, tractor rentals, harvesters and implements
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
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
          <span>Add Machinery</span>
        </button>
      </div>

      {/* 2. SUB-NAVIGATION TABS */}
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
          { key: 'listings', label: `Machinery Listings (${machineryList.length})` },
          { key: 'bookings', label: 'Rental Bookings (28)' },
          { key: 'operators', label: 'Operators Directory (64)' },
          { key: 'maintenance', label: 'Maintenance & Fuel' },
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

      {/* 3. THREE STAT KPI CARDS */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1.25rem',
        }}
      >
        {/* Card 1: Total Machinery */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #f1f5f9',
            padding: '1.25rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8125rem', color: '#64748b', fontWeight: 500 }}>
              Total Machinery Registered
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
              <Tractor size={16} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.5rem' }}>
            <span style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>342</span>
            <span style={{ fontSize: '0.78rem', color: '#16a34a', fontWeight: 700 }}>+18%</span>
          </div>
        </div>

        {/* Card 2: Available for Rent */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #f1f5f9',
            padding: '1.25rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8125rem', color: '#64748b', fontWeight: 500 }}>
              Available for Rent
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
              <CheckCircle size={16} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.5rem' }}>
            <span style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>289</span>
            <span style={{ fontSize: '0.78rem', color: '#16a34a', fontWeight: 700 }}>85%</span>
          </div>
        </div>

        {/* Card 3: Bookings This Month */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #f1f5f9',
            padding: '1.25rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8125rem', color: '#64748b', fontWeight: 500 }}>
              Bookings This Month
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
              <Calendar size={16} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.5rem' }}>
            <span style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>156</span>
            <span style={{ fontSize: '0.78rem', color: '#16a34a', fontWeight: 700 }}>+24%</span>
          </div>
        </div>
      </div>

      {/* 4. HORIZONTAL FILTER BAR */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr)) 1.8fr',
          gap: '0.75rem',
          backgroundColor: '#ffffff',
          padding: '0.75rem 1rem',
          borderRadius: '12px',
          border: '1px solid #f1f5f9',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
        }}
      >
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          style={{
            padding: '0.55rem 0.85rem',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            backgroundColor: '#ffffff',
            fontSize: '0.84rem',
            color: '#334155',
            outline: 'none',
          }}
        >
          <option value="All Equipment">All Equipment Types</option>
          <option value="Tractor">Tractors</option>
          <option value="Combine Harvester">Combine Harvesters</option>
          <option value="Agricultural Drone">Agricultural Drones</option>
          <option value="Rotavator">Rotavators & Tillers</option>
        </select>

        <select
          value={selectedDistrict}
          onChange={(e) => setSelectedDistrict(e.target.value)}
          style={{
            padding: '0.55rem 0.85rem',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            backgroundColor: '#ffffff',
            fontSize: '0.84rem',
            color: '#334155',
            outline: 'none',
          }}
        >
          <option value="All Districts">All Districts</option>
          <option value="Warangal">Warangal</option>
          <option value="Karimnagar">Karimnagar</option>
          <option value="Nizamabad">Nizamabad</option>
          <option value="Medak">Medak</option>
          <option value="Khammam">Khammam</option>
        </select>

        <div style={{ position: 'relative', gridColumn: 'span 2' }}>
          <Search
            size={16}
            color="#94a3b8"
            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            placeholder="Search by equipment, model, owner or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.55rem 0.85rem 0.55rem 2.25rem',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              backgroundColor: '#ffffff',
              fontSize: '0.84rem',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>
      </div>

      {/* 5. TAB VIEW: MACHINERY LISTINGS */}
      {activeTab === 'listings' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {filteredList.map((m) => (
            <div
              key={m.id}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '14px',
                border: '1px solid #f1f5f9',
                padding: '1.25rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1.25rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flex: 1, minWidth: '320px' }}>
                <img
                  src={m.image}
                  alt={m.name}
                  style={{
                    width: '135px',
                    height: '95px',
                    borderRadius: '10px',
                    objectFit: 'cover',
                    flexShrink: 0,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                  }}
                />

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                      {m.name}
                    </h3>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', backgroundColor: '#f1f5f9', padding: '2px 8px', borderRadius: '6px' }}>
                      {m.category}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'auto auto', gap: '0.35rem 1.5rem', fontSize: '0.8125rem', color: '#64748b' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <MapPin size={14} color="#64748b" />
                      <span>{m.district}, {m.state}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Tractor size={14} color="#64748b" />
                      <span>{m.horsepower}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <IndianRupee size={14} color="#059669" />
                      <strong style={{ color: '#059669' }}>{m.rate} {m.rateUnit}</strong>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Calendar size={14} color="#64748b" />
                      <span>Model Year: {m.yearModel}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', color: '#475569', marginTop: '0.1rem' }}>
                    <Settings size={13} color="#059669" />
                    <span>Implements: {m.implementsAttached}</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Status + Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span
                  style={{
                    padding: '0.3rem 0.85rem',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    backgroundColor: m.status === 'Available' ? '#ecfdf5' : '#fee2e2',
                    color: m.status === 'Available' ? '#059669' : '#dc2626',
                  }}
                >
                  {m.status}
                </span>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', minWidth: '120px' }}>
                  <a
                    href={`tel:${m.phone}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.35rem',
                      padding: '0.45rem 1rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      backgroundColor: '#ffffff',
                      color: '#0f172a',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      textDecoration: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <Phone size={13} />
                    <span>Call</span>
                  </a>

                  <button
                    onClick={() => setSelectedMachinery(m)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '0.48rem 1rem',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: '#059669',
                      color: '#ffffff',
                      fontSize: '0.8125rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 6. TAB VIEW: RENTAL BOOKINGS */}
      {activeTab === 'bookings' && (
        <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid #f1f5f9', overflow: 'hidden' }}>
          <div style={{ padding: '1.15rem 1.25rem', borderBottom: '1px solid #f1f5f9' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
              Recent Machinery Rental Bookings
            </h3>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8125rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#fafbfc', borderBottom: '1px solid #f1f5f9', color: '#94a3b8', fontSize: '0.6875rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '0.75rem 1rem' }}>Booking ID</th>
                <th style={{ padding: '0.75rem 1rem' }}>Equipment</th>
                <th style={{ padding: '0.75rem 1rem' }}>Farmer & Location</th>
                <th style={{ padding: '0.75rem 1rem' }}>Duration / Area</th>
                <th style={{ padding: '0.75rem 1rem' }}>Amount</th>
                <th style={{ padding: '0.75rem 1rem' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {[
                { id: 'MB-2025-089', equip: 'Mahindra 575 DI Tractor', farmer: 'G. Mallaiah (Warangal)', dur: '6 Hours (Ploughing)', amt: '₹3,900', status: 'In Operation', statusBg: '#eff6ff', statusColor: '#2563eb' },
                { id: 'MB-2025-088', equip: 'Kisan Drone Sprayer 16L', farmer: 'K. Sammaiah (Medak)', dur: '8 Acres (Nano Urea)', amt: '₹3,600', status: 'Completed', statusBg: '#ecfdf5', statusColor: '#059669' },
                { id: 'MB-2025-087', equip: 'Preet 987 Harvester', farmer: 'B. Laxman (Nizamabad)', dur: '4 Hours (Paddy)', amt: '₹8,800', status: 'Dispatched', statusBg: '#fffbeb', statusColor: '#b45309' },
              ].map((b) => (
                <tr key={b.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#64748b' }}>{b.id}</td>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#0f172a' }}>{b.equip}</td>
                  <td style={{ padding: '0.75rem 1rem', color: '#475569' }}>{b.farmer}</td>
                  <td style={{ padding: '0.75rem 1rem', color: '#64748b' }}>{b.dur}</td>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#059669' }}>{b.amt}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span style={{ padding: '0.2rem 0.6rem', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 700, backgroundColor: b.statusBg, color: b.statusColor }}>
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 7. TAB VIEW: OPERATORS */}
      {activeTab === 'operators' && (
        <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid #f1f5f9', padding: '1.25rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.5rem 0' }}>
            Certified Equipment Operators Registry
          </h3>
          <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: '0 0 1rem 0' }}>
            Licensed tractor and combine harvester operators trained in precision agriculture.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {[
              { name: 'S. Narsimha', machine: 'Heavy Tractor & Laser Leveler', village: 'Warangal', license: 'TS-03-TR-881', exp: '11 Yrs', phone: '+91 98480 99881' },
              { name: 'P. Ravinder', machine: 'Combine Harvester (Rubber Track)', village: 'Nizamabad', license: 'TS-16-CH-442', exp: '9 Yrs', phone: '+91 94401 33441' },
              { name: 'D. Vinod Kumar', machine: 'DGCA Certified Drone Pilot (RPA)', village: 'Medak', license: 'DGCA-AGR-2024-91', exp: '3 Yrs', phone: '+91 97000 88992' },
            ].map((op, idx) => (
              <div key={idx} style={{ padding: '1rem', backgroundColor: '#fafbfc', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                <div style={{ fontWeight: 700, color: '#0f172a' }}>{op.name}</div>
                <div style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600 }}>{op.machine}</div>
                <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.35rem' }}>📍 {op.village} • License: {op.license}</div>
                <div style={{ fontSize: '0.78rem', color: '#059669', marginTop: '0.2rem', fontWeight: 600 }}>📞 {op.phone}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8. TAB VIEW: MAINTENANCE */}
      {activeTab === 'maintenance' && (
        <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid #f1f5f9', padding: '1.25rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.5rem 0' }}>
            Machinery Telemetry, Oil & Periodic Service Records
          </h3>
          <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: '0 0 1rem 0' }}>
            Hour meter tracking and preventive service intervals.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            <div style={{ padding: '1rem', backgroundColor: '#ecfdf5', borderRadius: '10px', border: '1px solid #bbf7d0' }}>
              <div style={{ fontSize: '0.8rem', color: '#065f46', fontWeight: 600 }}>Active Fleet Health</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#059669', marginTop: '0.25rem' }}>96.4%</div>
              <div style={{ fontSize: '0.75rem', color: '#065f46', marginTop: '0.2rem' }}>All units service-compliant</div>
            </div>
            <div style={{ padding: '1rem', backgroundColor: '#fafbfc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Due for 250hr Service</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#d97706', marginTop: '0.25rem' }}>8 Machines</div>
              <div style={{ fontSize: '0.75rem', color: '#d97706', marginTop: '0.2rem' }}>Scheduled this weekend</div>
            </div>
          </div>
        </div>
      )}

      {/* DRAWER: MACHINERY DETAILS */}
      <Drawer
        isOpen={Boolean(selectedMachinery)}
        onClose={() => setSelectedMachinery(null)}
        title={selectedMachinery ? selectedMachinery.name : ''}
        subtitle={selectedMachinery ? `Provider: ${selectedMachinery.ownerName} (${selectedMachinery.phone})` : undefined}
        width="560px"
      >
        {selectedMachinery && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <img
              src={selectedMachinery.image}
              alt={selectedMachinery.name}
              style={{ width: '100%', height: '210px', objectFit: 'cover', borderRadius: '12px' }}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', backgroundColor: '#fafbfc', padding: '1rem', borderRadius: '10px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Rental Rate:</span>
                <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#059669' }}>{selectedMachinery.rate} {selectedMachinery.rateUnit}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Status:</span>
                <div>
                  <span style={{ padding: '0.2rem 0.6rem', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 700, backgroundColor: selectedMachinery.status === 'Available' ? '#ecfdf5' : '#fee2e2', color: selectedMachinery.status === 'Available' ? '#059669' : '#dc2626' }}>
                    {selectedMachinery.status}
                  </span>
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Power / Specs:</span>
                <div style={{ fontWeight: 600, color: '#0f172a' }}>{selectedMachinery.horsepower}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Model Year:</span>
                <div style={{ fontWeight: 600, color: '#0f172a' }}>{selectedMachinery.yearModel}</div>
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.4rem 0' }}>Included Implements & Attachments</h4>
              <p style={{ fontSize: '0.85rem', color: '#475569', margin: 0 }}>{selectedMachinery.implementsAttached}</p>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
              <a
                href={`tel:${selectedMachinery.phone}`}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  backgroundColor: '#059669',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  textDecoration: 'none',
                }}
              >
                <Phone size={16} />
                <span>Contact Owner ({selectedMachinery.ownerName})</span>
              </a>
            </div>
          </div>
        )}
      </Drawer>

      {/* ADD MACHINERY MODAL */}
      {isAddOpen && (
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
          onClick={() => setIsAddOpen(false)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '600px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              display: 'flex',
              flexDirection: 'column',
            }}
            onClick={(e) => e.stopPropagation()}
          >
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
                  <Tractor size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Add Farm Machinery Listing
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
                    Register farm tractor, harvester, drone or implement for farmer rentals
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddOpen(false)}
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

            <form onSubmit={handleAddSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  Equipment / Machine Model *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Swaraj 744 FE Tractor, Kartar 4000 Harvester"
                  value={newForm.name}
                  onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
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
                    Equipment Category
                  </label>
                  <select
                    value={newForm.category}
                    onChange={(e) => setNewForm({ ...newForm, category: e.target.value })}
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
                    <option value="Tractor">Tractor</option>
                    <option value="Combine Harvester">Combine Harvester</option>
                    <option value="Agricultural Drone">Agricultural Drone</option>
                    <option value="Rotavator">Rotavator / Tiller</option>
                    <option value="Other Implement">Other Implement</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    Horsepower / Capacity
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 48 HP or 16L Tank"
                    value={newForm.horsepower}
                    onChange={(e) => setNewForm({ ...newForm, horsepower: e.target.value })}
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
                    Rental Rate (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 700"
                    value={newForm.rate}
                    onChange={(e) => setNewForm({ ...newForm, rate: e.target.value })}
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
                    Rate Unit
                  </label>
                  <select
                    value={newForm.rateUnit}
                    onChange={(e) => setNewForm({ ...newForm, rateUnit: e.target.value })}
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
                    <option value="per Hour">per Hour</option>
                    <option value="per Acre">per Acre</option>
                    <option value="per Day">per Day</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    Owner / Custom Hiring Center Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Srinivas Reddy"
                    value={newForm.ownerName}
                    onChange={(e) => setNewForm({ ...newForm, ownerName: e.target.value })}
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
                    Owner Contact Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 98480 12345"
                    value={newForm.phone}
                    onChange={(e) => setNewForm({ ...newForm, phone: e.target.value })}
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
                    District Location
                  </label>
                  <select
                    value={newForm.district}
                    onChange={(e) => setNewForm({ ...newForm, district: e.target.value })}
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
                    <option value="Nizamabad">Nizamabad</option>
                    <option value="Medak">Medak</option>
                    <option value="Khammam">Khammam</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    Model Year
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 2024"
                    value={newForm.yearModel}
                    onChange={(e) => setNewForm({ ...newForm, yearModel: e.target.value })}
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
                  Attached Implements & Service Terms
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Includes rotavator & 9-tyne cultivator. Diesel provided by farmer / owner..."
                  value={newForm.implementsAttached}
                  onChange={(e) => setNewForm({ ...newForm, implementsAttached: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.875rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit',
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
                  onClick={() => setIsAddOpen(false)}
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
                  disabled={isSubmitting}
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
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    boxShadow: '0 1px 3px rgba(5, 150, 105, 0.3)',
                    opacity: isSubmitting ? 0.7 : 1,
                  }}
                >
                  <Send size={15} />
                  <span>{isSubmitting ? 'Saving...' : 'Register Machinery'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
