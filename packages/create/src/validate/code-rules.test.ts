import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';
import { procedureNameFor } from './code-rules';
import { RULES, parseSource, validate } from './index';

/** Runs one rule over in-memory files and returns `line: message` for each finding. */
function check(rule: string, files: Record<string, string>): string[] {
  const parsed = Object.entries(files).map(([path, content]) => parseSource(path, content, ts));
  const found = RULES.find((r) => r.name === rule);
  if (!found) throw new Error(`no rule ${rule}`); // mariachi-lint-ignore: test helper
  return found.check(parsed, new Set(Object.keys(files))).map((v) => `${v.file}:${v.line} ${v.message} → ${v.suggestion}`);
}

const HANDLER = 'src/services/notes/notes.handler.ts';
const SERVICE = 'src/services/notes/notes.service.ts';
const CONTROLLER = 'src/api/controllers/notes.controller.ts';
const JOB = 'src/jobs/send-digest.job.ts';
const EVENTS = 'src/events/notes.ts';

const handler = (name: string, def: string) => `import type { CommunicationLayer } from '@mariachi/communication';
import { z } from 'zod';
import { noteIdInput, noteSchema } from '../../contracts/notes';

export function registerNotesHandlers(communication: CommunicationLayer, service: NotesService): void {
  communication.register('${name}', ${def});
}
`;

const GOOD_DEF = `{
    schema: { input: noteIdInput, output: noteSchema },
    handler: (ctx, input) => service.get(ctx, input.id),
  }`;

const controller = (route: string, call = "this.call(ctx, 'notes.get', params)") => `import { BaseController } from '@mariachi/api-facade';
import { noteIdInput, noteSchema } from '../../contracts/notes';

export class NotesController extends BaseController {
  readonly prefix = 'notes';

  init(): void {
    ${route.replace('CALL', call)}
  }
}
`;

describe('ctx-first', () => {
  it('passes handlers, service methods and calls that take ctx first', () => {
    expect(
      check('ctx-first', {
        [HANDLER]: handler('notes.get', GOOD_DEF),
        [SERVICE]: `import type { Context } from '@mariachi/core';
export class NotesService {
  constructor(private readonly repo: NotesRepository) {}
  get(ctx: Context, id: string) { return this.repo.getById(ctx, id); }
  list = async (context: Context) => this.repo.list(context);
  private helper(id: string) { return id; }
  static of(repo: NotesRepository) { return new NotesService(repo); }
}`,
        [CONTROLLER]: controller("this.get('/:id', { schema: { params: noteIdInput } }, (ctx, _body, params) => CALL);"),
        [JOB]: `export const job = defineJob({ name: 'send-digest', schema, handler: async (ctx, data) => { await jobs.enqueue(ctx, 'next', data); } });`,
        [EVENTS]: 'events.subscribe(noteCreated, async (_ctx, payload) => { await events.publish(ctx, noteCreated, payload); });',
      }),
    ).toEqual([]);
  });

  it('flags each place the Context is not first', () => {
    expect(
      check('ctx-first', {
        [HANDLER]: handler('notes.get', '{ schema: { input: noteIdInput, output: noteSchema }, handler: (input) => service.get(input) }'),
        [SERVICE]: `export class NotesService {
  get(id: string, ctx: Context) { return id; }
  count() { return 0; }
}`,
        [CONTROLLER]: controller("this.get('/:id', { schema: { params: noteIdInput } }, (req, _body, params) => CALL);", "this.call('notes.get', params, ctx)"),
        [JOB]: `export const job = defineJob({ name: 'send-digest', schema, handler: async (data: Payload) => { await jobs.enqueue('next', data); } });`,
        [EVENTS]: 'events.subscribe(noteCreated, async (payload) => { await events.publish({ tenantId }, noteCreated, payload); });',
      }),
    ).toEqual([
      `${HANDLER}:6 The handler of procedure "notes.get" takes input first, not the Context → Take ctx first: handler: (ctx, input) => …`,
      `${SERVICE}:2 NotesService.get takes id: string first, not ctx: Context → Declare get(ctx: Context, …) and pass ctx on to repositories and calls`,
      `${SERVICE}:3 NotesService.count takes no ctx: Context → Declare count(ctx: Context, …) and pass ctx on to repositories and calls`,
      `${CONTROLLER}:8 The GET /:id route handler takes req first, not the Context → Take ctx first: (ctx, body, params, query) => …`,
      `${CONTROLLER}:8 this.call('notes.get', …) does not pass the Context first → Pass the caller's ctx first: this.call(ctx, name, input)`,
      `${JOB}:1 The job handler takes data: Payload first, not the Context → Take ctx first: handler: async (ctx, data) => …`,
      `${JOB}:1 jobs.enqueue('next', …) does not pass the Context first → Pass the caller's ctx first: jobs.enqueue(ctx, name, data)`,
      `${EVENTS}:1 The event subscriber takes payload first, not the Context → Take ctx first: events.subscribe(event, async (ctx, payload, meta) => …)`,
      `${EVENTS}:1 events.publish({ tenantId }, …) does not pass the Context first → Pass the caller's ctx first: events.publish(ctx, event, payload)`,
    ]);
  });

  it('accepts a parameter typed as a Context whatever its name, and refuses a ctx typed as something else', () => {
    expect(check('ctx-first', { [SERVICE]: 'export class S {\n  a(c: Context) {}\n  b(ctx: string) {}\n}' })).toEqual([
      `${SERVICE}:3 S.b takes ctx: string first, not ctx: Context → Declare b(ctx: Context, …) and pass ctx on to repositories and calls`,
    ]);
  });

  it('leaves Function.prototype.call and calls outside controllers alone', () => {
    expect(check('ctx-first', { 'src/lib/util.ts': 'fn.call(thisArg, 1);\nclass A { m() { this.call(1); } }' })).toEqual([]);
  });

  it('skips tests', () => {
    expect(check('ctx-first', { 'src/services/notes/notes.service.test.ts': 'export class S { a(id: string) {} }' })).toEqual([]);
  });
});

