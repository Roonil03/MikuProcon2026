// TextAlive's media timer can become ready after the lyric data. Only its
// documented playback events confirm that the browser accepted a play request.
export function createPlaybackListeners(player, store) {
  let lastBeat = null;
  let hasProgress = false;
  let songlePlayer = null;

  const finishPlayback = () => {
    if (store.getState().appStatus !== 'playing' || !hasProgress) return;
    store.setState({ appStatus: 'results', isPaused: false, playbackPending: false });
  };
  const detachFinishListener = () => {
    songlePlayer?.off('finish', finishPlayback);
    songlePlayer = null;
  };

  return {
    onTimerReady: timer => {
      detachFinishListener();
      songlePlayer = timer?.songlePlayer ?? null;
      // Songle emits pause before finish at the native media end. In SDK 0.4,
      // that pause clears the polling handler and can suppress onStop entirely.
      songlePlayer?.on('finish', finishPlayback);
      store.getState().markTimerReady();
    },
    onDispose: detachFinishListener,
    onPlay: () => {
      const state = store.getState();
      if (state.appStage !== 'ready' || !state.gamePrepared || state.appStatus === 'results') return;
      if (state.appStatus === 'intro') {
        hasProgress = false;
        lastBeat = null;
      }
      store.setState({ appStatus: 'playing', isPaused: false, playbackPending: false, playbackError: false });
    },
    onPause: () => {
      if (store.getState().appStatus !== 'playing') return;
      store.setState({ isPaused: true, playbackPending: false });
    },
    onStop: () => {
      if (store.getState().appStatus !== 'playing') return;
      // An initialization or blocked-start stop must leave a usable Start button.
      store.setState(hasProgress
        ? { appStatus: 'results', isPaused: false, playbackPending: false }
        : { appStatus: 'intro', isPaused: false, playbackPending: false, playbackError: true });
    },
    onTimeUpdate: position => {
      if (!Number.isFinite(position)) return;
      const state = store.getState();
      state.setCurrentPosition(position);

      const beat = player.findBeat(position);
      if (beat && beat.startTime !== lastBeat) {
        lastBeat = beat.startTime;
        store.getState().setCurrentBeat(beat.startTime);
      }

      if (state.appStatus !== 'playing' || state.isPaused) return;
      if (position > 0) hasProgress = true;
      const lastLyric = state.lyricsData[state.lyricsData.length - 1];
      if (lastLyric && position > lastLyric.endTime + 4000) {
        // requestStop may synchronously emit onStop and a rewind time update.
        store.setState({ appStatus: 'results', isPaused: false, playbackPending: false });
        player.requestStop();
      }
      // Backward media seeks are valid; they are not evidence of song completion.
    },
  };
}
