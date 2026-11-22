import { ValidationError } from '@mariachi/core';

/**
 * SOQL that is safe to send: the text of a query whose every value was escaped by `soql`. The client's query
 * operations take only this, so a query can't be built by pasting input into a string.
 */
declare const SOQL: unique symbol;

export interface SoqlQuery {
  readonly soql: string;
  readonly [SOQL]: true;
}

/** What a value in a query can be. A `Date` is a dateTime (`2026-11-21T10:00:00Z`); an array is a list for `IN`. */
export type SoqlValue = string | number | boolean | null | Date | SoqlLike | readonly (string | number | boolean | Date)[];

/**
 * Writes a SOQL query, escaping each interpolated value as a literal: strings are quoted with `\` before `'`, `"`
 * and `\` and with newlines, tabs and the like written as escapes; numbers, booleans, `null`, dates and lists as
 * SOQL writes them. Field and object names can't be interpolated: write them in the query's text.
 *
 * ```ts
 * const q = soql`SELECT Id FROM Contact WHERE Email = ${email} LIMIT 1`;
 * const page = await salesforce.soql.query(ctx, q);
 * ```
 *
 * In a `LIKE`, wrap the value in `soqlLike` so a `%` or `_` in it is matched literally.
 */
export function soql(strings: TemplateStringsArray, ...values: SoqlValue[]): SoqlQuery {
  let text = strings[0] ?? '';
  values.forEach((value, i) => {
    text += soqlLiteral(value) + (strings[i + 1] ?? '');
  });
  const query = Object.freeze({ soql: text }) as SoqlQuery;
  issued.add(query);
  return query;
}

// The queries `soql` wrote: the client refuses anything else, even an object of the same shape.
const issued = new WeakSet<object>();

/** Whether `value` is a query `soql` wrote. */
export function isSoqlQuery(value: unknown): value is SoqlQuery {
  return typeof value === 'object' && value !== null && issued.has(value);
}

/** One value as a SOQL literal. `soql` uses it for every interpolation. */
export function soqlLiteral(value: SoqlValue): string {
  if (value instanceof SoqlLike) return `'${escapeString(value.value).replace(/_/g, '\\_').replace(/%/g, '\\%')}${value.wildcard ? '%' : ''}'`;
  if (value === null) return 'null';
  if (typeof value === 'string') return `'${escapeString(value)}'`;
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new ValidationError('A SOQL number must be finite');
    return String(value);
  }
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) throw new ValidationError('A SOQL date must be a valid date');
    return value.toISOString().replace(/\.\d{3}Z$/, 'Z');
  }
  if (Array.isArray(value)) {
    if (value.length === 0) throw new ValidationError('A SOQL IN list needs at least one value');
    return `(${value.map((v) => soqlLiteral(v)).join(', ')})`;
  }
  throw new ValidationError('A SOQL value must be a string, number, boolean, null, Date or a list of them');
}

/** A `LIKE` pattern from `soqlLike`. */
export class SoqlLike {
  constructor(
    readonly value: string,
    readonly wildcard: boolean,
  ) {}
}

/**
 * A value for `LIKE` that matches itself literally, `%` and `_` included, followed by `%` when `startsWith` is
 * true: `soql\`SELECT Id FROM Account WHERE Name LIKE ${soqlLike(prefix, { startsWith: true })}\``.
 */
export function soqlLike(value: string, options: { startsWith?: boolean } = {}): SoqlLike {
  return new SoqlLike(value, options.startsWith ?? false);
}

// SOQL's quoted-string escapes: \n \r \t \b \f \" \' \\
function escapeString(value: string): string {
  return value.replace(/[\\'"\n\r\t\b\f]/g, (c) => ESCAPES[c] ?? c);
}

const ESCAPES: Record<string, string> = { '\\': '\\\\', "'": "\\'", '"': '\\"', '\n': '\\n', '\r': '\\r', '\t': '\\t', '\b': '\\b', '\f': '\\f' };
