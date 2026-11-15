import { memo, Suspense, useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree, extend } from '@react-three/fiber';
import { PerspectiveCamera, Text, shaderMaterial } from '@react-three/drei';
import { EffectComposer, DepthOfField, ChromaticAberration, Bloom } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { XR } from '@react-three/xr';
import * as THREE from 'three';
import gsap from 'gsap';
import { useStore } from '../store/useStore';
import { getCapturedIds, getLyricIndex } from '../lib/captureLookup';
import { playShutterSound } from '../lib/soundEffects';
import { CharacterParticles } from './CharacterParticles';
import { xrStore } from '../lib/xrStore';
import { attachXRSelect } from '../lib/xrInput';
import { createCaptureEngine, lowerBound } from '../lib/captureEngine';
import { usePrimaryTouch } from '../lib/inputCapabilities';
import { canUseOrientation, hasRecentOrientation, readOrientation } from '../lib/orientationInput';

// Asynchronously load the WebAssembly module
import initWasm from '../../build/release.wasm?init';
let captureEngine = createCaptureEngine(null);
const captureMatrix = new THREE.Matrix4();

initWasm({ env: { abort() { throw new Error('WASM capture aborted'); } } }).then(instance => {
  captureEngine = createCaptureEngine(instance.exports);
}).catch(console.error);

const SoundscapeMaterial = shaderMaterial(
  {
    uTime: 0,
    uIntensity: 0,
    uArMode: 0,
  },
  `
    uniform float uTime;
    uniform float uIntensity;
    varying vec2 vUv;
    varying float vNoise;

    vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
    vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
    float snoise(vec3 v){ 
      const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
      const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

      vec3 i  = floor(v + dot(v, C.yyy) );
      vec3 x0 = v - i + dot(i, C.xxx) ;

      vec3 g = step(x0.yzx, x0.xyz);
      vec3 l = 1.0 - g;
      vec3 i1 = min( g.xyz, l.zxy );
      vec3 i2 = max( g.xyz, l.zxy );

      vec3 x1 = x0 - i1 + 1.0 * C.xxx;
      vec3 x2 = x0 - i2 + 2.0 * C.xxx;
      vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;

      i = mod(i, 289.0 ); 
      vec4 p = permute( permute( permute( 
                 i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
               + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
               + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

      float n_ = 1.0/7.0;
      vec3  ns = n_ * D.wyz - D.xzx;

      vec4 j = p - 49.0 * floor(p * ns.z *ns.z);

      vec4 x_ = floor(j * ns.z);
      vec4 y_ = floor(j - 7.0 * x_ );

      vec4 x = x_ *ns.x + ns.yyyy;
      vec4 y = y_ *ns.x + ns.yyyy;
      vec4 h = 1.0 - abs(x) - abs(y);

      vec4 b0 = vec4( x.xy, y.xy );
      vec4 b1 = vec4( x.zw, y.zw );

      vec4 s0 = floor(b0)*2.0 + 1.0;
      vec4 s1 = floor(b1)*2.0 + 1.0;
      vec4 sh = -step(h, vec4(0.0));

      vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
      vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

      vec3 p0 = vec3(a0.xy,h.x);
      vec3 p1 = vec3(a0.zw,h.y);
      vec3 p2 = vec3(a1.xy,h.z);
      vec3 p3 = vec3(a1.zw,h.w);

      vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
      p0 *= norm.x;
      p1 *= norm.y;
      p2 *= norm.z;
      p3 *= norm.w;

      vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
      m = m * m;
      return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), 
                                    dot(p2,x2), dot(p3,x3) ) );
    }

    void main() {
      vUv = uv;
      vec3 pos = position;
      float noiseFreq = 0.5;
      float noiseAmp = 2.0 * uIntensity;
      vec3 noisePos = vec3(pos.x * noiseFreq + uTime, pos.y * noiseFreq, pos.z * noiseFreq);
      float noise = snoise(noisePos);
      vNoise = noise;
      
      pos += normal * noise * noiseAmp;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `,
  `
    uniform float uTime;
    uniform float uIntensity;
    uniform float uArMode;
    varying vec2 vUv;
    varying float vNoise;

    void main() {
      vec3 colorCoolBlue = vec3(0.56, 0.78, 0.92);
      vec3 colorWarmGold = vec3(0.90, 0.78, 0.54);
      vec3 baseColor = colorCoolBlue * 0.15;

      float pulse = max(0.0, vNoise) * uIntensity;
      vec3 finalColor = mix(baseColor, colorWarmGold, pulse);

      float gridX = smoothstep(0.95, 1.0, fract(vUv.x * 20.0));
      float gridY = smoothstep(0.95, 1.0, fract(vUv.y * 20.0));
      float gridLine = max(gridX, gridY);
      
      finalColor += gridLine * colorCoolBlue * 0.5 * max(0.2, uIntensity);

      float alpha = max(pulse * 0.6, gridLine * 0.3);
      if (uArMode < 0.5) {
        alpha = 1.0;
      }
      
      gl_FragColor = vec4(finalColor, min(1.0, alpha));
    }
  `
);

