import { DEFAULT_FIELDS, type EntityField, type FieldType } from '../fields';
import { MARKERS } from '../layout';
import type { Names } from '../names';

/** How each field type is written in the table, the contract and the tests. */
interface FieldKind {
  column: string;
  /** In the output schema. */
  zod: string;
  /** In the create input. */
  input: string;
  /** The entity's TypeScript type. */
  ts: string;
  /** The type a client sees in JSON. */
  json: string;
  /** Two different values, as TypeScript (the unit test) and as JSON (the end-to-end test). */
  values: [string, string];
  jsonValues: [string, string];
  /** A value the create input refuses. */
  invalid: string;
}

const text = (input: string): FieldKind => ({
  column: 'column.text()',
  zod: 'z.string()',
  input,
  ts: 'string',
  json: 'string',
  values: ["'First'", "'Renamed'"],
  jsonValues: ["'First'", "'Renamed'"],
  invalid: "''",
});

const KINDS: Record<FieldType, FieldKind> = {
  string: text('z.string().trim().min(1).max(200)'),
  text: text('z.string().trim().min(1)'),
  integer: { column: 'column.integer()', zod: 'z.number().int()', input: 'z.number().int()', ts: 'number', json: 'number', values: ['1', '2'], jsonValues: ['1', '2'], invalid: '1.5' },
  number: { column: 'column.double()', zod: 'z.number()', input: 'z.number()', ts: 'number', json: 'number', values: ['1.5', '2.5'], jsonValues: ['1.5', '2.5'], invalid: "'many'" },
  boolean: { column: 'column.boolean()', zod: 'z.boolean()', input: 'z.boolean()', ts: 'boolean', json: 'boolean', values: ['true', 'false'], jsonValues: ['true', 'false'], invalid: "'yes'" },
  timestamp: {
    column: 'column.timestamp()',
    zod: 'z.date()',
    input: 'z.coerce.date()',
    ts: 'Date',
    json: 'string',
    values: ["new Date('2026-01-01T00:00:00.000Z')", "new Date('2026-02-01T00:00:00.000Z')"],
    jsonValues: ["'2026-01-01T00:00:00.000Z'", "'2026-02-01T00:00:00.000Z'"],
    invalid: "'not-a-date'",
  },
  date: { column: 'column.date()', zod: 'z.string()', input: 'z.string().date()', ts: 'string', json: 'string', values: ["'2026-01-01'", "'2026-02-01'"], jsonValues: ["'2026-01-01'", "'2026-02-01'"], invalid: "'not-a-date'" },
  uuid: {
    column: 'column.uuid()',
    zod: 'z.string().uuid()',
    input: 'z.string().uuid()',
    ts: 'string',
    json: 'string',
    values: ["'00000000-0000-4000-8000-000000000001'", "'00000000-0000-4000-8000-000000000002'"],
    jsonValues: ["'00000000-0000-4000-8000-000000000001'", "'00000000-0000-4000-8000-000000000002'"],
    invalid: "'not-a-uuid'",
  },
};

const kind = (f: EntityField) => KINDS[f.type];
const lines = (fields: readonly EntityField[], line: (f: EntityField) => string) => fields.map((f) => `  ${line(f)}\n`).join('');
/** `a: x, b: y` from each field's value; `first` stands in for the first field's. */
const props = (fields: readonly EntityField[], value: (f: EntityField) => string, first?: string) =>
  fields.map((f, i) => `${f.key}: ${i === 0 && first !== undefined ? first : value(f)}`);
/** An object literal: on one line when it is short, else one property a line under `indent`. */
const obj = (entries: string[], indent: string) => {
  const line = `{ ${entries.join(', ')} }`;
  return line.length <= 80 ? line : `{\n${entries.map((e) => `${indent}  ${e},\n`).join('')}${indent}}`;
};

/**
 * Files for a full vertical slice (table → repository → service → handlers → controller → test).
 * `fields` are the entity's own columns; without them it has a `name`.
 */
