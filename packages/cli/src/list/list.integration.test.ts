import { execFile } from 'node:child_process';
import { readFile, rm, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { promisify } from 'node:util';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createProject, generateJob } from '@mariachi/create';

const run = promisify(execFile);
const CLI = resolve(__dirname, '../../dist/index.js');
// Inside the package so the generated projects resolve @mariachi/*, zod and drizzle-orm from its node_modules
const base = resolve(__dirname, '../../.list-test/scaffold');

async function mariachi(cwd: string, ...args: string[]): Promise<{ stdout: string; stderr: string }> {
  return run(process.execPath, [CLI, ...args], { cwd, env: { ...process.env, FORCE_COLOR: '0', NO_COLOR: '1' }, maxBuffer: 16 * 1024 * 1024 });
}

interface Listed {
  version: number;
  routes: Array<{ method: string; path: string; auth: string[] | null; tenant?: string; procedures: string[]; controller: string | null; kind: string; location?: { file: string; line: number }; schema: Record<string, string> }>;
  procedures: Array<{ name: string; input?: string; output?: string; service?: string; location?: { file: string; line: number }; calledBy: string[] }>;
  jobs: Array<{ name: string; payload?: string; retry?: unknown; timeoutMs?: number; schedules: Array<{ name: string; cron: string }>; location?: { file: string; line: number } }>;
  issues: Array<{ severity: string; code: string; message: string }>;
}

afterAll(async () => {
  await rm(base, { recursive: true, force: true });
});

