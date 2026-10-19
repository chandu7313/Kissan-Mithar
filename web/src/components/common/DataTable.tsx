import React from 'react';
import { ChevronDown, ChevronUp, AlertCircle, Inbox } from 'lucide-react';

export interface Column<T> {
  key?: string;
  header: string;
  accessor?: keyof T;
  render?: (row: T) => React.ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
}

interface Props<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  loading?: boolean;
  isLoading?: boolean;
  emptyMessage?: string;
  emptySubtext?: string;
  onRowClick?: (item: T) => void;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (field: string) => void;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  loading = false,
  isLoading = false,
  emptyMessage = 'No records found',
  emptySubtext = 'Try adjusting your search or active filters.',
  onRowClick,
  sortBy,
  sortOrder,
  onSort,
}: Props<T>) {
  const isBusy = loading || isLoading;
  if (isBusy) {
    return (
      <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid var(--border-light)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8faf8', borderBottom: '1px solid var(--border-light)' }}>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  style={{
                    padding: '0.875rem 1rem',
                    textAlign: col.align || 'left',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: 'var(--text-muted)',
                    width: col.width,
                  }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, rIdx) => (
              <tr key={rIdx} style={{ borderBottom: '1px solid #f1f5f1' }}>
                {columns.map((_, cIdx) => (
                  <td key={cIdx} style={{ padding: '1rem' }}>
                    <div
                      style={{
                        height: '14px',
                        background: 'linear-gradient(90deg, #f1f5f1 25%, #e6ece6 50%, #f1f5f1 75%)',
                        backgroundSize: '200% 100%',
                        borderRadius: '4px',
                        width: cIdx === 0 ? '60%' : '80%',
                        animation: 'pulse 1.5s infinite ease-in-out',
                      }}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div
        style={{
          background: '#fff',
          borderRadius: '12px',
          border: '1px solid var(--border-light)',
          padding: '3.5rem 2rem',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.75rem',
        }}
      >
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: '#f0fdf4',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#16a34a',
          }}
        >
          <Inbox size={24} />
        </div>
        <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-main)' }}>{emptyMessage}</div>
        <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', maxWidth: '360px' }}>{emptySubtext}</div>
      </div>
    );
  }

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: '12px',
        border: '1px solid var(--border-light)',
        boxShadow: 'var(--shadow-xs)',
        overflow: 'hidden',
      }}
    >
      <div style={{ overflowX: 'auto', width: '100%' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f8faf8', borderBottom: '1px solid var(--border-light)' }}>
              {columns.map((col, idx) => {
                const isCurrentSort = col.accessor && sortBy === col.accessor;
                return (
                  <th
                    key={idx}
                    onClick={() => col.sortable && col.accessor && onSort && onSort(col.accessor as string)}
                    style={{
                      padding: '0.875rem 1rem',
                      textAlign: col.align || 'left',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      color: isCurrentSort ? '#166534' : 'var(--text-muted)',
                      width: col.width,
                      cursor: col.sortable ? 'pointer' : 'default',
                      userSelect: 'none',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: col.align === 'right' ? 'flex-end' : col.align === 'center' ? 'center' : 'flex-start',
                        gap: '0.375rem',
                      }}
                    >
                      <span>{col.header}</span>
                      {col.sortable && col.accessor && (
                        <span style={{ display: 'inline-flex', opacity: isCurrentSort ? 1 : 0.3 }}>
                          {isCurrentSort && sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {data.map((row) => {
              const key = keyExtractor(row);
              return (
                <tr
                  key={key}
                  onClick={() => onRowClick && onRowClick(row)}
                  style={{
                    borderBottom: '1px solid #f1f5f1',
                    cursor: onRowClick ? 'pointer' : 'default',
                    transition: 'background-color 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (onRowClick) e.currentTarget.style.backgroundColor = '#f9fbf9';
                  }}
                  onMouseLeave={(e) => {
                    if (onRowClick) e.currentTarget.style.backgroundColor = '#fff';
                  }}
                >
                  {columns.map((col, colIdx) => (
                    <td
                      key={colIdx}
                      style={{
                        padding: '0.875rem 1rem',
                        fontSize: '0.875rem',
                        color: 'var(--text-main)',
                        textAlign: col.align || 'left',
                        verticalAlign: 'middle',
                      }}
                    >
                      {col.render
                        ? col.render(row)
                        : col.accessor
                        ? (row[col.accessor] as any) ?? '-'
                        : '-'}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
