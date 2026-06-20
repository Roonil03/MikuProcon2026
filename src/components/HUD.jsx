import React from 'react';
import { useStore } from '../store/useStore';
import { ASSETS } from '../constants/assets';

export const HUD = () => {
  const { appStatus, score, capturedLyrics } = useStore();

  const handleStart = () => {
    const player = useStore.getState().player;
    if (player && appStatus === 'ready') {
      player.requestPlay();
    }
  };

  const playHoverSound = () => {
    const audio = new Audio(ASSETS.SFX_HOVER);
    audio.play().catch(() => {});
  };

  return (
    <div style={{
      position: 'absolute',
      top: 0, left: 0, width: '100%', height: '100%',
      zIndex: 10,
      pointerEvents: 'none',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      color: 'white',
      fontFamily: 'sans-serif'
    }}>
      <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between' }}>
        <h2 style={{ margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>SCORE: {score}</h2>
      </div>

      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{
          width: '100px', height: '100px',
          border: '2px solid rgba(255, 255, 255, 0.5)',
          borderRadius: '50%',
          position: 'relative'
        }}>
          <div style={{ position: 'absolute', top: '50%', left: '40%', right: '40%', height: '2px', background: 'white' }} />
          <div style={{ position: 'absolute', left: '50%', top: '40%', bottom: '40%', width: '2px', background: 'white' }} />
        </div>
      </div>

      {appStatus !== 'playing' && appStatus !== 'results' && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          pointerEvents: 'auto'
        }}>
          <button 
            onClick={handleStart}
            onMouseEnter={playHoverSound}
            disabled={appStatus === 'loading'}
            style={{
              padding: '15px 30px',
              fontSize: '1.2rem',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              border: '1px solid white',
              cursor: appStatus === 'ready' ? 'pointer' : 'not-allowed',
              backdropFilter: 'blur(4px)',
              transition: 'background 0.3s'
            }}
          >
            {appStatus === 'loading' ? 'Loading Track...' : 'START'}
          </button>
        </div>
      )}

      <div style={{
        padding: '20px',
        display: 'flex',
        gap: '10px',
        overflowX: 'auto',
        background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
        alignItems: 'center'
      }}>
        {capturedLyrics.map(lyric => (
          <div key={lyric.id} style={{
            minWidth: '60px', height: '40px',
            background: `url(${ASSETS.GALLERY_FRAME})`,
            backgroundSize: 'cover',
            border: '1px solid #fff',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: '0.8rem',
            color: 'black',
            fontWeight: 'bold',
            backgroundColor: 'rgba(255,255,255,0.8)'
          }}>
            {lyric.text}
          </div>
        ))}
        {capturedLyrics.length === 0 && (
          <div style={{ color: 'rgba(255,255,255,0.5)', fontStyle: 'italic' }}>
            Capture lyrics to fill the gallery...
          </div>
        )}
      </div>
    </div>
  );
};