export function entityFiles(n: Names, fields: readonly EntityField[] = DEFAULT_FIELDS): Record<string, string> {
  const dir = `src/services/${n.pluralKebab}`;
  return {
    [`src/schema/${n.pluralKebab}.ts`]: schema(n, fields),
    [`src/contracts/${n.pluralKebab}.ts`]: contracts(n, fields),
    [`${dir}/${n.pluralKebab}.repository.ts`]: repository(n),
    [`${dir}/${n.pluralKebab}.service.ts`]: service(n, fields),
    [`${dir}/${n.pluralKebab}.handler.ts`]: handler(n),
    [`${dir}/${n.pluralKebab}.service.test.ts`]: serviceTest(n, fields),
    [`src/api/controllers/${n.pluralKebab}.controller.ts`]: controller(n),
    [`src/api/controllers/${n.pluralKebab}.e2e.test.ts`]: e2eTest(n, fields),
  };
}

const schema = (n: Names, fields: readonly EntityField[]) => `import { column, defineTable, type InferEntity } from '@mariachi/database';

/** Tenant-scoped (tenantId) and soft-deleted (deletedAt); repositories enforce both. */
export const ${n.pluralCamel}Table = defineTable('${n.pluralSnake}', {
  id: column.uuid().primaryKey().defaultRandom(),
  tenantId: column.text().notNull(),
${lines(fields, (f) => `${f.key}: ${kind(f).column}${f.optional ? '' : '.notNull()'},`)}  createdAt: column.timestamp().notNull().defaultNow(),
  updatedAt: column.timestamp().notNull().defaultNow(),
  deletedAt: column.timestamp(),
});

export type ${n.pascal} = InferEntity<typeof ${n.pluralCamel}Table>;
`;

const contracts = (n: Names, fields: readonly EntityField[]) => `import { z } from 'zod';

export const ${n.camel}Schema = z.object({
  id: z.string().uuid(),
${lines(fields, (f) => `${f.key}: ${kind(f).zod}${f.optional ? '.nullable()' : ''},`)}  createdAt: z.date(),
  updatedAt: z.date(),
});

export const create${n.pascal}Input = z.object({
${lines(fields, (f) => `${f.key}: ${kind(f).input}${f.optional ? '.nullable().optional()' : ''},`)}});

export const update${n.pascal}Body = create${n.pascal}Input.partial();

export const update${n.pascal}Input = update${n.pascal}Body.extend({ id: z.string().uuid() });

export const ${n.camel}IdInput = z.object({ id: z.string().uuid() });

export const list${n.pluralPascal}Input = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  cursor: z.string().optional(),
});

export const ${n.camel}ListSchema = z.object({
  data: z.array(${n.camel}Schema),
  nextCursor: z.string().nullable(),
  hasMore: z.boolean(),
});

export type ${n.pascal}Dto = z.infer<typeof ${n.camel}Schema>;
export type ${n.pascal}List = z.infer<typeof ${n.camel}ListSchema>;
export type Create${n.pascal}Input = z.infer<typeof create${n.pascal}Input>;
export type Update${n.pascal}Input = z.infer<typeof update${n.pascal}Input>;
export type List${n.pluralPascal}Input = z.infer<typeof list${n.pluralPascal}Input>;

declare module '@mariachi/communication' {
  interface Procedures {
    '${n.pluralCamel}.create': { input: Create${n.pascal}Input; output: ${n.pascal}Dto };
    '${n.pluralCamel}.get': { input: z.infer<typeof ${n.camel}IdInput>; output: ${n.pascal}Dto };
    '${n.pluralCamel}.list': { input: z.input<typeof list${n.pluralPascal}Input>; output: ${n.pascal}List };
    '${n.pluralCamel}.update': { input: Update${n.pascal}Input; output: ${n.pascal}Dto };
    '${n.pluralCamel}.delete': { input: z.infer<typeof ${n.camel}IdInput>; output: void };
  }
}
`;

