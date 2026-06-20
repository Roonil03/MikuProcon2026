import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { ASSETS } from '../constants/assets';

export const IntroScreen = () => {
  const [isExiting, setIsExiting] = useState(false);

  const handleBegin = () => {
    setIsExiting(true);
    const audio = new Audio(ASSETS.SFX_CLICK);
    audio.play().catch(() => {});
    setTimeout(() => {
      useStore.getState().setAppStatus('loading');
    }, 600);
  };

  const playHover = () => {
    const audio = new Audio(ASSETS.SFX_HOVER);
    audio.play().catch(() => {});
  };

  return (
    <div style={{
      position: 'absolute',
      top: 0, left: 0, width: '100%', height: '100%',
      zIndex: 200,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'radial-gradient(ellipse at center, #0d1b2a 0%, #000 80%)',
      color: 'white',
      fontFamily: '"Segoe UI", sans-serif',
      opacity: isExiting ? 0 : 1,
      transition: 'opacity 0.6s ease-out',
    }}>
      <div style={{
        position: 'absolute',
        top: 0, left: 0, width: '100%', height: '100%',
        backgroundImage: `url(${ASSETS.BACKGROUND})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        opacity: 0.08,
        pointerEvents: 'none',
      }} />

      <div style={{
        position: 'relative',
        zIndex: 1,
        textAlign: 'center',
        maxWidth: '600px',
        padding: '40px',
      }}>
        <div style={{
          width: '80px', height: '80px',
          border: '2px solid rgba(57,255,220,0.6)',
          borderRadius: '50%',
          margin: '0 auto 30px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          animation: 'pulse-ring 2s ease-in-out infinite',
        }}>
          <div style={{ position: 'absolute', top: '50%', left: '35%', right: '35%', height: '2px', background: '#39FFDC' }} />
          <div style={{ position: 'absolute', left: '50%', top: '35%', bottom: '35%', width: '2px', background: '#39FFDC' }} />
        </div>

        <h1 style={{
          fontSize: '2.4rem',
          fontWeight: 200,
          letterSpacing: '8px',
          textTransform: 'uppercase',
          marginBottom: '8px',
          color: '#39FFDC',
        }}>
          Shutter Chance
        </h1>
        <p style={{
          fontSize: '0.85rem',
          color: '#556',
          letterSpacing: '4px',
          textTransform: 'uppercase',
          marginBottom: '40px',
        }}>
          Parallax Archive
        </p>

        <div style={{
          textAlign: 'left',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '4px',
          padding: '24px',
          marginBottom: '30px',
          lineHeight: '1.8',
          fontSize: '0.9rem',
          color: '#bbb',
        }}>
          <div style={{ color: '#39FFDC', fontWeight: 600, marginBottom: '12px', letterSpacing: '2px', fontSize: '0.75rem', textTransform: 'uppercase' }}>
            How To Play
          </div>
          <p style={{ margin: '0 0 10px 0' }}>
            Lyrics will fly towards your viewfinder as the song plays. Move your cursor (or tilt your device) to aim the crosshair.
          </p>
          <p style={{ margin: '0 0 10px 0' }}>
            Click or tap exactly when a lyric aligns with the center of the viewfinder to capture it. Timing precision determines your score.
          </p>
          <p style={{ margin: 0 }}>
            Your captured lyrics are archived as polaroid frames at the end. Press Escape at any time to pause.
          </p>
        </div>

        <button
          onClick={handleBegin}
          onMouseEnter={playHover}
          style={{
            padding: '14px 48px',
            fontSize: '1rem',
            background: 'transparent',
            color: '#39FFDC',
            border: '1px solid #39FFDC',
            cursor: 'pointer',
            letterSpacing: '4px',
            textTransform: 'uppercase',
            transition: 'all 0.3s ease',
          }}
          onMouseOver={(e) => { e.target.style.background = '#39FFDC'; e.target.style.color = '#0a0a0a'; }}
          onMouseOut={(e) => { e.target.style.background = 'transparent'; e.target.style.color = '#39FFDC'; }}
        >
          Begin
        </button>
      </div>

      <style>{`
        @keyframes pulse-ring {
          0%, 100% { box-shadow: 0 0 0 0 rgba(57,255,220,0.3); }
          50% { box-shadow: 0 0 0 12px rgba(57,255,220,0); }
        }
      `}</style>
    </div>
  );
};
