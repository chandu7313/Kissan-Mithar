import React from 'react';

interface Props {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
}

export const StatCard: React.FC<Props> = ({
  title,
  value,
  subtitle,
  icon,
}) => {
  return (
    <div
      className="card card-hover"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem',
        gap: '0.5rem',
        borderRadius: '16px',
        textAlign: 'center',
      }}
    >
      {icon && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {icon}
        </div>
      )}

      <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1 }}>
        {value}
      </div>

      <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>
        {title}
      </div>

      {subtitle && (
        <div style={{ fontSize: '0.6875rem', color: '#16a34a', fontWeight: 600 }}>
          {subtitle}
        </div>
      )}
    </div>
  );
};
