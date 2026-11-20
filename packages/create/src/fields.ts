import { ValidationError } from '@mariachi/core';

/** The column types `generate entity --field` takes. */
export const FIELD_TYPES = ['string', 'text', 'integer', 'number', 'boolean', 'timestamp', 'date', 'uuid'] as const;
export type FieldType = (typeof FIELD_TYPES)[number];

export interface EntityField {
  /** camelCase key: the column becomes its snake_case form. */
  key: string;
  type: FieldType;
  /** Nullable column, optional on create. */
  optional: boolean;
}

/** What an entity has when no `--field` is given. */
export const DEFAULT_FIELDS: readonly EntityField[] = [{ key: 'name', type: 'string', optional: false }];

/** Columns every entity table already has. */
const RESERVED = new Set(['id', 'tenantId', 'createdAt', 'updatedAt', 'deletedAt']);

const KEY = /^[a-zA-Z][a-zA-Z0-9]*(?:[-_][a-zA-Z0-9]+)*$/;

const invalid = (spec: string, message: string) => new ValidationError(`Invalid field "${spec}": ${message}`, [{ path: ['field'], message }]);

function camel(input: string): string {
  const [first, ...rest] = input.split(/[-_]/);
  return first.charAt(0).toLowerCase() + first.slice(1) + rest.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
}

/**
 * Reads `--field` specs: `title:string`, `dueAt:timestamp?` or `dueAt:timestamp:optional` (the
 * shell-safe spelling) for a nullable column. The type defaults to string (`title`).
 */
export function parseFields(specs: readonly string[] | undefined): EntityField[] {
  if (!specs || specs.length === 0) return DEFAULT_FIELDS.map((f) => ({ ...f }));
  const fields: EntityField[] = [];
  for (const spec of specs) {
    const [name, rawType = 'string', modifier, ...extra] = spec.trim().split(':');
    let type = rawType;
    let optional = false;
    if (type.endsWith('?')) {
      type = type.slice(0, -1);
      optional = true;
    }
    if (modifier !== undefined) {
      if (modifier !== 'optional' || extra.length > 0) throw invalid(spec, 'write it name:type, name:type? or name:type:optional');
      optional = true;
    }
    if (!name || !KEY.test(name)) throw invalid(spec, 'the name takes letters, digits, dashes and underscores, starting with a letter');
    if (!(FIELD_TYPES as readonly string[]).includes(type)) throw invalid(spec, `the type is one of ${FIELD_TYPES.join(', ')}`);
    const key = camel(name);
    if (RESERVED.has(key)) throw invalid(spec, `every entity has ${[...RESERVED].join(', ')} already`);
    if (fields.some((f) => f.key === key)) throw invalid(spec, `${key} is given twice`);
    fields.push({ key, type: type as FieldType, optional });
  }
  return fields;
}
