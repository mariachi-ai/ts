import { resolve } from 'node:path';
import type { Command } from 'commander';
import { DIM, GREEN, RESET } from '../colors';
import { docsDir, findDoc, readDoc, readIndex, searchDocs, sectionOf, type DocEntry } from '../docs/docs';
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

export function registerDocsCommand(program: Command): void {
  program
    .command('docs [name]')
    .description("Read the framework's docs from the terminal: the list, one doc (`docs jobs`), one section (`docs http#pages-and-files`), or a search")
    .option('-s, --search <words...>', 'the lines that have every word, across the docs')
    .option('--section <heading>', 'print only this section of the doc')
    .option('--path', 'print where the docs are (the folder, or the doc you name)')
    .option('--json', 'machine-readable output')
    .option('-C, --cwd <dir>', 'the project whose installed docs to read', '.')
    .action(async (name: string | undefined, opts: { search?: string[]; section?: string; path?: boolean; json?: boolean; cwd: string }) => {
      try {
        const dir = docsDir(resolve(opts.cwd));
        const index = readIndex(dir);

        if (opts.search) {
          const found = searchDocs(dir, index, opts.search);
          if (opts.json) console.log(JSON.stringify(found, null, 2));
          else {
            for (const match of found.matches) {
              console.log(`${GREEN}${match.name}${RESET}:${match.line}${match.heading ? ` ${DIM}(${match.heading})${RESET}` : ''}  ${match.text}`);
            }
            if (found.more) console.log(`${DIM}… and ${found.more} more. Add a word to narrow it.${RESET}`);
            if (found.matches.length === 0) console.log(`Nothing has ${opts.search.length > 1 ? 'all of ' : ''}${opts.search.join(' ')}.`);
          }
          return;
        }

        if (!name) {
          if (opts.path) console.log(dir);
          else if (opts.json) console.log(JSON.stringify({ dir, docs: index }, null, 2));
          else {
            for (const line of formatIndex(index)) console.log(line);
            console.log(`\n${DIM}mariachi docs <name> prints one; mariachi docs --search <words> finds a line. Folder: ${dir}${RESET}`);
          }
          return;
        }

        // `http#pages-and-files` is the doc and the section in one word
        const [doc, anchor] = name.split('#', 2) as [string, string | undefined];
        const entry = findDoc(index, doc);
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
