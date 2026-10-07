// Keep the buffer alive and return its data address, never write over runtime memory.
let captureBuffer: ArrayBuffer = new ArrayBuffer(64);

export function reserveCaptureBuffer(capacity: i32): usize {
  captureBuffer = new ArrayBuffer(64 + capacity * 16);
  return changetype<usize>(captureBuffer);
}

export function processCapture(
  matrixPtr: usize,
  lyricsPtr: usize,
  numLyrics: i32,
  currentPosition: f32,
  shutterSpeed: f32,
  ndcX: f32,
  ndcY: f32,
  isMobile: i32
): i32 {
  let minDiff: f32 = Infinity;
  let closestLyricId: i32 = -1;
  let timeWindow: f32 = 300.0 / shutterSpeed;
  let visibleWindow: f32 = 3000.0 / shutterSpeed;

  for (let i = 0; i < numLyrics; i++) {
    let baseIdx = lyricsPtr + (i * 16); // 16 bytes per lyric (4 floats)
    let id = load<f32>(baseIdx) as i32; // Assuming ID was written as float
    let startTime = load<f32>(baseIdx + 4);
    let x = load<f32>(baseIdx + 8);
    let y = load<f32>(baseIdx + 12);

    let timeDiff = Mathf.abs(startTime - currentPosition);
    if (timeDiff > timeWindow) continue;

    if (isMobile == 1) {
      if (timeDiff < minDiff) {
        minDiff = timeDiff;
        closestLyricId = id;
      }
    } else {
      let timeUntilSung = startTime - currentPosition;
      let zPos = (timeUntilSung / visibleWindow) * -100.0;

      // Project using viewProjectionMatrix
      // Matrix pointer points to 16 floats
      let m0 = load<f32>(matrixPtr + 0);
      let m1 = load<f32>(matrixPtr + 4);
      let m2 = load<f32>(matrixPtr + 8);
      let m3 = load<f32>(matrixPtr + 12);
      
      let m4 = load<f32>(matrixPtr + 16);
      let m5 = load<f32>(matrixPtr + 20);
      let m6 = load<f32>(matrixPtr + 24);
      let m7 = load<f32>(matrixPtr + 28);
      
      let m8 = load<f32>(matrixPtr + 32);
      let m9 = load<f32>(matrixPtr + 36);
      let m10 = load<f32>(matrixPtr + 40);
      let m11 = load<f32>(matrixPtr + 44);
      
      let m12 = load<f32>(matrixPtr + 48);
      let m13 = load<f32>(matrixPtr + 52);
      let m14 = load<f32>(matrixPtr + 56);
      let m15 = load<f32>(matrixPtr + 60);

      // We only need X, Y, and W for screen projection distance
      let projX = x * m0 + y * m4 + zPos * m8  + m12;
      let projY = x * m1 + y * m5 + zPos * m9  + m13;
      let projW = x * m3 + y * m7 + zPos * m11 + m15;

      if (projW <= 0.0) continue;
      projX /= projW;
      projY /= projW;

      let dx = projX - ndcX;
      let dy = projY - ndcY;
      if (dx * dx + dy * dy < 0.0625 && timeDiff < minDiff) {
        minDiff = timeDiff;
        closestLyricId = id;
      }
    }
  }

  return closestLyricId;
}