describe('zod-at-boundaries', () => {
  it('passes procedures, routes, jobs and events that declare their schemas', () => {
    expect(
      check('zod-at-boundaries', {
        [HANDLER]: `${handler('notes.get', GOOD_DEF)}communication.register('notes.other', definition);\n`,
        [CONTROLLER]: controller(
          [
            "this.get('/:id', { schema: { params: noteIdInput, response: noteSchema } }, (ctx, _body, params) => CALL);",
            "this.post('/', { schema: { body: noteIdInput } }, (ctx, body) => this.call(ctx, 'notes.create', body));",
            "this.get('/', { auth: false }, async () => 'page');",
            "this.post('/:id/archive', { schema }, (ctx, body, params) => this.call(ctx, 'notes.archive', { body, params }));",
          ].join('\n    '),
        ),
        [JOB]: "export const job = defineJob({ name: 'send-digest', schema: z.object({ id: z.string() }), handler: async (ctx, data) => {} });",
        [EVENTS]: "export const noteCreated = defineEvent('notes.note.created', { schema: z.object({ id: z.string() }) });",
      }),
    ).toEqual([]);
  });

  it('flags each boundary without a schema for what it receives', () => {
    expect(
      check('zod-at-boundaries', {
        [HANDLER]: `${handler('notes.get', '{ handler: (ctx, input) => service.get(ctx, input) }')}communication.register('notes.list', { schema: { input: noteIdInput }, handler: (ctx) => service.list(ctx) });\n`,
        [CONTROLLER]: controller(
          [
            "this.get('/:id', (ctx, _body, params) => CALL);",
            "this.get('/', { summary: 'List' }, (ctx, _body, _params, query) => this.call(ctx, 'notes.list', query));",
            "this.post('/', { schema: { response: noteSchema } }, (ctx, body) => this.call(ctx, 'notes.create', body));",
          ].join('\n    '),
        ),
        [JOB]: "export const job = defineJob({ name: 'send-digest', handler: async (ctx, data) => {} });",
        [EVENTS]: "export const noteCreated = defineEvent('notes.note.created');\nexport const noteDeleted = defineEvent('notes.note.deleted', { description: 'gone' });",
      }),
    ).toEqual([
      `${HANDLER}:6 Procedure "notes.get" has no schema → Add schema: { input: z.object({ … }), output: … } (share them through src/contracts/)`,
      `${HANDLER}:8 Procedure "notes.list" has no output schema → Add output: z.… to its schema`,
      `${CONTROLLER}:8 GET /:id reads the request params without a schema → Add schema: { params: z.object({ … }) } to the route options (or prefix an unused parameter with _)`,
      `${CONTROLLER}:9 GET / reads the request query without a schema → Add schema: { query: z.object({ … }) } to the route options (or prefix an unused parameter with _)`,
      `${CONTROLLER}:10 POST / reads the request body without a schema → Add schema: { body: z.object({ … }) } to the route options (or prefix an unused parameter with _)`,
      `${JOB}:1 The job has no schema for its payload → Add schema: z.object({ … }) to defineJob: payloads are validated when enqueued and in the worker`,
      `${EVENTS}:1 Event "notes.note.created" has no schema for its payload → defineEvent('notes.note.created', { schema: z.object({ … }) })`,
      `${EVENTS}:2 Event "notes.note.deleted" has no schema for its payload → defineEvent('notes.note.deleted', { schema: z.object({ … }) })`,
    ]);
  });
});

