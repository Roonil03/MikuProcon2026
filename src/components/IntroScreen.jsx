import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';
import { useStore } from '../store/useStore';
import { ASSETS } from '../constants/assets';
import { generateMikuSilhouette } from '../lib/mikuSilhouette';
import { initializeTextAlive } from '../lib/TextAliveManager';

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
  start: 'Start',
  gyroscope: 'GYROSCOPE MODE',
  cursor: 'CURSOR MODE',
  detected: 'DETECTED',
  disclaimer: 'Note: The Japanese translations have been produced using translation software and may not be perfectly accurate. Apologies for any errors.',
  loadingTrack: 'LOADING TRACK...',
  trackReady: 'TRACK READY',
  forming: 'FORMING...',
};

const TEXT_JA = {
  howToPlay: '\u904A\u3073\u65B9',
  mobileTilt: '\u30C7\u30D0\u30A4\u30B9\u3092\u50BE\u3051\u3066\u30D5\u30A1\u30A4\u30F3\u30C0\u30FC\u3092\u5408\u308F\u305B\u3066\u304F\u3060\u3055\u3044\u3002\u66F2\u306E\u518D\u751F\u4E2D\u3001\u6B4C\u8A5E\u304C\u98DB\u3093\u3067\u304D\u307E\u3059\u3002',
  mobileTap: '\u6B4C\u8A5E\u304C\u30AF\u30ED\u30B9\u30D8\u30A2\u306E\u4E2D\u5FC3\u306B\u63C3\u3063\u305F\u3089\u753B\u9762\u3092\u30BF\u30C3\u30D7\u3057\u3066\u304F\u3060\u3055\u3044\u3002\u30BF\u30A4\u30DF\u30F3\u30B0\u306E\u7CBE\u5EA6\u304C\u30B9\u30B3\u30A2\u306B\u5F71\u97FF\u3057\u307E\u3059\u3002',
  desktopMove: '\u30AB\u30FC\u30BD\u30EB\u3092\u52D5\u304B\u3057\u3066\u30D5\u30A1\u30A4\u30F3\u30C0\u30FC\u3092\u5408\u308F\u305B\u3066\u304F\u3060\u3055\u3044\u3002\u66F2\u306E\u518D\u751F\u4E2D\u3001\u6B4C\u8A5E\u304C\u98DB\u3093\u3067\u304D\u307E\u3059\u3002',
  desktopClick: '\u6B4C\u8A5E\u304C\u30AF\u30ED\u30B9\u30D8\u30A2\u306E\u4E2D\u5FC3\u306B\u63C3\u3063\u305F\u3089\u30AF\u30EA\u30C3\u30AF\u3057\u3066\u304F\u3060\u3055\u3044\u3002\u30BF\u30A4\u30DF\u30F3\u30B0\u306E\u7CBE\u5EA6\u304C\u30B9\u30B3\u30A2\u306B\u5F71\u97FF\u3057\u307E\u3059\u3002',
  captured: '\u30AD\u30E3\u30D7\u30C1\u30E3\u3057\u305F\u6B4C\u8A5E\u306F\u30DD\u30E9\u30ED\u30A4\u30C9\u30D5\u30EC\u30FC\u30E0\u3068\u3057\u3066\u30A2\u30FC\u30AB\u30A4\u30D6\u3055\u308C\u307E\u3059\u3002\u3044\u3064\u3067\u3082Esc\u30AD\u30FC\u3067\u4E00\u6642\u505C\u6B62\u3067\u304D\u307E\u3059\u3002',
  begin: '\u59CB\u3081\u308B',
  start: '\u30B9\u30BF\u30FC\u30C8',
  gyroscope: '\u30B8\u30E3\u30A4\u30ED\u30E2\u30FC\u30C9',
  cursor: '\u30AB\u30FC\u30BD\u30EB\u30E2\u30FC\u30C9',
  detected: '\u691C\u51FA',
  disclaimer: '\u6CE8\u610F\uFF1A\u65E5\u672C\u8A9E\u306E\u7FFB\u8A33\u306F\u7FFB\u8A33\u30BD\u30D5\u30C8\u30A6\u30A7\u30A2\u3092\u4F7F\u7528\u3057\u3066\u304A\u308A\u3001\u5B8C\u5168\u306B\u6B63\u78BA\u3067\u306F\u306A\u3044\u5834\u5408\u304C\u3042\u308A\u307E\u3059\u3002\u8AA4\u308A\u304C\u3042\u308C\u3070\u304A\u8A6B\u3073\u7533\u3057\u4E0A\u3052\u307E\u3059\u3002',
  loadingTrack: '\u30C8\u30E9\u30C3\u30AF\u8AAD\u307F\u8FBC\u307F\u4E2D...',
  trackReady: '\u30C8\u30E9\u30C3\u30AF\u6E96\u5099\u5B8C\u4E86',
  forming: '\u5F62\u6210\u4E2D...',
};

