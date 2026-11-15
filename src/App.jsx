import { lazy, Suspense, useEffect } from 'react';
import { IntroScreen } from './components/IntroScreen';
import { useStore } from './store/useStore';
import { loadGame } from './lib/loadGame';

const Game = lazy(loadGame);

function App() {
  const appStatus = useStore(state => state.appStatus);
  const appStage = useStore(state => state.appStage);
  const playbackPending = useStore(state => state.playbackPending);

  useEffect(() => {
    if (!playbackPending) return undefined;
    // Accepted requests can still be blocked by a browser/media backend.
    const timeout = setTimeout(() => {
      if (useStore.getState().playbackPending) {
        useStore.setState({ playbackPending: false, playbackError: true });
      }
    }, 10000);
    return () => clearTimeout(timeout);
  }, [playbackPending]);

  useEffect(() => {
    if (appStage !== 'loading_track') return undefined;
    const timeout = setTimeout(() => {
      if (useStore.getState().appStage === 'loading_track') {
        useStore.getState().setAppStage('track_unavailable');
      }
    }, 45000);
    return () => clearTimeout(timeout);
  }, [appStage]);

  const showIntro = appStage !== 'ready' || appStatus === 'intro';
  const showGame = appStage === 'ready';

  return (
    <div className="app-shell" style={{ position: 'relative', overflow: 'hidden', background: '#000000', backgroundColor: '#000000', cursor: appStatus === 'playing' ? 'none' : 'auto' }}>
      {showIntro && <IntroScreen />}
      {showGame && (
        <Suspense fallback={null}>
          <Game />
        </Suspense>
      )}
    </div>
  );
}

export default App;
