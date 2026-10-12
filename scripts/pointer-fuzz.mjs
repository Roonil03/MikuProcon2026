import assert from 'node:assert/strict';

const endpoint = process.env.BROWSER_DEBUG_URL || 'http://localhost:9222';
const base = process.env.GAME_TEST_URL || 'http://localhost:5173/MikuProcon2026/';
const seed = Number(process.env.FUZZ_SEED || 20261012) >>> 0;
const tapsPerViewport = Number(process.env.FUZZ_TAPS || 75);
let randomState = seed;
const random = () => ((randomState = (1664525 * randomState + 1013904223) >>> 0) / 0x100000000);

const target = await (await fetch(`${endpoint}/json/new?about:blank`, { method: 'PUT' })).json();
const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
let id = 0;
const pending = new Map();
const errors = [];
socket.onmessage = event => {
  const message = JSON.parse(event.data);
  if (message.id) {
    const request = pending.get(message.id);
    if (!request) return;
    clearTimeout(request.timeout);
    pending.delete(message.id);
    if (message.error) request.reject(new Error(JSON.stringify(message.error)));
    else request.resolve(message.result);
  } else if (message.method === 'Runtime.exceptionThrown') {
    errors.push(message.params.exceptionDetails.exception?.description || message.params.exceptionDetails.text);
  } else if (message.method === 'Runtime.consoleAPICalled' && message.params.type === 'error') {
    errors.push(message.params.args.map(arg => arg.value || arg.description).join(' '));
  }
};
function send(method, params = {}) {
  return new Promise((resolve, reject) => {
    const requestId = ++id;
    const timeout = setTimeout(() => { pending.delete(requestId); reject(new Error(`Timed out: ${method}`)); }, 30000);
    pending.set(requestId, { resolve, reject, timeout });
    socket.send(JSON.stringify({ id: requestId, method, params }));
  });
}
async function evaluate(expression) {
  const result = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
  return result.result.value;
}
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
async function waitFor(expression) {
  for (let i = 0; i < 100; i++) {
    if (await evaluate(expression)) return;
    await pause(200);
  }
  throw new Error(`Not ready: ${expression}`);
}
const state = () => evaluate(`(() => {
  const state = window.__gameStore.getState();
  return { captures: state.capturedLyrics.map(lyric => lyric.id), score: state.score,
    paused: state.isPaused, status: state.appStatus };
})()`);
const point = (width, height) => ({ x: Math.floor(random() * width), y: Math.floor(random() * height) });
async function dispatchPointers(points, pointerType, buttons = points.map(() => 0), multiTouch = false) {
  await evaluate(`(() => {
    const canvas = document.querySelector('canvas');
    const points = ${JSON.stringify(points)};
    const buttons = ${JSON.stringify(buttons)};
    points.forEach((point, index) => canvas.dispatchEvent(new PointerEvent('pointerdown', {
      bubbles: true, clientX: point.x, clientY: point.y, pointerType: '${pointerType}',
      pointerId: index + 1, isPrimary: !${multiTouch} || index === 0, button: buttons[index], buttons: 1,
    })));
  })()`);
}

const results = [];
try {
  await send('Page.enable');
  await send('Runtime.enable');
  for (const [width, height, mobile] of [[320, 568, true], [667, 375, true], [1366, 768, false]]) {
    errors.length = 0;
    await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: mobile ? 2 : 1, mobile });
    await send('Emulation.setTouchEmulationEnabled', { enabled: mobile, maxTouchPoints: mobile ? 5 : 1 });
    await send('Page.navigate', { url: base });
    await waitFor("!!document.querySelector('.intro-begin-button')");
    await evaluate(`(async () => { window.__gameStore = (await import('${base}src/store/useStore.js')).useStore; })()`);
    await pause(1000);
    await evaluate(`(() => {
      const store = window.__gameStore.getState();
      store.setLyricsData(Array.from({ length: ${tapsPerViewport + 20} }, (_, id) =>
        ({ id, text: 'ミ', startTime: 1000, x: 0, y: 0 })));
      store.setPlayer({ requestPlay() {}, requestPause() {} });
      store.setAppStage('ready');
    })()`);
    await waitFor('window.__gameStore.getState().gamePrepared');
    await evaluate("window.__gameStore.getState().setCurrentPosition(1000); window.__gameStore.getState().setAppStatus('playing')");
    await pause(100);

    await dispatchPointers(Array.from({ length: tapsPerViewport }, () => point(width, height)), mobile ? 'touch' : 'mouse');
    const afterRandom = await state();
    assert.equal(new Set(afterRandom.captures).size, afterRandom.captures.length, 'Captured lyric IDs must stay unique');
    assert.ok(Number.isFinite(afterRandom.score) && afterRandom.score >= 0, 'Score must remain finite and non-negative');

    await evaluate('window.__gameStore.getState().togglePause()');
    const pausedBefore = await state();
    await dispatchPointers(Array.from({ length: 50 }, () => point(width, height)), mobile ? 'touch' : 'mouse');
    assert.deepEqual(await state(), pausedBefore, 'Touches while paused must not alter game state');
    await evaluate('window.__gameStore.getState().togglePause()');

    if (mobile) {
      const beforeMultiTouch = (await state()).captures.length;
      await dispatchPointers([point(width, height), point(width, height)], 'touch', [0, 0], true);
      assert.equal((await state()).captures.length, beforeMultiTouch + 1, 'One multi-touch gesture must take one photo');
    } else {
      const beforeRightClick = await state();
      const next = point(width, height);
      await dispatchPointers([next], 'mouse', [2]);
      assert.deepEqual(await state(), beforeRightClick, 'Right-click must not take a photo');
    }
    assert.deepEqual(errors, [], `No browser errors expected at ${width}x${height}`);
    results.push({ width, height, mobile, randomTouches: tapsPerViewport, captures: afterRandom.captures.length });
  }
  console.log(JSON.stringify({ seed, tapsPerViewport, results,
    note: 'Seeded headless Chromium input fuzzing with a local fixture. This is not physical-device testing.' }, null, 2));
} finally {
  socket.close();
  await fetch(`${endpoint}/json/close/${target.id}`).catch(() => {});
}
