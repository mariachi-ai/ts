import { ConfigError } from '@mariachi/core';
import { DEFAULT_FIELDS, type EntityField, type FieldType } from '../fields';
import { LAYOUT, MARKERS } from '../layout';
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

export interface EntityOptions {
  /**
   * Keep the entity in a search index (`src/search/<plural>.ts`): its service indexes a row when it is
   * created or updated and removes it when it is deleted, in the same transaction, and
   * `<plural>.search` (`GET /<plural>/search?q=`) finds rows by the words in their text fields.
   */
  search?: boolean;
}

/** The fields a search index holds: the text ones. */
export const searchableFields = (fields: readonly EntityField[]): EntityField[] => fields.filter((f) => f.type === 'string' || f.type === 'text');

/**
 * Files for a full vertical slice (table → repository → service → handlers → controller → test).
 * `fields` are the entity's own columns; without them it has a `name`.
 */
export function entityFiles(n: Names, fields: readonly EntityField[] = DEFAULT_FIELDS, options: EntityOptions = {}): Record<string, string> {
  const search = options.search ?? false;
  if (search && searchableFields(fields).length === 0) {
    throw new ConfigError('create/nothing-to-search', `--search indexes an entity's text fields, and ${n.kebab} has none: give it a string or text field`);
  }
  const dir = `src/services/${n.pluralKebab}`;
  return {
    [`src/schema/${n.pluralKebab}.ts`]: schema(n, fields),
    [`src/contracts/${n.pluralKebab}.ts`]: contracts(n, fields, search),
    [`${dir}/${n.pluralKebab}.repository.ts`]: repository(n),
    [`${dir}/${n.pluralKebab}.service.ts`]: service(n, fields, search),
    [`${dir}/${n.pluralKebab}.handler.ts`]: handler(n, search),
    [`${dir}/${n.pluralKebab}.service.test.ts`]: serviceTest(n, fields, search),
    [`src/api/controllers/${n.pluralKebab}.controller.ts`]: controller(n, search),
    [`src/api/controllers/${n.pluralKebab}.e2e.test.ts`]: e2eTest(n, fields, search),
    ...(search ? { [searchIndexFile(n)]: searchIndex(n, fields) } : {}),
  };
}

/** Where an entity's search index is defined. */
export const searchIndexFile = (n: Names): string => `${LAYOUT.searchDir}/${n.pluralKebab}.ts`;

const searchIndex = (n: Names, fields: readonly EntityField[]) => {
  const text = searchableFields(fields);
  const defs = text.map((f) => `{ name: '${f.key}', type: 'string' }`);
  const fieldList = `[${defs.join(', ')}]`.length <= 80 ? `[${defs.join(', ')}]` : `[\n${defs.map((d) => `    ${d},\n`).join('')}  ]`;
  return `import type { SearchDocument, SearchIndex } from '@mariachi/search';
import type { ${n.pascal} } from '../schema/${n.pluralKebab}';

/**
 * What of a ${n.kebab.replace(/-/g, ' ')} can be searched: its text fields. Listed in ./index.ts, so the index is created at
 * start. ${n.pluralPascal}Service keeps it in step with the table: a row is indexed when it is created
 * or updated and removed when it is deleted, in the same transaction.
 *
 * The index lives in the app's Postgres (@mariachi/search/postgres) and is tenant-scoped. A change to
 * the fields here takes effect when you reindex (node_modules/@mariachi/core/docs/search.md).
 */
export const ${n.pluralCamel}Index: SearchIndex = {
  name: '${n.pluralSnake}',
  fields: ${fieldList},
};

/** A ${n.kebab.replace(/-/g, ' ')} as the index keeps it: its id and the text that is searched. Hits are read back from the table. */
export function ${n.camel}Document(${n.camel}: ${n.pascal}): SearchDocument {
  return ${obj([`id: ${n.camel}.id`, ...text.map((f) => `${f.key}: ${n.camel}.${f.key}`)], '  ')};
}
`;
};

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

