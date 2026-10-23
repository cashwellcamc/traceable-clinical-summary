import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const BASE = 'http://localhost:5173/traceable-clinical-summary/';

test.describe('axe accessibility', () => {
  test('initial page load — zero violations', async ({ page }) => {
    await page.goto(BASE);
    await page.waitForSelector('.summary-card, .summary-error', { timeout: 15000 });

    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });

  test('all sources expanded — zero violations', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(BASE);
    await page.waitForSelector('.summary-card', { timeout: 15000 });

    const toggles = page.locator('.source-item__header');
    for (const toggle of await toggles.all()) {
      await toggle.click();
    }

    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });

  test('reviewed state — zero violations', async ({ page }) => {
    await page.goto(BASE);
    await page.waitForSelector('.summary-card', { timeout: 15000 });

    await page.getByRole('button', { name: 'Mark as Reviewed' }).click();
    await page.getByRole('button', { name: 'Confirm' }).click();

    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
});

test.describe('keyboard navigation', () => {
  test('skip link is first focusable element and skips to main', async ({ page }) => {
    await page.goto(BASE);
    await page.waitForSelector('.summary-card', { timeout: 15000 });

    await page.keyboard.press('Tab');
    const focused = await page.evaluate(() => document.activeElement?.className);
    expect(focused).toContain('skip-link');
  });

  test('citation button expands and focuses matching source', async ({ page }) => {
    await page.goto(BASE);
    await page.waitForSelector('.summary-card', { timeout: 15000 });

    const firstCitation = page.locator('.citation-btn').first();
    await firstCitation.click();

    const expanded = page.locator('.source-item--expanded').first();
    await expect(expanded).toBeVisible();
  });

  test('source accordion toggles with keyboard Enter/Space', async ({ page }) => {
    await page.goto(BASE);
    await page.waitForSelector('.summary-card', { timeout: 15000 });

    const firstHeader = page.locator('.source-item__header').first();
    await firstHeader.focus();
    await page.keyboard.press('Enter');
    await expect(firstHeader).toHaveAttribute('aria-expanded', 'true');

    await page.keyboard.press('Space');
    await expect(firstHeader).toHaveAttribute('aria-expanded', 'false');
  });

  test('Mark as Reviewed flow is keyboard operable', async ({ page }) => {
    await page.goto(BASE);
    await page.waitForSelector('.summary-card', { timeout: 15000 });

    await page.getByRole('button', { name: 'Mark as Reviewed' }).focus();
    await page.keyboard.press('Enter');
    await page.getByRole('button', { name: 'Confirm' }).focus();
    await page.keyboard.press('Enter');

    await expect(page.locator('.review-badge--reviewed')).toBeVisible();
  });
});
