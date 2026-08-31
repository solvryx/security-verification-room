import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

const baseURL = 'http://127.0.0.1:4181';
const output = 'output/playwright';
await mkdir(output, { recursive: true });

const browser = await chromium.launch({ headless: true });
const errors = [];

async function capture(path, buttonName, file, viewport) {
  const page = await browser.newPage({ viewport });
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`${path}: ${message.text()}`);
  });
  page.on('pageerror', (error) => errors.push(`${path}: ${error.message}`));
  await page.goto(`${baseURL}/${path}`, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: buttonName }).click();
  await page.screenshot({ path: `${output}/${file}`, fullPage: true });
  await page.close();
}

await capture('#boundary-auditor', 'Audit trace locally', 'boundary-auditor-desktop.png', { width: 1440, height: 1000 });
await capture('#release-gate', 'Evaluate release gate', 'release-gate-desktop.png', { width: 1440, height: 1000 });
await capture('#api-contract', 'Validate response', 'api-contract-mobile.png', { width: 390, height: 844 });
await browser.close();

if (errors.length) {
  throw new Error(`Browser errors:\n${errors.join('\n')}`);
}
console.log('Captured 3 verified evidence views with no browser errors.');