extend({ SoundscapeMaterial });

const SoundscapeCorridor = () => {
  const materialRef = useRef();
  const intensity = useRef(0);
  const lastBeat = useRef(null);

  useFrame((state, delta) => {
    if (!materialRef.current) return;
    materialRef.current.uTime += delta;
    
    const storeState = useStore.getState();
    if (storeState.currentBeat !== lastBeat.current) {
      lastBeat.current = storeState.currentBeat;
      intensity.current = 1;
    }
    intensity.current = Math.max(0, intensity.current - delta * 2.5);
    materialRef.current.uIntensity = intensity.current;
    materialRef.current.uArMode = storeState.arMode ? 1.0 : 0.0;
  });

  return (
    <mesh position={[0, 0, -20]} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[10, 10, 100, 32, 1, true]} />
      <soundscapeMaterial ref={materialRef} side={THREE.BackSide} transparent />
    </mesh>
  );
};

const CameraController = () => {
  const { camera } = useThree();
  const targetRotation = useRef({ x: 0, y: 0 });
  const isMobile = usePrimaryTouch();
  const lastOrientation = useRef(-Infinity);
  const requiresGyroscopePermission = useRef(false);

  useEffect(() => {
    useStore.getState().setIsMobile(isMobile);
    lastOrientation.current = -Infinity;
    useStore.getState().setOrientationActive(false);
    if (isMobile && window.DeviceOrientationEvent) {
      const requiresPermission = typeof window.DeviceOrientationEvent.requestPermission === 'function';
      requiresGyroscopePermission.current = requiresPermission;
      const handleOrientation = (event) => {
        if (!canUseOrientation(useStore.getState(), requiresPermission)) return;
        const rotation = readOrientation(event);
        if (!rotation) return;
        targetRotation.current = rotation;
        lastOrientation.current = performance.now();
      };

      window.addEventListener('deviceorientation', handleOrientation);
      return () => {
        window.removeEventListener('deviceorientation', handleOrientation);
        useStore.getState().setOrientationActive(false);
      };
    }

    return undefined;
  }, [isMobile]);

  /* eslint-disable react-hooks/immutability -- Three.js cameras are updated imperatively inside R3F's frame loop. */
  useFrame((state, delta) => {
    const storeState = useStore.getState();
    const { cursorPosition, sweepOffset } = storeState;
    const hasGyroscope = hasRecentOrientation(storeState, requiresGyroscopePermission.current,
      lastOrientation.current, performance.now());
    storeState.setOrientationActive(hasGyroscope);

    if (!hasGyroscope) {
      const nx = cursorPosition.x * 2 - 1;
      const ny = cursorPosition.y * 2 - 1;
      targetRotation.current.x = -ny * 0.4;
      targetRotation.current.y = nx * 0.4;
    }

    if (state.gl.xr.isPresenting) return;
    const blend = 1 - Math.exp(-3.7 * delta);
    camera.rotation.x = THREE.MathUtils.lerp(camera.rotation.x, targetRotation.current.x, blend);
    camera.rotation.y = THREE.MathUtils.lerp(camera.rotation.y, targetRotation.current.y + sweepOffset.value, blend);
  });
  /* eslint-enable react-hooks/immutability */

  return null;
};

