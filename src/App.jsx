import React, { useEffect } from 'react';
import { Scene } from './components/Scene';
import { HUD } from './components/HUD';
import { ResultGallery } from './components/ResultGallery';
import { initializeTextAlive } from './lib/TextAliveManager';
import { useStore } from './store/useStore';

function App() {
  const appStatus = useStore(state => state.appStatus);

  useEffect(() => {
    const player = initializeTextAlive();
    return () => {
      if (player && typeof player.dispose === 'function') {
        player.dispose();
      }
    };
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden', backgroundColor: '#000' }}>
      <Scene />
      <HUD />
      {appStatus === 'results' && <ResultGallery />}
    </div>
  );
}

export default App;
