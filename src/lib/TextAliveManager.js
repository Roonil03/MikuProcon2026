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

  let lastBeat = null;
  let lastPosition = 0;
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
          x: (Math.random() - 0.5) * 20,
          y: (Math.random() - 0.5) * 16,
        });
        c = c.next;
      }
      useStore.getState().setLyricsData(lyrics);

      const currentStage = useStore.getState().appStage;
      if (currentStage === 'loading_track') {
        useStore.getState().setAppStage('ready');
      }
    },
    onTimeUpdate: (position) => {
      useStore.getState().setCurrentPosition(position);

      const b = player.findBeat(position);
      if (b && (!lastBeat || b.startTime !== lastBeat.startTime)) {
        lastBeat = b;
        useStore.getState().triggerBeat();
      }

      const state = useStore.getState();
      if (state.appStatus === 'playing') {
        const lyrics = state.lyricsData;
        if (lyrics.length > 0) {
          const lastLyric = lyrics[lyrics.length - 1];
          // Stop 4 seconds after the last lyric
          if (position > lastLyric.endTime + 4000) {
            player.requestStop();
            useStore.getState().setAppStatus('results');
          }
        }
        
        // Loop detection: if position jumps backwards significantly
        if (lastPosition > 0 && position < lastPosition - 5000) {
          player.requestStop();
          useStore.getState().setAppStatus('results');
        }
      }
      lastPosition = position;
    },
    onTimerPlay: () => {
      useStore.getState().setAppStatus('playing');
    },
    onTimerPause: () => {
    },
    onTimerStop: () => {
      useStore.getState().setAppStatus('results');
    }
  });

  useStore.getState().setPlayer(player);
  return player;
};