const LyricMesh = memo(({ lyric, characters, textRefs }) => {
  return (
    <Text
      ref={object => {
        if (object) textRefs.current.set(lyric.id, object);
        else textRefs.current.delete(lyric.id);
      }}
      position={[lyric.x, lyric.y, -100]}
      fontSize={2}
      color="white"
      anchorX="center"
      anchorY="middle"
      visible={false}
      font={`${import.meta.env.BASE_URL}fonts/NotoSansJP-Bold.otf`}
      characters={characters}
    >
      {lyric.text}
    </Text>
  );
});

const LyricsCorridor = () => {
  const textRefs = useRef(new Map());
  const lyricsData = useStore(state => state.lyricsData);
  const activeChunkIndex = useStore(state => Math.floor(state.currentPosition / 2000));
  const shutterSpeed = useStore(state => state.shutterSpeed);
  // A shared cache key prepares the entire song's glyphs, including later chunks.
  const characters = useMemo(() => [...new Set(lyricsData.map(lyric => lyric.text).join(''))].join(''), [lyricsData]);

  const activeLyrics = useMemo(() => {
    const startTime = activeChunkIndex * 2000 - 1000;
    const endTime = (activeChunkIndex + 1) * 2000 + 3000 / shutterSpeed;
    const lyrics = lyricsData.slice(lowerBound(lyricsData, startTime), lowerBound(lyricsData, endTime + 1));
    // Even songs with a long lead-in need one hidden text to prepare the font.
    return lyrics.length || activeChunkIndex !== 0 ? lyrics : lyricsData.slice(0, 1);
  }, [lyricsData, activeChunkIndex, shutterSpeed]);

  useFrame(() => {
    const { currentPosition, shutterSpeed: currentShutterSpeed } = useStore.getState();
    const visibleWindow = 3000 / currentShutterSpeed;

    for (const lyric of activeLyrics) {
      const text = textRefs.current.get(lyric.id);
      if (!text) continue;

      const timeUntilSung = lyric.startTime - currentPosition;
      if (timeUntilSung > visibleWindow || timeUntilSung < -1000) {
        text.visible = false;
        continue;
      }

      text.visible = true;
      text.position.set(lyric.x, lyric.y, (timeUntilSung / visibleWindow) * -100);

      let opacity = 1;
      if (timeUntilSung > visibleWindow * 0.85) {
        opacity = (visibleWindow - timeUntilSung) / (visibleWindow * 0.15);
      } else if (timeUntilSung < 0) {
        opacity = 1 - (Math.abs(timeUntilSung) / 1000);
      }
      text.fillOpacity = Math.max(0, opacity);
    }
  });

  return (
    <group>
      {activeLyrics.map((lyric) => (
        <LyricMesh key={lyric.id} lyric={lyric} characters={characters} textRefs={textRefs} />
      ))}
    </group>
  );
};

const ScenePreparation = () => {
  const started = useRef(false);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);
  useFrame(({ gl, scene, camera, invalidate }) => {
    if (started.current) return;
    let pendingText = false;
    let textCount = 0;
    scene.traverse(object => {
      if ('textRenderInfo' in object) {
        textCount++;
        if (!object.textRenderInfo) pendingText = true;
      }
    });
    if (pendingText || textCount === 0) return; // Text's onSync requests another demand frame.
    started.current = true;
    gl.compileAsync(scene, camera).catch(error => {
      // Shader preparation is optional; retain ordinary rendering as fallback.
      console.error('Scene preparation failed', error);
    }).then(() => {
      if (!mounted.current) return;
      useStore.getState().setGamePrepared(true);
      invalidate();
    });
  });
  return null;
};

const DynamicPostProcessing = ({ isMobileDevice }) => {
  const shutterSpeed = useStore(state => state.shutterSpeed);

  const dofFocal = useMemo(() => Math.max(0.005, 0.05 / shutterSpeed), [shutterSpeed]);
  const dofBokeh = useMemo(() => Math.max(0.15, 1.8 / shutterSpeed), [shutterSpeed]);
  const chromaOffset = useMemo(() => {
    const val = Math.min(0.01, 0.005 / shutterSpeed);
    return new THREE.Vector2(val, val);
  }, [shutterSpeed]);

  return (
    <EffectComposer multisampling={2}>
      {!isMobileDevice && (
        <DepthOfField
          focusDistance={0}
          focalLength={dofFocal}
          bokehScale={dofBokeh}
          height={480}
        />
      )}
      <Bloom
        luminanceThreshold={0.4}
        luminanceSmoothing={0.9}
        height={300}
        opacity={0.8}
      />
      <ChromaticAberration
        blendFunction={BlendFunction.NORMAL}
        offset={chromaOffset}
      />
    </EffectComposer>
  );
};

