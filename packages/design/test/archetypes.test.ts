import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { buildCatalog, packageAssets, packageRoot } from '../src/build';
import { componentList, tokenList } from '../src/contract';
import { lucidePaths } from '../src/archetypes/lucide';
import { type Theme, archetypes, checkTheme, extraRecipeNames, iconActions, presets, recipeNames } from '../src/index';

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

  it('has the required recipes in order, then only the optional extras, in order', () => {
    const names = archetype.recipes.map((r) => r.name);
    expect(names.slice(0, recipeNames.length)).toEqual([...recipeNames]);
    const extras = names.slice(recipeNames.length);
    expect(extras).toEqual(extraRecipeNames.filter((n) => extras.includes(n)));
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

  it('has a DESIGN.md with the sections agents rely on, every component specified, and the generated reference', () => {
    const doc = fs.readFileSync(path.join(packageRoot(), 'src', 'archetypes', id, 'DESIGN.md'), 'utf8');
    for (const h of [
      '## Principles',
      '## Foundations',
      '## Type',
      '## Icons',
      '## Charts',
      '## States',
      '## Components',
      '## Error handling',
      '## Page shapes (recipes)',
      "## Do and don't",
    ])
      expect(doc).toContain(h);
    const components = doc.slice(doc.indexOf('## Components'), doc.indexOf('## Error handling')).toLowerCase();
    expect(componentList.map((c) => c.name).filter((n) => !components.includes(n.replace('-', ' ')))).toEqual([]);
    const shipped = assets[`archetypes/${id}/DESIGN.md`];
    expect(shipped.startsWith(doc)).toBe(true);
    for (const h of [
      '### Type scale',
      '### Spacing scale',
      '### Layout and density',
      '### Radius, borders and shadows',
      '### Motion',
      '### Colour',
      '### Icons for common actions',
    ])
      expect(shipped).toContain(h);
  });

  it('names a drawable icon for every common action', () => {
    expect(iconActions.filter((k) => !lucidePaths[archetype.icons.actions[k]])).toEqual([]);
  });

  it('ships a gallery: foundations, icons, every state, the patterns and every component', () => {
    const page = assets[`archetypes/${id}/gallery.html`];
    expect(page).toContain(`data-theme="${id}"`);
    expect(page).toContain('href="../gallery.css"');
    for (const s of ['foundations', 'icons', 'states', 'patterns', 'components']) expect(page).toContain(`id="${s}"`);
    for (const st of [
      'data-g-hover',
      'data-g-focus',
      'data-g-active',
      'disabled',
      'aria-invalid="true"',
      'aria-busy="true"',
    ])
      expect(page).toContain(st);
    expect(componentList.map((c) => c.name).filter((n) => !page.includes(`id="c-${n}"`))).toEqual([]);
    for (const code of ['404', '500', '403']) expect(page).toContain(code);
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
        // A concrete colour, every reference followed
        for (const v of [s.light, s.dark]) expect(v).toMatch(/^(#[0-9a-f]{3,8}|oklch\(|rgb\()/i);
      }
      expect(Object.keys(assets)).toContain(a.designDoc);
      for (const r of a.recipes) expect(Object.keys(assets)).toContain(r.file);
    }
  });

  it('gives each language a known category and the tags New Project searches', () => {
    const catalog = buildCatalog('0.0.0');
    expect(Object.keys(catalog.categories).length).toBeGreaterThan(0);
    for (const a of catalog.archetypes) {
      expect(Object.keys(catalog.categories)).toContain(a.category);
      expect(a.tags.feel.length).toBeGreaterThan(0);
      expect(a.tags.suits.length).toBeGreaterThan(0);
      expect(a.tags.style.length).toBeGreaterThan(0);
      for (const w of [a.id, a.category, a.tags.density, a.tags.mode, ...a.tags.feel, ...a.tags.suits])
        expect(a.keywords).toContain(w);
      for (const w of a.keywords) expect(w).toBe(w.toLowerCase());
    }
  });
});

describe('gallery stylesheet', () => {
  it('is the package CSS with hover, focus and pressed also matching data attributes', () => {
    const g = assets['archetypes/gallery.css'];
    expect(g).toContain(':is(:hover, [data-g-hover])');
    expect(g).toContain(':is(:focus-visible, [data-g-focus])');
    expect(g).not.toMatch(/[^(]:hover\b(?!, \[data-g-hover\])/);
  });
});
