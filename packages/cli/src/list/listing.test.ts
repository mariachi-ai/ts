import { BaseController } from '@mariachi/api-facade';
import { z } from 'zod';
import { describe, expect, it } from 'vitest';
import { controllerRoutes, jobEntries, link, orphanSchedules, procedureEntries, proceduresCalled, serverRoutes, serviceOf, type LoadedRoute } from './listing';
import type { ApiServerSource } from './source';

class WidgetsController extends BaseController {
  readonly prefix = 'widgets';

  init(): void {
    this.post('/', { schema: { body: z.object({ name: z.string() }), response: z.object({ id: z.string().uuid() }) }, status: 201, summary: 'Create a widget' }, (ctx, body) =>
      this.call(ctx, 'widgets.create', body),
    );
    this.get('/:id', { schema: { params: z.object({ id: z.string().uuid() }) }, scopes: ['widgets:read'] }, async (ctx, _body, params) => {
      const widget = await this.call<{ ownerId: string }>(ctx, 'widgets.get', params);
      await this.call(ctx, "audit.record", { widget });
      return widget;
    });
    this.get('/public/:slug', { auth: false, root: true }, async () => undefined);
    for (const action of ['sync'] as const) {
      this.post(`/${action}`, { auth: ['api-key', 'service'], tenant: 'optional' }, (ctx) => this.call(ctx, `widgets.${action}`, {}));
    }
  }
}

const server: ApiServerSource = { prefix: '/api', defaultAuth: ['session'], line: 12, routes: [{ method: 'GET', path: '/api/health/live', root: false, kind: 'health' }] };
const routesOf = (controller: BaseController) => controller.routes().map((route) => ({ route: route as LoadedRoute }));

describe('proceduresCalled', () => {
  it('reads the procedure names a handler calls, in any quotes, once each', () => {
    const handler = async (ctx: unknown) => {
      const self = { call: (..._args: unknown[]) => undefined };
      self.call(ctx, 'a.one');
      self.call(ctx, "b.two");
      // biome-ignore lint/style/noUnusedTemplateLiteral: the handler's source has to hold a template literal
      self.call(ctx, `c.three`);
      self.call(ctx, 'a.one');
    };
    expect(proceduresCalled(handler)).toEqual(['a.one', 'b.two', 'c.three']);
  });

  it('ignores Function.prototype.call and anything that is not a function', () => {
    function f(this: unknown, s: string) {
      return s;
    }
    function handler(this: unknown) {
      return f.call(this, 'not.a.procedure');
    }
    expect(proceduresCalled(handler)).toEqual([]);
    expect(proceduresCalled('x.y')).toEqual([]);
  });
});

describe('controllerRoutes', () => {
  it('mounts each route under the prefix, with its auth, tenant, scopes, schemas and procedures', () => {
    const routes = controllerRoutes('WidgetsController', routesOf(new WidgetsController()), server);
    expect(routes).toEqual([
      {
        method: 'POST',
        path: '/api/widgets',
        auth: ['session'],
        defaultAuth: true,
        tenant: 'required',
        scopes: [],
        procedures: ['widgets.create'],
        controller: 'WidgetsController',
        kind: 'controller',
        summary: 'Create a widget',
        schema: { body: '{ name: string }', response: '{ id: uuid }' },
      },
      {
        method: 'GET',
        path: '/api/widgets/:id',
        auth: ['session'],
        defaultAuth: true,
        tenant: 'required',
        scopes: ['widgets:read'],
        procedures: ['widgets.get', 'audit.record'],
        controller: 'WidgetsController',
        kind: 'controller',
        schema: { params: '{ id: uuid }' },
      },
      // root: outside /api, and public
      { method: 'GET', path: '/widgets/public/:slug', auth: [], defaultAuth: false, scopes: [], procedures: [], controller: 'WidgetsController', kind: 'controller', schema: {} },
      {
        method: 'POST',
        path: '/api/widgets/sync',
        auth: ['api-key', 'service'],
        defaultAuth: false,
        tenant: 'optional',
        scopes: [],
        procedures: ['widgets.${action}'],
        controller: 'WidgetsController',
        kind: 'controller',
        schema: {},
      },
    ]);
  });

  it('says a route is public when the server has no default auth, and does not know when the server was not found', () => {
    const route = { route: { method: 'GET', path: 'x' } };
    expect(controllerRoutes('C', [route], { ...server, defaultAuth: undefined })[0]).toMatchObject({ auth: [], defaultAuth: true });
    expect(controllerRoutes('C', [route], undefined)[0]).toMatchObject({ path: '/x', auth: null, defaultAuth: true, tenant: 'required' });
  });

  it('keeps where a route is declared', () => {
    expect(controllerRoutes('C', [{ route: { method: 'GET', path: '/' }, location: { file: 'src/c.ts', line: 3 } }], server)[0]?.location).toEqual({ file: 'src/c.ts', line: 3 });
  });
});