describe('procedure-name-format', () => {
  it('passes domainCamel.action names, nested ones too', () => {
    expect(
      check('procedure-name-format', {
        [HANDLER]: `${handler('invoiceItems.create', GOOD_DEF)}communication.register('organizations.members.changeRole', definition);\n`,
        [CONTROLLER]: controller("this.get('/:id', { schema: { params: noteIdInput } }, (ctx, _body, params) => CALL);", "this.call(ctx, 'invoiceItems.get', params)"),
      }),
    ).toEqual([]);
  });

  it('flags kebab, snake, capitalized and undotted names where they are registered and called', () => {
    expect(
      check('procedure-name-format', {
        [HANDLER]: `${handler('billing-report.execute', GOOD_DEF)}communication.register('Notes.Create_now', definition);\ncommunication.register('archive', definition);\n`,
        [CONTROLLER]: controller("this.get('/:id', { schema: { params: noteIdInput } }, (ctx, _body, params) => CALL);", "this.call(ctx, 'billing-report.execute', params)"),
      }),
    ).toEqual([
      `${HANDLER}:6 Procedure "billing-report.execute" (registered here) is not named domainCamel.action → Use "billingReport.execute", here and wherever it is registered or called`,
      `${HANDLER}:11 Procedure "Notes.Create_now" (registered here) is not named domainCamel.action → Use "notes.createNow", here and wherever it is registered or called`,
      `${HANDLER}:12 Procedure "archive" (registered here) is not named domainCamel.action → Use "<domain>.archive", here and wherever it is registered or called`,
      `${CONTROLLER}:8 Procedure "billing-report.execute" (called here) is not named domainCamel.action → Use "billingReport.execute", here and wherever it is registered or called`,
    ]);
  });

  it('derives the documented form', () => {
    expect(procedureNameFor('invoice_items.list-all')).toBe('invoiceItems.listAll');
    expect(procedureNameFor('InvoiceItems.create')).toBe('invoiceItems.create');
  });
});

describe('unique-procedure-names', () => {
  it('passes distinct names', () => {
    expect(check('unique-procedure-names', { [HANDLER]: handler('notes.get', GOOD_DEF), 'src/services/a/a.handler.ts': handler('notes.list', GOOD_DEF) })).toEqual([]);
  });

  it('flags a name registered twice', () => {
    expect(check('unique-procedure-names', { [HANDLER]: handler('notes.get', GOOD_DEF), 'src/services/a/a.handler.ts': handler('notes.get', GOOD_DEF) })).toEqual([
      `src/services/a/a.handler.ts:6 Procedure "notes.get" is also registered at ${HANDLER}:6 → Rename one of them; duplicate registrations throw at startup`,
    ]);
  });
});

describe('procedure-registered', () => {
  const route = "this.get('/:id', { schema: { params: noteIdInput } }, (ctx, _body, params) => CALL);";

  it('passes calls to registered procedures', () => {
    expect(check('procedure-registered', { [HANDLER]: handler('notes.get', GOOD_DEF), [CONTROLLER]: controller(route) })).toEqual([]);
  });

  it('flags a call nothing registers, and suggests the names its domain has', () => {
    expect(
      check('procedure-registered', {
        [HANDLER]: handler('notes.get', GOOD_DEF),
        [CONTROLLER]: controller(route, "this.call(ctx, 'notes.fetch', params)") + controller(route, "this.call(ctx, 'billingReport.execute', params)"),
      }),
    ).toEqual([
      `${CONTROLLER}:8 "notes.fetch" is called here but nothing in the project registers it → Use one of "notes.get", or register "notes.fetch" in the notes handler`,
      `${CONTROLLER}:18 "billingReport.execute" is called here but nothing in the project registers it → Register it in a *.handler.ts (mariachi generate service billing-report), or correct the name`,
    ]);
  });

  it("leaves domains a package's register…Procedures() may hold alone, and gives up on names built at runtime", () => {
    const calls = controller(route, "this.call(ctx, 'organizations.listMine', params)");
    const app = "import { registerOrganizationProcedures } from '@mariachi/organizations';\nregisterOrganizationProcedures(communication, organizations, {});\n";
    expect(check('procedure-registered', { [HANDLER]: handler('notes.get', GOOD_DEF), [CONTROLLER]: calls, 'src/organizations.ts': app })).toEqual([]);
    expect(check('procedure-registered', { [HANDLER]: handler('notes.get', GOOD_DEF), [CONTROLLER]: calls, 'src/x.ts': 'communication.register(name, def);' })).toEqual([]);
  });
});

describe('validate with the syntax rules', () => {
  it('honors ignore comments and reports file, line, rule and fix', async () => {
    const root = await mkdtemp(join(tmpdir(), 'mariachi-validate-ast-'));
    try {
      const files: Record<string, string> = {
        [SERVICE]: [
          'export class NotesService {',
          '  // mariachi-validate-ignore ctx-first: a pure helper, no I/O',
          '  slug(name: string) { return name; }',
          '  count() { return 0; }',
          '}',
        ].join('\n'),
        [HANDLER]: 'export {};',
        'src/services/notes/notes.service.test.ts': 'export {};',
      };
      for (const [path, content] of Object.entries(files)) {
        await mkdir(dirname(join(root, path)), { recursive: true });
        await writeFile(join(root, path), content);
      }
      const result = await validate(root);
      expect(result.valid).toBe(false);
      expect(result.violations).toEqual([
        {
          rule: 'ctx-first',
          severity: 'error',
          file: SERVICE,
          line: 4,
          message: 'NotesService.count takes no ctx: Context',
          suggestion: 'Declare count(ctx: Context, …) and pass ctx on to repositories and calls',
        },
      ]);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});
