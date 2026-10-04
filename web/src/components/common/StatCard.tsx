import React from 'react';

interface Props {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
}

export const StatCard: React.FC<Props> = ({
  title,
  value,
  icon,
}) => {
  return (
    <div className="card card-hover" style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.25rem',
      gap: '0.75rem',
      borderRadius: '16px'
    }}>
      {icon && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {icon}
        </div>
      )}

      <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1 }}>
        {value}
      </div>

      <div style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-muted)' }}>
        {title}
      </div>
    </div>
  );
};
