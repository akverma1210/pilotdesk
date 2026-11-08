import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';

const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', 'preview', '--host', '0.0.0.0', '--port', '4173'], { stdio: 'ignore' });
for (let attempt = 0; attempt < 30; attempt += 1) {
  try { if ((await fetch('http://127.0.0.1:4173')).ok) break; } catch { /* wait for preview */ }
  await new Promise((resolve) => setTimeout(resolve, 200));
}
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || '/usr/bin/google-chrome', headless: true });
try {
  await mkdir('docs', { recursive: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
  await page.goto('http://127.0.0.1:4173');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(150);
  await page.screenshot({ path: 'docs/dashboard.png', fullPage: true });
  await page.getByRole('button', { name: 'Focus', exact: true }).click();
  await page.waitForTimeout(100);
  await page.screenshot({ path: 'docs/focus.png', fullPage: true });
  await page.getByRole('button', { name: 'Projects', exact: true }).click();
  await page.waitForTimeout(100);
  await page.screenshot({ path: 'docs/projects.png', fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'Today', exact: true }).click();
  await page.waitForTimeout(100);
  await page.screenshot({ path: 'docs/mobile.png' });
  console.log('Captured docs/dashboard.png, docs/focus.png, docs/projects.png and docs/mobile.png');
} finally {
  await browser.close();
  server.kill('SIGTERM');
  await new Promise((resolve) => server.once('exit', resolve));
}
