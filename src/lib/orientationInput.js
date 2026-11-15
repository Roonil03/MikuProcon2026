export function readOrientation(event) {
  if (!Number.isFinite(event.beta) || !Number.isFinite(event.gamma)) return null;
  return {
    x: Math.max(-0.5, Math.min(0.5, event.beta * 0.01)),
    y: Math.max(-0.5, Math.min(0.5, event.gamma * 0.01)),
  };
}

export function canUseOrientation(state, requiresPermission) {
  return state.isMobile && !state.arMode
    && (requiresPermission ? state.orientationPermission === 'granted' : state.orientationPermission !== 'denied');
}

export function hasRecentOrientation(state, requiresPermission, receivedAt, now) {
  // Permission and API presence alone do not prove a sensor is delivering data.
  return canUseOrientation(state, requiresPermission) && now - receivedAt < 1000;
}
