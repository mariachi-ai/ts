import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { buildCatalog, patterns } from '../src/catalog';
import { galleryPage } from '../src/gallery';
import { COLOUR_LITERAL, root, wellFormed } from './helpers';

const readme = fs.readFileSync(path.join(root, 'README.md'), 'utf8');

describe('catalog', () => {
  const catalog = buildCatalog('9.9.9');

  it('has the shape of @mariachi/design’s catalog components', () => {
    expect(catalog.package).toBe('@mariachi/motion');
    expect(catalog.version).toBe('9.9.9');
    for (const p of catalog.patterns) {
      expect(p.name).toMatch(/^[a-z][a-z-]*$/);
      expect(p.title.length).toBeGreaterThan(3);
      for (const key of ['description', 'useWhen'] as const) expect(p[key].length).toBeGreaterThan(20);
      expect(Object.keys(p.anatomy).length).toBeGreaterThan(0);
      expect(p.a11y.length).toBeGreaterThan(0);
      expect(p.examples.length).toBeGreaterThan(0);
      for (const e of p.examples) {
        expect(e.name.length).toBeGreaterThan(0);
        expect(wellFormed(e.html)).toBe(true);
      }
    }
    expect(new Set(catalog.patterns.map((p) => p.name)).size).toBe(catalog.patterns.length);
  });

  it('covers every pattern the README names', () => {
    const names = patterns.map((p) => p.name);
    for (const n of ['skeleton', 'loading-region', 'media', 'progress', 'busy-button', 'optimistic', 'enter', 'stagger', 'leave', 'overlays', 'route']) expect(names).toContain(n);
    for (const kind of ['line', 'area', 'bar', 'donut', 'sparkline', 'stat']) {
      expect(names).toContain(`chart-${kind}`);
      expect(readme).toContain(`\`${kind}\``);
    }
  });

  it('writes its markup with tokens only: no colour literals outside a currentColor stroke', () => {
    const html = patterns.flatMap((p) => p.examples.map((e) => e.html)).join('\n');
    expect(html.replace(/currentColor/g, '').match(COLOUR_LITERAL)).toBeNull();
  });
});

describe('gallery', () => {
  it('is one page with every section, loading the kit named in the URL', () => {
    const page = galleryPage('9.9.9');
    for (const id of ['g-loading', 'g-actions', 'g-motion', 'g-charts']) expect(page).toContain(`id="${id}"`);
    expect(page).toContain("design + '/kits/' + theme + '/index.css'");
    expect(page).toContain("import { enhance, busy, optimistic, leave, countUp, navigate } from");
  });
});
