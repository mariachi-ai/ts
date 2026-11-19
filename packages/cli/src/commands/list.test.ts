import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { Command } from 'commander';
import { afterAll, afterEach, describe, expect, it, vi } from 'vitest';
import type { ProjectListing, RouteEntry } from '../list/listing';
import { authText, duration, formatJobs, formatListing, formatProcedures, formatRoutes, listingJson, parseSection, registerListCommand } from './list';

// Colours are off in tests (stdout is not a terminal)

const route = (over: Partial<RouteEntry>): RouteEntry => ({
  method: 'GET',
  path: '/api/notes',
  auth: ['session'],
  defaultAuth: true,
  tenant: 'required',
  scopes: [],
  procedures: ['notes.list'],
  controller: 'NotesController',
  kind: 'controller',
  location: { file: 'src/api/controllers/notes.controller.ts', line: 24 },
  schema: {},
  ...over,
});

const LISTING: ProjectListing = {
  root: '/p',
  routes: [
    route({ method: 'GET', path: '/api/health/ready', auth: [], tenant: undefined, procedures: [], controller: null, kind: 'health', location: { file: 'src/app.ts', line: 162 } }),
    route({}),
    route({ method: 'POST', path: '/api/organizations', tenant: 'optional', procedures: ['organizations.create'], controller: 'OrganizationsController', location: undefined }),
  ],
  procedures: [
    { name: 'notes.list', input: '{ limit?: int }', output: '{ data: {…}[] }', service: 'notes', location: { file: 'src/services/notes/notes.handler.ts', line: 22 }, calledBy: ['GET /api/notes'] },
    { name: 'notes.purge', calledBy: [] },
  ],
  jobs: [
    {
      name: 'send-digest',
      payload: '{ id: string }',
      retry: { attempts: 5, backoff: 'exponential', delay: 1000 },
      timeoutMs: 60_000,
      schedules: [{ name: 'nightly', cron: '0 6 * * *', timezone: 'Europe/Amsterdam', file: 'src/app.ts', line: 140 }],
      location: { file: 'src/jobs/send-digest.job.ts', line: 10 },
    },
    { name: 'cleanup', schedules: [] },
  ],
  issues: [{ severity: 'warn', code: 'cli/unknown-procedure', message: 'GET /api/x calls x.y, which nothing registers' }],
};

describe('formatting', () => {
  it('prints routes as a table: method, path, auth, what it calls, where', () => {
    expect(formatRoutes(LISTING.routes)).toEqual([
      'GET   /api/health/ready   public                    (health)              src/app.ts:162',
      'GET   /api/notes          session                   notes.list            NotesController src/api/controllers/notes.controller.ts:24',
      'POST  /api/organizations  session, tenant optional  organizations.create  OrganizationsController',
    ]);
    expect(formatRoutes([])).toEqual(['No routes.']);
  });

  it('spells out auth', () => {
    expect(authText(route({ auth: null }))).toBe('default');
    expect(authText(route({ auth: ['session', 'api-key'], scopes: ['notes:read'] }))).toBe('session|api-key, scopes notes:read');
  });

  it('prints each procedure with where it is registered, who calls it, and its input and output', () => {
    expect(formatProcedures(LISTING.procedures)).toEqual([
      'notes.list   src/services/notes/notes.handler.ts:22  ← GET /api/notes',
      '  in  { limit?: int }',
      '  out { data: {…}[] }',
      'notes.purge',
    ]);
  });

  it('prints each job with its retries, payload and schedules', () => {
    expect(formatJobs(LISTING.jobs)).toEqual([
      'send-digest  src/jobs/send-digest.job.ts:10  5 attempts, exponential from 1s; timeout 60s',
      '  payload  { id: string }',
      '  schedule 0 6 * * * Europe/Amsterdam (nightly)  src/app.ts:140',
      'cleanup',
      '  schedule none: runs when enqueued',
    ]);
    expect(duration(250)).toBe('250ms');
    expect(duration(90_000)).toBe('90s');
    expect(duration(300_000)).toBe('5m');
  });

  it('puts the sections asked for under headings, then the issues', () => {
    const lines = formatListing(LISTING, ['procedures', 'jobs']);
    expect(lines[0]).toBe('Procedures (2)');
    expect(lines).toContain('Jobs (2)');
    expect(lines).not.toContain('Routes (3)');
    expect(lines.at(-1)).toBe('warn  GET /api/x calls x.y, which nothing registers cli/unknown-procedure');
  });

  it('gives --json the sections asked for, versioned', () => {
    expect(listingJson(LISTING, ['jobs'])).toEqual({ version: 1, root: '/p', jobs: LISTING.jobs, issues: LISTING.issues });
  });

  it('takes a section by name, singular or plural, and refuses any other', () => {
    expect(parseSection(undefined)).toEqual(['routes', 'procedures', 'jobs']);
    expect(parseSection('route')).toEqual(['routes']);
    expect(parseSection('Procedures')).toEqual(['procedures']);
    expect(() => parseSection('events')).toThrow(expect.objectContaining({ code: 'cli/list-unknown-section' }));
  });
});

describe('mariachi list', () => {
  const base = resolve(__dirname, '../../.list-test/command');
  afterEach(() => {
    vi.restoreAllMocks();
    process.exitCode = undefined;
  });
  afterAll(async () => {
    await rm(base, { recursive: true, force: true });
  });

  async function run(...args: string[]): Promise<string> {
    const out: string[] = [];
    vi.spyOn(console, 'log').mockImplementation((line: string) => void out.push(line));
    const program = new Command().exitOverride();
    registerListCommand(program);
    await program.parseAsync(['node', 'mariachi', 'list', ...args]);
    return out.join('\n');
  }

  it('prints a section of the project in --cwd, as JSON', async () => {
    await mkdir(base, { recursive: true });
    const dir = await mkdtemp(join(base, 'command-'));
    await mkdir(join(dir, 'src/jobs'), { recursive: true });
    await writeFile(join(dir, 'package.json'), '{}');
    await writeFile(join(dir, 'src/jobs/index.ts'), `export const jobs = [{ name: 'tick', handler: async () => {} }];\n`);
    const json = JSON.parse(await run('jobs', '--json', '--cwd', dir));
    expect(json).toEqual({ version: 1, root: dir, jobs: [{ name: 'tick', schedules: [] }], issues: [] });
    expect(process.exitCode).toBeUndefined();
    expect(await run('jobs', '-C', dir)).toBe('Jobs (1)\ntick\n  schedule none: runs when enqueued');
  });

  it('exits 1 when a registration could not be loaded', async () => {
    await mkdir(base, { recursive: true });
    const dir = await mkdtemp(join(base, 'command-'));
    await mkdir(join(dir, 'src/jobs'), { recursive: true });
    await writeFile(join(dir, 'package.json'), '{}');
    await writeFile(join(dir, 'src/jobs/index.ts'), `import { missing } from './nowhere';\nexport const jobs = [missing];\n`);
    const json = JSON.parse(await run('jobs', '--json', '-C', dir));
    expect(json.issues).toMatchObject([{ severity: 'error', code: 'cli/list-load-failed' }]);
    expect(process.exitCode).toBe(1);
  });
});
