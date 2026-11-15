// Array identity changes only when the song or capture history changes.
// Cache derived indexes so missed shutters do no full-song/history work.
const lyricIndexes = new WeakMap();
const captureIndexes = new WeakMap();

export function getLyricIndex(lyrics) {
  let index = lyricIndexes.get(lyrics);
  if (!index) {
    index = new Map(lyrics.map(lyric => [lyric.id, lyric]));
    lyricIndexes.set(lyrics, index);
  }
  return index;
}

export function getCapturedIds(captures) {
  let index = captureIndexes.get(captures);
  if (!index) {
    index = new Set(captures.map(lyric => lyric.id));
    captureIndexes.set(captures, index);
  }
  return index;
}
