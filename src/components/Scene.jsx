import React, { useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera, Text } from '@react-three/drei';
import { EffectComposer, DepthOfField, ChromaticAberration, Bloom } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { useStore } from '../store/useStore';

const LyricsCorridor = () => {
  const { activeLyrics } = useStore();
  
  return (
    <group>
      {activeLyrics.map((lyric) => (
        <Text
          key={lyric.id}
          position={[0, 0, lyric.z || -50]}
          fontSize={2}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {lyric.text}
        </Text>
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

export const Scene = () => {
  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1, backgroundColor: '#050505' }}>
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={75} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 10]} intensity={1.5} />
        
        <LyricsCorridor />
        <PostProcessingEffects />
      </Canvas>
    </div>
  );
};
