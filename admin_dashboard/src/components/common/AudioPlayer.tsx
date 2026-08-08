import React, { useState, useRef } from 'react';

interface Props {
  url?: string;
  title?: string;
}

export const AudioPlayer: React.FC<Props> = ({ url, title = 'Farmer Voice Note' }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  if (!url) {
    return (
      <div
        style={{
          padding: '0.75rem',
          borderRadius: '0.5rem',
          backgroundColor: '#f8fafc',
          border: '1px dashed #cbd5e1',
          fontSize: '0.8125rem',
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}
      >
        <span>🎙️</span> No voice recording attached for this survey
      </div>
    );
  }

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const curr = audioRef.current.currentTime;
    const dur = audioRef.current.duration || 1;
    setProgress((curr / dur) * 100);
  };

  return (
    <div
      style={{
        padding: '0.875rem 1rem',
        borderRadius: '0.5rem',
        backgroundColor: '#f0fdf4',
        border: '1px solid #bbf7d0',
        display: 'flex',
        alignItems: 'center',
        gap: '0.875rem',
      }}
    >
      <audio
        ref={audioRef}
        src={url}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => {
          setIsPlaying(false);
          setProgress(0);
        }}
      />
      <button
        onClick={togglePlay}
        style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          backgroundColor: 'var(--primary-700)',
          color: 'white',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          fontSize: '0.875rem',
          flexShrink: 0,
        }}
      >
        {isPlaying ? '⏸' : '▶'}
      </button>

      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--primary-900)' }}>
          {title}
        </div>
        {/* Progress Track */}
        <div
          style={{
            height: '4px',
            width: '100%',
            backgroundColor: '#dcfce7',
            borderRadius: '2px',
            marginTop: '0.375rem',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${progress}%`,
              backgroundColor: 'var(--primary-600)',
              transition: 'width 0.1s linear',
            }}
          />
        </div>
      </div>

      <span style={{ fontSize: '0.75rem', color: 'var(--primary-800)', fontWeight: 500 }}>
        {isPlaying ? 'Playing...' : 'Audio note'}
      </span>
    </div>
  );
};
