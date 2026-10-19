import React, { useState } from 'react';
import {
  FileText,
  Download,
  Users,
  Sprout,
  Activity,
  Tractor,
  ShoppingCart,
  Calendar,
  CheckCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { FarmerApi } from '../../api/farmer.api.js';
import { ServiceOperationsApi } from '../../api/serviceOperations.api.js';
import { AgriBazaarApi } from '../../api/agriBazaar.api.js';

export const ReportsPage: React.FC = () => {
  const [downloadingSection, setDownloadingSection] = useState<string | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  // Helper to trigger CSV file download with Excel BOM
  const triggerDownload = (filename: string, headers: string[], rows: (string | number)[][]) => {
    const csvRows = [headers.join(','), ...rows.map((row) => row.join(','))];
    const csvString = '\uFEFF' + csvRows.join('\r\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportFarmers = async () => {
    setDownloadingSection('farmers');
    setDownloadSuccess(null);
    try {
      const res = await FarmerApi.list({ limit: 1000 });
      const headers = ['Farmer ID', 'Name', 'Phone', 'Village', 'District', 'State', 'Land (Acres)', 'Primary Crop', 'Total Requests', 'Registered At'];
      const rows = res.data.map((f) => [
        f.id,
        `"${(f.name || '').replace(/"/g, '""')}"`,
        `"${f.phoneNumber}"`,
        `"${(f.village || '').replace(/"/g, '""')}"`,
        `"${(f.district || '').replace(/"/g, '""')}"`,
        `"${f.state || 'J&K'}"`,
        f.landAcres || 0,
        `"${f.primaryCrop || 'Apple'}"`,
        (f._count?.orchardRequests || 0) + (f._count?.fertilizerRequests || 0) + (f._count?.diseaseRequests || 0) + (f._count?.labourRequests || 0),
        new Date(f.createdAt).toISOString(),
      ]);
      triggerDownload(`km_farmers_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
      setDownloadSuccess(`Exported ${res.data.length} farmer records.`);
    } catch (err) {
      console.error('[ReportsPage] Export error:', err);
    } finally {
      setDownloadingSection(null);
    }
  };

  const handleExportFertilizer = async () => {
    setDownloadingSection('fertilizer');
    setDownloadSuccess(null);
    try {
      const res = await ServiceOperationsApi.listFertilizers({ limit: 1000 });
      const headers = ['Request ID', 'Farmer Name', 'Phone', 'Village', 'Crop', 'Land Acres', 'Soil Type', 'Problem Category', 'Status', 'Submitted At'];
      const rows = res.data.map((r) => [
        r.id,
        `"${(r.farmer.name || '').replace(/"/g, '""')}"`,
        `"${r.farmer.phoneNumber}"`,
        `"${(r.farmer.village || '').replace(/"/g, '""')}"`,
        `"${r.cropType || ''}"`,
        r.landAcres || 0,
        `"${r.soilType || ''}"`,
        `"${(r.problemCategory || '').replace(/"/g, '""')}"`,
        r.status,
        new Date(r.submittedAt).toISOString(),
      ]);
      triggerDownload(`km_fertilizer_guidance_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
      setDownloadSuccess(`Exported ${res.data.length} soil & fertilizer records.`);
    } catch (err) {
      console.error('[ReportsPage] Export error:', err);
    } finally {
      setDownloadingSection(null);
    }
  };

  const handleExportDisease = async () => {
    setDownloadingSection('disease');
    setDownloadSuccess(null);
    try {
      const res = await ServiceOperationsApi.listDiseases({ limit: 1000 });
      const headers = ['Request ID', 'Farmer Name', 'Phone', 'Village', 'Crop', 'Affected Part', 'Spread Rate', 'Status', 'Submitted At'];
      const rows = res.data.map((r) => [
        r.id,
        `"${(r.farmer.name || '').replace(/"/g, '""')}"`,
        `"${r.farmer.phoneNumber}"`,
        `"${(r.farmer.village || '').replace(/"/g, '""')}"`,
        `"${r.cropType || ''}"`,
        `"${r.affectedPart || ''}"`,
        `"${r.spreadRate || ''}"`,
        r.status,
        new Date(r.submittedAt).toISOString(),
      ]);
      triggerDownload(`km_crop_disease_pathology_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
      setDownloadSuccess(`Exported ${res.data.length} crop pathology records.`);
    } catch (err) {
      console.error('[ReportsPage] Export error:', err);
    } finally {
      setDownloadingSection(null);
    }
  };

  const handleExportLabour = async () => {
    setDownloadingSection('labour');
    setDownloadSuccess(null);
    try {
      const res = await ServiceOperationsApi.listLabour({ limit: 1000 });
      const headers = ['Request ID', 'Farmer Name', 'Phone', 'Task Type', 'Workers Needed', 'Daily Wage', 'Start Date', 'Duration Days', 'Status'];
      const rows = res.data.map((r) => [
        r.id,
        `"${(r.farmer.name || '').replace(/"/g, '""')}"`,
        `"${r.farmer.phoneNumber}"`,
        `"${r.taskType}"`,
        r.labourersRequired,
        r.dailyWage || 0,
        r.preferredStartDate ? new Date(r.preferredStartDate).toLocaleDateString() : 'Immediate',
        r.durationDays || 1,
        r.status,
      ]);
      triggerDownload(`km_labour_requests_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
      setDownloadSuccess(`Exported ${res.data.length} labour records.`);
    } catch (err) {
      console.error('[ReportsPage] Export error:', err);
    } finally {
      setDownloadingSection(null);
    }
  };

  const handleExportBazaar = async () => {
    setDownloadingSection('bazaar');
    setDownloadSuccess(null);
    try {
      const res = await AgriBazaarApi.getListings({ limit: 1000 });
      const listings = res.data || [];
      const headers = ['Listing ID', 'Product', 'Variety', 'Quantity', 'Unit', 'Price', 'Price Unit', 'Location', 'Status', 'Created At'];
      const rows = listings.map((r: any) => [
        r.id,
        `"${(r.productName || '').replace(/"/g, '""')}"`,
        `"${(r.variety || '').replace(/"/g, '""')}"`,
        r.availableQuantity || 0,
        r.quantityUnit || 'KG',
        r.price || 0,
        r.priceUnit || 'KG',
        `"${r.location || 'Kashmir'}"`,
        r.status,
        new Date(r.createdAt).toISOString(),
      ]);
      triggerDownload(`km_agri_bazaar_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
      setDownloadSuccess(`Exported ${listings.length} bazaar listings.`);
    } catch (err) {
      console.error('[ReportsPage] Export error:', err);
    } finally {
      setDownloadingSection(null);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '2rem' }}>
      
      {/* Title */}
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem 0' }}>
          Executive Reports & Data Export Center
        </h1>
        <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>
          Export authoritative production datasets in standard CSV format for offline agronomic audits, government schemes, and financial accounting.
        </p>
      </div>

      {downloadSuccess && (
        <div
          style={{
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            backgroundColor: '#f0fdf4',
            border: '1px solid #bbf7d0',
            color: '#15803d',
            fontSize: '0.875rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <CheckCircle size={16} />
          <span>{downloadSuccess}</span>
        </div>
      )}

      {/* Dataset Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.25rem',
        }}
      >
        {/* Farmers Dataset */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '1rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}
        >
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ padding: '10px', borderRadius: '10px', backgroundColor: '#dcfce7', color: '#16a34a', height: 'fit-content' }}>
              <Users size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.25rem 0' }}>
                Farmer Master Registry
              </h3>
              <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: 0, lineHeight: 1.4 }}>
                Complete database of registered growers, village addresses, land acreage, primary crop varieties, and multi-service engagement counts.
              </p>
            </div>
          </div>

          <button
            onClick={handleExportFarmers}
            disabled={downloadingSection === 'farmers'}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.625rem 1rem',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#166534',
              color: '#ffffff',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: downloadingSection === 'farmers' ? 'wait' : 'pointer',
            }}
          >
            <Download size={16} />
            <span>{downloadingSection === 'farmers' ? 'Generating CSV...' : 'Download Farmers CSV'}</span>
          </button>
        </div>

        {/* Soil & Fertilizer Dataset */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '1rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}
        >
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ padding: '10px', borderRadius: '10px', backgroundColor: '#eff6ff', color: '#2563eb', height: 'fit-content' }}>
              <Sprout size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.25rem 0' }}>
                Soil & Fertilizer Advisory
              </h3>
              <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: 0, lineHeight: 1.4 }}>
                All fertilizer consultation records with crop age, soil type, irrigation, farmer issue categories, review statuses, and assigned agronomists.
              </p>
            </div>
          </div>

          <button
            onClick={handleExportFertilizer}
            disabled={downloadingSection === 'fertilizer'}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.625rem 1rem',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: downloadingSection === 'fertilizer' ? 'wait' : 'pointer',
            }}
          >
            <Download size={16} />
            <span>{downloadingSection === 'fertilizer' ? 'Generating CSV...' : 'Download Fertilizer CSV'}</span>
          </button>
        </div>

        {/* Crop Disease Dataset */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '1rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}
        >
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ padding: '10px', borderRadius: '10px', backgroundColor: '#fffbeb', color: '#d97706', height: 'fit-content' }}>
              <Activity size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.25rem 0' }}>
                Crop Disease & Pathology
              </h3>
              <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: 0, lineHeight: 1.4 }}>
                Comprehensive log of plant pathology cases, affected foliage/bark, spread velocity, past chemical applications, and diagnosis status.
              </p>
            </div>
          </div>

          <button
            onClick={handleExportDisease}
            disabled={downloadingSection === 'disease'}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.625rem 1rem',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#d97706',
              color: '#ffffff',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: downloadingSection === 'disease' ? 'wait' : 'pointer',
            }}
          >
            <Download size={16} />
            <span>{downloadingSection === 'disease' ? 'Generating CSV...' : 'Download Pathology CSV'}</span>
          </button>
        </div>

        {/* Labour Dataset */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '1rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}
        >
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ padding: '10px', borderRadius: '10px', backgroundColor: '#fdf2f8', color: '#be185d', height: 'fit-content' }}>
              <Tractor size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.25rem 0' }}>
                Labour & Machinery Bookings
              </h3>
              <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: 0, lineHeight: 1.4 }}>
                Farmer bookings for pruning, spraying, harvesting crews, tractor operations, daily wage rates, duration days, and fulfillment statuses.
              </p>
            </div>
          </div>

          <button
            onClick={handleExportLabour}
            disabled={downloadingSection === 'labour'}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.625rem 1rem',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#be185d',
              color: '#ffffff',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: downloadingSection === 'labour' ? 'wait' : 'pointer',
            }}
          >
            <Download size={16} />
            <span>{downloadingSection === 'labour' ? 'Generating CSV...' : 'Download Labour CSV'}</span>
          </button>
        </div>

        {/* Agri Bazaar Dataset */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '1rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}
        >
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ padding: '10px', borderRadius: '10px', backgroundColor: '#f3e8ff', color: '#7e22ce', height: 'fit-content' }}>
              <ShoppingCart size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.25rem 0' }}>
                Agri Bazaar Produce & Demands
              </h3>
              <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: 0, lineHeight: 1.4 }}>
                Mandi produce listings (Kullu Delicious, American, Koushur apples, walnuts), required procurement demands, quantity, and pricing.
              </p>
            </div>
          </div>

          <button
            onClick={handleExportBazaar}
            disabled={downloadingSection === 'bazaar'}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.625rem 1rem',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#7e22ce',
              color: '#ffffff',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: downloadingSection === 'bazaar' ? 'wait' : 'pointer',
            }}
          >
            <Download size={16} />
            <span>{downloadingSection === 'bazaar' ? 'Generating CSV...' : 'Download Bazaar CSV'}</span>
          </button>
        </div>

      </div>

    </div>
  );
};
