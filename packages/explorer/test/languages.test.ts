/**
 * Design languages: read generically from @mariachi/design's built catalog (it must be built), plus
 * small fixtures for the filter logic. No language is named here, so new ones need no test changes.
 */
import { describe, expect, it } from 'vitest';
import { activeSection } from '../src/lib/nav';
import { designSidebar } from '../src/lib/sidebars';
import { fromRoot } from '../src/lib/repo';
import {
  designFile,
  fontStylesheets,
  googleFontsUrl,
  languageAssetRoute,
  languageFontRequests,
  languageWeights,
  languageFacets,
  languageFacetValues,
  languageFilterQuery,
  languageLinkResolver,
  languageSearchText,
  languageSettings,
  loadDesign,
  loadLanguages,
  withFontLinks,
} from '../src/loaders/design';

const languages = loadLanguages();

const fixture = (category: string, extra: Partial<{ alsoIn: string[]; feel: string[]; style: string[]; mode: string }> = {}) =>
  ({
    category,
    alsoIn: extra.alsoIn,
    tags: { feel: extra.feel ?? ['calm'], density: 'airy', mode: extra.mode ?? 'light-first', suits: ['banking'], style: extra.style ?? ['rounded'] },
  }) as unknown as Parameters<typeof languageFacetValues>[0];

describe('design languages: catalog', () => {
  it('lists every language in the catalog, each with its published files', () => {
    expect(languages.length).toBeGreaterThan(0);
    expect(languages).toEqual(loadDesign().archetypes);
    for (const a of languages) {
      expect(designFile(a.gallery)).toContain(`data-theme="${a.id}"`);
      expect(designFile(a.designDoc).length).toBeGreaterThan(0);
      expect(a.recipes.length).toBeGreaterThan(0);
      for (const r of a.recipes) expect(designFile(r.file)).toContain('<html');
    }
  });

  it('serves files at the package layout, so their relative links resolve', () => {
    const a = languages[0];
    expect(languageAssetRoute(a.gallery)).toBe(`design/languages/${a.id}/gallery.html`);
    expect(languageAssetRoute(a.recipes[0].file)).toBe(`design/languages/${a.id}/recipes/${a.recipes[0].name}.html`);
    // gallery.html links ../gallery.css and ../../css/themes/<id>.css; recipes link ../../../css/…
    const gallery = new URL(languageAssetRoute(a.gallery), 'http://x/');
    expect(new URL(`../../css/themes/${a.id}.css`, gallery).pathname).toBe(`/design/css/themes/${a.id}.css`);
    expect(new URL('../gallery.css', gallery).pathname).toBe('/design/languages/gallery.css');
    const recipe = new URL(languageAssetRoute(a.recipes[0].file), 'http://x/');
    expect(new URL('../../../css/mariachi.css', recipe).pathname).toBe('/design/css/mariachi.css');
  });

  it('refuses paths outside the design package', () => {
    expect(() => designFile('../../package.json')).toThrow();
  });
});

describe('design languages: filter', () => {
  it('gives each language its category (and the ones it is also in) and tag values', () => {
    const values = languageFacetValues(fixture('calm-fintech', { alsoIn: ['editorial'], feel: ['calm', 'quiet'] }));
    expect(values).toEqual({
      category: ['calm-fintech', 'editorial'],
      feel: ['calm', 'quiet'],
      density: ['airy'],
      mode: ['light-first'],
      suits: ['banking'],
      style: ['rounded'],
    });
  });

  it('counts options, keeps category order and labels, and drops empty categories', () => {
    const categories = { first: { label: 'First' }, empty: { label: 'Empty' }, second: { label: 'Second' } };
    const facets = languageFacets(
      [fixture('second', { style: ['serif', 'rounded'] }), fixture('first', { alsoIn: ['second'] }), fixture('first', { mode: 'dark-first' })],
      categories,
    );
    const by = Object.fromEntries(facets.map((f) => [f.key, f.options]));
    expect(by.category).toEqual([
      { value: 'first', label: 'First', count: 2 },
      { value: 'second', label: 'Second', count: 2 },
    ]);
    expect(by.style).toEqual([
      { value: 'rounded', label: 'rounded', count: 3 },
      { value: 'serif', label: 'serif', count: 1 },
    ]);
    expect(by.mode.map((o) => o.value)).toEqual(['dark-first', 'light-first']);
  });

  it('builds options for every real language and category', () => {
    const facets = languageFacets(languages, loadDesign().categories);
    const category = facets.find((f) => f.key === 'category')!;
    for (const a of languages) expect(category.options.map((o) => o.value)).toContain(a.category);
    expect(facets.map((f) => f.key)).toEqual(['category', 'feel', 'density', 'mode', 'suits', 'style']);
  });

  it('searches keywords and card text, lowercased; links a filter by query string', () => {
    for (const a of languages) {
      const text = languageSearchText(a);
      expect(text).toBe(text.toLowerCase());
      for (const k of a.keywords) expect(text).toContain(k);
      expect(text).toContain(a.label.toLowerCase());
    }
    expect(languageFilterQuery('style', 'pill buttons')).toBe('?style=pill+buttons');
  });
});

