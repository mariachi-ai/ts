import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import { inert, listProject, projectFrame } from './project';

// Inside the package so the fixtures resolve @mariachi/* and zod from its node_modules
const base = resolve(__dirname, '../../.list-test/project');

async function project(files: Record<string, string>): Promise<string> {
  await mkdir(base, { recursive: true });
  const dir = await mkdtemp(join(base, 'unit-'));
  for (const [file, text] of Object.entries({ 'package.json': '{ "name": "fixture" }', ...files })) {
    await mkdir(dirname(join(dir, file)), { recursive: true });
    await writeFile(join(dir, file), text);
  }
  return dir;
}

const APP = `import { createApiServer } from '@mariachi/api-facade';
// Never run by mariachi list: it would throw
throw new Error('src/app.ts was run');
export function createApp(jobs: any, verifier: any, health: any) {
  const api = createApiServer({ name: 'api', prefix: '/api' })
    .withAuth('session')
    .withHealth(health);
  jobs.schedule({ name: 'nightly-digest', cron: '0 6 * * *', jobName: 'send-digest' });
  jobs.schedule({ name: 'stale', cron: '* * * * *', jobName: 'removed-job' });
  return api;
}
`;

const CONTROLLERS = `import { BaseController } from '@mariachi/api-facade';
import type { CommunicationLayer } from '@mariachi/communication';
import { z } from 'zod';

class WidgetsController extends BaseController {
  readonly prefix = 'widgets';

  init(): void {
    this.post('/', { schema: { body: z.object({ name: z.string() }) } }, (ctx, body) => this.call(ctx, 'widgets.create', body));
    this.get('/:id', { schema: { params: z.object({ id: z.string() }) } }, (ctx, _body, params) => this.call(ctx, 'widgets.lost', params));
    this.get('/about', { auth: false, root: true }, async () => undefined);
  }
}

export function createControllers(communication: CommunicationLayer): BaseController[] {
  return [new WidgetsController(communication)];
}
`;

const SERVICES = `import type { CommunicationLayer } from '@mariachi/communication';
import { z } from 'zod';

class WidgetsRepository {
  constructor(private readonly db: any) {
    // Whatever a constructor does with a dependency, nothing happens
    db.select().from('widgets').where({ id: 1 });
  }
}

export function registerServices(communication: CommunicationLayer, deps: { db: any; jobs: any }): void {
  const repository = new WidgetsRepository(deps.db);
  deps.jobs.registerJob({ name: 'x' });
  communication.register('widgets.create', {
    schema: { input: z.object({ name: z.string() }), output: z.object({ id: z.string().uuid() }) },
    handler: async () => ({ id: String(repository) }),
  });
  communication.register('widgets.archive', { schema: { input: z.object({ id: z.string() }), output: z.void() }, handler: async () => undefined });
}
`;

const JOBS = `import { defineJob } from '@mariachi/jobs';
import { z } from 'zod';

export const sendDigestJob = defineJob({
  name: 'send-digest',
  schema: z.object({ id: z.string() }),
  retry: { attempts: 3, backoff: 'fixed', delay: 500 },
  handler: async () => {},
});

export const jobs = [sendDigestJob];
`;

afterAll(async () => {
  await rm(base, { recursive: true, force: true });
});

