import type { Violation } from '../types';
import type { FunctionFact, Keys, Param } from './ast';
import { isTest, type Rule, type SourceFile } from './source';

/** Rules read from each file's syntax tree (see ./ast): context first, Zod at boundaries, procedure names. */

const PROCEDURE_NAME = /^[a-z][a-zA-Z0-9]*(?:\.[a-z][a-zA-Z0-9]*)+$/;

const source = (files: SourceFile[]) => files.filter((f) => !isTest(f.path));
const has = (keys: Keys | undefined, key: string) => keys === 'unknown' || keys?.has(key) === true;
const describeParam = (p: Param) => (p.name ? (p.type ? `${p.name}: ${p.type}` : p.name) : 'a destructured object');

/** `billing-report.Execute_now` → `billingReport.executeNow`. */
export function procedureNameFor(name: string): string {
  const camel = (s: string) => {
    const words = s.split(/[^a-zA-Z0-9]+|(?<=[a-z0-9])(?=[A-Z])/).filter(Boolean);
    return words.map((w, i) => (i === 0 ? w.toLowerCase() : w[0].toUpperCase() + w.slice(1).toLowerCase())).join('');
  };
  const parts = name.split('.').map(camel).filter(Boolean);
  return parts.length > 1 ? parts.join('.') : `<domain>.${parts[0] ?? 'action'}`;
}

const route = (r: { method: string; path?: string }) => (r.path === undefined ? r.method : `${r.method} ${r.path}`);
const kebab = (s: string) => s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

function ctxFirst(file: string, fn: FunctionFact, what: string, shape: string): Violation | undefined {
  const first = fn.params[0];
  if (!first || first.ctx) return undefined;
  return {
    rule: 'ctx-first',
    severity: 'error',
    file,
    line: first.line,
    message: `${what} takes ${describeParam(first)} first, not the Context`,
    suggestion: `Take ctx first: ${shape}`,
  };
}

const ctxFirstRule: Rule = {
  name: 'ctx-first',
  description: 'Handlers, service methods and communication.call/jobs.enqueue/events.publish take ctx: Context first',
  check: (files) =>
    source(files).flatMap((f) => {
      const out: Array<Violation | undefined> = [];
      const { procedures, jobs, subscribers, routes, methods, calls } = f.facts;
      for (const p of procedures) {
        const what = p.name ? `The handler of procedure "${p.name}"` : 'The procedure handler';
        if (p.handler) out.push(ctxFirst(f.path, p.handler, what, 'handler: (ctx, input) => …'));
      }
      for (const j of jobs) if (j.handler) out.push(ctxFirst(f.path, j.handler, 'The job handler', 'handler: async (ctx, data) => …'));
      for (const s of subscribers) out.push(ctxFirst(f.path, s, 'The event subscriber', 'events.subscribe(event, async (ctx, payload, meta) => …)'));
      for (const r of routes) {
        if (r.handler) out.push(ctxFirst(f.path, r.handler, `The ${route(r)} route handler`, '(ctx, body, params, query) => …'));
      }
      for (const m of methods) {
        const first = m.params[0];
        if (first?.ctx) continue;
        out.push({
          rule: 'ctx-first',
          severity: 'error',
          file: f.path,
          line: m.line,
          message: first
            ? `${m.className}.${m.name} takes ${describeParam(first)} first, not ctx: Context`
            : `${m.className}.${m.name} takes no ctx: Context`,
          suggestion: `Declare ${m.name}(ctx: Context, …) and pass ctx on to repositories and calls`,
        });
      }
      for (const c of calls) {
        if (c.first?.ctx) continue;
        const rest = c.kind === 'call' ? `${c.procedure ? `'${c.procedure}'` : 'name'}, input` : c.kind === 'enqueue' ? 'name, data' : 'event, payload';
        out.push({
          rule: 'ctx-first',
          severity: 'error',
          file: f.path,
          line: c.line,
          message: c.first ? `${c.callee}(${c.first.text}, …) does not pass the Context first` : `${c.callee}() is called without a Context`,
          suggestion: `Pass the caller's ctx first: ${c.callee}(ctx, ${rest})`,
        });
      }
      return out.filter((v): v is Violation => v !== undefined);
    }),
};

const used = (p: Param | undefined) => p !== undefined && !(p.name ?? '').startsWith('_');

