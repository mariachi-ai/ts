import { mkdir, mkdtemp, realpath, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { Command } from 'commander';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { registerDocsCommand } from '../commands/docs';
import { docsDir, findDoc, readDoc, readIndex, searchDocs, sectionOf, slug } from './docs';

// The real docs, as this repository ships them
const REAL = resolve(__dirname, '../../../core/docs');

describe('the docs index', () => {
  const index = readIndex(REAL);

  it('lists every doc with its group and a line about it', () => {
    expect(index.length).toBeGreaterThan(30);
    expect(index.find((entry) => entry.name === 'architecture')).toEqual({
      name: 'architecture',
      file: 'architecture.md',
      section: 'Read first',
      summary: 'layers, request flow, project layout, import boundaries',
    });
    expect(index.find((entry) => entry.name === 'recipes/add-domain-entity')).toMatchObject({ file: 'recipes/add-domain-entity.md', section: 'Recipes' });
    // Every entry is a file that is there, and says something about itself
    for (const entry of index) {
      expect(() => readDoc(REAL, entry), entry.name).not.toThrow();
      expect(entry.summary, entry.name).not.toBe('');
    }
  });

  it('finds a doc by its name, its last part, with .md, or the start of either when only one fits', () => {
    for (const query of ['jobs', 'jobs.md', './jobs.md', 'JOBS', 'job']) expect(findDoc(index, query).name, query).toBe('jobs');
    expect(findDoc(index, 'recipes/add-domain-entity').name).toBe('recipes/add-domain-entity');
    expect(findDoc(index, 'add-domain-entity').name).toBe('recipes/add-domain-entity');
    expect(findDoc(index, 'add-web').name).toBe('recipes/add-webhook-endpoint');
    // `design` is a doc of its own, though three others start with it
    expect(findDoc(index, 'design').name).toBe('design');
  });

  it('says what a name could be, or that there is no such doc and how to look', () => {
    expect(() => findDoc(index, 'design-')).toThrowError(expect.objectContaining({ code: 'cli/doc-ambiguous', message: expect.stringContaining('design-catalog') }));
    expect(() => findDoc(index, 'recipes/add-')).toThrowError(expect.objectContaining({ code: 'cli/doc-ambiguous' }));
    expect(() => findDoc(index, 'kubernetes')).toThrowError(expect.objectContaining({ code: 'cli/doc-not-found', message: expect.stringContaining('mariachi docs --search') }));
  });
});

describe('a section of a doc', () => {
  const text = ['# Title', 'intro', '## First part', 'one', '### Detail', 'two', '```bash', '## not a heading', '```', '## Second `part`', 'three', ''].join('\n');

  it('runs from its heading to the next heading of the same level or above', () => {
    expect(sectionOf(text, 'First part')).toBe('## First part\none\n### Detail\ntwo\n```bash\n## not a heading\n```\n');
    expect(sectionOf(text, 'detail')).toBe('### Detail\ntwo\n```bash\n## not a heading\n```\n');
    expect(sectionOf(text, 'second-part')).toBe('## Second `part`\nthree\n');
  });

  it('takes the heading as written, its slug, or the start of it', () => {
    expect(slug('Pages and `files`!')).toBe('pages-and-files');
    expect(sectionOf(text, 'first')).toContain('## First part');
    expect(sectionOf(text, 'SECOND PART')).toContain('three');
  });

  it('names the sections there are when the one asked for is not', () => {
    expect(() => sectionOf(text, 'third', 'example')).toThrowError(
      expect.objectContaining({ code: 'cli/section-not-found', message: 'example has no section "third". It has: Title; First part; Detail; Second `part`' }),
    );
  });
});

describe('searching the docs', () => {
  const index = readIndex(REAL);

  it('finds the lines that have every word, in any order and case, with the heading they are under', () => {
    const { matches } = searchDocs(REAL, index, ['TABLES-MISSING', 'jobs']);
    expect(matches.length).toBeGreaterThan(0);
    for (const match of matches) expect(match.text.toLowerCase()).toContain('jobs/tables-missing');
    expect(matches[0]).toMatchObject({ name: 'jobs', line: expect.any(Number) });
    expect(matches[0]?.heading).not.toBe('');
  });

  it('stops at the limit and says how many more there are', () => {
    const all = searchDocs(REAL, index, ['the'], 100_000);
    const some = searchDocs(REAL, index, ['the'], 5);
    expect(some.matches).toHaveLength(5);
    expect(some.more).toBe(all.matches.length - 5);
    expect(searchDocs(REAL, index, ['no-such-word-anywhere-zzz'])).toEqual({ matches: [], more: 0 });
    expect(searchDocs(REAL, index, [])).toEqual({ matches: [], more: 0 });
  });
});

describe('where the docs are read from', () => {
  let dir: string;
  beforeAll(async () => {
    // The real path: a temp folder is behind a link on some systems, and a resolved package is not
    dir = await realpath(await mkdtemp(join(tmpdir(), 'mariachi-docs-')));
    // A project with its own @mariachi/core, an older one with no llms.txt
    const core = join(dir, 'node_modules/@mariachi/core');
    await mkdir(join(core, 'dist'), { recursive: true });
    await mkdir(join(core, 'docs/recipes'), { recursive: true });
    await writeFile(join(dir, 'package.json'), '{"name":"app"}');
    await writeFile(join(core, 'package.json'), JSON.stringify({ name: '@mariachi/core', version: '0.0.1', main: './dist/index.cjs' }));
    await writeFile(join(core, 'dist/index.cjs'), 'module.exports = {};');
    await writeFile(join(core, 'docs/README.md'), '# Docs\n');
    await writeFile(join(core, 'docs/jobs.md'), '# Jobs\n\nThe project\'s own version of this doc.\n');
    await writeFile(join(core, 'docs/recipes/add-job.md'), '# Add a job\n');
  });
  afterAll(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it("is the project's own @mariachi/core, so the docs match the version it uses", () => {
    const found = docsDir(dir);
    expect(found).toBe(join(dir, 'node_modules/@mariachi/core/docs'));
    // With no llms.txt (an older version), the folder's files are the list
    expect(readIndex(found)).toEqual([
      { name: 'jobs', file: 'jobs.md', section: 'Docs', summary: '' },
      { name: 'recipes/add-job', file: 'recipes/add-job.md', section: 'Docs', summary: '' },
    ]);
  });

  it('is the one this CLI came with, anywhere else', () => {
    expect(docsDir(tmpdir())).toBe(REAL);
  });
});

describe('mariachi docs', () => {
  let out: string[];
  let written: string[];

  beforeEach(() => {
    out = [];
    written = [];
    vi.spyOn(console, 'log').mockImplementation((line: string) => void out.push(line));
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(process.stdout, 'write').mockImplementation(((chunk: string) => {
      written.push(chunk);
      return true;
    }) as never);
  });
  afterEach(() => vi.restoreAllMocks());

  async function docs(...args: string[]) {
    const program = new Command().exitOverride();
    registerDocsCommand(program);
    await program.parseAsync(['node', 'mariachi', 'docs', '--cwd', tmpdir(), ...args]);
  }

  it('lists the docs by group, with where they are', async () => {
    await docs();
    const text = out.join('\n');
    expect(text).toContain('Read first');
    expect(text).toMatch(/architecture\s+.*layers, request flow/);
    expect(text).toContain(`Folder: ${REAL}`);
  });

  it('prints one doc, or one section of it by --section or after a #', async () => {
    await docs('jobs');
    expect(written.join('')).toMatch(/^# Jobs/);
    written.length = 0;
    await docs('cli#token');
    expect(written.join('')).toMatch(/^## token\n/);
    expect(written.join('')).not.toContain('## doctor');
    written.length = 0;
    await docs('cli', '--section', 'token');
    expect(written.join('')).toMatch(/^## token\n/);
  });

  it('says where a doc is, searches, and gives JSON to a tool', async () => {
    await docs('jobs', '--path');
    expect(out).toEqual([join(REAL, 'jobs.md')]);
    out.length = 0;
    await docs('--search', 'tables-missing', 'jobs');
    expect(out.join('\n')).toContain('jobs/tables-missing');
    out.length = 0;
    await docs('--json');
    const listed = JSON.parse(out.join('\n')) as { dir: string; docs: Array<{ name: string }> };
    expect(listed.dir).toBe(REAL);
    expect(listed.docs.map((doc) => doc.name)).toContain('recipes/add-webhook-endpoint');
    out.length = 0;
    await docs('http#pages-and-files', '--json');
    expect(JSON.parse(out.join('\n'))).toMatchObject({ name: 'http', file: 'http.md', text: expect.stringMatching(/^## Pages and files/) });
  });

  it('exits with what went wrong for a doc that is not there', async () => {
    const exit = vi.spyOn(process, 'exit').mockImplementation(((code?: number) => {
      throw new Error(`exit ${code}`); // mariachi-lint-ignore: stands in for process.exit in the test
    }) as never);
    await expect(docs('kubernetes')).rejects.toThrow('exit 1');
    expect(exit).toHaveBeenCalledWith(1);
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('No doc called "kubernetes"'));
  });
});
