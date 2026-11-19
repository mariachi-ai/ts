import fs from 'node:fs';
import path from 'node:path';
import { DesignKitsError } from './errors';
import { catalogPath, defaultStoreRoot, type KitStore, openKitStore } from './store';

/**
 * `mariachi design reference <name>`: how a kit's design language builds a component. A project copies only a
 * language's base (tokens, base styles, fonts, DESIGN.md); when it needs a component, it looks up how the language
 * draws it here and writes it on the copied tokens. The library is never a dependency of the app.
 *
 * Everything comes from this package: the catalog (`catalog.json`: each component's anatomy, use, accessibility and
 * examples; each language's page recipes), the kit's own `DESIGN.md` and `tokens.css`, and, packed beside them, the
 * component CSS (`reference/components/<name>.css`) and each language's named patterns
 * (`reference/patterns/<language>.json`: a player, a job card…).
 */

export const ANSWER_MAX_CHARS = 12_000;
export const CSS_INLINE_MAX_CHARS = 6_000;
const EXCERPT_LINES = 30;

export interface ReferenceComponent {
  name: string;
  title?: string;
  description?: string;
  useWhen?: string;
  anatomy?: Record<string, string>;
  examples?: Array<{ name?: string; html?: string }>;
  a11y?: string[];
}

export interface ReferencePattern {
  name: string;
  aliases?: string[];
  intent?: string;
  html?: string;
}

export interface ReferenceLanguage {
  id: string;
  label?: string;
  for?: string;
  recipes?: Array<{ name: string; title?: string; html?: string }>;
}

/** Where the reference reads from. The default is this package's own files; tests pass their own. */
export interface ReferenceSource {
  components(): ReferenceComponent[];
  /** The design languages (presets aren't languages: they have no recipes, patterns or notes per component). */
  languages(): ReferenceLanguage[];
  /** Whether a kit of this id exists, language or preset. */
  hasKit(id: string): boolean;
  /** A kit's own file as text (`DESIGN.md`, `tokens.css`), or null. */
  kitFile(id: string, file: string): string | null;
  /** A component's CSS, on `--m-*` tokens only, or null. */
  componentCss(name: string): string | null;
  /** Where a component's CSS file is, for an answer that names it instead of quoting it. */
  componentCssPath(name: string): string;
  patterns(language: string): ReferencePattern[];
}

/** The reference source packed in this package (or in the store at `root`). */
export function openReferenceSource(root: string = defaultStoreRoot(), store: KitStore = openKitStore(root)): ReferenceSource {
  let catalog: { components?: ReferenceComponent[]; archetypes?: ReferenceLanguage[] } | undefined;
  const read = () => {
    if (catalog) return catalog;
    const file = catalogPath(root);
    if (!fs.existsSync(file)) {
      throw new DesignKitsError('design-kits/store-missing', '@mariachi/design-kits has no catalog.json. Reinstall it, or build it: pnpm --filter @mariachi/design-kits build');
    }
    catalog = JSON.parse(fs.readFileSync(file, 'utf8')) as typeof catalog;
    return catalog!;
  };
  const text = (file: string): string | null => (fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null);
  return {
    components: () => read().components ?? [],
    languages: () => read().archetypes ?? [],
    hasKit: (id) => store.has(id),
    kitFile: (id, file) => {
      try {
        return store.file(id, file).toString('utf8');
      } catch (err) {
        if (err instanceof DesignKitsError) return null;
        throw err;
      }
    },
    componentCss: (name) => text(path.join(root, 'reference', 'components', `${name}.css`)),
    componentCssPath: (name) => path.join(root, 'reference', 'components', `${name}.css`),
    patterns: (language) => {
      const raw = text(path.join(root, 'reference', 'patterns', `${language}.json`));
      return raw ? ((JSON.parse(raw) as { patterns?: ReferencePattern[] }).patterns ?? []) : [];
    },
  };
}

export type ReferenceAnswer =
  | { found: 'component'; kit: string; name: string; markdown: string }
  | { found: 'pattern'; kit: string; name: string; markdown: string }
  | { found: 'none'; kit: string; name: string; suggestions: string[]; markdown: string };

const norm = (s: string) => s.toLowerCase().trim().replace(/[\s_]+/g, '-');
const oneLine = (s: string) => s.replace(/\s+/g, ' ').trim().slice(0, 140);
const fence = (lang: string, text: string) => `\`\`\`${lang}\n${text.trim()}\n\`\`\``;
const excerpt = (html: string) => html.split('\n').slice(0, EXCERPT_LINES).join('\n');

function kitOrThrow(src: ReferenceSource, kit: string): { id: string; language: ReferenceLanguage | null } {
  const id = norm(kit);
  if (!src.hasKit(id)) {
    throw new DesignKitsError('design-kits/unknown-kit', `There's no kit called "${kit}". mariachi design list shows them all.`, { kit });
  }
  return { id, language: src.languages().find((l) => l.id === id) ?? null };
}

