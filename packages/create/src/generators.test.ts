import { existsSync } from 'node:fs';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { parseFields } from './fields';
import { createProject, generateEntity, generateEvent, generateProcedure, generateService, generateSubscriber, generateWebhook } from './generators';
import { eventNames, names, pluralize } from './names';
import { entityFiles } from './templates/entity';
import { projectFiles } from './templates/project';
import { writeFiles } from './writer';

let root: string;
let project: string;

beforeEach(async () => {
  root = await mkdtemp(join(tmpdir(), 'mariachi-generate-'));
  project = join(root, 'app');
  await createProject({ name: 'gen-app', outputDir: project });
});

afterEach(() => rm(root, { recursive: true, force: true }));

const text = (file: string) => readFile(join(project, file), 'utf-8');

describe('plurals', () => {
  it.each([
    ['note', 'notes'],
    ['category', 'categories'],
    ['day', 'days'],
    ['address', 'addresses'],
    ['status', 'statuses'],
    ['box', 'boxes'],
    ['church', 'churches'],
    ['dish', 'dishes'],
    ['quiz', 'quizzes'],
    ['waltz', 'waltzes'],
    ['analysis', 'analyses'],
    ['axis', 'axes'],
    ['stomach', 'stomachs'],
    ['photo', 'photos'],
    ['hero', 'heroes'],
    ['roof', 'roofs'],
    ['leaf', 'leaves'],
    ['knife', 'knives'],
    ['person', 'people'],
    ['salesperson', 'salespeople'],
    ['child', 'children'],
    ['woman', 'women'],
    ['man', 'men'],
    ['human', 'humans'],
    ['mouse', 'mice'],
    ['criterion', 'criteria'],
    ['matrix', 'matrices'],
    ['sheep', 'sheep'],
    ['series', 'series'],
    ['metadata', 'metadata'],
  ])('%s → %s', (singular, plural) => {
    expect(pluralize(singular)).toBe(plural);
  });

  it('pluralizes the last word of a compound name, in every casing', () => {
    expect(names('line-item')).toMatchObject({ pluralKebab: 'line-items', pluralSnake: 'line_items' });
    expect(names('teamPerson')).toMatchObject({ pluralKebab: 'team-people', pluralPascal: 'TeamPeople', pluralCamel: 'teamPeople', pluralSnake: 'team_people' });
    expect(names('PolicyAnalysis').pluralKebab).toBe('policy-analyses');
  });

  it('takes the plural it is given', () => {
    expect(names('cactus', { plural: 'cacti' })).toMatchObject({ kebab: 'cactus', pluralKebab: 'cacti', pluralCamel: 'cacti', pluralSnake: 'cacti' });
    expect(names('staff-member', { plural: 'staffMembers' }).pluralSnake).toBe('staff_members');
    expect(() => names('cactus', { plural: '../cacti' })).toThrow(/Invalid plural/);
  });
});

describe('fields', () => {
  it('reads name:type, with ? or :optional for a nullable column', () => {
    expect(parseFields(['title:string', 'done:boolean', 'due_at:timestamp?', 'points:integer:optional', 'summary'])).toEqual([
      { key: 'title', type: 'string', optional: false },
      { key: 'done', type: 'boolean', optional: false },
      { key: 'dueAt', type: 'timestamp', optional: true },
      { key: 'points', type: 'integer', optional: true },
      { key: 'summary', type: 'string', optional: false },
    ]);
  });

  it('is one name column when none are given', () => {
    expect(parseFields(undefined)).toEqual([{ key: 'name', type: 'string', optional: false }]);
    expect(parseFields([])).toEqual([{ key: 'name', type: 'string', optional: false }]);
  });

  it('refuses unknown types, columns every entity has, repeats and bad names', () => {
    expect(() => parseFields(['title:varchar'])).toThrow(/the type is one of string, text, integer/);
    expect(() => parseFields(['created_at:timestamp'])).toThrow(/every entity has id, tenantId, createdAt/);
    expect(() => parseFields(['title', 'title:text'])).toThrow(/title is given twice/);
    expect(() => parseFields(['1st:string'])).toThrow(/Invalid field "1st:string"/);
    expect(() => parseFields(['title:string:nullable'])).toThrow(/name:type:optional/);
  });
});

