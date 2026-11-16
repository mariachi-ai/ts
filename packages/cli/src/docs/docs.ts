import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { ConfigError } from '@mariachi/core';

/** One doc in the index. */
export interface DocEntry {
  /** What you ask for it by: `jobs`, `recipes/add-domain-entity`. */
  name: string;
  /** Its path under the docs folder. */
  file: string;
  /** The index's group: `Read first`, `Guides`, `Recipes`, … */
  section: string;
  summary: string;
}

export interface DocMatch {
  name: string;
  file: string;
  /** The nearest heading above the line, or '' at the top of the file. */
  heading: string;
  /** What to ask for to read the section the line is in: `storage#browser-uploads-and-downloads`. */
  ref: string;
  line: number;
  text: string;
}

export interface DocSearchResult {
  /** The words looked for: every one of them is in each matching line. */
  words: string[];
  /** How many lines matched, in all the docs. */
  total: number;
  /** The docs with matching lines, the likeliest first, each with its first few. */
  docs: Array<{ name: string; file: string; total: number; matches: DocMatch[] }>;
}

/** Docs generated from other sources: a word found there is usually a row of a table, so they come last in a search. */
const GENERATED = new Set(['packages', 'design-catalog']);

/**
 * The framework's docs folder: the one in the project's own `@mariachi/core` when run in a project
 * (so the docs match the version it uses), else the one this CLI was installed with.
 */
export function docsDir(cwd: string): string {
  for (const from of [join(cwd, 'package.json'), import.meta.url]) {
    try {
      // The package's entry is dist/index.*; the docs sit beside dist/
      const dir = join(dirname(dirname(createRequire(from).resolve('@mariachi/core'))), 'docs');
      if (existsSync(dir)) return dir;
    } catch {
      // Not installed there: try the next
    }
  }
  throw new ConfigError('cli/docs-not-found', "Can't find the docs: @mariachi/core is not installed here (pnpm install)");
}

function markdownFiles(dir: string, under = ''): string[] {
  return readdirSync(join(dir, under), { withFileTypes: true }).flatMap((entry) => {
    const rel = under ? `${under}/${entry.name}` : entry.name;
    if (entry.isDirectory()) return markdownFiles(dir, rel);
    return entry.name.endsWith('.md') ? [rel] : [];
  });
}

/**
 * The docs there are, from the folder's `llms.txt` (the generated index, with a line about each).
 * A folder without one, from an older version, is listed by its files.
 */
export function readIndex(dir: string): DocEntry[] {
  const indexFile = join(dir, 'llms.txt');
  if (!existsSync(indexFile)) {
    return markdownFiles(dir)
      .filter((file) => file !== 'README.md')
      .sort()
      .map((file) => ({ name: file.replace(/\.md$/, ''), file, section: 'Docs', summary: '' }));
  }
  const entries: DocEntry[] = [];
  let section = '';
  for (const line of readFileSync(indexFile, 'utf8').split('\n')) {
    const heading = /^## (.+)$/.exec(line);
    if (heading) {
      section = (heading[1] as string).trim();
      continue;
    }
    const entry = /^- \[([^\]]+)\]\(\.\/([^)]+)\)(?:: (.*))?$/.exec(line);
    if (entry) entries.push({ name: entry[1] as string, file: entry[2] as string, section, summary: entry[3] ?? '' });
  }
  return entries;
}

const normal = (query: string): string => query.trim().toLowerCase().replace(/^\.\//, '').replace(/\/+$/, '').replace(/\.md$/, '');

/**
 * The doc a name means: its full name (`recipes/add-domain-entity`), its last part
 * (`add-domain-entity`), with or without `.md`, or the start of either when only one doc has it.
 */
export function findDoc(index: DocEntry[], query: string): DocEntry {
  const wanted = normal(query);
  const last = (entry: DocEntry) => entry.name.split('/').pop() as string;
  const exact = index.filter((entry) => entry.name === wanted || last(entry) === wanted);
  if (exact.length === 1) return exact[0] as DocEntry;
  const starting = exact.length ? exact : wanted ? index.filter((entry) => entry.name.startsWith(wanted) || last(entry).startsWith(wanted)) : [];
  if (starting.length === 1) return starting[0] as DocEntry;
  if (starting.length > 1) {
    throw new ConfigError('cli/doc-ambiguous', `"${query}" could be: ${starting.map((entry) => entry.name).join(', ')}`);
  }
  throw new ConfigError('cli/doc-not-found', `No doc is called "${query}". Run \`mariachi docs\` for the list, or \`mariachi docs --search <words>\``);
}

/** The docs of a group, when the name is one: a folder (`recipes`, `adr`) or a heading of the index (`guides`, `read first`). */
export function findGroup(index: DocEntry[], query: string): DocEntry[] {
  const wanted = normal(query);
  if (!wanted) return [];
  const folder = index.filter((entry) => entry.name.startsWith(`${wanted}/`));
  return folder.length ? folder : index.filter((entry) => slug(entry.section) === slug(wanted));
}

/** A heading as it is compared: lower case, words only. `## Pages and files` → `pages-and-files`. */
export function slug(heading: string): string {
  return heading
    .toLowerCase()
    .replace(/`/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '');
}

interface Heading {
  line: number;
  level: number;
  title: string;
}

/** The headings of a doc, skipping anything inside a code block. */
function headings(lines: string[]): Heading[] {
  const found: Heading[] = [];
  let fenced = false;
  lines.forEach((text, line) => {
    if (/^\s*```/.test(text)) fenced = !fenced;
    const match = fenced ? null : /^(#{1,6}) (.+)$/.exec(text);
    if (match) found.push({ line, level: (match[1] as string).length, title: (match[2] as string).trim() });
  });
  return found;
}