const performCapture = (camera, pointer) => {
  const {
    appStatus,
    isPaused,
    currentPosition,
    lyricsData,
    capturedLyrics,
    captureLyric,
    isMobile,
    arMode,
    shutterSpeed,
    sweepOffset,
  } = useStore.getState();

  if (appStatus !== 'playing' || isPaused) return false;

  const ndcX = pointer.x * 2 - 1;
  const ndcY = -(pointer.y * 2 - 1);
  camera.updateMatrixWorld();
  captureMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
  const capturedIds = getCapturedIds(capturedLyrics);
  const closestId = captureEngine(lyricsData, capturedIds, currentPosition, shutterSpeed,
    captureMatrix.elements, ndcX, ndcY, isMobile || arMode);
  const closestLyric = closestId === -1 ? null : getLyricIndex(lyricsData).get(closestId);
  const minDiff = closestLyric ? Math.abs(closestLyric.startTime - currentPosition) : Infinity;

  if (closestLyric) {
    const scoreDelta = Math.max(0, 100 - minDiff);
    if (!captureLyric(closestLyric.id, Math.floor(scoreDelta))) return false;
    playShutterSound();

    if (scoreDelta > 90) {
      gsap.killTweensOf(sweepOffset);
      const tl = gsap.timeline();
      tl.to(sweepOffset, { value: Math.PI / 12, duration: 0.15, ease: "power2.out" })
        .to(sweepOffset, { value: Math.PI / 12, duration: 0.2 })
        .to(sweepOffset, { value: 0, duration: 0.25, ease: "power2.inOut" });
    }

    return true;
  }

  return false;
};

const HitDetectionLayer = () => {
  const { camera, gl } = useThree();

  useEffect(() => {
    const canvas = gl.domElement;
    const handlePointer = event => {
      if (gl.xr.isPresenting) return; // XR selection uses its session listener.
      if (!event.isPrimary || (event.pointerType === 'mouse' && event.button !== 0)) return;
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      performCapture(camera, {
        x: (event.clientX - rect.left) / rect.width,
        y: (event.clientY - rect.top) / rect.height,
      });
    };
    canvas.addEventListener('pointerdown', handlePointer);
    return () => canvas.removeEventListener('pointerdown', handlePointer);
  }, [camera, gl]);

  useEffect(() => {
    // XR selection has no client coordinates. Listen to the session itself so
    // moving the viewer never leaves a fixed, invisible input plane behind.
    return attachXRSelect(xrStore, () => performCapture(camera, { x: 0.5, y: 0.5 }));
  }, [camera]);

  return null;
};

const hasLimitedHardware = typeof navigator !== 'undefined'
  && ((navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) <= 4);

export const Scene = () => {
  const isMobile = usePrimaryTouch();
  const useReducedEffects = isMobile || hasLimitedHardware;
  const maxDevicePixelRatio = useReducedEffects ? 1.25 : 1.5;
  const arMode = useStore(state => state.arMode);
  const isPaused = useStore(state => state.isPaused);
  const appStatus = useStore(state => state.appStatus);

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1, backgroundColor: arMode ? 'transparent' : '#0a0a0f' }}>
      <Canvas
        dpr={[1, maxDevicePixelRatio]}
        gl={{ antialias: !useReducedEffects, powerPreference: 'high-performance' }}
        frameloop={appStatus === 'playing' && !isPaused ? 'always' : 'demand'}
      >
        <XR store={xrStore}>
          <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={75} />
          <CameraController />
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 10]} intensity={1.5} />

          <Suspense fallback={null}>
            <LyricsCorridor />
          </Suspense>
          <CharacterParticles />
          <HitDetectionLayer />
          
          {!arMode && <SoundscapeCorridor />}
          {!arMode && !useReducedEffects && <DynamicPostProcessing isMobileDevice={isMobile} />}
          <ScenePreparation />
        </XR>
      </Canvas>
    </div>
  );
};