const zodRule: Rule = {
  name: 'zod-at-boundaries',
  description: 'Procedures, routes, jobs and events declare Zod schemas for what they receive',
  check: (files) =>
    source(files).flatMap((f) => {
      const out: Violation[] = [];
      const push = (line: number, message: string, suggestion: string) =>
        out.push({ rule: 'zod-at-boundaries', severity: 'error', file: f.path, line, message, suggestion });

      for (const p of f.facts.procedures) {
        if (p.definition === 'unknown' || p.schema === 'unknown') continue;
        const label = p.name ? `Procedure "${p.name}"` : 'The procedure';
        if (!p.schema) {
          push(p.line, `${label} has no schema`, 'Add schema: { input: z.object({ … }), output: … } (share them through src/contracts/)');
          continue;
        }
        const missing = ['input', 'output'].filter((k) => !p.schema || !has(p.schema, k));
        if (missing.length) push(p.line, `${label} has no ${missing.join(' or ')} schema`, `Add ${missing.map((k) => `${k}: z.…`).join(' and ')} to its schema`);
      }

      for (const r of f.facts.routes) {
        if (r.webhook) {
          // A webhook route takes no schema option: the signature is checked over the raw body, then the handler parses it.
          const body = r.handler?.params[1];
          if (body && used(body) && !(body.name && r.parsed?.includes(body.name))) {
            push(
              r.line,
              `${route(r)} reads the webhook delivery without parsing it with Zod`,
              `Parse it in the handler: const parsed = payloadSchema.safeParse(${body.name ?? 'body'}); if (!parsed.success) throw fromZodError(parsed.error, '…')`,
            );
          }
          continue;
        }
        if (r.schema === 'unknown' || !r.handler) continue;
        const [, body, params, query] = r.handler.params;
        const missing = [
          used(body) && !has(r.schema, 'body') ? 'body' : undefined,
          used(params) && !has(r.schema, 'params') ? 'params' : undefined,
          used(query) && !has(r.schema, 'query') ? 'query' : undefined,
        ].filter((k): k is string => k !== undefined);
        if (missing.length) {
          push(
            r.line,
            `${route(r)} reads the request ${missing.join(', ')} without a schema`,
            `Add schema: { ${missing.map((k) => `${k}: z.object({ … })`).join(', ')} } to the route options (or prefix an unused parameter with _)`,
          );
        }
      }

      for (const j of f.facts.jobs) {
        if (j.definition === 'unknown' || j.definition.has('schema')) continue;
        push(j.line, 'The job has no schema for its payload', 'Add schema: z.object({ … }) to defineJob: payloads are validated when enqueued and in the worker');
      }

      for (const e of f.facts.events) {
        if (e.options === 'unknown' || e.options?.has('schema')) continue;
        const label = e.name ? `Event "${e.name}"` : 'The event';
        push(e.line, `${label} has no schema for its payload`, `defineEvent('${e.name ?? 'name'}', { schema: z.object({ … }) })`);
      }
      return out;
    }),
};

const nameFormatRule: Rule = {
  name: 'procedure-name-format',
  description: 'Procedure names are domainCamel.action (invoiceItems.create)',
  check: (files) =>
    source(files).flatMap((f) => {
      const names = [
        ...f.facts.procedures.map((p) => ({ name: p.name, line: p.line, verb: 'registered' })),
        ...f.facts.calls.filter((c) => c.kind === 'call').map((c) => ({ name: c.procedure, line: c.line, verb: 'called' })),
      ];
      return names
        .filter((n): n is { name: string; line: number; verb: string } => n.name !== undefined && !PROCEDURE_NAME.test(n.name))
        .map((n) => ({
          rule: 'procedure-name-format',
          severity: 'error' as const,
          file: f.path,
          line: n.line,
          message: `Procedure "${n.name}" (${n.verb} here) is not named domainCamel.action`,
          suggestion: `Use "${procedureNameFor(n.name)}", here and wherever it is registered or called`,
        }));
    }),
};

const uniqueRule: Rule = {
  name: 'unique-procedure-names',
  description: 'A procedure name is registered once',
  check: (files) => {
    const seen = new Map<string, { file: string; line: number }>();
    const out: Violation[] = [];
    for (const f of source(files)) {
      for (const p of f.facts.procedures) {
        if (p.via !== 'register' || !p.name) continue;
        const prev = seen.get(p.name);
        if (!prev) {
          seen.set(p.name, { file: f.path, line: p.line });
          continue;
        }
        out.push({
          rule: 'unique-procedure-names',
          severity: 'error',
          file: f.path,
          line: p.line,
          message: `Procedure "${p.name}" is also registered at ${prev.file}:${prev.line}`,
          suggestion: 'Rename one of them; duplicate registrations throw at startup',
        });
      }
    }
    return out;
  },
};

const registeredRule: Rule = {
  name: 'procedure-registered',
  description: 'Every procedure the project calls is registered in it',
  check: (files) => {
    const sources = source(files);
    const procedures = sources.flatMap((f) => f.facts.procedures.filter((p) => p.via === 'register'));
    // A name built at runtime could be any name: nothing to compare against
    if (procedures.some((p) => !p.name)) return [];
    const registered = new Set(procedures.map((p) => p.name as string));
    const domains = new Set([...registered].map((n) => n.split('.')[0]));
    // A package's register…Procedures() adds names this project can't see; leave domains it doesn't register alone
    const packageNames = sources.some((f) => f.facts.packageRegistrar);
    return sources.flatMap((f) =>
      f.facts.calls
        .filter((c) => c.kind === 'call' && c.procedure && PROCEDURE_NAME.test(c.procedure) && !registered.has(c.procedure))
        .filter((c) => !(packageNames && !domains.has((c.procedure as string).split('.')[0])))
        .map((c) => {
          const name = c.procedure as string;
          const domain = name.split('.')[0];
          const near = [...registered].filter((r) => r.split('.')[0] === domain);
          return {
            rule: 'procedure-registered',
            severity: 'warning' as const,
            file: f.path,
            line: c.line,
            message: `"${name}" is called here but nothing in the project registers it`,
            suggestion: near.length
              ? `Use one of ${near.map((n) => `"${n}"`).join(', ')}, or register "${name}" in the ${kebab(domain)} handler`
              : `Register it in a *.handler.ts (mariachi generate service ${kebab(domain)}), or correct the name`,
          };
        }),
    );
  },
};

export const CODE_RULES: Rule[] = [ctxFirstRule, zodRule, nameFormatRule, uniqueRule, registeredRule];
