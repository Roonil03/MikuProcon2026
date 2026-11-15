import { lazy, Suspense } from 'react';
import { IntroScreen } from './components/IntroScreen';
import { useStore } from './store/useStore';
import { loadGame } from './lib/loadGame';

const Game = lazy(loadGame);

function App() {
  const appStatus = useStore(state => state.appStatus);
  const appStage = useStore(state => state.appStage);
  const isPaused = useStore(state => state.isPaused);

  const showIntro = appStage !== 'ready' || appStatus === 'intro';
  const showGame = appStage === 'ready';

  return (
    <div className="app-shell" style={{ position: 'relative', overflow: 'hidden', background: '#000000', backgroundColor: '#000000', cursor: appStatus === 'playing' && !isPaused ? 'none' : 'auto' }}>
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
