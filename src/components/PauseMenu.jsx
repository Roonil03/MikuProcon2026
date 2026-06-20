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

  return (
    <div style={{
      position: 'absolute',
      top: 0, left: 0, width: '100%', height: '100%',
      zIndex: 150,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'rgba(0,0,0,0.88)',
      backdropFilter: 'blur(12px)',
      color: 'white',
    }}>
      <div style={{
        textAlign: 'center',
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.05)',
        padding: '44px 56px',
        minWidth: '340px',
        position: 'relative',
      }}>
        <div style={{
          position: 'absolute',
          top: '-1px', left: '30%', right: '30%',
          height: '1px',
          background: 'linear-gradient(to right, transparent, #39FFDC, transparent)',
        }} />

        <div style={{
          width: '50px', height: '50px',
          border: '1.5px solid rgba(57,255,220,0.4)',
          borderRadius: '50%',
          margin: '0 auto 22px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <div style={{ display: 'flex', gap: '5px' }}>
            <div style={{ width: '4px', height: '16px', background: '#39FFDC' }} />
            <div style={{ width: '4px', height: '16px', background: '#39FFDC' }} />
          </div>
        </div>

        <h2 style={{
          fontFamily: '"Orbitron", sans-serif',
          fontSize: '1.3rem',
          fontWeight: 500,
          letterSpacing: '8px',
          textTransform: 'uppercase',
          marginBottom: '6px',
          color: '#39FFDC',
        }}>
          Paused
        </h2>

        <div style={{
          margin: '24px 0',
          padding: '14px 0',
          borderTop: '1px solid rgba(255,255,255,0.04)',
          borderBottom: '1px solid rgba(255,255,255,0.04)',
          fontFamily: '"M PLUS 1p", sans-serif',
          fontSize: '0.8rem',
          color: '#777',
          letterSpacing: '1px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 20px' }}>
            <span>Score</span>
            <span style={{ color: '#39FFDC', fontFamily: '"Orbitron", sans-serif', fontSize: '0.75rem' }}>{score}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 20px 0' }}>
            <span>Captured</span>
            <span style={{ color: '#39FFDC', fontFamily: '"Orbitron", sans-serif', fontSize: '0.75rem' }}>{capturedLyrics.length}</span>
          </div>
        </div>

        <button
          onClick={handleResume}
          onMouseEnter={playHover}
          style={{
            display: 'block',
            width: '200px',
            padding: '13px 0',
            margin: '0 auto',
            fontFamily: '"Orbitron", sans-serif',
            fontSize: '0.8rem',
            fontWeight: 500,
            background: 'transparent',
            color: '#39FFDC',
            border: '1px solid rgba(57,255,220,0.4)',
            cursor: 'pointer',
            letterSpacing: '4px',
            textTransform: 'uppercase',
            transition: 'all 0.3s ease',
          }}
          onMouseOver={(e) => {
            e.target.style.background = 'rgba(57,255,220,0.1)';
            e.target.style.borderColor = '#39FFDC';
            e.target.style.boxShadow = '0 0 20px rgba(57,255,220,0.1)';
          }}
          onMouseOut={(e) => {
            e.target.style.background = 'transparent';
            e.target.style.borderColor = 'rgba(57,255,220,0.4)';
            e.target.style.boxShadow = 'none';
          }}
        >
          Resume
        </button>

        <div style={{
          marginTop: '16px',
          fontFamily: '"M PLUS 1p", sans-serif',
          fontSize: '0.6rem',
          color: '#444',
          letterSpacing: '2px',
        }}>
          PRESS ESC TO TOGGLE
        </div>
      </div>
    </div>
  );
};
