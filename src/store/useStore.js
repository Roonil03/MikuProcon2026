import { create } from 'zustand';
import { getCapturedIds, getLyricIndex } from '../lib/captureLookup.js';

const MAX_GALLERY_DISPLAY = 12;

const withPreparedPlayback = (state, changes) => {
  const next = { ...state, ...changes };
  // A managed host may start before formation or scene preparation finishes.
  // Read the current SDK state so an intervening pause/stop is respected too.
  if (next.appStage === 'ready' && next.gamePrepared && next.appStatus === 'intro' && next.player?.isPlaying) {
    return { ...changes, appStatus: 'playing', isPaused: false, playbackPending: false, playbackError: false };
  }
  return changes;
};

export const useStore = create((set, get) => ({
  appStatus: 'intro',
  appStage: 'intro',
  gamePrepared: false,
  trackReady: false,
  timerReady: false,
  playbackPending: false,
  playbackError: false,
  score: 0,
  currentPhrase: null,
  currentBeat: null,
  activeLyrics: [],
  lyricsData: [],
  capturedLyrics: [],
  instrumentalGaps: [],
  player: null,
  currentPosition: 0,
  shutterSpeed: 1.0,
  isMobile: false,
  orientationPermission: 'unknown',
  isPaused: false,
  cursorPosition: { x: 0.5, y: 0.5 },
  arMode: false,
  beatPulse: 0,
  sweepOffset: { value: 0 },
  language: 'en',

  setAppStatus: (status) => set({ appStatus: status }),
  setAppStage: (stage) => set(state => withPreparedPlayback(state, { appStage: stage })),
  setGamePrepared: (prepared) => set(state => withPreparedPlayback(state, { gamePrepared: prepared })),
  markTrackReady: () => {
    const state = get();
    const appStage = state.appStage === 'loading_track'
      ? (state.lyricsData.length > 0 ? (state.timerReady ? 'ready' : 'loading_track') : 'track_unavailable')
      : state.appStage;
    set(withPreparedPlayback(state, { trackReady: true, appStage }));
  },
  markTimerReady: () => {
    const state = get();
    set(withPreparedPlayback(state, {
      timerReady: true,
      appStage: state.appStage === 'loading_track' && state.trackReady && state.lyricsData.length > 0
        ? 'ready' : state.appStage,
    }));
  },
  completeIntroFormation: () => {
    const state = get();
    if (state.appStage === 'track_unavailable') return;
    set(withPreparedPlayback(state, {
      appStage: !state.trackReady
        ? 'loading_track'
        : (state.lyricsData.length > 0 ? (state.timerReady ? 'ready' : 'loading_track') : 'track_unavailable'),
    }));
  },
  setLanguage: (lang) => set({ language: lang }),
  incrementScore: (amount) => set((state) => ({ score: state.score + amount })),
  setScore: (score) => set({ score }),
  setCurrentPhrase: (phrase) => set({ currentPhrase: phrase }),
  setCurrentBeat: (beat) => set({ currentBeat: beat }),
  setPlayer: (player) => set({ player }),
  setLyricsData: (data) => {
    const lyricsData = [...data];
    let isChronological = true;
    for (let i = 1; i < lyricsData.length; i++) {
      if (lyricsData[i].startTime < lyricsData[i - 1].startTime) {
        isChronological = false;
        break;
      }
    }
    if (!isChronological) lyricsData.sort((a, b) => a.startTime - b.startTime);
    set({ lyricsData });
  },
  setInstrumentalGaps: (gaps) => set({ instrumentalGaps: gaps }),
  setCurrentPosition: (position) => {
    if (get().currentPosition !== position) set({ currentPosition: position });
  },
  setShutterSpeed: (speed) => set({ shutterSpeed: Math.max(0.1, Math.min(3.0, speed)) }),
  setIsMobile: (val) => set({ isMobile: val }),
  setOrientationPermission: (permission) => set({ orientationPermission: permission }),
  setCursorPosition: (x, y) => {
    const previous = get().cursorPosition;
    if (previous.x !== x || previous.y !== y) set({ cursorPosition: { x, y } });
  },
  triggerBeat: () => set({ beatPulse: 1.0 }),
  decayBeat: (amount) => set((state) => ({ beatPulse: Math.max(0, state.beatPulse - amount) })),
  setArMode: (enabled) => set({ arMode: enabled }),
  toggleARMode: () => set((state) => ({ arMode: !state.arMode })),

  startPlayback: () => {
    const state = get();
    if (!state.player || state.appStage !== 'ready' || !state.gamePrepared || state.playbackPending
      || state.appStatus === 'results' || (state.appStatus === 'playing' && !state.isPaused)) return false;
    set({ playbackPending: true, playbackError: false });
    try {
      // Keep this synchronous with the user's gesture (not a countdown timer).
      if (state.player.requestPlay() === false) throw new Error('Playback request rejected');
      return true;
    } catch {
      set({ playbackPending: false, playbackError: true });
      return false;
    }
  },

  togglePause: () => {
    const state = get();
    const player = state.player;
    if (!player || state.appStatus !== 'playing' || state.playbackPending) return;

    if (state.isPaused) {
      state.startPlayback();
    } else {
      // Confirm pause through onPause, just as resume waits for onPlay.
      player.requestPause();
    }
  },

  captureLyric: (lyricId, scoreDelta = 0) => {
    const state = get();
    const lyric = getLyricIndex(state.lyricsData).get(lyricId);
    if (lyric && !getCapturedIds(state.capturedLyrics).has(lyricId)) {
      set({ capturedLyrics: [...state.capturedLyrics, lyric], score: state.score + scoreDelta });
      return true;
    }
    return false;
  },

  reset: () => set({
    appStatus: 'intro',
    appStage: 'intro',
    gamePrepared: false,
    trackReady: false,
    timerReady: false,
    playbackPending: false,
    playbackError: false,
    score: 0,
    currentPhrase: null,
    currentBeat: null,
    activeLyrics: [],
    lyricsData: [],
    capturedLyrics: [],
    instrumentalGaps: [],
    player: null,
    currentPosition: 0,
    shutterSpeed: 1.0,
    isMobile: false,
    orientationPermission: 'unknown',
    isPaused: false,
    cursorPosition: { x: 0.5, y: 0.5 },
    arMode: false,
    beatPulse: 0,
    sweepOffset: { value: 0 },
    language: 'en',
  }),

  getDisplayedCaptures: () => {
    const state = get();
    return state.capturedLyrics.slice(-MAX_GALLERY_DISPLAY);
  },

  addActiveLyric: (lyric) => set((state) => ({
    activeLyrics: [...state.activeLyrics, lyric]
  })),
  removeActiveLyric: (lyricId) => set((state) => ({
    activeLyrics: state.activeLyrics.filter(l => l.id !== lyricId)
  })),
  clearActiveLyrics: () => set({ activeLyrics: [] }),
}));

export { MAX_GALLERY_DISPLAY };
