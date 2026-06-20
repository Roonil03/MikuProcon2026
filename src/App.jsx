import React, { useEffect } from 'react';
import { Scene } from './components/Scene';
import { HUD } from './components/HUD';
import { ResultGallery } from './components/ResultGallery';
import { IntroScreen } from './components/IntroScreen';
import { PauseMenu } from './components/PauseMenu';
import { initializeTextAlive } from './lib/TextAliveManager';
import { useStore } from './store/useStore';

function App() {
  const appStatus = useStore(state => state.appStatus);
  const isPaused = useStore(state => state.isPaused);

  useEffect(() => {
    if (appStatus === 'intro') return;

    const existingPlayer = useStore.getState().player;
    if (existingPlayer) return;

    const player = initializeTextAlive();
    return () => {
      if (player && typeof player.dispose === 'function') {
        player.dispose();
      }
    };
  }, [appStatus]);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden', backgroundColor: '#000', cursor: 'none' }}>
      {appStatus === 'intro' && <IntroScreen />}
      {appStatus !== 'intro' && (
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
