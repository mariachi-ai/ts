import fs from 'node:fs';
import path from 'node:path';
import type { Catalog, CatalogArchetype } from '@mariachi/design/build';
import { ExplorerError } from '../lib/errors';
import { renderMarkdown } from '../lib/markdown';
import { fromRoot, once } from '../lib/repo';
import { routeForFile } from './routes';

const dist = (...parts: string[]) => fromRoot('packages', 'design', 'dist', ...parts);

/** The design library's catalog (components, examples, tokens, presets), from its build output. */
export const loadDesign = once((): Catalog => {
  const file = dist('catalog.json');
  if (!fs.existsSync(file)) throw new ExplorerError('explorer/missing-source', `${file} is missing; build @mariachi/design first`);
  return JSON.parse(fs.readFileSync(file, 'utf8')) as Catalog;
});

/** CSS the explorer serves: the library plus every preset theme. */
export const designCss = once(() => {
  const themes = loadDesign().presets.map((p) => fs.readFileSync(dist('css', 'themes', `${p.name}.css`), 'utf8'));
  return { library: fs.readFileSync(dist('css', 'mariachi.css'), 'utf8'), themes: themes.join('\n') };
});

/** Contrast results for every built-in preset (both modes), for the preset pages. */
export const loadPresetChecks = once(async () => {
  const { presets, checkTheme } = await import('@mariachi/design');
  return Object.fromEntries(Object.values(presets).map((p) => [p.name, checkTheme(p)]));
});

/** A file the design package publishes, by its package path (`css/mariachi.css`, `archetypes/<id>/gallery.html`). */
export function designFile(packagePath: string): string {
  const file = dist(...packagePath.split('/'));
  if (!file.startsWith(dist()) || !fs.existsSync(file)) {
    throw new ExplorerError('explorer/missing-source', `${file} is missing; build @mariachi/design first`);
  }
  return fs.readFileSync(file, 'utf8');
}

// ---------------------------------------------------------------------------------------------
// Design languages: everything is read from the catalog, so new languages appear without changes.

export type Language = CatalogArchetype;

/** Every design language in the catalog, in its display order. */
export const loadLanguages = (): Language[] => loadDesign().archetypes ?? [];

export const findLanguage = (id: string): Language | undefined => loadLanguages().find((a) => a.id === id);

/** The groups languages are filtered by: category (including the ones a language is also in) and each tag group. */
export const LANGUAGE_FACETS = [
  { key: 'category', label: 'Category' },
  { key: 'feel', label: 'Feel' },
  { key: 'density', label: 'Density' },
  { key: 'mode', label: 'Mode' },
  { key: 'suits', label: 'Suits' },
  { key: 'style', label: 'Style' },
] as const;
export type LanguageFacetKey = (typeof LANGUAGE_FACETS)[number]['key'];

type FacetSource = Pick<Language, 'category' | 'alsoIn' | 'tags'>;

/** A language's values for every facet. */
export function languageFacetValues(a: FacetSource): Record<LanguageFacetKey, string[]> {
  return {
    category: [a.category, ...(a.alsoIn ?? [])],
    feel: a.tags.feel,
    density: [a.tags.density],
    mode: [a.tags.mode],
    suits: a.tags.suits,
    style: a.tags.style,
  };
}

export interface LanguageFacet {
  key: LanguageFacetKey;
  label: string;
  options: { value: string; label: string; count: number }[];
}

/**
 * The filter's options: every value any language has, with how many have it. Categories keep the
 * catalog's order and labels (only those with a language); tag values are alphabetical.
 */
export function languageFacets(languages: FacetSource[], categories: Record<string, { label: string }>): LanguageFacet[] {
  return LANGUAGE_FACETS.map(({ key, label }) => {
    const counts = new Map<string, number>();
    for (const a of languages) for (const v of new Set(languageFacetValues(a)[key])) counts.set(v, (counts.get(v) ?? 0) + 1);
    const values = key === 'category' ? Object.keys(categories).filter((c) => counts.has(c)) : [...counts.keys()].sort((x, y) => x.localeCompare(y));
    return {
      key,
      label,
      options: values.map((value) => ({ value, label: key === 'category' ? (categories[value]?.label ?? value) : value, count: counts.get(value) ?? 0 })),
    };
  }).filter((f) => f.options.length > 0);
}

/** What the text search matches: the catalog's keywords plus the card's words, lowercase. */
export const languageSearchText = (a: Pick<Language, 'keywords' | 'label' | 'pitch' | 'for'>) => [...a.keywords, a.label, a.pitch, a.for].join(' ').toLowerCase();

/** Query string for the index filtered to one facet value, e.g. `?category=calm-fintech`. */
export const languageFilterQuery = (key: LanguageFacetKey, value: string) => `?${new URLSearchParams({ [key]: value })}`;

// ---------------------------------------------------------------------------------------------
// A language's settings, resolved from its preset the same way its gallery and DESIGN.md are.

export interface ResolvedToken {
  path: string;
  cssVar: string;
  /** The path below its group: `default` for `color.brand.default`, `md` for `radius.md`. */
  name: string;
  description: string;
  light: string;
  dark: string;
}

