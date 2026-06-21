import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { ASSETS } from '../constants/assets';

const WARM_GOLD = 'rgba(230, 199, 137, 1)';
const COOL_BLUE = 'rgba(143, 199, 234, 1)';
const WARM_GOLD_HALF = 'rgba(230, 199, 137, 0.5)';
const WARM_GOLD_DIM = 'rgba(230, 199, 137, 0.4)';
const ACCENT_GRADIENT = `linear-gradient(135deg, ${WARM_GOLD} 0%, ${COOL_BLUE} 100%)`;

const TEXT_EN = {
  howToPlay: 'How To Play',
  mobileTilt: 'Tilt your device to aim the viewfinder. Lyrics will fly towards you as the song plays.',
  mobileTap: 'Tap the screen when a lyric aligns with the center of the crosshair. Timing precision determines your score.',
  desktopMove: 'Move your cursor to aim the viewfinder. Lyrics will fly towards you as the song plays.',
  desktopClick: 'Click when a lyric aligns with the crosshair center. Timing precision determines your score.',
  captured: 'Captured lyrics are archived as polaroid frames. Press Escape at any time to pause.',
  begin: 'Begin',
  gyroscope: 'GYROSCOPE MODE',
  cursor: 'CURSOR MODE',
  detected: 'DETECTED',
  disclaimer: 'Note: The Japanese translations have been produced using translation software and may not be perfectly accurate. Apologies for any errors.',
};

const TEXT_JA = {
  howToPlay: '\u904A\u3073\u65B9',
  mobileTilt: '\u30C7\u30D0\u30A4\u30B9\u3092\u50BE\u3051\u3066\u30D5\u30A1\u30A4\u30F3\u30C0\u30FC\u3092\u5408\u308F\u305B\u3066\u304F\u3060\u3055\u3044\u3002\u66F2\u306E\u518D\u751F\u4E2D\u3001\u6B4C\u8A5E\u304C\u98DB\u3093\u3067\u304D\u307E\u3059\u3002',
  mobileTap: '\u6B4C\u8A5E\u304C\u30AF\u30ED\u30B9\u30D8\u30A2\u306E\u4E2D\u5FC3\u306B\u63C3\u3063\u305F\u3089\u753B\u9762\u3092\u30BF\u30C3\u30D7\u3057\u3066\u304F\u3060\u3055\u3044\u3002\u30BF\u30A4\u30DF\u30F3\u30B0\u306E\u7CBE\u5EA6\u304C\u30B9\u30B3\u30A2\u306B\u5F71\u97FF\u3057\u307E\u3059\u3002',
  desktopMove: '\u30AB\u30FC\u30BD\u30EB\u3092\u52D5\u304B\u3057\u3066\u30D5\u30A1\u30A4\u30F3\u30C0\u30FC\u3092\u5408\u308F\u305B\u3066\u304F\u3060\u3055\u3044\u3002\u66F2\u306E\u518D\u751F\u4E2D\u3001\u6B4C\u8A5E\u304C\u98DB\u3093\u3067\u304D\u307E\u3059\u3002',
  desktopClick: '\u6B4C\u8A5E\u304C\u30AF\u30ED\u30B9\u30D8\u30A2\u306E\u4E2D\u5FC3\u306B\u63C3\u3063\u305F\u3089\u30AF\u30EA\u30C3\u30AF\u3057\u3066\u304F\u3060\u3055\u3044\u3002\u30BF\u30A4\u30DF\u30F3\u30B0\u306E\u7CBE\u5EA6\u304C\u30B9\u30B3\u30A2\u306B\u5F71\u97FF\u3057\u307E\u3059\u3002',
  captured: '\u30AD\u30E3\u30D7\u30C1\u30E3\u3057\u305F\u6B4C\u8A5E\u306F\u30DD\u30E9\u30ED\u30A4\u30C9\u30D5\u30EC\u30FC\u30E0\u3068\u3057\u3066\u30A2\u30FC\u30AB\u30A4\u30D6\u3055\u308C\u307E\u3059\u3002\u3044\u3064\u3067\u3082Esc\u30AD\u30FC\u3067\u4E00\u6642\u505C\u6B62\u3067\u304D\u307E\u3059\u3002',
  begin: '\u59CB\u3081\u308B',
  gyroscope: '\u30B8\u30E3\u30A4\u30ED\u30E2\u30FC\u30C9',
  cursor: '\u30AB\u30FC\u30BD\u30EB\u30E2\u30FC\u30C9',
  detected: '\u691C\u51FA',
  disclaimer: '\u6CE8\u610F\uFF1A\u65E5\u672C\u8A9E\u306E\u7FFB\u8A33\u306F\u7FFB\u8A33\u30BD\u30D5\u30C8\u30A6\u30A7\u30A2\u3092\u4F7F\u7528\u3057\u3066\u304A\u308A\u3001\u5B8C\u5168\u306B\u6B63\u78BA\u3067\u306F\u306A\u3044\u5834\u5408\u304C\u3042\u308A\u307E\u3059\u3002\u8AA4\u308A\u304C\u3042\u308C\u3070\u304A\u8A6B\u3073\u7533\u3057\u4E0A\u3052\u307E\u3059\u3002',
};

