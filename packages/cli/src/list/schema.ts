/**
 * A Zod schema as one line of TypeScript-like text: `{ name: string, limit?: int }`.
 *
 * The schemas come from the project's own copy of Zod (loaded with jiti), so they are read by their
 * definition (`_def.typeName`), never with `instanceof` against the CLI's copy. Zod 4 schemas
 * (`_zod.def.type`) are read too. Anything not recognised is named by its type, never guessed.
 */

/** How deep objects are spelled out; deeper ones are `{…}`. */
const MAX_DEPTH = 3;

interface Def {
  typeName?: string;
  type?: string;
  [key: string]: unknown;
}

function defOf(schema: unknown): Def | undefined {
  if (!schema || (typeof schema !== 'object' && typeof schema !== 'function')) return undefined;
  const s = schema as { _def?: Def; _zod?: { def?: Def } };
  return s._zod?.def ?? s._def;
}

/** True for anything that looks like a Zod schema. */
export function isSchema(value: unknown): boolean {
  const def = defOf(value);
  return Boolean(def && (typeof def.typeName === 'string' || typeof def.type === 'string'));
}

/** `ZodString` (Zod 3) and `string` (Zod 4) are both `string`. */
function kindOf(def: Def): string {
  if (typeof def.typeName === 'string') return def.typeName.replace(/^Zod/, '').replace(/^./, (c) => c.toLowerCase());
  return String(def.type);
}

/** Zod 3 keeps some inner schemas in `type`, where Zod 4 keeps the kind's name. */
function nested(value: unknown): unknown {
  return typeof value === 'string' ? undefined : value;
}

function shapeOf(def: Def): Record<string, unknown> {
  const shape = def.shape;
  return (typeof shape === 'function' ? (shape as () => Record<string, unknown>)() : (shape as Record<string, unknown>)) ?? {};
}

/** Whether a key holding this schema may be left out of the input. */
function isOptional(schema: unknown): boolean {
  const def = defOf(schema);
  if (!def) return false;
  const kind = kindOf(def);
  if (kind === 'optional' || kind === 'default' || kind === 'catch') return true;
  if (kind === 'effects' || kind === 'branded' || kind === 'readonly') return isOptional(def.innerType ?? def.schema ?? nested(def.type));
  if (kind === 'pipeline' || kind === 'pipe') return isOptional(def.in);
  return false;
}

function quoted(value: unknown): string {
  return typeof value === 'string' ? `'${value}'` : String(value);
}

/** The text for a string or number schema: `string`, `uuid`, `email`, `int`. */
function refined(kind: 'string' | 'number', def: Def): string {
  const checks = Array.isArray(def.checks) ? (def.checks as Array<{ kind?: string; format?: string; isInt?: boolean; _zod?: { def?: { format?: string; check?: string } } }>) : [];
  for (const check of checks) {
    const format = check.kind ?? check.format ?? check._zod?.def?.format;
    if (kind === 'string' && format && ['uuid', 'email', 'url', 'datetime', 'date', 'ulid', 'cuid', 'cuid2'].includes(format)) return format;
    if (kind === 'number' && (format === 'int' || format === 'safeint')) return 'int';
  }
  return kind;
}

function describe(schema: unknown, depth: number): string {
  const def = defOf(schema);
  if (!def) return 'unknown';
  const kind = kindOf(def);
  switch (kind) {
    case 'string':
      return refined('string', def);
    case 'number':
      return refined('number', def);
    case 'int':
      return 'int';
    case 'boolean':
    case 'bigint':
    case 'date':
    case 'symbol':
    case 'undefined':
    case 'null':
    case 'void':
    case 'any':
    case 'unknown':
    case 'never':
    case 'nan':
      return kind;
    case 'literal': {
      const values = Array.isArray(def.values) ? def.values : [def.value];
      return values.map(quoted).join(' | ');
    }
    case 'enum': {
      const values = Array.isArray(def.values) ? def.values : Object.values((def.entries as Record<string, unknown>) ?? {});
      return values.map(quoted).join(' | ');
    }
    case 'nativeEnum':
      return Object.values((def.values as Record<string, unknown>) ?? {})
        .filter((v) => typeof v === 'string')
        .map(quoted)
        .join(' | ');
    case 'object': {
      if (depth >= MAX_DEPTH) return '{…}';
      const fields = Object.entries(shapeOf(def)).map(([key, value]) => `${key}${isOptional(value) ? '?' : ''}: ${describe(value, depth + 1)}`);
      return fields.length ? `{ ${fields.join(', ')} }` : '{}';
    }
    case 'array':
      return `${wrap(describe(def.element ?? def.type, depth))}[]`;
    case 'set':
      return `Set<${describe(def.valueType, depth)}>`;
    case 'record':
      return `Record<${describe(def.keyType, depth)}, ${describe(def.valueType, depth)}>`;
    case 'map':
      return `Map<${describe(def.keyType, depth)}, ${describe(def.valueType, depth)}>`;
    case 'tuple':
      return `[${((def.items as unknown[]) ?? []).map((item) => describe(item, depth)).join(', ')}]`;
    case 'union':
    case 'discriminatedUnion': {
      const options = (Array.isArray(def.options) ? def.options : [...((def.options as Map<unknown, unknown>)?.values?.() ?? [])]) as unknown[];
      return options.map((option) => describe(option, depth)).join(' | ');
    }
    case 'intersection':
      return `${describe(def.left, depth)} & ${describe(def.right, depth)}`;
    case 'optional':
    case 'default':
    case 'catch':
    case 'readonly':
    case 'nonoptional':
      return describe(def.innerType, depth);
    case 'nullable':
      return `${describe(def.innerType, depth)} | null`;
    case 'effects':
      return describe(def.schema, depth);
    case 'branded':
      return describe(def.type, depth);
    case 'pipeline':
    case 'pipe':
      return describe(def.in, depth);
    case 'lazy':
      return 'lazy';
    case 'promise':
      return `Promise<${describe(def.innerType ?? def.type, depth)}>`;
    default:
      return kind;
  }
}

/** A union inside an array needs brackets: `(string | number)[]`. */
function wrap(text: string): string {
  return text.includes(' | ') || text.includes(' & ') ? `(${text})` : text;
}

/** One line for a schema, or undefined when there is none. */
export function describeSchema(schema: unknown): string | undefined {
  if (schema === undefined || schema === null) return undefined;
  return describe(schema, 0);
}