describe('listProject', () => {
  it("lists a project's routes, procedures and jobs from its registrations, without running app.ts", async () => {
    const dir = await project({
      'src/app.ts': APP,
      'src/api/controllers/index.ts': CONTROLLERS,
      'src/services/index.ts': SERVICES,
      'src/jobs/index.ts': JOBS,
    });
    const listing = await listProject(dir);

    expect(listing.routes.map((r) => [r.method, r.path, r.auth, r.procedures, r.controller, r.location])).toEqual([
      ['GET', '/api/health/live', [], [], null, { file: 'src/app.ts', line: 5 }],
      ['GET', '/api/health/ready', [], [], null, { file: 'src/app.ts', line: 5 }],
      ['GET', '/api/health/startup', [], [], null, { file: 'src/app.ts', line: 5 }],
      ['POST', '/api/widgets', ['session'], ['widgets.create'], 'WidgetsController', { file: 'src/api/controllers/index.ts', line: 9 }],
      ['GET', '/api/widgets/:id', ['session'], ['widgets.lost'], 'WidgetsController', { file: 'src/api/controllers/index.ts', line: 10 }],
      ['GET', '/widgets/about', [], [], 'WidgetsController', { file: 'src/api/controllers/index.ts', line: 11 }],
    ]);
    expect(listing.routes[3]?.schema).toEqual({ body: '{ name: string }' });

    expect(listing.procedures).toEqual([
      {
        name: 'widgets.create',
        input: '{ name: string }',
        output: '{ id: uuid }',
        location: { file: 'src/services/index.ts', line: 14 },
        calledBy: ['POST /api/widgets'],
      },
      { name: 'widgets.archive', input: '{ id: string }', output: 'void', location: { file: 'src/services/index.ts', line: 18 }, calledBy: [] },
    ]);

    expect(listing.jobs).toEqual([
      {
        name: 'send-digest',
        payload: '{ id: string }',
        retry: { attempts: 3, backoff: 'fixed', delay: 500 },
        schedules: [{ name: 'nightly-digest', cron: '0 6 * * *', file: 'src/app.ts', line: 8 }],
        location: { file: 'src/jobs/index.ts', line: 4 },
      },
    ]);

    expect(listing.issues).toEqual([
      { severity: 'warn', code: 'cli/unknown-job', message: 'Schedule stale (src/app.ts:9) runs job removed-job, which src/jobs/index.ts does not register' },
      {
        severity: 'warn',
        code: 'cli/unknown-procedure',
        message: 'GET /api/widgets/:id calls widgets.lost, which nothing registers: the call fails with communication/procedure-not-found',
      },
    ]);
  });

  it('loads only what the sections asked for need', async () => {
    const dir = await project({ 'src/app.ts': APP, 'src/jobs/index.ts': JOBS, 'src/services/index.ts': 'throw new Error("not loaded for jobs");' });
    const listing = await listProject(dir, { only: ['jobs'] });
    expect(listing.routes).toEqual([]);
    expect(listing.procedures).toEqual([]);
    expect(listing.jobs.map((j) => j.name)).toEqual(['send-digest']);
    expect(listing.issues.map((i) => i.code)).toEqual(['cli/unknown-job']);
  });

  it('says which module failed to load and lists the rest, without guessing at unknown procedures', async () => {
    const dir = await project({
      'src/app.ts': APP,
      'src/api/controllers/index.ts': CONTROLLERS,
      'src/services/index.ts': `export function registerServices(): void {\n  throw new Error('no database here');\n}\n`,
      'src/jobs/index.ts': 'export const nothing = 1;\n',
    });
    const listing = await listProject(dir);
    expect(listing.routes.filter((r) => r.kind === 'controller')).toHaveLength(3);
    expect(listing.procedures).toEqual([]);
    expect(listing.issues).toEqual([
      { severity: 'error', code: 'cli/list-load-failed', message: 'Could not load src/services/index.ts: no database here. The procedures it registers are missing from this list' },
      { severity: 'error', code: 'cli/list-load-failed', message: 'Could not load src/jobs/index.ts: it does not export a jobs array. The jobs it registers are missing from this list' },
      { severity: 'warn', code: 'cli/unknown-job', message: 'Schedule nightly-digest (src/app.ts:8) runs job send-digest, which src/jobs/index.ts does not register' },
      { severity: 'warn', code: 'cli/unknown-job', message: 'Schedule stale (src/app.ts:9) runs job removed-job, which src/jobs/index.ts does not register' },
    ]);
  });

  it('lists nothing, with no issues, for a project with none of the registries', async () => {
    const dir = await project({ 'src/main.ts': 'export {};\n' });
    expect(await listProject(dir)).toMatchObject({ routes: [], procedures: [], jobs: [], issues: [] });
  });

  it('refuses a folder that is not a project', async () => {
    await mkdir(base, { recursive: true });
    const dir = await mkdtemp(join(base, 'empty-'));
    await expect(listProject(dir)).rejects.toMatchObject({ code: 'cli/not-a-project' });
  });
});

describe('inert', () => {
  it('stands in for any dependency: properties, calls and new all give it back', () => {
    const value = inert() as any;
    expect(value.a.b.c()).toBe(value);
    expect(new value.Repository()).toBe(value);
    expect(`${value}`).toBe('');
    // Not a promise, so awaiting it doesn't hang
    expect(value.then).toBeUndefined();
  });
});

describe('projectFrame', () => {
  it("finds the first frame in the project's own source, skipping node_modules and other folders", () => {
    const stack = [
      'Error',
      '    at here (/usr/lib/cli/dist/index.js:10:5)',
      '    at register (/p/node_modules/@mariachi/organizations/dist/index.js:4:1)',
      '    at setupOrganizations (/p/src/organizations.ts:51:3)',
      '    at file:///p/src/services/index.ts:9:2',
    ].join('\n');
    expect(projectFrame(stack, ['/p'])).toEqual({ file: 'src/organizations.ts', line: 51 });
    expect(projectFrame('    at file:///p/src/services/index.ts:9:2', ['/p'])).toEqual({ file: 'src/services/index.ts', line: 9 });
    expect(projectFrame(stack, ['/elsewhere'])).toBeUndefined();
    expect(projectFrame(undefined, ['/p'])).toBeUndefined();
  });
});
