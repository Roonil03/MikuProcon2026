import React, { useEffect } from 'react';
import { Scene } from './components/Scene';
import { HUD } from './components/HUD';
import { initializeTextAlive } from './lib/TextAliveManager';

function App() {
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
    </div>
  );
}

export default App;
