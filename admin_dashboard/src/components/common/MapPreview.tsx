import React from 'react';

interface Props {
  gps: {
    latitude: number;
    longitude: number;
    accuracy?: number;
    village?: string;
    district?: string;
    state?: string;
  };
}

export const MapPreview: React.FC<Props> = ({ gps }) => {
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${gps.latitude},${gps.longitude}`;

  return (
    <div
      style={{
        padding: '1rem',
        borderRadius: '0.5rem',
        backgroundColor: '#f8fafc',
        border: '1px solid var(--border-light)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.25rem' }}>📍</span>
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>
              {gps.village || 'Survey Land'}, {gps.district || ''}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Lat: {gps.latitude.toFixed(5)}°, Lng: {gps.longitude.toFixed(5)}°
              {gps.accuracy ? ` (±${gps.accuracy}m)` : ''}
            </div>
          </div>
        </div>

        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            color: 'var(--primary-700)',
            textDecoration: 'none',
            padding: '0.375rem 0.625rem',
            borderRadius: '0.375rem',
            backgroundColor: 'var(--primary-50)',
            border: '1px solid var(--primary-200)',
          }}
        >
          Open Google Maps ↗
        </a>
      </div>

      {/* Visual coordinates radar bar */}
      <div
        style={{
          padding: '0.5rem 0.75rem',
          borderRadius: '0.375rem',
          backgroundColor: '#0f172a',
          color: '#38bdf8',
          fontFamily: 'monospace',
          fontSize: '0.75rem',
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <span>GPS FIXED: {gps.latitude.toFixed(4)}N, {gps.longitude.toFixed(4)}E</span>
        <span style={{ color: '#4ade80' }}>● ONLINE</span>
      </div>
    </div>
  );
};
