import { describeSchema } from './schema';
import type { ApiServerSource, JobSource, ScheduleSource } from './source';

/** The version of `mariachi list --json`'s shape. Field names are a contract for tools. */
export const LIST_JSON_VERSION = 1;

/** Where a thing is written, relative to the project root. */
export interface Location {
  file: string;
  line: number;
}

export interface RouteEntry {
  method: string;
  /** The path as the server answers it: the API prefix included, unless the route is `root`. */
  path: string;
  /**
   * The auth strategies the route accepts. Empty: public. Null: the server's default, which was not
   * found in the composition root (no `.withAuth()` on `createApiServer`).
   */
  auth: string[] | null;
  /** Whether `auth` is the server's default rather than the route's own. */
  defaultAuth: boolean;
  /** `required` (the default) or `optional`, on a route that is not public. */
  tenant?: 'required' | 'optional';
  scopes: string[];
  /** The procedures its handler calls, as written: a name built at run time keeps its `${…}`. */
  procedures: string[];
  /** The controller's class name; null for a route the server adds itself. */
  controller: string | null;
  /** `controller`, or what the server added it for: `health`, `openapi`, `static`. */
  kind: 'controller' | 'health' | 'openapi' | 'static';
  location?: Location;
  summary?: string;
  /** Each request and response schema as one line (`{ name: string }`). */
  schema: { params?: string; query?: string; body?: string; response?: string };
}

export interface ProcedureEntry {
  name: string;
  input?: string;
  output?: string;
  /** The folder under src/services, or the file's name, of the code that registers it. */
  service?: string;
  location?: Location;
  /** The routes whose handler calls it: `POST /api/notes`. */
  calledBy: string[];
}

export interface JobEntry {
  name: string;
  payload?: string;
  retry?: { attempts?: number; backoff?: string; delay?: number };
  timeoutMs?: number;
  nonRetryableCodes?: string[];
  schedules: Array<Omit<ScheduleSource, 'jobName'>>;
  location?: Location;
}

export interface ListIssue {
  severity: 'error' | 'warn';
  code: string;
  message: string;
}

export interface ProjectListing {
  root: string;
  routes: RouteEntry[];
  procedures: ProcedureEntry[];
  jobs: JobEntry[];
  issues: ListIssue[];
}

/** A route as a controller's `routes()` returns it (`RouteDefinition` in @mariachi/api-facade). */
export interface LoadedRoute {
  method: string;
  path: string;
  auth?: string | string[] | false;
  root?: boolean;
  tenant?: 'required' | 'optional';
  scopes?: string[];
  summary?: string;
  schema?: { params?: unknown; query?: unknown; body?: unknown; response?: unknown };
  handler?: unknown;
}

/** A procedure as `communication.register(name, definition)` received it. */
export interface LoadedProcedure {
  name: string;
  schema?: { input?: unknown; output?: unknown };
  location?: Location;
}

/** A job as `defineJob()` returns it (`JobDefinition` in @mariachi/jobs). */
export interface LoadedJob {
  name: string;
  schema?: unknown;
  retry?: { attempts?: number; backoff?: string; delay?: number };
  timeoutMs?: number;
  nonRetryableCodes?: string[];
}

function joinPath(...parts: string[]): string {
  return `/${parts
    .map((p) => p.replace(/^\/+|\/+$/g, ''))
    .filter(Boolean)
    .join('/')}`;
}

// `.call(ctx, 'notes.create'`, also with a type argument left in, and with any quote. Not `fn.call(this, ...)`.
const CALL = /\.call\s*(?:<[^>()]*>)?\s*\(\s*(?!this\b)[\w$.]+\s*,\s*(?:'([^'\n]*)'|"([^"\n]*)"|`([^`\n]*)`)/g;

/**
 * The procedures a route handler calls, read from the handler's own source text (what
 * `Function.prototype.toString` gives for the loaded function): `this.call(ctx, 'notes.create', ...)`.
 * The handler is never run.
 */
export function proceduresCalled(handler: unknown): string[] {
  if (typeof handler !== 'function') return [];
  const text = Function.prototype.toString.call(handler);
  const names = new Set<string>();
  for (const match of text.matchAll(CALL)) names.add((match[1] ?? match[2] ?? match[3]) as string);
  return [...names];
}