describe('design languages: settings', () => {
  it.each(languages.map((a) => [a.id, a] as const))('resolves %s light and dark from its preset', async (_id, a) => {
    const s = await languageSettings(a);
    expect(s.colours[0].group).toBe('color.brand');
    const colours = s.colours.flatMap((g) => g.tokens);
    expect(colours.length).toBe(loadDesign().semantic.filter((t) => t.kind === 'color' && t.path.startsWith('color.')).length);
    for (const t of [...colours, ...s.shadows, ...s.motion, ...s.radius]) {
      expect(t.light, t.path).not.toMatch(/var\(--m-/);
      expect(t.dark, t.path).not.toMatch(/var\(--m-/);
    }
    expect(s.brand.light).toBe(colours.find((t) => t.path === 'color.brand.default')!.light);
    expect(s.type.families.map((f) => f.family)).toEqual([a.type.body, a.type.heading, a.type.mono]);
    expect(s.type.sizes.length).toBeGreaterThan(4);
    for (const t of s.type.sizes) expect(t.px).toMatch(/^[\d.]+px$/);
    expect(s.radius.map((t) => t.name)).toContain('md');
    expect(s.shadows.length).toBeGreaterThan(0);
    expect(s.motion.map((t) => t.name)).toContain('duration.fast');
    expect(s.density).toMatchObject({ default: a.density.default, dense: a.density.dense });
    expect(s.density.controls.map((c) => c.name)).toEqual(['sm', 'md', 'lg']);
  });
});

describe('design languages: DESIGN.md links and navigation', () => {
  it('maps files beside DESIGN.md to their served routes', () => {
    const a = languages[0];
    const folder = fromRoot('packages/design/dist/archetypes', a.id);
    const resolve = languageLinkResolver(a, () => 'fallback');
    expect(resolve(`${folder}/gallery.html`)).toBe(`design/languages/${a.id}/gallery.html`);
    expect(resolve(`${folder}/recipes/${a.recipes[0].name}.html`)).toBe(`design/languages/${a.id}/recipes/${a.recipes[0].name}.html`);
    expect(resolve(`${folder}/recipes`)).toBe(`design/languages/${a.id}#recipes`);
    expect(resolve(`${folder}/DESIGN.md`)).toBe(`design/languages/${a.id}/guide`);
    expect(resolve(`${folder}/unknown.txt`)).toBe('fallback');
    expect(resolve(fromRoot('ROADMAP.md'))).toBe('fallback');
  });

  it('marks the longest matching header section active', () => {
    expect(activeSection('design/languages')).toBe('design/languages');
    expect(activeSection('design/languages/x/guide')).toBe('design/languages');
    expect(activeSection('design/presets/x')).toBe('design');
    expect(activeSection('designer')).toBeUndefined();
    expect(activeSection('')).toBeUndefined();
  });

  it('lists languages in the design sidebar, and each preset once', () => {
    const groups = designSidebar(loadDesign());
    const routes = groups.flatMap((g) => g.links.map((l) => l.route));
    expect(routes).toContain('design/languages');
    for (const a of languages) expect(routes).toContain(`design/languages/${a.id}`);
    for (const a of languages) expect(routes).not.toContain(`design/presets/${a.id}`);
    expect(new Set(routes).size).toBe(routes.length);
  });
});

describe('design languages: fonts', () => {
  it('builds a css2 URL with sorted, whole weights and display=swap', () => {
    expect(googleFontsUrl([{ family: 'Open Face', weights: [600, 400, 400.4, 0] }, { family: 'Mono Face', weights: [] }])).toBe(
      'https://fonts.googleapis.com/css2?family=Open+Face:wght@400;600&family=Mono+Face&display=swap',
    );
  });

  it('asks for each family once, with the weights the page or card uses', () => {
    const type = { type: { body: 'A', heading: 'A', mono: 'M' } } as Parameters<typeof languageFontRequests>[0];
    const weights = { all: [400, 500, 700], body: 360, heading: 380 };
    expect(languageFontRequests(type, weights, 'page')).toEqual([
      { family: 'A', weights: [360, 380, 400, 500, 700] },
      { family: 'M', weights: [360, 380, 400, 500, 700] },
    ]);
    expect(languageFontRequests(type, weights, 'card')).toEqual([{ family: 'A', weights: [360, 380, 400] }]);
  });

  it('skips families Google lacks; keeps unchecked ones apart so one miss cannot fail the rest', async () => {
    const known: Record<string, boolean | undefined> = { Yes: true, Also: true, No: false, Unknown: undefined };
    const urls = await fontStylesheets(
      ['Yes', 'No', 'Also', 'Unknown'].map((family) => ({ family, weights: [400] })),
      async (f) => known[f],
    );
    expect(urls).toEqual([
      'https://fonts.googleapis.com/css2?family=Yes:wght@400&family=Also:wght@400&display=swap',
      'https://fonts.googleapis.com/css2?family=Unknown:wght@400&display=swap',
    ]);
    expect(await fontStylesheets([{ family: 'No', weights: [400] }], async () => false)).toEqual([]);
  });

  it('resolves every language\'s weights from its preset', async () => {
    for (const a of languages) {
      const w = await languageWeights(a);
      expect(w.all.length).toBeGreaterThan(0);
      for (const n of [...w.all, w.body, w.heading]) expect(n).toBeGreaterThan(0);
    }
  });

  it('adds non-blocking font links before </head>', () => {
    const html = withFontLinks('<html><head><title>x</title></head><body></body></html>', ['https://fonts.googleapis.com/css2?family=A&b=1']);
    expect(html).toContain('href="https://fonts.googleapis.com/css2?family=A&amp;b=1" media="print" onload="this.media=\'all\'"></head>'.replace('></head>', '>\n</head>'));
    expect(html.indexOf('fonts.gstatic.com')).toBeLessThan(html.indexOf('</head>'));
    expect(withFontLinks('<p>x</p>', [])).toBe('<p>x</p>');
  });
});
