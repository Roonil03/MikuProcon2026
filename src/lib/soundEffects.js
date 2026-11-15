import { ASSETS } from '../constants/assets.js';

export function createSoundPlayer(source, createAudio = url => new Audio(url)) {
  const voices = [];
  return () => {
    // Preserve overlapping effects; reuse a voice only after it finishes.
    let voice = voices.find(audio => audio.paused || audio.ended);
    if (!voice) {
      voice = createAudio(source);
      voices.push(voice);
    }
    voice.currentTime = 0;
    voice.play().catch(() => {});
  };
}

export const playShutterSound = createSoundPlayer(ASSETS.SFX_CLICK);
export const playHoverSound = createSoundPlayer(ASSETS.SFX_HOVER);