export interface LanguageSettings {
  /** `color.<group>` groups, the brand colour first. */
  colours: { group: string; tokens: ResolvedToken[] }[];
  brand: ResolvedToken;
  type: {
    families: { role: string; family: string; stack: string; cssVar: string }[];
    sizes: (ResolvedToken & { px: string })[];
    weights: ResolvedToken[];
    leading: ResolvedToken[];
    tracking: ResolvedToken[];
    body: { weight: string };
    heading: { weight: string; tracking: string; transform: string };
  };
  radius: (ResolvedToken & { px: string })[];
  shadows: ResolvedToken[];
  motion: ResolvedToken[];
  density: { default: number; dense: number; unit: string; controls: { name: string; px: string }[] };
}

const BRAND_GROUP = 'color.brand';

/** Resolves a language's tokens (every `var()` followed, light and dark) for its settings section. */
export async function languageSettings(language: Language): Promise<LanguageSettings> {
  const { presets, resolveDeep, toPx } = await import('@mariachi/design');
  const theme = (presets as Record<string, Parameters<typeof resolveDeep>[0]>)[language.id];
  if (!theme) throw new ExplorerError('explorer/missing-source', `Design language "${language.id}" has no preset of the same name`);
  const semantic = loadDesign().semantic;
  const resolve = (t: Catalog['semantic'][number], depth: number): ResolvedToken => ({
    path: t.path,
    cssVar: t.cssVar,
    name: t.path.split('.').slice(depth).join('.'),
    description: t.description,
    light: resolveDeep(theme, t.path, 'light'),
    dark: resolveDeep(theme, t.path, 'dark'),
  });
  const under = (prefix: string) =>
    semantic.filter((t) => t.path.startsWith(`${prefix}.`)).map((t) => resolve(t, prefix.split('.').length));
  const one = (p: string) => {
    const t = semantic.find((s) => s.path === p);
    if (!t) throw new ExplorerError('explorer/missing-source', `The design contract has no token ${p}`);
    return resolve(t, p.split('.').length - 1);
  };
  const withPx = <T extends ResolvedToken>(t: T) => ({ ...t, px: toPx(t.light) });

  const groups = [...new Set(semantic.filter((t) => t.kind === 'color' && t.path.startsWith('color.')).map((t) => t.path.split('.').slice(0, 2).join('.')))];
  const ordered = groups.includes(BRAND_GROUP) ? [BRAND_GROUP, ...groups.filter((g) => g !== BRAND_GROUP)] : groups;
  const families = [
    { role: 'Body', family: language.type.body, token: 'font.body.family' },
    { role: 'Heading', family: language.type.heading, token: 'font.heading.family' },
    { role: 'Mono', family: language.type.mono, token: 'font.family.mono' },
  ].map(({ role, family, token }) => {
    const t = one(token);
    return { role, family, stack: t.light, cssVar: t.cssVar };
  });
  return {
    colours: ordered.map((group) => ({ group, tokens: under(group) })),
    brand: one('color.brand.default'),
    type: {
      families,
      sizes: under('font.size').map(withPx),
      weights: under('font.weight'),
      leading: under('font.leading'),
      tracking: under('font.tracking'),
      body: { weight: one('font.body.weight').light },
      heading: {
        weight: one('font.heading.weight').light,
        tracking: one('font.heading.tracking').light,
        transform: one('font.heading.transform').light,
      },
    },
    radius: under('radius').map(withPx),
    shadows: under('shadow'),
    motion: under('motion'),
    density: {
      default: language.density.default,
      dense: language.density.dense,
      unit: toPx(one('space.unit').light),
      controls: under('control.height').map((t) => ({ name: t.name, px: toPx(t.light) })),
    },
  };
}

// ---------------------------------------------------------------------------------------------
// A language's published files, served by the explorer in the package's own layout (`archetypes/`
// under `design/languages/`, `css/` under `design/css/`), so their relative links keep working.

/** Explorer route for a file in the design package's `archetypes/` folder, e.g. `design/languages/<id>/gallery.html`. */
export const languageAssetRoute = (packagePath: string) => `design/languages/${packagePath.replace(/^archetypes\//, '')}`;

/**
 * Link resolver for a language's DESIGN.md: the files beside it (gallery, recipes, the recipes
 * folder, DESIGN.md itself) become their explorer routes; anything else goes to `fallback`.
 */
export function languageLinkResolver(language: Language, fallback: (absolutePath: string) => string | undefined) {
  const folder = path.posix.dirname(language.designDoc);
  const root = dist(...folder.split('/'));
  const served = new Set([language.gallery, ...language.recipes.map((r) => r.file)]);
  return (absolute: string): string | undefined => {
    const rel = path.relative(root, absolute).split(path.sep).join('/');
    if (rel.startsWith('..') || path.isAbsolute(rel)) return fallback(absolute);
    if (rel === 'DESIGN.md') return `design/languages/${language.id}/guide`;
    if (rel.replace(/\/$/, '') === 'recipes') return `design/languages/${language.id}#recipes`;
    if (served.has(`${folder}/${rel}`)) return languageAssetRoute(`${folder}/${rel}`);
    return fallback(absolute);
  };
}

/** A language's DESIGN.md, rendered (links to its gallery and recipes point at their served copies). */
export function loadLanguageGuide(language: Language) {
  return renderMarkdown(designFile(language.designDoc), dist(...language.designDoc.split('/')), languageLinkResolver(language, routeForFile));
}
