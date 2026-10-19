import React, { useState, useEffect } from 'react';
import {
  Tractor,
  Users,
  Calendar,
  IndianRupee,
  MapPin,
  Eye,
  CheckCircle,
  Clock,
  Briefcase,
  AlertCircle,
  Phone,
} from 'lucide-react';
import { ServiceOperationsApi, LabourRequestItem } from '../../api/serviceOperations.api.js';
import { DataTable, Column } from '../../components/common/DataTable.js';
import { FilterBar } from '../../components/common/FilterBar.js';
import { Pagination } from '../../components/common/Pagination.js';
import { Drawer } from '../../components/common/Drawer.js';
import { ConfirmationModal } from '../../components/common/ConfirmationModal.js';

export const LabourAdminPage: React.FC = () => {
  const [list, setList] = useState<LabourRequestItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [status, setStatus] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [selectedItem, setSelectedItem] = useState<LabourRequestItem | null>(null);
  const [statusModalOpen, setStatusModalOpen] = useState<boolean>(false);
  const [targetStatus, setTargetStatus] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  const fetchLabour = () => {
    setIsLoading(true);
    ServiceOperationsApi.listLabour({
      page,
      limit,
      status: status !== 'ALL' ? status : undefined,
      search: search.trim() || undefined,
    })
      .then((res) => {
        setList(res.data);
        setTotal(res.total);
      })
      .catch((err) => console.error('[LabourAdminPage] Failed to fetch labour requests:', err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchLabour();
  }, [page, limit, status]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setPage(1);
      fetchLabour();
    }, 350);
    return () => clearTimeout(handler);
  }, [search]);

  const handleStatusUpdateConfirm = async () => {
    if (!selectedItem || !targetStatus) return;
    setIsUpdating(true);
    try {
      const updated = await ServiceOperationsApi.updateLabourStatus(selectedItem.id, targetStatus as any);
      setSelectedItem({ ...selectedItem, status: updated.status });
      fetchLabour();
      setStatusModalOpen(false);
    } catch (err) {
      console.error('[LabourAdminPage] Failed to update labour status:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const columns: Column<LabourRequestItem>[] = [
    {
      key: 'farmer',
      header: 'Farmer & Location',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600, color: '#0f172a' }}>{row.farmer.name}</div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
            {row.farmer.phoneNumber} • {row.farmer.village || 'Kashmir Valley'}
          </div>
        </div>
      ),
    },
    {
      key: 'task',
      header: 'Task & Crew Required',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600, color: '#0f172a' }}>{row.taskType}</div>
          <div style={{ fontSize: '0.75rem', color: '#166534', fontWeight: 600 }}>
            {row.labourersRequired} Workers • {row.durationDays ? `${row.durationDays} Days` : 'Single Day'}
          </div>
        </div>
      ),
    },
    {
      key: 'wage',
      header: 'Daily Wage Offered',
      render: (row) => (
        <div style={{ fontSize: '0.8125rem' }}>
          <div style={{ fontWeight: 700, color: '#0f172a' }}>
            {row.dailyWage ? `₹${row.dailyWage.toLocaleString()} / day` : 'Market standard'}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
            Start: {row.preferredStartDate ? new Date(row.preferredStartDate).toLocaleDateString() : 'Immediate'}
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <span
          style={{
            padding: '0.2rem 0.6rem',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: 700,
            backgroundColor:
              row.status === 'COMPLETED'
                ? '#dcfce7'
                : row.status === 'SUBMITTED'
                ? '#fef3c7'
                : '#eff6ff',
            color:
              row.status === 'COMPLETED'
                ? '#15803d'
                : row.status === 'SUBMITTED'
                ? '#b45309'
                : '#1d4ed8',
          }}
        >
          {row.status}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Action',
      render: (row) => (
        <button
          onClick={() => setSelectedItem(row)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.375rem',
            padding: '0.375rem 0.75rem',
            borderRadius: '8px',
            border: '1px solid #cbd5e1',
            backgroundColor: '#ffffff',
            color: '#166534',
            fontSize: '0.8125rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <Eye size={14} />
          <span>Details</span>
        </button>
      ),
    },
  ];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Title */}
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem 0' }}>
          Labour & Farm Mechanization Desk
        </h1>
        <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>
          Manage agricultural labour requests, crew allocations, seasonal harvesting contracts, and tractor machinery logistics.
        </p>
      </div>

      {/* Filter Bar */}
      <FilterBar
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search labour requests by farmer name, phone, or task..."
        filters={[
          {
            key: 'status',
            label: 'Status',
            value: status,
            options: [
              { label: 'All Statuses', value: 'ALL' },
              { label: 'Submitted (New)', value: 'SUBMITTED' },
              { label: 'Under Review', value: 'UNDER_REVIEW' },
              { label: 'Approved', value: 'APPROVED' },
              { label: 'Labourers Assigned', value: 'LABOURERS_ASSIGNED' },
              { label: 'In Progress', value: 'IN_PROGRESS' },
              { label: 'Completed', value: 'COMPLETED' },
              { label: 'Cancelled', value: 'CANCELLED' },
            ],
            onChange: (v) => {
              setStatus(v);
              setPage(1);
            },
          },
        ]}
        onReset={() => {
          setSearch('');
          setStatus('ALL');
        }}
        onRefresh={fetchLabour}
        isRefreshing={isLoading}
      />

      {/* Main Table */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <DataTable
          columns={columns}
          data={list}
          isLoading={isLoading}
          keyExtractor={(r) => r.id}
          emptyMessage="No labour or equipment requests found matching criteria."
        />
        <Pagination
          currentPage={page}
          totalItems={total}
          pageSize={limit}
          onPageChange={setPage}
          onPageSizeChange={(newLimit) => {
            setLimit(newLimit);
            setPage(1);
          }}
        />
      </div>

      {/* Detail Drawer */}
      <Drawer
        isOpen={Boolean(selectedItem)}
        onClose={() => setSelectedItem(null)}
        title={selectedItem ? `Labour Booking: ${selectedItem.taskType}` : ''}
        subtitle={selectedItem ? `Farmer: ${selectedItem.farmer.name} (${selectedItem.farmer.phoneNumber})` : undefined}
        width="540px"
        footer={
          selectedItem && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>Status:</span>
                <select
                  value={selectedItem.status}
                  onChange={(e) => {
                    setTargetStatus(e.target.value);
                    setStatusModalOpen(true);
                  }}
                  style={{
                    padding: '0.4rem 0.6rem',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                  }}
                >
                  <option value="SUBMITTED">Submitted</option>
                  <option value="UNDER_REVIEW">Under Review</option>
                  <option value="APPROVED">Approved</option>
                  <option value="LABOURERS_ASSIGNED">Labourers Assigned</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

              <button
                onClick={() => setSelectedItem(null)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  color: '#475569',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>
          )
        }
      >
        {selectedItem && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ padding: '1rem', borderRadius: '10px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.8125rem' }}>
                <div>
                  <span style={{ color: '#64748b' }}>Required Workers:</span>
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}>{selectedItem.labourersRequired} Persons</div>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Daily Wage Rate:</span>
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: '#16a34a' }}>
                    {selectedItem.dailyWage ? `₹${selectedItem.dailyWage} / Day` : 'Negotiable'}
                  </div>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Start Date:</span>
                  <div style={{ fontWeight: 600, color: '#0f172a' }}>
                    {selectedItem.preferredStartDate ? new Date(selectedItem.preferredStartDate).toLocaleDateString() : 'Immediate'}
                  </div>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Duration:</span>
                  <div style={{ fontWeight: 600, color: '#0f172a' }}>{selectedItem.durationDays ? `${selectedItem.durationDays} Days` : 'Single Day'}</div>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Transport Provided:</span>
                  <div style={{ fontWeight: 600, color: '#0f172a' }}>{selectedItem.transportProvided ? 'Yes' : 'No'}</div>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Meals Provided:</span>
                  <div style={{ fontWeight: 600, color: '#0f172a' }}>{selectedItem.mealsProvided ? 'Yes' : 'No'}</div>
                </div>
              </div>
            </div>

            {selectedItem.specialRequirements && (
              <div>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.5rem 0' }}>
                  Special Requirements
                </h4>
                <div style={{ padding: '0.75rem', borderRadius: '8px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}>
                  {selectedItem.specialRequirements}
                </div>
              </div>
            )}
          </div>
        )}
      </Drawer>

      <ConfirmationModal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        onConfirm={handleStatusUpdateConfirm}
        title="Update Labour Booking Status"
        message={`Are you sure you want to change this booking status to "${targetStatus}"?`}
        confirmText="Confirm Update"
        isLoading={isUpdating}
      />

    </div>
  );
};
