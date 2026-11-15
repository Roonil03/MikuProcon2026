export function attachXRSelect(store, onSelect) {
  let session;
  const bindSession = next => {
    session?.removeEventListener('select', onSelect);
    session = next;
    session?.addEventListener('select', onSelect);
  };
  bindSession(store.getState().session);
  const unsubscribe = store.subscribe((state, previous) => {
    if (state.session !== previous.session) bindSession(state.session);
  });
  return () => {
    unsubscribe();
    session?.removeEventListener('select', onSelect);
  };
}
