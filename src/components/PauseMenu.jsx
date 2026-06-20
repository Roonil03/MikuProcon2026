import React from 'react';
import { useStore } from '../store/useStore';
import { ASSETS } from '../constants/assets';

export const PauseMenu = () => {
  const togglePause = useStore(state => state.togglePause);
  const score = useStore(state => state.score);
  const capturedLyrics = useStore(state => state.capturedLyrics);

  const playHover = () => {
    const audio = new Audio(ASSETS.SFX_HOVER);
    audio.play().catch(() => {});
  };

  const handleResume = () => {
    const audio = new Audio(ASSETS.SFX_CLICK);
    audio.play().catch(() => {});
    togglePause();
  };

  const btnStyle = {
    display: 'block',
    width: '220px',
    padding: '14px 0',
    margin: '8px auto',
    fontSize: '0.9rem',
    background: 'transparent',
    color: '#39FFDC',
    border: '1px solid rgba(57,255,220,0.4)',
    cursor: 'pointer',
    letterSpacing: '3px',
    textTransform: 'uppercase',
    transition: 'all 0.3s ease',
  };

  return (
    <div style={{
      position: 'absolute',
      top: 0, left: 0, width: '100%', height: '100%',
      zIndex: 150,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(8px)',
      fontFamily: '"Segoe UI", sans-serif',
      color: 'white',
    }}>
      <div style={{
        textAlign: 'center',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '4px',
        padding: '40px 50px',
        minWidth: '320px',
      }}>
        <div style={{
          width: '50px', height: '50px',
          border: '2px solid rgba(57,255,220,0.5)',
          borderRadius: '50%',
          margin: '0 auto 20px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
        }}>
          <div style={{
            width: '14px', height: '16px',
            display: 'flex',
            gap: '4px',
            alignItems: 'center',
          }}>
            <div style={{ width: '4px', height: '16px', background: '#39FFDC' }} />
            <div style={{ width: '4px', height: '16px', background: '#39FFDC' }} />
          </div>
        </div>

        <h2 style={{
          fontSize: '1.4rem',
          fontWeight: 200,
          letterSpacing: '6px',
          textTransform: 'uppercase',
          marginBottom: '6px',
          color: '#39FFDC',
        }}>
          Paused
        </h2>

        <div style={{
          margin: '20px 0',
          padding: '12px 0',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          fontSize: '0.8rem',
          color: '#888',
          letterSpacing: '1px',
        }}>
          <div>Score: {score}</div>
          <div style={{ marginTop: '4px' }}>Captured: {capturedLyrics.length} frames</div>
        </div>

        <button
          onClick={handleResume}
          onMouseEnter={playHover}
          style={btnStyle}
          onMouseOver={(e) => { e.target.style.background = '#39FFDC'; e.target.style.color = '#0a0a0a'; }}
          onMouseOut={(e) => { e.target.style.background = 'transparent'; e.target.style.color = '#39FFDC'; }}
        >
          Resume
        </button>
      </div>
    </div>
  );
};