const contracts = (n: Names, fields: readonly EntityField[], search: boolean) => `import { z } from 'zod';

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
${search ? searchContract(n) : ''}
export type ${n.pascal}Dto = z.infer<typeof ${n.camel}Schema>;
export type ${n.pascal}List = z.infer<typeof ${n.camel}ListSchema>;
export type Create${n.pascal}Input = z.infer<typeof create${n.pascal}Input>;
export type Update${n.pascal}Input = z.infer<typeof update${n.pascal}Input>;
export type List${n.pluralPascal}Input = z.infer<typeof list${n.pluralPascal}Input>;
${search ? `export type Search${n.pluralPascal}Input = z.infer<typeof search${n.pluralPascal}Input>;\n` : ''}
declare module '@mariachi/communication' {
  interface Procedures {
    '${n.pluralCamel}.create': { input: Create${n.pascal}Input; output: ${n.pascal}Dto };
    '${n.pluralCamel}.get': { input: z.infer<typeof ${n.camel}IdInput>; output: ${n.pascal}Dto };
    '${n.pluralCamel}.list': { input: z.input<typeof list${n.pluralPascal}Input>; output: ${n.pascal}List };
${search ? `    '${n.pluralCamel}.search': { input: z.input<typeof search${n.pluralPascal}Input>; output: ${n.pascal}List };\n` : ''}    '${n.pluralCamel}.update': { input: Update${n.pascal}Input; output: ${n.pascal}Dto };
    '${n.pluralCamel}.delete': { input: z.infer<typeof ${n.camel}IdInput>; output: void };
  }
}
`;

/** The search's input: the words, and a page of results at a time, as the list takes them. */
const searchContract = (n: Names) => `
/**
 * Words to find (every one must be in the text; the last may be the start of a word) and a page of
 * the results. \`cursor\` is the \`nextCursor\` of the page before, with the same \`limit\`.
 */
export const search${n.pluralPascal}Input = z.object({
  q: z.string().trim().min(1).max(200),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  cursor: z.string().regex(/^[1-9][0-9]{0,5}$/, 'the nextCursor of the page before').optional(),
});
`;

const repository = (n: Names) => `import { DrizzleRepository, type DrizzleDb } from '@mariachi/database-postgres';
import { ${n.pluralCamel}Table, type ${n.pascal} } from '../../schema/${n.pluralKebab}';

export class ${n.pluralPascal}Repository extends DrizzleRepository<${n.pascal}> {
  constructor(db: DrizzleDb) {
    super(${n.pluralCamel}Table, db);
  }
}
`;

const service = (n: Names, fields: readonly EntityField[], search: boolean) => {
  const createData = obj(props(fields, (f) => `input.${f.key}`), search ? '      ' : '    ');
  const one = n.camel;
  const index = `${n.pluralCamel}Index.name`;
  const create = search
    ? `  create(ctx: Context, input: Create${n.pascal}Input): Promise<${n.pascal}> {
    return withTransaction(this.db, ctx, async () => {
      const ${one} = await this.${n.pluralCamel}.create(ctx, ${createData});
      await this.search.indexDocument(ctx, ${index}, ${one}Document(${one}));
      return ${one};
    });
  }`
    : `  create(ctx: Context, input: Create${n.pascal}Input): Promise<${n.pascal}> {
    return this.${n.pluralCamel}.create(ctx, ${createData});
  }`;
  const find = `

  /**
   * The ${n.pluralKebab.replace(/-/g, ' ')} whose text has every word of \`q\` (the last may be the start of a word), most
   * relevant first. The index finds them and the table answers, so each is the row as it is now.
   * The cursor is the next page's number.
   */
  async find(ctx: Context, input: Search${n.pluralPascal}Input): Promise<CursorPaginatedResult<${n.pascal}>> {
    const page = input.cursor ? Number(input.cursor) : 1;
    const found = await this.search.search<{ id: string }>(ctx, ${index}, { query: input.q, page, pageSize: input.limit });
    const ids = found.hits.map((hit) => hit.document.id);
    const rows = await this.${n.pluralCamel}.findMany(ctx, [{ field: 'id', op: 'in', value: ids }]);
    const byId = new Map(rows.map((row) => [row.id, row]));
    const hasMore = page * input.limit < found.total;
    return { data: ids.flatMap((id) => byId.get(id) ?? []), nextCursor: hasMore ? String(page + 1) : null, hasMore };
  }`;
  const update = search
    ? `  update(ctx: Context, input: Update${n.pascal}Input): Promise<${n.pascal}> {
    const { id, ...patch } = input;
    return withTransaction(this.db, ctx, async () => {
      const ${one} = await this.${n.pluralCamel}.update(ctx, id, patch);
      await this.search.indexDocument(ctx, ${index}, ${one}Document(${one}));
      return ${one};
    });
  }`
    : `  update(ctx: Context, input: Update${n.pascal}Input): Promise<${n.pascal}> {
    const { id, ...patch } = input;
    return this.${n.pluralCamel}.update(ctx, id, patch);
  }`;
  const remove = search
    ? `  async remove(ctx: Context, id: string): Promise<void> {
    await withTransaction(this.db, ctx, async () => {
      await this.${n.pluralCamel}.softDelete(ctx, id);
      await this.search.removeDocument(ctx, ${index}, id);
    });
  }`
    : `  async remove(ctx: Context, id: string): Promise<void> {
    await this.${n.pluralCamel}.softDelete(ctx, id);
  }`;
  const imports = search
    ? `import type { Context, CursorPaginatedResult } from '@mariachi/core';
import { withTransaction, type DrizzleDb } from '@mariachi/database-postgres';
import type { Search } from '@mariachi/search';
import type { Create${n.pascal}Input, List${n.pluralPascal}Input, Search${n.pluralPascal}Input, Update${n.pascal}Input } from '../../contracts/${n.pluralKebab}';
import type { ${n.pascal} } from '../../schema/${n.pluralKebab}';
import { ${n.camel}Document, ${n.pluralCamel}Index } from '../../search/${n.pluralKebab}';
import type { ${n.pluralPascal}Repository } from './${n.pluralKebab}.repository';

/**
 * ${n.pluralPascal}, kept in a search index (src/search/${n.pluralKebab}.ts) as they change: each write updates the
 * index in the same transaction, so the index can't disagree with the table. Search runs in the app's
 * Postgres and is tenant-scoped: every call reads and writes only ctx.tenantId's documents.
 */
export class ${n.pluralPascal}Service {
  constructor(
    private readonly ${n.pluralCamel}: ${n.pluralPascal}Repository,
    private readonly search: Search,
    private readonly db: DrizzleDb,
  ) {}`
    : `import type { Context, CursorPaginatedResult } from '@mariachi/core';
import type { Create${n.pascal}Input, List${n.pluralPascal}Input, Update${n.pascal}Input } from '../../contracts/${n.pluralKebab}';
import type { ${n.pascal} } from '../../schema/${n.pluralKebab}';
import type { ${n.pluralPascal}Repository } from './${n.pluralKebab}.repository';

export class ${n.pluralPascal}Service {
  constructor(private readonly ${n.pluralCamel}: ${n.pluralPascal}Repository) {}`;
  return `${imports}

${create}

  get(ctx: Context, id: string): Promise<${n.pascal}> {
    return this.${n.pluralCamel}.getById(ctx, id);
  }

  list(ctx: Context, input: List${n.pluralPascal}Input): Promise<CursorPaginatedResult<${n.pascal}>> {
    return this.${n.pluralCamel}.paginateCursor(ctx, { limit: input.limit, cursor: input.cursor });
  }${search ? find : ''}

${update}

${remove}
  // ${MARKERS.procedures}
}
`;
};