/** Everything the reference can answer for a kit: the components, then its language's named patterns. */
export function referenceList(kit: string | null, src: ReferenceSource = openReferenceSource()): string {
  const k = kit ? kitOrThrow(src, kit) : null;
  const lines = [`# Design reference${k ? `: ${k.language?.label ?? k.id}` : ''}`, '', '## Components'];
  for (const c of src.components()) lines.push(`- \`${c.name}\`: ${oneLine(c.description ?? c.useWhen ?? '')}`);
  const patterns = k?.language ? src.patterns(k.id) : [];
  if (patterns.length) {
    lines.push('', '## Patterns in this language');
    for (const p of patterns) lines.push(`- \`${p.name}\`${p.aliases?.length ? ` (also ${p.aliases.join(', ')})` : ''}: ${oneLine(p.intent ?? '')}`);
  }
  if (!k) lines.push('', '## Languages', ...src.languages().map((l) => `- \`${l.id}\`: ${oneLine(l.for ?? l.label ?? '')}`));
  return clip(lines.join('\n'));
}

/**
 * How `kit` builds `name`, as Markdown: how its language draws it, its anatomy and options, example markup, the CSS to
 * copy, and where it appears in the language's pages. An unknown name says so and offers the closest.
 */
export function designReference(name: string, kit: string, src: ReferenceSource = openReferenceSource()): ReferenceAnswer {
  const k = kitOrThrow(src, kit);
  const label = k.language?.label ?? k.id;
  const key = norm(name);
  const components = src.components();
  const comp = components.find((c) => c.name === key || norm(c.title ?? '') === key);
  const patterns = k.language ? src.patterns(k.id) : [];
  const pattern = comp ? undefined : patterns.find((p) => norm(p.name) === key || p.aliases?.some((a) => norm(a) === key));

  if (!comp && !pattern) {
    const suggestions = closest(name, components, patterns);
    return {
      found: 'none',
      kit: k.id,
      name,
      suggestions,
      markdown: `"${name}" isn't a component or a named pattern in ${label}. Compose it from these components: ${suggestions.map((c) => `\`${c}\``).join(', ')}. \`mariachi design reference --list\` names them all.`,
    };
  }

  if (pattern) {
    const markdown = clip(
      [`# ${pattern.name}, in ${label} (a pattern)`, pattern.intent ? `\n${pattern.intent}` : '', "\n## Markup, from the language's pages", fence('html', excerpt(pattern.html ?? '')), '\nBuild it from the components it uses: look each one up for its CSS.'].join('\n'),
    );
    return { found: 'pattern', kit: k.id, name: pattern.name, markdown };
  }

  const c = comp!;
  const title = c.title ?? c.name;
  const parts: string[] = [`# ${title}, in ${label}`];

  parts.push('\n## How this language draws it');
  if (k.language) {
    const drawn = designDocEntry(src.kitFile(k.id, 'DESIGN.md'), title, c.name);
    parts.push(drawn ?? `(DESIGN.md has no entry for ${title}: follow the language's foundations and the tokens below.)`);
  } else {
    parts.push(`${label} is a plain preset, not a design language: it has no notes on how each component is drawn. Build ${title} on the library's defaults, with the preset's tokens.`);
  }
  const tokens = themeTokens(src.kitFile(k.id, 'tokens.css'), c.name);
  if (tokens.length) parts.push('', "Its values (already in the project's copied tokens):", fence('css', tokens.join('\n')));

  parts.push('\n## Anatomy and options');
  if (c.useWhen) parts.push(`Use it for: ${c.useWhen}`);
  for (const [cls, what] of Object.entries(c.anatomy ?? {})) parts.push(`- \`${cls}\`: ${what}`);
  if (c.a11y?.length) parts.push('', 'Accessibility:', ...c.a11y.map((a) => `- ${a}`));

  const example = (c.examples ?? []).find((e) => e.html);
  if (example) parts.push('\n## Example markup', ...(example.name ? [`**${example.name}**`] : []), fence('html', excerpt(example.html!)));

  const css = src.componentCss(c.name);
  parts.push('\n## The CSS to copy');
  if (!css) parts.push('(No CSS file for it in this build.)');
  else if (css.length > CSS_INLINE_MAX_CHARS) parts.push(`It's long (${css.length.toLocaleString('en-US')} characters): copy it from \`${src.componentCssPath(c.name)}\` as it is. It reads only \`--m-*\` tokens, so the project's copied tokens style it.`);
  else parts.push("It reads only `--m-*` tokens, so copy it as it is: the project's copied tokens give it this language's look.", fence('css', css));

  // Where it appears in the language's pages: only when it fits whole, never cut inside a fence.
  const body = parts.join('\n').replace(/\n{3,}/g, '\n\n');
  const recipe = (k.language?.recipes ?? []).find((r) => r.html?.includes(`m-${c.name}`));
  if (recipe?.html) {
    const where = `\n\n## Where it appears: the ${recipe.title ?? recipe.name} page\n${fence('html', around(recipe.html, `m-${c.name}`))}`;
    if (body.length + where.length <= ANSWER_MAX_CHARS) return { found: 'component', kit: k.id, name: c.name, markdown: body + where };
  }
  return { found: 'component', kit: k.id, name: c.name, markdown: clip(body) };
}

