import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';
import { useStore } from '../store/useStore';
import { ASSETS } from '../constants/assets';
import { generateMikuSilhouette } from '../lib/mikuSilhouette';
import { initializeTextAlive } from '../lib/TextAliveManager';
import { loadGame } from '../lib/loadGame';
import { usePrimaryTouch } from '../lib/inputCapabilities';

const WARM_GOLD = 'rgba(230, 199, 137, 1)';
const COOL_BLUE = 'rgba(143, 199, 234, 1)';
const WARM_GOLD_HALF = 'rgba(230, 199, 137, 0.5)';
const WARM_GOLD_DIM = 'rgba(230, 199, 137, 0.4)';
const ACCENT_GRADIENT = `linear-gradient(135deg, ${WARM_GOLD} 0%, ${COOL_BLUE} 100%)`;

const TEXT_EN = {
  howToPlay: 'How To Play',
  mobileTilt: 'Tilt your device to aim, or drag the screen when motion controls are unavailable. Lyrics fly towards you as the song plays.',
  mobileTap: 'Tap the screen when a lyric aligns with the center of the crosshair. Timing precision determines your score.',
  desktopMove: 'Move your mouse or trackpad to aim the viewfinder at the incoming lyrics.',
  desktopClick: 'Click the left mouse button when a lyric aligns perfectly with the crosshair. Your timing determines the score.',
  captured: 'Captured lyrics are archived as polaroid frames. Press Escape or use Pause to pause.',
  mobileCaptured: 'Captured lyrics are archived as polaroid frames. Tap Pause at any time to pause.',
  begin: 'Begin',
  start: 'Start',
  preparingGame: 'Preparing...',
  playbackFailed: 'Playback could not start. Press Start to retry.',
  gyroscope: 'GYROSCOPE / TOUCH MODE',
  cursor: 'CURSOR MODE',
  detected: 'DETECTED',
  disclaimer: 'Note: The Japanese translations have been produced using translation software and may not be perfectly accurate. Apologies for any errors.',
  loadingTrack: 'LOADING TRACK...',
  trackReady: 'TRACK READY',
  trackUnavailable: 'LYRIC TIMING UNAVAILABLE',
  trackUnavailableMessage: 'Synced lyrics could not be loaded. Check your connection and retry.',
  retry: 'Retry',
  forming: 'FORMING...',
  preloading: 'PRELOADING...',
};

const TEXT_JA = {
  howToPlay: '\u904A\u3073\u65B9',
  mobileTilt: '端末を傾けて照準を合わせます。モーション操作が使えない場合は画面をドラッグしてください。曲に合わせて歌詞が飛んできます。',
  mobileTap: '\u6B4C\u8A5E\u304C\u30AF\u30ED\u30B9\u30D8\u30A2\u306E\u4E2D\u5FC3\u306B\u63C3\u3063\u305F\u3089\u753B\u9762\u3092\u30BF\u30C3\u30D7\u3057\u3066\u304F\u3060\u3055\u3044\u3002\u30BF\u30A4\u30DF\u30F3\u30B0\u306E\u7CBE\u5EA6\u304C\u30B9\u30B3\u30A2\u306B\u5F71\u97FF\u3057\u307E\u3059\u3002',
  desktopMove: 'マウスやトラックパッドを動かしてファインダーを歌詞に合わせてください。',
  desktopClick: '歌詞がクロスヘアの中心に完全に揃ったら左クリックしてください。タイミングの精度がスコアに影響します。',
  captured: '\u30AD\u30E3\u30D7\u30C1\u30E3\u3057\u305F\u6B4C\u8A5E\u306F\u30DD\u30E9\u30ED\u30A4\u30C9\u30D5\u30EC\u30FC\u30E0\u3068\u3057\u3066\u30A2\u30FC\u30AB\u30A4\u30D6\u3055\u308C\u307E\u3059\u3002\u3044\u3064\u3067\u3082Esc\u30AD\u30FC\u3067\u4E00\u6642\u505C\u6B62\u3067\u304D\u307E\u3059\u3002',
  mobileCaptured: '撮影した歌詞はポラロイドとして保存されます。一時停止ボタンでいつでも中断できます。',
  begin: '\u59CB\u3081\u308B',
  start: '\u30B9\u30BF\u30FC\u30C8',
  preparingGame: '準備中...',
  playbackFailed: '再生を開始できませんでした。スタートを押して再試行してください。',
  gyroscope: 'ジャイロ・タッチモード',
  cursor: '\u30AB\u30FC\u30BD\u30EB\u30E2\u30FC\u30C9',
  detected: '\u691C\u51FA',
  disclaimer: '\u6CE8\u610F\uFF1A\u65E5\u672C\u8A9E\u306E\u7FFB\u8A33\u306F\u7FFB\u8A33\u30BD\u30D5\u30C8\u30A6\u30A7\u30A2\u3092\u4F7F\u7528\u3057\u3066\u304A\u308A\u3001\u5B8C\u5168\u306B\u6B63\u78BA\u3067\u306F\u306A\u3044\u5834\u5408\u304C\u3042\u308A\u307E\u3059\u3002\u8AA4\u308A\u304C\u3042\u308C\u3070\u304A\u8A6B\u3073\u7533\u3057\u4E0A\u3052\u307E\u3059\u3002',
  loadingTrack: '\u30C8\u30E9\u30C3\u30AF\u8AAD\u307F\u8FBC\u307F\u4E2D...',
  trackReady: '\u30C8\u30E9\u30C3\u30AF\u6E96\u5099\u5B8C\u4E86',
  trackUnavailable: '\u6B4C\u8A5E\u30BF\u30A4\u30DF\u30F3\u30B0\u60C5\u5831\u3092\u53D6\u5F97\u3067\u304D\u307E\u305B\u3093',
  trackUnavailableMessage: '\u540C\u671F\u6B4C\u8A5E\u3092\u8AAD\u307F\u8FBC\u3081\u307E\u305B\u3093\u3067\u3057\u305F\u3002\u63A5\u7D9A\u3092\u78BA\u8A8D\u3057\u3066\u518D\u8A66\u884C\u3057\u3066\u304F\u3060\u3055\u3044\u3002',
  retry: '\u518D\u8A66\u884C',
  forming: '\u5F62\u6210\u4E2D...',
  preloading: '事前読み込み中...',
};

