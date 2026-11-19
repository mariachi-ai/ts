import { existsSync, readdirSync, readFileSync, realpathSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ConfigError } from '@mariachi/core';
import { LAYOUT } from '@mariachi/create';
import { importModule } from '../db/project';
import {
  controllerRoutes,
  jobEntries,
  link,
  orphanSchedules,
  procedureEntries,
  serverRoutes,
  type ListIssue,
  type LoadedJob,
  type LoadedProcedure,
  type LoadedRoute,
  type Location,
  type ProjectListing,
  type RouteEntry,
} from './listing';
import { findJobDefinitions, findSchedules, loadTypeScript, readApiServer, type JobSource, type ScheduleSource } from './source';

/**
 * Lists what a project exposes from its own registrations, without starting it.
 *
 * The generated layout keeps the wiring in modules that only declare things: the controllers
 * (`createControllers(communication)`), the services (`registerServices(communication, deps)`),
 * organizations (`setupOrganizations(deps)`, with `--orgs`) and the jobs (`jobs`). Those are loaded
 * with jiti, as `mariachi db` loads the schema, and called with a communication layer that only
 * records what is registered and dependencies that do nothing: no database, queue or network is
 * touched. The composition root (src/app.ts) and main.ts are never run; the API prefix, the default
 * auth and the server's own routes are read from app.ts's source, as are `jobs.schedule()` calls.
 */

/** Modules that register procedures, and how each is called. */
const PROCEDURE_REGISTRIES: Array<{ file: string; name: string; run: (fn: (...args: unknown[]) => unknown, communication: unknown) => unknown }> = [
  { file: LAYOUT.servicesIndex, name: 'registerServices', run: (fn, communication) => fn(communication, deps(communication)) },
  { file: 'src/organizations.ts', name: 'setupOrganizations', run: (fn, communication) => fn(deps(communication)) },
];

const ROUTE_METHODS = ['get', 'post', 'put', 'patch', 'delete'] as const;

/**
 * A value that stands in for any dependency: every property is itself, calling it or `new` on it
 * gives itself. A repository built over it keeps it and never uses it while nothing is called.
 */
export function inert(): unknown {
  const proxy: object = new Proxy(function inertDependency() {}, {
    get: (_target, key) => {
      // Not a promise, and it prints as nothing
      if (key === 'then') return undefined;
      if (key === Symbol.toPrimitive) return () => '';
      return proxy;
    },
    apply: () => proxy,
    construct: () => proxy,
  });
  return proxy;
}

/** A `deps` object: `communication` is the recorder, anything else is inert. */
function deps(communication: unknown): unknown {
  const stand = inert();
  return new Proxy({}, { get: (_target, key) => (key === 'communication' ? communication : key === 'then' ? undefined : stand) });
}

/** The first stack frame in the project's own source (not in node_modules, not the CLI). */
export function projectFrame(stack: string | undefined, roots: string[]): Location | undefined {
  for (const line of (stack ?? '').split('\n')) {
    const match = /((?:file:\/\/)?(?:\/|[A-Za-z]:\\)[^():]*?):(\d+):\d+\)?\s*$/.exec(line.trim());
    if (!match) continue;
    const file = (match[1] as string).startsWith('file://') ? fileURLToPath(match[1] as string) : (match[1] as string);
    if (file.includes(`${sep}node_modules${sep}`)) continue;
    const root = roots.find((r) => file.startsWith(r + sep));
    if (root) return { file: relative(root, file).split(sep).join('/'), line: Number(match[2]) };
  }
  return undefined;
}

function here(roots: string[]): Location | undefined {
  const holder: { stack?: string } = {};
  Error.captureStackTrace(holder);
  return projectFrame(holder.stack, roots);
}

/** A communication layer that keeps what is registered and refuses to call anything. */
function recorder(roots: string[], registered: LoadedProcedure[]) {
  return {
    register(name: string, definition: { schema?: { input?: unknown; output?: unknown } } | undefined) {
      registered.push({ name, schema: definition?.schema, location: here(roots) });
    },
    call(_ctx: unknown, name: string) {
      return Promise.reject(new ConfigError('cli/list-no-calls', `mariachi list loads the app's registrations and runs no procedure (${name} was called while they loaded)`));
    },
    use() {},
    has: (name: string) => registered.some((p) => p.name === name),
    unregister(name: string) {
      const at = registered.findIndex((p) => p.name === name);
      if (at !== -1) registered.splice(at, 1);
    },
    procedures: () => registered.map((p) => p.name),
  };
}

function failure(file: string, error: unknown, what: string): ListIssue {
  const message = error instanceof Error ? error.message : String(error);
  return { severity: 'error', code: 'cli/list-load-failed', message: `Could not load ${file}: ${message}. ${what} it registers are missing from this list` };
}

/** Every .ts file under src, except tests and declarations. */
function sourceFiles(root: string): string[] {
  const out: string[] = [];
  const visit = (dir: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
      const path = join(dir, entry.name);
      if (entry.isDirectory()) visit(path);
      else if (/\.tsx?$/.test(entry.name) && !/\.(test|spec)\.tsx?$/.test(entry.name) && !entry.name.endsWith('.d.ts')) out.push(path);
    }
  };
  const src = join(root, 'src');
  if (existsSync(src)) visit(src);
  return out.sort();
}