export const IntroScreen = () => {
  const [isExiting, setIsExiting] = useState(false);
  const [titleVisible, setTitleVisible] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);
  const [btnVisible, setBtnVisible] = useState(false);
  const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const language = useStore(state => state.language);
  const appStatus = useStore(state => state.appStatus);
  const t = language === 'ja' ? TEXT_JA : TEXT_EN;

  const bodyFont = language === 'ja'
    ? '"Shizuru", system-ui'
    : '"Londrina Shadow", sans-serif';

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
      const status = useStore.getState().appStatus;
      if (useStore.getState().lyricsData.length > 0) {
        useStore.getState().setAppStatus('ready');
      } else {
        useStore.getState().setAppStatus('loading');
      }
    }, 800);
  };

  const playHover = () => {
    const audio = new Audio(ASSETS.SFX_HOVER);
    audio.play().catch(() => {});
  };

  const toggleLang = () => {
    const current = useStore.getState().language;
    useStore.getState().setLanguage(current === 'en' ? 'ja' : 'en');
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
      background: 'linear-gradient(160deg, #0d0d12 0%, #111118 40%, #0f1016 100%)',
      color: 'white',
      opacity: isExiting ? 0 : 1,
      transition: 'opacity 0.8s ease-out',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute',
        top: 0, left: 0, width: '100%', height: '100%',
        background: `radial-gradient(ellipse at 30% 20%, rgba(230,199,137,0.07) 0%, transparent 55%), radial-gradient(ellipse at 70% 80%, rgba(143,199,234,0.06) 0%, transparent 50%)`,
        pointerEvents: 'none',
      }} />

      <div style={{
        position: 'absolute',
        top: '15%', left: '50%', transform: 'translate(-50%, -50%)',
        width: '300px', height: '300px',
        border: `1px solid rgba(230,199,137,0.08)`,
        borderRadius: '50%',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        top: '15%', left: '50%', transform: 'translate(-50%, -50%)',
        width: '200px', height: '200px',
        border: `1px solid rgba(230,199,137,0.12)`,
        borderRadius: '50%',
        pointerEvents: 'none',
        animation: 'ring-pulse 3s ease-in-out infinite',
      }} />

      {/* Language Toggle */}
      <button
        onClick={toggleLang}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          zIndex: 10,
          background: 'rgba(230,199,137,0.08)',
          border: `1px solid ${WARM_GOLD_HALF}`,
          color: WARM_GOLD,
          padding: '6px 16px',
          fontFamily: language === 'ja' ? '"Shizuru", system-ui' : '"Londrina Shadow", sans-serif',
          fontSize: language === 'ja' ? '0.85rem' : '1rem',
          cursor: 'pointer',
          letterSpacing: '2px',
          transition: 'all 0.3s ease',
          borderRadius: '2px',
        }}
        onMouseOver={(e) => {
          e.target.style.background = 'rgba(230,199,137,0.15)';
          e.target.style.borderColor = WARM_GOLD;
        }}
        onMouseOut={(e) => {
          e.target.style.background = 'rgba(230,199,137,0.08)';
          e.target.style.borderColor = WARM_GOLD_HALF;
        }}
      >
        {language === 'en' ? 'JP' : 'EN'}
      </button>

      {/* Loading Indicator */}
      {appStatus === 'intro' && (
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          fontFamily: '"Orbitron", sans-serif',
          fontSize: '0.6rem',
          letterSpacing: '2px',
          color: useStore.getState().lyricsData?.length > 0 ? 'rgba(143,199,234,0.6)' : 'rgba(230,199,137,0.4)',
          transition: 'color 0.5s ease',
        }}>
          {useStore.getState().lyricsData?.length > 0 ? 'TRACK READY' : 'PRELOADING TRACK...'}
        </div>
      )}

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
            border: `1.5px solid ${WARM_GOLD_HALF}`,
            borderRadius: '50%',
            margin: '0 auto 28px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
            animation: 'crosshair-glow 2.5s ease-in-out infinite',
          }}>
            <div style={{ position: 'absolute', top: '50%', left: '28%', right: '28%', height: '1px', background: WARM_GOLD }} />
            <div style={{ position: 'absolute', left: '50%', top: '28%', bottom: '28%', width: '1px', background: WARM_GOLD }} />
          </div>

          <h1 style={{
            fontFamily: '"Londrina Shadow", sans-serif',
            fontSize: '3.2rem',
            fontWeight: 400,
            letterSpacing: '6px',
            marginBottom: '0',
            color: 'transparent',
            backgroundImage: ACCENT_GRADIENT,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            lineHeight: 1.3,
          }}>
            Shutter
            <br />
            <span style={{ fontSize: '2.4rem', letterSpacing: '10px' }}>Chance</span>
          </h1>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            margin: '16px 0 0',
          }}>
            <div style={{ height: '1px', width: '40px', background: `linear-gradient(to right, transparent, ${WARM_GOLD_DIM})` }} />
            <span style={{
              fontFamily: '"Londrina Shadow", sans-serif',
              fontSize: '1rem',
              color: WARM_GOLD_HALF,
              letterSpacing: '4px',
            }}>
              Roonil03
            </span>
            <div style={{ height: '1px', width: '40px', background: `linear-gradient(to left, transparent, ${WARM_GOLD_DIM})` }} />
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
            background: 'rgba(230,199,137,0.02)',
            border: '1px solid rgba(230,199,137,0.08)',
            padding: '22px 26px',
            lineHeight: '1.9',
            fontSize: language === 'ja' ? '0.95rem' : '1.1rem',
            color: '#aaa',
            fontFamily: bodyFont,
          }}>
            <div style={{
              fontFamily: '"Orbitron", sans-serif',
              color: WARM_GOLD,
              fontWeight: 600,
              marginBottom: '14px',
              letterSpacing: '3px',
              fontSize: '0.65rem',
              textTransform: 'uppercase',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <span style={{ width: '16px', height: '1px', background: WARM_GOLD, display: 'inline-block' }} />
              {t.howToPlay}
            </div>

            {isMobile ? (
              <>
                <p style={{ margin: '0 0 8px 0' }}>{t.mobileTilt}</p>
                <p style={{ margin: '0 0 8px 0' }}>{t.mobileTap}</p>
              </>
            ) : (
              <>
                <p style={{ margin: '0 0 8px 0' }}>{t.desktopMove}</p>
                <p style={{ margin: '0 0 8px 0' }}>{t.desktopClick}</p>
              </>
            )}
            <p style={{ margin: 0, color: '#777' }}>
              {t.captured}
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
              fontFamily: language === 'ja' ? '"Shizuru", system-ui' : '"Londrina Shadow", sans-serif',
              padding: '14px 52px',
              fontSize: language === 'ja' ? '1rem' : '1.3rem',
              fontWeight: 400,
              background: 'transparent',
              color: WARM_GOLD,
              border: `1px solid ${WARM_GOLD_HALF}`,
              cursor: 'pointer',
              letterSpacing: '5px',
              textTransform: language === 'ja' ? 'none' : 'uppercase',
              transition: 'all 0.35s ease',
              position: 'relative',
              overflow: 'hidden',
            }}
            onMouseOver={(e) => {
              e.target.style.background = 'rgba(230,199,137,0.12)';
              e.target.style.borderColor = WARM_GOLD;
              e.target.style.boxShadow = '0 0 30px rgba(230,199,137,0.15), inset 0 0 30px rgba(230,199,137,0.05)';
            }}
            onMouseOut={(e) => {
              e.target.style.background = 'transparent';
              e.target.style.borderColor = WARM_GOLD_HALF;
              e.target.style.boxShadow = 'none';
            }}
          >
            {t.begin}
          </button>

          <div style={{
            marginTop: '20px',
            fontFamily: '"Orbitron", sans-serif',
            fontSize: '0.65rem',
            color: '#555',
            letterSpacing: '2px',
          }}>
            {isMobile ? t.gyroscope : t.cursor} {t.detected}
          </div>
        </div>
      </div>

      {/* Translation Disclaimer Footer */}
      <div style={{
        position: 'absolute',
        bottom: '16px',
        left: 0,
        width: '100%',
        textAlign: 'center',
        fontFamily: language === 'ja' ? '"Shizuru", system-ui' : '"Londrina Shadow", sans-serif',
        fontSize: language === 'ja' ? '0.65rem' : '0.8rem',
        color: '#444',
        padding: '0 20px',
        lineHeight: 1.5,
      }}>
        {t.disclaimer}
      </div>

      <style>{`
        @keyframes crosshair-glow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(230,199,137,0.2), 0 0 12px rgba(230,199,137,0.1); }
          50% { box-shadow: 0 0 0 8px rgba(230,199,137,0), 0 0 20px rgba(230,199,137,0.15); }
        }
        @keyframes ring-pulse {
          0%, 100% { opacity: 0.12; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.06; transform: translate(-50%, -50%) scale(1.05); }
        }
      `}</style>
    </div>
  );
};
