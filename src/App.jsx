import React, { useEffect } from 'react';
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
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg, rgba(230,199,137,0.15) 0%, rgba(143,199,234,0.15) 100%)', backgroundColor: '#0a0a0f', cursor: 'none' }}>
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