describe('generate entity', () => {
  it('writes the fields it is given into the table, the contract, the service and the tests', async () => {
    await generateEntity({ name: 'task', projectRoot: project, fields: ['title:string', 'done:boolean', 'dueAt:timestamp?'] });
    const table = await text('src/schema/tasks.ts');
    expect(table).toContain('  title: column.text().notNull(),\n  done: column.boolean().notNull(),\n  dueAt: column.timestamp(),\n  createdAt:');
    expect(table).not.toContain('name:');
    const contract = await text('src/contracts/tasks.ts');
    expect(contract).toContain('  title: z.string(),\n  done: z.boolean(),\n  dueAt: z.date().nullable(),\n  createdAt: z.date(),');
    expect(contract).toContain('export const createTaskInput = z.object({\n  title: z.string().trim().min(1).max(200),\n  done: z.boolean(),\n  dueAt: z.coerce.date().nullable().optional(),\n});');
    expect(await text('src/services/tasks/tasks.service.ts')).toContain('this.tasks.create(ctx, { title: input.title, done: input.done, dueAt: input.dueAt })');
    const unit = await text('src/services/tasks/tasks.service.test.ts');
    expect(unit).toContain("data: { title: string; done: boolean; dueAt?: Date | null }");
    expect(unit).toContain("await service.update(ctx, { id: 'id-1', title: 'Renamed' });");
    const e2e = await text('src/api/controllers/tasks.e2e.test.ts');
    expect(e2e).toContain("json: { title: 'First', done: true, dueAt: '2026-01-01T00:00:00.000Z' }");
    expect(e2e).toContain("json: { title: '', done: true, dueAt: '2026-01-01T00:00:00.000Z' }");
  });

  it('tests a non-text first field with values of its own type', () => {
    const files = entityFiles(names('reading'), parseFields(['value:number', 'at:timestamp']));
    const e2e = files['src/api/controllers/readings.e2e.test.ts'] as string;
    expect(e2e).toContain("json: { value: 2.5 } });");
    expect(e2e).toContain(".toMatchObject({ value: 1.5 });");
    expect(e2e).toContain("json: { value: 'many', at: '2026-01-01T00:00:00.000Z' }");
    expect(files['src/services/readings/readings.service.test.ts']).toContain("expect(repo.update).toHaveBeenCalledWith(ctx, 'id-1', { value: 2.5 });");
  });

  it('is the same name-only entity as before without fields', () => {
    const files = entityFiles(names('note'));
    expect(files['src/schema/notes.ts']).toContain('  tenantId: column.text().notNull(),\n  name: column.text().notNull(),\n  createdAt:');
    expect(files['src/services/notes/notes.service.ts']).toContain('return this.notes.create(ctx, { name: input.name });');
    expect(files['src/api/controllers/notes.e2e.test.ts']).toContain("json: { name: 'Private' }");
  });

  it('keeps nothing in a search index unless it is asked to', async () => {
    await generateEntity({ name: 'task', projectRoot: project, fields: ['title:string'] });
    expect(existsSync(join(project, 'src/search/tasks.ts'))).toBe(false);
    expect(await text('src/search/index.ts')).not.toContain('tasksIndex');
    expect(await text('src/services/index.ts')).toContain('registerTasksHandlers(communication, new TasksService(new TasksRepository(deps.db)));');
    for (const file of ['src/services/tasks/tasks.service.ts', 'src/contracts/tasks.ts', 'src/api/controllers/tasks.controller.ts']) {
      expect(await text(file)).not.toMatch(/search/i);
    }
  });

  it('with search, keeps it in an index of its text fields that its service updates with every write', async () => {
    const result = await generateEntity({ name: 'task', projectRoot: project, search: true, fields: ['done:boolean', 'title:string', 'body:text?'] });
    expect(result.created).toContain('src/search/tasks.ts');
    expect(result.updated).toContain('src/search/index.ts');
    const index = await text('src/search/tasks.ts');
    expect(index).toContain("export const tasksIndex: SearchIndex = {\n  name: 'tasks',\n  fields: [{ name: 'title', type: 'string' }, { name: 'body', type: 'string' }],\n};");
    expect(index).toContain('return { id: task.id, title: task.title, body: task.body };');
    expect(await text('src/search/index.ts')).toMatch(/import \{ notesIndex \} from '\.\/notes';\nimport \{ tasksIndex \} from '\.\/tasks';\n\/\/ mariachi:imports[\s\S]*\[\n {2}notesIndex,\n {2}tasksIndex,\n {2}\/\/ mariachi:search\n\];/);
    expect(await text('src/services/index.ts')).toContain('registerTasksHandlers(communication, new TasksService(new TasksRepository(deps.db), deps.search, deps.db));');
    const service = await text('src/services/tasks/tasks.service.ts');
    expect(service).toMatch(/return withTransaction\(this\.db, ctx, async \(\) => \{\n {6}const task = await this\.tasks\.create\(ctx, [^\n]+\);\n {6}await this\.search\.indexDocument\(ctx, tasksIndex\.name, taskDocument\(task\)\);/);
    expect(service).toMatch(/await this\.tasks\.softDelete\(ctx, id\);\n {6}await this\.search\.removeDocument\(ctx, tasksIndex\.name, id\);/);
    expect(service).toContain("const rows = await this.tasks.findMany(ctx, [{ field: 'id', op: 'in', value: ids }]);");
    expect(await text('src/contracts/tasks.ts')).toContain("'tasks.search': { input: z.input<typeof searchTasksInput>; output: TaskList };");
    expect(await text('src/services/tasks/tasks.handler.ts')).toContain("communication.register('tasks.search', {\n    schema: { input: searchTasksInput, output: taskListSchema },\n    handler: (ctx, input) => service.find(ctx, input),");
    expect(await text('src/api/controllers/tasks.controller.ts')).toContain("{ schema: { query: searchTasksInput, response: taskListSchema }, summary: 'Search tasks' },");
    // The tests search by the first text field
    expect(await text('src/services/tasks/tasks.service.test.ts')).toContain("expect(search.indexDocument).toHaveBeenCalledWith(ctx, 'tasks', { id: 'id-1', title: 'First', body: 'First' });");
    const e2e = await text('src/api/controllers/tasks.e2e.test.ts');
    expect(e2e).toContain("const id = await create(ada, { done: true, title: 'Wool hat for winter', body: 'First' });");
    expect(e2e).toContain("json: { title: 'Linen shirt' }");
  });

  it('refuses to index an entity with no text to search, and writes nothing', async () => {
    await expect(generateEntity({ name: 'reading', projectRoot: project, search: true, fields: ['value:number'] })).rejects.toMatchObject({ code: 'create/nothing-to-search' });
    expect(existsSync(join(project, 'src/schema/readings.ts'))).toBe(false);
  });

  it('tells a project made before the search markers what to add by hand', async () => {
    await writeFile(join(project, 'src/search/index.ts'), "import type { SearchIndex } from '@mariachi/search';\n\nexport const searchIndexes: SearchIndex[] = [];\n");
    const result = await generateEntity({ name: 'task', projectRoot: project, search: true, fields: ['title:string'] });
    expect(result.notes).toEqual(expect.arrayContaining([
      "src/search/index.ts has no \"mariachi:imports\" marker; add manually: import { tasksIndex } from './tasks';",
      'src/search/index.ts has no "mariachi:search" marker; add manually: tasksIndex,',
    ]));
  });

  it('names its table, routes and procedures with the plural', async () => {
    await generateEntity({ name: 'person', projectRoot: project });
    expect(await text('src/schema/people.ts')).toContain("defineTable('people'");
    expect(await text('src/services/index.ts')).toContain('registerPeopleHandlers(communication, new PeopleService(new PeopleRepository(deps.db)));');
    await generateEntity({ name: 'cactus', plural: 'cacti', projectRoot: project });
    expect(await text('src/contracts/cacti.ts')).toContain("'cacti.create': { input: CreateCactusInput; output: CactusDto };");
  });
});

describe('generate event and subscriber', () => {
  it('writes the event, its test and, asked for, a subscriber registered in src/events/index.ts', async () => {
    const result = await generateEvent({ name: 'billing.invoice.paid', projectRoot: project, subscriber: 'send-receipt' });
    expect(result.created).toEqual([
      'src/events/billing-invoice-paid.event.ts',
      'src/events/billing-invoice-paid.event.test.ts',
      'src/events/subscribers/send-receipt.subscriber.ts',
      'src/events/subscribers/send-receipt.subscriber.test.ts',
    ]);
    const event = await text('src/events/billing-invoice-paid.event.ts');
    expect(event).toContain("export const billingInvoicePaid = defineEvent('billing.invoice.paid', { schema: billingInvoicePaidPayload });");
    expect(event).toContain('await outbox.add(ctx, billingInvoicePaid, { id });');
    const subscriber = await text('src/events/subscribers/send-receipt.subscriber.ts');
    expect(subscriber).toContain("events.subscribe(billingInvoicePaid, sendReceipt(deps), { group: 'send-receipt', name: 'send-receipt' });");
    const index = await text('src/events/index.ts');
    expect(index).toContain("import { registerSendReceiptSubscriber } from './subscribers/send-receipt.subscriber';");
    expect(index).toMatch(/registerSendReceiptSubscriber\(events, deps\);\n\s+\/\/ mariachi:subscribers/);
  });

  it('names a subscriber after its event when it is given no name', async () => {
    await generateEvent({ name: 'users.user.signed-up', projectRoot: project, subscriber: true });
    expect(existsSync(join(project, 'src/events/subscribers/on-users-user-signed-up.subscriber.ts'))).toBe(true);
    await generateEvent({ name: 'users.user.deleted', projectRoot: project });
    const result = await generateSubscriber({ event: 'users.user.deleted', projectRoot: project });
    expect(result.created).toContain('src/events/subscribers/on-users-user-deleted.subscriber.ts');
  });

  it('refuses an event name that is not lowercase and dotted, and a subscriber to an event that does not exist', async () => {
    await expect(generateEvent({ name: 'InvoicePaid', projectRoot: project })).rejects.toThrow(/like billing\.invoice\.paid/);
    await expect(generateEvent({ name: 'paid', projectRoot: project })).rejects.toThrow(/Invalid event name/);
    await expect(generateSubscriber({ event: 'billing.invoice.voided', projectRoot: project })).rejects.toMatchObject({
      code: 'create/no-event',
      message: expect.stringContaining('mariachi generate event billing.invoice.voided'),
    });
  });

  it('writes nothing when the subscriber it was asked for exists', async () => {
    await generateEvent({ name: 'billing.invoice.paid', projectRoot: project, subscriber: 'notify' });
    await expect(generateEvent({ name: 'billing.invoice.voided', projectRoot: project, subscriber: 'notify' })).rejects.toMatchObject({ code: 'create/file-exists' });
    expect(existsSync(join(project, 'src/events/billing-invoice-voided.event.ts'))).toBe(false);
  });

  it('brings what events need into a project made before them, and says what to add to app.ts', async () => {
    await rm(join(project, 'src/events'), { recursive: true });
    await rm(join(project, 'src/schema/events.ts'));
    const schema = (await text('src/schema/index.ts')).replace("export * from './events';\n", '');
    await writeFile(join(project, 'src/schema/index.ts'), schema);
    await writeFile(join(project, 'src/app.ts'), '// an app.ts of its own\n');
    const pkg = JSON.parse(await text('package.json'));
    const { '@mariachi/events': _events, ...dependencies } = pkg.dependencies;
    await writeFile(join(project, 'package.json'), JSON.stringify({ ...pkg, dependencies }));

    const result = await generateEvent({ name: 'billing.invoice.paid', projectRoot: project, subscriber: 'send-receipt' });
    expect(result.created).toEqual(expect.arrayContaining(['src/events/index.ts', 'src/schema/events.ts']));
    expect(await text('src/schema/index.ts')).toContain("export * from './events';");
    expect(await text('src/events/index.ts')).toContain('registerSendReceiptSubscriber(events, deps);');
    expect(JSON.parse(await text('package.json')).dependencies['@mariachi/events']).toBe(pkg.dependencies['@mariachi/core']);
    expect(result.notes.join('\n')).toMatch(/src\/app\.ts does not set up events yet[\s\S]*run pnpm install/);
  });
});

describe('generate webhook', () => {
  it('writes the controller, its contract, test and job, and registers the webhook, the job and the dedup table', async () => {
    const result = await generateWebhook({ name: 'acme', projectRoot: project });
    expect(result.created).toEqual([
      'src/contracts/acme-webhook.ts',
      'src/webhooks/acme.controller.ts',
      'src/webhooks/acme.controller.test.ts',
      'src/jobs/acme-webhook.job.ts',
      'src/schema/webhooks.ts',
    ]);
    const controller = await text('src/webhooks/acme.controller.ts');
    expect(controller).toContain("this.auth = new StandardWebhookAuth({ secret, provider: 'acme' });");
    expect(controller).toContain("this.post('/events', { mode: 'queue', jobName: 'acme-webhook' }");
    expect(controller).toContain('if (!parsed.success) throw fromZodError(parsed.error,');
    const index = await text('src/webhooks/index.ts');
    expect(index).toContain("import { AcmeWebhookController } from './acme.controller';");
    expect(index).toContain("...(await signed('ACME_WEBHOOK_SECRET', (secret) => new AcmeWebhookController(secret))),");
    expect(await text('src/jobs/index.ts')).toMatch(/acmeWebhookJob,\n\s+\/\/ mariachi:jobs/);
    expect(await text('src/schema/index.ts')).toContain("export * from './webhooks';");
    expect(await text('.env.example')).toContain('# WEBHOOK_PORT=3002\n# Acme');
    expect(result.notes.join('\n')).toContain('POST /webhooks/acme/events on WEBHOOK_PORT');
  });

  it('adds the table and the port once, and a secret for each webhook', async () => {
    await generateWebhook({ name: 'acme', projectRoot: project });
    const second = await generateWebhook({ name: 'payment-provider', projectRoot: project });
    expect(second.created).not.toContain('src/schema/webhooks.ts');
    const env = await text('.env.example');
    expect(env.match(/WEBHOOK_PORT/g)).toHaveLength(1);
    expect(env).toContain('# PAYMENT_PROVIDER_WEBHOOK_SECRET=');
    expect((await text('src/schema/index.ts')).match(/'\.\/webhooks'/g)).toHaveLength(1);
  });
});

describe('generate procedure', () => {
  it("adds the contract, method, registration and test to an entity's service, found by its singular", async () => {
    const result = await generateProcedure({ service: 'note', name: 'archive', projectRoot: project });
    expect(result.created).toEqual(['src/services/notes/notes.archive.test.ts']);
    expect(result.updated).toEqual(['src/services/notes/notes.service.ts', 'src/services/notes/notes.handler.ts', 'src/contracts/notes.ts']);
    const service = await text('src/services/notes/notes.service.ts');
    expect(service).toContain('import type { CreateNoteInput, ListNotesInput, SearchNotesInput, UpdateNoteInput, NotesArchiveInput, NotesArchiveOutput }');
    expect(service).toMatch(/\n\n {2}async archive\(ctx: Context, input: NotesArchiveInput\): Promise<NotesArchiveOutput> \{\n[\s\S]*\n {2}\}\n {2}\/\/ mariachi:procedures\n\}/);
    const handler = await text('src/services/notes/notes.handler.ts');
    expect(handler).toContain('  notesArchiveInput,\n  notesArchiveOutput,\n} from');
    expect(handler).toMatch(/ {2}communication\.register\('notes\.archive', \{\n {4}schema: \{ input: notesArchiveInput, output: notesArchiveOutput \},\n {4}handler: \(ctx, input\) => service\.archive\(ctx, input\),\n {2}\}\);\n {2}\/\/ mariachi:procedures/);
    expect(await text('src/contracts/notes.ts')).toContain("    'notes.archive': { input: NotesArchiveInput; output: NotesArchiveOutput };");
    const test = await text('src/services/notes/notes.archive.test.ts');
    expect(test).toContain('registerNotesHandlers(communication, Object.create(NotesService.prototype) as NotesService);');
  });

  it('builds a service with no dependencies in its test, and names the procedure in the camel case of its folder', async () => {
    await generateService({ name: 'billing-report', projectRoot: project });
    await generateProcedure({ service: 'billing-report', name: 'summarize-month', projectRoot: project });
    const test = await text('src/services/billing-report/billing-report.summarize-month.test.ts');
    expect(test).toContain('registerBillingReportHandlers(communication, new BillingReportService());');
    expect(test).toContain("setup().call(ctx, 'billingReport.summarizeMonth', { id: 'abc' })");
  });

  it('finds where to add in a service written before the markers', async () => {
    await generateService({ name: 'billing-report', projectRoot: project });
    for (const file of ['src/services/billing-report/billing-report.service.ts', 'src/services/billing-report/billing-report.handler.ts']) {
      await writeFile(join(project, file), `${(await text(file)).replace(/ *\/\/ mariachi:procedures\n/, '')}\nexport const after = 1;\n`);
    }
    await generateProcedure({ service: 'billing-report', name: 'refresh', projectRoot: project });
    const service = await text('src/services/billing-report/billing-report.service.ts');
    expect(service).toMatch(/async refresh\(ctx: Context, input: BillingReportRefreshInput\)[\s\S]*\n {2}\}\n\}\n\nexport const after = 1;/);
    const handler = await text('src/services/billing-report/billing-report.handler.ts');
    expect(handler).toMatch(/communication\.register\('billingReport\.refresh'[\s\S]*\n {2}\}\);\n\}\n\nexport const after = 1;/);
  });

  it('refuses a service that does not exist, saying which do, and a procedure that does', async () => {
    await expect(generateProcedure({ service: 'invoices', name: 'void', projectRoot: project })).rejects.toMatchObject({
      code: 'create/no-service',
      message: expect.stringContaining('there are: notes'),
    });
    await expect(generateProcedure({ service: 'notes', name: 'create', projectRoot: project })).rejects.toMatchObject({ code: 'create/procedure-exists' });
    await generateProcedure({ service: 'notes', name: 'archive', projectRoot: project });
    const before = await text('src/contracts/notes.ts');
    await expect(generateProcedure({ service: 'notes', name: 'archive', projectRoot: project })).rejects.toMatchObject({ code: 'create/procedure-exists' });
    expect(await text('src/contracts/notes.ts')).toBe(before);
  });
});

