import { create } from 'zustand';

const MAX_GALLERY_DISPLAY = 12;

export const useStore = create((set, get) => ({
  appStatus: 'intro',
  appStage: 'intro',
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
  setAppStage: (stage) => set({ appStage: stage }),
  setLanguage: (lang) => set({ language: lang }),
  incrementScore: (amount) => set((state) => ({ score: state.score + amount })),
  setScore: (score) => set({ score }),
  setCurrentPhrase: (phrase) => set({ currentPhrase: phrase }),
  setCurrentBeat: (beat) => set({ currentBeat: beat }),
  setPlayer: (player) => set({ player }),
  setLyricsData: (data) => set({ lyricsData: [...data].sort((a, b) => a.startTime - b.startTime) }),
  setInstrumentalGaps: (gaps) => set({ instrumentalGaps: gaps }),
  setCurrentPosition: (position) => set({ currentPosition: position }),
  setShutterSpeed: (speed) => set({ shutterSpeed: Math.max(0.1, Math.min(3.0, speed)) }),
  setIsMobile: (val) => set({ isMobile: val }),
  setOrientationPermission: (permission) => set({ orientationPermission: permission }),
  setCursorPosition: (x, y) => set({ cursorPosition: { x, y } }),
  triggerBeat: () => set({ beatPulse: 1.0 }),
  decayBeat: (amount) => set((state) => ({ beatPulse: Math.max(0, state.beatPulse - amount) })),
  setArMode: (enabled) => set({ arMode: enabled }),
  toggleARMode: () => set((state) => ({ arMode: !state.arMode })),

  togglePause: () => {
    const state = get();
    const player = state.player;
    if (!player) return;

    if (state.isPaused) {
      player.requestPlay();
      set({ isPaused: false });
    } else {
      player.requestPause();
      set({ isPaused: true });
    }
  },

  captureLyric: (lyricId) => {
    const state = get();
    const lyric = state.lyricsData.find(l => l.id === lyricId);
    if (lyric && !state.capturedLyrics.some(l => l.id === lyricId)) {
      set({ capturedLyrics: [...state.capturedLyrics, lyric] });
    }
  },

  reset: () => set({
    appStatus: 'intro',
    appStage: 'intro',
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
