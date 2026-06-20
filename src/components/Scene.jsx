import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PerspectiveCamera, Text } from '@react-three/drei';
import { EffectComposer, DepthOfField, ChromaticAberration, Bloom } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';
import { useStore } from '../store/useStore';
import { ASSETS } from '../constants/assets';

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
    } else {
      const handleMouseMove = (event) => {
        const nx = (event.clientX / window.innerWidth) * 2 - 1;
        const ny = (event.clientY / window.innerHeight) * 2 - 1;
        targetRotation.current.x = -ny * 0.15;
        targetRotation.current.y = nx * 0.15;
      };

      window.addEventListener('mousemove', handleMouseMove);
      return () => window.removeEventListener('mousemove', handleMouseMove);
    }
  }, []);

  useFrame(() => {
    camera.rotation.x = THREE.MathUtils.lerp(camera.rotation.x, targetRotation.current.x, 0.05);
    camera.rotation.y = THREE.MathUtils.lerp(camera.rotation.y, targetRotation.current.y, 0.05);
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

const HitDetectionLayer = () => {
  const { viewport } = useThree();

  const handlePointerDown = () => {
    const { currentPosition, lyricsData, captureLyric, incrementScore } = useStore.getState();

    let closestLyric = null;
    let minDiff = Infinity;

    lyricsData.forEach(lyric => {
      const diff = Math.abs(lyric.startTime - currentPosition);
      if (diff < minDiff && diff < 300) {
        minDiff = diff;
        closestLyric = lyric;
      }
    });

    if (closestLyric) {
      const audio = new Audio(ASSETS.SFX_CLICK);
      audio.play().catch(() => {});

      const scoreDelta = Math.max(0, 100 - minDiff);
      incrementScore(Math.floor(scoreDelta));
      captureLyric(closestLyric.id);
    }
  };

  return (
    <mesh position={[0, 0, 4.9]} onPointerDown={handlePointerDown}>
      <planeGeometry args={[viewport.width * 2, viewport.height * 2]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
    </mesh>
  );
};

export const Scene = () => {
  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1, backgroundColor: '#050505' }}>
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={75} />
        <CameraController />
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 10]} intensity={1.5} />

        <LyricsCorridor />
        <HitDetectionLayer />
        <DynamicPostProcessing />
      </Canvas>
    </div>
  );
};