describe('mariachi list on a project made by mariachi init', () => {
  const project = join(base, 'app');

  beforeAll(async () => {
    await rm(project, { recursive: true, force: true });
    await createProject({ name: 'list-app', outputDir: project });
    await generateJob({ name: 'send-digest', projectRoot: project });
    // A schedule in the composition root, where an app would add one
    const app = join(project, 'src/app.ts');
    const text = await readFile(app, 'utf-8');
    const anchor = 'for (const job of jobDefinitions) jobs.registerJob(job);';
    expect(text).toContain(anchor);
    await writeFile(app, text.replace(anchor, `${anchor}\n  jobs.schedule({ name: 'nightly-digest', cron: '0 6 * * *', timezone: 'Europe/Amsterdam', jobName: 'send-digest', data: { id: 'all' } });`));
  }, 60_000);

  it('lists the example entity: its routes, the procedures they call, and the job', async () => {
    const { stdout } = await mariachi(project, 'list', '--json');
    const listed = JSON.parse(stdout) as Listed;
    expect(listed.version).toBe(1);
    expect(listed.issues).toEqual([]);

    const notes = listed.routes.filter((r) => r.controller === 'NotesController');
    expect(notes.map((r) => `${r.method} ${r.path} ${r.auth?.join('|')} ${r.procedures.join(',')}`)).toEqual([
      'POST /api/notes session notes.create',
      'GET /api/notes session notes.list',
      'GET /api/notes/:id session notes.get',
      'PATCH /api/notes/:id session notes.update',
      'DELETE /api/notes/:id session notes.delete',
    ]);
    expect(notes[0]).toMatchObject({ tenant: 'required', location: { file: 'src/api/controllers/notes.controller.ts' }, schema: { body: '{ name: string }' } });
    expect(notes[0]?.schema.response).toMatch(/^\{ id: uuid, name: string/);
    // The server's own routes, from src/app.ts
    expect(listed.routes.filter((r) => r.kind === 'health').map((r) => r.path)).toEqual(['/api/health/live', '/api/health/ready', '/api/health/startup']);
    expect(listed.routes.find((r) => r.kind === 'openapi')).toMatchObject({ path: '/api/openapi.json', auth: [] });

    expect(listed.procedures.map((p) => p.name)).toEqual(['notes.create', 'notes.get', 'notes.list', 'notes.update', 'notes.delete']);
    expect(listed.procedures[0]).toMatchObject({
      input: '{ name: string }',
      service: 'notes',
      location: { file: 'src/services/notes/notes.handler.ts' },
      calledBy: ['POST /api/notes'],
    });
    expect(listed.procedures.find((p) => p.name === 'notes.list')).toMatchObject({ input: '{ limit?: int, cursor?: string }' });

    expect(listed.jobs).toEqual([
      {
        name: 'send-digest',
        payload: '{ id: string }',
        retry: { attempts: 5, backoff: 'exponential', delay: 1000 },
        timeoutMs: 60_000,
        schedules: [{ name: 'nightly-digest', cron: '0 6 * * *', timezone: 'Europe/Amsterdam', file: 'src/app.ts', line: expect.any(Number) }],
        location: { file: 'src/jobs/send-digest.job.ts', line: expect.any(Number) },
      },
    ]);
  }, 60_000);

  it('prints each section as text', async () => {
    const routes = (await mariachi(project, 'list', 'routes')).stdout;
    expect(routes).toMatch(/^Routes \(\d+\)$/m);
    expect(routes).toMatch(/^POST +\/api\/notes +session +notes\.create +NotesController src\/api\/controllers\/notes\.controller\.ts:\d+$/m);
    expect(routes).not.toContain('Procedures');

    const procedures = (await mariachi(project, 'list', 'procedures')).stdout;
    expect(procedures).toMatch(/^notes\.create +src\/services\/notes\/notes\.handler\.ts:\d+ +← POST \/api\/notes$/m);
    expect(procedures).toContain('  in  { name: string }');

    const jobs = (await mariachi(project, 'list', 'jobs')).stdout;
    expect(jobs).toMatch(/^send-digest +src\/jobs\/send-digest\.job\.ts:\d+ +5 attempts, exponential from 1s; timeout 60s$/m);
    expect(jobs).toMatch(/^ {2}schedule 0 6 \* \* \* Europe\/Amsterdam \(nightly-digest\) +src\/app\.ts:\d+$/m);
  }, 60_000);

  it('connects to nothing: it lists with no DATABASE_URL or JWT_SECRET', async () => {
    const env = { ...process.env, DATABASE_URL: 'postgres://nobody@127.0.0.1:1/none', JWT_SECRET: '', FORCE_COLOR: '0' };
    const { stdout } = await run(process.execPath, [CLI, 'list', 'procedures', '--json'], { cwd: project, env });
    expect((JSON.parse(stdout) as Listed).procedures).toHaveLength(5);
  }, 60_000);
});

describe('mariachi list on a project with --orgs --ui', () => {
  const project = join(base, 'orgs-app');

  beforeAll(async () => {
    await rm(project, { recursive: true, force: true });
    await createProject({ name: 'orgs-app', outputDir: project, organizations: true, ui: true });
  }, 60_000);

  it('lists the pages, the organizations routes and the procedures src/organizations.ts registers', async () => {
    const listed = JSON.parse((await mariachi(project, 'list', '--json')).stdout) as Listed;
    expect(listed.issues).toEqual([]);
    expect(listed.routes.find((r) => r.controller === 'PagesController')).toMatchObject({ method: 'GET', path: '/', auth: [] });
    expect(listed.routes.filter((r) => r.kind === 'static').map((r) => r.path)).toEqual(['/assets/design/*', '/assets/*']);
    expect(listed.routes.find((r) => r.method === 'POST' && r.path === '/api/organizations')).toMatchObject({
      controller: 'OrganizationsController',
      auth: ['session'],
      tenant: 'optional',
      procedures: ['organizations.create'],
    });
    const create = listed.procedures.find((p) => p.name === 'organizations.create');
    expect(create).toMatchObject({ service: 'organizations', location: { file: 'src/organizations.ts' }, calledBy: ['POST /api/organizations'] });
    expect(create?.input).toBe('{ name: string, slug?: string }');
    expect(listed.procedures.map((p) => p.name)).toEqual(expect.arrayContaining(['notes.create', 'organizations.invitations.accept', 'organizations.members.list']));
  }, 60_000);
});
