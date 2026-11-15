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
  /** The nearest heading above the line, or '' at the top of the file. */
  heading: string;
  line: number;
  text: string;
}

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

/**
 * The doc a name means: its full name (`recipes/add-domain-entity`), its last part
 * (`add-domain-entity`), with or without `.md`, or the start of either when only one doc has it.
 */
export function findDoc(index: DocEntry[], query: string): DocEntry {
  const wanted = query.trim().toLowerCase().replace(/^\.\//, '').replace(/\.md$/, '');
  const last = (entry: DocEntry) => entry.name.split('/').pop() as string;
  const exact = index.filter((entry) => entry.name === wanted || last(entry) === wanted);
  if (exact.length === 1) return exact[0] as DocEntry;
  const starting = exact.length ? exact : index.filter((entry) => entry.name.startsWith(wanted) || last(entry).startsWith(wanted));
  if (starting.length === 1) return starting[0] as DocEntry;
  if (starting.length > 1) {
    throw new ConfigError('cli/doc-ambiguous', `"${query}" could be: ${starting.map((entry) => entry.name).join(', ')}`);
  }
  throw new ConfigError('cli/doc-not-found', `No doc called "${query}". Run \`mariachi docs\` for the list, or \`mariachi docs --search <words>\``);
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

/**
 * The lines that have every word, in any order and case, across the docs. At most `limit`, in the
 * index's order, each with the heading it is under.
 */
export function searchDocs(dir: string, index: DocEntry[], words: string[], limit = 40): { matches: DocMatch[]; more: number } {
  const needles = words.map((word) => word.toLowerCase()).filter(Boolean);
  const matches: DocMatch[] = [];
  let more = 0;
  if (needles.length === 0) return { matches, more };
  for (const entry of index) {
    const path = join(dir, entry.file);
    if (!existsSync(path)) continue;
    const lines = readFileSync(path, 'utf8').split('\n');
    const tops = headings(lines);
    lines.forEach((text, line) => {
      const lower = text.toLowerCase();
      if (!needles.every((needle) => lower.includes(needle))) return;
      if (matches.length >= limit) {
        more += 1;
        return;
      }
      const above = tops.filter((h) => h.line <= line).pop();
      matches.push({ name: entry.name, heading: above?.title ?? '', line: line + 1, text: text.trim() });
    });
  }
  return { matches, more };
}

/** A doc's text. */
export function readDoc(dir: string, entry: DocEntry): string {
  return readFileSync(join(dir, entry.file), 'utf8');
}
