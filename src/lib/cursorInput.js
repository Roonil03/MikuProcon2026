export function canTrackCursor(state) {
  return state.appStatus === 'playing' && !state.isPaused && !state.arMode
    && !(state.isMobile && state.orientationActive);
}

export function attachCursorInput(target, getState, onMove) {
  let frame = null;
  let x = 0;
  let y = 0;
  const handleMove = event => {
    if (event.isPrimary === false || !canTrackCursor(getState())) return;
    x = event.clientX;
    y = event.clientY;
    if (frame !== null) return;
    frame = target.requestAnimationFrame(() => {
      frame = null;
      if (canTrackCursor(getState())) onMove(x, y);
    });
  };
  target.addEventListener('pointermove', handleMove, { passive: true });
  return () => {
    if (frame !== null) target.cancelAnimationFrame(frame);
    target.removeEventListener('pointermove', handleMove);
  };
}
