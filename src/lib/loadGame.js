let gamePromise;
export function loadGame() {
  if (!gamePromise) {
    gamePromise = import('../components/Game.jsx').catch(error => {
      gamePromise = undefined;
      throw error;
    });
  }
  return gamePromise;
}
