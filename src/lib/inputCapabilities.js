import { useSyncExternalStore } from 'react';

const POINTER_QUERIES = ['(pointer: coarse)', '(pointer: fine)', '(pointer: none)'];

export function hasPrimaryTouch(target = globalThis.window) {
  if (!target) return false;
  if (typeof target.matchMedia === 'function') {
    const [coarse, fine, none] = POINTER_QUERIES.map(query => target.matchMedia(query).matches);
    if (fine || none) return false;
    if (coarse) return true;
  }
  // Older browsers may expose touch points without supporting pointer queries.
  return (target.navigator?.maxTouchPoints || 0) > 0 || 'ontouchstart' in target;
}

export function subscribePrimaryPointer(onChange, target = globalThis.window) {
  if (typeof target?.matchMedia !== 'function') return () => {};
  const queries = POINTER_QUERIES.map(query => target.matchMedia(query));
  for (const query of queries) {
    if (query.addEventListener) query.addEventListener('change', onChange);
    else query.addListener?.(onChange);
  }
  return () => {
    for (const query of queries) {
      if (query.removeEventListener) query.removeEventListener('change', onChange);
      else query.removeListener?.(onChange);
    }
  };
}

export function usePrimaryTouch() {
  return useSyncExternalStore(subscribePrimaryPointer, hasPrimaryTouch, () => false);
}

export function canOfferAR(target = globalThis.window) {
  // A trackpad or mouse must not hide AR on a touch-capable tablet/headset.
  return Boolean(target?.navigator?.xr || (target?.navigator?.maxTouchPoints || 0) > 0);
}
