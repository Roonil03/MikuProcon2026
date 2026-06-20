import React, { useRef, useCallback } from 'react';
import html2canvas from 'html2canvas';
import { useStore } from '../store/useStore';

const PolaroidCard = ({ lyric, index }) => {
  return (
    <div style={{
      display: 'inline-block',
      background: '#fdfdfd',
      padding: '12px 12px 40px 12px',
      boxShadow: '0 4px 16px rgba(0,0,0,0.35)',
      transform: `rotate(${(index % 2 === 0 ? -1 : 1) * (2 + Math.random() * 4)}deg)`,
      margin: '10px',
      minWidth: '120px',
      textAlign: 'center',
      transition: 'transform 0.3s ease',
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        padding: '20px',
        minHeight: '80px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'radial-gradient(circle at center, rgba(57,255,220,0.15) 0%, transparent 70%)',
        }} />
        <span style={{
          fontSize: '1.8rem',
          fontWeight: 700,
          fontFamily: '"Zen Kaku Gothic New", sans-serif',
          color: '#39FFDC',
          textShadow: '0 0 12px rgba(57,255,220,0.6)',
          letterSpacing: '2px',
          position: 'relative',
          zIndex: 1,
        }}>
          {lyric.text}
        </span>
      </div>
      <div style={{
        marginTop: '8px',
        fontFamily: '"Orbitron", monospace',
        fontSize: '0.7rem',
        color: '#888',
        textAlign: 'left',
      }}>
        SHUTTER CHANCE / {String(Math.floor(lyric.startTime / 60000)).padStart(2, '0')}:{String(Math.floor((lyric.startTime % 60000) / 1000)).padStart(2, '0')}
      </div>
    </div>
  );
};

export const ResultGallery = () => {
  const galleryRef = useRef(null);
  const { capturedLyrics, score } = useStore();

  const handleDownload = useCallback(async () => {
    if (!galleryRef.current) return;
    try {
      const canvas = await html2canvas(galleryRef.current, {
        backgroundColor: '#0a0a0a',
        scale: 2,
      });
      const link = document.createElement('a');
      link.download = 'shutter-chance-archive.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      // Silent fallback
    }
  }, []);

  if (capturedLyrics.length === 0) {
    return (
      <div style={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
        zIndex: 100,
        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
        background: 'rgba(0,0,0,0.95)',
        color: '#aaa',
        fontFamily: '"M PLUS 1p", sans-serif',
      }}>
        <h2 style={{ marginBottom: '10px', color: '#fff', fontFamily: '"Orbitron", sans-serif' }}>No Captures</h2>
        <p>No lyrics were captured during this session.</p>
      </div>
    );
  }

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
      zIndex: 100,
      display: 'flex', flexDirection: 'column',
      background: 'rgba(5,5,5,0.97)',
      color: 'white',
      fontFamily: '"M PLUS 1p", sans-serif',
      overflow: 'auto',
    }}>
      <div style={{
        textAlign: 'center',
        padding: '30px 20px 10px',
      }}>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: 600,
          fontFamily: '"Orbitron", sans-serif',
          letterSpacing: '6px',
          textTransform: 'uppercase',
          marginBottom: '8px',
          color: '#39FFDC',
        }}>
          Parallax Archive
        </h1>
        <p style={{ color: '#888', fontSize: '0.9rem', fontFamily: '"M PLUS 1p", sans-serif' }}>
          Final Score: {score} | Captured: {capturedLyrics.length} frames
        </p>
      </div>

      <div
        ref={galleryRef}
        style={{
          flex: 1,
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'flex-start',
          padding: '20px',
          gap: '6px',
          backgroundColor: '#0a0a0a',
        }}
      >
        {capturedLyrics.map((lyric, i) => (
          <PolaroidCard key={lyric.id} lyric={lyric} index={i} />
        ))}
      </div>

      <div style={{
        textAlign: 'center',
        padding: '20px',
      }}>
        <button
          onClick={handleDownload}
          style={{
            padding: '14px 36px',
            fontSize: '0.85rem',
            fontFamily: '"Orbitron", sans-serif',
            fontWeight: 500,
            background: 'transparent',
            color: '#39FFDC',
            border: '1px solid #39FFDC',
            cursor: 'pointer',
            letterSpacing: '3px',
            textTransform: 'uppercase',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.target.style.background = '#39FFDC';
            e.target.style.color = '#0a0a0a';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'transparent';
            e.target.style.color = '#39FFDC';
          }}
        >
          Download Archive
        </button>
      </div>
    </div>
  );
};
