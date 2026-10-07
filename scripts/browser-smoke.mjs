// Start Vite and an isolated Chromium with --remote-debugging-port=9222 first.
// This checks local rendering with a song fixture, not the live music service.
import assert from 'node:assert/strict';

const endpoint = process.env.BROWSER_DEBUG_URL || 'http://localhost:9222';
const base = process.env.GAME_TEST_URL || 'http://localhost:5173/MikuProcon2026/';
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
    errors.push(message.params.exceptionDetails.exception?.description?.split('\n').slice(0, 3).join('\n') || message.params.exceptionDetails.text);
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
const results = [];
try {
  await send('Page.enable');
  await send('Runtime.enable');
  for (const [width, height, mobile] of [[1366, 768, false], [1920, 1080, false], [320, 568, true], [375, 812, true], [568, 320, true], [667, 375, true]]) {
    errors.length = 0;
    await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: mobile ? 2 : 1, mobile });
    await send('Emulation.setTouchEmulationEnabled', { enabled: mobile, maxTouchPoints: mobile ? 5 : 1 });
    await send('Page.navigate', { url: base });
    await waitFor("!!document.querySelector('.intro-begin-button')");
    await evaluate(`(async () => { window.__gameStore = (await import('${base}src/store/useStore.js')).useStore; })()`);
    await pause(2000);
    for (const language of ['en', 'ja']) {
      await evaluate(`window.__gameStore.getState().setLanguage('${language}')`);
      await pause(100);
      const bounds = await evaluate(`(() => {
        const panel = document.querySelector('.intro-panel').getBoundingClientRect();
        const button = document.querySelector('.intro-begin-button').getBoundingClientRect();
        const instructions = document.querySelector('.intro-instructions').getBoundingClientRect();
        return { panelTop: panel.top, panelBottom: panel.bottom, buttonBottom: button.bottom,
          instructionTop: instructions.top, instructionBottom: instructions.bottom,
          viewportHeight: innerHeight, viewportWidth: innerWidth, scrollHeight: document.documentElement.scrollHeight };
      })()`);
      assert.ok(bounds.panelTop >= 0 && bounds.panelBottom <= bounds.viewportHeight, JSON.stringify({ width, height, language, bounds }));
      assert.ok(bounds.buttonBottom <= bounds.viewportHeight, JSON.stringify(bounds));
      assert.ok(bounds.scrollHeight <= bounds.viewportHeight, 'Instructions must not scroll');
      results.push({ width, height, language, bounds });
    }
    const preparationStart = Date.now();
    await evaluate(`(() => {
      const state = window.__gameStore.getState();
      state.setLyricsData([{ id: 0, text: 'ミ', startTime: 1000, x: 0, y: 0 },
        { id: 1, text: 'ク', startTime: 8000, x: 0, y: 0 }]);
      state.setInstrumentalGaps([{ startTime: 1100, endTime: 6000 }]);
      state.setPlayer({ requestPlay() {}, requestPause() {} });
      state.setAppStage('ready');
    })()`);
    await waitFor('window.__gameStore.getState().gamePrepared');
    const preparationMs = Date.now() - preparationStart;
    await evaluate("window.__gameStore.getState().setCurrentPosition(1000); window.__gameStore.getState().setAppStatus('playing')");
    await pause(200);
    await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: width / 2, y: height / 2, button: 'left', clickCount: 1 });
    await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: width / 2, y: height / 2, button: 'left', clickCount: 1 });
    await pause(100);
    assert.equal(await evaluate('window.__gameStore.getState().capturedLyrics.length'), 1,
      JSON.stringify({ width, height, mobile, errors, state: await evaluate(`(() => {
        const state = window.__gameStore.getState();
        return { status: state.appStatus, isMobile: state.isMobile, paused: state.isPaused, position: state.currentPosition,
          viewport: [innerWidth, innerHeight], target: document.elementFromPoint(innerWidth / 2, innerHeight / 2)?.tagName };
      })()`) }));
    await evaluate('window.__gameStore.getState().setCurrentPosition(2000)');
    await pause(200);
    await evaluate('window.__gameStore.getState().togglePause()');
    assert.equal(await evaluate('window.__gameStore.getState().isPaused'), true);
    await evaluate('window.__gameStore.getState().togglePause(); window.__gameStore.getState().setCurrentPosition(7000)');
    await pause(200);
    assert.deepEqual(errors, [], `Rendering must produce no console errors at ${width}x${height}, ${JSON.stringify(await evaluate(`Array.from(document.querySelectorAll('canvas'), canvas => {
      const context = canvas.getContext('webgl2');
      return { lost: context?.isContextLost(), attributes: context?.getContextAttributes() };
    })`))}`);
    results.push({ width, height, mobile, preparationMs, capture: 'passed', pauseResume: 'passed', particleTransitions: 'no rendering errors' });
  }
  console.log(JSON.stringify({ browser: (await (await fetch(`${endpoint}/json/version`)).json()).Browser,
    results, note: 'Headless Chromium, simulated viewports and local song fixture. Not physical phone tests, network timings, live playback, or hardware FPS.' }, null, 2));
} finally {
  socket.close();
  await fetch(`${endpoint}/json/close/${target.id}`);
}