/**
 * A DESIGN.md's Components entry for a component: its bullet and the bullets under it. An entry can name several
 * ("**Input, textarea.**", "**Tabs and segmented control.**"), and names can be plural ("**Badges.**").
 */
export function designDocEntry(md: string | null, title: string, name = title): string | null {
  if (!md) return null;
  const head = /(^|\n)## Components/.exec(md);
  if (!head) return null;
  const start = head.index + head[1]!.length;
  const end = md.indexOf('\n## ', start + 3);
  const section = md.slice(start, end < 0 ? undefined : end).split('\n');
  const wanted = new Set([title, name, name.replace(/-/g, ' ')].map((x) => x.toLowerCase().trim()));
  const matches = (bold: string) =>
    bold
      .replace(/[.:,]+$/, '')
      .split(/,|\band\b|\//i)
      .map((x) => x.toLowerCase().trim())
      .filter(Boolean)
      .some((x) => wanted.has(x) || wanted.has(x.replace(/s$/, '')) || wanted.has(x.replace(/es$/, '')));
  const i = section.findIndex((l) => {
    const m = /^\s*(?:- )?\*\*([^*]+)\*\*/.exec(l);
    return !!m && matches(m[1]!);
  });
  if (i < 0) return null;
  const indent = section[i]!.length - section[i]!.trimStart().length;
  const out = [section[i]!.slice(indent)];
  const paragraph = !/^\s*- /.test(section[i]!);
  for (const l of section.slice(i + 1)) {
    if (!l.trim()) {
      if (paragraph && out.length === 1) continue;
      break;
    }
    const lead = l.length - l.trimStart().length;
    if (lead <= indent && /^\s*(- \*\*|\*\*)/.test(l)) break;
    out.push(l.slice(Math.min(indent, lead)));
  }
  return out.join('\n');
}

/** A tokens file's `--m-<name>-*` declarations, once each. */
export function themeTokens(css: string | null, name: string): string[] {
  if (!css) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const m of css.matchAll(new RegExp(`--m-${name}-[\\w-]+\\s*:[^;]+;`, 'g'))) {
    const decl = m[0].replace(/\s+/g, ' ');
    const prop = decl.split(':')[0]!;
    if (seen.has(prop)) continue;
    seen.add(prop);
    out.push(decl);
  }
  return out;
}

/** The three nearest names: by the words they share with what was asked, then by spelling. */
function closest(asked: string, components: ReferenceComponent[], patterns: ReferencePattern[]): string[] {
  const words = (s: string) => new Set(s.toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 2));
  const want = words(asked);
  const key = norm(asked);
  const options = [
    ...components.map((c) => ({ name: c.name, text: `${c.name} ${c.title ?? ''} ${c.description ?? ''} ${c.useWhen ?? ''}` })),
    ...patterns.map((p) => ({ name: p.name, text: `${p.name} ${(p.aliases ?? []).join(' ')} ${p.intent ?? ''}` })),
  ];
  const shared = (t: string) => [...words(t)].filter((w) => want.has(w) || [...want].some((x) => w.startsWith(x) || x.startsWith(w))).length;
  const ranked = options
    .map((o) => ({ name: o.name, shared: shared(o.text), spelling: o.name.includes(key) || key.includes(o.name) ? 0 : levenshtein(key, o.name) }))
    .sort((a, b) => b.shared - a.shared || a.spelling - b.spelling);
  const hits = ranked.filter((r) => r.shared > 0).map((r) => r.name);
  return [...new Set(hits.length ? hits : ['card', 'layout', 'button'])].slice(0, 3);
}

function levenshtein(a: string, b: string): number {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...new Array<number>(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0]![j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) d[i]![j] = Math.min(d[i - 1]![j]! + 1, d[i]![j - 1]! + 1, d[i - 1]![j - 1]! + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length]![b.length]!;
}

/** About `EXCERPT_LINES` lines of `html` around the first `needle`. */
function around(html: string, needle: string): string {
  const lines = html.split('\n');
  const at = Math.max(0, lines.findIndex((l) => l.includes(needle)));
  const from = Math.max(0, at - 4);
  return lines.slice(from, from + EXCERPT_LINES).join('\n');
}

function clip(text: string): string {
  if (text.length <= ANSWER_MAX_CHARS) return text;
  return `${text.slice(0, ANSWER_MAX_CHARS - 80).trimEnd()}\n\n(Cut at ${ANSWER_MAX_CHARS.toLocaleString('en-US')} characters.)`;
}
