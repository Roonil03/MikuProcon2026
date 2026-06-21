import React from 'react';
import { useStore } from '../store/useStore';
import { ASSETS } from '../constants/assets';

const WARM_GOLD = 'rgba(230, 199, 137, 1)';
const WARM_GOLD_HALF = 'rgba(230, 199, 137, 0.5)';
const WARM_GOLD_DIM = 'rgba(230, 199, 137, 0.4)';

export const PauseMenu = () => {
  const togglePause = useStore(state => state.togglePause);
  const score = useStore(state => state.score);
  const capturedLyrics = useStore(state => state.capturedLyrics);
  const language = useStore(state => state.language);

  const bodyFont = language === 'ja'
    ? '"Shizuru", system-ui'
    : '"Londrina Shadow", sans-serif';

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
      background: 'rgba(10,10,15,0.88)',
      backdropFilter: 'blur(12px)',
      color: 'white',
    }}>
      <div style={{
        textAlign: 'center',
        background: 'rgba(230,199,137,0.02)',
        border: '1px solid rgba(230,199,137,0.06)',
        padding: '44px 56px',
        minWidth: '340px',
        position: 'relative',
      }}>
        <div style={{
          position: 'absolute',
          top: '-1px', left: '30%', right: '30%',
          height: '1px',
          background: `linear-gradient(to right, transparent, ${WARM_GOLD}, transparent)`,
        }} />

        <div style={{
          width: '50px', height: '50px',
          border: `1.5px solid ${WARM_GOLD_DIM}`,
          borderRadius: '50%',
          margin: '0 auto 22px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <div style={{ display: 'flex', gap: '5px' }}>
            <div style={{ width: '4px', height: '16px', background: WARM_GOLD }} />
            <div style={{ width: '4px', height: '16px', background: WARM_GOLD }} />
          </div>
        </div>

        <h2 style={{
          fontFamily: '"Londrina Shadow", sans-serif',
          fontSize: '2rem',
          fontWeight: 400,
          letterSpacing: '6px',
          marginBottom: '6px',
          color: WARM_GOLD,
        }}>
          {language === 'ja' ? '\u4E00\u6642\u505C\u6B62' : 'Paused'}
        </h2>

        <div style={{
          margin: '24px 0',
          padding: '14px 0',
          borderTop: '1px solid rgba(230,199,137,0.06)',
          borderBottom: '1px solid rgba(230,199,137,0.06)',
          fontFamily: bodyFont,
          fontSize: language === 'ja' ? '0.85rem' : '1rem',
          color: '#888',
          letterSpacing: '1px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 20px' }}>
            <span>{language === 'ja' ? '\u30B9\u30B3\u30A2' : 'Score'}</span>
            <span style={{ color: WARM_GOLD, fontFamily: '"Orbitron", sans-serif', fontSize: '0.75rem' }}>{score}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 20px 0' }}>
            <span>{language === 'ja' ? '\u30AD\u30E3\u30D7\u30C1\u30E3' : 'Captured'}</span>
            <span style={{ color: WARM_GOLD, fontFamily: '"Orbitron", sans-serif', fontSize: '0.75rem' }}>{capturedLyrics.length}</span>
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
            fontFamily: language === 'ja' ? '"Shizuru", system-ui' : '"Londrina Shadow", sans-serif',
            fontSize: language === 'ja' ? '0.9rem' : '1.2rem',
            fontWeight: 400,
            background: 'transparent',
            color: WARM_GOLD,
            border: `1px solid ${WARM_GOLD_DIM}`,
            cursor: 'pointer',
            letterSpacing: '4px',
            transition: 'all 0.3s ease',
          }}
          onMouseOver={(e) => {
            e.target.style.background = 'rgba(230,199,137,0.1)';
            e.target.style.borderColor = WARM_GOLD;
            e.target.style.boxShadow = '0 0 20px rgba(230,199,137,0.1)';
          }}
          onMouseOut={(e) => {
            e.target.style.background = 'transparent';
            e.target.style.borderColor = WARM_GOLD_DIM;
            e.target.style.boxShadow = 'none';
          }}
        >
          {language === 'ja' ? '\u518D\u958B' : 'Resume'}
        </button>

        <div style={{
          marginTop: '16px',
          fontFamily: '"Orbitron", sans-serif',
          fontSize: '0.6rem',
          color: '#555',
          letterSpacing: '2px',
        }}>
          PRESS ESC TO TOGGLE
        </div>
      </div>
    </div>
  );
};