const repository = (n: Names) => `import { DrizzleRepository, type DrizzleDb } from '@mariachi/database-postgres';
import { ${n.pluralCamel}Table, type ${n.pascal} } from '../../schema/${n.pluralKebab}';

export class ${n.pluralPascal}Repository extends DrizzleRepository<${n.pascal}> {
  constructor(db: DrizzleDb) {
    super(${n.pluralCamel}Table, db);
  }
}
`;

const service = (n: Names, fields: readonly EntityField[]) => `import type { Context, CursorPaginatedResult } from '@mariachi/core';
import type { Create${n.pascal}Input, List${n.pluralPascal}Input, Update${n.pascal}Input } from '../../contracts/${n.pluralKebab}';
import type { ${n.pascal} } from '../../schema/${n.pluralKebab}';
import type { ${n.pluralPascal}Repository } from './${n.pluralKebab}.repository';

export class ${n.pluralPascal}Service {
  constructor(private readonly ${n.pluralCamel}: ${n.pluralPascal}Repository) {}

  create(ctx: Context, input: Create${n.pascal}Input): Promise<${n.pascal}> {
    return this.${n.pluralCamel}.create(ctx, ${obj(props(fields, (f) => `input.${f.key}`), '    ')});
  }

  get(ctx: Context, id: string): Promise<${n.pascal}> {
    return this.${n.pluralCamel}.getById(ctx, id);
  }

  list(ctx: Context, input: List${n.pluralPascal}Input): Promise<CursorPaginatedResult<${n.pascal}>> {
    return this.${n.pluralCamel}.paginateCursor(ctx, { limit: input.limit, cursor: input.cursor });
  }

  update(ctx: Context, input: Update${n.pascal}Input): Promise<${n.pascal}> {
    const { id, ...patch } = input;
    return this.${n.pluralCamel}.update(ctx, id, patch);
  }

  async remove(ctx: Context, id: string): Promise<void> {
    await this.${n.pluralCamel}.softDelete(ctx, id);
  }
  // ${MARKERS.procedures}
}
`;

const handler = (n: Names) => `import type { CommunicationLayer } from '@mariachi/communication';
import { z } from 'zod';
import {
  ${n.camel}IdInput,
  ${n.camel}ListSchema,
  ${n.camel}Schema,
  create${n.pascal}Input,
  list${n.pluralPascal}Input,
  update${n.pascal}Input,
} from '../../contracts/${n.pluralKebab}';
import type { ${n.pluralPascal}Service } from './${n.pluralKebab}.service';

export function register${n.pluralPascal}Handlers(communication: CommunicationLayer, service: ${n.pluralPascal}Service): void {
  communication.register('${n.pluralCamel}.create', {
    schema: { input: create${n.pascal}Input, output: ${n.camel}Schema },
    handler: (ctx, input) => service.create(ctx, input),
  });
  communication.register('${n.pluralCamel}.get', {
    schema: { input: ${n.camel}IdInput, output: ${n.camel}Schema },
    handler: (ctx, input) => service.get(ctx, input.id),
  });
  communication.register('${n.pluralCamel}.list', {
    schema: { input: list${n.pluralPascal}Input, output: ${n.camel}ListSchema },
    handler: (ctx, input) => service.list(ctx, input),
  });
  communication.register('${n.pluralCamel}.update', {
    schema: { input: update${n.pascal}Input, output: ${n.camel}Schema },
    handler: (ctx, input) => service.update(ctx, input),
  });
  communication.register('${n.pluralCamel}.delete', {
    schema: { input: ${n.camel}IdInput, output: z.void() },
    handler: (ctx, input) => service.remove(ctx, input.id),
  });
  // ${MARKERS.procedures}
}
`;

