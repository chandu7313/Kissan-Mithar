import React from 'react';
import { Search, X, RotateCw, Filter } from 'lucide-react';

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterSelect {
  key: string;
  label: string;
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
}

interface Props {
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
  searchPlaceholder?: string;
  filters?: FilterSelect[];
  onReset?: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  extraActions?: React.ReactNode;
}

export const FilterBar: React.FC<Props> = ({
  searchQuery,
  onSearchChange,
  searchPlaceholder = 'Search records...',
  filters = [],
  onReset,
  onRefresh,
  isRefreshing = false,
  extraActions,
}) => {
  const hasActiveFilters = Boolean(
    (searchQuery && searchQuery.trim().length > 0) ||
    filters.some((f) => f.value && f.value !== '' && f.value !== 'ALL')
  );

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.75rem',
        padding: '1rem',
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
      }}
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '280px' }}>
        {/* Search Input */}
        {onSearchChange && (
          <div
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              minWidth: '220px',
              flex: '1 1 240px',
              maxWidth: '400px',
            }}
          >
            <Search
              size={18}
              style={{
                position: 'absolute',
                left: '0.75rem',
                color: '#94a3b8',
                pointerEvents: 'none',
              }}
            />
            <input
              type="text"
              value={searchQuery || ''}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              style={{
                width: '100%',
                padding: '0.5rem 2rem 0.5rem 2.25rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.875rem',
                color: '#1e293b',
                outline: 'none',
                backgroundColor: '#f8fafc',
                transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#16a34a';
                e.target.style.boxShadow = '0 0 0 3px rgba(22, 163, 74, 0.15)';
                e.target.style.backgroundColor = '#ffffff';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#cbd5e1';
                e.target.style.boxShadow = 'none';
                e.target.style.backgroundColor = '#f8fafc';
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                style={{
                  position: 'absolute',
                  right: '0.5rem',
                  border: 'none',
                  background: 'transparent',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>
        )}

        {/* Dropdown Filters */}
        {filters.map((filter) => (
          <div key={filter.key} style={{ display: 'flex', alignItems: 'center' }}>
            <select
              value={filter.value}
              onChange={(e) => filter.onChange(e.target.value)}
              style={{
                padding: '0.5rem 0.75rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.875rem',
                color: filter.value && filter.value !== 'ALL' ? '#0f172a' : '#64748b',
                backgroundColor: filter.value && filter.value !== 'ALL' ? '#f0fdf4' : '#ffffff',
                fontWeight: filter.value && filter.value !== 'ALL' ? 600 : 400,
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              {filter.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        ))}

        {/* Reset Filters Button */}
        {hasActiveFilters && onReset && (
          <button
            type="button"
            onClick={onReset}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              padding: '0.45rem 0.75rem',
              borderRadius: '8px',
              border: '1px dashed #cbd5e1',
              backgroundColor: '#ffffff',
              color: '#64748b',
              fontSize: '0.8125rem',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            <Filter size={14} />
            <span>Clear</span>
          </button>
        )}

        {/* Refresh Button */}
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            title="Refresh records"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.5rem',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              backgroundColor: '#ffffff',
              color: '#64748b',
              cursor: isRefreshing ? 'wait' : 'pointer',
            }}
          >
            <RotateCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
          </button>
        )}
      </div>

      {/* Extra Action Buttons (e.g. Export, Create) */}
      {extraActions && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {extraActions}
        </div>
      )}
    </div>
  );
};
