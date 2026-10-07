import { readFile, readdir } from 'node:fs/promises';
import { performance } from 'node:perf_hooks';
import { gzipSync } from 'node:zlib';
import { createCaptureEngine } from '../src/lib/captureEngine.js';

const binary = await readFile(new URL('../build/release.wasm', import.meta.url));
async function instantiate() {
  return (await WebAssembly.instantiate(binary, {
    env: { abort() { throw new Error('WASM aborted'); } },
  })).instance.exports;
}
const lyrics = Array.from({ length: 2000 }, (_, id) => ({ id, startTime: id * 100, x: 0, y: 0 }));
const matrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
const capturedIds = new Set();
const oldWasm = await instantiate();
const oldPointer = oldWasm.reserveCaptureBuffer(lyrics.length);
// Reproduce the previous copy-all-lyrics work, using valid memory for a fair timing.
const copyAll = position => {
  const floats = new Float32Array(oldWasm.memory.buffer, oldPointer, 16 + lyrics.length * 4);
  floats.set(matrix);
  for (let i = 0; i < lyrics.length; i++) {
    const lyric = lyrics[i];
    const offset = 16 + i * 4;
    floats[offset] = lyric.id;
    floats[offset + 1] = lyric.startTime;
    floats[offset + 2] = lyric.x;
    floats[offset + 3] = lyric.y;
  }
  return oldWasm.processCapture(oldPointer, oldPointer + 64, lyrics.length, position, 1, 0, 0, 1);
};
const wasmCapture = createCaptureEngine(await instantiate());
const jsCapture = createCaptureEngine(null);
function measure(capture) {
  let checksum = 0;
  for (let i = 0; i < 2000; i++) capture((i % 1900 + 50) * 100);
  const samples = [];
  for (let sample = 0; sample < 7; sample++) {
    const start = performance.now();
    for (let i = 0; i < 10000; i++) checksum += capture((i % 1900 + 50) * 100);
    samples.push(performance.now() - start);
  }
  samples.sort((a, b) => a - b);
  return { medianMsFor10000Captures: Number(samples[3].toFixed(3)), checksum };
}
const before = measure(copyAll);
const after = measure(position => wasmCapture(lyrics, capturedIds, position, 1, matrix, 0, 0, true));
const fallback = measure(position => jsCapture(lyrics, capturedIds, position, 1, matrix, 0, 0, true));
const desktopWasm = measure(position => wasmCapture(lyrics, capturedIds, position, 1, matrix, 0, 0, false));
const desktopJavaScript = measure(position => jsCapture(lyrics, capturedIds, position, 1, matrix, 0, 0, false));
if (before.checksum !== after.checksum || before.checksum !== fallback.checksum) {
  throw new Error('Capture results differ');
}
const html = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
const entry = html.match(/<script[^>]+src="[^"]*\/assets\/([^"]+)"/)[1];
const files = [entry, ...[...html.matchAll(/<link rel="modulepreload"[^>]+href="[^"]*\/assets\/([^"]+)"/g)].map(match => match[1])];
const initial = await Promise.all(files.map(async file => {
  const content = await readFile(new URL(`../dist/assets/${file}`, import.meta.url));
  return { file, bytes: content.length, gzipBytes: gzipSync(content).length };
}));
const assets = await readdir(new URL('../dist/assets/', import.meta.url));
console.log(JSON.stringify({
  node: process.version,
  lyrics: lyrics.length,
  samples: 7,
  beforeCopyAll: before,
  afterWindowedWasm: after,
  windowedJavaScript: fallback,
  desktopWindowedWasm: desktopWasm,
  desktopWindowedJavaScript: desktopJavaScript,
  initialJavaScript: initial,
  deferredGameFile: assets.find(file => file.startsWith('Game-')),
  deferredExportFile: assets.find(file => file.startsWith('html2canvas-')),
  note: 'Local Node timings, not browser FPS or measured network loading time. The baseline reproduces full-song copying with the same current WASM kernel.',
}, null, 2));
