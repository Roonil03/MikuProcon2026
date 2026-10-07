import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { it } from 'node:test';
import { Matrix4, PerspectiveCamera } from 'three';
import { createCaptureEngine, lowerBound } from '../src/lib/captureEngine.js';

const camera = new PerspectiveCamera(75, 1, 0.1, 1000);
camera.position.z = 5;
camera.updateMatrixWorld();
const matrix = new Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse).elements;
const imports = { env: { abort() { throw new Error('WASM aborted'); } } };
const binary = await readFile(new URL('../build/release.wasm', import.meta.url));
const { instance } = await WebAssembly.instantiate(binary, imports);
const engines = [createCaptureEngine(null), createCaptureEngine(instance.exports)];

it('finds interval boundaries without scanning the song', () => {
  assert.equal(lowerBound([{ startTime: 10 }, { startTime: 20 }], 20), 1);
  assert.equal(lowerBound([], 0), 0);
});

for (const [index, capture] of engines.entries()) {
  const label = index === 0 ? 'JavaScript' : 'WASM';
  const lyrics = [
    { id: 0, startTime: 1000, x: 0, y: 0 },
    { id: 1, startTime: 1000, x: 0, y: 0 },
    { id: 2, startTime: 1500, x: 0, y: 0 },
  ];
  it(`${label}: captures a second simultaneous lyric after the first is captured`, () => {
    assert.equal(capture(lyrics, new Set([0]), 1000, 1, matrix, 0, 0, false), 1);
  });
  it(`${label}: accepts the timing boundary and rejects a miss`, () => {
    assert.equal(capture(lyrics, new Set(), 700, 1, matrix, 0, 0, true), 0);
    assert.equal(capture(lyrics, new Set(), 699, 1, matrix, 0, 0, true), -1);
    assert.equal(capture(lyrics, new Set(), 1000, 1, matrix, 0.8, 0.8, false), -1);
  });
  it(`${label}: rejects lyrics behind the camera`, () => {
    assert.equal(capture(lyrics.slice(0, 2), new Set(), 1250, 1, matrix, 0, 0, false), -1);
  });
  it(`${label}: grows its buffer for dense lyrics and remains usable`, () => {
    const dense = Array.from({ length: 5000 }, (_, id) => ({ id, startTime: 1000, x: 0, y: 0 }));
    assert.equal(capture(dense, new Set(), 1000, 1, matrix, 0, 0, true), 0);
    assert.equal(capture(lyrics, new Set([0, 1]), 1500, 1, matrix, 0, 0, true), 2);
  });
}

it('WASM and JavaScript agree over desktop and mobile aims and shutter speeds', () => {
  const lyrics = Array.from({ length: 300 }, (_, id) => ({
    id, startTime: id * 100, x: (id % 5 - 2) * 0.2, y: (id % 7 - 3) * 0.1,
  }));
  for (const speed of [0.1, 1, 3]) {
    for (const mobile of [false, true]) {
      for (let i = 0; i < 200; i++) {
        const position = i * 137;
        const aimX = (i % 3 - 1) * 0.1;
        const aimY = (i % 5 - 2) * 0.1;
        const args = [lyrics, new Set([i % 300]), position, speed, matrix, aimX, aimY, mobile];
        assert.equal(engines[1](...args), engines[0](...args));
      }
    }
  }
});
