import fs from 'node:fs';
import path from 'node:path';
import { expect, test } from '@playwright/test';
import { collectErrors, routes, SITE } from './helpers';

const all = routes();

test('the site has every section', () => {
  for (const prefix of ['/', '/packages/', '/docs/', '/api/', '/reference/errors/', '/reference/cli/', '/reference/tables/', '/reference/graph/', '/design/', '/design/playground/', '/design/compare/', '/status/']) {
    expect(all, `missing ${prefix}`).toContain(prefix);
  }
  expect(all.length).toBeGreaterThan(100);
});

for (const route of all) {
  test(`loads ${route}`, async ({ page }) => {
    const errors = collectErrors(page);
    const response = await page.goto(route);
    expect(response?.status()).toBe(200);
    await expect(page.locator('main#main')).toBeVisible();
    await expect(page.locator('h1').first()).not.toBeEmpty();
    // Every internal link on the page points at a route that exists.
    const hrefs = await page.locator('a[href^="/"]').evaluateAll((as) => as.map((a) => a.getAttribute('href')!.split('#')[0].split('?')[0]));
    // A route is a page (a folder's index.html) or a file the build writes (a language's gallery.html, its recipes, its DESIGN.md)
    const isFile = (h: string) => fs.existsSync(path.join(SITE, decodeURIComponent(h))) && fs.statSync(path.join(SITE, decodeURIComponent(h))).isFile();
    const broken = [...new Set(hrefs)].filter((h) => h !== '' && !all.includes(h) && !isFile(h));
    expect(broken, 'broken internal links').toEqual([]);
    expect(errors).toEqual([]);
  });
}

test('unknown routes get the 404 page', async ({ page }) => {
  const response = await page.goto('/no/such/page/');
  expect(response?.status()).toBe(404);
  await expect(page.locator('h1')).toHaveText("That page isn't here.");
});

test('explorer.json is valid and complete', async ({ request }) => {
  const res = await request.get('/explorer.json');
  const data = await res.json();
  expect(data.packages.length).toBeGreaterThan(30);
  expect(data.errors.length).toBeGreaterThan(100);
  expect(data.design.components.length).toBeGreaterThan(30);
  expect(data.api.find((p: { package: string }) => p.package === '@mariachi/core')).toBeTruthy();
});