const handler = (n: Names, search: boolean) => `import type { CommunicationLayer } from '@mariachi/communication';
import { z } from 'zod';
import {
  ${n.camel}IdInput,
  ${n.camel}ListSchema,
  ${n.camel}Schema,
  create${n.pascal}Input,
  list${n.pluralPascal}Input,
${search ? `  search${n.pluralPascal}Input,\n` : ''}  update${n.pascal}Input,
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
${search
  ? `  communication.register('${n.pluralCamel}.search', {
    schema: { input: search${n.pluralPascal}Input, output: ${n.camel}ListSchema },
    handler: (ctx, input) => service.find(ctx, input),
  });
`
  : ''}  communication.register('${n.pluralCamel}.update', {
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

const serviceTest = (n: Names, fields: readonly EntityField[], search: boolean) => {
  const first = fields[0];
  const values = props(fields, (f) => kind(f).values[0]);
  const created = obj(values, '    ');
  const renamed = `${first.key}: ${kind(first).values[1]}`;
  const shape = fields.map((f) => `${f.key}${f.optional ? '?' : ''}: ${kind(f).ts}${f.optional ? ' | null' : ''}`).join('; ');
  if (search) return searchServiceTest(n, fields, { values, created, renamed, shape });
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

/** The service test of an entity kept in a search index: the index follows every write, and a search answers from the table. */
const searchServiceTest = (n: Names, fields: readonly EntityField[], t: { values: string[]; created: string; renamed: string; shape: string }) => {
  const first = fields[0];
  const text = searchableFields(fields);
  const doc = (renamed: boolean) =>
    obj(["id: 'id-1'", ...text.map((f) => `${f.key}: ${renamed && f === first ? kind(f).values[1] : kind(f).values[0]}`)], '    ');
  const index = `'${n.pluralSnake}'`;
  return `import { describe, expect, it, vi } from 'vitest';
import { createContext, type Logger } from '@mariachi/core';
import type { DrizzleDb } from '@mariachi/database-postgres';
import type { Search } from '@mariachi/search';
import type { ${n.pluralPascal}Repository } from './${n.pluralKebab}.repository';
import { ${n.pluralPascal}Service } from './${n.pluralKebab}.service';

