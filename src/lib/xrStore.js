import { createXRStore } from '@react-three/xr';
import { useStore } from '../store/useStore';

export const xrStore = createXRStore({ emulate: false, offerSession: false });

xrStore.subscribe((state, previous) => {
  if (state.session !== previous.session) {
    useStore.getState().setArMode(Boolean(state.session));
  }
});
