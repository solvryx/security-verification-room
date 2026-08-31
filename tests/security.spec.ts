import { expect, test } from '@playwright/test';

test('boundary auditor finds risky correlations and clears a benign trace', async ({ page }) => {
  await page.goto('/#boundary-auditor');
  await page.getByRole('button', { name: 'Audit trace locally' }).click();
  await expect(page.getByTestId('boundary-result')).toContainText('02');
  await expect(page.getByTestId('boundary-result')).toContainText('E01 → E03');
  await page.getByRole('button', { name: 'benign control' }).click();
  await page.getByRole('button', { name: 'Audit trace locally' }).click();
  await expect(page.getByTestId('boundary-result')).toContainText('ZERO FINDINGS');
});

test('secret sentry redacts a seeded value and clears the runtime placeholder', async ({ page }) => {
  await page.goto('/#secret-sentry');
  await page.getByRole('button', { name: 'Scan without network' }).click();
  const result = page.getByTestId('secret-result');
  await expect(result).toContainText('dem...8Nw');
  await expect(result).not.toContainText('demo_7Fx3Qv9Lm2Za8Nw4');
  await page.getByRole('button', { name: 'clean control' }).click();
  await page.getByRole('button', { name: 'Scan without network' }).click();
  await expect(result).toContainText('CLEAN SAMPLE');
});

test('access matrix identifies exact permission drift and passes the expected matrix', async ({ page }) => {
  await page.goto('/#access-matrix');
  await page.getByRole('button', { name: 'Compare to approved policy' }).click();
  await expect(page.getByTestId('access-result')).toContainText('support / billing / export');
  await page.getByRole('button', { name: 'expected control' }).click();
  await page.getByRole('button', { name: 'Compare to approved policy' }).click();
  await expect(page.getByTestId('access-result')).toContainText('NO POLICY DRIFT');
});

test('release gate blocks unsafe configuration and passes the hardened control', async ({ page }) => {
  await page.goto('/#release-gate');
  await page.getByRole('button', { name: 'Evaluate release gate' }).click();
  await expect(page.getByTestId('release-result')).toContainText('RELEASE BLOCKED');
  await expect(page.getByTestId('release-result')).toContainText('default-secret');
  await page.getByRole('button', { name: 'hardened control' }).click();
  await page.getByRole('button', { name: 'Evaluate release gate' }).click();
  await expect(page.getByTestId('release-result')).toContainText('RELEASE ELIGIBLE');
});

test('api contract reports exact paths and accepts a valid response', async ({ page }) => {
  await page.goto('/#api-contract');
  await page.getByRole('button', { name: 'Validate response' }).click();
  await expect(page.getByTestId('contract-result')).toContainText('$.active');
  await expect(page.getByTestId('contract-result')).toContainText('$.profile');
  await page.getByRole('button', { name: 'valid control' }).click();
  await page.getByRole('button', { name: 'Validate response' }).click();
  await expect(page.getByTestId('contract-result')).toContainText('CONTRACT SATISFIED');
});

test('verification room has no horizontal overflow on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/#boundary-auditor');
  const layout = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    offenders: [...document.querySelectorAll<HTMLElement>('body *')]
      .filter((element) => element.getBoundingClientRect().right > document.documentElement.clientWidth + 1)
      .slice(0, 8)
      .map((element) => ({ tag: element.tagName, className: element.className, right: Math.round(element.getBoundingClientRect().right) })),
  }));
  expect(layout, JSON.stringify(layout)).toMatchObject({ clientWidth: 390, scrollWidth: 390 });
});

test('verification room has no horizontal overflow on desktop', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/#release-gate');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(overflow).toBe(false);
});