describe('the project', () => {
  it('sets up events and webhooks in app.ts, whichever sign-in it has', () => {
    for (const files of [projectFiles('acme-app', '^0.1.0'), projectFiles('acme-app', '^0.1.0', 'gotrue', { organizations: true, ui: true })]) {
      const app = files['src/app.ts'] as string;
      expect(app).toContain("new DefaultEvents({ bus: createEventBus({ adapter: 'memory', logger }), source: config.serviceName }, instrumentation)");
      expect(app).toContain("lifecycle.manage('outbox-relay', new OutboxRelay({ db: database.db, target: events, logger }), { priority: 95 });");
      expect(app).toContain('registerServices(communication, { db: database.db, jobs, search, events, outbox });');
      expect(app).toContain('registerSubscribers(events, { communication, jobs });');
      expect(app).toContain('const webhooks = await setupWebhooks({ config, secrets, lifecycle, logger, tracer, db: database.db, jobQueue: queue, communication });');
      expect(app).toMatch(/return \{[\s\S]*events,\n\s+webhooks,/);
      const pkg = JSON.parse(files['package.json'] as string);
      expect(pkg.dependencies).toHaveProperty('@mariachi/events');
      expect(pkg.dependencies).toHaveProperty('@mariachi/webhooks');
      expect(files['src/schema/index.ts']).toContain("export * from './events';");
      expect(files['src/events/index.ts']).toContain('// mariachi:subscribers');
      expect(files['src/webhooks/index.ts']).toContain('// mariachi:webhooks');
    }
  });

  it('keeps the example notes in a search index, as the worked example of deps.search', async () => {
    expect(await text('src/search/index.ts')).toMatch(/\[\n {2}notesIndex,\n {2}\/\/ mariachi:search\n\];/);
    expect(await text('src/search/notes.ts')).toContain("name: 'notes',");
    expect(await text('src/services/index.ts')).toContain('new NotesService(new NotesRepository(deps.db), deps.search, deps.db)');
    expect(await text('src/api/controllers/notes.controller.ts')).toContain("this.call<NoteList>(ctx, 'notes.search', query)");
    const bare = join(root, 'bare');
    await createProject({ name: 'bare-app', outputDir: bare, example: false });
    expect(await readFile(join(bare, 'src/search/index.ts'), 'utf-8')).toContain('export const searchIndexes: SearchIndex[] = [\n  // mariachi:search\n];');
    expect(existsSync(join(bare, 'src/search/notes.ts'))).toBe(false);
  });

  it('starts the end-to-end app with its webhooks on a free port', () => {
    expect(projectFiles('acme-app', '^0.1.0')['src/testing/e2e.ts']).toContain("WEBHOOK_PORT: '0',");
  });
});

describe('writeFiles insertions', () => {
  it('inserts several lines at the marker, each keeping its own indentation', async () => {
    await writeFile(join(root, 'reg.ts'), 'function f() {\n    // mark\n}\n');
    await writeFiles(root, {}, [{ file: 'reg.ts', marker: 'mark', line: 'if (a) {\n  b();\n}' }]);
    expect(await readFile(join(root, 'reg.ts'), 'utf-8')).toBe('function f() {\n    if (a) {\n      b();\n    }\n    // mark\n}\n');
  });

  it('falls back to the end of the block it names, and notes it when there is none', async () => {
    await writeFile(join(root, 'reg.ts'), 'export class A {\n  x() {}\n}\n');
    const result = await writeFiles(root, {}, [
      { file: 'reg.ts', marker: 'mark', line: 'y() {}', orBeforeEndOf: /^export class A\b/ },
      { file: 'reg.ts', marker: 'mark', line: 'z() {}', orBeforeEndOf: /^export class B\b/ },
    ]);
    expect(await readFile(join(root, 'reg.ts'), 'utf-8')).toBe('export class A {\n  x() {}\n  y() {}\n}\n');
    expect(result.notes).toEqual(['reg.ts has no "mark" marker; add manually: z() {}']);
  });
});

describe('eventNames', () => {
  it('derives file and identifier names from the dotted name', () => {
    expect(eventNames('users.user.signed-up')).toEqual({ event: 'users.user.signed-up', kebab: 'users-user-signed-up', camel: 'usersUserSignedUp', pascal: 'UsersUserSignedUp' });
  });
});
