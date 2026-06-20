import React, { useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PerspectiveCamera, Text } from '@react-three/drei';
import { EffectComposer, DepthOfField, ChromaticAberration, Bloom } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { useStore } from '../store/useStore';
import { ASSETS } from '../constants/assets';

const LyricMesh = ({ lyric }) => {
  const textRef = useRef();
  
  useFrame(() => {
    const { currentPosition } = useStore.getState();
    const timeUntilSung = lyric.startTime - currentPosition;
    
    if (timeUntilSung > 3000 || timeUntilSung < -1000) {
      if (textRef.current) textRef.current.visible = false;
      return;
    }
    
    if (textRef.current) {
      textRef.current.visible = true;
      const zPos = (timeUntilSung / 3000) * -100;
      textRef.current.position.set(lyric.x, lyric.y, zPos);
      
      let opacity = 1;
      if (timeUntilSung > 2500) opacity = (3000 - timeUntilSung) / 500;
      else if (timeUntilSung < 0) opacity = 1 - (Math.abs(timeUntilSung) / 1000);
      
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

const PostProcessingEffects = () => {
  return (
    <EffectComposer>
      <DepthOfField focusDistance={0} focalLength={0.02} bokehScale={2} height={480} />
      <Bloom luminanceThreshold={0.5} luminanceSmoothing={0.9} height={300} opacity={0.8} />
      <ChromaticAberration
        blendFunction={BlendFunction.NORMAL}
        offset={[0.002, 0.002]}
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
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 10]} intensity={1.5} />
        
        <LyricsCorridor />
        <HitDetectionLayer />
        <PostProcessingEffects />
      </Canvas>
    </div>
  );
};