const createMikuParticleData = () => {
  const coordinates = generateMikuSilhouette();
  const count = coordinates.length;
  const randomPositions = new Float32Array(count * 3);
  const targetPositions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const radius = 4 + Math.random() * 6;
    randomPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    randomPositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    randomPositions[i * 3 + 2] = radius * Math.cos(phi);
    targetPositions[i * 3] = coordinates[i].x;
    targetPositions[i * 3 + 1] = coordinates[i].y;
    targetPositions[i * 3 + 2] = coordinates[i].z;
    colors[i * 3] = 200 / 255;
    colors[i * 3 + 1] = 200 / 255;
    colors[i * 3 + 2] = 200 / 255;
    sizes[i] = 1.5 + Math.random() * 2;
  }

  return { randomPositions, targetPositions, colors, sizes };
};

const MIKU_PARTICLE_DATA = createMikuParticleData();

const MikuParticles = React.forwardRef((props, ref) => {
  const pointsRef = useRef();
  const groupRef = useRef();
  const { randomPositions, targetPositions, colors, sizes } = MIKU_PARTICLE_DATA;

  React.useImperativeHandle(ref, () => ({
    getGeometry: () => pointsRef.current?.geometry,
    getPoints: () => pointsRef.current,
    getGroup: () => groupRef.current,
    getRandomPositions: () => randomPositions,
    getTargetPositions: () => targetPositions,
  }));

  useEffect(() => {
    if (pointsRef.current) {
      const geo = pointsRef.current.geometry;
      geo.setAttribute('position', new THREE.BufferAttribute(randomPositions.slice(), 3));
      geo.setAttribute('color', new THREE.BufferAttribute(colors.slice(), 3));
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
          size={0.06}
          sizeAttenuation
          transparent
          opacity={0.8}
          depthWrite={false}
          blending={THREE.NormalBlending}
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
  const isMobile = usePrimaryTouch();
  const language = useStore(state => state.language);
  const appStage = useStore(state => state.appStage);
  const gamePrepared = useStore(state => state.gamePrepared);
  const playbackPending = useStore(state => state.playbackPending);
  const playbackError = useStore(state => state.playbackError);
  const t = language === 'ja' ? TEXT_JA : TEXT_EN;
  const particlesRef = useRef(null);

  useEffect(() => () => {
    const particles = particlesRef.current;
    if (particles) {
      const geometry = particles.getGeometry();
      if (geometry) {
        gsap.killTweensOf(geometry.attributes.position?.array);
        gsap.killTweensOf(geometry.attributes.color?.array);
      }
      gsap.killTweensOf(particles.getGroup()?.rotation);
      gsap.killTweensOf(particles.getPoints()?.material);
    }
  }, []);

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
    const unsub = useStore.subscribe((state, previousState) => {
        if (state.appStage === 'ready' && previousState.appStage !== 'ready' && particlesRef.current) {
          const pointsMesh = particlesRef.current.getPoints();
          if (pointsMesh && pointsMesh.material) {
            gsap.to(pointsMesh.material, {
              opacity: 0,
              duration: 1.5,
              ease: 'power2.inOut',
            });
          }
        }
      });
    return unsub;
  }, []);

  const handleBegin = () => {
    if (useStore.getState().appStage !== 'intro') return;
    const audio = new Audio(ASSETS.SFX_CLICK);
    audio.play().catch(() => {});

    if (!particlesRef.current) return;

    const geometry = particlesRef.current.getGeometry();
    const targetPositions = particlesRef.current.getTargetPositions();
    const group = particlesRef.current.getGroup();
    if (!geometry || !targetPositions) return;

    useStore.getState().setAppStage('forming');
    // Load the track and game code while the four-second formation runs.
    loadGame().catch(console.error);
    if (!useStore.getState().player) initializeTextAlive();

    const posAttr = geometry.getAttribute('position');
    const currentArray = posAttr.array;

    const tl = gsap.timeline({
      onUpdate: () => {
        posAttr.needsUpdate = true;
        if (geometry.getAttribute('color')) {
           geometry.getAttribute('color').needsUpdate = true;
        }
      },
      onComplete: () => {
        useStore.getState().completeIntroFormation();

        const existingPlayer = useStore.getState().player;
        if (!existingPlayer) {
          initializeTextAlive();
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

    const colorAttr = geometry.getAttribute('color');
    const colorArray = colorAttr ? colorAttr.array : null;
    const blueR = 143 / 255, blueG = 199 / 255, blueB = 234 / 255;

    tl.to(currentArray, {
      endArray: targetPositions,
      duration: 4,
      ease: 'power3.inOut',
    }, 0);

    if (colorArray) {
      const targetColors = new Float32Array(colorArray.length);
      for (let i = 0; i < targetColors.length; i += 3) {
        targetColors[i] = blueR;
        targetColors[i + 1] = blueG;
        targetColors[i + 2] = blueB;
      }
      tl.to(colorArray, {
        endArray: targetColors,
        duration: 4,
        ease: 'power3.inOut',
      }, 0);
    }
  };

  const handleStart = () => {
    if (!useStore.getState().startPlayback()) return;

    const orientationEvent = window.DeviceOrientationEvent;
    if (isMobile && typeof orientationEvent?.requestPermission === 'function') {
      orientationEvent.requestPermission()
        .then(permission => useStore.getState().setOrientationPermission(permission))
        .catch(() => useStore.getState().setOrientationPermission('denied'));
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
  const showTrackUnavailable = appStage === 'track_unavailable';
  const showOverlay = appStage === 'intro' || appStage === 'forming' || showTrackUnavailable;

  return (
    <div style={{
      position: 'absolute',
      top: 0, left: 0, width: '100%', height: '100%',
      zIndex: 200,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      background: '#000000',
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
        aria-label={language === 'en' ? '日本語に切り替え' : 'Switch to English'}
        lang={language === 'en' ? 'ja' : 'en'}
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

      <div className="intro-header-status" role="status" style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        fontFamily: '"Press Start 2P", sans-serif',
        fontSize: '0.6rem',
        letterSpacing: '2px',
        color: showTrackUnavailable ? '#e89090' : (appStage === 'ready' ? 'rgba(143,199,234,0.9)' : 'rgba(230,199,137,0.85)'),
        transition: 'color 0.5s ease',
        zIndex: 10,
      }}>
        {showTrackUnavailable ? t.trackUnavailable : (appStage === 'ready' ? t.trackReady : (appStage === 'loading_track' ? t.loadingTrack : (appStage === 'forming' ? t.forming : t.preloading)))}
      </div>

      <div className={`intro-viewport${showStartButton ? ' intro-viewport--ready' : ''}`} inert={appStage === 'forming' || undefined}>
        <div className="intro-content">
      {showOverlay && (
        <div className="intro-panel" style={{
          position: 'relative',
          zIndex: 1,
          textAlign: 'center',
          padding: '40px 30px',
          opacity: appStage === 'forming' ? 0 : 1,
          transition: 'opacity 1.0s ease-out',
          pointerEvents: appStage === 'forming' ? 'none' : 'auto',
          background: 'rgba(0, 0, 0, 0.25)',
          borderRadius: '16px',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
        }}>
          <div className="intro-title" style={{
            opacity: titleVisible ? 1 : 0,
            transform: titleVisible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
          }}>
            <div className="intro-crosshair" style={{
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

            <h1 className="intro-heading" style={{
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
              <span className="intro-heading-subtitle" style={{ fontSize: '2.4rem', letterSpacing: '10px' }}>Chance</span>
            </h1>

            <div className="intro-byline" style={{
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

          <div className="intro-instructions-wrapper" style={{
            opacity: contentVisible ? 1 : 0,
            transform: contentVisible ? 'translateY(0)' : 'translateY(16px)',
            transition: 'all 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
            marginTop: '36px',
          }}>
            <div className="intro-instructions" style={{
              textAlign: 'left',
              background: 'rgba(230,199,137,0.02)',
              border: '1px solid rgba(230,199,137,0.08)',
              padding: '22px 26px',
              lineHeight: '1.9',
              fontSize: language === 'ja' ? '0.95rem' : '1.1rem',
              color: COOL_BLUE,
              fontFamily: bodyFont,
            }}>
              <div className="intro-instructions-heading" style={{
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
              <p style={{ margin: 0, color: '#aaa' }}>
                {isMobile ? t.mobileCaptured : t.captured}
              </p>
            </div>
          </div>

          {showBeginButton && (
            <div className="intro-begin-area" style={{
              opacity: btnVisible ? 1 : 0,
              transform: btnVisible ? 'translateY(0)' : 'translateY(12px)',
              transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
              marginTop: '32px',
            }}>
              <button
                className="intro-begin-button"
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

              <div className="intro-detection" style={{
                marginTop: '15px',
                fontFamily: '"Press Start 2P", sans-serif',
                fontSize: '0.7rem',
                color: '#aaa',
                letterSpacing: '2px',
              }}>
                {isMobile ? t.gyroscope : t.cursor} {t.detected}
              </div>
            </div>
          )}

          {showTrackUnavailable && (
            <div style={{ marginTop: '28px', color: '#e89090', fontFamily: bodyFont }}>
              <p>{t.trackUnavailableMessage}</p>
              <button
                onClick={() => window.location.reload()}
                style={{
                  marginTop: '12px',
                  padding: '12px 36px',
                  fontSize: language === 'ja' ? '0.85rem' : '1rem',
                  fontFamily: bodyFont,
                  background: 'transparent',
                  color: WARM_GOLD,
                  border: `1px solid ${WARM_GOLD_HALF}`,
                  cursor: 'pointer',
                }}
              >
                {t.retry}
              </button>
            </div>
          )}
        </div>
      )}

      {showStartButton && (
        <div className="intro-start-area" style={{
          maxWidth: 'calc(100% - 32px)',
          position: 'relative',
          flexShrink: 0,
          marginBlock: 'auto',
          zIndex: 10,
          animation: 'fadeInUp 0.8s ease-out forwards',
        }}>
            <button
              onClick={handleStart}
              disabled={!gamePrepared || playbackPending}
              aria-busy={!gamePrepared || playbackPending}
              onMouseEnter={playHover}
              style={{
                fontFamily: language === 'ja' ? '"Shizuru", system-ui' : '"Kranky", sans-serif',
                padding: '16px 60px',
                fontSize: language === 'ja' ? '1.2rem' : '1.5rem',
                fontWeight: 400,
                background: WARM_GOLD,
                color: '#0a0a0a',
                border: `1.5px solid ${WARM_GOLD}`,
                cursor: 'pointer',
                letterSpacing: '6px',
                textTransform: language === 'ja' ? 'none' : 'uppercase',
                transition: 'all 0.35s ease',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 0 60px rgba(230,199,137,0.3)',
              }}
              onMouseOver={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.color = WARM_GOLD;
                e.target.style.boxShadow = '0 0 40px rgba(230,199,137,0.1), inset 0 0 40px rgba(230,199,137,0.03)';
              }}
              onMouseOut={(e) => {
                e.target.style.background = WARM_GOLD;
                e.target.style.color = '#0a0a0a';
                e.target.style.boxShadow = '0 0 60px rgba(230,199,137,0.3)';
              }}
            >
              {gamePrepared && !playbackPending ? t.start : t.preparingGame}
            </button>
            {playbackError && <p role="alert" style={{ color: '#e89090', fontFamily: bodyFont }}>{t.playbackFailed}</p>}
        </div>
      )}

          <div className="intro-disclaimer" style={{
            textAlign: 'center',
            fontFamily: language === 'ja' ? '"Shizuru", system-ui' : '"Kranky", sans-serif',
            fontSize: language === 'ja' ? '0.65rem' : '0.8rem',
            color: '#aaa',
            lineHeight: 1.5,
            zIndex: 1,
          }}>
            {t.disclaimer}
          </div>
        </div>
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
          0% { opacity: 0; transform: translateY(12px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};
