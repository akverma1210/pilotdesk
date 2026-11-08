import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test('core workspace flow works without console errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });

  await expect(page.getByRole('heading', { name: 'Make today count.' })).toBeVisible();
  await page.getByRole('button', { name: 'New task' }).click();
  await page.getByLabel('What needs to get done?').fill('Publish the release notes');
  await page.getByLabel('Project').selectOption({ label: 'Portfolio refresh' });
  await page.getByRole('button', { name: 'Add task' }).click();
  await expect(page.getByText('Publish the release notes')).toBeVisible();

  await page.getByRole('button', { name: 'Complete Publish the release notes' }).click();
  await page.getByRole('button', { name: /^Tasks/ }).click();
  await page.getByRole('tab', { name: /Completed/ }).click();
  await expect(page.getByText('Publish the release notes')).toBeVisible();

  await page.getByRole('button', { name: /^Notes/ }).click();
  await page.getByRole('button', { name: 'New note' }).click();
  await page.getByLabel('Title', { exact: true }).fill('Release checklist');
  await page.getByLabel('Note', { exact: true }).fill('Test the build\nExport a backup\nShare the release');
  await page.getByRole('button', { name: 'Save note' }).click();
  await expect(page.getByRole('heading', { name: 'Release checklist' })).toBeVisible();

  await page.getByRole('button', { name: 'Focus', exact: true }).click();
  await page.getByRole('button', { name: '15 min' }).click();
  await page.getByRole('button', { name: 'Start focusing' }).click();
  await expect(page.getByText('15:00')).not.toBeVisible();
  await page.getByRole('button', { name: 'Pause session' }).click();
  await expect(page.getByRole('button', { name: 'Start focusing' })).toBeVisible();
  expect(errors).toEqual([]);
});

test('mobile navigation and task dialog fit the viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByRole('heading', { name: 'Make today count.' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
  await page.getByRole('button', { name: 'New task' }).click();
  await expect(page.getByRole('dialog', { name: 'Add a task' })).toBeVisible();
  await page.getByLabel('What needs to get done?').fill('Check the mobile flow');
  await page.getByRole('button', { name: 'Add task' }).click();
  await expect(page.getByText('Check the mobile flow')).toBeVisible();
  await page.getByRole('button', { name: 'Focus', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'One thing. Full attention.' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
});