type Controller = { constructor: { name: string }; routes: () => LoadedRoute[] } & Record<string, unknown>;

function isController(value: unknown): value is Controller {
  return typeof value === 'object' && value !== null && typeof (value as { routes?: unknown }).routes === 'function';
}

/**
 * A controller's routes, each with where it is declared: the route methods (`this.get`, `this.post`,
 * ...) are wrapped on the instance to note the caller before `routes()` runs `init()`.
 */
function routesOf(controller: Controller, roots: string[]): Array<{ route: LoadedRoute; location?: Location }> {
  const locations: Array<Location | undefined> = [];
  for (const method of ROUTE_METHODS) {
    const original = controller[method];
    if (typeof original !== 'function') continue;
    controller[method] = function (this: unknown, ...args: unknown[]) {
      locations.push(here(roots));
      return (original as (...a: unknown[]) => unknown).apply(this, args);
    };
  }
  const routes = controller.routes();
  // Routes added another way than the five methods have no location
  return routes.map((route, i) => ({ route, location: locations.length === routes.length ? locations[i] : undefined }));
}

export interface ListOptions {
  /** Load only what these sections need (all of them by default). */
  only?: Array<'routes' | 'procedures' | 'jobs'>;
}

/** What the project at `root` exposes: its routes, procedures and jobs. */
export async function listProject(rootDir: string, options: ListOptions = {}): Promise<ProjectListing> {
  const root = resolve(rootDir);
  if (!existsSync(join(root, 'package.json')) || !existsSync(join(root, 'src'))) {
    throw new ConfigError('cli/not-a-project', `${root} is not a project (no package.json, or no src/ folder): run mariachi list in a project made by mariachi init, or pass --cwd <dir>`);
  }
  const roots = [...new Set([root, realpathSync(root)])];
  const wanted = new Set(options.only ?? ['routes', 'procedures', 'jobs']);
  const ts = await loadTypeScript();
  const issues: ListIssue[] = [];

  // The composition root, read as source
  const appPath = join(root, LAYOUT.app);
  const server = existsSync(appPath) ? readApiServer(ts, LAYOUT.app, readFileSync(appPath, 'utf-8')) : undefined;

  // Routes: the controllers createControllers() returns, and those the server adds itself
  const routes: RouteEntry[] = [];
  if (wanted.has('routes') || wanted.has('procedures')) {
    routes.push(...serverRoutes(server, LAYOUT.app));
    const file = LAYOUT.controllersIndex;
    if (existsSync(join(root, file))) {
      try {
        const mod = await importModule(file, root);
        if (typeof mod.createControllers !== 'function') throw new ConfigError('cli/list-no-export', 'it does not export createControllers(communication)');
        const controllers = (mod.createControllers as (c: unknown) => unknown[])(recorder(roots, []));
        for (const controller of controllers) {
          if (!isController(controller)) continue;
          routes.push(...controllerRoutes(controller.constructor.name, routesOf(controller, roots), server));
        }
      } catch (error) {
        issues.push(failure(file, error, 'The routes'));
      }
    }
  }

  // Procedures: what the registries register on a recording communication layer
  const registered: LoadedProcedure[] = [];
  let complete = true;
  if (wanted.has('procedures') || wanted.has('routes')) {
    for (const registry of PROCEDURE_REGISTRIES) {
      if (!existsSync(join(root, registry.file))) continue;
      try {
        const mod = await importModule(registry.file, root);
        const fn = mod[registry.name];
        if (typeof fn !== 'function') continue;
        await registry.run(fn as (...args: unknown[]) => unknown, recorder(roots, registered));
      } catch (error) {
        complete = false;
        issues.push(failure(registry.file, error, 'The procedures'));
      }
    }
  }

  // Jobs: the job registry, with where each is written and its schedules from source
  let jobs: LoadedJob[] = [];
  let written: JobSource[] = [];
  let schedules: ScheduleSource[] = [];
  if (wanted.has('jobs')) {
    const file = LAYOUT.jobsIndex;
    if (existsSync(join(root, file))) {
      try {
        const mod = await importModule(file, root);
        if (!Array.isArray(mod.jobs)) throw new ConfigError('cli/list-no-export', 'it does not export a jobs array');
        jobs = (mod.jobs as unknown[]).filter((j): j is LoadedJob => typeof j === 'object' && j !== null && typeof (j as { name?: unknown }).name === 'string');
      } catch (error) {
        issues.push(failure(file, error, 'The jobs'));
      }
    }
    for (const path of sourceFiles(root)) {
      const rel = relative(root, path).split(sep).join('/');
      const text = readFileSync(path, 'utf-8');
      if (text.includes('defineJob')) written = written.concat(findJobDefinitions(ts, rel, text));
      if (text.includes('.schedule(')) schedules = schedules.concat(findSchedules(ts, rel, text));
    }
    issues.push(...orphanSchedules(jobs, schedules));
  }

  const listing = { root, routes, procedures: procedureEntries(registered), jobs: jobEntries(jobs, written, schedules) };
  issues.push(...link(listing, registered.map((p) => p.name), complete));
  return {
    root,
    routes: wanted.has('routes') ? listing.routes : [],
    procedures: wanted.has('procedures') ? listing.procedures : [],
    jobs: listing.jobs,
    issues,
  };
}
