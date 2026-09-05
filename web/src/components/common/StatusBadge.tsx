import React from 'react';
import { OrchardStatus } from '../../types/index.js';

interface Props {
  status: OrchardStatus;
}

export const StatusBadge: React.FC<Props> = ({ status }) => {
  const getStyle = () => {
    switch (status) {
      case 'SUBMITTED':
        return {
          bg: '#fef3c7',
          color: '#b45309',
          border: '#fde68a',
          label: 'Submitted',
        };
      case 'UNDER_REVIEW':
        return {
          bg: '#e0f2fe',
          color: '#0369a1',
          border: '#bae6fd',
          label: 'Under Review',
        };
      case 'EXPERT_ASSIGNED':
        return {
          bg: '#f3e8ff',
          color: '#7e22ce',
          border: '#e9d5ff',
          label: 'Expert Assigned',
        };
      case 'PLAN_READY':
        return {
          bg: '#dcfce7',
          color: '#15803d',
          border: '#bbf7d0',
          label: 'Plan Ready',
        };
      case 'COMPLETED':
        return {
          bg: '#f1f5f9',
          color: '#475569',
          border: '#e2e8f0',
          label: 'Completed',
        };
      default:
        return {
          bg: '#f1f5f9',
          color: '#475569',
          border: '#e2e8f0',
          label: status,
        };
    }
  };

  const style = getStyle();

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.375rem',
        padding: '0.25rem 0.625rem',
        borderRadius: '9999px',
        fontSize: '0.75rem',
        fontWeight: 600,
        backgroundColor: style.bg,
        color: style.color,
        border: `1px solid ${style.border}`,
        textTransform: 'uppercase',
        letterSpacing: '0.025em',
      }}
    >
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: style.color,
        }}
      />
      {style.label}
    </span>
  );
};
