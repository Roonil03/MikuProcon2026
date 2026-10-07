import { Scene } from './Scene';
import { HUD } from './HUD';
import { PauseMenu } from './PauseMenu';
import { ResultGallery } from './ResultGallery';
import { useStore } from '../store/useStore';

export default function Game() {
  const isPaused = useStore(state => state.isPaused);
  const appStatus = useStore(state => state.appStatus);
  return (
    <>
      <Scene />
      <HUD />
      {isPaused && <PauseMenu />}
      {appStatus === 'results' && <ResultGallery />}
    </>
  );
}