const serviceTest = (n: Names, fields: readonly EntityField[]) => {
  const first = fields[0];
  const values = props(fields, (f) => kind(f).values[0]);
  const created = obj(values, '    ');
  const renamed = `${first.key}: ${kind(first).values[1]}`;
  const shape = fields.map((f) => `${f.key}${f.optional ? '?' : ''}: ${kind(f).ts}${f.optional ? ' | null' : ''}`).join('; ');
  return `import { describe, expect, it, vi } from 'vitest';
import { createContext, type Logger } from '@mariachi/core';
import type { ${n.pluralPascal}Repository } from './${n.pluralKebab}.repository';
import { ${n.pluralPascal}Service } from './${n.pluralKebab}.service';

const logger = { debug() {}, info() {}, warn() {}, error() {}, child: () => logger } as unknown as Logger;
const ctx = createContext({ logger, tenantId: 'tenant-1', userId: 'user-1' });

function setup() {
  const repo = {
    create: vi.fn(async (_ctx: unknown, data: { ${shape} }) => ({ id: 'id-1', tenantId: 'tenant-1', ...data })),
    update: vi.fn(async (_ctx: unknown, id: string, data: object) => ({ id, ...data })),
    softDelete: vi.fn(async () => undefined),
  };
  return { repo, service: new ${n.pluralPascal}Service(repo as unknown as ${n.pluralPascal}Repository) };
}

describe('${n.pluralPascal}Service', () => {
  it('creates within the caller context', async () => {
    const { repo, service } = setup();
    const created = await service.create(ctx, ${created});
    expect(created).toMatchObject(${obj(["id: 'id-1'", ...values], '    ')});
    expect(repo.create).toHaveBeenCalledWith(ctx, ${created});
  });

  it('updates only the provided fields', async () => {
    const { repo, service } = setup();
    await service.update(ctx, { id: 'id-1', ${renamed} });
    expect(repo.update).toHaveBeenCalledWith(ctx, 'id-1', { ${renamed} });
  });

  it('soft deletes', async () => {
    const { repo, service } = setup();
    await service.remove(ctx, 'id-1');
    expect(repo.softDelete).toHaveBeenCalledWith(ctx, 'id-1');
  });
});
`;
};

const controller = (n: Names) => `import { BaseController } from '@mariachi/api-facade';
import {
  ${n.camel}IdInput,
  ${n.camel}ListSchema,
  ${n.camel}Schema,
  create${n.pascal}Input,
  list${n.pluralPascal}Input,
  update${n.pascal}Body,
  type ${n.pascal}Dto,
  type ${n.pascal}List,
} from '../../contracts/${n.pluralKebab}';

/** Thin HTTP layer: Zod validates the request, then a procedure does the work. */
export class ${n.pluralPascal}Controller extends BaseController {
  readonly prefix = '${n.pluralKebab}';
  readonly tags = ['${n.pluralKebab}'];

  init(): void {
    this.post(
      '/',
      { schema: { body: create${n.pascal}Input, response: ${n.camel}Schema }, status: 201, summary: 'Create a ${n.kebab.replace(/-/g, ' ')}' },
      (ctx, body) => this.call<${n.pascal}Dto>(ctx, '${n.pluralCamel}.create', body),
    );
    this.get(
      '/',
      { schema: { query: list${n.pluralPascal}Input, response: ${n.camel}ListSchema }, summary: 'List ${n.pluralKebab.replace(/-/g, ' ')}' },
      (ctx, _body, _params, query) => this.call<${n.pascal}List>(ctx, '${n.pluralCamel}.list', query),
    );
    this.get('/:id', { schema: { params: ${n.camel}IdInput, response: ${n.camel}Schema } }, (ctx, _body, params) =>
      this.call<${n.pascal}Dto>(ctx, '${n.pluralCamel}.get', params),
    );
    this.patch('/:id', { schema: { params: ${n.camel}IdInput, body: update${n.pascal}Body, response: ${n.camel}Schema } }, (ctx, body, params) =>
      this.call<${n.pascal}Dto>(ctx, '${n.pluralCamel}.update', { ...body, id: params.id }),
    );
    this.delete('/:id', { schema: { params: ${n.camel}IdInput } }, async (ctx, _body, params) => {
      await this.call(ctx, '${n.pluralCamel}.delete', params);
      return undefined;
    });
  }
}
`;

