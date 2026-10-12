import { existsSync } from 'node:fs';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawn } from 'node:child_process';

const root = new URL('../', import.meta.url);
const vitePort = 4174;
const browserPort = 9223;
const profile = await mkdtemp(join(tmpdir(), 'miku-pointer-fuzz-'));
const chrome = [
  process.env.CHROME_PATH,
  process.platform === 'win32' && 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  process.platform === 'win32' && 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
].find(candidate => candidate && existsSync(candidate));
if (!chrome) throw new Error('Chrome, Edge, or Chromium was not found. Set CHROME_PATH.');

const vite = spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--port', String(vitePort), '--strictPort'], {
  cwd: root, stdio: ['ignore', 'inherit', 'inherit'],
});
const browser = spawn(chrome, [
  '--headless=new', `--remote-debugging-port=${browserPort}`, `--user-data-dir=${profile}`,
  '--disable-extensions', '--no-first-run', '--no-default-browser-check', '--no-sandbox',
  '--use-angle=swiftshader', '--enable-unsafe-swiftshader', 'about:blank',
], { stdio: 'ignore' });

const waitFor = async url => {
  for (let attempt = 0; attempt < 100; attempt++) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch { /* The process is still starting. */ }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw new Error(`Timed out waiting for ${url}`);
};

try {
  await Promise.all([
    waitFor(`http://127.0.0.1:${vitePort}/MikuProcon2026/`),
    waitFor(`http://127.0.0.1:${browserPort}/json/version`),
  ]);
  const fuzz = spawn(process.execPath, ['scripts/pointer-fuzz.mjs'], {
    cwd: root, stdio: 'inherit',
    env: { ...process.env, GAME_TEST_URL: `http://127.0.0.1:${vitePort}/MikuProcon2026/`, BROWSER_DEBUG_URL: `http://127.0.0.1:${browserPort}` },
  });
  const exitCode = await new Promise((resolve, reject) => {
    fuzz.once('error', reject);
    fuzz.once('exit', code => resolve(code ?? 1));
  });
  if (exitCode !== 0) process.exitCode = exitCode;
} finally {
  vite.kill();
  browser.kill();
  await new Promise(resolve => setTimeout(resolve, 500));
  await rm(profile, { recursive: true, force: true, maxRetries: 4, retryDelay: 250 }).catch(() => {});
}
