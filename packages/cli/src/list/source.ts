import type * as TS from 'typescript';

/**
 * What `mariachi list` reads from source rather than from the loaded modules: the parts of the
 * composition root (src/app.ts) that only exist once the app runs, and `jobs.schedule()` calls.
 * The TypeScript parser reads them; nothing is run. Only literal values are read: a prefix or a
 * cron held in a variable is reported as its source text in angle brackets (`<config.prefix>`).
 */

type Ts = typeof TS;

let loaded: Ts | undefined;

/** The TypeScript compiler, loaded on first use so the other commands don't pay for it. */
export async function loadTypeScript(): Promise<Ts> {
  if (!loaded) {
    // A CommonJS module: its exports are the default export when imported from ESM
    const mod = (await import('typescript')) as unknown as Ts & { default?: Ts };
    loaded = mod.default ?? mod;
  }
  return loaded;
}

/** A route the API server adds itself, from its builder calls (`withHealth`, `withOpenApi`, `withStatic`). */
export interface ServerRoute {
  method: 'GET';
  path: string;
  /** Mounted at the server's root, outside its prefix. */
  root: boolean;
  /** `health`, `openapi` or `static`. */
  kind: 'health' | 'openapi' | 'static';
}

/** The API server as the composition root builds it. */
export interface ApiServerSource {
  /** `createApiServer({ prefix })`: what every route that isn't `root` is mounted under. */
  prefix: string;
  /** `.withAuth(...)`: the strategies a route with no `auth` of its own accepts. Undefined when not found. */
  defaultAuth?: string[];
  routes: ServerRoute[];
  /** Where `createApiServer` is called, 1-based. */
  line: number;
}

export interface ScheduleSource {
  name: string;
  cron: string;
  jobName: string;
  timezone?: string;
  file: string;
  line: number;
}

export interface JobSource {
  name: string;
  file: string;
  line: number;
}

function parse(ts: Ts, file: string, text: string): TS.SourceFile {
  return ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
}

function walk(ts: Ts, node: TS.Node, visit: (node: TS.Node) => void): void {
  visit(node);
  ts.forEachChild(node, (child) => walk(ts, child, visit));
}

function lineOf(source: TS.SourceFile, node: TS.Node): number {
  return source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1;
}

/** A string literal's value, or the expression's source text in angle brackets: `<config.prefix>`. */
function textOf(ts: Ts, node: TS.Expression, source: TS.SourceFile): string {
  if (ts.isStringLiteralLike(node)) return node.text;
  return `<${node.getText(source)}>`;
}

function stringOf(ts: Ts, node: TS.Expression | undefined): string | undefined {
  return node && ts.isStringLiteralLike(node) ? node.text : undefined;
}

function property(ts: Ts, object: TS.Expression | undefined, name: string): TS.Expression | undefined {
  if (!object || !ts.isObjectLiteralExpression(object)) return undefined;
  for (const prop of object.properties) {
    if (ts.isPropertyAssignment(prop) && (ts.isIdentifier(prop.name) || ts.isStringLiteral(prop.name)) && prop.name.text === name) return prop.initializer;
  }
  return undefined;
}

function joinPath(...parts: string[]): string {
  return `/${parts
    .map((p) => p.replace(/^\/+|\/+$/g, ''))
    .filter(Boolean)
    .join('/')}`;
}

/**
 * The API server the composition root builds: `createApiServer({ prefix })` and the builder calls
 * chained on it. Undefined when the file has no `createApiServer` call.
 */
export function readApiServer(ts: Ts, file: string, text: string): ApiServerSource | undefined {
  const source = parse(ts, file, text);
  let found: ApiServerSource | undefined;
  walk(ts, source, (node) => {
    if (found || !ts.isCallExpression(node) || !ts.isIdentifier(node.expression) || node.expression.text !== 'createApiServer') return;
    const prefixNode = property(ts, node.arguments[0], 'prefix');
    const server: ApiServerSource = { prefix: prefixNode ? textOf(ts, prefixNode, source) : '', routes: [], line: lineOf(source, node) };
    // Up the chain: createApiServer(...).withAuth(...).withHealth(...)
    let call: TS.Node = node;
    while (ts.isPropertyAccessExpression(call.parent) && ts.isCallExpression(call.parent.parent)) {
      const method = call.parent.name.text;
      const args = call.parent.parent.arguments;
      if (method === 'withAuth' && args[0]) {
        const arg = args[0];
        server.defaultAuth = ts.isArrayLiteralExpression(arg) ? arg.elements.map((e) => textOf(ts, e, source)) : [textOf(ts, arg, source)];
      } else if (method === 'withHealth') {
        const base = stringOf(ts, property(ts, args[1], 'path')) ?? '/health';
        for (const end of ['live', 'ready', 'startup']) server.routes.push({ method: 'GET', path: joinPath(server.prefix, base, end), root: false, kind: 'health' });
      } else if (method === 'withOpenApi') {
        server.routes.push({ method: 'GET', path: joinPath(server.prefix, stringOf(ts, property(ts, args[0], 'path')) ?? '/openapi.json'), root: false, kind: 'openapi' });
      } else if (method === 'withStatic' && args[0]) {
        server.routes.push({ method: 'GET', path: `${textOf(ts, args[0], source).replace(/\/+$/, '')}/*`, root: true, kind: 'static' });
      }
      call = call.parent.parent;
    }
    found = server;
  });
  return found;
}

/** `jobs.schedule({ name, cron, jobName, timezone })` calls with an object literal. */
export function findSchedules(ts: Ts, file: string, text: string): ScheduleSource[] {
  const source = parse(ts, file, text);
  const out: ScheduleSource[] = [];
  walk(ts, source, (node) => {
    if (!ts.isCallExpression(node) || !ts.isPropertyAccessExpression(node.expression) || node.expression.name.text !== 'schedule') return;
    const arg = node.arguments[0];
    const cron = property(ts, arg, 'cron');
    const jobName = property(ts, arg, 'jobName');
    if (!cron || !jobName) return;
    const name = property(ts, arg, 'name');
    const timezone = property(ts, arg, 'timezone');
    out.push({
      name: name ? textOf(ts, name, source) : textOf(ts, jobName, source),
      cron: textOf(ts, cron, source),
      jobName: textOf(ts, jobName, source),
      ...(timezone ? { timezone: textOf(ts, timezone, source) } : {}),
      file,
      line: lineOf(source, node),
    });
  });
  return out;
}

/** `defineJob({ name: '...' })` calls: where each job is written. */
export function findJobDefinitions(ts: Ts, file: string, text: string): JobSource[] {
  const source = parse(ts, file, text);
  const out: JobSource[] = [];
  walk(ts, source, (node) => {
    if (!ts.isCallExpression(node) || !ts.isIdentifier(node.expression) || node.expression.text !== 'defineJob') return;
    const name = stringOf(ts, property(ts, node.arguments[0], 'name'));
    if (name) out.push({ name, file, line: lineOf(source, node) });
  });
  return out;
}
