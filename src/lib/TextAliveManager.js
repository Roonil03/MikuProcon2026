import { Player } from 'textalive-app-api';
import { useStore } from '../store/useStore';

export const initializeTextAlive = () => {
  const mediaContainer = document.createElement('div');
  mediaContainer.id = "media-container";
  mediaContainer.style.display = "none";
  document.body.appendChild(mediaContainer);

  const player = new Player({
    app: {
      token: import.meta.env.VITE_TEXTALIVE_TOKEN || 'test_token',
      parameters: [],
    },
    mediaElement: mediaContainer,
  });

  player.addListener({
    onAppReady: (app) => {
      if (app.managed) return;
      // "Shutter Chance" by Yamiagari
      player.createFromSongUrl("https://piapro.jp/t/PNpQ/20251209170719");
    },
    onVideoReady: () => {
      useStore.getState().setAppStatus('ready');
    },
    onTimeUpdate: (position) => {
      // Future logic for flying lyrics and beats
    },
    onPlay: () => {
      useStore.getState().setAppStatus('playing');
    },
    onPause: () => {
      useStore.getState().setAppStatus('ready');
    },
    onStop: () => {
      useStore.getState().setAppStatus('results');
    }
  });

  useStore.getState().setPlayer(player);
  return player;
};
