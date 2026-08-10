import React, { useState } from 'react';
import { Camera, X } from 'lucide-react';

interface Props {
  photos: {
    front?: string;
    left?: string;
    right?: string;
    center?: string;
  };
}

export const ImageGallery: React.FC<Props> = ({ photos }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const angleLabels: Record<string, string> = {
    front: 'Front View',
    left: 'Left Boundary',
    right: 'Right Boundary',
    center: 'Center Soil View',
  };

  const photoEntries = Object.entries(photos).filter(([_, url]) => Boolean(url));

  if (photoEntries.length === 0) {
    return (
      <div
        style={{
          padding: '2rem',
          textAlign: 'center',
          backgroundColor: '#f8fafc',
          borderRadius: '0.5rem',
          border: '1px dashed #cbd5e1',
          color: 'var(--text-muted)',
          fontSize: '0.875rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
        }}
      >
        <Camera size={18} />
        <span>No land survey photos uploaded yet</span>
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: '1rem',
        }}
      >
        {photoEntries.map(([angle, url]) => (
          <div
            key={angle}
            onClick={() => setSelectedImage(url as string)}
            style={{
              position: 'relative',
              borderRadius: '0.5rem',
              overflow: 'hidden',
              border: '1px solid var(--border-light)',
              cursor: 'pointer',
              aspectRatio: '4 / 3',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <img
              src={url as string}
              alt={angle}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transition: 'transform 0.2s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1.0)')}
            />
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                padding: '0.375rem 0.5rem',
                backgroundColor: 'rgba(15, 23, 42, 0.75)',
                color: 'white',
                fontSize: '0.6875rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                backdropFilter: 'blur(4px)',
              }}
            >
              {angleLabels[angle] || angle}
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Zoom Modal */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            cursor: 'zoom-out',
          }}
        >
          <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}>
            <img
              src={selectedImage}
              alt="Zoomed Land Survey"
              style={{
                maxWidth: '100%',
                maxHeight: '85vh',
                borderRadius: '0.5rem',
                boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)',
              }}
            />
            <button
              onClick={() => setSelectedImage(null)}
              style={{
                position: 'absolute',
                top: '-12px',
                right: '-12px',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'white',
                border: 'none',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
