import { useMemo, useRef } from 'react';
import { useFrame, extend } from '@react-three/fiber';
import { shaderMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '../store/useStore';
import characterData from '../lib/characterData.json';
import { snapshotTransition, transitionProgress } from '../lib/particleTransition';

const COUNT = 1500;
const ParticleMorphMaterial = shaderMaterial(
  { uProgress: 0, uScale: 1 },
  `uniform float uProgress;
   uniform float uScale;
   attribute vec3 targetPosition;
   attribute vec3 targetColor;
   varying vec3 vColor;
   void main() {
     vColor = mix(color, targetColor, uProgress);
     vec4 viewPosition = modelViewMatrix * vec4(mix(position, targetPosition, uProgress), 1.0);
     gl_Position = projectionMatrix * viewPosition;
     gl_PointSize = 0.15 * uScale / max(0.01, -viewPosition.z);
   }`,
  `varying vec3 vColor;
   void main() { gl_FragColor = vec4(vColor, 0.7); }`,
);
extend({ ParticleMorphMaterial });

function scatterTarget() {
  const positions = new Float32Array(COUNT * 3);
  const colors = new Float32Array(COUNT * 3).fill(0.5);
  for (let i = 0; i < COUNT; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 100;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 100 - 50;
  }
  return { positions, colors };
}

export function CharacterParticles() {
  const points = useRef();
  const material = useRef();
  const animation = useRef({ gap: null, start: 0, duration: 1, scatter: false });
  // Prepare each shape and the scatter destination once before playback.
  const data = useMemo(() => {
    const scatter = scatterTarget();
    const targets = characterData.map(shape => {
      const positions = new Float32Array(COUNT * 3);
      const colors = new Float32Array(COUNT * 3);
      for (let i = 0; i < COUNT; i++) {
        const point = shape.points[i] || shape.points[0];
        positions.set([point.x, point.y, -30], i * 3);
        colors.set(point.color, i * 3);
      }
      return { positions, colors };
    });
    return {
      scatter, targets,
      positions: scatter.positions.slice(), colors: new Float32Array(COUNT * 3).fill(1),
      targetPositions: scatter.positions.slice(), targetColors: new Float32Array(COUNT * 3).fill(1),
    };
  }, []);

  useFrame(({ size, gl }) => {
    if (!points.current || !material.current) return;
    const { currentPosition, instrumentalGaps, isPaused, appStatus } = useStore.getState();
    material.current.uScale = size.height * gl.getPixelRatio() / 2;
    if (isPaused || appStatus !== 'playing') return;
    const activeGap = instrumentalGaps.find(gap => currentPosition >= gap.startTime && currentPosition <= gap.endTime) || null;
    const previous = animation.current;
    if (previous.gap !== activeGap) {
      // Snapshot an interrupted morph so a seek or short gap never jumps.
      const progress = transitionProgress(currentPosition, previous.start, previous.duration, previous.scatter);
      snapshotTransition(data.positions, data.targetPositions, progress);
      snapshotTransition(data.colors, data.targetColors, progress);
      const target = activeGap
        ? data.targets[Math.floor(activeGap.startTime / 1000) % data.targets.length]
        : data.scatter;
      data.targetPositions.set(target.positions);
      data.targetColors.set(target.colors);
      const attributes = points.current.geometry.attributes;
      for (const name of ['position', 'color', 'targetPosition', 'targetColor']) attributes[name].needsUpdate = true;
      animation.current = { gap: activeGap, start: currentPosition, duration: activeGap ? 2000 : 3000, scatter: !activeGap };
    }
    const next = animation.current;
    material.current.uProgress = transitionProgress(currentPosition, next.start, next.duration, next.scatter);
  });

  return (
    <points ref={points} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[data.positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[data.colors, 3]} />
        <bufferAttribute attach="attributes-targetPosition" args={[data.targetPositions, 3]} />
        <bufferAttribute attach="attributes-targetColor" args={[data.targetColors, 3]} />
      </bufferGeometry>
      <particleMorphMaterial ref={material} vertexColors transparent depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}
