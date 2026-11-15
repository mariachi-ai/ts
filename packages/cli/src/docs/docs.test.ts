import { mkdir, mkdtemp, realpath, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { Command } from 'commander';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { formatSearch, registerDocsCommand } from '../commands/docs';
import { docsDir, findDoc, findGroup, readDoc, readIndex, searchDocs, searchWords, sectionOf, slug } from './docs';

// The real docs, as this repository ships them
const REAL = resolve(__dirname, '../../../core/docs');

describe('the docs index', () => {
  const index = readIndex(REAL);

  it('lists every doc with its group and a line that says what it is', () => {
    expect(index.length).toBeGreaterThan(30);
    expect(index.find((entry) => entry.name === 'architecture')).toEqual({
      name: 'architecture',
      file: 'architecture.md',
      section: 'Read first',
      summary: 'layers, request flow, project layout, import boundaries',
    });
    expect(index.find((entry) => entry.name === 'recipes/add-domain-entity')).toMatchObject({ file: 'recipes/add-domain-entity.md', section: 'Recipes' });
    for (const entry of index) {
      expect(() => readDoc(REAL, entry), entry.name).not.toThrow();
      // A few words a person wrote, not the doc's first word or a code fence
      expect(entry.summary.split(/\s+/).length, `${entry.name}: ${entry.summary}`).toBeGreaterThanOrEqual(3);
      expect(entry.summary, entry.name).not.toMatch(/^```|^Goal$|^Accepted$/);
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
    expect(() => findDoc(index, 'kubernetes')).toThrowError(expect.objectContaining({ code: 'cli/doc-not-found', message: expect.stringContaining('mariachi docs --search') }));
    expect(() => findDoc(index, '')).toThrowError(expect.objectContaining({ code: 'cli/doc-not-found' }));
  });

  it('knows a group by its folder or its heading in the index', () => {
    expect(findGroup(index, 'recipes').map((entry) => entry.name)).toContain('recipes/add-background-job');
    expect(findGroup(index, 'recipes/').every((entry) => entry.name.startsWith('recipes/'))).toBe(true);
    expect(findGroup(index, 'Read first').map((entry) => entry.name)).toEqual(['architecture', 'conventions', 'patterns', 'packages']);
    expect(findGroup(index, 'kubernetes')).toEqual([]);
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

  it('finds the lines that have every word, in any order and case, and says what to read for each', () => {
    const found = searchDocs(REAL, index, ['TABLES-MISSING', 'jobs']);
    expect(found.words).toEqual(['tables-missing', 'jobs']);
    expect(found.total).toBeGreaterThan(0);
    const [first] = found.docs.flatMap((doc) => doc.matches);
    expect(first?.text.toLowerCase()).toContain('jobs/tables-missing');
    expect(first).toMatchObject({ name: 'jobs', file: 'jobs.md', line: expect.any(Number) });
    // The ref is what `mariachi docs` takes to print the section the line is in
    expect(first?.ref).toMatch(/^jobs#[a-z0-9-]+$/);
    expect(() => sectionOf(readDoc(REAL, findDoc(index, 'jobs')), (first?.ref as string).split('#')[1] as string)).not.toThrow();
  });

  it('takes a quoted phrase as its words, as an agent writes it', () => {
    expect(searchWords(['tables missing'])).toEqual(['tables', 'missing']);
    expect(searchWords(['  Tables  ', 'missing tables'])).toEqual(['tables', 'missing']);
    expect(searchDocs(REAL, index, ['tables missing']).total).toBe(searchDocs(REAL, index, ['tables', 'missing']).total);
    expect(searchDocs(REAL, index, ['tables missing']).total).toBeGreaterThan(0);
  });

  it('shows every doc that matches, a few lines each, so a common word cannot hide the doc you want', () => {
    const found = searchDocs(REAL, index, ['auth']);
    const names = found.docs.map((doc) => doc.name);
    expect(names).toContain('auth-and-providers');
    for (const doc of found.docs) {
      expect(doc.matches.length).toBeLessThanOrEqual(5);
      expect(doc.total).toBeGreaterThanOrEqual(doc.matches.length);
    }
    expect(found.total).toBe(found.docs.reduce((sum, doc) => sum + doc.total, 0));
    expect(found.total).toBeGreaterThan(40);
  });

  it('puts the doc named for the word first, and the generated catalogs last', () => {
    const auth = searchDocs(REAL, index, ['auth']).docs.map((doc) => doc.name);
    expect(auth[0]).toBe('auth-and-providers');
    expect(auth.indexOf('packages')).toBe(auth.length - 1);
    // A word in a heading puts a doc ahead of one that only mentions it: `cli` has a section called token
    const token = searchDocs(REAL, index, ['token']).docs;
    expect(token.find((doc) => doc.name === 'cli')?.matches[0]?.text).toBe('## token');
    expect(searchDocs(REAL, index, ['jobs', 'retry']).docs[0]?.name).toBe('jobs');
  });

  it('searches one doc when told to, and shows more of it', () => {
    const jobs = findDoc(index, 'jobs');
    const found = searchDocs(REAL, index, ['retry'], { only: jobs });
    expect(found.docs.map((doc) => doc.name)).toEqual(['jobs']);
    expect(found.docs[0]?.matches.length).toBeGreaterThan(5);
    expect(found.docs[0]?.matches.length).toBe(Math.min(found.total, 40));
  });

  it('has nothing to show for a word that is nowhere, or for no words', () => {
    expect(searchDocs(REAL, index, ['no-such-word-anywhere-zzz'])).toEqual({ words: ['no-such-word-anywhere-zzz'], total: 0, docs: [] });
    expect(searchDocs(REAL, index, ['  '])).toEqual({ words: [], total: 0, docs: [] });
    expect(formatSearch(searchDocs(REAL, index, ['zzz-a', 'zzz-b']))).toEqual(['No line has all of: zzz-a, zzz-b']);
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
    await writeFile(join(core, 'docs/jobs.md'), "# Jobs\n\nThe project's own version of this doc.\n");
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
    process.exitCode = undefined;
    vi.spyOn(console, 'log').mockImplementation((line: string) => void out.push(line));
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(process.stdout, 'write').mockImplementation(((chunk: string) => {
      written.push(chunk);
      return true;
    }) as never);
  });
  afterEach(() => {
    vi.restoreAllMocks();
    process.exitCode = undefined;
  });

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

  it('searches every doc, or the one named before --search, and each line says what to read', async () => {
    await docs('--search', 'tables missing');
    expect(out.join('\n')).toMatch(/jobs#[a-z0-9-]+.*:\d+ {2}.*tables-missing/);
    expect(out.at(-1)).toMatch(/\d+ line\(s\) in \d+ doc\(s\)/);
    out.length = 0;
    await docs('jobs', '--search', 'retry');
    const lines = out.filter((line) => /:\d+ {2}/.test(line));
    expect(lines.length).toBeGreaterThan(5);
    for (const line of lines) expect(line).toMatch(/jobs(#[a-z0-9-]+)?.*:\d+/);
    out.length = 0;
    await docs('--search', 'auth');
    expect(out.join('\n')).toMatch(/\+\d+ more in [a-z-]+: mariachi docs [a-z-]+ --search auth/);
  });

  it('says where a doc is, lists a group, and gives JSON to a tool', async () => {
    await docs('jobs', '--path');
    expect(out).toEqual([join(REAL, 'jobs.md')]);
    out.length = 0;
    await docs('recipes');
    expect(out.join('\n')).toContain('recipes/add-webhook-endpoint');
    expect(out.join('\n')).not.toContain('architecture');
    out.length = 0;
    await docs('--json');
    const listed = JSON.parse(out.join('\n')) as { dir: string; docs: Array<{ name: string }> };
    expect(listed.dir).toBe(REAL);
    expect(listed.docs.map((doc) => doc.name)).toContain('recipes/add-webhook-endpoint');
    out.length = 0;
    await docs('http#pages-and-files', '--json');
    expect(JSON.parse(out.join('\n'))).toMatchObject({ name: 'http', file: 'http.md', text: expect.stringMatching(/^## Pages and files/) });
    out.length = 0;
    await docs('--search', 'tables-missing', '--json');
    expect(JSON.parse(out.join('\n'))).toMatchObject({ words: ['tables-missing'], docs: expect.arrayContaining([expect.objectContaining({ name: 'jobs' })]) });
  });

  it('for a name that is not a doc, says so, shows the lines that mention it, and exits 1', async () => {
    await docs('migrations');
    expect(out[0]).toBe('No doc is called "migrations". These lines mention it:');
    expect(out.slice(1).join('\n')).toMatch(/[a-z-]+(#[a-z0-9-]+)?.*:\d+ {2}/);
    expect(process.exitCode).toBe(1);
    out.length = 0;
    process.exitCode = undefined;
    await docs('zzz-nothing-has-this');
    expect(out).toEqual(['No doc is called "zzz-nothing-has-this". Nothing mentions it either: mariachi docs lists what there is.']);
    expect(process.exitCode).toBe(1);
    out.length = 0;
    process.exitCode = undefined;
    await docs('migrations', '--json');
    expect(JSON.parse(out.join('\n'))).toMatchObject({ error: { code: 'cli/doc-not-found' }, search: { words: ['migrations'] } });
  });

  it('exits with what went wrong for a name that could be several docs', async () => {
    const exit = vi.spyOn(process, 'exit').mockImplementation(((code?: number) => {
      throw new Error(`exit ${code}`); // mariachi-lint-ignore: stands in for process.exit in the test
    }) as never);
    await expect(docs('design-')).rejects.toThrow('exit 1');
    expect(exit).toHaveBeenCalledWith(1);
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('could be: design-catalog'));
  });
});
