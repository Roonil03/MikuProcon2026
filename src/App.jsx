import { Scene } from './components/Scene';
import { HUD } from './components/HUD';
import { ResultGallery } from './components/ResultGallery';
import { IntroScreen } from './components/IntroScreen';
import { PauseMenu } from './components/PauseMenu';
import { useStore } from './store/useStore';

function App() {
  const appStatus = useStore(state => state.appStatus);
  const appStage = useStore(state => state.appStage);
  const isPaused = useStore(state => state.isPaused);

  const showIntro = appStage !== 'ready' || appStatus === 'intro';
  const showGame = appStatus === 'playing' || appStatus === 'ready' || appStatus === 'loading' || appStatus === 'results';

  return (
    <div className="app-shell" style={{ position: 'relative', overflow: 'hidden', background: '#000000', backgroundColor: '#000000', cursor: appStatus === 'playing' ? 'none' : 'auto' }}>
      {showIntro && <IntroScreen />}
      {showGame && !showIntro && (
        <>
          <Scene />
          <HUD />
          {isPaused && <PauseMenu />}
          {appStatus === 'results' && <ResultGallery />}
        </>
      )}
    </div>
  );
}

export default App;
