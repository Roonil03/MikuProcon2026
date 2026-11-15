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

export function readPointerRotation(cursor, previousCursor, hasGyroscope) {
  // Keep the last sensor target until a real pointer movement takes over.
  if (hasGyroscope || (previousCursor && cursor.x === previousCursor.x && cursor.y === previousCursor.y)) return null;
  return { x: -(cursor.y * 2 - 1) * 0.4, y: (cursor.x * 2 - 1) * 0.4 };
}