/**
 * One section of a doc: from the heading that matches, to the next heading of the same level or
 * above. `wanted` is the heading as written, in any case, or its slug, or the start of either.
 */
export function sectionOf(text: string, wanted: string, doc = 'this doc'): string {
  const lines = text.split('\n');
  const all = headings(lines);
  const key = slug(wanted);
  const at = all.find((h) => slug(h.title) === key) ?? all.find((h) => slug(h.title).startsWith(key));
  if (!at) {
    const list = all.filter((h) => h.level <= 3).map((h) => h.title);
    throw new ConfigError('cli/section-not-found', `${doc} has no section "${wanted}". It has: ${list.join('; ')}`);
  }
  const next = all.find((h) => h.line > at.line && h.level <= at.level);
  return `${lines.slice(at.line, next ? next.line : undefined).join('\n').trimEnd()}\n`;
}

/** The words of a search: each argument split on spaces, so `"tables missing"` is two words as `tables missing` is. */
export function searchWords(args: string[]): string[] {
  return [...new Set(args.flatMap((arg) => arg.toLowerCase().split(/\s+/)).filter(Boolean))];
}

/**
 * The lines that have every word, in any order and case. Every doc with such a line is in the
 * answer, with its first `perDoc` of them and how many it has in all, so no doc is pushed out by
 * the ones before it. Docs come likeliest first: a doc named for a word, then one with a word in a
 * heading, then the rest in the index's order, and the generated catalogs last. `only` searches
 * one doc.
 */
export function searchDocs(dir: string, index: DocEntry[], args: string[], options: { perDoc?: number; only?: DocEntry } = {}): DocSearchResult {
  const words = searchWords(args);
  const result: DocSearchResult = { words, total: 0, docs: [] };
  if (words.length === 0) return result;
  const perDoc = options.perDoc ?? (options.only ? 40 : 5);
  const ranked: Array<{ rank: number; order: number; doc: DocSearchResult['docs'][number] }> = [];

  (options.only ? [options.only] : index).forEach((entry, order) => {
    const path = join(dir, entry.file);
    if (!existsSync(path)) return;
    const lines = readFileSync(path, 'utf8').split('\n');
    const tops = headings(lines);
    const found: Array<DocMatch & { inHeading: boolean }> = [];
    lines.forEach((text, line) => {
      const lower = text.toLowerCase();
      if (!words.every((word) => lower.includes(word))) return;
      const above = tops.filter((h) => h.line <= line).pop();
      found.push({
        name: entry.name,
        file: entry.file,
        heading: above?.title ?? '',
        ref: above ? `${entry.name}#${slug(above.title)}` : entry.name,
        line: line + 1,
        text: text.trim(),
        inHeading: above?.line === line,
      });
    });
    if (found.length === 0) return;
    const named = words.some((word) => entry.name.toLowerCase().includes(word));
    const rank = GENERATED.has(entry.name) ? 3 : named ? 0 : found.some((match) => match.inHeading) ? 1 : 2;
    // A heading that has the words is the place to read, so it leads the doc's lines
    const shown = [...found.filter((m) => m.inHeading), ...found.filter((m) => !m.inHeading)].slice(0, perDoc).map(({ inHeading: _inHeading, ...match }) => match);
    ranked.push({ rank, order, doc: { name: entry.name, file: entry.file, total: found.length, matches: shown } });
    result.total += found.length;
  });

  result.docs = ranked.sort((a, b) => a.rank - b.rank || a.order - b.order).map((item) => item.doc);
  return result;
}

/** A doc's text. */
export function readDoc(dir: string, entry: DocEntry): string {
  return readFileSync(join(dir, entry.file), 'utf8');
}
