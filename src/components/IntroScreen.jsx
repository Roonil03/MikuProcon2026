import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { ASSETS } from '../constants/assets';

export const IntroScreen = () => {
  const [isExiting, setIsExiting] = useState(false);
  const [titleVisible, setTitleVisible] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);
  const [btnVisible, setBtnVisible] = useState(false);
  const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  useEffect(() => {
    const t1 = setTimeout(() => setTitleVisible(true), 300);
    const t2 = setTimeout(() => setContentVisible(true), 900);
    const t3 = setTimeout(() => setBtnVisible(true), 1400);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  const handleBegin = () => {
    setIsExiting(true);
    const audio = new Audio(ASSETS.SFX_CLICK);
    audio.play().catch(() => {});
    setTimeout(() => {
      useStore.getState().setAppStatus('loading');
    }, 800);
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
      background: '#000',
      color: 'white',
      opacity: isExiting ? 0 : 1,
      transition: 'opacity 0.8s ease-out',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute',
        top: 0, left: 0, width: '100%', height: '100%',
        backgroundImage: `url(${ASSETS.BACKGROUND})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        opacity: 0.06,
        pointerEvents: 'none',
      }} />

      <div style={{
        position: 'absolute',
        top: 0, left: 0, width: '100%', height: '100%',
        background: 'radial-gradient(ellipse at 50% 40%, rgba(57,255,220,0.06) 0%, transparent 60%), radial-gradient(ellipse at 30% 80%, rgba(0,150,255,0.04) 0%, transparent 50%)',
        pointerEvents: 'none',
      }} />

      <div style={{
        position: 'absolute',
        top: '15%', left: '50%', transform: 'translate(-50%, -50%)',
        width: '300px', height: '300px',
        border: '1px solid rgba(57,255,220,0.08)',
        borderRadius: '50%',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        top: '15%', left: '50%', transform: 'translate(-50%, -50%)',
        width: '200px', height: '200px',
        border: '1px solid rgba(57,255,220,0.12)',
        borderRadius: '50%',
        pointerEvents: 'none',
        animation: 'ring-pulse 3s ease-in-out infinite',
      }} />

      <div style={{
        position: 'relative',
        zIndex: 1,
        textAlign: 'center',
        maxWidth: '640px',
        padding: '40px 30px',
      }}>
        <div style={{
          opacity: titleVisible ? 1 : 0,
          transform: titleVisible ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
        }}>
          <div style={{
            width: '70px', height: '70px',
            border: '1.5px solid rgba(57,255,220,0.5)',
            borderRadius: '50%',
            margin: '0 auto 28px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
            animation: 'crosshair-glow 2.5s ease-in-out infinite',
          }}>
            <div style={{ position: 'absolute', top: '50%', left: '28%', right: '28%', height: '1px', background: '#39FFDC' }} />
            <div style={{ position: 'absolute', left: '50%', top: '28%', bottom: '28%', width: '1px', background: '#39FFDC' }} />
          </div>

          <h1 style={{
            fontFamily: '"Orbitron", sans-serif',
            fontSize: '2.6rem',
            fontWeight: 700,
            letterSpacing: '10px',
            textTransform: 'uppercase',
            marginBottom: '0',
            color: 'transparent',
            backgroundImage: 'linear-gradient(135deg, #39FFDC 0%, #00BFFF 50%, #39FFDC 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            lineHeight: 1.2,
          }}>
            Shutter
            <br />
            <span style={{ fontWeight: 400, fontSize: '2rem', letterSpacing: '14px' }}>Chance</span>
          </h1>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            margin: '16px 0 0',
          }}>
            <div style={{ height: '1px', width: '40px', background: 'linear-gradient(to right, transparent, rgba(57,255,220,0.4))' }} />
            <span style={{
              fontFamily: '"Orbitron", sans-serif',
              fontSize: '0.65rem',
              color: 'rgba(57,255,220,0.5)',
              letterSpacing: '6px',
              textTransform: 'uppercase',
              fontWeight: 500,
            }}>
              Roonil03
            </span>
            <div style={{ height: '1px', width: '40px', background: 'linear-gradient(to left, transparent, rgba(57,255,220,0.4))' }} />
          </div>
        </div>

        <div style={{
          opacity: contentVisible ? 1 : 0,
          transform: contentVisible ? 'translateY(0)' : 'translateY(16px)',
          transition: 'all 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
          marginTop: '36px',
        }}>
          <div style={{
            textAlign: 'left',
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
            padding: '22px 26px',
            lineHeight: '1.9',
            fontSize: '0.85rem',
            color: '#999',
            fontFamily: '"M PLUS 1p", sans-serif',
          }}>
            <div style={{
              fontFamily: '"Orbitron", sans-serif',
              color: '#39FFDC',
              fontWeight: 600,
              marginBottom: '14px',
              letterSpacing: '3px',
              fontSize: '0.65rem',
              textTransform: 'uppercase',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <span style={{ width: '16px', height: '1px', background: '#39FFDC', display: 'inline-block' }} />
              How To Play
            </div>

            {isMobile ? (
              <>
                <p style={{ margin: '0 0 8px 0' }}>
                  Tilt your device to aim the viewfinder. Lyrics will fly towards you as the song plays.
                </p>
                <p style={{ margin: '0 0 8px 0' }}>
                  Tap the screen when a lyric aligns with the center of the crosshair. Timing precision determines your score.
                </p>
              </>
            ) : (
              <>
                <p style={{ margin: '0 0 8px 0' }}>
                  Move your cursor to aim the viewfinder. Lyrics will fly towards you as the song plays.
                </p>
                <p style={{ margin: '0 0 8px 0' }}>
                  Click when a lyric aligns with the crosshair center. Timing precision determines your score.
                </p>
              </>
            )}
            <p style={{ margin: 0, color: '#666' }}>
              Captured lyrics are archived as polaroid frames. Press Escape at any time to pause.
            </p>
          </div>
        </div>

        <div style={{
          opacity: btnVisible ? 1 : 0,
          transform: btnVisible ? 'translateY(0)' : 'translateY(12px)',
          transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
          marginTop: '32px',
        }}>
          <button
            onClick={handleBegin}
            onMouseEnter={playHover}
            style={{
              fontFamily: '"Orbitron", sans-serif',
              padding: '14px 52px',
              fontSize: '0.85rem',
              fontWeight: 600,
              background: 'transparent',
              color: '#39FFDC',
              border: '1px solid rgba(57,255,220,0.5)',
              cursor: 'pointer',
              letterSpacing: '5px',
              textTransform: 'uppercase',
              transition: 'all 0.35s ease',
              position: 'relative',
              overflow: 'hidden',
            }}
            onMouseOver={(e) => {
              e.target.style.background = 'rgba(57,255,220,0.12)';
              e.target.style.borderColor = '#39FFDC';
              e.target.style.boxShadow = '0 0 30px rgba(57,255,220,0.15), inset 0 0 30px rgba(57,255,220,0.05)';
            }}
            onMouseOut={(e) => {
              e.target.style.background = 'transparent';
              e.target.style.borderColor = 'rgba(57,255,220,0.5)';
              e.target.style.boxShadow = 'none';
            }}
          >
            Begin
          </button>

          <div style={{
            marginTop: '20px',
            fontFamily: '"M PLUS 1p", sans-serif',
            fontSize: '0.65rem',
            color: '#444',
            letterSpacing: '2px',
          }}>
            {isMobile ? 'GYROSCOPE MODE' : 'CURSOR MODE'} DETECTED
          </div>
        </div>
      </div>

      <style>{`
        @keyframes crosshair-glow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(57,255,220,0.2), 0 0 12px rgba(57,255,220,0.1); }
          50% { box-shadow: 0 0 0 8px rgba(57,255,220,0), 0 0 20px rgba(57,255,220,0.15); }
        }
        @keyframes ring-pulse {
          0%, 100% { opacity: 0.12; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.06; transform: translate(-50%, -50%) scale(1.05); }
        }
      `}</style>
    </div>
  );
};