const logger = { debug() {}, info() {}, warn() {}, error() {}, child: () => logger } as unknown as Logger;
const ctx = createContext({ logger, tenantId: 'tenant-1', userId: 'user-1' });
const row = ${obj(["id: 'id-1'", "tenantId: 'tenant-1'", ...t.values], '')};

function setup() {
  const repo = {
    create: vi.fn(async (_ctx: unknown, data: { ${t.shape} }) => ({ id: 'id-1', tenantId: 'tenant-1', ...data })),
    update: vi.fn(async (_ctx: unknown, id: string, data: object) => ({ ...row, id, ...data })),
    softDelete: vi.fn(async () => undefined),
    findMany: vi.fn(async (): Promise<Array<{ id: string }>> => []),
  };
  const search = {
    indexDocument: vi.fn(async () => undefined),
    removeDocument: vi.fn(async () => undefined),
    search: vi.fn(async () => ({ hits: [] as Array<{ document: { id: string }; score: number }>, total: 0, page: 1, pageSize: 20, queryTimeMs: 0 })),
  };
  // Runs the work as a transaction would; the end-to-end tests run it in Postgres
  const db = { transaction: (work: (tx: unknown) => Promise<unknown>) => work({}) };
  const service = new ${n.pluralPascal}Service(repo as unknown as ${n.pluralPascal}Repository, search as unknown as Search, db as unknown as DrizzleDb);
  return { repo, search, service };
}

const hits = (...ids: string[]) => ids.map((id) => ({ document: { id }, score: 1 }));

