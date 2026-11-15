import { inspect } from 'node:util';
import type { z } from 'zod';
import { REDACT } from '@mariachi/core';

/** What a secret shows as when the config is logged or serialised. */
export const REDACTED = '[REDACTED]';

type Kind = 'secret' | 'url';
const marked = new WeakMap<z.ZodTypeAny, Kind>();

/**
 * Marks a schema field as a secret. The value is unchanged where code reads it
 * (`config.auth.jwtSecret`), and shows as `[REDACTED]` when the config is logged, printed or
 * turned into JSON. Use it in a package's own config section too:
 *
 * ```ts
 * registerConfigSection('payments', { schema: z.object({ apiKey: secret(z.string()) }) });
 * ```
 */
export function secret<T extends z.ZodTypeAny>(schema: T): T {
  marked.set(schema, 'secret');
  return schema;
}

/** Marks a URL that may carry a password (`postgres://user:pass@host/db`): only the password is hidden. */
export function secretUrl<T extends z.ZodTypeAny>(schema: T): T {
  marked.set(schema, 'url');
  return schema;
}

type Def = { innerType?: z.ZodTypeAny; schema?: z.ZodTypeAny; shape?: () => Record<string, z.ZodTypeAny>; typeName?: string };

/** The mark on a schema or on anything it wraps (`.optional()`, `.default()`, `.nullable()`, `.refine()`). */
function kindOf(schema: z.ZodTypeAny | undefined): Kind | undefined {
  for (let s = schema; s; s = (s._def as Def).innerType ?? (s._def as Def).schema) {
    const kind = marked.get(s);
    if (kind) return kind;
  }
  return undefined;
}

/** The object shape a schema describes, through its wrappers; undefined for anything that isn't an object. */
function shapeOf(schema: z.ZodTypeAny | undefined): Record<string, z.ZodTypeAny> | undefined {
  for (let s = schema; s; s = (s._def as Def).innerType ?? (s._def as Def).schema) {
    const def = s._def as Def;
    if (def.typeName === 'ZodObject' && def.shape) return def.shape();
  }
  return undefined;
}

function hideUrlPassword(value: string): string {
  try {
    const url = new URL(value);
    if (!url.password) return value;
    url.password = '***';
    return url.toString();
  } catch {
    // Not a URL the parser accepts: hide all of it sooner than show a password
    return /:[^@/\s]+@/.test(value) ? REDACTED : value;
  }
}

const isObject = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);

/**
 * Walks a parsed config beside its schema and, on every object that directly holds a marked field,
 * adds non-enumerable hooks (`toJSON`, `util.inspect`, and core's `REDACT`) that show the secret as `[REDACTED]`.
 * Reading the field still gives the value. Nested objects carry their own hooks, so
 * `JSON.stringify(config)`, `console.log(config.auth)` and a logger given `{ config }` are all safe.
 * A copy made with spread or `structuredClone` is a plain object again and is not protected.
 */
export function protectSecrets<T>(value: T, schema: z.ZodTypeAny | undefined): T {
  const shape = shapeOf(schema);
  if (!isObject(value) || !shape) return value;
  const hidden = new Map<string, Kind>();
  for (const [key, field] of Object.entries(shape)) {
    const kind = kindOf(field);
    if (kind) hidden.set(key, kind);
    else protectSecrets(value[key], field);
  }
  if (!hidden.size) return value;
  const shown = (): Record<string, unknown> => {
    const copy: Record<string, unknown> = { ...value };
    for (const [key, kind] of hidden) {
      const actual = copy[key];
      if (actual === undefined || actual === null || actual === '') continue;
      copy[key] = kind === 'url' && typeof actual === 'string' ? hideUrlPassword(actual) : REDACTED;
    }
    return copy;
  };
  Object.defineProperty(value, 'toJSON', { value: shown, enumerable: false, configurable: true, writable: true });
  // What the framework's loggers ask for: a logger may copy an object before writing it, and the copy has no `toJSON`
  Object.defineProperty(value, REDACT, { value: shown, enumerable: false, configurable: true, writable: true });
  Object.defineProperty(value, inspect.custom, {
    value: (_depth: number, options: object, inspectFn: typeof inspect = inspect) => inspectFn(shown(), options),
    enumerable: false,
    configurable: true,
    writable: true,
  });
  return value;
}