describe('serverRoutes', () => {
  it('lists the routes the server adds as public, at the line that builds it', () => {
    expect(serverRoutes(server, 'src/app.ts')).toEqual([
      { method: 'GET', path: '/api/health/live', auth: [], defaultAuth: false, scopes: [], procedures: [], controller: null, kind: 'health', location: { file: 'src/app.ts', line: 12 }, schema: {} },
    ]);
    expect(serverRoutes(undefined, 'src/app.ts')).toEqual([]);
  });
});

describe('procedures and jobs', () => {
  it('names the service by its folder under src/services, else by its file', () => {
    expect(serviceOf('src/services/notes/notes.handler.ts')).toBe('notes');
    expect(serviceOf('src/organizations.ts')).toBe('organizations');
    expect(serviceOf('src/billing.handler.ts')).toBe('billing');
    expect(serviceOf('src/services/index.ts')).toBeUndefined();
    expect(serviceOf(undefined)).toBeUndefined();
  });

  it('describes a procedure by its schemas and where it is registered', () => {
    expect(
      procedureEntries([
        { name: 'notes.get', schema: { input: z.object({ id: z.string() }), output: z.void() }, location: { file: 'src/services/notes/notes.handler.ts', line: 9 } },
        { name: 'bare.thing' },
      ]),
    ).toEqual([
      { name: 'notes.get', input: '{ id: string }', output: 'void', service: 'notes', location: { file: 'src/services/notes/notes.handler.ts', line: 9 }, calledBy: [] },
      { name: 'bare.thing', calledBy: [] },
    ]);
  });

  it('describes a job with its payload, retries, where it is written and its schedules', () => {
    const jobs = [
      { name: 'send-digest', schema: z.object({ id: z.string() }), retry: { attempts: 5, backoff: 'exponential', delay: 1000 }, timeoutMs: 60_000, nonRetryableCodes: ['x/y'] },
      { name: 'cleanup' },
    ];
    const schedules = [{ name: 'nightly', cron: '0 6 * * *', jobName: 'send-digest', file: 'src/app.ts', line: 40 }];
    expect(jobEntries(jobs, [{ name: 'send-digest', file: 'src/jobs/send-digest.job.ts', line: 10 }], schedules)).toEqual([
      {
        name: 'send-digest',
        payload: '{ id: string }',
        retry: { attempts: 5, backoff: 'exponential', delay: 1000 },
        timeoutMs: 60_000,
        nonRetryableCodes: ['x/y'],
        schedules: [{ name: 'nightly', cron: '0 6 * * *', file: 'src/app.ts', line: 40 }],
        location: { file: 'src/jobs/send-digest.job.ts', line: 10 },
      },
      { name: 'cleanup', schedules: [] },
    ]);
    expect(orphanSchedules(jobs, [...schedules, { name: 'gone', cron: '* * * * *', jobName: 'gone', file: 'src/app.ts', line: 41 }])).toEqual([
      { severity: 'warn', code: 'cli/unknown-job', message: 'Schedule gone (src/app.ts:41) runs job gone, which src/jobs/index.ts does not register' },
    ]);
  });
});

describe('link', () => {
  const listing = () => ({
    root: '/p',
    routes: controllerRoutes('WidgetsController', routesOf(new WidgetsController()), server),
    procedures: procedureEntries([{ name: 'widgets.create' }, { name: 'widgets.get' }]),
    jobs: [],
  });

  it('fills in which routes call each procedure, and warns of a call nothing registers', () => {
    const l = listing();
    const issues = link(l, ['widgets.create', 'widgets.get'], true);
    expect(l.procedures.map((p) => [p.name, p.calledBy])).toEqual([
      ['widgets.create', ['POST /api/widgets']],
      ['widgets.get', ['GET /api/widgets/:id']],
    ]);
    // A name built at run time can't be checked
    expect(issues).toEqual([
      { severity: 'warn', code: 'cli/unknown-procedure', message: 'GET /api/widgets/:id calls audit.record, which nothing registers: the call fails with communication/procedure-not-found' },
    ]);
  });

  it('reports a procedure registered twice, and no unknown calls when a registry failed to load', () => {
    expect(link(listing(), ['widgets.create', 'widgets.get', 'widgets.get'], false)).toEqual([
      { severity: 'error', code: 'cli/duplicate-procedure', message: 'widgets.get is registered twice: the app stops at startup with communication/duplicate-procedure' },
    ]);
  });
});
