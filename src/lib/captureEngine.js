// Lyrics are sorted by startTime by the store. Search only the hittable interval.
export function lowerBound(lyrics, time) {
  let low = 0;
  let high = lyrics.length;
  while (low < high) {
    const middle = (low + high) >>> 1;
    if (lyrics[middle].startTime < time) low = middle + 1;
    else high = middle;
  }
  return low;
}

export function findCapture(lyrics, capturedIds, position, speed, matrix, aimX, aimY, mobile) {
  const window = 300 / speed;
  let closest = -1;
  let minDiff = Infinity;
  for (let i = lowerBound(lyrics, position - window); i < lyrics.length; i++) {
    const lyric = lyrics[i];
    if (lyric.startTime > position + window) break;
    if (capturedIds.has(lyric.id)) continue;
    const diff = Math.abs(lyric.startTime - position);
    if (diff >= minDiff) continue;
    if (!mobile) {
      const z = -(lyric.startTime - position) * speed / 30;
      const w = lyric.x * matrix[3] + lyric.y * matrix[7] + z * matrix[11] + matrix[15];
      if (w <= 0) continue;
      const dx = (lyric.x * matrix[0] + lyric.y * matrix[4] + z * matrix[8] + matrix[12]) / w - aimX;
      const dy = (lyric.x * matrix[1] + lyric.y * matrix[5] + z * matrix[9] + matrix[13]) / w - aimY;
      if (dx * dx + dy * dy >= 0.0625) continue;
    }
    minDiff = diff;
    closest = lyric.id;
  }
  return closest;
}

export function createCaptureEngine(wasm) {
  let capacity = 0;
  let pointer = 0;
  let floats = null;
  return (lyrics, capturedIds, position, speed, matrix, aimX, aimY, mobile) => {
    if (!wasm) return findCapture(lyrics, capturedIds, position, speed, matrix, aimX, aimY, mobile);
    const window = 300 / speed;
    const first = lowerBound(lyrics, position - window);
    let last = first;
    while (last < lyrics.length && lyrics[last].startTime <= position + window) last++;
    if (last === first) return -1;
    const required = last - first;
    if (required > capacity) {
      capacity = Math.max(32, required * 2);
      pointer = wasm.reserveCaptureBuffer(capacity);
      floats = null;
    }
    // Reuse the view, but replace it after allocation or any WASM memory growth.
    if (!floats || floats.buffer !== wasm.memory.buffer) {
      floats = new Float32Array(wasm.memory.buffer, pointer, 16 + capacity * 4);
    }
    floats.set(matrix, 0);
    let count = 0;
    for (let i = first; i < last; i++) {
      const lyric = lyrics[i];
      if (capturedIds.has(lyric.id)) continue;
      const offset = 16 + count++ * 4;
      floats[offset] = lyric.id;
      floats[offset + 1] = lyric.startTime;
      floats[offset + 2] = lyric.x;
      floats[offset + 3] = lyric.y;
    }
    return wasm.processCapture(pointer, pointer + 64, count, position, speed, aimX, aimY, mobile ? 1 : 0);
  };
}
