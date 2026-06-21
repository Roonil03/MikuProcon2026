import React, { useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree, extend } from '@react-three/fiber';
import { PerspectiveCamera, Text, shaderMaterial } from '@react-three/drei';
import { EffectComposer, DepthOfField, ChromaticAberration, Bloom } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { XR, createXRStore } from '@react-three/xr';
import * as THREE from 'three';
import gsap from 'gsap';
import { useStore } from '../store/useStore';
import { ASSETS } from '../constants/assets';

const SoundscapeMaterial = shaderMaterial(
  {
    uTime: 0,
    uIntensity: 0,
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
    varying vec2 vUv;
    varying float vNoise;

    void main() {
      vec3 colorCoolBlue = vec3(0.56, 0.78, 0.92);
      vec3 colorWarmGold = vec3(0.90, 0.78, 0.54);

      float pulse = max(0.0, vNoise) * uIntensity;
      vec3 finalColor = mix(colorCoolBlue, colorWarmGold, pulse);

      float gridX = smoothstep(0.95, 1.0, fract(vUv.x * 20.0));
      float gridY = smoothstep(0.95, 1.0, fract(vUv.y * 20.0));
      float gridLine = max(gridX, gridY);

      float alpha = max(pulse * 0.6, gridLine * 0.15);
      
      gl_FragColor = vec4(finalColor, min(1.0, alpha));
    }
  `
);

extend({ SoundscapeMaterial });

const SoundscapeCorridor = () => {
  const materialRef = useRef();

  useFrame((state, delta) => {
    if (!materialRef.current) return;
    materialRef.current.uTime += delta;
    
    const storeState = useStore.getState();
    if (storeState.beatPulse > 0) {
      storeState.decayBeat(delta * 2.5);
    }
    materialRef.current.uIntensity = storeState.beatPulse;
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
  const hasGyroscope = useRef(false);

  useEffect(() => {
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    useStore.getState().setIsMobile(isTouchDevice);

    if (isTouchDevice && window.DeviceOrientationEvent) {
      const requestPermission = async () => {
        if (typeof DeviceOrientationEvent.requestPermission === 'function') {
          try {
            const permission = await DeviceOrientationEvent.requestPermission();
            if (permission === 'granted') hasGyroscope.current = true;
          } catch (e) {
            hasGyroscope.current = false;
          }
        } else {
          hasGyroscope.current = true;
        }
      };
      requestPermission();

      const handleOrientation = (event) => {
        if (!hasGyroscope.current) return;
        const beta = event.beta || 0;
        const gamma = event.gamma || 0;
        targetRotation.current.x = THREE.MathUtils.clamp(beta * 0.01, -0.5, 0.5);
        targetRotation.current.y = THREE.MathUtils.clamp(gamma * 0.01, -0.5, 0.5);
      };

      window.addEventListener('deviceorientation', handleOrientation);
      return () => window.removeEventListener('deviceorientation', handleOrientation);
    }

    return undefined;
  }, []);

  useFrame(() => {
    const { isMobile, cursorPosition, sweepOffset } = useStore.getState();

    if (!isMobile) {
      const nx = cursorPosition.x * 2 - 1;
      const ny = cursorPosition.y * 2 - 1;
      targetRotation.current.x = -ny * 0.4;
      targetRotation.current.y = nx * 0.4;
    }

    camera.rotation.x = THREE.MathUtils.lerp(camera.rotation.x, targetRotation.current.x, 0.06);
    camera.rotation.y = THREE.MathUtils.lerp(camera.rotation.y, targetRotation.current.y + sweepOffset.value, 0.06);
  });

  return null;
};

const LyricMesh = ({ lyric }) => {
  const textRef = useRef();

  useFrame(() => {
    const { currentPosition, shutterSpeed } = useStore.getState();
    const timeUntilSung = lyric.startTime - currentPosition;
    const visibleWindow = 3000 / shutterSpeed;

    if (timeUntilSung > visibleWindow || timeUntilSung < -1000) {
      if (textRef.current) textRef.current.visible = false;
      return;
    }

    if (textRef.current) {
      textRef.current.visible = true;
      const zPos = (timeUntilSung / visibleWindow) * -100;
      textRef.current.position.set(lyric.x, lyric.y, zPos);

      let opacity = 1;
      if (timeUntilSung > visibleWindow * 0.85) {
        opacity = (visibleWindow - timeUntilSung) / (visibleWindow * 0.15);
      } else if (timeUntilSung < 0) {
        opacity = 1 - (Math.abs(timeUntilSung) / 1000);
      }
      textRef.current.fillOpacity = Math.max(0, opacity);
    }
  });

  return (
    <Text
      ref={textRef}
      position={[lyric.x, lyric.y, -100]}
      fontSize={2}
      color="white"
      anchorX="center"
      anchorY="middle"
      visible={false}
      font="/MikuProcon2026/fonts/NotoSansJP-Bold.otf"
    >
      {lyric.text}
    </Text>
  );
};

const LyricsCorridor = () => {
  const lyricsData = useStore(state => state.lyricsData);

  return (
    <group>
      {lyricsData.map((lyric) => (
        <LyricMesh key={lyric.id} lyric={lyric} />
      ))}
    </group>
  );
};

const DynamicPostProcessing = () => {
  const shutterSpeed = useStore(state => state.shutterSpeed);

  const dofFocal = useMemo(() => Math.max(0.005, 0.05 / shutterSpeed), [shutterSpeed]);
  const dofBokeh = useMemo(() => Math.max(0.5, 6 / shutterSpeed), [shutterSpeed]);
  const chromaOffset = useMemo(() => {
    const val = Math.min(0.01, 0.005 / shutterSpeed);
    return [val, val];
  }, [shutterSpeed]);

  return (
    <EffectComposer>
      <DepthOfField
        focusDistance={0}
        focalLength={dofFocal}
        bokehScale={dofBokeh}
        height={480}
      />
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

const performCapture = (camera, viewport) => {
  const { currentPosition, lyricsData, captureLyric, incrementScore, isMobile, cursorPosition, shutterSpeed, sweepOffset } = useStore.getState();

  let closestLyric = null;
  let minDiff = Infinity;
  const timeWindow = 300 / shutterSpeed;

  if (isMobile) {
    lyricsData.forEach(lyric => {
      const diff = Math.abs(lyric.startTime - currentPosition);
      if (diff < minDiff && diff < timeWindow) {
        minDiff = diff;
        closestLyric = lyric;
      }
    });
  } else {
    const ndcX = cursorPosition.x * 2 - 1;
    const ndcY = -(cursorPosition.y * 2 - 1);

    lyricsData.forEach(lyric => {
      const timeDiff = Math.abs(lyric.startTime - currentPosition);
      if (timeDiff > timeWindow) return;

      const visibleWindow = 3000 / shutterSpeed;
      const timeUntilSung = lyric.startTime - currentPosition;
      const zPos = (timeUntilSung / visibleWindow) * -100;

      const worldPos = new THREE.Vector3(lyric.x, lyric.y, zPos);
      worldPos.project(camera);

      const dx = worldPos.x - ndcX;
      const dy = worldPos.y - ndcY;
      const screenDist = Math.sqrt(dx * dx + dy * dy);

      if (screenDist < 0.25 && timeDiff < minDiff) {
        minDiff = timeDiff;
        closestLyric = lyric;
      }
    });
  }

  if (closestLyric) {
    const audio = new Audio(ASSETS.SFX_CLICK);
    audio.play().catch(() => {});

    const scoreDelta = Math.max(0, 100 - minDiff);
    incrementScore(Math.floor(scoreDelta));
    captureLyric(closestLyric.id);

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
  const { viewport, camera } = useThree();

  const handlePointerDown = () => {
    performCapture(camera, viewport);
  };

  return (
    <mesh position={[0, 0, 4.9]} onPointerDown={handlePointerDown}>
      <planeGeometry args={[viewport.width * 2, viewport.height * 2]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
    </mesh>
  );
};

export const xrStore = createXRStore();

export const Scene = () => {
  const arMode = useStore(state => state.arMode);

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1, backgroundColor: arMode ? 'transparent' : '#0a0a0f' }}>
      <Canvas>
        <XR store={xrStore}>
          <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={75} />
          <CameraController />
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 10]} intensity={1.5} />

          <LyricsCorridor />
          <HitDetectionLayer />
          
          {!arMode && <SoundscapeCorridor />}
          {!arMode && <DynamicPostProcessing />}
        </XR>
      </Canvas>
    </div>
  );
};
