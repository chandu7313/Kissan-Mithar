import React, { useState } from 'react';
import { Camera, X } from 'lucide-react';

interface Props {
  photos?: Record<string, string | undefined> | string[];
  images?: string[];
}

export const ImageGallery: React.FC<Props> = ({ photos, images }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const angleLabels: Record<string, string> = {
    front: 'Front View',
    left: 'Left Boundary',
    right: 'Right Boundary',
    center: 'Center Soil View',
  };

  let photoEntries: [string, string][] = [];

  if (images && Array.isArray(images)) {
    photoEntries = images.filter(Boolean).map((url, idx) => [`Image ${idx + 1}`, url]);
  } else if (photos && Array.isArray(photos)) {
    photoEntries = photos.filter(Boolean).map((url, idx) => [`Image ${idx + 1}`, url]);
  } else if (photos && typeof photos === 'object') {
    photoEntries = Object.entries(photos).filter(([_, url]) => Boolean(url)) as [string, string][];
  }

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
        <span>No photos uploaded yet</span>
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
            onClick={() => setSelectedImage(url)}
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
              src={url}
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

      {/* Full Size Modal */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '2rem',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              maxWidth: '90vw',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <button
              onClick={() => setSelectedImage(null)}
              style={{
                position: 'absolute',
                top: '-2.5rem',
                right: 0,
                background: 'transparent',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                fontSize: '0.875rem',
              }}
            >
              <X size={20} />
              <span>Close</span>
            </button>
            <img
              src={selectedImage}
              alt="High-resolution view"
              style={{
                maxWidth: '100%',
                maxHeight: '85vh',
                objectFit: 'contain',
                borderRadius: '0.5rem',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
