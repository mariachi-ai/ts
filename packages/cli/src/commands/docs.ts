import { resolve } from 'node:path';
import type { Command } from 'commander';
import { MariachiError } from '@mariachi/core';
import { DIM, GREEN, RESET } from '../colors';
import { docsDir, findDoc, findGroup, readDoc, readIndex, searchDocs, sectionOf, type DocEntry, type DocSearchResult } from '../docs/docs';
import { fail } from '../output';

/** The list, grouped as the index groups it. */
export function formatIndex(index: DocEntry[]): string[] {
  const width = Math.max(...index.map((entry) => entry.name.length));
  const lines: string[] = [];
  let section = '';
  for (const entry of index) {
    if (entry.section !== section) {
      section = entry.section;
      if (lines.length) lines.push('');
      lines.push(`${GREEN}${section}${RESET}`);
    }
    lines.push(`  ${entry.name.padEnd(width)}  ${DIM}${entry.summary}${RESET}`.trimEnd());
  }
  return lines;
}

/**
 * A search's lines. Each starts with what to ask for to read around it: `mariachi docs
 * storage#browser-uploads-and-downloads`. A doc with more lines than are shown says how to see them.
 */
export function formatSearch(found: DocSearchResult): string[] {
  if (found.docs.length === 0) return [found.words.length > 1 ? `No line has all of: ${found.words.join(', ')}` : `No line has: ${found.words.join('')}`];
  const lines: string[] = [];
  for (const doc of found.docs) {
    for (const match of doc.matches) lines.push(`${GREEN}${match.ref}${RESET}:${match.line}  ${match.text}`);
    const hidden = doc.total - doc.matches.length;
    if (hidden > 0) lines.push(`${DIM}  +${hidden} more in ${doc.name}: mariachi docs ${doc.name} --search ${found.words.join(' ')}${RESET}`);
  }
  const count = (n: number, one: string) => `${n} ${one}${n === 1 ? '' : 's'}`;
  lines.push(`${DIM}${count(found.total, 'line')} in ${count(found.docs.length, 'doc')}. Read one with: mariachi docs <the part before the colon>${RESET}`);
  return lines;
}

export function registerDocsCommand(program: Command): void {
  program
    .command('docs [name]')
    .description("Read the framework's docs from the terminal: the list, one doc (`docs jobs`), one section (`docs http#pages-and-files`), or a search")
    .option('-s, --search <words...>', 'the lines that have every word; after a doc name, in that doc only (`docs jobs --search retry`)')
    .option('--section <heading>', 'print only this section of the doc')
    .option('--path', 'print where the docs are (the folder, or the doc you name)')
    .option('--json', 'machine-readable output')
    .option('-C, --cwd <dir>', 'the project whose installed docs to read', '.')
    .action(async (name: string | undefined, opts: { search?: string[]; section?: string; path?: boolean; json?: boolean; cwd: string }) => {
      try {
        const dir = docsDir(resolve(opts.cwd));
        const index = readIndex(dir);
        const print = (lines: string[]) => {
          for (const line of lines) console.log(line);
        };

        if (opts.search) {
          // With a doc named first, the search is in that doc
          const found = searchDocs(dir, index, opts.search, name ? { only: findDoc(index, name.split('#', 1)[0] as string) } : {});
          if (opts.json) console.log(JSON.stringify(found, null, 2));
          else print(formatSearch(found));
          return;
        }

        if (!name) {
          if (opts.path) console.log(dir);
          else if (opts.json) console.log(JSON.stringify({ dir, docs: index }, null, 2));
          else {
            print(formatIndex(index));
            console.log(`\n${DIM}mariachi docs <name> prints one, <name>#<section> one section; mariachi docs --search <words> finds a line. Folder: ${dir}${RESET}`);
          }
          return;
        }

        // `http#pages-and-files` is the doc and the section in one word
        const [doc, anchor] = name.split('#', 2) as [string, string | undefined];
        let entry: DocEntry;
        try {
          entry = findDoc(index, doc);
        } catch (error) {
          // A group's name (`recipes`, `guides`) is its list
          const group = findGroup(index, doc);
          if (group.length) {
            if (opts.json) console.log(JSON.stringify({ dir, docs: group }, null, 2));
            else print(formatIndex(group));
            return;
          }
          if (!(error instanceof MariachiError) || error.code !== 'cli/doc-not-found') throw error;
          // Not a doc's name: most often it is a thing the docs talk about, so say where
          const found = searchDocs(dir, index, [doc]);
          if (opts.json) console.log(JSON.stringify({ error: { code: error.code, message: error.message }, search: found }, null, 2));
          else {
            console.log(`No doc is called "${doc}".${found.docs.length ? ' These lines mention it:' : ' Nothing mentions it either: mariachi docs lists what there is.'}`);
            if (found.docs.length) print(formatSearch(found));
          }
          process.exitCode = 1;
          return;
        }
        if (opts.path) {
          console.log(resolve(dir, entry.file));
          return;
        }
        const wanted = opts.section ?? anchor;
        const text = wanted ? sectionOf(readDoc(dir, entry), wanted, entry.name) : readDoc(dir, entry);
        if (opts.json) console.log(JSON.stringify({ ...entry, text }, null, 2));
        else process.stdout.write(text.endsWith('\n') ? text : `${text}\n`);
      } catch (error) {
        fail(error);
      }
    });
}
