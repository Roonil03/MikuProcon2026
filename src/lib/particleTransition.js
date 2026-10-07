// Match GSAP power2 easing while keeping animation tied to the song clock.
export function transitionProgress(position, start, duration, scatter) {
  const t = Math.min(1, Math.max(0, (position - start) / duration));
  return scatter
    ? (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
    : 1 - Math.pow(1 - t, 3);
}

// Used only when changing targets, never for every displayed frame.
export function snapshotTransition(from, to, progress) {
  for (let i = 0; i < from.length; i++) from[i] += (to[i] - from[i]) * progress;
}