describe('${n.pluralPascal}Service', () => {
  it('creates within the caller context, and indexes what it created', async () => {
    const { repo, search, service } = setup();
    const created = await service.create(ctx, ${t.created});
    expect(created).toMatchObject(${obj(["id: 'id-1'", ...t.values], '    ')});
    expect(repo.create).toHaveBeenCalledWith(ctx, ${t.created});
    expect(search.indexDocument).toHaveBeenCalledWith(ctx, ${index}, ${doc(false)});
  });

  it('updates only the provided fields, and indexes the row as it now is', async () => {
    const { repo, search, service } = setup();
    await service.update(ctx, { id: 'id-1', ${t.renamed} });
    expect(repo.update).toHaveBeenCalledWith(ctx, 'id-1', { ${t.renamed} });
    expect(search.indexDocument).toHaveBeenCalledWith(ctx, ${index}, ${doc(true)});
  });

  it('soft deletes, and removes it from the index', async () => {
    const { repo, search, service } = setup();
    await service.remove(ctx, 'id-1');
    expect(repo.softDelete).toHaveBeenCalledWith(ctx, 'id-1');
    expect(search.removeDocument).toHaveBeenCalledWith(ctx, ${index}, 'id-1');
  });

  it('fails the write when the index cannot be updated: in Postgres the transaction then rolls back', async () => {
    const { search, service } = setup();
    search.indexDocument.mockRejectedValueOnce(new Error('search is down'));
    await expect(service.create(ctx, ${t.created})).rejects.toThrow('search is down');
  });

  it('finds through the index and answers from the table, in the order the index ranks them', async () => {
    const { repo, search, service } = setup();
    search.search.mockResolvedValueOnce({ hits: hits('id-2', 'id-1'), total: 3, page: 1, pageSize: 2, queryTimeMs: 1 });
    repo.findMany.mockResolvedValueOnce([{ id: 'id-1' }, { id: 'id-2' }]);
    const page = await service.find(ctx, { q: 'wool', limit: 2 });
    expect(search.search).toHaveBeenCalledWith(ctx, ${index}, { query: 'wool', page: 1, pageSize: 2 });
    expect(repo.findMany).toHaveBeenCalledWith(ctx, [{ field: 'id', op: 'in', value: ['id-2', 'id-1'] }]);
    expect(page).toEqual({ data: [{ id: 'id-2' }, { id: 'id-1' }], nextCursor: '2', hasMore: true });
  });

  it('reads the page its cursor names, stops after the last, and leaves out a hit whose row is gone', async () => {
    const { repo, search, service } = setup();
    search.search.mockResolvedValueOnce({ hits: hits('id-3'), total: 3, page: 2, pageSize: 2, queryTimeMs: 1 });
    const page = await service.find(ctx, { q: 'wool', limit: 2, cursor: '2' });
    expect(search.search).toHaveBeenCalledWith(ctx, ${index}, { query: 'wool', page: 2, pageSize: 2 });
    expect(page).toEqual({ data: [], nextCursor: null, hasMore: false });
  });
});
`;
};

const controller = (n: Names, search: boolean) => `import { BaseController } from '@mariachi/api-facade';
import {
  ${n.camel}IdInput,
  ${n.camel}ListSchema,
  ${n.camel}Schema,
  create${n.pascal}Input,
  list${n.pluralPascal}Input,
${search ? `  search${n.pluralPascal}Input,\n` : ''}  update${n.pascal}Body,
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
${search
  ? `    this.get(
      '/search',
      { schema: { query: search${n.pluralPascal}Input, response: ${n.camel}ListSchema }, summary: 'Search ${n.pluralKebab.replace(/-/g, ' ')}' },
      (ctx, _body, _params, query) => this.call<${n.pascal}List>(ctx, '${n.pluralCamel}.search', query),
    );
`
  : ''}    this.get('/:id', { schema: { params: ${n.camel}IdInput, response: ${n.camel}Schema } }, (ctx, _body, params) =>
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

const e2eTest = (n: Names, fields: readonly EntityField[], search: boolean) => {
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
${search ? searchE2e(n, fields) : ''}`;
};

/** End-to-end tests of an entity kept in a search index: over HTTP, against the app's Postgres. */
const searchE2e = (n: Names, fields: readonly EntityField[]) => {
  const key = searchableFields(fields)[0].key;
  const json = (text: string) => obj(props(fields, (f) => (f.key === key ? `'${text}'` : kind(f).jsonValues[0])), '    ');
  const what = n.pluralKebab.replace(/-/g, ' ');
  return `
describe('${what} search over HTTP', () => {
  type Page = { data: Array<{ id: string; ${key}: string }>; nextCursor: string | null; hasMore: boolean };
  const create = async (as: typeof ada, body: object) => ((await (await running.request(path, { as, json: body })).json()) as { id: string }).id;
  const search = (as: typeof ada, q: string, more = '') => running.request(\`\${path}/search?q=\${encodeURIComponent(q)}\${more}\`, { as });
  const found = async (as: typeof ada, q: string, more = '') => (await (await search(as, q, more)).json()) as Page;
  const ids = async (as: typeof ada, q: string) => (await found(as, q)).data.map((row) => row.id);

  it('finds by whole words and the start of the last one, and follows updates and deletes', async () => {
    const id = await create(ada, ${json('Wool hat for winter')});
    expect(await ids(ada, 'wool wint')).toEqual([id]);
    expect((await found(ada, 'WINTER')).data).toMatchObject([{ id, ${key}: 'Wool hat for winter' }]);
    expect(await ids(ada, 'wool linen')).toEqual([]);

    await running.request(\`\${path}/\${id}\`, { as: ada, method: 'PATCH', json: { ${key}: 'Linen shirt' } });
    expect(await ids(ada, 'wool')).toEqual([]);
    expect(await ids(ada, 'linen')).toEqual([id]);

    expect((await running.request(\`\${path}/\${id}\`, { as: ada, method: 'DELETE' })).status).toBe(204);
    expect(await ids(ada, 'linen')).toEqual([]);
  });

  it("finds only the caller's tenant's ${what}", async () => {
    const mine = await create(ada, ${json('Harbour lights')});
    const theirs = await create(lin, ${json('Harbour lights')});
    expect(await ids(ada, 'harbour')).toEqual([mine]);
    expect(await ids(lin, 'harbour')).toEqual([theirs]);
    // Their delete takes theirs out of their results, and leaves mine
    await running.request(\`\${path}/\${theirs}\`, { as: lin, method: 'DELETE' });
    expect(await ids(lin, 'harbour')).toEqual([]);
    expect(await ids(ada, 'harbour')).toEqual([mine]);
  });

  it('pages through the results as the list does', async () => {
    const made = [
      await create(ada, ${json('Lantern one')}),
      await create(ada, ${json('Lantern two')}),
      await create(ada, ${json('Lantern three')}),
    ];
    const first = await found(ada, 'lantern', '&limit=2');
    expect(first).toMatchObject({ hasMore: true, nextCursor: expect.any(String) });
    expect(first.data).toHaveLength(2);
    const second = await found(ada, 'lantern', \`&limit=2&cursor=\${first.nextCursor}\`);
    expect(second).toMatchObject({ hasMore: false, nextCursor: null });
    expect([...first.data, ...second.data].map((row) => row.id).sort()).toEqual([...made].sort());
  });

  it('refuses a search with no words, and asks for a token', async () => {
    expect((await search(ada, '  ')).status).toBe(400);
    expect((await running.request(\`\${path}/search?q=wool\`)).status).toBe(401);
  });
});
`;
};
