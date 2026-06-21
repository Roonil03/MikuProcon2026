import React, { useEffect, useRef, useState } from 'react';
import { useStore, MAX_GALLERY_DISPLAY } from '../store/useStore';
import { ASSETS } from '../constants/assets';
import { xrStore } from './Scene';

const WARM_GOLD = 'rgba(230, 199, 137, 1)';
const COOL_BLUE = 'rgba(143, 199, 234, 1)';
const WARM_GOLD_HALF = 'rgba(230, 199, 137, 0.5)';

export const HUD = () => {
  const { appStatus, score, capturedLyrics, isPaused, arMode, isMobile, language } = useStore();
  const crosshairRef = useRef(null);

  const bodyFont = language === 'ja'
    ? '"Shizuru", system-ui'
    : '"Kranky", sans-serif';

  useEffect(() => {
    const handleMove = (e) => {
      const x = e.clientX ?? e.touches?.[0]?.clientX ?? (window.innerWidth / 2);
      const y = e.clientY ?? e.touches?.[0]?.clientY ?? (window.innerHeight / 2);
      
      if (crosshairRef.current) {
        crosshairRef.current.style.left = `${x - 50}px`;
        crosshairRef.current.style.top = `${y - 50}px`;
      }

      useStore.getState().setCursorPosition(x / window.innerWidth, y / window.innerHeight);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('touchmove', handleMove);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('touchmove', handleMove);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && appStatus === 'playing') {
        useStore.getState().togglePause();
      } else if (e.key === 'Escape' && isPaused) {
        useStore.getState().togglePause();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [appStatus, isPaused]);

  const handleStart = () => {
    const player = useStore.getState().player;
    if (player && appStatus === 'ready') {
      player.requestPlay();
      useStore.getState().setAppStatus('playing');
    }
  };

  const playHoverSound = () => {
    const audio = new Audio(ASSETS.SFX_HOVER);
    audio.play().catch(() => {});
  };

  const displayedCaptures = capturedLyrics.slice(-MAX_GALLERY_DISPLAY);
  const overflowCount = Math.max(0, capturedLyrics.length - MAX_GALLERY_DISPLAY);

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
      fontFamily: bodyFont,
    }}>
      <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0, textShadow: '0 2px 8px rgba(0,0,0,0.6)', fontSize: '1.1rem', fontWeight: 500, letterSpacing: '3px', fontFamily: '"Press Start 2P", sans-serif' }}>
          SCORE: <span style={{ color: WARM_GOLD, fontWeight: 600 }}>{score}</span>
        </h2>
        {appStatus === 'playing' && (
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {/* AR Button only shown on mobile devices */}
            {isMobile && (
              <button
                style={{
                  padding: '8px 16px',
                  background: 'transparent',
                  border: `1px solid ${WARM_GOLD_HALF}`,
                  color: WARM_GOLD,
                  fontFamily: '"Press Start 2P", sans-serif',
                  fontSize: '0.75rem',
                  letterSpacing: '2px',
                  pointerEvents: 'auto',
                }}
                onClick={() => {
                  if (arMode) {
                    useStore.getState().setArMode(false);
                  } else {
                    if (!navigator.xr) {
                      alert("WebXR AR is not supported on this browser. Try using Google Chrome for Android, or a WebXR viewer app.");
                      return;
                    }
                    xrStore.enterAR().then(() => {
                      useStore.getState().setArMode(true);
                    }).catch(err => {
                      console.error("AR failed", err);
                      alert("Failed to start AR. Make sure camera permissions are granted.");
                      useStore.getState().setArMode(false);
                    });
                  }
                }}
              >
                {arMode ? 'DISABLE AR' : 'AR VIEWFINDER'}
              </button>
            )}
            <div style={{
              fontSize: '0.7rem', letterSpacing: '2px', color: '#887766',
              textTransform: 'uppercase', pointerEvents: 'auto', cursor: 'pointer',
              fontFamily: '"Press Start 2P", sans-serif',
            }}
              onClick={() => useStore.getState().togglePause()}
            >
              [ESC] Pause
            </div>
          </div>
        )}
      </div>

      <div
        ref={crosshairRef}
        style={{
          position: 'absolute',
          left: 'calc(50vw - 50px)',
          top: 'calc(50vh - 50px)',
          width: '100px',
          height: '100px',
          pointerEvents: 'none',
        }}
      >
        <div style={{
          width: '100%', height: '100%',
          border: `1.5px solid ${WARM_GOLD_HALF}`,
          borderRadius: '50%',
          position: 'relative',
          boxShadow: '0 0 20px rgba(230,199,137,0.1), inset 0 0 20px rgba(230,199,137,0.05)',
        }}>
          <div style={{ position: 'absolute', top: '50%', left: '30%', right: '30%', height: '1px', background: 'rgba(230,199,137,0.6)', transform: 'translateY(-0.5px)' }} />
          <div style={{ position: 'absolute', left: '50%', top: '30%', bottom: '30%', width: '1px', background: 'rgba(230,199,137,0.6)', transform: 'translateX(-0.5px)' }} />
          <div style={{
            position: 'absolute', top: '-4px', left: '50%', width: '1px', height: '8px',
            background: 'rgba(230,199,137,0.4)', transform: 'translateX(-0.5px)',
          }} />
          <div style={{
            position: 'absolute', bottom: '-4px', left: '50%', width: '1px', height: '8px',
            background: 'rgba(230,199,137,0.4)', transform: 'translateX(-0.5px)',
          }} />
          <div style={{
            position: 'absolute', left: '-4px', top: '50%', height: '1px', width: '8px',
            background: 'rgba(230,199,137,0.4)', transform: 'translateY(-0.5px)',
          }} />
          <div style={{
            position: 'absolute', right: '-4px', top: '50%', height: '1px', width: '8px',
            background: 'rgba(230,199,137,0.4)', transform: 'translateY(-0.5px)',
          }} />
        </div>
      </div>

      {appStatus !== 'playing' && appStatus !== 'results' && appStatus !== 'intro' && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          pointerEvents: 'auto',
        }}>
          <button
            onClick={handleStart}
            onMouseEnter={playHoverSound}
            disabled={appStatus === 'loading'}
            style={{
              padding: '14px 36px',
              fontSize: '1rem',
              backgroundColor: 'transparent',
              color: appStatus === 'ready' ? WARM_GOLD : '#556',
              border: `1px solid ${appStatus === 'ready' ? WARM_GOLD : '#333'}`,
              cursor: appStatus === 'ready' ? 'pointer' : 'not-allowed',
              backdropFilter: 'blur(4px)',
              transition: 'all 0.3s ease',
              letterSpacing: '4px',
              textTransform: 'uppercase',
              fontFamily: '"Press Start 2P", sans-serif',
            }}
            onMouseOver={(e) => { if (appStatus === 'ready') { e.target.style.background = WARM_GOLD; e.target.style.color = '#0a0a0a'; } }}
            onMouseOut={(e) => { e.target.style.background = 'transparent'; e.target.style.color = appStatus === 'ready' ? WARM_GOLD : '#556'; }}
          >
            {appStatus === 'loading' ? 'Loading Track...' : 'Start'}
          </button>
        </div>
      )}

      <div style={{
        padding: '16px 20px',
        display: 'flex',
        gap: '8px',
        overflowX: 'hidden',
        background: 'linear-gradient(transparent, rgba(10,10,15,0.85))',
        alignItems: 'center',
      }}>
        {overflowCount > 0 && (
          <div style={{
            minWidth: '40px', height: '36px',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            fontSize: '0.7rem', color: WARM_GOLD, letterSpacing: '1px',
            fontFamily: '"Press Start 2P", sans-serif',
          }}>
            +{overflowCount}
          </div>
        )}
        {displayedCaptures.map(lyric => (
          <div key={lyric.id} style={{
            minWidth: '52px', height: '36px',
            border: '1px solid rgba(230,199,137,0.3)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: '0.75rem',
            color: WARM_GOLD,
            fontWeight: 500,
            backgroundColor: 'rgba(230,199,137,0.05)',
            transition: 'all 0.3s ease',
          }}>
            {lyric.text}
          </div>
        ))}
        {capturedLyrics.length === 0 && (
          <div style={{ color: 'rgba(255,255,255,0.25)', fontStyle: 'italic', fontSize: '0.8rem', letterSpacing: '1px', fontFamily: bodyFont }}>
            {language === 'ja' ? '\u6B4C\u8A5E\u3092\u30AD\u30E3\u30D7\u30C1\u30E3\u3057\u3066\u30AE\u30E3\u30E9\u30EA\u30FC\u3092\u57CB\u3081\u3066\u304F\u3060\u3055\u3044...' : 'Capture lyrics to fill the gallery...'}
          </div>
        )}
      </div>
    </div>
  );
};