const e2eTest = (n: Names, fields: readonly EntityField[]) => {
  const first = fields[0];
  const k = kind(first);
  const isText = k.invalid === "''";
  const json = (value: string) => obj(props(fields, (f) => kind(f).jsonValues[0], value), '    ');
  const one = (value: string) => `${first.key}: ${value}`;
  const [private_, taken] = isText ? ["'Private'", "'Taken'"] : k.jsonValues;
  return `import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { startApp, type RunningApp } from '../../testing/e2e';

// Two people in two tenants
const ada = { userId: 'user-ada', tenantId: 'tenant-a' };
const lin = { userId: 'user-lin', tenantId: 'tenant-b' };
const path = '/api/${n.pluralKebab}';

let running: RunningApp;
beforeAll(async () => {
  running = await startApp();
});
afterAll(() => running?.stop());

describe('${n.pluralKebab.replace(/-/g, ' ')} over HTTP', () => {
  it('creates, reads, lists, updates and deletes', async () => {
    const created = await running.request(path, { as: ada, json: ${json(k.jsonValues[0])} });
    expect(created.status).toBe(201);
    const ${n.camel} = (await created.json()) as { id: string; ${first.key}: ${k.json}${first.optional ? ' | null' : ''} };
    expect(${n.camel}).toMatchObject({ ${one(k.jsonValues[0])} });

    const read = await running.request(\`\${path}/\${${n.camel}.id}\`, { as: ada });
    expect(await read.json()).toMatchObject({ id: ${n.camel}.id, ${one(k.jsonValues[0])} });

    const listed = (await (await running.request(path, { as: ada })).json()) as { data: Array<{ id: string }> };
    expect(listed.data.map((row) => row.id)).toContain(${n.camel}.id);

    const updated = await running.request(\`\${path}/\${${n.camel}.id}\`, { as: ada, method: 'PATCH', json: { ${one(k.jsonValues[1])} } });
    expect(await updated.json()).toMatchObject({ id: ${n.camel}.id, ${one(k.jsonValues[1])} });

    expect((await running.request(\`\${path}/\${${n.camel}.id}\`, { as: ada, method: 'DELETE' })).status).toBe(204);
    expect((await running.request(\`\${path}/\${${n.camel}.id}\`, { as: ada })).status).toBe(404);
  });

  it("keeps one tenant's rows from another", async () => {
    const created = await running.request(path, { as: ada, json: ${json(private_)} });
    const { id } = (await created.json()) as { id: string };

    expect((await running.request(\`\${path}/\${id}\`, { as: lin })).status).toBe(404);
    expect((await running.request(\`\${path}/\${id}\`, { as: lin, method: 'PATCH', json: { ${one(taken)} } })).status).toBe(404);
    expect((await running.request(\`\${path}/\${id}\`, { as: lin, method: 'DELETE' })).status).toBe(404);
    const theirs = (await (await running.request(path, { as: lin })).json()) as { data: Array<{ id: string }> };
    expect(theirs.data.map((row) => row.id)).not.toContain(id);
    expect(await (await running.request(\`\${path}/\${id}\`, { as: ada })).json()).toMatchObject({ ${one(private_)} });
  });

  it('asks for a token, and refuses one it does not know', async () => {
    expect((await running.request(path)).status).toBe(401);
    expect((await running.request(path, { headers: { authorization: 'Bearer made-up' } })).status).toBe(401);
    const token = running.auth.tokenFor(ada);
    running.auth.revoke(token);
    expect((await running.request(path, { headers: { authorization: \`Bearer \${token}\` } })).status).toBe(401);
  });

  it('refuses a body the contract rules out', async () => {
    const res = await running.request(path, { as: ada, json: ${json(k.invalid)} });
    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({ error: { code: expect.any(String) } });
  });
});
`;
};
