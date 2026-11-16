import { expect, type Page, test } from '@playwright/test';
import { MODES, PRESETS, SAMPLES, useTheme } from './helpers';

// The kitchen sink is the whole page; a sample is its frame only, so the page around it (the
// compare form, which lists every preset and language) doesn't move the snapshot.
const pages = [
  { name: 'kitchen-sink', route: '/design/kitchen-sink/', target: 'main' },
  ...SAMPLES.map((s) => ({ name: `sample-${s}`, route: `/design/samples/${s}/`, target: '.x-sample-stage' })),
];

for (const preset of PRESETS) {
  for (const mode of MODES) {
    for (const p of pages) {
      test(`${preset} ${mode} ${p.name}`, async ({ page }) => {
        await useTheme(page, preset, mode);
        await page.goto(p.route);
        await page.evaluate(() => document.fonts.ready);
        await expect(page.locator(p.target)).toHaveScreenshot(`${preset}-${mode}-${p.name}.png`, { mask: [page.locator('[data-streaming]'), page.locator('.m-spinner'), page.locator('.m-skeleton')] });
      });
    }
  }
}

/** The release version in the header changes with every release, not with the shell. */
const releaseBadge = (page: Page) => page.locator('.x-brand .m-badge');

// A package page's shell: the header, the tops of the sidebar and TOC columns, and the page header.
// The clip ends with the page header, so the package's entry points, imports and API are out of
// the shot; its version and symbol count, the package nav and the TOC (built from its exports and
// README) are masked. A package change leaves the snapshot alone; a shell change moves it.
test('shell /packages/ai/', async ({ page }) => {
  await useTheme(page, 'minimal', 'light');
  await page.goto('/packages/ai/');
  await page.evaluate(() => document.fonts.ready);
  const header = await page.locator('main .x-page-header').boundingBox();
  if (!header) throw new Error('No page header on /packages/ai/');
  await expect(page).toHaveScreenshot('shell--packages-ai-.png', {
    clip: { x: 0, y: 0, width: page.viewportSize()?.width ?? 1280, height: Math.ceil(header.y + header.height) + 24 },
    mask: [releaseBadge(page), page.locator('.x-sidebar'), page.locator('.x-toc'), page.locator('main .x-meta')],
  });
});

test('shell /docs/architecture/', async ({ page }) => {
  await useTheme(page, 'minimal', 'light');
  await page.goto('/docs/architecture/');
  await expect(page).toHaveScreenshot('shell--docs-architecture-.png', { mask: [releaseBadge(page), page.locator('pre.mermaid')] });
});