const MikuParticles = React.forwardRef((props, ref) => {
  const pointsRef = useRef();
  const groupRef = useRef();

  const mikuCoords = useMemo(() => generateMikuSilhouette(), []);

  const { randomPositions, targetPositions } = useMemo(() => {
    const count = mikuCoords.length;
    const random = new Float32Array(count * 3);
    const target = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const radius = 4 + Math.random() * 6;
      random[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      random[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      random[i * 3 + 2] = radius * Math.cos(phi);

      target[i * 3] = mikuCoords[i].x;
      target[i * 3 + 1] = mikuCoords[i].y;
      target[i * 3 + 2] = mikuCoords[i].z;
    }

    return { randomPositions: random, targetPositions: target };
  }, [mikuCoords]);

  const colors = useMemo(() => {
    const count = mikuCoords.length;
    const c = new Float32Array(count * 3);
    const goldR = 230 / 255, goldG = 199 / 255, goldB = 137 / 255;
    const blueR = 143 / 255, blueG = 199 / 255, blueB = 234 / 255;
    for (let i = 0; i < count; i++) {
      const blend = Math.random();
      c[i * 3] = goldR * blend + blueR * (1 - blend);
      c[i * 3 + 1] = goldG * blend + blueG * (1 - blend);
      c[i * 3 + 2] = goldB * blend + blueB * (1 - blend);
    }
    return c;
  }, [mikuCoords]);

  const sizes = useMemo(() => {
    const count = mikuCoords.length;
    const s = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      s[i] = 1.5 + Math.random() * 2.0;
    }
    return s;
  }, [mikuCoords]);

  React.useImperativeHandle(ref, () => ({
    getGeometry: () => pointsRef.current?.geometry,
    getPoints: () => pointsRef.current,
    getGroup: () => groupRef.current,
    getRandomPositions: () => randomPositions,
    getTargetPositions: () => targetPositions,
    getParticleCount: () => mikuCoords.length,
  }));

  useEffect(() => {
    if (pointsRef.current) {
      const geo = pointsRef.current.geometry;
      geo.setAttribute('position', new THREE.BufferAttribute(randomPositions.slice(), 3));
      geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    }
  }, [randomPositions, colors, sizes]);

  useFrame((state, delta) => {
    if (groupRef.current) {
      const stage = useStore.getState().appStage;
      if (stage === 'intro') {
        groupRef.current.rotation.y += delta * 0.08;
        groupRef.current.rotation.x += delta * 0.03;
      }
    }
  });

  return (
    <group ref={groupRef}>
      <points ref={pointsRef}>
        <bufferGeometry />
        <pointsMaterial
          vertexColors
          size={2}
          sizeAttenuation
          transparent
          opacity={1.0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
});

const IntroCanvas = React.forwardRef((props, ref) => {
  return (
    <Canvas
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}
      camera={{ position: [0, 0, 8], fov: 60 }}
      dpr={[1, 1.5]}
    >
      <ambientLight intensity={0.3} />
      <MikuParticles ref={ref} />
    </Canvas>
  );
});

export const IntroScreen = () => {
  const [titleVisible, setTitleVisible] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);
  const [btnVisible, setBtnVisible] = useState(false);
  const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const language = useStore(state => state.language);
  const appStage = useStore(state => state.appStage);
  const t = language === 'ja' ? TEXT_JA : TEXT_EN;
  const particlesRef = useRef(null);

  const bodyFont = language === 'ja'
    ? '"Shizuru", system-ui'
    : '"Kranky", sans-serif';

  useEffect(() => {
    const t1 = setTimeout(() => setTitleVisible(true), 300);
    const t2 = setTimeout(() => setContentVisible(true), 900);
    const t3 = setTimeout(() => setBtnVisible(true), 1400);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  useEffect(() => {
    const unsub = useStore.subscribe(
      (state) => state.appStage,
      (stage) => {
        if (stage === 'ready' && particlesRef.current) {
          const pointsMesh = particlesRef.current.getPoints();
          if (pointsMesh && pointsMesh.material) {
            gsap.to(pointsMesh.material, {
              opacity: 0,
              duration: 1.5,
              ease: 'power2.inOut',
            });
          }
        }
      }
    );
    return unsub;
  }, []);

  const handleBegin = () => {
    const audio = new Audio(ASSETS.SFX_CLICK);
    audio.play().catch(() => {});

    useStore.getState().setAppStage('forming');

    if (!particlesRef.current) return;

    const geometry = particlesRef.current.getGeometry();
    const targetPositions = particlesRef.current.getTargetPositions();
    const group = particlesRef.current.getGroup();
    const count = particlesRef.current.getParticleCount();

    if (!geometry || !targetPositions) return;

    const posAttr = geometry.getAttribute('position');
    const currentArray = posAttr.array;

    const tl = gsap.timeline({
      onUpdate: () => {
        posAttr.needsUpdate = true;
      },
      onComplete: () => {
        useStore.getState().setAppStage('loading_track');

        const existingPlayer = useStore.getState().player;
        if (!existingPlayer) {
          initializeTextAlive();
        }

        const lyricsAlreadyLoaded = useStore.getState().lyricsData.length > 0;
        if (lyricsAlreadyLoaded) {
          useStore.getState().setAppStage('ready');
        }
      },
    });

    if (group) {
      gsap.to(group.rotation, {
        x: 0,
        y: 0,
        z: 0,
        duration: 1.5,
        ease: 'power2.inOut',
      });
    }

    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      tl.to(currentArray, {
        [idx]: targetPositions[idx],
        [idx + 1]: targetPositions[idx + 1],
        [idx + 2]: targetPositions[idx + 2],
        duration: 4,
        ease: 'power3.inOut',
      }, 0);
    }
  };

  const handleStart = () => {
    const audio = new Audio(ASSETS.SFX_CLICK);
    audio.play().catch(() => {});

    const player = useStore.getState().player;
    if (player) {
      player.requestPlay();
      useStore.getState().setAppStatus('playing');
    }
  };

  const playHover = () => {
    const audio = new Audio(ASSETS.SFX_HOVER);
    audio.play().catch(() => {});
  };

  const toggleLang = () => {
    const current = useStore.getState().language;
    useStore.getState().setLanguage(current === 'en' ? 'ja' : 'en');
  };

  const showBeginButton = appStage === 'intro';
  const showStartButton = appStage === 'ready';
  const showOverlay = appStage === 'intro' || appStage === 'forming';

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
      overflow: 'hidden',
    }}>
      <IntroCanvas ref={particlesRef} />

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
        border: '1px solid rgba(230,199,137,0.08)',
        borderRadius: '50%',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        top: '15%', left: '50%', transform: 'translate(-50%, -50%)',
        width: '200px', height: '200px',
        border: '1px solid rgba(230,199,137,0.12)',
        borderRadius: '50%',
        pointerEvents: 'none',
        animation: 'ring-pulse 3s ease-in-out infinite',
      }} />

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
          fontFamily: language === 'ja' ? '"Shizuru", system-ui' : '"Kranky", sans-serif',
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

      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        fontFamily: '"Press Start 2P", sans-serif',
        fontSize: '0.6rem',
        letterSpacing: '2px',
        color: appStage === 'ready' ? 'rgba(143,199,234,0.6)' : 'rgba(230,199,137,0.4)',
        transition: 'color 0.5s ease',
        zIndex: 10,
      }}>
        {appStage === 'ready' ? t.trackReady : (appStage === 'loading_track' ? t.loadingTrack : (appStage === 'forming' ? t.forming : 'PRELOADING...'))}
      </div>

      {showOverlay && (
        <div style={{
          position: 'relative',
          zIndex: 1,
          textAlign: 'center',
          maxWidth: '640px',
          padding: '40px 30px',
          opacity: appStage === 'forming' ? 0 : 1,
          transition: 'opacity 1.0s ease-out',
          pointerEvents: appStage === 'forming' ? 'none' : 'auto',
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
              fontFamily: '"Kranky", sans-serif',
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
                fontFamily: '"Kranky", sans-serif',
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
                fontFamily: '"Press Start 2P", sans-serif',
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

          {showBeginButton && (
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
                  fontFamily: language === 'ja' ? '"Shizuru", system-ui' : '"Kranky", sans-serif',
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
                fontFamily: '"Press Start 2P", sans-serif',
                fontSize: '0.65rem',
                color: '#555',
                letterSpacing: '2px',
              }}>
                {isMobile ? t.gyroscope : t.cursor} {t.detected}
              </div>
            </div>
          )}
        </div>
      )}

      {showStartButton && (
        <div style={{
          position: 'absolute',
          top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          zIndex: 10,
          animation: 'fadeInUp 0.8s ease-out forwards',
        }}>
          <button
            onClick={handleStart}
            onMouseEnter={playHover}
            style={{
              fontFamily: language === 'ja' ? '"Shizuru", system-ui' : '"Kranky", sans-serif',
              padding: '16px 60px',
              fontSize: language === 'ja' ? '1.2rem' : '1.5rem',
              fontWeight: 400,
              background: 'transparent',
              color: WARM_GOLD,
              border: `1.5px solid ${WARM_GOLD}`,
              cursor: 'pointer',
              letterSpacing: '6px',
              textTransform: language === 'ja' ? 'none' : 'uppercase',
              transition: 'all 0.35s ease',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 0 40px rgba(230,199,137,0.1), inset 0 0 40px rgba(230,199,137,0.03)',
            }}
            onMouseOver={(e) => {
              e.target.style.background = WARM_GOLD;
              e.target.style.color = '#0a0a0a';
              e.target.style.boxShadow = '0 0 60px rgba(230,199,137,0.3)';
            }}
            onMouseOut={(e) => {
              e.target.style.background = 'transparent';
              e.target.style.color = WARM_GOLD;
              e.target.style.boxShadow = '0 0 40px rgba(230,199,137,0.1), inset 0 0 40px rgba(230,199,137,0.03)';
            }}
          >
            {t.start}
          </button>
        </div>
      )}

      <div style={{
        position: 'absolute',
        bottom: '16px',
        left: 0,
        width: '100%',
        textAlign: 'center',
        fontFamily: language === 'ja' ? '"Shizuru", system-ui' : '"Kranky", sans-serif',
        fontSize: language === 'ja' ? '0.65rem' : '0.8rem',
        color: '#444',
        padding: '0 20px',
        lineHeight: 1.5,
        zIndex: 1,
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
        @keyframes fadeInUp {
          0% { opacity: 0; transform: translate(-50%, -40%); }
          100% { opacity: 1; transform: translate(-50%, -50%); }
        }
      `}</style>
    </div>
  );
};