/** The routes of one controller, as the server mounts them. */
export function controllerRoutes(
  controller: string,
  routes: Array<{ route: LoadedRoute; location?: Location }>,
  server: ApiServerSource | undefined,
): RouteEntry[] {
  return routes.map(({ route, location }) => {
    const own = route.auth === undefined ? undefined : route.auth === false ? [] : Array.isArray(route.auth) ? route.auth : [route.auth];
    const auth = own ?? server?.defaultAuth ?? (server ? [] : null);
    const schema: RouteEntry['schema'] = {};
    for (const key of ['params', 'query', 'body', 'response'] as const) {
      const text = describeSchema(route.schema?.[key]);
      if (text) schema[key] = text;
    }
    return {
      method: route.method,
      path: route.root ? joinPath(route.path) : joinPath(server?.prefix ?? '', route.path),
      auth,
      defaultAuth: own === undefined,
      ...(auth === null || auth.length > 0 ? { tenant: route.tenant ?? 'required' } : {}),
      scopes: route.scopes ?? [],
      procedures: proceduresCalled(route.handler),
      controller,
      kind: 'controller' as const,
      ...(location ? { location } : {}),
      ...(route.summary ? { summary: route.summary } : {}),
      schema,
    };
  });
}

/** The routes the server adds itself: health checks, the OpenAPI document, static files. */
export function serverRoutes(server: ApiServerSource | undefined, appFile: string): RouteEntry[] {
  if (!server) return [];
  return server.routes.map((route) => ({
    method: route.method,
    path: route.path,
    auth: [],
    defaultAuth: false,
    scopes: [],
    procedures: [],
    controller: null,
    kind: route.kind,
    location: { file: appFile, line: server.line },
    schema: {},
  }));
}

/** `src/services/notes/notes.handler.ts` is `notes`; `src/organizations.ts` is `organizations`; an index is none. */
export function serviceOf(file: string | undefined): string | undefined {
  if (!file) return undefined;
  const parts = file.split('/');
  const at = parts.indexOf('services');
  if (at !== -1 && parts.length > at + 2) return parts[at + 1];
  const name = parts.at(-1)?.replace(/\.[^.]+$/, '').replace(/\.(handler|handlers|procedures)$/, '');
  // A registry's index names no service
  return name === 'index' ? undefined : name;
}

export function procedureEntries(procedures: LoadedProcedure[]): ProcedureEntry[] {
  return procedures.map((p) => {
    const input = describeSchema(p.schema?.input);
    const output = describeSchema(p.schema?.output);
    const service = serviceOf(p.location?.file);
    return {
      name: p.name,
      ...(input ? { input } : {}),
      ...(output ? { output } : {}),
      ...(service ? { service } : {}),
      ...(p.location ? { location: p.location } : {}),
      calledBy: [],
    };
  });
}

export function jobEntries(jobs: LoadedJob[], written: JobSource[], schedules: ScheduleSource[]): JobEntry[] {
  return jobs.map((job) => {
    const payload = describeSchema(job.schema);
    const where = written.find((w) => w.name === job.name);
    return {
      name: job.name,
      ...(payload ? { payload } : {}),
      ...(job.retry ? { retry: job.retry } : {}),
      ...(job.timeoutMs !== undefined ? { timeoutMs: job.timeoutMs } : {}),
      ...(job.nonRetryableCodes?.length ? { nonRetryableCodes: job.nonRetryableCodes } : {}),
      schedules: schedules.filter((s) => s.jobName === job.name).map(({ jobName: _jobName, ...rest }) => rest),
      ...(where ? { location: { file: where.file, line: where.line } } : {}),
    };
  });
}

/**
 * Fills each procedure's `calledBy` from the routes, and says what doesn't add up: a route calling a
 * procedure nothing registers, a name registered twice, a schedule for a job that isn't registered.
 * `complete` is false when some registration could not be loaded: then a missing procedure may only
 * be in what failed, and is not reported.
 */
export function link(listing: Omit<ProjectListing, 'issues'>, registered: string[], complete: boolean): ListIssue[] {
  const issues: ListIssue[] = [];
  const byName = new Map(listing.procedures.map((p) => [p.name, p]));
  for (const route of listing.routes) {
    for (const name of route.procedures) {
      const procedure = byName.get(name);
      if (procedure) procedure.calledBy.push(`${route.method} ${route.path}`);
      else if (complete && !name.includes('${')) {
        issues.push({ severity: 'warn', code: 'cli/unknown-procedure', message: `${route.method} ${route.path} calls ${name}, which nothing registers: the call fails with communication/procedure-not-found` });
      }
    }
  }
  const seen = new Set<string>();
  for (const name of registered) {
    if (seen.has(name)) issues.push({ severity: 'error', code: 'cli/duplicate-procedure', message: `${name} is registered twice: the app stops at startup with communication/duplicate-procedure` });
    seen.add(name);
  }
  return issues;
}

/** A schedule whose job isn't in the job registry. */
export function orphanSchedules(jobs: LoadedJob[], schedules: ScheduleSource[]): ListIssue[] {
  const names = new Set(jobs.map((j) => j.name));
  return schedules
    .filter((s) => !names.has(s.jobName))
    .map((s) => ({ severity: 'warn' as const, code: 'cli/unknown-job', message: `Schedule ${s.name} (${s.file}:${s.line}) runs job ${s.jobName}, which src/jobs/index.ts does not register` }));
}
