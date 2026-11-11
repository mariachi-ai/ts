import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { buildCatalog, packageAssets, packageRoot } from '../src/build';
import { tokenList } from '../src/contract';
import { type Theme, archetypes, checkTheme, presets, recipeNames } from '../src/index';

const assets = packageAssets().files;
// Every class the package's CSS defines (the CSS files only, never the catalog, which holds the recipes)
const css = Object.entries(assets)
  .filter(([f]) => f.endsWith('.css'))
  .map(([, c]) => c)
  .join('\n');
const knownClasses = new Set(css.match(/\.m-[a-z0-9-]+/g)?.map((c) => c.slice(1)));
const knownVars = new Set(tokenList.map((t) => t.cssVar));

describe.each(archetypes.map((a) => [a.id, a] as const))('archetype %s', (id, archetype) => {
  const preset = (presets as Record<string, Theme>)[id];

  it('is a preset of the same name, passing every contrast pair in both modes', () => {
    expect(preset).toBeDefined();
    const check = checkTheme(preset);
    expect(check.ok).toBe(true);
    expect(check.unchecked).toEqual([]);
  });

  it('has all six recipes, in order', () => {
    expect(archetype.recipes.map((r) => r.name)).toEqual([...recipeNames]);
  });

  it.each(archetype.recipes.map((r) => [r.name, r] as const))(
    'recipe %s uses only the library: its classes, its tokens, no colour literals',
    (_name, recipe) => {
      const classes = [...recipe.html.matchAll(/class="([^"]+)"/g)].flatMap((m) => m[1].split(/\s+/));
      expect(classes.filter((c) => !knownClasses.has(c))).toEqual([]);
      const vars = [...recipe.html.matchAll(/var\((--m-[a-z0-9-]+)\)/g)].map((m) => m[1]);
      const setVars = [...recipe.html.matchAll(/(--m-[a-z0-9-]+)\s*:/g)].map((m) => m[1]);
      expect([...vars, ...setVars].filter((v) => !knownVars.has(v))).toEqual([]);
      expect(recipe.html).not.toMatch(/#[0-9a-f]{3,8}\b|\b(rgb|rgba|hsl|hsla|oklch|oklab|color-mix)\(/i);
    },
  );

  it('has a DESIGN.md with the sections agents rely on', () => {
    const doc = fs.readFileSync(path.join(packageRoot(), 'src', 'archetypes', id, 'DESIGN.md'), 'utf8');
    for (const h of [
      '## Principles',
      '## Tokens',
      '## Type',
      '## Icons and imagery',
      '## Charts',
      '## Components',
      '## Page shapes (recipes)',
      "## Do and don't",
    ])
      expect(doc).toContain(h);
    expect(assets[`archetypes/${id}/DESIGN.md`]).toBe(doc);
  });

  it('ships each recipe as a page on its own theme', () => {
    for (const r of archetype.recipes) {
      const page = assets[`archetypes/${id}/recipes/${r.name}.html`];
      expect(page).toContain(`data-theme="${id}"`);
      expect(page).toContain(`href="../../../css/themes/${id}.css"`);
      expect(page).toContain(r.html);
    }
  });
});

describe('catalog archetypes', () => {
  it('lists each archetype with its card, resolved swatches and file paths', () => {
    const catalog = buildCatalog('0.0.0');
    expect(catalog.archetypes.map((a) => a.id)).toEqual(archetypes.map((a) => a.id));
    for (const a of catalog.archetypes) {
      expect(a.label.length).toBeGreaterThan(0);
      expect(a.pitch.length).toBeGreaterThan(0);
      expect(a.base).toBe('minimal');
      for (const s of a.swatches) {
        expect(s.light).toMatch(/^oklch\(/);
        expect(s.dark).toMatch(/^oklch\(/);
      }
      expect(Object.keys(assets)).toContain(a.designDoc);
      for (const r of a.recipes) expect(Object.keys(assets)).toContain(r.file);
    }
  });
});
