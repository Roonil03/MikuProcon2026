import { create } from 'zustand';

export const useStore = create((set, get) => ({
  appStatus: 'loading', // 'loading', 'ready', 'playing', 'results'
  score: 0,
  currentPhrase: null,
  currentBeat: null,
  activeLyrics: [],
  lyricsData: [],
  capturedLyrics: [],
  player: null,
  currentPosition: 0,

  setAppStatus: (status) => set({ appStatus: status }),
  incrementScore: (amount) => set((state) => ({ score: state.score + amount })),
  setCurrentPhrase: (phrase) => set({ currentPhrase: phrase }),
  setCurrentBeat: (beat) => set({ currentBeat: beat }),
  setPlayer: (player) => set({ player }),
  setLyricsData: (data) => set({ lyricsData: data }),
  setCurrentPosition: (position) => set({ currentPosition: position }),
  
  captureLyric: (lyricId) => {
    const state = get();
    const lyric = state.lyricsData.find(l => l.id === lyricId);
    if (lyric && !state.capturedLyrics.some(l => l.id === lyricId)) {
      set({ capturedLyrics: [...state.capturedLyrics, lyric] });
    }
  },

  addActiveLyric: (lyric) => set((state) => ({
    activeLyrics: [...state.activeLyrics, lyric]
  })),
  removeActiveLyric: (lyricId) => set((state) => ({
    activeLyrics: state.activeLyrics.filter(l => l.id !== lyricId)
  })),
  clearActiveLyrics: () => set({ activeLyrics: [] }),
}));
