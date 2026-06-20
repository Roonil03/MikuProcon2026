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
      player.createFromSongUrl("https://piapro.jp/t/PNpQ/20251209170719");
    },
    onVideoReady: () => {
      const lyrics = [];
      let c = player.video.firstChar;
      let idCounter = 0;

      while (c) {
        lyrics.push({
          id: idCounter++,
          text: c.text,
          startTime: c.startTime,
          endTime: c.endTime,
          duration: c.duration,
          x: (Math.random() - 0.5) * 8,
          y: (Math.random() - 0.5) * 6,
        });
        c = c.next;
      }
      useStore.getState().setLyricsData(lyrics);
      useStore.getState().setAppStatus('ready');
    },
    onTimeUpdate: (position) => {
      useStore.getState().setCurrentPosition(position);
    },
    onPlay: () => {
      useStore.getState().setAppStatus('playing');
    },
    onPause: () => {
      // Do not overwrite isPaused state here
    },
    onStop: () => {
      useStore.getState().setAppStatus('results');
    }
  });

  useStore.getState().setPlayer(player);
  return player;
};
